import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 02 — the film projector that carries "作品".
 *
 * There is no screen. The machine stands on the right of the deck with its
 * barrel raised to the upper left, and throws its picture clean off the page:
 * the beam leaves at 45 degrees, and the reel itself is a page-level layer
 * behind the whole page (see `.home-projection` in home.css).
 *
 * Far to near: beam, feet, body, front plate, hump, barrel, gate, reels.
 */

const BODY = { x: 6, y: -26, w: 80, d: 50, r: 7 }
const FOOT = 5
const BZ = TOP + FOOT
const LID = BZ + 44
const FRONT = BODY.y + BODY.d
const HUMP = { x: 10, y: -22, w: 46, d: 20, r: 6 }
const HUMP_FACE = HUMP.y + HUMP.d
const HUMP_TOP = LID + 13
const REEL_Y = 2
const REEL_R = 12
const REEL_Z = HUMP_TOP + REEL_R
const GATE = { x: 16, y: 4, w: 12, d: 4, r: 1 }
const MOUNT = { x: 6, y: -6, w: 14, d: 14, r: 2 }

// the barrel points up and to the left; at azimuth 90 that is 45 degrees on
// screen, which is where the picture has to come from
const MOUTH = [12, 0, LID + 8]
const AIM = (() => {
  const d = [-1, 0, 1.05]
  const len = Math.hypot(...d)
  return [d[0] / len, d[1] / len, d[2] / len]
})()
const BARREL = G.frameAlong(MOUTH, AIM)

const solid = (plan, z, h, P, tone = 'mid', steps = 4, bevel = 0.5) =>
  k.solidSvg(k.slabOf(plan, z, h, P, steps, bevel), { tone })

/** Andrew's monotone hull over projected points. */
function hull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const chain = (list) => {
    const out = []
    for (const q of list) {
      while (out.length > 1 && cross(out[out.length - 2], out[out.length - 1], q) <= 0) out.pop()
      out.push(q)
    }
    return out
  }
  const lo = chain(p)
  const hi = chain([...p].reverse())
  return [...lo.slice(0, -1), ...hi.slice(0, -1)]
}

/**
 * The machine assembles itself in eight beats; `--step` carries the order and
 * the CSS in `src/styles/home-devices/cinema.css` gives each one its own motion.
 */
const STEPS = { feet: 0, body: 1, panel: 2, hump: 3, lens: 4, gate: 5, reels: 6, beam: 7 }

/** One contiguous run of the painter's order, wrapped as an assemblable part. */
const part = (name, inner) =>
  `<g class="home-part" data-part="${name}" style="--step:${STEPS[name]}">${inner.join('')}</g>`

