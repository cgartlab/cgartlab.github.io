/**
 * tg.mjs — 博客 RSS → Telegram 频道推送
 *
 * 职责：
 * 1. 抓取站点默认语言的 RSS（通过本地 ASSETS 绑定读取 /rss.xml）
 * 2. 与 KV（TG_STATE）中记录的最后推送 GUID 对比，推送新文章
 * 3. 调用 Telegram Bot API 发送到频道
 *
 * 设计约束：
 * - 纯正则解析 RSS（feed 库生成的结构固定，避免引入 XML 依赖）
 * - 消息用纯文本 + 链接预览（Telegram 自动抓取封面图），不设 parse_mode，
 *   规避 Markdown 转义坑
 * - 首次运行只建立 baseline（记录最新 GUID），不推存量文章，避免轰炸订阅者
 */

const RSS_PATH = '/rss.xml'
const TG_API = 'https://api.telegram.org'
const STATE_KEY = 'last_guid'
const LOCK_KEY = 'push_lock'
const LOCK_TTL = 120 // seconds：锁超时自愈（持有者崩溃后自动释放）
const TG_TIMEOUT = 5_000
const MAX_TG_ATTEMPTS = 3 // 429 限流时的最大重试次数
const EXCERPT_MAX_LEN = 180 // 摘要截断长度
const CATCH_UP_CAP = 10 // baseline 丢失时最多补推条数
const THROTTLE_MS = 300 // 频道消息限速余量
const ERROR_TRUNCATE_LEN = 200 // 错误详情截断长度
const RETRY_BACKOFF_MS = 500 // KV 重试退避基数
const MAX_RETRY_AFTER = 5 // 429 Retry-After 上限（秒）

/** 解析 RSS XML 为文章列表（按 pubDate 升序返回） */
export function parseRSS(xml) {
  const items = []
  const itemRe = /<item>([\s\S]*?)<\/item>/g

  for (let match = itemRe.exec(xml); match !== null; match = itemRe.exec(xml)) {
    const block = match[1]
    const pick = (tag) => {
      const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))
      return m ? unescapeXML(m[1]).trim() : ''
    }
    const guid = pick('guid') || pick('link')
    if (!guid)
      continue
    items.push({
      guid,
      title: pick('title'),
      link: pick('link'),
      description: pick('description'),
      pubDate: pick('pubDate'),
    })
  }

  return items.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate))
}

/** XML 实体反转义 */
function unescapeXML(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, '\'')
    .replace(/&amp;/g, '&')
}

/** 摘要：剥 HTML 标签 + 截断 */
function makeExcerpt(html) {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > EXCERPT_MAX_LEN ? `${text.slice(0, EXCERPT_MAX_LEN)}…` : text
}

/** 组装 TG 消息文本 */
function buildMessage(post) {
  const excerpt = makeExcerpt(post.description)
  const lines = [`📮 新文章：${post.title}`]
  if (excerpt)
    lines.push('', excerpt)
  lines.push('', post.link)
  return lines.join('\n')
}

/**
 * 加锁：防止 cron 和手动触发并发执行。
 *
 * 注意：Workers KV 的 put() 只有 { expiration, expirationTtl, metadata } 三个选项，
 * 没有 onlyIfAbsent 条件写（官方文档 developers.cloudflare.com/kv/api/write-key-value-pairs）。
 * 因此用 get → put → 回读校验 三步实现 best-effort 锁：
 * - 先 get 检查是否已被占用
 * - put 写入随机 token（带 TTL 自愈，防止持有者崩溃后死锁）
 * - 回读校验 token 仍属于自己（缩小 get/put 间的 TOCTOU 窗口）
 *
 * 局限：KV 最终一致性下跨 PoP 并发仍可能有极小窗口，个人博客 cron 15min + 手动
 * 触发频率下可接受（与官方推荐的 get-then-put 模式一致）。
 * @returns {Promise<string|null>} 锁 token；获取失败返回 null
 */
async function acquireLock(env) {
  const existing = await env.TG_STATE.get(LOCK_KEY, { cacheTtl: 30 })
  if (existing)
    return null

  const token = crypto.randomUUID()
  await env.TG_STATE.put(LOCK_KEY, token, { expirationTtl: LOCK_TTL })
  // 回读校验：确认锁仍归自己（另一并发写入者可能覆盖）
  const verify = await env.TG_STATE.get(LOCK_KEY, { cacheTtl: 30 })
  return verify === token ? token : null
}

/** 释放锁：仅当锁仍属于当前持有者时删除，避免 TTL 过期后误删他人锁 */
async function releaseLock(env, token) {
  const current = await env.TG_STATE.get(LOCK_KEY, { cacheTtl: 30 })
  if (current === token)
    await env.TG_STATE.delete(LOCK_KEY)
}

/** KV 带重试写入 */
async function putWithRetry(kv, key, value, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      await kv.put(key, value)
      return
    }
    catch (err) {
      if (i === maxRetries)
        throw err
      await new Promise(resolve => setTimeout(resolve, RETRY_BACKOFF_MS * (i + 1)))
    }
  }
}

/**
 * 推送新文章到频道。
 * @returns {Promise<{pushed: number, skippedPermanent?: number, baseline?: boolean, skipped?: string}>} 推送统计：pushed=成功条数，skippedPermanent=永久错误跳过条数，baseline=仅建立基线，skipped=跳过原因
 */
