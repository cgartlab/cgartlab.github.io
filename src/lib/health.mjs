/**
 * health.mjs — 站点可用性监控（cron `*\/5 * * * *`）
 *
 * 职责：
 * 1. 探活两项外部依赖：授权 API 的 `/v1/health`、站点自身的 FUI 版本清单 JSON
 * 2. 结果写入 KV（TG_STATE）的 `health:status`，供 `GET /api/health-watch` 读取
 * 3. 连续失败达到阈值时向运维频道发一条告警（同一故障 30 分钟只发一次）
 *
 * 设计约束：
 * - 探活本身绝不抛错：任何异常都收敛成 `ok:false`，避免拖垮 Worker 的其他请求
 * - 两项检查并发执行，各 10s 超时（AbortSignal.timeout）
 * - 告警频道只认 `TG_ALERT_CHAT_ID`：未配置时只 console.warn，
 *   **绝不回落到博客推送频道 `TG_CHANNEL_ID`**，否则运维告警会发进读者频道
 */

const API_HEALTH_URL = "https://api.cgartlab.com/v1/health";
const MANIFEST_URL = "https://cgartlab.com/downloads/CGArtLab-FUI-Data.json";

const STATE_KEY = "health:status";
const LAST_ALERT_KEY = "health:lastAlertAt";

const PROBE_TIMEOUT = 10_000; // 单次探活超时（需求：各 10s）
const ALERT_MIN_FAILS = 2; // 连续失败多少次才告警
const ALERT_COOLDOWN_MS = 30 * 60 * 1_000; // 同一故障 30 分钟内只发一次
const KV_CACHE_TTL = 60; // KV 读取缓存下限（Cloudflare 允许的最小值）
const ERROR_TRUNCATE_LEN = 160;

