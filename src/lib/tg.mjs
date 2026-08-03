/**
 * tg.mjs — 博客 RSS → Telegram 频道推送
 *
 * 职责：
 * 1. 抓取站点默认语言的 RSS（https://cgartlab.com/rss.xml）
 * 2. 与 KV（TG_STATE）中记录的最后推送 GUID 对比，推送新文章
 * 3. 调用 Telegram Bot API 发送到频道
 *
 * 设计约束：
 * - 纯正则解析 RSS（feed 库生成的结构固定，避免引入 XML 依赖）
 * - 消息用纯文本 + 链接预览（Telegram 自动抓取封面图），不设 parse_mode，
 *   规避 Markdown 转义坑
 * - 首次运行只建立 baseline（记录最新 GUID），不推存量文章，避免轰炸订阅者
 */

const RSS_URL = 'https://cgartlab.com/rss.xml'
const TG_API = 'https://api.telegram.org'
const STATE_KEY = 'last_guid'

/** 解析 RSS XML 为文章列表（按 pubDate 升序返回） */
export function parseRSS(xml) {
  const items = []
  const itemRe = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRe.exec(xml)) !== null) {
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
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

/** 摘要：剥 HTML 标签 + 截断 */
function makeExcerpt(html, maxLen = 180) {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text
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
 * 推送新文章到频道。
 * @returns {Promise<{pushed: number, baseline: boolean}>}
 */
export async function pushNewPosts(env) {
  const res = await fetch(RSS_URL, {
    headers: { 'User-Agent': 'cgartlab-blog-tg-pusher/1.0' },
    cf: { cacheTtl: 0 },
  })
  if (!res.ok)
    throw new Error(`RSS fetch failed: ${res.status}`)

  const posts = parseRSS(await res.text())
  if (posts.length === 0)
    return { pushed: 0, baseline: true }

  const lastGuid = await env.TG_STATE.get(STATE_KEY)
  const token = env.TG_BOT_TOKEN
  const channel = env.TG_CHANNEL_ID

  // 首次运行：建立 baseline，不推送存量
  if (!lastGuid) {
    await env.TG_STATE.put(STATE_KEY, posts[posts.length - 1].guid)
    return { pushed: 0, baseline: true }
  }

  const newPosts = posts.filter(p => p.guid !== lastGuid)
  const lastIndex = posts.findIndex(p => p.guid === lastGuid)
  // 取 baseline 之后的新文章（容忍 RSS 中 baseline 消失的情况）
  const toPush = lastIndex >= 0
    ? posts.slice(lastIndex + 1)
    : newPosts.slice(-10)

  let pushed = 0
  for (const post of toPush) {
    const payload = {
      chat_id: channel,
      text: buildMessage(post),
      link_preview_options: { is_disabled: false },
    }
    const r = await fetch(`${TG_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!r.ok) {
      const errText = await r.text()
      throw new Error(`TG sendMessage failed (${r.status}): ${errText.slice(0, 200)}`)
    }
    await env.TG_STATE.put(STATE_KEY, post.guid)
    pushed++
    // 频道消息限速约 1 msg/s，留 300ms 余量
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  return { pushed, baseline: false }
}
