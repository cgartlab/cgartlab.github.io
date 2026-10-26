import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'
import { boxSvg, faceMatrix, facePath, frameOf } from './frame.mjs'

/**
 * Module 04 — the machined tool case that carries "资源".
 *
 * The case is shut when the reader meets it: a latched slab lying on the rim.
 * Opening it is the whole point — the lid is a real hinged group standing up
 * behind the body, tipped fifteen degrees past vertical so the inner face
 * turns toward the camera, with a folding stay holding it there. Three fitted
 * trays — tools / learning / people — sit in the well, and the tools strapped
 * to the lid face are the ones the trays talk about.
 *
 * Painter order is the case's own depth: lid and its tools first (furthest),
 * then the hinge, the body, the far wall, the well floor, the trays, the near
 * wall, the stay — and the shut lid last of all, so it covers the whole
 * interior while the case is closed.
 */

const SHELL = { x: -84, y: -37, w: 168, d: 74, r: 6 }
const WALL = 5, BASE_H = 23, LID_H = 70, LID_TH = 7
const FLOOR_Z = TOP + BASE_H, RIM_Z = TOP + 30, HINGE_Z = TOP + 27, LID_TOP = RIM_Z + LID_TH
const BACK = SHELL.y, FRONT = SHELL.y + SHELL.d
const LID = frameOf({ pitch: 105, origin: [0, BACK, HINGE_Z] })
const IN = { x0: -79, y0: -32, x1: 79, y1: 32 }
const TRAY_X = [[-79, -5], [-3, 37], [39, 79]]
const TRAY_MID = TRAY_X.map(([a, b]) => (a + b) / 2)
const DIVIDERS = [-5, 37]

const solid = (plan, z, h, P, tone = 'mid', steps = 4, bevel = 0.5) => k.solidSvg(k.slabOf(plan, z, h, P, steps, bevel), { tone })

/** Fill an already-projected path with one of the four shades. */
const paint = (d, shade, tone = 'faint') => `<path class="iso-shade" data-shade="${shade}" d="${d}"/>${k.lineSvg(d, { tone })}`

const faceQuad = (pts, P, shade, tone) => paint(k.pathOf(pts.map((p) => k.iso(p, P)), true), shade, tone)
const topRect = (x0, y0, x1, y1, z, P, shade, tone) => faceQuad([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], P, shade, tone)
const frontRect = (x0, z0, x1, z1, y, P, shade, tone) => faceQuad([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], P, shade, tone)
/** A rounded plan filled in one shade, lying at height z. */
const topPlan = (plan, z, P, shade, tone) => paint(k.pathOf(k.ringOf(plan, 5).map(([x, y]) => k.iso([x, y, z], P)), true), shade, tone)

// ---- the lid ------------------------------------------------------------

/** A rotated rectangle on the lid's face, from (u0, v0) to (u1, v1). */
function lidBar([u0, v0], [u1, v1], half, w, P) {
  const [du, dv] = [u1 - u0, v1 - v0]
  const len = Math.hypot(du, dv) || 1
  const [nu, nv] = [(-dv / len) * half, (du / len) * half]
  return facePath(LID, [[u0 + nu, v0 + nv, w], [u1 + nu, v1 + nv, w], [u1 - nu, v1 - nv, w], [u0 - nu, v0 - nv, w]], P)
}

const lidPoly = (pts, w, P) => facePath(LID, pts.map(([u, v]) => [u, v, w]), P)
const lidInk = (d) => `<path class="iso-shade" data-shade="0" d="${d}"/>${k.lineSvg(d, { tone: 'hi' })}`

/** A strap over a tool: a shallow box with a dark face, so it reads as leather. */
function strap(u, v0, v1, P) {
  const face = facePath(LID, [[u, v0, -4.62], [u + 4.4, v0, -4.62], [u + 4.4, v1, -4.62], [u, v1, -4.62]], P)
  return boxSvg(LID, { u, v: v0, w: -4.6, uw: 4.4, vd: v1 - v0, wh: 1.6 }, P, { tone: 'lo' }) + paint(face, 0, 'lo')
}

