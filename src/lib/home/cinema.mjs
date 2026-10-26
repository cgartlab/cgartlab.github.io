import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'
import { faceMatrix, facePath, frameOf } from './frame.mjs'

/**
 * Module 02 — the film projector that carries "作品".
 *
 * The machine stands turned off the camera: yawed 45° to the right (YAW = -45,
 * which swings the front normal toward +x on the page), so the plate with the
 * knobs has turned away to the reader's right and the left flank — the side the
 * film is threaded on — is the face we read. Everything is built in that one
 * local frame (u across, v out of the front, w up from the deck), which is why a
 * plan, a slab and a face are all the same code: `frameOf` maps them into world
 * axes and `prismOf` re-shades them with the kit's four tones, so an angled box
 * still belongs to the same drawing.
 *
 * The lens keeps its world aim. A projector throws its picture at the room, not
 * at the wall it happens to face, so the barrel is a swivel head on the
 * lamphouse: it leaves the mouth at 45° up-left whatever the body is doing, and
 * the cone still lands off the page (see `.home-projection` in home.css).
 *
 * Motion lives in `<g class="home-cine-mech">`: the two reels, the strip
 * running through the gate, and the shutter behind the lens. Nothing in there
 * turns until the assembly has landed — the CSS holds every running beat until
 * 900 ms, after the last `.home-part` (the cone, 880 ms). That class is also
 * the contract the screening layer reads: the machine is threaded and running,
 * so the picture may play.
 *
 * Far to near: beam, feet, shell, front plate, lamphouse, barrel, gate, reels.
 */

const YAW = -45
const F = frameOf({ yaw: YAW, origin: [40, 0, TOP] })

const FOOT = 4
const BODY = { x: -37, y: -20, w: 74, d: 40, r: 6 }
const BODY_H = 34
const LID_Z = FOOT + BODY_H
const DECK = LID_Z + 2.4
const FRONT = BODY.y + BODY.d
const ROOF = { x: -34, y: -17, w: 68, d: 34, r: 4 }

const LAMP = { x: -33, y: -16, w: 12, d: 9, r: 2 }
const LAMP_TOP = 50
const MOUNT = { x: -32, y: -15, w: 10, d: 7, r: 1.6 }
const MOUNT_TOP = 52.5

const REEL_R = 12
const REEL_W = DECK + 1.4 + REEL_R
const REEL_D = 2.6
const REELS = [
  { id: 'b', u: 15, v: -3 }, // take-up, the far one
  { id: 'a', u: -12, v: -3 }, // supply, nearest the reader
]

const GATE_V = 8.5
const GATE_W = [25.5, 32.5]
const SHUTTER = { v: -8, w: 28.5, r: 5 }

// the barrel points up and to the left; at azimuth 90 that is 45 degrees on
// screen, which is where the picture has to come from. It is a world aim, so
// the yaw of the body never bends the beam.
const MOUTH_L = [-27, -11.5, MOUNT_TOP]
const MOUTH = F.at(...MOUTH_L)
const AIM = (() => {
  const d = [-1, 0, 1.05]
  const len = Math.hypot(...d)
  return [d[0] / len, d[1] / len, d[2] / len]
})()
const BARREL = G.frameAlong(MOUTH, AIM)

/** The machine assembles itself in eight beats; `--step` carries the order. */
const STEPS = { feet: 0, body: 1, panel: 2, hump: 3, lens: 4, gate: 5, reels: 6, beam: 7 }

/**
 * One contiguous run of the painter's order, wrapped as an assemblable part.
 *
 * The name is prefixed: `data-part` is a module-agnostic selector, and
 * labels.css already claims `feet` and `body` for its own machine with a
 * `.home-stage`-scoped rule that outranks an unprefixed one. Namespacing keeps
 * this machine's beats its own — the same reason the rack calls its base
 * `plinth` rather than `base`.
 */
const part = (name, inner) =>
  `<g class="home-part" data-part="cine-${name}" style="--step:${STEPS[name]}">${inner.join('')}</g>`

// ---------------------------------------------------------------------------
// the local frame, as drawing primitives
// ---------------------------------------------------------------------------

