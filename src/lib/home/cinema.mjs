import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 02 — the film projector that carries "作品".
 *
 * The picture is no longer a screen of its own: it is a page-level video layer
 * behind everything, centred on the viewport. So the machine throws to the
 * LEFT — the lens sits at the left end of the body, the beam crosses the empty
 * half of the deck and leaves the drawing entirely.
 *
 * Far to near: beam, feet, body, front panel, lamphouse, barrel, transport, reels.
 */

const TAU = Math.PI * 2
const DEG = Math.PI / 180

// ---- the body -------------------------------------------------------------
const BODY = { x: 6, y: -28, w: 82, d: 58, r: 7 }
const FOOT = 5
const BZ = TOP + FOOT
const BODY_H = 31
const BODY_TOP = BZ + BODY_H
const LID = BODY_TOP + 2
const FRONT = BODY.y + BODY.d

// ---- lamphouse ------------------------------------------------------------
const HUMP = { x: 6, y: -18, w: 30, d: 34, r: 6 }
const HUMP_FRONT = HUMP.y + HUMP.d
const HUMP_TOP = LID + 12

// ---- reels: on arms, so the film can hang off them ------------------------
const REEL_Y = -4
const REEL_R = 11
const REEL_Z = LID + REEL_R + 6
const REELS = [50, 76]

// ---- lens: left, slightly back, slightly up -------------------------------
const MOUNT = { x: -1, y: -6, w: 9, d: 20, r: 3 }
const MOUNT_Z0 = LID + 2
const MOUNT_Z1 = MOUNT_Z0 + 9
const BARREL = G.frameAlong([-1, 4, LID + 6.5], [-1, -0.12, 0.03])
const PROFILE = [
  [0, 4.4],
  [1.4, 4.4],
  [1.4, 5.6],
  [3.6, 5.6],
  [3.6, 4.6],
  [7.4, 4.6],
  [7.4, 5.2],
  [10.8, 5.2],
  [10.8, 4.7],
  [13, 4.7],
  [13, 6.2],
  [16, 6.2],
]
const MOUTH_S = 16
const MOUTH_R = 6.2

// ---- front panel ----------------------------------------------------------
const PANEL = { x: 8, y: FRONT - 1.6, w: 46, d: 2.6, r: 1.6 }
const PANEL_Z0 = BZ + 7
const PANEL_Z1 = LID - 8
const PANEL_MID = (PANEL_Z0 + PANEL_Z1) / 2

// ---- film transport: gate, two guide rollers, one strip ------------------
const GATE = { x: 22, y: 14, w: 9, d: 4.6, r: 1 }
const GATE_SLOT = GATE.x + GATE.w / 2
const CARRIER = { x: 29, y: 15, w: 18, d: 9, r: 1.5, h: 3.4 }
const ROLLER = { r: 2.4, gap: 6, y: 16.4, z: LID + 3.4 }
const ROLLER_X = [CARRIER.x + CARRIER.w / 2 + ROLLER.gap / 2, CARRIER.x + CARRIER.w / 2 - ROLLER.gap / 2]

// the throw: one cone that leaves the frame, so the picture stays centred
const BEAM_FAR_X = -430
const BEAM_FAR_HALF = 124

const solid = (plan, z, h, P, tone = 'mid', steps = 4, bevel = 0.5) =>
  k.solidSvg(k.slabOf(plan, z, h, P, steps, bevel), { tone })

/** A constant-width strip through already-projected points. */
function ribbon(points, width) {
  const half = width / 2
  const left = []
  const right = []
  points.forEach((p, index) => {
    const a = points[Math.max(0, index - 1)]
    const b = points[Math.min(points.length - 1, index + 1)]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    left.push([p[0] - (dy / len) * half, p[1] + (dx / len) * half])
    right.push([p[0] + (dy / len) * half, p[1] - (dx / len) * half])
  })
  return k.pathOf([...left, ...right.reverse()], true)
}

