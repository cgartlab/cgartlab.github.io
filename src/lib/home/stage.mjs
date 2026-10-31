/**
 * Everything the home stage needs that depends on the content — the projection,
 * the five channel labels, and the markup of the five machines.
 *
 * It lives outside the component because the machines are no longer all in the
 * page: only the one that boots is inlined, and the other four are fetched after
 * the page has painted (see `lateModules`). The endpoint that serves them has to
 * build exactly the same markup, so the builder is shared rather than copied —
 * a second copy would drift the moment a machine's props change.
 *
 * Deterministic: same content and locale in, same markup out.
 */
import { getLocalizedPath, getPostPath } from '@/i18n/path'
import { ui } from '@/i18n/ui'
import * as k from '@/lib/anatomy/iso-kit.mjs'
import { CABINET, TOP } from '@/lib/home/chassis.mjs'
import { buildCinema, cinemaBounds } from '@/lib/home/cinema.mjs'
import { buildLabels, labelsBounds } from '@/lib/home/labels.mjs'
import { buildNewsrack, newsrackBounds } from '@/lib/home/newsrack.mjs'
import { buildToolbox, toolboxBounds } from '@/lib/home/toolbox.mjs'
import { buildTypewriter, typewriterBounds } from '@/lib/home/typewriter.mjs'
import { getAllTags, getColumnPosts, getRegularPosts } from '@/utils/content'
import { issueNumberOf } from '@/utils/issue'

/**
 * One line per channel, shown under the machine when that channel is on the
 * platform. Kept here rather than in the page so the fragment endpoint and the
 * page never disagree about which section is which.
 */
export const TAGLINES = {
  zh: {
    posts: '分享终身学习所沉淀的第一手经验。',
    works: '我的作品以及你也可以用的实用工具。',
    column: '分享给你定期更新的记录和思考。',
    resource: '我用过，看到的好东西，都在这里。',
    tags: '穿越多个领域打造的知识网络。',
  },
  en: {
    posts: 'First-hand lessons from a lifetime of learning.',
    works: 'My work, and practical tools you can use too.',
    column: 'Notes and reflections, updated on a schedule.',
    resource: 'Things I have used and come across — all here.',
    tags: 'A knowledge network built across many fields.',
  },
}

/** The stage's drawing box, in stage units. */
export const W = 760
export const H = 620

/** Which machine belongs to which channel, in panel order. */
export const IDS = ['posts', 'works', 'column', 'resource', 'tags']
export const HREFS = ['/posts/', '/works/', '/column/', '/resource/', '/tags/']

const coverGlob = import.meta.glob(
  '/src/content/posts/_images/**/*.{jpeg,jpg,png,gif,webp}',
  { eager: true },
)

function coverOf(post) {
  const m = (post.body || '').match(/!\[[^\]]*\]\((.*?\.(?:webp|jpg|jpeg|png|gif))\)/)
  if (!m)
    return ''
  const raw = decodeURIComponent(m[1])
  if (raw.startsWith('http'))
    return raw
  if (raw.startsWith('./_images/') || raw.startsWith('../_images/')) {
    const name = raw.replace(/^(\.\.?\/)?_images\//, '')
    const entry = coverGlob[`/src/content/posts/_images/${name}`]
    return entry ? entry.default.src : ''
  }
  return ''
}

/** A plain-text excerpt of the latest post, wrapped to the sheet. */
function excerptLines(body, width, rows) {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const chars = [...text]
  const lines = []
  let cursor = 0
  while (cursor < chars.length && lines.length < rows) {
    let take = Math.min(width, chars.length - cursor)
    if (chars[cursor + take] && /\S/.test(chars[cursor + take - 1] ?? ' ') && /\S/.test(chars[cursor + take])) {
      let back = take
      while (back > width * 0.5 && chars[cursor + back - 1] !== ' ') back--
      if (chars[cursor + back - 1] === ' ') take = back - 1
    }
    if (take <= 0)
      take = Math.min(width, chars.length - cursor)
    lines.push(chars.slice(cursor, cursor + take).join('').trim())
    cursor += take
    while (chars[cursor] === ' ')
      cursor++
  }
  if (cursor < chars.length && lines.length) {
    const last = lines[lines.length - 1]
    lines[lines.length - 1] = `${[...last].slice(0, width - 1).join('')}…`
  }
  return lines.filter(Boolean)
}