function lidSvg(P) {
  const w = -3.1
  const out = ['<g class="home-case-lid">']
  out.push(boxSvg(LID, { u: -84, v: 0, w: -2, uw: 168, vd: LID_H, wh: 4 }, P, { tone: 'mid' }))
  out.push(paint(lidPoly([[-76, 7], [76, 7], [76, 63], [-76, 63]], -2.6, P), 1))
  out.push('<g class="home-case-tools">')

  // screwdriver: turned handle, shaft, blade — spanner: a bar with an open jaw
  for (const d of [
    lidPoly([[-72, 45], [-68, 42], [-52, 42], [-48, 45], [-48, 50], [-52, 53], [-68, 53], [-72, 50]], w, P),
    lidBar([-48, 47.5], [-9, 47.5], 1.6, w, P),
    lidPoly([[-9, 45.9], [-2, 46.7], [-2, 48.3], [-9, 49.1]], w, P),
    lidBar([8, 47.5], [66, 47.5], 2.6, w, P),
    lidPoly([[62, 42], [76, 42], [76, 45.6], [69, 45.6], [69, 49.4], [76, 49.4], [76, 53], [62, 53]], w, P),
  ]) out.push(lidInk(d, P))
  out.push(strap(-64, 39, 56, P), strap(-26, 43, 52, P), strap(16, 41, 54, P), strap(46, 41, 54, P))

  // pliers: two crossed arms, jaws splayed at the far end
  for (const [a, b] of [[[-58, 16], [-12, 29]], [[-58, 29], [-12, 16]], [[-13, 28.6], [-4, 31.4]], [[-13, 16.4], [-4, 13.6]]])
    out.push(lidInk(lidBar(a, b, 1.9, w, P), P))
  out.push(strap(-48, 11, 34, P), strap(-20, 11, 34, P))

  // stencil in the empty corner of the panel
  out.push(k.faceTextSvg(faceMatrix(LID, [8, 13, -2.9], [1, 0, 0], [0, -1, 0], P), 'FIELD KIT · 04', { size: 3.6, tone: 'lo' }))
  out.push('</g></g>')
  return out.join('')
}

// ---- the shut lid -------------------------------------------------------
//
// The case the reader first meets is shut. This is the lid as it reads then:
// 168 × 74 lying flat on the rim, a seam down its length, two hasps clasping
// the shell's latch plate and a carry handle folded onto the top. It stays
// shut while the case assembles and only then hands over to the hinged lid, so
// the case really does open instead of fading in.

const HASPS = [-8.8, 3.4]
const HASP_W = 5.4

/** One hasp: a tongue off the lid's front edge, dropping over the latch plate. */
function haspSvg(x, P) {
  const plan = { x, y: FRONT - 0.2, w: HASP_W, d: 2.4, r: 0.8 }
  const out = [solid(plan, RIM_Z - 3.4, LID_TH + 3.6, P, 'mid', 4, 0.5)]
  out.push(k.lineSvg(k.planOutline(k.insetPlan(plan, 0.9), LID_TOP + 0.35, P, 4), { tone: 'faint' }))
  // the rivet that holds the tongue to the lid
  out.push(k.lineSvg(G.circleOf(G.frameAlong([x + HASP_W / 2, FRONT + 2.25, RIM_Z + 3.4], [0, 1, 0]), 0, 1.1, P), { tone: 'faint' }))
  return out.join('')
}

function closedLidSvg(P) {
  const out = ['<g class="home-case-closed">']
  // the slab: full footprint of the case, sitting exactly on the rim
  out.push(solid(SHELL, RIM_Z, LID_TH, P, 'mid', 6, 1.2))
  // a pressed panel across the back of the top, so it is not a blank face
  out.push(topPlan({ x: -75, y: -31, w: 150, d: 40, r: 5 }, LID_TOP + 0.05, P, 2, 'faint'))
  // the seam, down the length of the lid: a groove with a lit lip behind it
  out.push(topRect(-82.5, 19.4, 82.5, 24.2, LID_TOP + 0.06, P, 0, 'faint'))
  out.push(k.lineSvg(k.lineOnTop([-82.5, 19.1], [82.5, 19.1], LID_TOP + 0.1, P), { tone: 'hi' }))
  // the carry handle, folded down onto the top: two posts, a grip between them
  for (const x of [-27, 21.4]) out.push(solid({ x, y: 2.8, w: 5.6, d: 4.2, r: 1.2 }, LID_TOP, 4.2, P, 'mid', 4, 0.4))
  out.push(solid({ x: -23.6, y: 3.4, w: 47.2, d: 3, r: 1.5 }, LID_TOP + 4.2, 3.8, P, 'hi', 6, 0.8))
  // two screws at the front corners of the lid
  for (const x of [-76, 76]) out.push(k.lineSvg(k.ring(x, 28, 1.6, LID_TOP + 0.1, P, 16), { tone: 'faint' }))
  // the hasps last, so they read as clasping over the lid's front edge
  for (const x of HASPS) out.push(haspSvg(x, P))
  out.push('</g>')
  return out.join('')
}

