import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { tubePieces, tubeSvg } from '../anatomy/tube.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 02 — the film projector that carries "作品".
 *
 * An old cinema head, built the way the real machine is built: a cast base that
 * fills the lift platform (no round plinth), a transformer / lamphouse box at
 * the back right, the optical head standing beside it with the gate on its face,
 * the barrel raked up and to the left, and the two reels carried on arms above.
 * The picture itself is a page-level layer (see `.home-projection` in
 * home.css); the cone here is only the throw, and it is a straight-sided
 * wedge — two straight lines from the lens hood to the far corners.
 *
 * Far to near: beam, feet, base, transformer box, head, gate, controls, film
 * path, barrel, reels, cable and shutter.
 */

const BASE = { x: -92, y: -34, w: 184, d: 70, r: 10 }
const FOOT = 8
const BZ = TOP + FOOT + 4
const LAMP = { x: 8, y: -24, w: 78, d: 48, r: 6 }
const HEAD = { x: -80, y: -26, w: 86, d: 52, r: 6 }
const FRONT = HEAD.y + HEAD.d
const HEAD_TOP = BZ + 66
const LENS_BASE = [-62, 0, BZ + 50]

// the optical axis: 45 degrees up-left on the page
const AIM = (() => {
  const d = [-1, 0, 1.05]
  const len = Math.hypot(...d)
  return [d[0] / len, d[1] / len, d[2] / len]
})()
const LENS = G.frameAlong(LENS_BASE, AIM)
const MOUTH = [0, 1, 2].map(i => LENS_BASE[i] + AIM[i] * 26)

const REEL_R = 26
const REEL_Y = 10
const REEL_Z = BZ + 100

const solid = (plan, z, h, P, tone = 'mid', steps = 4, bevel = 0.5) =>
  k.solidSvg(k.slabOf(plan, z, h, P, steps, bevel), { tone })

