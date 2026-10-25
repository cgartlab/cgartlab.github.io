import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'
import { boxSvg, facePath, frameOf } from './frame.mjs'

/**
 * Module 02 — the film projector that carries "作品".
 *
 * The machine stands at the left of the deck and throws its light across to a
 * screen at the right, so nothing stands in front of the picture. The screen is
 * tipped back six degrees; its image is a masked group with soft edges, so it
 * reads as light on a surface rather than a printed panel.
 *
 * Far to near: legs, screen, picture, frame bars, beam, machine, strip, reels.
 */

const SW = 134
const SH = 76
const INSET = 6

const S = frameOf({ pitch: -6, origin: [-32, -34, TOP + 14] })

const BODY = { x: -100, y: 6, w: 56, d: 36, r: 6 }
const FOOT = 4
const BZ = TOP + FOOT
const LID = BZ + 32
const FRONT = BODY.y + BODY.d
const HUMP = { x: -96, y: 8, w: 40, d: 15, r: 5 }
const HUMP_FACE = HUMP.y + HUMP.d
const HUMP_TOP = LID + 11
const REEL_Y = 13
const REEL_R = 9
const REEL_Z = HUMP_TOP + REEL_R
const GATE = { x: -62, y: 24.4, w: 10, d: 3.6, r: 1 }
const MOUNT = { x: -58, y: 12, w: 12, d: 12, r: 2 }