// ---- the stay ------------------------------------------------------------
//
// A folding arm from the back rim up to a bracket on the lid's inner face, so
// the lid reads as held open rather than floating. Two things decide its
// geometry. It has to stand proud of the face, because the lid leans fifteen
// degrees back and anything bolted flush to it would be swallowed by it. And
// it has to fold in x, because the camera looks straight down the y axis, so a
// knee in the y–z plane would project to a straight vertical line.

const STAY_U = 79.5
const STAY_FOOT = [76.5, -33, RIM_Z + 2.4]
const STAY_ELBOW = [82.2, -33.4, RIM_Z + 16.5]
const STAY_HEAD = [STAY_U, -42.8, RIM_Z + 32.3]

/** A thin bar between two points, as a prism with a flat rectangular section. */
function stayBar(from, to, P) {
  const axis = [to[0] - from[0], to[1] - from[1], to[2] - from[2]]
  const [halfW, halfT] = [1.7, 0.75]
  const section = [[-halfT, -halfW], [halfT, -halfW], [halfT, halfW], [-halfT, halfW]]
  return k.solidSvg(G.prismOf(G.frameAlong(from, axis), section, 0, Math.hypot(...axis), P), { tone: 'mid' })
}

/** A pivot pin: a short barrel along `axis`, protruding toward the camera. */
function pinSvg(at, r, len, axis, P) {
  return k.solidSvg(G.disc(0, len, r, G.frameAlong(at, axis), P), { tone: 'lo' })
}

function staySvg(P) {
  const out = ['<g class="home-case-prop">']
  // the foot: a bracket bolted to the back rim, with its hinge barrel
  out.push(solid({ x: STAY_FOOT[0] - 3.1, y: BACK + 0.6, w: 6.2, d: 4.2, r: 1.2 }, RIM_Z, 2.6, P, 'mid', 4, 0.4))
  out.push(pinSvg([STAY_FOOT[0] - 2.6, STAY_FOOT[1], STAY_FOOT[2]], 1.5, 5.2, [1, 0, 0], P))
  out.push(stayBar(STAY_FOOT, STAY_ELBOW, P))
  out.push(stayBar(STAY_ELBOW, STAY_HEAD, P))
  // the fold: a rivet through the elbow, facing the reader
  out.push(pinSvg([STAY_ELBOW[0], STAY_ELBOW[1] + 0.4, STAY_ELBOW[2]], 1.8, 2, [0, 1, 0], P))
  // the head bracket, bolted to the lid's inner face
  out.push(boxSvg(LID, { u: 76.2, v: 32, w: -3.8, uw: 6.6, vd: 7.2, wh: 1.5 }, P, { tone: 'mid' }))
  out.push('</g>')
  return out.join('')
}

// ---- the trays ----------------------------------------------------------
//
// The three trays are the three sections of the 资源 page, in order: the tools,
// the learning and the people. Each holds one kind of object rather than a
// mixed bag of stationery, so the case reads as a kit of what the page links
// to — a sheet of app badges, a clipped memo pad and a notebook, a fan of
// visiting cards. Everything is seated: the badges lie on their board, the pad
// and the book stand on the tray floor, the cards stand in their slot.

const num = (n) => Number(n.toFixed(3))

// --- the badge glyphs ---
//
// A glyph is drawn in a ±2 box with y up, then mapped onto the tile. The tile
// is a real horizontal plane, and a mark printed on it would collapse to a
// third of its height at this camera elevation — a smear at six units across.
// The glyph therefore keeps twice the plane's foreshortening, which fills the
// tile exactly and still reads as a mark rather than a decal facing the lens.

const ink = (d) => `<path class="iso-shade" data-shade="0" d="${d}"/>`
const cut = (d) => `<path class="iso-top" d="${d}"/>`
const trace = (d) => `<path class="iso-line home-case-glyph" data-tone="hi" d="${d}"/>`