export async function pushNewPosts(env) {
  // 尝试获取锁（返回 token 表示获取成功），失败说明已有其他实例在执行
  const lockToken = await acquireLock(env)
  if (!lockToken) {
    return { pushed: 0, skipped: 'locked' }
  }

  try {
    // 通过本地 ASSETS 绑定获取 RSS，避免 Worker 请求自身公开 URL 造成超时（522）
    const rssReq = new Request(new URL(RSS_PATH, 'https://cgartlab.com'), {
      headers: { 'User-Agent': 'cgartlab-blog-tg-pusher/1.0' },
    })
    const res = await env.ASSETS.fetch(rssReq)
    if (!res.ok)
      throw new Error(`RSS fetch failed: ${res.status}`)

    const posts = parseRSS(await res.text())
    if (posts.length === 0)
      return { pushed: 0, baseline: true }

    const lastGuid = await env.TG_STATE.get(STATE_KEY)
    const botToken = env.TG_BOT_TOKEN
    const channel = env.TG_CHANNEL_ID

    // 配置守卫：secrets 缺失时立刻抛错，绝不推进 cursor。
    // 否则 TG 请求会打到 /botundefined → 404/400 → 被误判为永久错误并推进
    // cursor，导致所有文章被永久丢弃（Argus P2）。
    if (!botToken || !channel) {
      throw new Error('TG secrets missing: TG_BOT_TOKEN and TG_CHANNEL_ID must be set')
    }

    // 首次运行：建立 baseline，不推送存量
    if (!lastGuid) {
      await env.TG_STATE.put(STATE_KEY, posts.at(-1).guid)
      return { pushed: 0, baseline: true }
    }

    const newPosts = posts.filter(p => p.guid !== lastGuid)
    const lastIndex = posts.findIndex(p => p.guid === lastGuid)
    // 取 baseline 之后的新文章（容忍 RSS 中 baseline 消失的情况）
    let toPush
    if (lastIndex >= 0) {
      toPush = posts.slice(lastIndex + 1)
    }
    else {
      // baseline 丢失（如停机超过 feed 保留窗口）：只补推最新 CATCH_UP_CAP 条，并记录警告
      const dropped = newPosts.length - CATCH_UP_CAP
      if (dropped > 0)
        console.warn(`[TG] last_guid not in feed, ${dropped} older post(s) dropped, pushing newest ${CATCH_UP_CAP}`)
      toPush = newPosts.slice(-CATCH_UP_CAP)
    }

    let pushed = 0
    let skippedPermanent = 0
    for (const post of toPush) {
      // 发送 + 429 限流重试（最多 MAX_TG_ATTEMPTS 次）
      let sent = false
      for (let attempt = 1; attempt <= MAX_TG_ATTEMPTS; attempt++) {
        const payload = {
          chat_id: channel,
          text: buildMessage(post),
          link_preview_options: { is_disabled: false },
        }
        const r = await fetch(`${TG_API}/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(TG_TIMEOUT),
        })

        if (r.ok) {
          sent = true
          break
        }

        const errText = await r.text()
        // 永久性错误（400/403/404）：跳过该条，推进 cursor，不阻塞后续文章。
        // 计入 skippedPermanent（不混入 pushed，避免日志/响应误导）。
        if (r.status === 400 || r.status === 403 || r.status === 404) {
          console.error(`[TG] Permanent error, skipping ${post.guid} (${r.status}): ${errText.slice(0, ERROR_TRUNCATE_LEN)}`)
          await putWithRetry(env.TG_STATE, STATE_KEY, post.guid)
          skippedPermanent++
          break
        }
        // 429 限流：按 Retry-After 等待后重试（临时错误，可恢复）。
        // Retry-After 可能是秒数或 HTTP-date，Number() 对非数字返回 NaN，
        // setTimeout(NaN) 会变成立即重试——统一兜底为 1s。
        if (r.status === 429 && attempt < MAX_TG_ATTEMPTS) {
          const raw = Number(r.headers.get('Retry-After'))
          const retryAfter = Number.isFinite(raw) && raw > 0 ? Math.min(raw, MAX_RETRY_AFTER) : 1
          console.warn(`[TG] Rate limited, retrying in ${retryAfter}s (attempt ${attempt}/${MAX_TG_ATTEMPTS})`)
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
          continue
        }
        // 其他错误（5xx 等）：抛错中止本批，cursor 停在最后成功处，下次 cron 继续
        throw new Error(`TG sendMessage failed (${r.status}): ${errText.slice(0, ERROR_TRUNCATE_LEN)}`)
      }

      if (sent) {
        await putWithRetry(env.TG_STATE, STATE_KEY, post.guid)
        // 续期锁：防止 429 长批次（最坏 ~20s/篇 × 10 篇）超过 LOCK_TTL 后锁过期，
        // 避免重叠运行同时推送造成重复（Argus P2）。
        // 续期前先校验锁仍归自己：若锁已过期且被后继者获取，则不再续期覆盖其锁。
        const currentLock = await env.TG_STATE.get(LOCK_KEY, { cacheTtl: 30 })
        if (currentLock === lockToken)
          await env.TG_STATE.put(LOCK_KEY, lockToken, { expirationTtl: LOCK_TTL })
        pushed++
        // 频道消息限速约 1 msg/s，留 THROTTLE_MS 余量
        await new Promise(resolve => setTimeout(resolve, THROTTLE_MS))
      }
    }

    return { pushed, skippedPermanent, baseline: false }
  }
  finally {
    await releaseLock(env, lockToken)
  }
}