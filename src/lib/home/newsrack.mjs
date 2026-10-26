import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'
import { boxSvg, faceMatrix, facePath, frameOf } from './frame.mjs'

/**
 * Module 03 — the newsstand that carries the column.
 *
 * The rack stands turned off the camera so its right-hand end comes into view:
 * the post faces, the rail ends and the clipped sheets all lean the same way,
 * so the issues read as depth rather than a flat wall.
 *
 * There is no fixed slot table. `layoutOf(issues.length)` derives the whole
 * hanging wall from the count: how many tiers, how many papers on each, and how
 * big a paper can be. Twenty-four issues — the column as it stands — come out as
 * four tiers of six, the densest the footprint allows while every paper still
 * carries a masthead, a cover photo and two rules. The count is free to move:
 * a longer run gets narrower papers (never a taller rack, never a dropped
 * issue), a shorter one gets fewer, larger papers.
 *
 * Painter order follows the frame's own depth (k.depthOf: +v comes toward the
 * reader, +w toward the camera's raised eye): backboard, plinth, posts, the
 * rails, then the sheets tier by tier and left to right — every paper sits on
 * the same leaning plane, so column order is depth order — each one finishing
 * with its own clips, and the front lip last because the papers hang down
 * behind it.
 */

const YAW = 16
const F = frameOf({ yaw: YAW, origin: [-76.1, -39.5, TOP] })

const W = 168, D = 34, H = 96
const POST = 7
const RAIL = { v: 20, vd: 6, wh: 4 } // every tier's rail, in frame units
const PLINTH = 6, LIP = { v0: 26, vd: 8, wh: 2.5 }

// ---- the hanging wall -----------------------------------------------------
// The papers live between the posts and between the plinth and the post caps.
// `SPAN` is the vertical run they may use; the layout divides it into tiers.
const INNER = W - POST * 2
const END_PAD = 3 // air between the outermost paper and a post
const COL_GAP = 2.4 // air between two papers on the same rail
const TIER_GAP = 2 // air between one paper's foot and the next tier's top
const MAX_PAPER_W = 74 // one paper per tier still reads as a paper, not a poster
const MIN_PAPER_H = 19 // enough page for a masthead, a 9-high cover, two rules
const HEAD = H - 6 // the topmost paper's top edge, clear of the post caps
// The front lip is a box from v=26 to v=34, so its *back* top edge is the
// highest thing it puts on screen — high enough to eat the foot of a paper that
// leans over it. A foot at w=11 clears that edge for the tallest page the
// layout can ask for (37), so no tier's rules are swallowed by the lip.
const FOOT = 11
const SPAN = HEAD - FOOT

const LEAN = 8
const RAD = Math.PI / 180
const SIN = Math.sin(LEAN * RAD)
const COS = Math.cos(LEAN * RAD)
const DOWN = [0, SIN, -COS] // one sheet unit, downward on the page
const V_TOP = 26.6 // the sheet's top edge, just in front of the rail face
const DROP = COS // how far a sheet falls per unit measured down it

// ---- one page, as fractions of its own size -------------------------------
// Bands are proportional so a 23-wide paper and a 53-wide paper carry the same
// page: masthead strip on top with the number in it, the cover under it, the
// two headline rules below. The clip's drop and depth stay in frame units,
// because it grips the rail rather than the page; its width follows the paper.
const BAND = {
  mast: 0.3,
  number: { sv: 0.28, size: 0.24, maxWide: 0.2 },
  cover: { sv0: 0.36, sv1: 0.86, pad: 0.11, maxPad: 2.4 },
  rules: [0.9, 0.955],
  clip: { drop: 0.13, top: 1.5, wide: 0.09, minWide: 1.8, maxWide: 4.2 },
  clips: [0.11, 0.89],
}

const esc = (text) => String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const fix = (n) => Math.round(n * 100) / 100

/** A point on a sheet: su across, sv down from the rail. */
const sheetAt = (u0, w0, su, sv) => [u0 + su, V_TOP + sv * SIN, w0 - sv * COS]

/** A straight line in the frame, e.g. a headline rule. */
function rule(a, b, P) {
  return k.lineSvg(k.pathOf([k.iso(F.at(...a), P), k.iso(F.at(...b), P)]), { tone: 'lo' })
}