export function buildCinema(P, options = {}) {
  const caption = options.caption || ''
  const out = []
  const part = (name, step, items) =>
    `<g class="home-part" data-part="${name}" style="--step:${step}">${items.join('')}</g>`

  // ---- the throw: a straight-sided wedge ---------------------------------
  const [mx, my] = k.iso(MOUTH, P)
  const [ax, ay] = k.iso([MOUTH[0] + AIM[0] * 100, MOUTH[1], MOUTH[2] + AIM[2] * 100], P)
  const len = Math.hypot(ax - mx, ay - my) || 1
  const dir = [(ax - mx) / len, (ay - my) / len]
  const perp = [-dir[1], dir[0]]
  const rim = k.iso(G.pointOf(LENS, 26, 9, 0), P)
  const rimR = Math.hypot(rim[0] - mx, rim[1] - my)
  const REACH = 560
  const HALF = 820
  const near = [
    [mx + perp[0] * rimR, my + perp[1] * rimR],
    [mx - perp[0] * rimR, my - perp[1] * rimR],
  ]
  const far = [
    [mx + dir[0] * REACH + perp[0] * HALF, my + dir[1] * REACH + perp[1] * HALF],
    [mx + dir[0] * REACH - perp[0] * HALF, my + dir[1] * REACH - perp[1] * HALF],
  ]
  out.push(`<defs><linearGradient id="home-beam-fade" gradientUnits="userSpaceOnUse" x1="${mx.toFixed(1)}" y1="${my.toFixed(1)}" x2="${(mx + dir[0] * REACH).toFixed(1)}" y2="${(my + dir[1] * REACH).toFixed(1)}"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".12" stop-color="#fff" stop-opacity=".26"/><stop offset=".3" stop-color="#fff" stop-opacity=".15"/><stop offset=".6" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`)
  out.push(part('cine-beam', 8, [
    `<path class="home-cine-beam" d="${k.pathOf([near[0], far[0], far[1], near[1]], true)}"/>`,
  ]))

  // ---- feet and base ----------------------------------------------------
  const base = []
  const feet = k.corners(BASE, 12).map(([x, y]) => ({ x, y, d: k.depthOf([x, y, 0], P) })).sort((a, b) => a.d - b.d)
  for (const { x, y } of feet) {
    base.push(k.solidSvg(k.cylinder(x, y, 6, TOP, FOOT + 2, P, 16), { tone: 'lo' }))
    base.push(k.lineSvg(k.sideArc(x, y, 6, TOP + 2.4, P, 12), { tone: 'faint' }))
  }
  base.push(solid(BASE, BZ - 8, 8, P, 'mid', 6, 2))
  base.push(k.lineSvg(k.planOutline(k.insetPlan(BASE, 5), BZ, P, 6), { tone: 'faint' }))
  base.push(solid(k.insetPlan(BASE, 3), BZ, 2.4, P, 'hi', 6, 0.8))
  for (const [x, y] of k.corners(k.insetPlan(BASE, 9))) {
    base.push(k.dotsSvg([k.iso([x, y, BZ + 2.6], P)], { size: 1, tone: 'mid' }))
    base.push(k.lineSvg(k.ring(x, y, 2, BZ + 2.6, P, 14), { tone: 'faint' }))
  }
  base.push(solid({ x: -78, y: BASE.y + BASE.d - 9, w: 42, d: 7, r: 1.4 }, BZ + 2.4, 1.4, P, 'lo', 3, 0.3))
  base.push(k.faceTextSvg(k.sideMatrix([-57, BASE.y + BASE.d - 2], BZ + 3.6, P, 'left'), '35 · MM', { size: 3.2, tone: 'mid', anchor: 'middle' }))
  out.push(part('cine-base', 0, base))

  // ---- transformer / arc box --------------------------------------------
  const lamp = []
  lamp.push(k.solidSvg(k.slabOf(LAMP, BZ + 2, 34, P, 6, 1.6), { tone: 'mid', className: 'home-cine-body' }))
  lamp.push(k.lineSvg(k.sideSeam(LAMP, BZ + 27, P, 6), { tone: 'faint' }))
  lamp.push(solid(k.insetPlan(LAMP, 4), BZ + 36, 2, P, 'hi', 5, 0.6))
  for (let i = 0; i < 7; i++) {
    lamp.push(k.lineSvg(k.segment([LAMP.x + LAMP.w - 14, LAMP.y + 8 + i * 4, BZ + 34.6], [LAMP.x + LAMP.w - 5, LAMP.y + 8 + i * 4, BZ + 34.6], P), { tone: 'hi' }))
  }
  lamp.push(k.faceTextSvg(k.sideMatrix([LAMP.x + 8, LAMP.y + LAMP.d], BZ + 12, P, 'left'), 'LAMPHOUSE', { size: 3, tone: 'faint' }))
  lamp.push(k.solidSvg(k.cylinder(LAMP.x + 12, LAMP.y + 6, 3.4, BZ + 36, 4, P, 16), { tone: 'lo' }))
  out.push(part('cine-body', 1, lamp))

  // ---- the optical head -------------------------------------------------
  const head = []
  head.push(k.solidSvg(k.slabOf(HEAD, BZ + 2, 64, P, 6, 1.8), { tone: 'mid', className: 'home-cine-body' }))
  head.push(k.lineSvg(k.sideSeam(HEAD, BZ + 46, P, 6), { tone: 'faint' }))
  head.push(k.lineSvg(k.planOutline(k.insetPlan(HEAD, 4), HEAD_TOP + 2, P, 5), { tone: 'faint' }))
  out.push(part('cine-body', 2, head))

  // gate boss on the front face, where the film crosses
  const gate = []
  const gatePlan = { x: -52, y: FRONT - 1.6, w: 34, d: 3.4, r: 3 }
  gate.push(solid(gatePlan, BZ + 22, 30, P, 'lo', 5, 1))
  gate.push(k.lineSvg(k.planOutline(k.insetPlan(gatePlan, 3), BZ + 52, P, 5), { tone: 'mid' }))
  gate.push(k.faceTextSvg(k.sideMatrix([-35, FRONT + 2.2], BZ + 28, P, 'left'), 'GATE', { size: 2.6, tone: 'faint', anchor: 'middle' }))
  out.push(part('cine-gate', 4, gate))

  // ---- vents, control panel, handwheel ----------------------------------
  const panel = []
  for (let i = 0; i < 6; i++) {
    panel.push(k.lineSvg(k.segment([-72, FRONT + 0.3, BZ + 8 + i * 2.6], [-60, FRONT + 0.3, BZ + 8 + i * 2.6], P), { tone: 'lo' }))
  }
  const panelPlan = { x: -10, y: FRONT - 1.4, w: 34, d: 2.6, r: 1.6 }
  panel.push(solid(panelPlan, BZ + 8, 26, P, 'mid', 4, 0.6))
  for (const x of [-3, 11]) {
    const F = G.frameAlong([x, FRONT + 0.9, BZ + 26], [0, 1, 0])
    panel.push(k.solidSvg(G.disc(0, 4.6, 5.2, F, P), { tone: 'hi' }))
    panel.push(k.lineSvg(G.circleOf(F, 4.7, 3.4, P), { tone: 'faint' }))
    panel.push(k.lineSvg(k.segment([x, FRONT + 5.4, BZ + 26], [x, FRONT + 5.4, BZ + 29.4], P), { tone: 'hi' }))
  }
  const dial = G.frameAlong([20, FRONT + 0.8, BZ + 26], [0, 1, 0])
  panel.push(k.solidSvg(G.disc(0, 1.4, 6.4, dial, P), { tone: 'hi' }))
  panel.push(k.lineSvg(G.circleOf(dial, 1.5, 6.4, P), { tone: 'mid' }))
  panel.push(k.lineSvg(G.circleOf(dial, 1.6, 4.6, P), { tone: 'faint' }))
  panel.push(k.lineSvg(k.segment([20, FRONT + 2.4, BZ + 26], [23.6, FRONT + 2.4, BZ + 29.6], P), { tone: 'hi' }))
  if (caption) {
    panel.push(k.faceTextSvg(k.sideMatrix([-35, FRONT], BZ + 10, P, 'left'), caption, { size: 4.4, tone: 'mid', anchor: 'middle' }))
  }
  const wheel = G.frameAlong([HEAD.x + HEAD.w, 0, BZ + 30], [1, 0, 0])
  panel.push(k.solidSvg(G.disc(0, 2.4, 7.2, wheel, P), { tone: 'mid' }))
  panel.push(k.lineSvg(G.circleOf(wheel, 2.5, 5.4, P), { tone: 'faint' }))
  panel.push(k.lineSvg(G.spokesOf(wheel, 2.5, 2.6, 5.2, 4, P), { tone: 'hi' }))
  out.push(part('cine-panel', 3, panel))

  // ---- film path: supply reel → gate → take-up --------------------------
  const film = []
  const guide = G.frameAlong([-64, FRONT + 1.4, BZ + 58], [0, 1, 0])
  film.push(k.solidSvg(G.disc(0, 2.6, 3.4, guide, P), { tone: 'hi' }))
  film.push(k.lineSvg(G.circleOf(guide, 2.7, 1.8, P), { tone: 'faint' }))
  const path = [
    [-58, REEL_Y, REEL_Z - REEL_R + 3],
    [-58, 2, BZ + 72],
    [-64, FRONT + 1.2, BZ + 58],
    [-64, FRONT + 1.2, BZ + 18],
    [-12, FRONT + 1.2, BZ + 18],
    [-12, FRONT + 1.2, BZ + 48],
    [-6, 4, BZ + 66],
    [-6, REEL_Y, REEL_Z - REEL_R + 3],
  ]
  film.push(k.lineSvg(k.pathOf(path.map(([x, y, z]) => k.iso([x, y, z], P))), { tone: 'mid', className: 'home-cine-film' }))
  for (const [x, z] of [[-64, BZ + 58], [-64, BZ + 18], [-12, BZ + 18], [-12, BZ + 48]]) {
    const F = G.frameAlong([x, FRONT + 1.4, z], [0, 1, 0])
    film.push(k.solidSvg(G.disc(0, 1.8, 2.6, F, P), { tone: 'hi' }))
    film.push(k.lineSvg(G.circleOf(F, 1.9, 1.2, P), { tone: 'faint' }))
  }
  for (let i = 0; i < 18; i++) {
    const t = i / 17
    const seg = path[Math.min(path.length - 2, Math.floor(t * (path.length - 1)))]
    const nxt = path[Math.min(path.length - 1, Math.floor(t * (path.length - 1)) + 1)]
    const p = [0, 1, 2].map(j => seg[j] + (nxt[j] - seg[j]) * ((t * (path.length - 1)) % 1))
    film.push(k.dotsSvg([k.iso([p[0], p[1] + 1.3, p[2]], P)], { size: 0.5, tone: 'hi' }))
  }
  out.push(part('cine-gate', 5, film))

  // ---- barrel and hood --------------------------------------------------
  const lens = []
  lens.push(solid({ x: HEAD.x + 4, y: -12, w: 16, d: 24, r: 2 }, BZ + 50, 14, P, 'mid'))
  lens.push(k.solidSvg(G.solidOf([
    [0, 7], [2, 7], [2, 8.4], [10, 8.4], [10, 7.2], [18, 7.2], [18, 9.2], [26, 9.2], [26, 7.6],
  ], LENS, P), { tone: 'hi' }))
  const brass = G.ringBand(-2, 3.4, 7, 9.6, LENS, P)
  lens.push(`<path class="home-brass" d="${[...brass.shades, brass.top].join('')}"/>`)
  lens.push(k.lineSvg(G.arcOf(LENS, 3.4, 9.6, P), { tone: 'lo' }))
  lens.push(k.lineSvg(G.arcOf(LENS, 10, 8.4, P), { tone: 'faint' }))
  lens.push(k.lineSvg(G.arcOf(LENS, 18, 7.2, P), { tone: 'faint' }))
  out.push(part('cine-lens', 6, lens))

  // ---- the two reels on their arms --------------------------------------
  const reels = []
  for (const x of [-58, -6]) {
    reels.push(k.solidSvg(k.slabOf({ x: x - 3.4, y: -2, w: 6.8, d: 12, r: 2 }, HEAD_TOP, REEL_Z - HEAD_TOP - 10, P, 4, 0.8), { tone: 'mid' }))
    reels.push(k.solidSvg(G.disc(0, 3.4, 4.4, G.frameAlong([x, REEL_Y - 6, REEL_Z], [0, 1, 0]), P), { tone: 'mid' }))
  }
  for (const [index, x] of [-58, -6].entries()) {
    const F = G.frameAlong([x, REEL_Y, REEL_Z], [0, 1, 0])
    reels.push('<g class="home-cine-mech">')
    reels.push(`<g class="home-reel-spin" data-reel="${index === 0 ? 'a' : 'b'}">`)
    reels.push(k.solidSvg(G.disc(0, 3, REEL_R, F, P), { tone: 'mid', className: 'home-cine-reel' }))
    reels.push(k.solidSvg(G.ringBand(2.2, 3.8, REEL_R - 2, REEL_R, F, P), { tone: 'hi' }))
    reels.push(k.lineSvg(G.spokesOf(F, 3.6, 4.4, REEL_R - 3, 4, P, { phase: 0.4 }), { tone: 'hi' }))
    reels.push(k.lineSvg(G.circleOf(F, 3.9, REEL_R - 5.5, P), { tone: 'faint' }))
    reels.push(k.lineSvg(k.pathOf(G.spiral(F, 4.2, REEL_R - 8.5, REEL_R - 2.4, 0, Math.PI * 5.2, 60).map(q => k.iso(q, P))), { tone: 'mid' }))
    reels.push('</g>')
    reels.push(k.solidSvg(G.disc(3.2, 5.4, 3.6, F, P), { tone: 'hi' }))
    reels.push(k.lineSvg(G.circleOf(F, 5.5, 1.4, P), { tone: 'faint' }))
    reels.push('</g>')
  }
  out.push(part('cine-reels', 7, reels))

  // ---- cable and shutter ------------------------------------------------
  const mech = []
  const route = G.fillet([[LAMP.x + 6, -6, BZ + 34], [LAMP.x + 2, -10, BZ + 26], [HEAD.x + HEAD.w + 6, -12, BZ + 24], [HEAD.x + HEAD.w + 1, -10, BZ + 30]], 6, { P, tube: 2.2 })
  for (const piece of tubePieces(route, 2.2, P, { maxLength: 22 }))
    mech.push(tubeSvg(piece, { tone: 'lo' }))
  const shutter = G.frameAlong([-35, 10, BZ + 44], [0, 1, 0])
  mech.push('<g class="home-cine-mech">')
  mech.push(k.solidSvg(G.disc(0, 1.6, 8.4, shutter, P), { tone: 'lo' }))
  mech.push(k.solidSvg(G.disc(1.2, 2.6, 4.2, shutter, P), { tone: 'mid' }))
  mech.push('</g>')
  out.push(part('cine-gate', 9, mech))

  return out.join('')
}

export function cinemaBounds() {
  return [
    ...k.boxCorners(BASE, BZ - 8, BZ + 4),
    ...k.boxCorners(LAMP, BZ + 2, BZ + 38),
    ...k.boxCorners(HEAD, BZ + 2, HEAD_TOP + 2),
    [-58 - REEL_R, REEL_Y + 6, REEL_Z + REEL_R],
    [-6 + REEL_R, REEL_Y + 6, REEL_Z - REEL_R],
    [MOUTH[0] - 8, MOUTH[1], MOUTH[2] + 8],
  ]
}
