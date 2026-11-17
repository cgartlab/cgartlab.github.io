import { pushNewPosts } from "./lib/tg.mjs";
import { checkHealth, readHealthState } from "./lib/health.mjs";
import { isNoindexPath } from "./lib/noindex.mjs";

/**
 * cron 表达式分工（定义于 `wrangler.jsonc` 的 `triggers.crons`）：
 * - `*\/15 * * * *` → 博客 RSS → Telegram 推送（原有逻辑，勿破坏）
 * - `*\/5  * * * *` → 授权 API + 版本清单可用性监控
 * 两条规则各自独立触发，整点（0/15/30/45 分）会有两次调用，靠 `event.cron` 分流。
 */
const CRON_HEALTH = "*/5 * * * *";

/** 恒时字符串比较：长度不匹配直接返回，等长时逐字符 XOR，避免 timing side-channel */
function timingSafeEqual(a, b) {
	if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length)
		return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++)
		diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

/**
 * 注入安全响应头。
 * - HSTS / X-Content-Type-Options / X-Frame-Options / Referrer-Policy /
 *   Permissions-Policy 直接生效（对静态站零风险）。
 * - CSP 为强制模式（Content-Security-Policy）。站点使用内联脚本/样式
 *   （Astro View Transitions、主题切换、Giscus、partytown），严格
 *   nonce-based CSP 需重构，故维持 'unsafe-inline'；connect-src 必须
 *   覆盖所有运行时 fetch 目标（giscus / GA / Umami / Web3Forms / GitHub API）。
 *
 * ⚠️ 必须**重建** Response，不能就地改 `resp.headers`：`Response.redirect()`
 * 与 `Response.error()` 产出的 headers guard 是 "immutable"，就地 set 会抛
 * `TypeError: immutable`。该异常被 fetch() 最外层 catch 吞成 404 "Not Found"，
 * 表现为 www→apex 301、/feed→rss 301、尾斜杠 301 三条重定向规则同时失效
 * （`https://www.cgartlab.com/` 直接 404）。
 */
function applySecurityHeaders(resp) {
	const headers = new Headers(resp.headers);
	headers.set(
		'Strict-Transport-Security',
		'max-age=63072000; includeSubDomains; preload',
	)
	headers.set('X-Content-Type-Options', 'nosniff')
	headers.set('X-Frame-Options', 'SAMEORIGIN')
	headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
	headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=()',
	)
	headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' https://giscus.app https://*.giscus.app https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://cloud.umami.is https://*.umami.is https://static.cloudflareinsights.com",
			"style-src 'self' 'unsafe-inline' https://giscus.app https://*.giscus.app https://cdn.jsdelivr.net",
			"img-src 'self' https: data:",
			"font-src 'self' https: data:",
			"connect-src 'self' https://giscus.app https://*.giscus.app https://www.google-analytics.com https://analytics.google.com https://cloud.umami.is https://*.umami.is https://api.web3forms.com https://api.github.com",
			"frame-src 'self' https://giscus.app https://*.giscus.app https://player.bilibili.com https://www.youtube.com https://www.youtube-nocookie.com https://open.spotify.com https://codepen.io https://platform.twitter.com",
			"base-uri 'self'",
			"form-action 'self' https://api.web3forms.com https://giscus.app",
		].join('; '),
	)
	// 保留原状态码/状态行与全部既有头（含 Location、Cache-Control、X-Robots-Tag）
	return new Response(resp.body, {
		status: resp.status,
		statusText: resp.statusText,
		headers,
	});
}

/**
 * 404 页面在 `dist/` 中的别名。
 *
 * assets 层（`html_handling: "auto-trailing-slash"`）把 `/404.html` 规范化成
 * 307 → `/404`，Worker 自己的尾斜杠规则（步骤 2）又把 `/404` 301 成 `/404/`，
 * assets 再把 `/404/` 307 回 `/404` —— 三者叠加成死循环，浏览器直接
 * ERR_TOO_MANY_REDIRECTS。故在进 assets 之前统一拦截，直接返回 404 正文。
 */
const NOT_FOUND_ALIASES = new Set(["/404", "/404/", "/404.html"]);

/**
 * 已合并的旧法律页面（2026-11-17）。
 * 《服务条款》《隐私政策》《免责声明》三份文档合并为一份《用户协议》/agreement/，
 * 但旧路径散落在文章、关于页与搜索结果里，全部 301 过去，避免变成 404。
 */
const LEGAL_ALIASES = new Set(["terms", "privacy", "disclaimer"]);