/** A slotted screw on the lip's front face. */
function screw(u, P) {
  const w = PLINTH + LIP.wh / 2
  const face = LIP.v0 + LIP.vd
  const head = G.frameAlong(F.at(u, face, w), F.dir(0, 1, 0))
  return k.solidSvg(G.disc(0, 0.8, 1.1, head, P), { tone: 'mid' })
    + k.lineSvg(k.pathOf([k.iso(F.at(u - 0.8, face + 0.85, w), P), k.iso(F.at(u + 0.8, face + 0.85, w), P)]), { tone: 'faint' })
}

/** A knurled cap seated on a post. */
function cap(u, P) {
  const [cx, cy] = F.at(u, D / 2, H)
  return k.solidSvg(k.cylinder(cx, cy, 4.4, TOP + H, 3, P, 20), { tone: 'mid' })
    + k.lineSvg(k.ring(cx, cy, 4.4, TOP + H + 0.4, P, 20), { tone: 'faint' })
    + k.lineSvg(k.knurl(cx, cy, 4.4, TOP + H, TOP + H + 3, 16, P, 0.3), { tone: 'faint' })
}

/**
 * The rack's layout, from the number of issues alone.
 *
 *   tiers   one per six issues, kept between three and five so the rack always
 *           reads as a rack and never as a grid of stamps — but a run of one or
 *           two hangs on one or two rails rather than on an empty rack
 *   perTier the widest tier, which is what sets the paper's width
 *   w       as many papers across as fit with air between them, capped so a
 *           short run does not turn into posters, and never wider than a 2:1
 *           page can be given the height the tiers leave
 *   h       the paper's height: the page's proportions when the width binds,
 *           the tier's ceiling when the count is high enough to squeeze it
 *
 * Twenty-four issues: tiers = ceil(24/6) = 4, perTier = 6, w = (148 - 5×2.4)/6
 * = 22.7, h = min(18.4, max(11.3, 19)) = 18.4 — a 22.7 × 18.4 page with a
 * 17.9 × 9.2 cover, four tiers of six inside a 168 × 96 frame.
 */
function layoutOf(count) {
  const n = Math.max(0, count)
  const tiers = Math.min(5, Math.max(Math.min(3, n), Math.ceil(n / 6)))
  const ceiling = (SPAN - (tiers - 1) * TIER_GAP) / (DROP * tiers)
  const perTier = Math.max(1, Math.ceil(n / tiers))
  const slotW = (INNER - END_PAD * 2 - (perTier - 1) * COL_GAP) / perTier
  const w = Math.max(1, Math.min(slotW, MAX_PAPER_W, ceiling * 2))
  const h = Math.min(ceiling, Math.max(w / 2, MIN_PAPER_H))
  const pitch = tiers > 1 ? (SPAN - DROP * h) / (tiers - 1) : 0
  // a single rail sits in the middle of the wall instead of at its top
  const lead = tiers > 1 ? 0 : (SPAN - DROP * h) / 2
  const rails = Array.from({ length: tiers }, (_, tier) => HEAD - 2 - lead - tier * pitch)
  const base = Math.floor(n / tiers)
  const extra = n % tiers
  const rows = Array.from({ length: tiers }, (_, tier) => base + (tier < extra ? 1 : 0))
  return { n, tiers, perTier, w, h, pitch, rails, rows }
}

/** The page's bands, resolved against one paper's size. */
function metricsOf(w, h) {
  const pad = Math.min(BAND.cover.maxPad, w * BAND.cover.pad)
  return {
    w,
    h,
    mast: h * BAND.mast,
    number: {
      su: w / 2,
      sv: h * BAND.number.sv,
      size: Math.min(h * BAND.number.size, w * BAND.number.maxWide),
    },
    cover: {
      su0: pad,
      su1: w - pad,
      sv0: h * BAND.cover.sv0,
      sv1: h * BAND.cover.sv1,
    },
    rules: BAND.rules.map((fraction) => fraction * h),
    clip: {
      drop: h * BAND.clip.drop,
      wide: Math.min(BAND.clip.maxWide, Math.max(BAND.clip.minWide, w * BAND.clip.wide)),
      at: BAND.clips.map((fraction) => fraction * w),
    },
  }
}