/** 北京时间的可读时间戳（告警文案用；KV 里存 ISO UTC） */
function beijingTime(date = new Date()) {
	return new Intl.DateTimeFormat("zh-CN", {
		timeZone: "Asia/Shanghai",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(date);
}

/**
 * 单次探活：GET 一个 URL，用 `validate` 判定正文是否合格。
 *
 * @param {string} url
 * @param {(status: number, body: unknown) => boolean} validate 状态码 + 正文双重判定
 * @returns {Promise<{ok: boolean, status: number|null, ms: number, error?: string}>}
 *          永不 reject —— 网络错误/超时/解析失败都收敛为 ok:false
 */
async function probe(url, validate) {
	const started = Date.now();
	try {
		const res = await fetch(url, {
			method: "GET",
			headers: { "User-Agent": "cgartlab-health-watch/1.0" },
			signal: AbortSignal.timeout(PROBE_TIMEOUT),
			// 探活尽量不吃缓存，否则故障期间可能仍读到旧的成功响应。
			// 这里只声明标准 fetch 语义（no-store）；若运行时忽略该选项，
			// 最坏情况是清单被 CDN 缓存 5 分钟（其 Cache-Control 为 max-age=300），
			// 属于「告警延迟」而非「误报」，可以接受。
			cache: "no-store",
		});
		let body;
		try {
			body = await res.json();
		} catch {
			body = null;
		}
		const ok = validate(res.status, body);
		const result = {
			ok,
			status: res.status,
			ms: Date.now() - started,
		};
		if (!ok) {
			result.error = body === null
				? "invalid JSON body"
				: `unexpected payload (status ${res.status})`;
		}
		return result;
	} catch (err) {
		// 超时（abort）与 DNS/连接失败都走这里
		return {
			ok: false,
			status: null,
			ms: Date.now() - started,
			error: String(err?.message || err).slice(0, ERROR_TRUNCATE_LEN),
		};
	}
}

/** API 探活判据：200 且正文 `ok === true` */
function validApi(status, body) {
	return status === 200 && body !== null && body.ok === true;
}

/** 清单探活判据：200 且 `version` 字段存在（非空字符串） */
function validManifest(status, body) {
	return (
		status === 200 &&
		body !== null &&
		typeof body === "object" &&
		typeof body.version === "string" &&
		body.version.trim() !== ""
	);
}

/**
 * 读取上次写入的健康状态。
 * @returns {Promise<object|null>} 解析失败或无数据返回 null
 */
export async function readHealthState(env) {
	try {
		const raw = await env.TG_STATE.get(STATE_KEY, { cacheTtl: KV_CACHE_TTL });
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" ? parsed : null;
	} catch (err) {
		console.error("[Health] read state failed:", err);
		return null;
	}
}

/** 组装告警文案：失败项 + 状态码/耗时 + 时间 */
function buildAlertText(state) {
	const lines = [
		`⚠️ cgartlab.com 健康检查连续失败 ${state.consecutiveFail} 次`,
		"",
	];
	if (!state.api.ok) {
		const detail = state.api.status === null
			? state.api.error || "no response"
			: `HTTP ${state.api.status} / ${state.api.ms}ms`;
		lines.push(`· AI 授权 API /v1/health：${detail}`);
	}
	if (!state.dl.ok) {
		const detail = state.dl.status === null
			? state.dl.error || "no response"
			: `HTTP ${state.dl.status} / ${state.dl.ms}ms`;
		lines.push(`· 版本清单 /downloads/CGArtLab-FUI-Data.json：${detail}`);
	}
	lines.push("", `时间：${beijingTime()}（UTC+8）`);
	return lines.join("\n");
}

/**
 * 按连续失败次数决定是否发告警。
 *
 * 冷却用 KV 的 `health:lastAlertAt`（毫秒时间戳）：同一故障 30 分钟内只发一次。
 * 发送失败不写时间戳，让下一次 cron 再试。
 */
async function maybeAlert(env, state) {
	if (state.consecutiveFail < ALERT_MIN_FAILS) return;

	const text = buildAlertText(state);

	// 未配置运维频道 → 只留日志，绝不回落到博客推送频道
	if (!env.TG_ALERT_CHAT_ID || !env.TG_BOT_TOKEN) {
		console.warn(
			`[Health] TG_ALERT_CHAT_ID 未配置，仅记录告警内容：\n${text}`,
		);
		return;
	}

	try {
		const last = Number(
			await env.TG_STATE.get(LAST_ALERT_KEY, { cacheTtl: KV_CACHE_TTL }),
		);
		const now = Date.now();
		if (Number.isFinite(last) && last > 0 && now - last < ALERT_COOLDOWN_MS) {
			console.warn(
				`[Health] alert suppressed (cooldown ${Math.round((ALERT_COOLDOWN_MS - (now - last)) / 1000)}s left)`,
			);
			return;
		}

		const res = await fetch(
			`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					chat_id: env.TG_ALERT_CHAT_ID,
					text,
					disable_web_page_preview: true,
				}),
				signal: AbortSignal.timeout(PROBE_TIMEOUT),
			},
		);
		if (!res.ok) {
			const detail = await res.text();
			console.error(
				`[Health] alert send failed (${res.status}): ${detail.slice(0, ERROR_TRUNCATE_LEN)}`,
			);
			return;
		}
		await env.TG_STATE.put(LAST_ALERT_KEY, String(now));
		console.warn("[Health] alert sent");
	} catch (err) {
		// 告警失败只记日志：健康检查本身的结果已经写进 KV，不能因为通知失败而丢状态
		console.error("[Health] alert failed:", err);
	}
}

/**
 * 执行一次健康检查并落库（cron `*\/5` 调用）。
 *
 * @returns {Promise<object>} 写入 KV 的完整状态对象
 */
export async function checkHealth(env) {
	const previous = await readHealthState(env);
	const previousFail = Number(previous?.consecutiveFail) || 0;

	// 两项并发，各自 10s 超时；probe 内部已 try/catch，这里不会 reject
	const [api, dl] = await Promise.all([
		probe(API_HEALTH_URL, validApi),
		probe(MANIFEST_URL, validManifest),
	]);

	const healthy = api.ok && dl.ok;
	const state = {
		at: new Date().toISOString(),
		api,
		dl,
		consecutiveFail: healthy ? 0 : previousFail + 1,
	};

	try {
		await env.TG_STATE.put(STATE_KEY, JSON.stringify(state));
	} catch (err) {
		// 写 KV 失败不影响告警判断，只是 /api/health-watch 会读到上一次的状态
		console.error("[Health] write state failed:", err);
	}

	if (!healthy) await maybeAlert(env, state);

	return state;
}
