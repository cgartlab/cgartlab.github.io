import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { tubePieces, tubeSvg } from '../anatomy/tube.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 02 — the film projector that carries "作品".
 *
 * An old cinema head, built the way the real machine is built: a cast base that
 * fills the lift platform (no round plinth), a lamphouse box at the back right,
 * the optical head standing beside it with the gate on its face, the barrel
 * raked up and to the left, and the two reels carried on a gantry above.
 * The picture itself is a page-level layer (see `.home-projection` in
 * home.css); the cone here is only the throw, and it is a straight-sided
 * wedge — two straight lines from the lens hood to the far corners.
 *
 * Far to near: beam, feet, base, reel gantry, lamphouse, head, ballast, flue,
 * gate, barrel, guides, strip, pressure plate, spindles, reels, controls,
 * hand-wheel, lamphouse door, nameplate, jumper cable.
 *
 * The camera looks down the +y axis, so a face that points along ±x has no
 * width on the page: every plate, hinge and label below therefore lives on a
 * front face (y = const) or a top face (z = const).
 */

const BASE = { x: -92, y: -34, w: 184, d: 70, r: 10 }
const FOOT = 8
const BZ = TOP + FOOT + 4
const LAMP = { x: 8, y: -24, w: 78, d: 48, r: 6 }
const HEAD = { x: -80, y: -26, w: 86, d: 52, r: 6 }
const FRONT = HEAD.y + HEAD.d
const HEAD_TOP = BZ + 66
const LENS_BASE = [-62, 0, BZ + 50]

// the gate's aperture band on the head's face, and the plane the strip rides on
const GATE_Z = BZ + 22
const GATE_TOP = BZ + 52
const FILM_Y = FRONT + 1.8

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

const tenth = value => Math.round(value * 10) / 10

const solid = (plan, z, h, P, tone = 'mid', steps = 4, bevel = 0.5, className) =>
  k.solidSvg(k.slabOf(plan, z, h, P, steps, bevel), { tone, className })