/** One hung issue: paper, cover block, photo, masthead, number, rules, clips. */
function sheetSvg(issue, index, u0, w0, M, P) {
  const at = (su, sv) => sheetAt(u0, w0, su, sv)
  const quad = (su0, sv0, su1, sv1) => facePath(F, [at(su0, sv0), at(su1, sv0), at(su1, sv1), at(su0, sv1)], P)
  const paper = quad(0, 0, M.w, M.h)
  const out = [`<g class="home-issue-sheet-group" data-index="${index}">`]

  out.push(`<path class="home-issue-sheet" d="${paper}"/>`)
  out.push(k.lineSvg(paper, { tone: 'hi' }))

  // the block sits behind the photo: a grey page until the pointer lands
  out.push(`<path class="home-issue-cover" d="${quad(M.cover.su0, M.cover.sv0, M.cover.su1, M.cover.sv1)}"/>`)
  if (issue.cover) {
    const cw = fix(M.cover.su1 - M.cover.su0)
    const ch = fix(M.cover.sv1 - M.cover.sv0)
    out.push(`<image class="home-issue-photo" href="${esc(issue.cover)}" width="${cw}" height="${ch}" preserveAspectRatio="xMidYMid slice" transform="${faceMatrix(F, at(M.cover.su0, M.cover.sv0), [1, 0, 0], DOWN, P)}"/>`)
  }

  // masthead along the top edge, clear of the cover: the number sits centred,
  // between the two clips rather than under them
  out.push(`<path class="home-issue-mast" d="${quad(0, 0, M.w, M.mast)}"/>`)
  out.push(`<g class="home-issue-number">${k.faceTextSvg(faceMatrix(F, at(M.number.su, M.number.sv), [1, 0, 0], DOWN, P), issue.number || '', { size: fix(M.number.size), tone: 'hi', anchor: 'middle' })}</g>`)

  // two headline rules under the cover
  M.rules.forEach((sv, i) => {
    out.push(rule(at(M.cover.su0, sv), at(M.w - M.cover.su0 - i * M.w * 0.18, sv), P))
  })

  // clips straddle the rail and hold the paper's top edge, out near the corners
  // where a rack grips a page — so they clear the centred number and stop short
  // of the paper hanging above them.
  for (const cu of M.clip.at) {
    out.push(boxSvg(F, {
      u: u0 + cu - M.clip.wide / 2,
      v: RAIL.v + 3,
      w: w0 - M.clip.drop,
      uw: M.clip.wide,
      vd: RAIL.vd - 1.6,
      wh: M.clip.drop + BAND.clip.top,
    }, P, { tone: 'mid' }))
  }

  out.push('</g>')
  return out.join('')
}