const GLYPHS = [
  // Figma — a pen nib
  () => [ink('M-1.55 1.95 L1.55 1.95 L0 -1.95 Z'), cut('M-0.16 1.95 L0.16 1.95 L0.16 0.5 L-0.16 0.5 Z')],
  // ColorHunt — a map pin
  () => [
    ink('M0 2 C0.63 2 1.15 1.48 1.15 0.85 C1.15 0.22 0.63 -0.3 0 -0.3 C-0.63 -0.3 -1.15 0.22 -1.15 0.85 C-1.15 1.48 -0.63 2 0 2 Z'),
    ink('M-0.95 0.6 L0.95 0.6 L0 -2 Z'),
    cut('M0 1.3 C0.25 1.3 0.45 1.1 0.45 0.85 C0.45 0.6 0.25 0.4 0 0.4 C-0.25 0.4 -0.45 0.6 -0.45 0.85 C-0.45 1.1 -0.25 1.3 0 1.3 Z'),
  ],
  // OpenCode — a terminal chevron
  () => [trace('M-1.7 1.35 L-0.35 0.05 L-1.7 -1.25'), trace('M0.45 -1.2 L1.8 -1.2')],
  // VSCode — angle brackets
  () => [trace('M-0.65 1.65 L-1.9 0 L-0.65 -1.65'), trace('M0.65 1.65 L1.9 0 L0.65 -1.65')],
  // Obsidian — a crystal
  () => [ink('M0 2 L1.4 0.55 L0 -2 L-1.4 0.55 Z'), cut('M-1.4 0.55 L1.4 0.55 L1.15 0.85 L-1.15 0.85 Z')],
  // Docker — containers on a base
  () => [ink('M-1.95 -1.35 L1.95 -1.35 L1.95 -0.8 L-1.95 -0.8 Z'), ink('M-1.85 -0.55 L-0.75 -0.55 L-0.75 0.45 L-1.85 0.45 Z'), ink('M-0.55 -0.55 L0.55 -0.55 L0.55 0.45 L-0.55 0.45 Z'), ink('M0.75 -0.55 L1.85 -0.55 L1.85 0.45 L0.75 0.45 Z')],
  // PVE — a shield
  () => [ink('M0 2 L1.75 1.25 L1.75 -0.25 C1.75 -1.3 0.9 -1.8 0 -2.05 C-0.9 -1.8 -1.75 -1.3 -1.75 -0.25 L-1.75 1.25 Z'), cut('M-0.85 0.5 L0 -0.4 L0.85 0.5 L0.5 0.82 L0 0.26 L-0.5 0.82 Z')],
  // Cinema 4D — a cube
  () => [trace('M0 2 L1.7 1 L1.7 -1 L0 -2 L-1.7 -1 L-1.7 1 Z'), trace('M0 2 L0 0 L1.7 -1'), trace('M0 0 L-1.7 -1')],
  // After Effects — a play triangle
  () => [ink('M-1.3 1.9 L1.8 0 L-1.3 -1.9 Z')],
  // Photoshop — a palette
  () => [ink('M0 1.95 C1.08 1.95 1.95 1.08 1.95 0 C1.95 -1.08 1.08 -1.95 0 -1.95 C-1.08 -1.95 -1.95 -1.08 -1.95 0 C-1.95 1.08 -1.08 1.95 0 1.95 Z'), cut('M-1.05 0.55 L-0.65 0.95 L-0.25 0.55 L-0.65 0.15 Z'), cut('M0.35 0.9 L0.7 1.25 L1.05 0.9 L0.7 0.55 Z'), cut('M-0.3 -0.15 L0.05 0.2 L0.4 -0.15 L0.05 -0.5 Z')],
]

function glyphSvg(cx, cy, z, parts, P) {
  const o = k.iso([cx, cy, z], P)
  const edge = k.iso([cx + 1, cy, z], P)
  const sx = edge[0] - o[0]
  const sy = sx * 0.62
  return `<g class="home-case-glyph-mark" transform="matrix(${num(sx)} 0 0 ${num(-sy)} ${num(o[0])} ${num(o[1])})">${parts.join('')}</g>`
}

// --- left: the sheet of app badges ---------------------------------------

const SHEET = { x: -76, y: -30, w: 68, d: 32, r: 1.6 }
const SHEET_H = 1.8
const BADGE = 9
const BADGE_H = 1.8
const BADGE_COLS = 5
const BADGE_PITCH = [13.8, 13.6]
const BADGE_GRID = [-42, -18.6]