export async function stageData(lang) {
  const t = ui[lang] ?? ui.zh
  const posts = await getRegularPosts(lang)
  const latest = posts[0]

  const labels = lang === 'zh'
    ? [t.posts, t.works, t.column, t.links, t.tags]
    : ['Posts', 'Works', 'Column', 'Links', 'Tags']

  const hrefs = HREFS.map(path => getLocalizedPath(path, lang))

  // the tags page already has these; the machine prints one label per tag, and
  // the count follows the content with no cap
  const tags = await getAllTags(lang)

  const bounds = [
    ...k.boxCorners(CABINET, -18, TOP),
    ...typewriterBounds(),
    ...cinemaBounds(),
    ...newsrackBounds(),
    ...toolboxBounds(),
    ...labelsBounds(),
  ]
  const P = k.fitProjection(bounds, W, H, {
    pad: 30,
    azimuth: 90,
    elevation: 18,
    focal: 1200,
    center: [0, 0, 55],
  })

  // Every column issue hangs on the rack — the count follows the content.
  // The list comes from the column folder *or* the column tag (getColumnPosts):
  // an issue dropped into column/ without its tag used to disappear from both
  // the rack and /column/ with nothing failing, which is how No.25 went unseen.
  const columns = await getColumnPosts(lang)
  const issues = columns.map((post) => {
    const abbr = post.data.abbrlink || ''
    const n = issueNumberOf(abbr)
    return {
      number: n ? `No.${n}` : '',
      label: post.data.title,
      href: getPostPath(abbr || post.id, lang),
      cover: coverOf(post),
    }
  })

  const perLine = lang === 'zh' ? 18 : 26
  const maxLines = 6
  const typedLines = excerptLines(latest?.body ?? '', perLine, maxLines)

  const paperHref = latest
    ? getPostPath(latest.data.abbrlink || latest.id, lang)
    : getLocalizedPath('/posts/', lang)

  const toolboxLabels = lang === 'zh'
    ? ['工具', '学习', '作者']
    : ['TOOLS', 'LEARN', 'PEOPLE']

  const modules = IDS.map((id, index) => {
    const caption = labels[index]
    const body = index === 0
      ? buildTypewriter(P, {
          lines: typedLines,
          paperHref,
          paperLabel: lang === 'zh' ? `阅读最新一篇：${latest?.data.title ?? ''}` : `Read the latest: ${latest?.data.title ?? ''}`,
        })
      : index === 1
        ? buildCinema(P, { caption })
        : index === 2
          ? buildNewsrack(P, { issues })
          : index === 3
            ? buildToolbox(P, { labels: toolboxLabels })
            : buildLabels(P, { tags, caption })
    return `<g class="home-module${index === 0 ? ' is-active' : ''}" data-index="${index}" data-module="${id}" data-position="0">${body}</g>`
  })

  // the mouth of the well, in stage units: the machines rise out of it, so the
  // deck mask and every module's rise hang off this point
  const [wellX, wellY] = k.iso([0, 0, TOP], P)

  return { P, W, H, labels, hrefs, modules, wellX, wellY, typedLines }
}

/**
 * Where the four machines that are not inlined are fetched from.
 *
 * A path per machine per locale, under one prefix so the Worker can give them a
 * short cache (they carry no content hash, and a deploy has to reach a visitor
 * within minutes rather than the 30 days an .svg asset normally gets).
 */
export function lateModulePath(lang, index) {
  const key = lang === 'zh' ? 'zh' : lang
  return `/home/stage/${key}-${index}.svg`
}
