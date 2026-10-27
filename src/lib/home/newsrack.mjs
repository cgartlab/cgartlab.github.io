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

// ---- the rail, the reader and the two end blocks --------------------------
//
// The front lip is not only a lip. A rail stands off it, a block at each end of
// the lip holds that rail, and a reader rides the rail with a magnifier: the
// rack is being read, not just displayed. The idler pulley sits on the left
// block, the crank on the right one, and both turn as the reader travels.
//
// The reader is drawn once, at the left end of its travel; the CSS slides the
// whole group to the right by `--run-x / --run-y`, the screen delta between the
// two ends of the rail, so the module never has to know about time.
const TRACK = { v: 36.2, w: 10.6, r: 1.05 }
const BLOCK = { u: 8, v: 33, w: 6, uw: 12, vd: 8, wh: 9.4 }
const TRAVEL = { u0: 34, u1: 136 }
const PULLEY = { r: 3.6, face: 2.2 }
const LENS = { r: 5, v: 37.4, w: 22.6 }
const ARCHIVE = { u: 7, v: 45, w: 34, d: 15 }

/** A world-space frame on the rack whose axis points out of the front face. */
const facing = (u, v, w) => G.frameAlong(F.at(u, v, w), F.dir(0, 1, 0))

/** A pulley on a block's face; the right-hand one carries the crank. */
function pulleySvg(u, v, w, P, crank = false) {
  const pf = facing(u, v, w)
  const [cx, cy] = k.iso(F.at(u, v, w), P)
  const out = [`<g class="home-pulley" style="transform-origin:${cx.toFixed(1)}px ${cy.toFixed(1)}px">`]
  out.push(k.solidSvg(G.disc(0, 1.4, PULLEY.r * 0.66, pf, P), { tone: 'lo' }))
  out.push(k.solidSvg(G.ringBand(0, PULLEY.face, PULLEY.r * 0.66, PULLEY.r, pf, P), { tone: 'mid' }))
  out.push(k.lineSvg(G.circleOf(pf, PULLEY.face, PULLEY.r * 0.66, P), { tone: 'lo' }))
  out.push(k.lineSvg(G.spokesOf(pf, PULLEY.face, PULLEY.r * 0.18, PULLEY.r * 0.62, 5, P), { tone: 'lo' }))
  out.push(k.solidSvg(G.disc(PULLEY.face, PULLEY.face + 1.1, PULLEY.r * 0.18, pf, P), { tone: 'hi' }))
  if (crank) {
    // the arm lies on the wheel's face; the grip stands off its end
    const arm = [[-1.2, -0.9], [PULLEY.r * 0.86, -0.9], [PULLEY.r * 0.86, 0.9], [-1.2, 0.9]]
    out.push(k.solidSvg(G.prismOf(pf, arm, PULLEY.face, PULLEY.face + 1.4, P), { tone: 'hi' }))
    const axis = F.dir(0, 1, 0)
    const o = F.at(u, v, w)
    const base = [0, 1, 2].map(i => o[i] + pf.u[i] * (PULLEY.r * 0.72) + axis[i] * (PULLEY.face + 1.4))
    out.push(k.solidSvg(G.solidOf([[0, 1.25], [3.2, 1.25]], G.frameAlong(base, axis), P), { tone: 'hi' }))
  }
  out.push('</g>')
  return out.join('')
}

/** One end block on the lip: a machined clamp, its cap plate, its bearing. */
function blockSvg(u, P) {
  const out = []
  out.push(boxSvg(F, { u, v: BLOCK.v, w: BLOCK.w, uw: BLOCK.uw, vd: BLOCK.vd, wh: BLOCK.wh }, P, { tone: 'mid' }))
  out.push(boxSvg(F, { u: u + 1, v: BLOCK.v - 0.6, w: BLOCK.w + BLOCK.wh, uw: BLOCK.uw - 2, vd: BLOCK.vd + 1.2, wh: 1.7 }, P, { tone: 'hi' }))
  // the bearing boss the wheel turns on
  out.push(k.solidSvg(G.disc(0, 1.2, 2.4, facing(u + BLOCK.uw / 2, BLOCK.v + BLOCK.vd, BLOCK.w + BLOCK.wh / 2), P), { tone: 'hi' }))
  return out.join('')
}

/** A stack of back issues on the deck, in front of the rack's left end. */
function archiveSvg(P) {
  const out = []
  const sheets = [[0, 0], [0.9, -0.8], [-0.9, 0.7], [0.5, 0.9], [-0.4, -0.5]]
  sheets.forEach(([du, dv], i) => {
    out.push(boxSvg(F, {
      u: ARCHIVE.u + du,
      v: ARCHIVE.v + dv,
      w: i * 1.55,
      uw: ARCHIVE.w,
      vd: ARCHIVE.d,
      wh: 1.45,
    }, P, { tone: i % 2 ? 'mid' : 'hi' }))
  })
  const top = sheets.length * 1.55
  // the fold down the top issue, and the paper band that keeps the pile square
  out.push(rule([ARCHIVE.u + 1.6, ARCHIVE.v + ARCHIVE.d / 2, top], [ARCHIVE.u + ARCHIVE.w - 1.6, ARCHIVE.v + ARCHIVE.d / 2, top], P))
  out.push(boxSvg(F, { u: ARCHIVE.u + 12.5, v: ARCHIVE.v, w: top + 0.1, uw: 3.6, vd: ARCHIVE.d, wh: 0.45 }, P, { tone: 'lo' }))
  out.push(boxSvg(F, { u: ARCHIVE.u + 12.5, v: ARCHIVE.v + ARCHIVE.d - 0.45, w: 0, uw: 3.6, vd: 0.45, wh: top + 0.55 }, P, { tone: 'lo' }))
  // a corner turned down on the top issue: the crease alone says it, and the
  // top face's own edge closes the shape
  out.push(rule([ARCHIVE.u + ARCHIVE.w - 5.5, ARCHIVE.v + ARCHIVE.d, top + 0.03], [ARCHIVE.u + ARCHIVE.w, ARCHIVE.v + ARCHIVE.d - 5, top + 0.03], P))
  return out.join('')
}