/** A lathe frame standing on the machine's own axes: the axis is local up. */
const upFrame = (w) => ({ o: F.at(0, 0, w), a: [0, 0, 1], u: F.dir(1, 0, 0), v: F.dir(0, 1, 0) })

/**
 * A yawed slab: a rounded plan extruded up the machine's own vertical.
 * `prismOf` sorts the side faces against the camera and shades each one with
 * the kit's bands, so a box that is not square to the world still reads.
 */
function slabSvg(plan, w0, h, P, { tone = 'mid', steps = 6, className } = {}) {
  return k.solidSvg(G.prismOf(upFrame(w0), k.ringOf(plan, steps), 0, h, P), { tone, className })
}

/** The outline of a plan at one height, in the machine's own axes. */
const ringAt = (plan, w, P, steps = 6) =>
  k.pathOf(k.ringOf(plan, steps).map(([u, v]) => k.iso(F.at(u, v, w), P)), true)

/** A line between two points of the local frame. */
const seg = (a, b, P, tone = 'faint') =>
  k.lineSvg(k.pathOf([k.iso(F.at(...a), P), k.iso(F.at(...b), P)]), { tone })

/** A quad on a local plane: the caller gives the four corners in order. */
const face = (points, P) => facePath(F, points, P)

/**
 * The affine map from a local plane to the page. A disc drawn in the machine's
 * own plane is an ellipse on screen, and it has to turn *in that plane*: the
 * matrix carries the projection and the spinning group inside it stays a
 * circle, so a screen-space `rotate` is exactly the reel turning on its axle.
 */
function planeMatrix(plane, P) {
  const o = k.iso(F.at(...plane.at), P)
  const a = k.iso(F.at(plane.at[0] + plane.u[0], plane.at[1] + plane.u[1], plane.at[2] + plane.u[2]), P)
  const b = k.iso(F.at(plane.at[0] + plane.v[0], plane.at[1] + plane.v[1], plane.at[2] + plane.v[2]), P)
  const f = (n) => Number(n.toFixed(4))
  return `translate(${f(o[0])} ${f(o[1])}) matrix(${f(a[0] - o[0])} ${f(a[1] - o[1])} ${f(b[0] - o[0])} ${f(b[1] - o[1])} 0 0)`
}

/** The machine's own vertical plane (v out, w up) at one point. */
const upPlane = (u, v, w) => ({ at: [u, v, w], u: [0, 1, 0], v: [0, 0, 1] })

/** Radial strokes: the teeth on a reel's rim, or its spokes. */
const rays = (r0, r1, count, phase = 0) =>
  Array.from({ length: count }, (_, i) => {
    const t = phase + (i / count) * Math.PI * 2
    const c = Math.cos(t)
    const s = Math.sin(t)
    return `M${(r0 * c).toFixed(2)} ${(r0 * s).toFixed(2)}L${(r1 * c).toFixed(2)} ${(r1 * s).toFixed(2)}`
  }).join('')

/** A wedge of a disc, for a shutter blade. */
function sector(r, a0, a1, steps = 12) {
  const points = [[0, 0]]
  for (let i = 0; i <= steps; i++) {
    const t = a0 + ((a1 - a0) * i) / steps
    points.push([r * Math.cos(t), r * Math.sin(t)])
  }
  return k.pathOf(points, true)
}

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

// ---------------------------------------------------------------------------
// the moving parts
// ---------------------------------------------------------------------------

/**
 * One reel: a flange, a coil of film, five spokes and a ring of sprocket
 * teeth, all drawn in the machine's own vertical plane so the projection
 * squashes them into the ellipse the yaw asks for. The `<g>` that turns holds
 * a circle, so `transform-box: fill-box` + `rotate` is a true axle turn rather
 * than a wobble of an ellipse.
 */