export function buildNewsrack(P, options = {}) {
  const issues = options.issues || []
  const L = layoutOf(issues.length)
  const M = metricsOf(L.w, L.h)
  const out = []

  /**
   * One sub-assembly. Every group is a contiguous run of what already painted
   * together, so splitting the rack changes no painter's order — only which
   * assembly a path belongs to. `--step` is the shared settle contract in
   * home.css; newsrack.css replaces it with the real assembly.
   *
   * `--step` counts within a part (the two posts, one run per tier, one run per
   * paper), not across the rack: each part's own wave reads left to right or
   * far to near on its own, and the cross-part beat order lives in the CSS.
   * The sheets also carry `--lag`, the stagger the CSS should use: it shrinks
   * as the rack fills, so twenty-four papers still finish hanging in about as
   * long as four did.
   */
  const part = (name, step, ...items) =>
    `<g class="home-part" data-part="${name}" style="--step:${step}">${items.join('')}</g>`

  const lag = Math.min(60, Math.round(700 / Math.max(1, L.n)))
  const sheetPart = (step, ...items) =>
    `<g class="home-part" data-part="sheets" style="--step:${step};--lag:${lag}ms">${items.join('')}</g>`

  // ---- back: the backboard, the farthest thing in the frame -------------
  const panel = facePath(F, [[POST, 4.5, PLINTH], [W - POST, 4.5, PLINTH], [W - POST, 4.5, HEAD], [POST, 4.5, HEAD]], P)
  out.push(part('back', 0,
    `<path class="iso-shade" data-shade="1" d="${panel}"/>`,
    k.lineSvg(panel, { tone: 'faint' }),
  ))

  // ---- plinth: the base everything stands on ---------------------------
  // Named `plinth`, not `base`: typewriter.css already owns `[data-part='base']`
  // and these selectors are module-agnostic, so a shared name would hand the
  // typewriter's case this rack's beat.
  out.push(part('plinth', 0,
    boxSvg(F, { u: 0, v: 0, w: 0, uw: W, vd: D, wh: PLINTH }, P, { tone: 'lo' }),
  ))

  // ---- posts: one run each, so each stands up about its own foot --------
  for (const [index, u] of [0, W - POST].entries()) {
    out.push(part('posts', index,
      boxSvg(F, { u, v: 2, w: PLINTH, uw: POST, vd: D - 4, wh: H - PLINTH }, P, { tone: 'mid' }),
      cap(u + POST / 2, P),
    ))
  }

  // ---- rails: one run per tier, so each drops into its own notch --------
  for (const [index, w] of L.rails.entries()) {
    out.push(part('rails', index,
      boxSvg(F, { u: POST, v: RAIL.v, w, uw: W - POST * 2, vd: RAIL.vd, wh: RAIL.wh }, P, { tone: 'mid' }),
    ))
  }

  // ---- sheets: one paper per issue, painted tier by tier, left to right --
  // The whole `<a>` is wrapped, never the `.home-issue-sheet-group` inside it:
  // the hover swing is a transition on that inner group and stays untouched.
  // Each sheet carries its own clips, so it lands as one hanging paper and
  // `--step` is the loading order — newest issue first, far side to near.
  let order = 0
  let index = 0
  for (const [tier, count] of L.rows.entries()) {
    const rowW = count * L.w + Math.max(0, count - 1) * COL_GAP
    const u0 = POST + (INNER - rowW) / 2
    for (let column = 0; column < count; column++) {
      const issue = issues[index] || {}
      const label = issue.label || issue.number || ''
      const su = u0 + column * (L.w + COL_GAP)
      out.push(sheetPart(order++,
        `<a class="home-issue" data-index="${index}" href="${esc(issue.href || '#')}" aria-label="${esc(label)}"><title>${esc(label)}</title>${sheetSvg(issue, index, su, L.rails[tier] + 2, M, P)}</a>`,
      ))
      index++
    }
  }

  // ---- plinth again: the front lip is bolted to the plinth, but it is --
  // painted last because the papers hang down behind it. Same part, same
  // beat, so the two runs move as one plinth and the paint order stands.
  out.push(part('plinth', 0,
    boxSvg(F, { u: POST, v: LIP.v0, w: PLINTH, uw: W - POST * 2, vd: LIP.vd, wh: LIP.wh }, P, { tone: 'mid' }),
    ...([10, W - 10].map(u => screw(u, P))),
  ))

  return out.join('')
}

/**
 * Everything the rack can paint, for the stage's fit.
 *
 * The frame's own box already holds every paper — the layout puts them between
 * HEAD and FOOT vertically and between the posts horizontally, and the lean
 * only ever moves a sheet toward the reader — but the sheet's corners are
 * stated here anyway, so a later change to the page cannot silently grow past
 * the rack and clip against the viewBox.
 */
export function newsrackBounds() {
  const out = []
  for (const u of [0, W])
    for (const v of [0, D])
      for (const w of [0, H + 3])
        out.push(F.at(u, v, w))
  for (const u of [POST / 2, W - POST / 2]) {
    const [cx, cy, cz] = F.at(u, D / 2, H)
    out.push([cx - 4.4, cy - 4.4, cz], [cx + 4.4, cy + 4.4, cz])
  }
  // the tallest page any tier count can ask for, hung from the top rail
  const tallest = MAX_PAPER_W / 2
  for (const u of [POST, W - POST]) {
    for (const sv of [0, tallest]) {
      out.push(F.at(u, V_TOP + sv * SIN, HEAD - sv * COS))
      out.push(F.at(u, V_TOP + sv * SIN, FOOT))
    }
  }
  return out
}