/** A rocker switch sitting proud of the front face. */
function rocker(x, z, P, w = 10, h = 6.4) {
  return solid({ x: x - w / 2 - 1, y: FRONT - 1.4, w: w + 2, d: 2.6, r: 1 }, z - h / 2 - 1, h + 2, P, 'lo', 4, 0.5)
    + solid({ x: x - w / 2, y: FRONT - 0.2, w, d: 1.4, r: 0.8 }, z - h / 2, h * 0.55, P, 'hi', 3, 0.4)
    + solid({ x: x - w / 2, y: FRONT - 0.2, w, d: 1.4, r: 0.8 }, z - h * 0.05, h * 0.55, P, 'mid', 3, 0.4)
}

/** A knurled knob standing off the front face. */
function knob(x, z, P, r = 4.8) {
  const F = G.frameAlong([x, FRONT + 0.8, z], [0, 1, 0])
  return k.solidSvg(G.disc(0, 4.2, r, F, P), { tone: 'hi' })
    + k.lineSvg(G.circleOf(F, 4.3, r - 1.6, P), { tone: 'faint' })
    + k.lineSvg(k.segment([x, FRONT + 5.2, z], [x, FRONT + 5.2, z + r * 0.66], P), { tone: 'hi' })
}

/** The throw: mouth rim at one end, a wide soft edge far off the left. */
function beamSvg(P) {
  const axis = (s) => G.pointOf(BARREL, s, 0, 0)
  const [ox, oy] = k.iso(axis(0), P)
  const [ux, uy] = k.iso(axis(1), P)
  const span = Math.hypot(ux - ox, uy - oy) || 1
  const dx = (ux - ox) / span
  const dy = (uy - oy) / span

  const rim = Array.from({ length: 32 }, (_, i) => k.iso(G.pointOf(BARREL, MOUTH_S, MOUTH_R, (i / 32) * TAU), P))
  const top = Math.min(...rim.map((p) => p[1]))
  const bottom = Math.max(...rim.map((p) => p[1]))
  const near = [rim.reduce((sum, p) => sum + p[0], 0) / rim.length, (top + bottom) / 2]
  const nearHalf = (bottom - top) / 2

  const reach = (BEAM_FAR_X - near[0]) / dx
  const far = [near[0] + dx * reach, near[1] + dy * reach]
  const px = -dy
  const py = dx
  const quad = [
    [near[0] + px * nearHalf, near[1] + py * nearHalf],
    [far[0] + px * BEAM_FAR_HALF, far[1] + py * BEAM_FAR_HALF],
    [far[0] - px * BEAM_FAR_HALF, far[1] - py * BEAM_FAR_HALF],
    [near[0] - px * nearHalf, near[1] - py * nearHalf],
  ]

  const paint = 'oklch(var(--un-preset-theme-colors-highlight))'
  const stop = (offset, alpha) => `<stop offset="${offset}" style="stop-color:${paint};stop-opacity:${alpha}"/>`
  const defs = `<defs>`
    + `<filter id="home-cine-soften" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>`
    + `<linearGradient id="home-cine-throw" gradientUnits="userSpaceOnUse" x1="${near[0].toFixed(1)}" y1="${near[1].toFixed(1)}" x2="${far[0].toFixed(1)}" y2="${far[1].toFixed(1)}">`
    + stop(0, '.58')
    + stop('.18', '.3')
    + stop('.36', '.1')
    + stop('.52', '0')
    + stop(1, '0')
    + `</linearGradient>`
    + `<radialGradient id="home-cine-flare">`
    + stop(0, '.62')
    + stop('.48', '.18')
    + stop(1, '0')
    + `</radialGradient>`
    + `</defs>`

  // cinema.css paints this class flat, so the gradient rides on an inline style:
  // it has to win over the stylesheet rather than lose to it.
  const path = `<path class="home-cine-beam" filter="url(#home-cine-soften)" style="fill:url(#home-cine-throw);fill-opacity:.82" d="${k.pathOf(quad, true)}"/>`
  return { defs, path, mouth: near }
}

