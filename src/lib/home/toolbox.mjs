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

function notebook(x, y, w, d, z, P) {
  return solid({ x, y, w, d, r: 1 }, z, 1.4, P, 'mid', 4, 0.4)
    + topRect(x, y, x + w, y + d, z + 1.46, P, 3, 'mid') + topRect(x, y, x + 3, y + d, z + 1.5, P, 0, 'lo')
    + k.lineSvg(k.planOutline({ x: x + 6, y: y + 3, w: w - 9, d: d - 6, r: 1 }, z + 1.52, P, 3), { tone: 'mid' })
}

function card(cx, cy, yaw, tab, P) {
  const F = frameOf({ yaw, origin: [cx, cy, FLOOR_Z + 0.5] })
  const face = facePath(F, [[-5.5, 0.56, 0], [5.5, 0.56, 0], [5.5, 0.56, 10], [-5.5, 0.56, 10]], P)
  return boxSvg(F, { u: -5.5, v: -0.55, w: 0, uw: 11, vd: 1.1, wh: 10 }, P, { tone: 'mid' })
    + `<path class="iso-top" d="${face}"/>${k.lineSvg(face, { tone: 'hi' })}`
    + boxSvg(F, { u: tab ? 2.1 : -5.5, v: -0.55, w: 10, uw: 3.4, vd: 1.1, wh: 2.2 }, P, { tone: 'lo' })
}

function leftTray(P) {
  const z = FLOOR_Z
  const brush = frameOf({ yaw: 34, origin: [-46, -6, z + 3.05] })
  const out = [solid({ x: -77, y: -30, w: 70, d: 54, r: 2 }, z, 3, P, 'mid', 4, 0.6), topRect(-77, -30, -7, 24, z + 3.06, P, 1)]
  // foam block with four cut-outs: pencil, rule, square, brush
  for (const [a, b, c, d] of [[-76, -28, -30, -21], [-76, -19, -13, -11], [-77, -8, -45, -1], [-77, -8, -70, 15]])
    out.push(topRect(a, b, c, d, z + 3.1, P, 0, 'lo'))
  out.push(faceQuad([[-2, -3.6], [35, -3.6], [35, 3.6], [-2, 3.6]].map(([u, v]) => [...brush.at(u, v, 0).slice(0, 2), z + 3.1]), P, 0, 'lo'))

  // pencil: barrel, sharpened tip, one highlight
  out.push(k.solidSvg(G.disc(0, 38, 1.4, G.frameAlong([-74, -24, z + 3.6], [1, 0, 0]), P), { tone: 'hi' }))
  out.push(k.solidSvg(G.solidOf([[0, 1.4], [7, 0.18]], G.frameAlong([-36, -24, z + 3.6], [1, 0, 0]), P), { tone: 'mid' }))
  out.push(k.lineSvg(k.segment([-72, -24, z + 4.9], [-40, -24, z + 4.9], P), { tone: 'faint' }))

  // steel rule, ticks every four units
  out.push(solid({ x: -74, y: -16, w: 60, d: 7, r: 0.4 }, z + 2.8, 0.9, P, 'hi', 3, 0.2))
  for (let i = 0; i <= 13; i++)
    out.push(k.lineSvg(k.segment([-70 + i * 4, -15.4, z + 3.75], [-70 + i * 4, i % 3 ? -13 : -11.6, z + 3.75], P), { tone: 'mid' }))

  // set square: two bars meeting at a right angle, corner at the back-left
  out.push(solid({ x: -75, y: -7, w: 30, d: 5, r: 0.4 }, z + 2.8, 0.9, P, 'hi', 3, 0.2))
  out.push(solid({ x: -75, y: -7, w: 5, d: 21, r: 0.4 }, z + 2.8, 0.9, P, 'hi', 3, 0.2))

  // brush, laid on the diagonal: handle, ferrule, splayed bristles
  out.push(boxSvg(brush, { u: 0, v: -2, w: 0, uw: 17, vd: 4, wh: 1.5 }, P, { tone: 'mid' }))
  out.push(boxSvg(brush, { u: 17, v: -2.2, w: 0, uw: 4, vd: 4.4, wh: 1.7 }, P, { tone: 'hi' }))
  out.push(paint(facePath(brush, [[21, -2.1, 1.05], [30, -0.9, 1.05], [30, 0.9, 1.05], [21, 2.1, 1.05]], P), 0, 'hi'))
  return out.join('')
}

function middleTray(P) {
  return notebook(-2, -27, 34, 22, FLOOR_Z, P) + notebook(3, -21, 29, 17, FLOOR_Z + 1.4, P)
}

function rightTray(P) {
  const out = [topRect(41, -25, 77, -11, FLOOR_Z + 0.4, P, 0, 'lo')]
  const cards = [[45.5, -23, -10], [54.5, -20.5, -3], [63.5, -18, 4], [72.5, -15.5, 11]]
  cards.forEach(([cx, cy, yaw], i) => out.push(card(cx, cy, yaw, i % 2, P)))
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
