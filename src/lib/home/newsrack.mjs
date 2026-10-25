import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'
import { boxSvg, faceMatrix, facePath, frameOf } from './frame.mjs'

/**
 * Module 03 — the newsstand that carries the column.
 *
 * The rack stands turned off the camera so its right-hand end comes into view:
 * the post faces, the rail ends and the four clipped sheets all lean the same
 * way, so the issues read as depth rather than a flat wall.
 *
 * Painter order follows the frame's own depth (k.depthOf: +v comes toward the
 * reader, +w toward the camera's raised eye): backboard, plinth, posts, rails,
 * then the sheets far to near, each one finishing with its own clips, and the
 * front lip last because the papers hang down behind it.
 */

const YAW = 16
const F = frameOf({ yaw: YAW, origin: [-76.1, -39.5, TOP] })

const W = 168, D = 34, H = 96
const POST = 7
const RAILS = [76, 38] // upper, lower — a sheet hangs from each rail's mid height
const PLINTH = 6, LIP = { v0: 26, vd: 8, wh: 2.5 }

const SHEET = { w: 68, h: 34, lean: 8 }
const RAD = Math.PI / 180
const SIN = Math.sin(SHEET.lean * RAD)
const COS = Math.cos(SHEET.lean * RAD)
const DOWN = [0, SIN, -COS] // one sheet unit, downward on the page
const COLUMNS = [12, 88]
const V_TOP = 26.6 // the sheet's top edge, just in front of the rail face
const MAST = 8
const COVER = { su0: 4, su1: 64, sv0: 11, sv1: 27.5 }
const RULES = [29.3, 31.5]
const CLIPS = [22, 48]

const esc = (text) => String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/** A point on a sheet: su across, sv down from the rail. */
const sheetAt = (u0, w0, su, sv) => [u0 + su, V_TOP + sv * SIN, w0 - sv * COS]

/** A straight line in the frame, e.g. a headline rule. */
function rule(a, b, P) {
  return k.lineSvg(k.pathOf([k.iso(F.at(...a), P), k.iso(F.at(...b), P)]), { tone: 'faint' })
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

/** One hung issue: paper, cover block, photo, masthead, number, rules, clips. */
function sheetSvg(issue, index, u0, w0, P) {
  const at = (su, sv) => sheetAt(u0, w0, su, sv)
  const quad = (su0, sv0, su1, sv1) => facePath(F, [at(su0, sv0), at(su1, sv0), at(su1, sv1), at(su0, sv1)], P)
  const paper = quad(0, 0, SHEET.w, SHEET.h)
  const out = [`<g class="home-issue-sheet-group" data-index="${index}">`]

  out.push(`<path class="home-issue-sheet" d="${paper}"/>`)
  out.push(k.lineSvg(paper, { tone: 'hi' }))

  // the block sits behind the photo: a grey page until the pointer lands
  out.push(`<path class="home-issue-cover" d="${quad(COVER.su0, COVER.sv0, COVER.su1, COVER.sv1)}"/>`)
  if (issue.cover) {
    out.push(`<image class="home-issue-photo" href="${esc(issue.cover)}" width="${COVER.su1 - COVER.su0}" height="${COVER.sv1 - COVER.sv0}" preserveAspectRatio="xMidYMid slice" transform="${faceMatrix(F, at(COVER.su0, COVER.sv0), [1, 0, 0], DOWN, P)}"/>`)
  }

  // masthead along the top edge, clear of the cover
  out.push(`<path class="home-issue-mast" d="${quad(0, 0, SHEET.w, MAST)}"/>`)
  out.push(`<g class="home-issue-number">${k.faceTextSvg(faceMatrix(F, at(3.5, 6.4), [1, 0, 0], DOWN, P), issue.number || '', { size: 4.4, tone: 'hi' })}</g>`)

  // two headline rules under the cover
  RULES.forEach((sv, i) => {
    out.push(rule(at(4, sv), at(SHEET.w - 10 - i * 12, sv), P))
  })

  // clips straddle the rail and hold the paper's top edge
  for (const cu of CLIPS) {
    out.push(boxSvg(F, { u: u0 + cu - 2.5, v: 21, w: w0 - 5, uw: 5, vd: 7, wh: 8.5 }, P, { tone: 'mid' }))
  }

  out.push('</g>')
  return out.join('')
}

export function buildNewsrack(P, options = {}) {
  const issues = options.issues || []
  const out = []

  // backboard, the farthest thing in the frame
  const panel = facePath(F, [[POST, 4.5, PLINTH], [W - POST, 4.5, PLINTH], [W - POST, 4.5, 90], [POST, 4.5, 90]], P)
  out.push(`<path class="iso-shade" data-shade="1" d="${panel}"/>`)
  out.push(k.lineSvg(panel, { tone: 'faint' }))

  // the plinth everything stands on
  out.push(boxSvg(F, { u: 0, v: 0, w: 0, uw: W, vd: D, wh: PLINTH }, P, { tone: 'lo' }))

  // two posts, each capped with a knurled knob
  for (const u of [0, W - POST]) {
    out.push(boxSvg(F, { u, v: 2, w: PLINTH, uw: POST, vd: D - 4, wh: H - PLINTH }, P, { tone: 'mid' }))
    out.push(cap(u + POST / 2, P))
  }

  // the two rails, spanning the posts
  for (const w of RAILS) {
    out.push(boxSvg(F, { u: POST, v: 20, w, uw: W - POST * 2, vd: 6, wh: 4 }, P, { tone: 'mid' }))
  }

  // four issues, two per rail, painted far to near
  const slots = []
  RAILS.forEach((w, rail) => COLUMNS.forEach((u0, column) => slots.push({ u0, w0: w + 2, index: rail * 2 + column })))
  slots
    .map((slot) => ({ ...slot, depth: k.depthOf(F.at(slot.u0 + SHEET.w / 2, V_TOP + 17 * SIN, slot.w0 - 17 * COS), P) }))
    .sort((a, b) => a.depth - b.depth)
    .forEach((slot) => {
      const issue = issues[slot.index] || {}
      const label = issue.label || issue.number || ''
      out.push(`<a class="home-issue" data-index="${slot.index}" href="${esc(issue.href || '#')}" aria-label="${esc(label)}"><title>${esc(label)}</title>`)
      out.push(sheetSvg(issue, slot.index, slot.u0, slot.w0, P))
      out.push('</a>')
    })

  // front lip last: the papers hang down behind it
  out.push(boxSvg(F, { u: POST, v: LIP.v0, w: PLINTH, uw: W - POST * 2, vd: LIP.vd, wh: LIP.wh }, P, { tone: 'mid' }))
  for (const u of [10, W - 10]) out.push(screw(u, P))

  return out.join('')
}

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
  return out
}