function reelSvg(reel, P) {
  const faceM = planeMatrix(upPlane(reel.u, reel.v, REEL_W), P)
  const backM = planeMatrix(upPlane(reel.u + REEL_D, reel.v, REEL_W), P)
  const hubM = planeMatrix(upPlane(reel.u - 1.4, reel.v, REEL_W), P)

  const back = `<g class="home-cine-reel" transform="${backM}"><circle class="iso-shade" r="${REEL_R + 0.9}"/></g>`

  const faceG = [
    `<circle class="iso-shade" r="${REEL_R + 0.9}"/>`,
    `<circle class="home-cine-coil" r="${REEL_R - 3.4}"/>`,
    `<circle class="iso-shade" r="4.6"/>`,
    `<path class="iso-line" data-tone="hi" d="${rays(4.6, REEL_R - 3.4, 5, 0.35)}"/>`,
    `<circle class="iso-shade" r="3.4"/>`,
    `<circle class="iso-top" r="1.3"/>`,
    `<circle class="iso-line" data-tone="mid" r="${REEL_R + 0.9}"/>`,
    `<path class="iso-line" data-tone="lo" d="${rays(REEL_R + 1.2, REEL_R + 2.4, 16)}"/>`,
  ].join('')

  const hub = `<g class="home-cine-reel" transform="${hubM}">`
    + `<circle class="iso-top" r="2.8"/>`
    + `<circle class="iso-line" data-tone="mid" r="2.8"/>`
    + `<circle class="iso-line" data-tone="faint" r="1"/>`
    + '</g>'

  // the matrix is the *outer* group: the spin happens inside it, so the reel
  // turns on its axle and the projection squashes the turn, not the disc
  return back
    + `<g class="home-cine-mech"><g class="home-cine-reel" transform="${faceM}"><g class="home-reel-spin" data-reel="${reel.id}">${faceG}</g></g></g>`
    + hub
}

/** The reel's seat: a short boss on the deck, so the reel stands on the roof. */
function reelSeat(reel, P) {
  const [px, py] = F.at(reel.u, reel.v, 0)
  return k.solidSvg(k.cylinder(px, py, 4.2, TOP + DECK, 3.4, P, 18), { tone: 'mid' })
    + k.lineSvg(k.sideArc(px, py, 4.2, TOP + DECK + 1.2, P, 16), { tone: 'faint' })
}

/**
 * The shutter: two blades on a disc, seen through the lamphouse window on the
 * flank. It sits in the same plane as the reels, so the same matrix trick turns
 * it, and it runs several times faster than they do.
 */
function shutterSvg(P) {
  const m = planeMatrix(upPlane(-37.6, SHUTTER.v, SHUTTER.w), P)
  const blades = [
    `<circle class="iso-shade" r="${SHUTTER.r + 0.8}"/>`,
    `<circle class="home-cine-blade" r="${SHUTTER.r}"/>`,
    `<path class="home-cine-blade-light" d="${sector(SHUTTER.r * 0.94, -0.36, 0.36)}"/>`,
    `<path class="home-cine-blade-light" d="${sector(SHUTTER.r * 0.94, Math.PI - 0.36, Math.PI + 0.36)}"/>`,
    `<circle class="iso-top" r="1.2"/>`,
    `<circle class="iso-line" data-tone="mid" r="${SHUTTER.r + 0.8}"/>`,
  ].join('')
  return `<g class="home-cine-mech"><g transform="${m}"><g class="home-cine-shutter">${blades}</g></g></g>`
}

/**
 * The film: supply reel → over the roof → down the flank → a hanging loop →
 * up through the gate → back over the roof → the take-up reel. Two strokes:
 * the strip itself, and a dashed perforation line whose offset the CSS walks,
 * so the film reads as travelling rather than as a painted band.
 */
const FILM = [
  [-12, -6.5, REEL_W - 11.3],
  [-25, -5.5, 41],
  [-34.5, -2, 38],
  [-37.4, 0, 32],
  [-37.4, 2, 24],
  [-36.4, 5, 17.5],
  [-34.6, 8, 15],
  [-33.6, 11, 19],
  [-35.6, 9, 26],
  [-36.8, 8, 31],
  [-35, 6.5, 36.5],
  [-28, 2, 39.5],
  [-18, -2, 41],
  [15, -9, REEL_W - 11.3],
]

function filmSvg(P) {
  const d = k.pathOf(G.fillet(FILM, 2.4).map((point) => k.iso(F.at(...point), P)))
  return `<g class="home-cine-mech">`
    + `<path class="home-cine-film" d="${d}"/>`
    + `<path class="home-cine-film-perf" d="${d}"/>`
    + '</g>'
}