function leftTray(P) {
  const z = FLOOR_Z
  const out = []
  // a stiff board lying in the tray: dark face, lit rim, so it reads as a
  // panel set into the well rather than another patch of tray floor
  out.push(solid(SHEET, z, SHEET_H, P, 'mid', 5, 0.6))
  out.push(`<path class="home-case-board" d="${k.planOutline(SHEET, z + SHEET_H + 0.04, P, 5)}"/>`)
  out.push(k.lineSvg(k.planOutline(SHEET, z + SHEET_H + 0.06, P, 5), { tone: 'mid' }))
  // a printed rule across the front margin of the board
  out.push(k.lineSvg(k.segment([-73, -0.9, z + SHEET_H + 0.07], [-11, -0.9, z + SHEET_H + 0.07], P), { tone: 'lo' }))

  const rows = Math.ceil(GLYPHS.length / BADGE_COLS)
  const x0 = BADGE_GRID[0] - ((BADGE_COLS - 1) * BADGE_PITCH[0]) / 2
  const y0 = BADGE_GRID[1] - ((rows - 1) * BADGE_PITCH[1]) / 2
  GLYPHS.forEach((glyph, index) => {
    const cx = x0 + (index % BADGE_COLS) * BADGE_PITCH[0]
    const cy = y0 + Math.floor(index / BADGE_COLS) * BADGE_PITCH[1]
    const plan = { x: cx - BADGE / 2, y: cy - BADGE / 2, w: BADGE, d: BADGE, r: 1.35 }
    // the shadow it casts on the board, then the tile, then the mark
    out.push(`<path class="home-case-badge-shadow" d="${k.planOutline({ ...plan, x: plan.x + 0.85, y: plan.y + 1.4 }, z + SHEET_H + 0.08, P, 4)}"/>`)
    out.push(solid(plan, z + SHEET_H, BADGE_H, P, 'mid', 4, 0.55))
    out.push(glyphSvg(cx, cy, z + SHEET_H + BADGE_H + 0.02, glyph(), P))
  })
  return out.join('')
}

// --- middle: the memo pad and the notebook -------------------------------

const MEMO = { x: -1.4, y: -29.6, w: 17, d: 35, r: 0.8 }
const MEMO_H = 3.2
const MEMO_SHEETS = 6
const BOOK = { x: 20.4, y: -29, w: 15.4, d: 34.4, r: 0.9 }
const BOOK_H = 2.2

function memoPad(P) {
  const z = FLOOR_Z
  const out = [solid(MEMO, z, MEMO_H, P, 'mid', 4, 0.4)]
  // the block: the sheet edges read as lines down the near face
  for (let i = 1; i < MEMO_SHEETS; i++)
    out.push(k.lineSvg(k.segment([MEMO.x + 0.5, MEMO.y + MEMO.d, z + (i * MEMO_H) / MEMO_SHEETS], [MEMO.x + MEMO.w - 0.5, MEMO.y + MEMO.d, z + (i * MEMO_H) / MEMO_SHEETS], P), { tone: 'lo' }))

  // the top sheet, torn along its near edge and left ragged over the block
  const front = MEMO.y + MEMO.d
  const ring = [[MEMO.x, MEMO.y], [MEMO.x + MEMO.w, MEMO.y], [MEMO.x + MEMO.w, front + 1]]
  const tears = 8
  for (let i = 1; i <= tears; i++) {
    const t = i / tears
    ring.push([MEMO.x + MEMO.w - t * MEMO.w, front + (i === tears ? 0.4 : i % 2 ? 2 : 0.45)])
  }
  out.push(k.solidSvg(k.extrude(ring, z + MEMO_H, 0.42, P, { convex: false }), { tone: 'mid' }))
  const paper = z + MEMO_H + 0.46
  for (const y of [-23.5, -18, -12.5])
    out.push(k.lineSvg(k.segment([MEMO.x + 1.8, y, paper], [MEMO.x + MEMO.w - 1.8, y, paper], P), { tone: 'faint' }))

  // the bulldog clip, clamping the bound edge at the back
  out.push(solid({ x: 4.4, y: MEMO.y - 0.4, w: 6.8, d: 3.4, r: 1 }, paper, 1.3, P, 'mid', 4, 0.4))
  out.push(topPlan({ x: 4.4, y: MEMO.y - 0.4, w: 6.8, d: 3.4, r: 1 }, paper + 1.34, P, 0, 'mid'))
  for (const dx of [0.5, 4.9])
    out.push(topRect(4.4 + dx, MEMO.y + 1.6, 4.4 + dx + 1.4, MEMO.y + 2.6, paper + 1.36, P, 2, 'mid'))
  return out.join('')
}