export function buildCinema(P, options = {}) {
  const caption = options.caption || ''
  const out = []

  const beam = beamSvg(P)
  out.push(beam.defs)
  out.push(beam.path)

  // ---- feet -------------------------------------------------------------
  const feet = k.corners(BODY, 9)
    .map(([x, y]) => ({ x, y, d: k.depthOf([x, y, 0], P) }))
    .sort((a, b) => a.d - b.d)
  for (const { x, y } of feet) {
    out.push(k.solidSvg(k.cylinder(x, y, 4, TOP, FOOT + 1, P, 14), { tone: 'lo' }))
    out.push(k.lineSvg(k.sideArc(x, y, 4, TOP + 1.6, P, 12), { tone: 'faint' }))
  }

  // ---- body -------------------------------------------------------------
  out.push(k.solidSvg(k.slabOf(BODY, BZ, BODY_H, P, 6, 1.4), { tone: 'mid', className: 'home-cine-body' }))
  out.push(k.lineSvg(k.sideSeam(BODY, BZ + BODY_H - 8, P, 6), { tone: 'faint' }))
  out.push(k.solidSvg(k.slabOf(k.insetPlan(BODY, 3), BODY_TOP, 2, P, 6, 0.6), { tone: 'hi', className: 'home-cine-body' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan(BODY, 6), LID, P, 6), { tone: 'faint' }))

  // ---- front face: control panel, knobs, rocker, engraved caption -------
  out.push(solid(PANEL, PANEL_Z0, PANEL_Z1 - PANEL_Z0, P, 'mid', 4, 0.6))
  out.push(k.lineSvg(k.planOutline(PANEL, PANEL_Z1, P, 4), { tone: 'faint' }))
  out.push(k.lineSvg(k.planOutline(PANEL, PANEL_Z0, P, 4), { tone: 'faint' }))
  out.push(knob(19, PANEL_MID, P))
  out.push(knob(33, PANEL_MID, P))
  out.push(rocker(46, PANEL_MID, P, 9, 6))
  if (caption) {
    const cx = PANEL.x + PANEL.w + 17
    out.push(k.faceTextSvg(k.sideMatrix([cx, FRONT + 0.9], LID - 15, P, 'left'), caption, { size: 6.4, tone: 'hi', anchor: 'middle' }))
    out.push(k.lineSvg(k.segment([cx - 11, FRONT + 0.6, LID - 20.5], [cx + 11, FRONT + 0.6, LID - 20.5], P), { tone: 'faint' }))
    out.push(k.faceTextSvg(k.sideMatrix([cx, FRONT + 0.9], LID - 25, P, 'left'), 'No.02 · 35MM', { size: 2.8, tone: 'faint', anchor: 'middle' }))
  }

  // ---- lamphouse hump ----------------------------------------------------
  out.push(k.solidSvg(k.slabOf(HUMP, LID, HUMP_TOP - LID, P, 6, 1.6), { tone: 'mid', className: 'home-cine-body' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan(HUMP, 2.6), HUMP_TOP, P, 6), { tone: 'faint' }))
  for (let i = 0; i < 5; i++) {
    const z = LID + 3.4 + i * 2
    out.push(k.lineSvg(k.segment([HUMP.x + 2.5, HUMP_FRONT + 0.3, z], [HUMP.x + 14, HUMP_FRONT + 0.3, z], P), { tone: 'hi' }))
  }

  // ---- lens mount, stepped barrel, brass mouth --------------------------
  out.push(solid(MOUNT, MOUNT_Z0, MOUNT_Z1 - MOUNT_Z0, P, 'mid', 5, 1))
  out.push(k.solidSvg(G.solidOf(PROFILE, BARREL, P), { tone: 'hi' }))
  const brass = G.ringBand(MOUTH_S - 0.5, MOUTH_S + 2.4, MOUTH_R - 0.6, MOUTH_R + 0.8, BARREL, P)
  out.push(`<path class="home-brass" d="${[...brass.shades, brass.top].join('')}"/>`)
  out.push(k.lineSvg(G.arcOf(BARREL, MOUTH_S + 2.4, MOUTH_R + 0.8, P), { tone: 'lo' }))

  // ---- gate, carrier, guide rollers, the strip --------------------------
  out.push(solid(GATE, LID, 7, P, 'lo', 4, 0.5))
  out.push(k.lineSvg(k.segment([GATE_SLOT, GATE.y + GATE.d, LID + 1.4], [GATE_SLOT, GATE.y + GATE.d, LID + 5.4], P), { tone: 'hi' }))
  out.push(solid(CARRIER, LID, CARRIER.h, P, 'mid', 4, 0.5))
  for (const x of ROLLER_X) {
    const F = G.frameAlong([x, ROLLER.y, ROLLER.z], [0, 1, 0])
    out.push(k.solidSvg(G.disc(0, 3.2, ROLLER.r, F, P), { tone: 'lo' }))
    out.push(k.lineSvg(G.circleOf(F, 3.2, ROLLER.r - 0.9, P), { tone: 'faint' }))
  }
  // off the feed reel, down over both rollers, into the gate
  const thread = [
    [REELS[0] + REEL_R * Math.cos(190 * DEG), REEL_Y, REEL_Z + REEL_R * Math.sin(190 * DEG)],
    [ROLLER_X[0], ROLLER.y + 1.6, ROLLER.z + ROLLER.r],
    [ROLLER_X[1], ROLLER.y + 1.6, ROLLER.z + ROLLER.r],
    [GATE_SLOT, GATE.y + GATE.d - 0.4, LID + 6.2],
  ]
  const strip = ribbon(thread.map((p) => k.iso(p, P)), 3.2)
  out.push(`<path class="iso-shade" data-shade="1" d="${strip}"/>`)
  out.push(k.lineSvg(strip, { tone: 'hi' }))

  // ---- reels last -------------------------------------------------------
  for (const x of REELS) {
    out.push(solid({ x: x - 4, y: REEL_Y - 3.5, w: 8, d: 7, r: 1.5 }, LID, REEL_Z - REEL_R - LID, P, 'lo', 4, 0.4))
    const F = G.frameAlong([x, REEL_Y, REEL_Z], [0, 1, 0])
    out.push(k.solidSvg(G.disc(0, 3.2, REEL_R + 0.4, F, P), { tone: 'mid', className: 'home-cine-reel' }))
    out.push(k.solidSvg(G.ringBand(2.4, 4.2, REEL_R * 0.78, REEL_R, F, P), { tone: 'hi' }))
    out.push(k.solidSvg(G.disc(3.4, 5.8, REEL_R * 0.4, F, P), { tone: 'hi' }))
    out.push(k.lineSvg(G.spokesOf(F, 4.2, REEL_R * 0.4, REEL_R * 0.78, 4, P, { phase: 0.6 }), { tone: 'hi' }))
    out.push(k.lineSvg(G.arcOf(F, 3.2, REEL_R + 0.4, P), { tone: 'lo' }))
  }

  // ---- flare at the mouth ----------------------------------------------
  out.push(`<circle class="home-cine-glow" cx="${beam.mouth[0].toFixed(1)}" cy="${beam.mouth[1].toFixed(1)}" r="18" fill="url(#home-cine-flare)"/>`)

  return out.join('')
}

/** The machine only — the beam must never pull the stage's framing left. */
export function cinemaBounds() {
  const out = [
    ...k.boxCorners(BODY, BZ, LID),
    ...k.boxCorners(HUMP, LID, HUMP_TOP),
    ...k.boxCorners(MOUNT, MOUNT_Z0, MOUNT_Z1),
  ]
  for (const x of REELS) {
    out.push([x, REEL_Y, REEL_Z + REEL_R], [x, REEL_Y, REEL_Z - REEL_R])
    out.push([x - REEL_R, REEL_Y, REEL_Z], [x + REEL_R, REEL_Y, REEL_Z])
  }
  const mouth = G.pointOf(BARREL, MOUTH_S, 0, 0)
  out.push([mouth[0], mouth[1], mouth[2] + MOUTH_R], [mouth[0], mouth[1], mouth[2] - MOUTH_R])
  return out
}