/**
 * 以 404 状态返回 404 页面正文。
 *
 * 同样受上述规范化影响：直接 fetch `/404.html` 拿到的是**空 body 的 307**
 * （还带一个 Location 头）—— 这正是「404 页面全白」与「404 响应里混进
 * Location 头」的成因。故跟随一次同源重定向取回正文，并显式剥掉 Location，
 * 避免 404 响应携带重定向语义。
 */
async function serveNotFound(env, request) {
	const origin = new URL(request.url).origin;
	// 读不到正文时的兜底，保证始终有可读内容而非空白页
	const headers = new Headers({ "Content-Type": "text/plain;charset=UTF-8" });
	let body = "Not Found";

	try {
		let res = await env.ASSETS.fetch(
			new Request(new URL("/404.html", request.url), request),
		);
		const loc = res.headers.get("Location");
		if (res.status >= 300 && res.status < 400 && loc) {
			const next = new URL(loc, origin);
			if (next.origin === origin) {
				res = await env.ASSETS.fetch(
					new Request(new URL(next.pathname, request.url), request),
				);
			}
		}
		if (res.status === 200) {
			body = res.body;
			res.headers.forEach((value, key) => headers.set(key, value));
		}
	} catch (err) {
		console.error("[Worker] 404 页面读取失败:", err);
	}

	headers.delete("Location");
	headers.set("Cache-Control", "public, max-age=60");
	headers.set("X-Robots-Tag", "noindex, follow");
	return applySecurityHeaders(new Response(body, { status: 404, headers }));
}