export function buildCinema(P, options = {}) {
  const caption = options.caption || ''
  // each list stays in emission order, so wrapping never repaints anything
  const feet = []
  const body = []
  const panel = []
  const hump = []
  const lens = []
  const gate = []
  const reels = []
  const beam = []

  // ---- the beam: a cone that leaves the page at the upper left -----------
  const perp = [AIM[2], 0, -AIM[0]]
  const reach = 300
  const spread = 64
  const farCentre = [0, 1, 2].map((i) => MOUTH[i] + AIM[i] * reach)
  const far = [
    [0, 1, 2].map((i) => farCentre[i] + perp[i] * spread),
    [0, 1, 2].map((i) => farCentre[i] - perp[i] * spread),
  ]
  const rim = Array.from({ length: 16 }, (_, i) =>
    k.iso(G.pointOf(BARREL, 0, 7.4, (i / 16) * Math.PI * 2), P))
  const [mx, my] = k.iso(MOUTH, P)
  const [fx, fy] = k.iso(farCentre, P)
  const defs = `<defs><linearGradient id="home-beam-fade" gradientUnits="userSpaceOnUse" x1="${mx.toFixed(1)}" y1="${my.toFixed(1)}" x2="${fx.toFixed(1)}" y2="${fy.toFixed(1)}"><stop offset="0" style="stop-color:oklch(var(--un-preset-theme-colors-highlight));stop-opacity:.5"/><stop offset=".38" style="stop-color:oklch(var(--un-preset-theme-colors-highlight));stop-opacity:.14"/><stop offset="1" style="stop-color:oklch(var(--un-preset-theme-colors-highlight));stop-opacity:0"/></linearGradient></defs>`
  beam.push(`<path class="home-cine-beam" d="${k.pathOf(hull([...rim, ...far.map((p) => k.iso(p, P))]), true)}"/>`)

  // ---- feet, body, lid --------------------------------------------------
  const posts = k.corners(BODY, 11).map(([x, y]) => ({ x, y, d: k.depthOf([x, y, 0], P) })).sort((a, b) => a.d - b.d)
  for (const { x, y } of posts) {
    feet.push(k.solidSvg(k.cylinder(x, y, 5, TOP, FOOT + 1, P, 14), { tone: 'lo' }))
    feet.push(k.lineSvg(k.sideArc(x, y, 5, TOP + 1.8, P, 12), { tone: 'faint' }))
  }
  body.push(k.solidSvg(k.slabOf(BODY, BZ, 44, P, 6, 1.6), { tone: 'mid', className: 'home-cine-body' }))
  body.push(k.lineSvg(k.sideSeam(BODY, BZ + 36, P, 6), { tone: 'faint' }))
  body.push(k.solidSvg(k.slabOf(k.insetPlan(BODY, 4), LID, 2.4, P, 6, 0.8), { tone: 'hi', className: 'home-cine-body' }))

  // ---- front plate: two knobs, a rocker, the caption ---------------------
  const plate = { x: 14, y: FRONT - 1.6, w: 64, d: 2.4, r: 1.6 }
  panel.push(solid(plate, BZ + 8, 26, P, 'mid'))
  panel.push(k.lineSvg(k.planOutline(plate, BZ + 34, P, 3), { tone: 'mid' }))
  for (const x of [24, 38]) {
    const F = G.frameAlong([x, FRONT + 0.9, BZ + 26], [0, 1, 0])
    panel.push(k.solidSvg(G.disc(0, 5.4, 6, F, P), { tone: 'hi' }))
    panel.push(k.lineSvg(G.circleOf(F, 5.5, 4, P), { tone: 'faint' }))
    panel.push(k.lineSvg(k.segment([x, FRONT + 6.4, BZ + 26], [x, FRONT + 6.4, BZ + 30], P), { tone: 'hi' }))
  }
  panel.push(solid({ x: 54, y: FRONT - 1.6, w: 14, d: 2.6, r: 1 }, BZ + 18, 9.4, P, 'lo'))
  panel.push(solid({ x: 55, y: FRONT - 0.2, w: 12, d: 1.4, r: 0.8 }, BZ + 18.8, 3.8, P, 'hi', 3, 0.3))
  panel.push(solid({ x: 55, y: FRONT - 0.2, w: 12, d: 1.4, r: 0.8 }, BZ + 22.8, 3.8, P, 'mid', 3, 0.3))
  if (caption)
    panel.push(k.faceTextSvg(k.sideMatrix([58, FRONT + 0.9], BZ + 11, P, 'left'), caption, { size: 6, tone: 'hi', anchor: 'middle' }))

  // ---- lamphouse and its vent grille ------------------------------------
  hump.push(k.solidSvg(k.slabOf(HUMP, LID, 13, P, 6, 1.4), { tone: 'mid', className: 'home-cine-body' }))
  for (let i = 0; i < 6; i++)
    hump.push(k.lineSvg(k.segment([14, HUMP_FACE + 0.4, LID + 3.2 + i * 1.9], [34, HUMP_FACE + 0.4, LID + 3.2 + i * 1.9], P), { tone: 'hi' }))

  // ---- lens mount, stepped barrel, brass mouth --------------------------
  lens.push(solid(MOUNT, LID, 10, P))
  lens.push(k.solidSvg(G.solidOf([[0, 5.4], [2, 5.4], [2, 6.8], [9, 6.8], [9, 5.6], [15, 5.6], [15, 7.6], [22, 7.6]], BARREL, P), { tone: 'hi' }))
  const brass = G.ringBand(-1.6, 2.8, 5.4, 7.4, BARREL, P)
  lens.push(`<path class="home-brass" d="${[...brass.shades, brass.top].join('')}"/>`)
  lens.push(k.lineSvg(G.arcOf(BARREL, 2.8, 7.4, P), { tone: 'lo' }))

  // ---- gate, guide rollers, film strip ----------------------------------
  gate.push(solid(GATE, LID, 5, P))
  gate.push(k.lineSvg(k.segment([GATE.x + 1.6, 8.2, LID + 5.2], [GATE.x + 10.4, 8.2, LID + 5.2], P), { tone: 'lo' }))
  for (const z of [LID + 9, LID + 5.4]) {
    const F = G.frameAlong([62, HUMP_FACE + 0.8, z], [0, 1, 0])
    gate.push(k.solidSvg(G.disc(0, 2.4, 2.8, F, P), { tone: 'lo' }))
    gate.push(k.lineSvg(G.circleOf(F, 2.5, 1.5, P), { tone: 'faint' }))
  }
  const thread = [[40, 4, REEL_Z - 6], [40, 20, HUMP_TOP - 1], [62, 21.4, LID + 9], [62, 21.4, LID + 5.4], [56, 24.2, LID + 5]]
  for (const dx of [0, 1.6])
    gate.push(k.lineSvg(k.pathOf(thread.map(([x, y, z]) => k.iso([x + dx, y, z], P))), { tone: 'hi' }))

  // ---- reels last: one group each, so a reel turns about its own hub -----
  for (const x of [24, 54]) {
    const F = G.frameAlong([x, REEL_Y, REEL_Z], [0, 1, 0])
    const reel = []
    reel.push(k.solidSvg(G.disc(0, 3.6, 11.4, F, P), { tone: 'mid', className: 'home-cine-reel' }))
    reel.push(k.solidSvg(G.ringBand(2.8, 4.6, 9.4, REEL_R, F, P), { tone: 'hi' }))
    reel.push(k.solidSvg(G.disc(3.8, 6.4, 5, F, P), { tone: 'hi' }))
    reel.push(k.lineSvg(G.spokesOf(F, 4.6, 5.6, 9, 4, P, { phase: 0.6 }), { tone: 'hi' }))
    reels.push(reel)
  }

  return [
    defs,
    part('beam', beam),
    part('feet', feet),
    part('body', body),
    part('panel', panel),
    part('hump', hump),
    part('lens', lens),
    part('gate', gate),
    ...reels.map((reel) => part('reels', reel)),
  ].join('')
}

export function cinemaBounds() {
  return [
    ...k.boxCorners(BODY, BZ, LID + 13),
    [-24, REEL_Y + 6, REEL_Z + REEL_R],
    [54, REEL_Y, REEL_Z - REEL_R],
    [MOUTH[0] - 8, MOUTH[1], MOUTH[2] + 8],
  ]
}