export function buildCinema(P, options = {}) {
  const caption = options.caption || ''
  const out = []
  const part = (name, step, items) =>
    `<g class="home-part" data-part="${name}" style="--step:${step}">${items.join('')}</g>`

  // a rectangle drawn on a front face: the only plane with width on the page
  const faceRect = (x0, x1, z0, z1, y) =>
    k.pathOf([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]].map(point => k.iso(point, P)), true)

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
  out.push(part('cine-beam', 0, [
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
  out.push(part('cine-base', 1, base))

  // ---- the reel gantry --------------------------------------------------
  // A cast saddle bolted to the head's lid carries one cross beam; the two arms
  // rise off it and the reels drop onto their collars. The beam is the only
  // part of the gantry that stays visible once the reels are on, because the
  // flanges cover everything above the lid but the 8 mm under them.
  const gantry = []
  gantry.push(solid({ x: -70, y: -3, w: 78, d: 15, r: 3 }, HEAD_TOP, 3, P, 'lo', 4, 0.8, 'home-cine-cast'))
  gantry.push(solid({ x: -70, y: 1, w: 78, d: 6, r: 2 }, HEAD_TOP + 3, 5, P, 'mid', 4, 0.6, 'home-cine-cast'))
  for (const x of [-58, -6]) {
    gantry.push(solid({ x: x - 3.4, y: 0, w: 6.8, d: 9, r: 2 }, HEAD_TOP + 8, REEL_Z - HEAD_TOP - 18, P, 'mid', 4, 0.8, 'home-cine-cast'))
    gantry.push(k.lineSvg(k.segment([x - 2.6, 0.2, HEAD_TOP + 9], [x - 2.6, 8.6, HEAD_TOP + 9], P), { tone: 'faint' }))
  }
  for (const [x, y] of [[-66, 9], [4, 9], [-66, -1], [4, -1]]) {
    gantry.push(k.dotsSvg([k.iso([x, y, HEAD_TOP + 3.4], P)], { size: 0.9, tone: 'mid' }))
  }
  out.push(part('cine-yoke', 2, gantry))

  // ---- lamphouse --------------------------------------------------------
  const lamp = []
  lamp.push(k.solidSvg(k.slabOf(LAMP, BZ + 2, 34, P, 6, 1.6), { tone: 'mid', className: 'home-cine-body' }))
  lamp.push(k.lineSvg(k.sideSeam(LAMP, BZ + 27, P, 6), { tone: 'faint' }))
  lamp.push(solid(k.insetPlan(LAMP, 4), BZ + 36, 2, P, 'hi', 5, 0.6))
  for (let i = 0; i < 7; i++) {
    lamp.push(k.lineSvg(k.segment([LAMP.x + LAMP.w - 14, LAMP.y + 8 + i * 4, BZ + 34.6], [LAMP.x + LAMP.w - 5, LAMP.y + 8 + i * 4, BZ + 34.6], P), { tone: 'hi' }))
  }
  // cooling louvres on the front strip left of the door
  for (let i = 0; i < 6; i++) {
    lamp.push(k.lineSvg(k.segment([10, LAMP.y + LAMP.d + 0.3, BZ + 13 + i * 2.4], [26, LAMP.y + LAMP.d + 0.3, BZ + 13 + i * 2.4], P), { tone: 'mid' }))
  }
  out.push(part('cine-lamp', 3, lamp))

  // ---- the optical head -------------------------------------------------
  const head = []
  head.push(k.solidSvg(k.slabOf(HEAD, BZ + 2, 64, P, 6, 1.8), { tone: 'mid', className: 'home-cine-body' }))
  head.push(k.lineSvg(k.sideSeam(HEAD, BZ + 46, P, 6), { tone: 'faint' }))
  head.push(k.lineSvg(k.planOutline(k.insetPlan(HEAD, 4), HEAD_TOP + 2, P, 5), { tone: 'faint' }))
  out.push(part('cine-head', 4, head))

  // ---- ballast on the lamphouse lid -------------------------------------
  // The arc needs a transformer; it is bolted to the lid behind the flue, so it
  // reads as one more casting on the same box rather than a loose crate.
  const ballastPlan = { x: 18, y: -20, w: 40, d: 14, r: 2 }
  const ballast = []
  ballast.push(solid(ballastPlan, BZ + 38, 18, P, 'mid', 4, 1, 'home-cine-body'))
  ballast.push(solid(k.insetPlan(ballastPlan, 2.6), BZ + 56, 2.4, P, 'hi', 4, 0.5))
  for (let i = 0; i < 6; i++) {
    ballast.push(k.lineSvg(k.segment([22, -18 + i * 2.4, BZ + 56.2], [54, -18 + i * 2.4, BZ + 56.2], P), { tone: 'faint' }))
  }
  ballast.push(k.faceTextSvg(k.sideMatrix([22, -6], BZ + 46, P, 'left'), 'BALLAST', { size: 2.6, tone: 'faint' }))
  out.push(part('cine-transformer', 5, ballast))

  // ---- the flue ---------------------------------------------------------
  // A carbon arc throws off a lot of hot gas; the flue is the one part of the
  // machine that has to leave the silhouette of the boxes.
  const flueX = 66
  const flueY = -12
  const flue = []
  flue.push(k.solidSvg(k.cylinder(flueX, flueY, 6.4, BZ + 38, 3.4, P, 16), { tone: 'lo' }))
  const duct = G.fillet([[flueX, flueY, BZ + 40], [flueX, flueY, BZ + 76]], 4, { P, tube: 4.2 })
  for (const piece of tubePieces(duct, 4.2, P, { maxLength: 18 })) {
    flue.push(`<g class="home-cine-pipe">${tubeSvg(piece, { tone: 'lo' })}</g>`)
  }
  flue.push(k.lineSvg(k.ring(flueX, flueY, 4.6, BZ + 58, P, 16), { tone: 'faint' }))
  flue.push(k.solidSvg(G.solidOf([[0, 4.4], [2.6, 6.6], [4.8, 6.6], [5.6, 3.2]], G.frameAlong([flueX, flueY, BZ + 76], [0, 0, 1]), P), { tone: 'mid' }))
  out.push(part('cine-stack', 6, flue))

  // ---- gate boss and the shutter port -----------------------------------
  const gatePlan = { x: -52, y: FRONT - 1.6, w: 34, d: 3, r: 3 }
  const gate = []
  gate.push(solid(gatePlan, GATE_Z, 30, P, 'lo', 5, 1, 'home-cine-gate'))
  gate.push(k.lineSvg(k.planOutline(k.insetPlan(gatePlan, 3), GATE_TOP, P, 5), { tone: 'mid' }))
  gate.push(k.faceTextSvg(k.topMatrix([-50, gatePlan.y + 1.2], GATE_TOP + 0.3, P), 'GATE', { size: 2.4, tone: 'faint' }))
  // the aperture the strip runs through: a dark slot on the gate's face
  gate.push(`<path class="home-cine-slot" d="${faceRect(-46, -40, GATE_Z, GATE_TOP, gatePlan.y + gatePlan.d + 0.2)}"/>`)
  const port = G.frameAlong([-35, FRONT + 0.4, BZ + 58], [0, 1, 0])
  gate.push(k.solidSvg(G.disc(0, 1.4, 7, port, P), { tone: 'lo', className: 'home-cine-port' }))
  gate.push('<g class="home-cine-mech">')
  gate.push('<g class="home-cine-shutter">')
  gate.push(k.solidSvg(G.disc(1.4, 2.6, 5.6, port, P), { tone: 'mid', className: 'home-cine-blade' }))
  const half = [G.pointOf(port, 2.7, 0, 0), ...G.arcPoints(port, 2.7, 4.2, -Math.PI / 2, Math.PI / 2, 16)]
  gate.push(`<path class="home-cine-blade-light" d="${k.pathOf(half.map(point => k.iso(point, P)), true)}"/>`)
  gate.push(k.solidSvg(G.disc(2.6, 3.6, 1.6, port, P), { tone: 'lo' }))
  gate.push('</g>')
  gate.push('</g>')
  out.push(part('cine-gate', 7, gate))

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
  out.push(part('cine-lens', 8, lens))

  // ---- guide rollers ----------------------------------------------------
  // Four rollers on the head's face: they clamp the strip where it turns, so
  // they land after the strip is on but before it is threaded.
  const BEND = [
    [-56, BZ + 58],
    [-43, BZ + 50],
    [-30, BZ + 12],
    [-14, BZ + 18],
  ]
  const guide = []
  for (const [x, z] of BEND) {
    const F = G.frameAlong([x, FILM_Y + 0.6, z], [0, 1, 0])
    guide.push(k.solidSvg(G.disc(0, 1.6, 3, F, P), { tone: 'hi', className: 'home-cine-body' }))
    guide.push(k.lineSvg(G.circleOf(F, 1.7, 1.6, P), { tone: 'faint' }))
    guide.push(k.solidSvg(G.disc(1.6, 2.8, 1.2, F, P), { tone: 'lo' }))
  }
  out.push(part('cine-guide', 9, guide))

  // ---- the strip: supply reel → gate → take-up --------------------------
  // Threaded, not drawn: the band is one polyline that carries a dash exactly
  // as long as itself, so `stroke-dashoffset` walks the strip from the supply
  // hub, through the gate, to the take-up hub. The perforations pop in behind
  // it at the same rate, which is what sells the direction of travel.
  // The 520 ms below is the thread's own duration in cinema.css; the two have
  // to be changed together or the perforations fall out of step with the band.
  const path = [
    [-58, REEL_Y, REEL_Z - REEL_R + 3],
    [-56, FILM_Y, BZ + 58],
    [-56, FILM_Y, BZ + 54],
    [-43, FILM_Y, BZ + 50],
    [-43, FILM_Y, BZ + 18],
    [-30, FILM_Y, BZ + 12],
    [-14, FILM_Y, BZ + 18],
    [-14, FILM_Y, BZ + 56],
    [-6, REEL_Y, REEL_Z - REEL_R + 3],
  ]
  const flat = path.map(([x, y, z]) => k.iso([x, y, z], P).map(tenth))
  const runs = flat.map((point, index) => (index ? Math.hypot(point[0] - flat[index - 1][0], point[1] - flat[index - 1][1]) : 0))
  const filmLen = runs.reduce((sum, run) => sum + run, 0)
  // `pathLength="1"` normalises the dash to the path itself: one dash is the
  // whole strip whatever the stage is scaled to. (cinema.css also drops the
  // page-wide non-scaling stroke here — the browser measures that dash in
  // screen pixels, which cuts the tail off on a wide stage.)
  const film = [
    `<path class="iso-line home-cine-film" data-tone="mid" pathLength="1" style="stroke-dasharray:1" d="${k.pathOf(flat)}"/>`,
    '<g class="home-cine-film-perf">',
  ]
  const along = (distance) => {
    let index = 1
    let reached = runs[1]
    while (index < flat.length - 1 && reached < distance) {
      index += 1
      reached += runs[index]
    }
    const from = flat[index - 1]
    const to = flat[index]
    const span = runs[index] || 1
    const share = Math.max(0, Math.min(1, (distance - (reached - span)) / span))
    const dx = to[0] - from[0]
    const dy = to[1] - from[1]
    const size = Math.hypot(dx, dy) || 1
    return {
      x: from[0] + dx * share - (dy / size) * 0.9,
      y: from[1] + dy * share + (dx / size) * 0.9,
      share: distance / filmLen,
    }
  }
  for (let distance = 6; distance < filmLen - 6; distance += 6.4) {
    const dot = along(distance)
    film.push(`<circle cx="${dot.x.toFixed(1)}" cy="${dot.y.toFixed(1)}" r="0.55" style="--at:${Math.round(dot.share * 520)}ms"/>`)
  }
  film.push('</g>')
  out.push(part('cine-film', 10, film))

  // ---- pressure plate ---------------------------------------------------
  // The plate is smaller than the gate on purpose: the strip has to stay
  // visible where it enters and leaves, or the closure hides the threading.
  const platePlan = { x: -48, y: FILM_Y + 0.8, w: 26, d: 2.2, r: 1.6 }
  const pressure = []
  pressure.push(solid(platePlan, BZ + 32, 12, P, 'mid', 4, 0.8, 'home-cine-cast'))
  pressure.push(k.lineSvg(k.planOutline(k.insetPlan(platePlan, 2.2), BZ + 44, P, 4), { tone: 'faint' }))
  pressure.push(k.solidSvg(k.cylinder(-46, FILM_Y + 2.6, 1.4, BZ + 44, 2, P, 10), { tone: 'lo' }))
  pressure.push(k.lineSvg(k.pathOf([
    k.iso([-46, FILM_Y + 2.4, BZ + 46], P),
    k.iso([-46, FILM_Y + 5.4, BZ + 50], P),
    k.iso([-39, FILM_Y + 5.4, BZ + 50], P),
  ]), { tone: 'mid' }))
  out.push(part('cine-pressure', 11, pressure))

  // ---- reel spindles and the brake --------------------------------------
  const spindle = []
  for (const x of [-58, -6]) {
    const F = G.frameAlong([x, 0, REEL_Z], [0, 1, 0])
    spindle.push(k.solidSvg(G.disc(3, 4.6, 4.4, F, P), { tone: 'lo', className: 'home-cine-cast' }))
    spindle.push(k.solidSvg(G.disc(4.6, 17, 2.4, F, P), { tone: 'mid', className: 'home-cine-body' }))
    spindle.push(k.solidSvg(G.disc(17, 19.4, 3.2, F, P), { tone: 'lo' }))
    spindle.push(k.lineSvg(G.circleOf(F, 17.2, 2.6, P), { tone: 'faint' }))
  }
  // only the supply reel is braked: a felt shoe on the arm, riding the rim
  spindle.push(solid({ x: -66, y: 7, w: 16, d: 7, r: 1.6 }, REEL_Z - REEL_R - 4.6, 4, P, 'lo', 3, 0.6, 'home-cine-cast'))
  spindle.push(k.lineSvg(k.segment([-50, 12, REEL_Z - REEL_R - 1.2], [-56, 5, HEAD_TOP + 9], P), { tone: 'mid' }))
  spindle.push(k.dotsSvg([k.iso([-58, 9, REEL_Z - REEL_R - 0.6], P)], { size: 0.9, tone: 'mid' }))
  out.push(part('cine-spindle', 12, spindle))

  // ---- the two reels on their hubs --------------------------------------
  const reels = []
  for (const [index, x] of [-58, -6].entries()) {
    const F = G.frameAlong([x, REEL_Y, REEL_Z], [0, 1, 0])
    reels.push('<g class="home-cine-mech">')
    reels.push(`<g class="home-reel-spin" data-reel="${index === 0 ? 'a' : 'b'}">`)
    reels.push(k.solidSvg(G.disc(0, 3, REEL_R, F, P), { tone: 'mid', className: 'home-cine-reel' }))
    reels.push(k.solidSvg(G.ringBand(2.2, 3.8, REEL_R - 2, REEL_R, F, P), { tone: 'hi' }))
    reels.push(k.lineSvg(G.spokesOf(F, 3.6, 4.4, REEL_R - 3, 4, P, { phase: 0.4 }), { tone: 'hi' }))
    reels.push(k.lineSvg(G.circleOf(F, 3.9, REEL_R - 5.5, P), { tone: 'faint' }))
    reels.push(k.lineSvg(k.pathOf(G.spiral(F, 4.2, REEL_R - 8.5, REEL_R - 2.4, 0, Math.PI * 5.2, 60).map(point => k.iso(point, P))), { tone: 'mid' }))
    reels.push('</g>')
    reels.push(k.solidSvg(G.disc(3.2, 5.4, 3.6, F, P), { tone: 'hi' }))
    reels.push(k.lineSvg(G.circleOf(F, 5.5, 1.4, P), { tone: 'faint' }))
    reels.push('</g>')
  }
  out.push(part('cine-reels', 13, reels))

  // ---- louvres, control panel, hand-wheel -------------------------------
  // The head's face has one clear stretch: the left end, from the base seam to
  // the seam under the lid. That is the operator's side, so the whole control
  // panel goes there — a plate inset in the face, the framing dial at the top,
  // the two push buttons under it with the pilot lamp between them, the name at
  // the foot. The louvres move to the lamphouse, which is the part that runs
  // hot, and the framing knob goes right of the gate, where the shaft it turns
  // actually goes.
  const panel = []
  const panelPlan = { x: -78, y: FRONT - 1.2, w: 24, d: 2.4, r: 1.6 }
  panel.push(solid(panelPlan, BZ + 4, 38, P, 'mid', 4, 0.6))
  panel.push(k.lineSvg(k.planOutline(k.insetPlan(panelPlan, 1.2), BZ + 42, P, 4), { tone: 'faint' }))

  // the framing dial: the one control an operator turns with the show running
  const dial = G.frameAlong([-66, FRONT + 1.2, BZ + 31], [0, 1, 0])
  panel.push(k.solidSvg(G.disc(0, 1.5, 5.2, dial, P), { tone: 'hi' }))
  panel.push(k.lineSvg(G.circleOf(dial, 1.6, 5.2, P), { tone: 'mid' }))
  panel.push(k.lineSvg(G.circleOf(dial, 1.7, 3.6, P), { tone: 'faint' }))
  panel.push(k.lineSvg(k.segment([-65.2, FRONT + 2.7, BZ + 31.6], [-62.1, FRONT + 2.7, BZ + 34.6], P), { tone: 'lit' }))

  // the two push buttons, the lamp between them
  for (const x of [-72, -60]) {
    const F = G.frameAlong([x, FRONT + 1.2, BZ + 17.5], [0, 1, 0])
    panel.push(k.solidSvg(G.disc(0, 1.3, 2.6, F, P), { tone: 'hi' }))
    panel.push(k.lineSvg(G.circleOf(F, 1.4, 2.6, P), { tone: 'mid' }))
    panel.push(k.lineSvg(G.circleOf(F, 1.5, 1.5, P), { tone: 'faint' }))
  }
  const pilot = G.frameAlong([-66, FRONT + 1.2, BZ + 17.5], [0, 1, 0])
  panel.push(k.solidSvg(G.disc(0, 0.9, 1.2, pilot, P), { tone: 'lo' }))
  panel.push(k.lineSvg(G.circleOf(pilot, 1, 1.6, P), { tone: 'faint' }))

  if (caption) {
    panel.push(k.faceTextSvg(k.sideMatrix([-66, FRONT], BZ + 9, P, 'left'), caption, { size: 3, tone: 'faint', anchor: 'middle' }))
  }

  out.push(part('cine-panel', 14, panel))

  // ---- hand-wheel -------------------------------------------------------
  // The framing knob sits on the head's face just right of the gate, where the
  // shaft it turns actually goes: the operator cranks it and the aperture walks
  // up or down a frame. It faces +y, or it would be edge-on to the camera.
  const wheel = G.frameAlong([-3.5, FRONT + 1.6, BZ + 21], [0, 1, 0])
  const hand = []
  hand.push(k.solidSvg(G.disc(0, 1.2, 8, wheel, P), { tone: 'lo' }))
  hand.push(k.solidSvg(G.disc(1.2, 3.6, 7, wheel, P), { tone: 'mid', className: 'home-cine-body' }))
  hand.push(k.lineSvg(G.circleOf(wheel, 3.7, 5.4, P), { tone: 'faint' }))
  hand.push(k.lineSvg(G.spokesOf(wheel, 3.7, 2.6, 5.2, 4, P), { tone: 'hi' }))
  hand.push(k.solidSvg(G.disc(3.6, 5, 2.2, wheel, P), { tone: 'lo' }))
  out.push(part('cine-wheel', 15, hand))

  // ---- lamphouse door ---------------------------------------------------
  const doorPlan = { x: 28, y: LAMP.y + LAMP.d + 0.2, w: 52, d: 2.2, r: 2 }
  const door = []
  door.push(solid(doorPlan, BZ + 8, 24, P, 'mid', 4, 0.8, 'home-cine-body'))
  door.push(k.lineSvg(faceRect(32, 76, 98, 114, 26.6), { tone: 'faint' }))
  door.push(k.faceTextSvg(k.sideMatrix([34, 26.7], BZ + 12, P, 'left'), 'LAMPHOUSE', { size: 3, tone: 'faint' }))
  for (const z of [96, 110]) {
    door.push(k.solidSvg(k.cylinder(28, 25.3, 1.5, z, 4.8, P, 12), { tone: 'lo' }))
  }
  door.push(solid({ x: 76, y: 24.4, w: 4, d: 4.6, r: 1.2 }, BZ + 30, 6, P, 'lo', 3, 0.5))
  door.push(k.lineSvg(k.segment([80, 28.9, BZ + 34], [82.6, 28.9, BZ + 30], P), { tone: 'mid' }))
  out.push(part('cine-door', 16, door))

  // ---- nameplate --------------------------------------------------------
  const name = []
  name.push(solid({ x: -78, y: BASE.y + BASE.d - 9, w: 42, d: 7, r: 1.4 }, BZ + 2.4, 1.4, P, 'lo', 3, 0.3))
  name.push(k.faceTextSvg(k.sideMatrix([-57, BASE.y + BASE.d - 2], BZ + 3.6, P, 'left'), '35 · MM', { size: 3.2, tone: 'mid', anchor: 'middle' }))
  for (const x of [-74, -40]) {
    name.push(k.dotsSvg([k.iso([x, BASE.y + BASE.d - 5.5, BZ + 3.9], P)], { size: 0.8, tone: 'mid' }))
  }
  out.push(part('cine-plate', 17, name))

  // ---- jumper cable -----------------------------------------------------
  const cable = []
  const route = G.fillet([[LAMP.x + 6, -6, BZ + 34], [LAMP.x + 2, -10, BZ + 26], [HEAD.x + HEAD.w + 6, -12, BZ + 24], [HEAD.x + HEAD.w + 1, -10, BZ + 30]], 6, { P, tube: 2.2 })
  for (const piece of tubePieces(route, 2.2, P, { maxLength: 22 })) {
    cable.push(tubeSvg(piece, { tone: 'lo' }))
  }
  out.push(part('cine-wiring', 18, cable))

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