export default {
	/**
	 * cron 分流：每 5 分钟那条只跑可用性监控，其余（每 15 分钟的博客推送、本地手动触发时
	 * cron 为空）保持原有推送逻辑不动。健康检查包在自己的 try/catch 里，
	 * 任何失败都不会影响推送分支，也不会让整个 scheduled 调用抛错。
	 */
	async scheduled(event, env, ctx) {
		if (event.cron === CRON_HEALTH) {
			ctx.waitUntil(
				checkHealth(env)
					.then((state) => {
						if (state.consecutiveFail > 0) {
							console.warn(
								`[Health] failing ×${state.consecutiveFail} (api=${state.api.status ?? "err"}, dl=${state.dl.status ?? "err"})`,
							);
						} else {
							console.warn(
								`[Health] ok (api=${state.api.ms}ms, dl=${state.dl.ms}ms)`,
							);
						}
					})
					.catch((err) => {
						console.error("[Health] check failed:", err);
					}),
			);
			return;
		}

		ctx.waitUntil(
			pushNewPosts(env)
				.then(({ pushed, skippedPermanent, baseline, skipped }) => {
					if (baseline) console.warn("[TG] baseline set (no push)");
					else if (skipped) console.warn(`[TG] skipped (${skipped})`);
					else if (skippedPermanent)
						console.warn(
							`[TG] pushed ${pushed}, skipped-permanent ${skippedPermanent}`,
						);
					else console.warn(`[TG] pushed ${pushed} post(s)`);
				})
				.catch((err) => {
					console.error("[TG] push failed:", err);
				}),
		);
	},

	async fetch(request, env) {
		try {
			const url = new URL(request.url);
			const pathname = url.pathname;

			// 0. Manual trigger: POST /api/tg-notify with x-tg-secret header
			if (pathname === "/api/tg-notify" && request.method === "POST") {
				if (
					!env.TG_NOTIFY_SECRET ||
					!timingSafeEqual(
						request.headers.get("x-tg-secret") || "",
						env.TG_NOTIFY_SECRET,
					)
				) {
					return applySecurityHeaders(
						new Response("Unauthorized", { status: 401 }),
					);
				}
				try {
					const result = await pushNewPosts(env);
					return applySecurityHeaders(Response.json(result));
				} catch (err) {
					// 推送失败返回 500 而非被外层 catch 吞成 404，便于运维发现
					console.error("[TG] manual push failed:", err);
					return applySecurityHeaders(
						Response.json(
							{ error: String(err.message || err) },
							{ status: 500 },
						),
					);
				}
			}

			// 0b. 只读健康状态：返回 KV 里最近一次 */5 健康检查的结果。
			//     只读不触发检查（探活在 cron 里跑），无数据时返回 pending。
			//     必须 no-store：这是运维视图，缓存会让故障看着像恢复了。
			if (
				(pathname === "/api/health-watch" ||
					pathname === "/api/health-watch/") &&
				request.method === "GET"
			) {
				const state = await readHealthState(env);
				return applySecurityHeaders(
					new Response(
						JSON.stringify(state ?? { ok: true, pending: true }),
						{
							status: 200,
							headers: {
								"Content-Type": "application/json; charset=utf-8",
								"Cache-Control": "no-store",
							},
						},
					),
				);
			}

			// 1. Force www → non-www canonical redirect (301 permanent)
			if (url.hostname === "www.cgartlab.com") {
				url.hostname = "cgartlab.com";
				return applySecurityHeaders(Response.redirect(url.toString(), 301));
			}

			// 1b. Feed shortcut: /feed and /feed/ → RSS feed
			if (pathname === "/feed" || pathname === "/feed/") {
				return applySecurityHeaders(
					Response.redirect("https://cgartlab.com/rss.xml", 301),
				);
			}

			// 1c. the search page is gone — its overlay lives on every page now,
			// so old links land on the homepage with the trigger in reach
			if (pathname === "/search" || pathname === "/search/") {
				return applySecurityHeaders(Response.redirect(new URL("/", url), 301));
			}

			// 1c. 旧列表页路径：/weekly → /column（2026-10 周刊改名专栏，保留旧链接）
			if (
				pathname === "/weekly" ||
				pathname === "/weekly/" ||
				pathname === "/en/weekly" ||
				pathname === "/en/weekly/"
			) {
				const target = pathname.startsWith("/en/")
					? "https://cgartlab.com/en/column/"
					: "https://cgartlab.com/column/";
				return applySecurityHeaders(Response.redirect(target, 301));
			}

			// 1c2. 旧法律页面 → 用户协议（见 LEGAL_ALIASES）。只匹配「语言前缀 + 旧名」
			//      这一层，避免误伤 /posts/privacy/ 之类的真实内容路径。
			{
				const segs = pathname.split("/").filter(Boolean);
				const last = (segs.at(-1) ?? "").toLowerCase();
				if (segs.length <= 2 && LEGAL_ALIASES.has(last)) {
					const prefix = segs.length === 2 ? `/${segs[0]}` : "";
					return applySecurityHeaders(
						Response.redirect(new URL(`${prefix}/agreement/`, url), 301),
					);
				}
			}

			// 1d. 404 页面别名：直接返回 404 正文。
			//     必须早于步骤 2，否则 /404 会被尾斜杠规则改成 /404/ 再与
			//     assets 的规范化互跳，形成死循环。
			if (NOT_FOUND_ALIASES.has(pathname)) {
				return serveNotFound(env, request);
			}


			// 1e. FUI 下载链接统一指向最新稳定版：
			//     历史/未来版本化 zip（0.2.0-beta、0.3.0…）一律 302 到固定文件名，
			//     这样任何已经公开出去的旧链接都不会停留在旧版本。
			if (
				pathname.startsWith("/downloads/CGArtLab-FUI-Data-") &&
				pathname.endsWith(".zip") &&
				pathname !== "/downloads/CGArtLab-FUI-Data-win.zip"
			) {
				const target = new URL(
					"/downloads/CGArtLab-FUI-Data-win.zip",
					url,
				);
				const redirect = Response.redirect(target.toString(), 302);
				const headers = new Headers(redirect.headers);
				headers.set("Cache-Control", "public, max-age=300");
				return applySecurityHeaders(
					new Response(null, { status: 302, headers }),
				);
			}

			// 1f. CORS 预检：CEP 扩展面板从 file:// 读版本清单，会先发 OPTIONS。
			//     只放开版本清单这一个路径，不扩大到其他 /downloads/ 资源。
			if (
				pathname === "/downloads/CGArtLab-FUI-Data.json" &&
				request.method === "OPTIONS"
			) {
				return applySecurityHeaders(
					new Response(null, {
						status: 204,
						headers: {
							"Access-Control-Allow-Origin": "*",
							"Access-Control-Allow-Methods": "GET, OPTIONS",
							"Access-Control-Allow-Headers": "Content-Type",
							"Access-Control-Max-Age": "86400",
							"Cache-Control": "public, max-age=86400",
						},
					}),
				);
			}

			// 2. Trailing slash enforcement: redirect paths without trailing slash (301)
			//    Skip file-like paths (containing a dot in the last segment)
			if (
				!pathname.endsWith("/") &&
				!pathname.split("/").pop()?.includes(".")
			) {
				url.pathname = `${pathname}/`;
				return applySecurityHeaders(Response.redirect(url.toString(), 301));
			}

			// 3. Serve the path directly. Cloudflare Static Assets resolves the
			//    directory index (e.g. `/` → `/index.html`) and returns 200.
			//    Do NOT append `index.html`: ASSETS issues a 307 canonical redirect
			//    (`/index.html` → `/`), which the Worker would return verbatim and
			//    cause an infinite redirect loop on every directory/index page.
			const assetPath = pathname;

			// 4. Try serving the asset from the assets namespace
			const asset = await env.ASSETS.fetch(
				new Request(new URL(assetPath, request.url), request),
			);

			// 5. If asset not found, serve the 404 page
			if (asset.status === 404) {
				return serveNotFound(env, request);
			}

			// 6. Create new response so we can override cache headers
			const response = new Response(asset.body, asset);

			// 6b. CORS: Allow giscus.app iframe to load CSS files
			if (/\.css$/.test(assetPath)) {
				response.headers.set('Access-Control-Allow-Origin', '*');
			}

			// 6c. CORS: CEP 面板（After Effects 扩展，Origin 可能是 null/file://）
			//     读取 FUI 版本清单。只放开这一个路径，别扩大到整个 /downloads/。
			if (assetPath === "/downloads/CGArtLab-FUI-Data.json") {
				response.headers.set('Access-Control-Allow-Origin', '*');
			}

			// 7. Set cache headers based on file type

			// 首页装置的延后片段 → 5 分钟：文件名不带内容哈希，部署后必须在几分钟内
			// 到达访客，否则新旧标记会混在一起；既不能走下面 .svg 的 30 天，
			// 也不必跟 HTML 的 1 小时
			if (assetPath.startsWith("/home/stage/")) {
				response.headers.set(
					"Cache-Control",
					"public, max-age=300, stale-while-revalidate=600",
				);
			}
			// 指纹资源（_astro/ 目录，所有文件均为 Astro 内容哈希命名）→ 1 年 immutable
			else if (assetPath.startsWith("/_astro/")) {
				response.headers.set(
					"Cache-Control",
					"public, max-age=31536000, immutable",
				);
			}
			// 非指纹 CSS/JS（giscus、partytown 等第三方脚本）→ 1 小时，must-revalidate
			else if (/\.(?:css|js|mjs)$/.test(assetPath)) {
				response.headers.set(
					"Cache-Control",
					"public, max-age=3600, must-revalidate",
				);
			}
			// 字体 → 1 年 immutable
			else if (/\.(?:woff2?|ttf|otf|eot)$/.test(assetPath)) {
				response.headers.set(
					"Cache-Control",
					"public, max-age=31536000, immutable",
				);
			}
			// 图片 + 音效 + 视频 → 30 天
			else if (
				/\.(?:png|jpg|jpeg|webp|avif|gif|svg|ico|wav|mp4|webm|mov)$/.test(
					assetPath,
				)
			) {
				response.headers.set(
					"Cache-Control",
					"public, max-age=2592000",
				);
			}
			// 纯文本（robots.txt / llms.txt / 站点验证文件）→ 24 小时
			else if (/\.txt$/.test(assetPath)) {
				response.headers.set(
					"Cache-Control",
					"public, max-age=86400",
				);
			}
			// 搜索索引 JSON → 24 小时，1 小时 stale-while-revalidate（保证新文章尽快可搜索）
			else if (/^\/api\/search-index\/[\w-]+\.json$/.test(assetPath)) {
				response.headers.set(
					"Cache-Control",
					"public, max-age=86400, stale-while-revalidate=3600",
				);
			}

			// 稳定版下载别名与版本清单 → 5 分钟，保证发版后尽快生效
			else if (
				assetPath === "/downloads/CGArtLab-FUI-Data-win.zip" ||
				assetPath === "/downloads/CGArtLab-FUI-Data.json"
			) {
				response.headers.set(
					"Cache-Control",
					"public, max-age=300, must-revalidate",
				);
			}

			// HTML → 浏览器 1h 新鲜 + 10min SWR，边缘 1h 新鲜 + 10min SWR
			// 目录页（/、/en/、/about/ 等）的 assetPath 以 / 结尾，需同时匹配 .html 和 /
			else if (assetPath.endsWith(".html") || assetPath.endsWith("/")) {
				response.headers.set(
					"Cache-Control",
					"public, max-age=3600, stale-while-revalidate=600",
				);
				response.headers.set(
					"Cloudflare-Cdn-Cache-Control",
					"max-age=3600, stale-while-revalidate=600",
				);
				// 列表/工具页 noindex，避免与正文页抢权重（glossary 保持可索引）。
				// 清单来自 src/lib/noindex.mjs 单一声明源，与 astro.config.ts sitemap 排除同步
				if (isNoindexPath(pathname))
					response.headers.set("X-Robots-Tag", "noindex, follow");
			}

			return applySecurityHeaders(response);
		} catch (err) {
			console.error("[Worker] Unhandled error:", err);
			const errResp = new Response("Not Found", {
				status: 404,
				headers: { "Cache-Control": "public, max-age=60" },
			});
			errResp.headers.set("X-Robots-Tag", "noindex, follow");
			return applySecurityHeaders(errResp);
		}
	},
};