// the lens points at the middle of the picture: right, back, and a little up
const PICTURE = S.at(SW / 2, 0, SH / 2)
const MOUTH = [-44, 16, LID + 10]
const AIM = (() => {
  const d = [PICTURE[0] - MOUTH[0], PICTURE[1] - MOUTH[1], PICTURE[2] - MOUTH[2]]
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

export function buildCinema(P, options = {}) {
  const caption = options.caption || ''
  const out = []
  const face = (points) => facePath(S, points, P)
  const rect = (u0, w0, u1, w1) => face([[u0, 0, w0], [u1, 0, w0], [u1, 0, w1], [u0, 0, w1]])
  const disc = (cu, cw, r, n = 26) => face(Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return [cu + r * Math.cos(a), 0, cw + r * Math.sin(a)]
  }))

  // ---- screen -----------------------------------------------------------
  for (const x of [-24, 94]) {
    const leg = { x, y: -37, w: 8, d: 6, r: 1 }
    out.push(solid(leg, TOP, 14, P), k.lineSvg(k.planOutline(leg, TOP + 14, P, 3), { tone: 'faint' }))
  }
  out.push(boxSvg(S, { u: 0, v: -3, w: 0, uw: SW, vd: 3, wh: SH }, P, { tone: 'mid' }))
  out.push(`<path class="home-cine-screen" d="${rect(0, 0, SW, SH)}"/>`)

  // ---- the beam: hull of the lens mouth and the four picture corners -----
  const rim = Array.from({ length: 16 }, (_, i) =>
    k.iso(G.pointOf(BARREL, 0, 6, (i / 16) * Math.PI * 2), P))
  const corners = [[INSET, INSET], [SW - INSET, INSET], [SW - INSET, SH - INSET], [INSET, SH - INSET]]
    .map(([u, w]) => k.iso(S.at(u, 0, w), P))
  out.push(`<path class="home-cine-beam" d="${k.pathOf(hull([...rim, ...corners]), true)}"/>`)

  // ---- the projected picture -------------------------------------------
  // The picture is masked by a blurred copy of its own quad, so its edges fall
  // off the way light does instead of stopping at a hard line.
  const ground = 30
  const picture = rect(INSET, INSET, SW - INSET, SH - INSET)
  out.push(`<defs><filter id="home-cine-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.6"/></filter><mask id="home-cine-mask" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="8000" height="8000"><path d="${picture}" fill="#fff" filter="url(#home-cine-soft)"/></mask></defs>`)
  out.push('<g class="home-cine-footage" mask="url(#home-cine-mask)">')
  out.push(`<path class="home-cine-screen" d="${rect(INSET, INSET, SW - INSET, ground)}"/>`)
  out.push(`<path class="home-cine-ink-3" d="${rect(INSET, ground, SW - INSET, SH - INSET)}"/>`)
  out.push(`<path class="home-cine-ink-2" d="${disc(104, 21, 9)}"/>`)
  out.push(`<path class="home-cine-ink-1" d="${rect(INSET, ground - 4, SW - INSET, ground + 2)}"/>`)
  out.push(`<path class="home-cine-ink-3" d="${rect(70, ground + 2, 75, 60)}"/>`)
  out.push(`<path class="home-cine-ink-3" d="${rect(78, ground + 2, 82, 52)}"/>`)
  out.push(`<path class="home-cine-ink-3" d="${rect(118, ground + 2, 123, 56)}"/>`)
  out.push(`<path class="home-cine-ink-1" d="${rect(56, ground + 2, 61, 50)}"/>`)
  out.push(`<path class="home-cine-ink-1" d="${disc(58.5, 48, 2.6)}"/>`)
  out.push('</g>')

  // ---- frame bars -------------------------------------------------------
  for (const bar of [
    { u: 0, v: 0, w: 0, uw: SW, vd: 2, wh: 4 },
    { u: 0, v: 0, w: SH - 4, uw: SW, vd: 2, wh: 4 },
    { u: 0, v: 0, w: 4, uw: 4, vd: 2, wh: SH - 8 },
    { u: SW - 4, v: 0, w: 4, uw: 4, vd: 2, wh: SH - 8 },
  ]) out.push(boxSvg(S, bar, P, { tone: 'hi' }))

  // ---- machine: feet, body, front plate ---------------------------------
  const feet = k.corners(BODY, 9).map(([x, y]) => ({ x, y, d: k.depthOf([x, y, 0], P) })).sort((a, b) => a.d - b.d)
  for (const { x, y } of feet) {
    out.push(k.solidSvg(k.cylinder(x, y, 4.2, TOP, FOOT + 1, P, 14), { tone: 'lo' }))
    out.push(k.lineSvg(k.sideArc(x, y, 4.2, TOP + 1.6, P, 12), { tone: 'faint' }))
  }
  out.push(k.solidSvg(k.slabOf(BODY, BZ, 32, P, 6, 1.4), { tone: 'mid', className: 'home-cine-body' }))
  out.push(k.lineSvg(k.sideSeam(BODY, BZ + 25, P, 6), { tone: 'faint' }))
  out.push(k.solidSvg(k.slabOf(k.insetPlan(BODY, 4), LID, 2, P, 6, 0.6), { tone: 'hi', className: 'home-cine-body' }))

  const plate = { x: -96, y: FRONT - 1.4, w: 50, d: 2.2, r: 1.4 }
  out.push(solid(plate, BZ + 6, 19, P, 'mid'))
  out.push(k.lineSvg(k.planOutline(plate, BZ + 25, P, 3), { tone: 'mid' }))
  for (const x of [-89, -78]) {
    const F = G.frameAlong([x, FRONT + 0.8, BZ + 19], [0, 1, 0])
    out.push(k.solidSvg(G.disc(0, 4.2, 4.8, F, P), { tone: 'hi' }))
    out.push(k.lineSvg(G.circleOf(F, 4.3, 3.2, P), { tone: 'faint' }))
    out.push(k.lineSvg(k.segment([x, FRONT + 5, BZ + 19], [x, FRONT + 5, BZ + 22.2], P), { tone: 'hi' }))
  }
  out.push(solid({ x: -70, y: FRONT - 1.4, w: 11, d: 2.4, r: 1 }, BZ + 13, 7.6, P, 'lo'))
  out.push(solid({ x: -69, y: FRONT - 0.2, w: 9, d: 1.4, r: 0.8 }, BZ + 13.7, 3.2, P, 'hi', 3, 0.3))
  out.push(solid({ x: -69, y: FRONT - 0.2, w: 9, d: 1.4, r: 0.8 }, BZ + 17, 3.2, P, 'mid', 3, 0.3))
  if (caption)
    out.push(k.faceTextSvg(k.sideMatrix([-70, FRONT + 0.8], BZ + 9, P, 'left'), caption, { size: 5.2, tone: 'hi', anchor: 'middle' }))

  // ---- lamphouse hump and its five vent lines ---------------------------
  out.push(k.solidSvg(k.slabOf(HUMP, LID, 11, P, 6, 1.2), { tone: 'mid', className: 'home-cine-body' }))
  for (let i = 0; i < 5; i++)
    out.push(k.lineSvg(k.segment([-91, HUMP_FACE + 0.3, LID + 3 + i * 1.7], [-78, HUMP_FACE + 0.3, LID + 3 + i * 1.7], P), { tone: 'hi' }))

  // ---- lens mount, stepped barrel, brass mouth --------------------------
  out.push(solid(MOUNT, LID, 8, P))
  out.push(k.solidSvg(G.solidOf([[0, 4.4], [1.6, 4.4], [1.6, 5.6], [7, 5.6], [7, 4.6], [11.5, 4.6], [11.5, 6.2], [17, 6.2]], BARREL, P), { tone: 'hi' }))
  const brass = G.ringBand(-1.2, 2.2, 4.4, 6, BARREL, P)
  out.push(`<path class="home-brass" d="${[...brass.shades, brass.top].join('')}"/>`)
  out.push(k.lineSvg(G.arcOf(BARREL, 2.2, 6, P), { tone: 'lo' }))

  // ---- gate, two guide rollers, then the strip --------------------------
  out.push(solid(GATE, LID, 4.4, P))
  out.push(k.lineSvg(k.segment([GATE.x + 1.4, 26.2, LID + 4.6], [GATE.x + 8.6, 26.2, LID + 4.6], P), { tone: 'lo' }))
  for (const z of [LID + 8, LID + 4.8]) {
    const F = G.frameAlong([-52, HUMP_FACE + 0.7, z], [0, 1, 0])
    out.push(k.solidSvg(G.disc(0, 2.2, 2.6, F, P), { tone: 'lo' }))
    out.push(k.lineSvg(G.circleOf(F, 2.3, 1.4, P), { tone: 'faint' }))
  }
  const thread = [[-80, 11, REEL_Z - 4], [-80, 22.4, HUMP_TOP - 1], [-52, 23.7, LID + 8], [-52, 23.7, LID + 4.8], [-56.5, 26.2, LID + 4.4]]
  for (const dx of [0, 1.4])
    out.push(k.lineSvg(k.pathOf(thread.map(([x, y, z]) => k.iso([x + dx, y, z], P))), { tone: 'hi' }))

  // ---- reels last -------------------------------------------------------
  for (const x of [-86, -66]) {
    const F = G.frameAlong([x, REEL_Y, REEL_Z], [0, 1, 0])
    out.push(k.solidSvg(G.disc(0, 3.2, 8.6, F, P), { tone: 'mid', className: 'home-cine-reel' }))
    out.push(k.solidSvg(G.ringBand(2.4, 4.2, 7, REEL_R, F, P), { tone: 'hi' }))
    out.push(k.solidSvg(G.disc(3.4, 5.8, 3.8, F, P), { tone: 'hi' }))
    out.push(k.lineSvg(G.spokesOf(F, 4.2, 4.2, 6.8, 4, P, { phase: 0.6 }), { tone: 'hi' }))
  }

  const [gx, gy] = k.iso(MOUTH, P)
  out.push('<defs><radialGradient id="home-cine-glow"><stop offset="0" style="stop-color:oklch(var(--un-preset-theme-colors-highlight));stop-opacity:.55"/><stop offset=".55" style="stop-color:oklch(var(--un-preset-theme-colors-highlight));stop-opacity:.18"/><stop offset="1" style="stop-color:oklch(var(--un-preset-theme-colors-highlight));stop-opacity:0"/></radialGradient></defs>')
  out.push(`<circle class="home-cine-glow" cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="15" fill="url(#home-cine-glow)"/>`)

  return out.join('')
}

export function cinemaBounds() {
  const panel = []
  for (const u of [0, SW])
    for (const v of [-3, 0])
      for (const w of [0, SH]) panel.push(S.at(u, v, w))
  return [
    ...panel,
    ...k.boxCorners({ x: -24, y: -37, w: 8, d: 6 }, TOP, TOP + 14),
    ...k.boxCorners({ x: 94, y: -37, w: 8, d: 6 }, TOP, TOP + 14),
    ...k.boxCorners(BODY, BZ, LID + 11),
    [-86, REEL_Y + 5, REEL_Z + REEL_R],
    [-66, REEL_Y, REEL_Z - REEL_R],
    [MOUTH[0] + 14, MOUTH[1], MOUTH[2] + 8],
  ]
}
