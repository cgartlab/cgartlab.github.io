import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 07 — the refractor that carries "search".
 *
 * A small equatorial head on three splayed legs; the tube rakes up and toward
 * the reader, so the lens faces the camera as a big ellipse at the top and the
 * eyepiece looks straight back out at you.
 * Every part is seated: the legs stand on the deck, the block closes over their
 * tips, the saddle takes the barrel, the eyepiece grows out of the rear cell and
 * the finder is clamped to the barrel's upper flank.
 */

const APEX = [0, 0, TOP + 58]
const FEET = [[0, -34], [-46, 26], [46, 26]]
const PAD_R = 3.4, PAD_H = 2.4
const BLOCK = { x: -12, y: -10, w: 24, d: 20, r: 3 }
const BLOCK_Z = TOP + 42, BLOCK_H = 18
const SADDLE = { x: -8, y: -9, w: 16, d: 18, r: 2 }
const SADDLE_Z = TOP + 60, SADDLE_H = 10
const FRONT = BLOCK.y + BLOCK.d
const TILT = (35 * Math.PI) / 180
const AXIS = [0, Math.sin(TILT), Math.cos(TILT)]
const PERP = [0, -AXIS[2], AXIS[1]]
const BASE = [0, -4, TOP + 70]
const BARREL = 55, LIP = 10.6
const EYE_AXIS = [0, 0.96, -0.28]

/** A point on the tube's axis, `out` along a world vector. */
const along = (s, out = [0, 0, 0]) => BASE.map((n, i) => n + AXIS[i] * s + out[i])

// the finder steps sideways as well as up: a pure up-and-back offset projects
// straight along the barrel, which would bury the little tube inside it
const FIN = [-13, -5.5, 3.9]
const FIN_DIR = FIN.map((n) => n / Math.hypot(...FIN))
const TUBE = G.frameAlong(BASE, AXIS)
const FINDER = G.frameAlong(along(0, FIN), AXIS)
const ARM = G.frameAlong([-10, -7, TOP + 52], [-18, -8, -16])
const EYE = G.frameAlong(along(0, [0, 2 * PERP[1], 2 * PERP[2]]), EYE_AXIS)

/** A point on a ring of a lathe frame. */
function onRing(F, s, r, t) {
  const c = Math.cos(t) * r, n = Math.sin(t) * r
  return [0, 1, 2].map((i) => F.o[i] + F.a[i] * s + c * F.u[i] + n * F.v[i])
}

const ringOf = (F, s, r) => Array.from({ length: 12 }, (_, i) => onRing(F, s, r, (i / 12) * Math.PI * 2))

/** One turned leg: rubber pad, straight rod, ferrule collar. */
function legAt(foot, P) {
  const from = [foot[0], foot[1], TOP + PAD_H]
  const dir = [APEX[0] - from[0], APEX[1] - from[1], APEX[2] - from[2]]
  const F = G.frameAlong(from, dir)
  const L = Math.hypot(dir[0], dir[1], dir[2])
  return k.solidSvg(k.cylinder(foot[0], foot[1], PAD_R, TOP, PAD_H, P, 22), { tone: 'lo' })
    + k.solidSvg(G.disc(0, L, 1.5, F, P), { tone: 'mid' })
    + k.solidSvg(G.disc(2.6, 6.2, 2.05, F, P), { tone: 'mid' })
    + k.lineSvg(G.circleOf(F, 2.8, 1.85, P), { tone: 'faint' })
}