/** The reader: a clamp on the rail, an arm, and the magnifier it carries. */
function readerSvg(P) {
  const u = TRAVEL.u0
  const out = []
  // the clamp, its two guide rollers on the rail's face
  out.push(boxSvg(F, { u: u - 5, v: 33.6, w: 9, uw: 10, vd: 6.2, wh: 4.4 }, P, { tone: 'hi' }))
  for (const du of [-2.4, 2.4]) {
    const rf = facing(u + du, TRACK.v + 2.6, TRACK.w)
    out.push(k.solidSvg(G.disc(0, 1.1, 1.7, rf, P), { tone: 'mid' }))
    out.push(k.lineSvg(G.circleOf(rf, 1.1, 1.7, P), { tone: 'lo' }))
  }
  // the arm up to the lens
  out.push(boxSvg(F, { u: u - 1.3, v: 35.4, w: 13.2, uw: 2.6, vd: 1.9, wh: LENS.w - 16.4 }, P, { tone: 'mid' }))
  // the magnifier: ring, glass, one highlight
  const lf = facing(u, LENS.v, LENS.w)
  out.push(k.solidSvg(G.ringBand(0, 1.7, LENS.r * 0.72, LENS.r, lf, P), { tone: 'mid' }))
  out.push(`<path class="home-reader-glass" d="${G.circleOf(lf, 0.75, LENS.r * 0.72, P)}"/>`)
  // the glass: a thin dark rim, one bright highlight, and nothing else — a
  // lens has to show the page through it or it reads as a white disc
  out.push(k.lineSvg(G.circleOf(lf, 1.72, LENS.r, P), { tone: 'lo' }))
  out.push(k.lineSvg(G.circleOf(lf, 0.1, LENS.r, P), { tone: 'lo' }))
  out.push(k.lineSvg(G.circleOf(lf, 0.76, LENS.r * 0.72, P), { tone: 'lo' }))
  out.push(k.lineSvg(G.circleOf(lf, 0.78, LENS.r * 0.66, P), { tone: 'faint' }))
  out.push(k.lineSvg(G.arcOf(lf, 0.8, LENS.r * 0.58, P, { from: Math.PI * 1.02, to: Math.PI * 1.42 }), { tone: 'hi' }))
  out.push(k.lineSvg(G.arcOf(lf, 0.8, LENS.r * 0.5, P, { from: Math.PI * 1.52, to: Math.PI * 1.66 }), { tone: 'lo' }))
  return out.join('')
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

  // ---- archive: the back issues stacked on the deck, front left ---------
  out.push(part('archive', 0, archiveSvg(P)))

  // ---- drive: a block at each end of the lip, the rail between them -----
  // The rail is drawn with the left block, the crank lives on the right one.
  const railU0 = BLOCK.u + BLOCK.uw / 2
  const railU1 = W - BLOCK.u - BLOCK.uw / 2
  out.push(part('drive', 0,
    blockSvg(BLOCK.u, P),
    k.solidSvg(G.solidOf([[0, TRACK.r], [railU1 - railU0, TRACK.r]], G.frameAlong(F.at(railU0, TRACK.v, TRACK.w), F.dir(1, 0, 0)), P), { tone: 'mid' }),
    pulleySvg(railU0, BLOCK.v + BLOCK.vd, BLOCK.w + BLOCK.wh / 2, P),
  ))
  out.push(part('drive', 1,
    blockSvg(W - BLOCK.u - BLOCK.uw, P),
    pulleySvg(railU1, BLOCK.v + BLOCK.vd, BLOCK.w + BLOCK.wh / 2, P, true),
  ))

  // ---- reader: the magnifier on the rail, last --------------------------
  const [rx, ry] = k.iso(F.at(TRAVEL.u0, TRACK.v, TRACK.w), P)
  const [ex, ey] = k.iso(F.at(TRAVEL.u1, TRACK.v, TRACK.w), P)
  out.push(part('reader', 0,
    `<g class="home-reader" style="--run-x:${(ex - rx).toFixed(1)}px;--run-y:${(ey - ry).toFixed(1)}px">${readerSvg(P)}</g>`,
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
  // the end blocks with their wheels and the crank's grip, the reader's lens at
  // both ends of its run, and the stack of back issues on the deck
  for (const u of [BLOCK.u, W - BLOCK.u])
    for (const v of [BLOCK.v, BLOCK.v + BLOCK.vd + 3.6])
      for (const w of [BLOCK.w, BLOCK.w + BLOCK.wh + 2]) out.push(F.at(u, v, w))
  for (const u of [TRAVEL.u0, TRAVEL.u1])
    for (const du of [-LENS.r, LENS.r])
      for (const dw of [-LENS.r, LENS.r]) out.push(F.at(u + du, LENS.v, LENS.w + dw))
  for (const u of [ARCHIVE.u, ARCHIVE.u + ARCHIVE.w])
    for (const v of [ARCHIVE.v, ARCHIVE.v + ARCHIVE.d])
      for (const w of [0, 8.6]) out.push(F.at(u, v, w))
  return out
}