function notebookSvg(P) {
  const z = FLOOR_Z
  const out = [solid(BOOK, z, BOOK_H, P, 'mid', 4, 0.5)]
  // the spine, down the left edge and proud of the cover
  const spine = { x: 19.5, y: BOOK.y + 0.5, w: 2.4, d: BOOK.d - 1, r: 1.1 }
  out.push(solid(spine, z, BOOK_H + 0.7, P, 'mid', 5, 0.5))
  out.push(topPlan(spine, z + BOOK_H + 0.74, P, 2, 'mid'))
  // the cover line, inset from the edges
  out.push(k.lineSvg(k.planOutline({ x: BOOK.x + 2.6, y: BOOK.y + 2.2, w: BOOK.w - 4.2, d: BOOK.d - 4.4, r: 0.6 }, z + BOOK_H + 0.06, P, 4), { tone: 'faint' }))
  // the page block, seen as lines under the cover
  for (let i = 1; i <= 3; i++)
    out.push(k.lineSvg(k.segment([BOOK.x + 1.2, BOOK.y + BOOK.d, z + i * 0.42], [BOOK.x + BOOK.w - 1.2, BOOK.y + BOOK.d, z + i * 0.42], P), { tone: 'lo' }))

  // the ribbon: lying back along the cover, then over the front edge
  const ribbon = { x: 26.4, y: -12.5, w: 1.9, d: 19.4, r: 0.2 }
  out.push(solid(ribbon, z + BOOK_H, 0.26, P, 'lo', 3, 0.1))
  out.push(topPlan(ribbon, z + BOOK_H + 0.3, P, 2, 'faint'))
  const lip = BOOK.y + BOOK.d + 0.06
  out.push(paint(k.pathOf([[26.4, lip, z + 1.1], [27.35, lip, z + 0.45], [28.3, lip, z + 1.1], [28.3, lip, z + BOOK_H + 0.1], [26.4, lip, z + BOOK_H + 0.1]].map((p) => k.iso(p, P)), true), 2, 'mid'))
  return out.join('')
}

function middleTray(P) {
  return memoPad(P) + notebookSvg(P)
}

// --- right: the visiting cards -------------------------------------------

const CARD_W = 9, CARD_H = 9.8, CARD_T = 0.9, CARD_Z = FLOOR_Z + 0.4

/** A ribbon folded over the top edge of a card: the tail stands behind it. */
function ribbonBack(F, dx, P) {
  const hw = 0.75
  return paint(facePath(F, [[dx - hw, -0.47, CARD_H], [dx + hw, -0.47, CARD_H], [dx + hw, -0.47, CARD_H + 1.7], [dx - hw, -0.47, CARD_H + 1.7]], P), 1, 'mid')
}

function ribbonFront(F, dx, P) {
  const hw = 0.75
  const fold = paint(facePath(F, [[dx - hw, -0.47, CARD_H], [dx + hw, -0.47, CARD_H], [dx + hw, 0.47, CARD_H], [dx - hw, 0.47, CARD_H]], P), 2, 'mid')
  const hang = paint(facePath(F, [[dx - hw, 0.49, CARD_H - 2.4], [dx, 0.49, CARD_H - 1.7], [dx + hw, 0.49, CARD_H - 2.4], [dx + hw, 0.49, CARD_H], [dx - hw, 0.49, CARD_H]], P), 1, 'mid')
  return fold + hang
}