// ---------------------------------------------------------------------------

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

  // ---- feet: four castors under the yawed shell, far to near ------------
  const posts = [[-28, -13], [28, -13], [-28, 13], [28, 13]]
    .map(([u, v]) => ({ u, v, d: k.depthOf(F.at(u, v, 0), P) }))
    .sort((a, b) => a.d - b.d)
  for (const { u, v } of posts) {
    const [x, y] = F.at(u, v, 0)
    feet.push(k.solidSvg(k.cylinder(x, y, 4.6, TOP, FOOT + 1, P, 16), { tone: 'lo' }))
    feet.push(k.lineSvg(k.sideArc(x, y, 4.6, TOP + 1.6, P, 14), { tone: 'faint' }))
  }

  // ---- shell: one yawed slab, a seam, the roof --------------------------
  body.push(slabSvg(BODY, FOOT, BODY_H, P, { tone: 'mid', className: 'home-cine-body' }))
  body.push(k.lineSvg(ringAt(BODY, LID_Z - 5, P), { tone: 'faint' }))
  body.push(slabSvg(ROOF, LID_Z, DECK - LID_Z, P, { tone: 'hi', className: 'home-cine-body' }))
  body.push(k.lineSvg(ringAt({ ...ROOF, x: ROOF.x + 3, y: ROOF.y + 3, w: ROOF.w - 6, d: ROOF.d - 6, r: 2 }, DECK, P), { tone: 'faint' }))
  // the flank the film is threaded on gets the machined detail: a vent band
  // low down and a seam that carries the eye from the foot to the gate
  for (let i = 0; i < 5; i++) {
    const w = 6.4 + i * 1.5
    body.push(seg([BODY.x - 0.2, -15, w], [BODY.x - 0.2, -1, w], P, 'faint'))
  }
  body.push(seg([BODY.x - 0.2, -17.5, 5], [BODY.x - 0.2, 16, 5], P, 'faint'))

  // ---- front plate: turned away to the right. Two knobs, a rocker, the ----
  // caption. A plate on the frame's own front face, so it foreshortens with
  // the machine instead of standing square to the camera.
  const plate = { x: -27, y: FRONT, w: 54, d: 1.8, r: 2 }
  const PLATE_W0 = 11
  const PLATE_W1 = 31
  const PF = FRONT + 1.9
  panel.push(slabSvg(plate, PLATE_W0, PLATE_W1 - PLATE_W0, P, { tone: 'mid' }))
  panel.push(k.lineSvg(face([[-25, PF, PLATE_W0 + 1.8], [-25, PF, PLATE_W1 - 1.8], [25, PF, PLATE_W1 - 1.8], [25, PF, PLATE_W0 + 1.8]], P), { tone: 'faint' }))
  for (const u of [-19, -8]) {
    const knob = G.frameAlong(F.at(u, PF, 23), F.dir(0, 1, 0))
    panel.push(k.solidSvg(G.disc(0, 2.2, 3.4, knob, P), { tone: 'hi' }))
    panel.push(k.lineSvg(G.circleOf(knob, 2.3, 3.4, P), { tone: 'mid' }))
    panel.push(seg([u, PF + 2.4, 23], [u, PF + 2.4, 26.8], P, 'hi'))
  }
  panel.push(slabSvg({ x: 2, y: FRONT - 1.2, w: 13, d: 3, r: 1 }, 24, 8, P, { tone: 'lo' }))
  panel.push(slabSvg({ x: 3, y: FRONT + 1.2, w: 11, d: 1.6, r: 0.8 }, 24.6, 3.2, P, { tone: 'hi', steps: 4 }))
  panel.push(slabSvg({ x: 3, y: FRONT + 1.2, w: 11, d: 1.6, r: 0.8 }, 28.2, 3.2, P, { tone: 'mid', steps: 4 }))
  if (caption)
    panel.push(k.faceTextSvg(faceMatrix(F, [8.5, PF + 0.2, 17.5], [1, 0, 0], [0, 0, -1], P), caption, { size: 6.6, tone: 'hi', anchor: 'middle' }))

  // ---- lamphouse: the box the light is born in --------------------------
  hump.push(slabSvg(LAMP, DECK, LAMP_TOP - DECK, P, { tone: 'mid', className: 'home-cine-body' }))
  hump.push(k.lineSvg(ringAt({ ...LAMP, x: LAMP.x + 2, y: LAMP.y + 2, w: LAMP.w - 4, d: LAMP.d - 4, r: 1 }, LAMP_TOP, P), { tone: 'faint' }))
  for (let i = 0; i < 3; i++) {
    const w = LAMP_TOP - 2.6 - i * 2
    hump.push(seg([LAMP.x + 2, LAMP.y + LAMP.d + 0.2, w], [LAMP.x + LAMP.w - 2, LAMP.y + LAMP.d + 0.2, w], P, 'hi'))
  }

  // ---- lens mount and the swivel barrel, still aimed 45° up-left --------
  lens.push(slabSvg(MOUNT, LAMP_TOP, MOUNT_TOP - LAMP_TOP, P, { tone: 'mid' }))
  lens.push(k.solidSvg(G.solidOf([[0, 5.4], [2, 5.4], [2, 6.8], [7.4, 6.8], [7.4, 5.6], [11.6, 5.6], [11.6, 7.4], [17, 7.4]], BARREL, P), { tone: 'hi' }))
  const brass = G.ringBand(-1.6, 2.8, 5.4, 7.4, BARREL, P)
  lens.push(`<path class="home-brass" d="${[...brass.shades, brass.top].join('')}"/>`)
  lens.push(k.lineSvg(G.arcOf(BARREL, 2.8, 7.4, P), { tone: 'lo' }))
  lens.push(k.lineSvg(G.arcOf(BARREL, 11.6, 7.4, P), { tone: 'lo' }))

  // ---- gate: the shutter behind the lens, the plate the film runs -------
  // through, and the strip itself, threaded over the roof from reel to reel
  gate.push(shutterSvg(P))
  gate.push(`<g class="home-cine-gate">${slabSvg({ x: -37.9, y: GATE_V - 2.6, w: 2.2, d: 5.2, r: 0.8 }, GATE_W[0], GATE_W[1] - GATE_W[0], P, { tone: 'lo' })}</g>`)
  gate.push(k.lineSvg(face([[-37.9, GATE_V - 2.2, GATE_W[0] + 1], [-37.9, GATE_V - 2.2, GATE_W[1] - 1], [-37.9, GATE_V + 2.2, GATE_W[1] - 1], [-37.9, GATE_V + 2.2, GATE_W[0] + 1]], P), { tone: 'faint' }))
  gate.push(filmSvg(P))

  // ---- reels last: one group each, so a reel turns about its own hub -----
  for (const reel of REELS)
    reels.push(reelSeat(reel, P) + reelSvg(reel, P))

  return [
    defs,
    part('beam', beam),
    part('feet', feet),
    part('body', body),
    part('panel', panel),
    part('hump', hump),
    part('lens', lens),
    part('gate', gate),
    ...reels.map((reel) => part('reels', [reel])),
  ].join('')
}

/** Machine-only: the cone and the film's reach are not part of the footprint. */
export function cinemaBounds() {
  const out = []
  for (const u of [BODY.x, BODY.x + BODY.w]) {
    for (const v of [BODY.y, BODY.y + BODY.d])
      out.push(F.at(u, v, 0), F.at(u, v, DECK))
  }
  for (const u of [LAMP.x, LAMP.x + LAMP.w]) {
    for (const v of [LAMP.y, LAMP.y + LAMP.d])
      out.push(F.at(u, v, LAMP_TOP))
  }
  for (const reel of REELS) {
    out.push(F.at(reel.u, reel.v - REEL_R - 2.2, REEL_W))
    out.push(F.at(reel.u, reel.v + REEL_R + 2.2, REEL_W))
    out.push(F.at(reel.u, reel.v, REEL_W + REEL_R + 2.2))
  }
  out.push(MOUTH, [MOUTH[0] + AIM[0] * 17, MOUTH[1], MOUTH[2] + AIM[2] * 17])
  return out
}