export function buildTelescope(P, options = {}) {
  const caption = options.caption || 'REF · 07'
  const out = []

  // rear leg first: it is the farthest thing on the platform
  out.push(legAt(FEET[0], P))

  // counterweight shaft, leaving the block's hidden left face
  out.push(k.solidSvg(G.disc(0, 25, 1.4, ARM, P), { tone: 'mid' }))
  out.push(k.solidSvg(G.solidOf([[14, 2.8], [15.5, 6.2], [20.5, 6.2], [22, 2.8]], ARM, P), { tone: 'mid' }))

  out.push(legAt(FEET[1], P), legAt(FEET[2], P))

  // finder: a thin tube on the far flank, on two ring mounts
  out.push(k.solidSvg(G.solidOf([[7, 1.9], [8.5, 2.6], [11, 2.6], [12, 3.0], [30, 3.0], [31.5, 3.4], [33, 3.4]], FINDER, P), { tone: 'mid' }))
  out.push(k.solidSvg(G.disc(33, 34.2, 2.9, FINDER, P), { tone: 'lo' }))
  for (const s of [12, 28]) {
    out.push(k.lineSvg(k.segment(along(s, FIN_DIR.map((n) => n * 7.8)), along(s, FIN_DIR.map((n) => n * 11)), P), { tone: 'mid' }))
    out.push(k.dotsSvg([k.iso(along(s, FIN_DIR.map((n) => n * 11.2)), P)], { size: 0.7, tone: 'faint' }))
  }

  // equatorial head: block, two slow-motion knobs, saddle
  out.push(k.solidSvg(k.slabOf(BLOCK, BLOCK_Z, BLOCK_H, P, 6, 1.4), { tone: 'mid' }))
  for (const x of [-6.5, 6.5]) {
    const K = G.frameAlong([x, FRONT, TOP + 50], [0, 1, 0])
    out.push(k.solidSvg(G.disc(0, 3.4, 4.2, K, P), { tone: 'mid' }))
    out.push(k.lineSvg(G.circleOf(K, 3.5, 2.8, P), { tone: 'faint' }))
    out.push(k.lineSvg(k.segment([x, FRONT + 3.6, TOP + 50], [x, FRONT + 3.6, TOP + 53.4], P), { tone: 'hi' }))
  }
  out.push(k.faceTextSvg(k.sideMatrix([0, FRONT], TOP + 56.6, P, 'left'), caption, { size: 2.8, tone: 'faint', anchor: 'middle' }))
  out.push(k.solidSvg(k.slabOf(SADDLE, SADDLE_Z, SADDLE_H, P, 5, 1), { tone: 'mid' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan(SADDLE, 3), SADDLE_Z + SADDLE_H, P, 5), { tone: 'faint' }))

  // the barrel: rear cell, tube, dew shield, lip — four convex turnings, so the
  // silhouette steps instead of collapsing to one long cone
  out.push(k.solidSvg(G.solidOf([[0, 4.6], [2.6, 4.6], [4, 7.2]], TUBE, P), { tone: 'hi' }))
  out.push(k.solidSvg(G.disc(3, 43, 8, TUBE, P), { tone: 'hi' }))
  out.push(k.solidSvg(G.disc(41.5, 53.5, 9.7, TUBE, P), { tone: 'hi' }))
  out.push(k.solidSvg(G.disc(52, BARREL, LIP, TUBE, P), { tone: 'hi' }))
  out.push(k.solidSvg(G.disc(54.3, 55.6, 9.3, TUBE, P), { tone: 'lo' }))
  out.push(k.lineSvg(G.circleOf(TUBE, 55.8, 7.9, P), { tone: 'faint' }))
  out.push(k.lineSvg(k.pathOf([2.05, 2.5, 2.95].map((t) => onRing(TUBE, 55.7, 6.2, t))), { tone: 'hi' }))

  // eyepiece, growing out of the rear cell and aimed back at the reader
  out.push(k.solidSvg(G.disc(-1, 4, 3.9, EYE, P), { tone: 'hi' }))
  out.push(k.solidSvg(G.disc(3.5, 10.5, 2.7, EYE, P), { tone: 'mid' }))
  out.push(k.solidSvg(G.disc(10.5, 14.5, 3.7, EYE, P), { tone: 'lo' }))
  out.push(k.solidSvg(G.disc(14.3, 15.2, 2.8, EYE, P), { tone: 'lo' }))
  out.push(k.lineSvg(G.circleOf(EYE, 15.3, 2.2, P), { tone: 'faint' }))

  return out.join('')
}

export function telescopeBounds() {
  return [
    ...k.boxCorners(BLOCK, BLOCK_Z, SADDLE_Z + SADDLE_H),
    ...FEET.map(([x, y]) => [x, y, TOP]),
    ...ringOf(TUBE, BARREL, LIP),
    ...ringOf(FINDER, 34.2, 3.2),
    ...ringOf(EYE, 15, 3.6),
    ...ringOf(ARM, 22, 6.2),
  ]
}