function card(cx, cy, yaw, tab, ribbon, P) {
  const F = frameOf({ yaw, origin: [cx, cy, CARD_Z] })
  const face = 0.47
  const out = []
  if (ribbon !== null)
    out.push(ribbonBack(F, ribbon, P))
  out.push(boxSvg(F, { u: -CARD_W / 2, v: -CARD_T / 2, w: 0, uw: CARD_W, vd: CARD_T, wh: CARD_H }, P, { tone: 'mid' }))
  // the printed face: paper, with an avatar block, a name band and two rules
  const front = facePath(F, [[-CARD_W / 2, face, 0], [CARD_W / 2, face, 0], [CARD_W / 2, face, CARD_H], [-CARD_W / 2, face, CARD_H]], P)
  out.push(`<path class="iso-top" d="${front}"/>${k.lineSvg(front, { tone: 'mid' })}`)
  out.push(paint(facePath(F, [[-3.5, face, 6.7], [-0.9, face, 6.7], [-0.9, face, 9.1], [-3.5, face, 9.1]], P), 2, 'mid'))
  out.push(paint(facePath(F, [[0.1, face, 7.8], [3.9, face, 7.8], [3.9, face, 8.8], [0.1, face, 8.8]], P), 1, 'faint'))
  out.push(k.lineSvg(k.segment(F.at(-3.6, face, 5.6), F.at(3.6, face, 5.6), P), { tone: 'faint' }))
  out.push(paint(facePath(F, [[-3.6, face, 4.3], [1.6, face, 4.3], [1.6, face, 4.9], [-3.6, face, 4.9]], P), 3, 'faint'))
  // the tab above the top edge
  out.push(boxSvg(F, { u: tab ? 1.5 : -4.1, v: -CARD_T / 2, w: CARD_H, uw: 2.6, vd: CARD_T, wh: 1.7 }, P, { tone: 'mid' }))
  if (ribbon !== null)
    out.push(ribbonFront(F, ribbon, P))
  return out.join('')
}

function rightTray(P) {
  const out = [topRect(41, -26.5, 77, -13, FLOOR_Z + 0.3, P, 0, 'lo')]
  // the lip the cards stand against
  out.push(solid({ x: 41, y: -28.2, w: 36, d: 1.9, r: 0.6 }, FLOOR_Z, 2.6, P, 'mid', 4, 0.4))
  // fanned left to right, so each card stands in front of the one before it;
  // two of them carry a ribbon folded over the top edge
  const row = [
    [44.6, -23.4, -11, true, null],
    [51.4, -21.4, -5.5, false, null],
    [58.2, -19.4, 0, true, -2.6],
    [65, -17.4, 5.5, false, null],
    [71.8, -15.4, 11, true, 2.6],
  ]
  for (const [cx, cy, yaw, tab, ribbon] of row)
    out.push(card(cx, cy, yaw, tab, ribbon, P))
  return out.join('')
}

// ---- the case -----------------------------------------------------------
//
// The case assembles itself in four beats. `--step` carries the order for the
// shared settle contract in home.css; toolbox.css replaces that generic settle
// with the real mechanism (the shell rises off the deck, the three trays drop
// into their seats one after another, the front wall and its latch close the
// case up last, while the shut slab rides the rim until it hands over to the
// hinged lid).
//
// The groups are contiguous runs of what already painted together, so the
// split changes no painter's order — only which assembly a path belongs to.
// The lid, its tools, the stay and the shut lid keep their own animations and
// are wrapped around, never marked.

const STEPS = { shell: 0, trays: 1, front: 2, closed: 3 }

const part = (name, inner) =>
  `<g class="home-part" data-part="${name}" style="--step:${STEPS[name]}">${inner.join('')}</g>`

export function buildToolbox(P, options = {}) {
  const labels = options.labels || ['TOOLS', 'LEARN', 'PEOPLE']
  const shell = []
  const trays = []
  const front = []
  const closed = []

  // a thick machined base, so the trays sit in a shallow well
  shell.push(solid(SHELL, TOP, BASE_H, P, 'mid', 6, 1.2))
  // far wall with its shaded inner face, and the two side walls
  shell.push(solid({ x: SHELL.x, y: BACK, w: SHELL.w, d: WALL, r: 1 }, FLOOR_Z, RIM_Z - FLOOR_Z, P, 'mid'))
  shell.push(faceQuad([[-79, BACK + WALL - 0.2, FLOOR_Z], [79, BACK + WALL - 0.2, FLOOR_Z], [79, BACK + WALL - 0.2, RIM_Z], [-79, BACK + WALL - 0.2, RIM_Z]], P, 1))
  for (const z of [99.5, 101.8]) shell.push(k.lineSvg(k.segment([-78, BACK + WALL - 0.1, z], [78, BACK + WALL - 0.1, z], P), { tone: 'faint' }))
  for (const x of [SHELL.x, SHELL.x + SHELL.w - WALL]) shell.push(solid({ x, y: BACK, w: WALL, d: SHELL.d, r: 1 }, FLOOR_Z, RIM_Z - FLOOR_Z, P, 'mid'))
  // hinge knuckles: two machined blocks on the back rim, at the lid's foot
  for (const x of [-64, 50]) {
    shell.push(solid({ x, y: BACK + 0.6, w: 14, d: 4.6, r: 1.4 }, RIM_Z, 2.6, P, 'mid', 4, 0.4))
    shell.push(k.lineSvg(k.segment([x + 4.4, BACK + 0.6, RIM_Z + 2.65], [x + 4.4, BACK + 5.1, RIM_Z + 2.65], P), { tone: 'lo' }))
  }
  // the well floor, then the two dividers that make the three trays
  shell.push(topRect(IN.x0, IN.y0, IN.x1, IN.y1, FLOOR_Z + 0.06, P, 0))
  for (const x of DIVIDERS) shell.push(solid({ x, y: IN.y0, w: 2, d: IN.y1 - IN.y0, r: 0.5 }, FLOOR_Z, RIM_Z - FLOOR_Z, P, 'mid'))

  // the three trays, each its own group so each can be seated separately
  for (const [i, tray] of [leftTray, middleTray, rightTray].entries())
    trays.push(`<g class="home-case-tray" data-index="${i}">${tray(P)}</g>`)

  // the near wall last: it closes the case and hides the near half of the trays
  front.push(solid({ x: SHELL.x, y: IN.y1, w: SHELL.w, d: WALL, r: 1 }, TOP, RIM_Z - TOP, P, 'mid', 4, 1))
  front.push(k.lineSvg(k.planOutline(k.insetPlan(SHELL, 3.6), RIM_Z + 0.5, P, 6), { tone: 'faint' }))
  front.push(k.lineSvg(k.planOutline({ x: IN.x0, y: IN.y0, w: IN.x1 - IN.x0, d: IN.y1 - IN.y0, r: 2 }, RIM_Z + 0.4, P, 4), { tone: 'faint' }))

  // front latch with its slot, and the carry handle on two mounts
  front.push(solid({ x: -10, y: FRONT - 2.2, w: 20, d: 2.4, r: 1 }, TOP + 22, 7, P, 'mid', 4, 0.5))
  front.push(frontRect(-4.5, TOP + 24.5, 4.5, TOP + 26.5, FRONT + 0.3, P, 0, 'lo'))
  for (const x of [-25, 19]) front.push(solid({ x, y: FRONT - 0.6, w: 6, d: 4.6, r: 1 }, TOP + 1, 8, P, 'mid'))
  front.push(solid({ x: -21, y: FRONT + 1.2, w: 42, d: 3.4, r: 1.6 }, TOP + 3.5, 6, P, 'hi', 6, 0.8))
  // three engraved nameplates, one per tray, each with its label
  TRAY_X.forEach(([a, b]) => front.push(k.lineSvg(k.pathOf([[a + 3, FRONT + 0.2, TOP + 11], [b - 3, FRONT + 0.2, TOP + 11], [b - 3, FRONT + 0.2, TOP + 19], [a + 3, FRONT + 0.2, TOP + 19]].map((p) => k.iso(p, P)), true), { tone: 'faint' })))
  TRAY_MID.forEach((x, i) => labels[i] && front.push(k.faceTextSvg(k.sideMatrix([x, FRONT], TOP + 15, P, 'left'), labels[i], { size: 2.6, tone: 'faint', anchor: 'middle' })))

  // the shut slab: the only thing in its run, and the last thing painted
  closed.push(closedLidSvg(P))

  // the stay sits in front of the lid's face and on the rim, so it comes after
  // the body; the shut lid comes last of all and covers the whole interior
  return [
    lidSvg(P),
    part('shell', shell),
    part('trays', trays),
    part('front', front),
    staySvg(P),
    part('closed', closed),
  ].join('')
}

export function toolboxBounds() {
  const out = [...k.boxCorners(SHELL, TOP, RIM_Z)]
  for (const u of [-84, 84])
    for (const v of [0, LID_H])
      for (const w of [-4.6, 2]) out.push(LID.at(u, v, w))
  out.push([SHELL.x, FRONT + 4.6, TOP + 3], [SHELL.x + SHELL.w, FRONT + 4.6, TOP + 3])
  return out
}
