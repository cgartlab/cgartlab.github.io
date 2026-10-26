import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { tubePieces, tubeSvg } from '../anatomy/tube.mjs'
import { PLATFORM_Z, TOP } from './chassis.mjs'
import { faceMatrix, frameOf } from './frame.mjs'

/**
 * Module 02 — the film projector that carries "作品".
 *
 * It is a turret, not a box on a plinth. The machine is socketed into the lift:
 * a turned ring of cast collars sits on the platform, two cast arms rise from
 * the ring, and the boiler hangs between them on a horizontal pivot with the
 * hand-wheel on the near arm. Everything under the boiler — the belt, the three
 * pipes — runs back down into the deck, so the device is plumbed into the
 * console rather than standing on it.
 *
 * The whole machine is built in one yawed frame (YAW = -45, so the front faces
 * down-right and the left flank faces down-left, which is the side the reader
 * reads). `frameOf` maps local (u across, v out of the front, w up from the
 * deck) into world axes, so a turned collar, a cast arm and the drum are all the
 * same code. Local w = 0 is the deck; the lift platform sits at w = SEAT.
 *
 * The lens keeps a world aim. A projector throws its picture at the room, not
 * at the wall it happens to face, so the barrel leaves the drum's shoulder on a
 * world vector that lands at 45° up-left on the page, and the beam is built in
 * screen space from the hood's own rim: it opens to the width of the page and
 * is cut off by the viewport (see `.home-cine-beam` in cinema.css).
 *
 * Motion lives in `<g class="home-cine-mech">`: the two reels, the strip running
 * through the gate, and the shutter behind the lamphouse port. Nothing turns
 * until the assembly has landed — the CSS holds every running beat to 900 ms,
 * after the last `.home-part` (the beam). That class is also the contract the
 * screening layer reads: the machine is threaded and running, so the picture
 * may play.
 *
 * Far to near: beam, socket, far arm, boiler, pipes, near arm and wheel, barrel,
 * gate and film, reels.
 */

const YAW = -45
const F = frameOf({ yaw: YAW, origin: [40, 0, TOP] })
/** The lift platform's top, in machine units: the socket sits here, not on the deck. */
const SEAT = PLATFORM_Z - TOP

const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
/** A world direction, expressed in the machine's own axes. */
const toLocal = (v) => [
  dot3(v, F.dir(1, 0, 0)),
  dot3(v, F.dir(0, 1, 0)),
  dot3(v, F.dir(0, 0, 1)),
]

// ---------------------------------------------------------------------------
// the socket: a turned, stepped ring set into the platform
// ---------------------------------------------------------------------------

const SOCKET_R = 33
const SOCKET_TOP = 8.4
const TUR = G.frameAlong(F.at(0, 0, SEAT), F.dir(0, 0, 1))
/** s is measured up from the platform: three collars and a neck. */
const SOCKET = [
  [0, SOCKET_R], [1.2, SOCKET_R], [2.4, 28], [5, 28],
  [6.2, 26], [9.4, 26], [10.6, 20], [SOCKET_TOP - SEAT, 20],
]

// ---------------------------------------------------------------------------
// the boiler: a riveted drum hung on a horizontal pivot
// ---------------------------------------------------------------------------

const DRUM_R = 14.4
const DRUM_W = 31
const DRUM_HALF = 18
const DRUM_F = G.frameAlong(F.at(-DRUM_HALF, 0, DRUM_W), F.dir(1, 0, 0))
const DRUM = [
  [0, 0], [0.8, 12.8], [1.8, DRUM_R], [2 * DRUM_HALF - 1.8, DRUM_R],
  [2 * DRUM_HALF - 0.8, 12.8], [2 * DRUM_HALF, 0],
]
/** The two riveted bands, as distances along the drum's axle. */
const BANDS = [10, 26]
/** Where the barrel leaves the drum's upper back shoulder, and where it lands. */
const BARREL_ROOT = [-11, -9, 41]
const AIM_W = G.unit3([-1, 0, 1.05])
const AIM = toLocal(AIM_W)
const HOOD_END = 15.4
const HOOD_R = 8.8
const MOUTH_L = [0, 1, 2].map((i) => BARREL_ROOT[i] + AIM[i] * HOOD_END)
const BARREL = G.frameAlong(F.at(...BARREL_ROOT), F.dir(...AIM))

/** The camera-facing flank of the drum: the normal the gauge is set square to. */
const FACE_N = G.unit3([0, 0.908, 0.418])
const faceAt = (u, out = 0) => [
  u,
  FACE_N[1] * (DRUM_R + out),
  DRUM_W + FACE_N[2] * (DRUM_R + out),
]

const GAUGE_U = 4.5
const GAUGE = G.frameAlong(F.at(...faceAt(GAUGE_U, -0.6)), F.dir(...FACE_N))

/** A point on the drum's skin, theta measured from the top toward the front. */
const onDrum = (u, theta, out = 0) => [
  u,
  Math.sin(theta) * (DRUM_R + out),
  DRUM_W + Math.cos(theta) * (DRUM_R + out),
]

// ---------------------------------------------------------------------------
// the reels: two spools on a curved arm above the boiler
// ---------------------------------------------------------------------------

const REEL_R = 8.6
const REEL_W = 53
const REEL_V = -5
const REEL_D = 2.6
const REELS = [
  { id: 'b', u: 7 }, // take-up, the far one
  { id: 'a', u: -14 }, // supply, nearest the reader
]
const GANTRY_V = -9

const GATE_U = -14
const GATE_V = 17.2
const SHUTTER = { u: -17.0, v: 2.5, w: 21.5, r: 4.6 }

/** The machine assembles itself in eight beats; `--step` carries the order. */
const STEPS = { base: 0, yoke: 1, body: 2, pipes: 3, lens: 4, gate: 5, reels: 6, beam: 7 }

/**
 * One contiguous run of the painter's order, wrapped as an assemblable part.
 *
 * The name is prefixed: `data-part` is a module-agnostic selector, and
 * labels.css already claims `feet` and `body` for its own machine with a
 * `.home-stage`-scoped rule that outranks an unprefixed one. Namespacing keeps
 * this machine's beats its own.
 */
const part = (name, inner) =>
  `<g class="home-part" data-part="cine-${name}" style="--step:${STEPS[name]}">${inner.join('')}</g>`

// ---------------------------------------------------------------------------
// the local frame, as drawing primitives
// ---------------------------------------------------------------------------

/** A line between two points of the local frame. */
const seg = (a, b, P, tone = 'faint') =>
  k.lineSvg(k.pathOf([k.iso(F.at(...a), P), k.iso(F.at(...b), P)]), { tone })

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

/** A ring of brass, emitted as one filled path. */
const brassRing = (paths) => `<path class="home-brass" d="${[...paths.shades, paths.top].join('')}"/>`

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
  const faceM = planeMatrix(upPlane(reel.u, REEL_V, REEL_W), P)
  const backM = planeMatrix(upPlane(reel.u + REEL_D, REEL_V, REEL_W), P)
  const hubM = planeMatrix(upPlane(reel.u - 1.4, REEL_V, REEL_W), P)

  const back = `<g class="home-cine-reel" transform="${backM}"><circle class="iso-shade" r="${REEL_R + 0.9}"/></g>`

  const faceG = [
    `<circle class="iso-shade" r="${REEL_R + 0.9}"/>`,
    `<circle class="home-cine-coil" r="${REEL_R - 2.4}"/>`,
    `<circle class="iso-shade" r="3.4"/>`,
    `<path class="iso-line" data-tone="hi" d="${rays(3.4, REEL_R - 2.4, 5, 0.35)}"/>`,
    `<circle class="iso-shade" r="2.6"/>`,
    `<circle class="iso-top" r="1"/>`,
    `<circle class="iso-line" data-tone="mid" r="${REEL_R + 0.9}"/>`,
    `<path class="iso-line" data-tone="lo" d="${rays(REEL_R + 1.2, REEL_R + 2.3, 16)}"/>`,
  ].join('')

  const hub = `<g class="home-cine-reel" transform="${hubM}">`
    + `<circle class="iso-top" r="2.5"/>`
    + `<circle class="iso-line" data-tone="mid" r="2.5"/>`
    + `<circle class="iso-line" data-tone="faint" r="0.9"/>`
    + '</g>'

  // the matrix is the *outer* group: the spin happens inside it, so the reel
  // turns on its axle and the projection squashes the turn, not the disc
  return back
    + `<g class="home-cine-mech"><g class="home-cine-reel" transform="${faceM}"><g class="home-reel-spin" data-reel="${reel.id}">${faceG}</g></g></g>`
    + hub
}

/**
 * The shutter: two blades on a disc, seen through the lamphouse port under the
 * pivot on the drum's near end. It sits in the same plane as the reels, so the
 * same matrix trick turns it, and it runs several times faster than they do.
 */
function shutterSvg(P) {
  const m = planeMatrix(upPlane(SHUTTER.u, SHUTTER.v, SHUTTER.w), P)
  const blades = [
    `<circle class="home-cine-port" r="${SHUTTER.r - 0.7}"/>`,
    `<circle class="home-cine-blade" r="${SHUTTER.r - 1.1}"/>`,
    `<path class="home-cine-blade-light" d="${sector(SHUTTER.r * 0.8, -0.34, 0.34)}"/>`,
    `<path class="home-cine-blade-light" d="${sector(SHUTTER.r * 0.8, Math.PI - 0.34, Math.PI + 0.34)}"/>`,
    `<circle class="iso-top" r="1"/>`,
  ].join('')
  return `<g class="home-cine-mech"><g transform="${m}"><g class="home-cine-shutter">${blades}</g></g></g>`
}

/**
 * The film: supply reel → down the drum's front → a hanging loop under the
 * gate → back up over the shoulder → the take-up reel. Two strokes: the strip
 * itself, and a dashed perforation line whose offset the CSS walks, so the film
 * reads as travelling rather than as a painted band.
 */
const FILM = [
  [-14, REEL_V, REEL_W - REEL_R],
  [-13.9, 0, 42],
  onDrum(-13.7, 0.36, 1.9),
  onDrum(-13.8, 0.8, 1.9),
  onDrum(-13.9, 1.2, 1.9),
  onDrum(-13.9, 1.62, 1.9),
  [-13.5, 15.6, 25.6],
  [-11.4, 12.6, 22.4],
  [-8.8, 8.6, 25.2],
  [-5.8, 4.2, 31.6],
  [-2.4, 0, 38.4],
  [1.6, -3, 43.4],
  [4.4, REEL_V, 44.4],
  [7, REEL_V, REEL_W - REEL_R],
]

function filmSvg(P) {
  const d = k.pathOf(G.fillet(FILM, 3, 7).map((point) => k.iso(F.at(...point), P)))
  return `<g class="home-cine-mech">`
    + `<path class="home-cine-film" d="${d}"/>`
    + `<path class="home-cine-film-perf" d="${d}"/>`
    + '</g>'
}

// ---------------------------------------------------------------------------
// the fixed parts
// ---------------------------------------------------------------------------

/** The turned socket the turret rises out of. */
function socketSvg(P) {
  const out = []
  out.push(k.solidSvg(G.solidOf(SOCKET, TUR, P, { steps: 56 }), { tone: 'mid', className: 'home-cine-cast' }))
  // a brass hoop turned onto the second collar
  out.push(brassRing(G.ringBand(2.6, 4.9, 27.4, 29.4, TUR, P, { steps: 48 })))
  out.push(k.lineSvg(G.arcOf(TUR, 4.9, 29.4, P), { tone: 'lo' }))
  // the rivet ring that bolts the flange down, and the lip of the neck
  out.push(k.dotsSvg(G.dotsOf(TUR, 1.9, SOCKET_R + 0.2, 24, P), { size: 0.8, tone: 'hi' }))
  out.push(k.lineSvg(G.arcOf(TUR, SOCKET_TOP - SEAT, 20, P), { tone: 'faint' }))
  out.push(k.lineSvg(G.arcOf(TUR, 6.2, 26, P), { tone: 'faint' }))
  // the slot the drive belt disappears into, on the flange's top face
  out.push(`<path class="home-cine-slot" d="${k.pathOf([
    k.iso(F.at(27.6, -3.4, -3.75), P), k.iso(F.at(32.6, -3.4, -3.75), P),
    k.iso(F.at(32.6, 3.4, -3.75), P), k.iso(F.at(27.6, 3.4, -3.75), P),
  ], true)}"/>`)
  return out
}

/**
 * One yoke arm: a cast blade standing on the socket's third collar, with the
 * pivot bearing at the top. `side` is +1 for the far arm, -1 for the near one.
 */
function armSvg(side, P) {
  const poly = [[18.8, 5.2], [26.8, 3.8], [26.4, 9.2], [23.8, 21], [23.4, 29.5], [22.8, 36.2], [18.8, 36.2]]
    .map(([u, w]) => [side * u, w])
  const frame = { o: F.at(0, -3, 0), a: F.dir(0, 1, 0), u: F.dir(1, 0, 0), v: F.dir(0, 0, 1) }
  const out = [k.solidSvg(G.prismOf(frame, poly, 0, 6, P), { tone: 'mid', className: 'home-cine-cast' })]
  // the bearing: a housing let into the arm's inboard face, the axle going on
  // into the drum's end cap
  const boss = G.frameAlong(F.at(side * 17.2, 0, DRUM_W), F.dir(side, 0, 0))
  out.push(k.solidSvg(G.disc(0, 2.4, 5.4, boss, P), { tone: 'mid', className: 'home-cine-cast' }))
  out.push(k.lineSvg(G.circleOf(boss, 2.4, 5.4, P), { tone: 'lo' }))
  out.push(k.lineSvg(G.circleOf(boss, 0.4, 4.2, P), { tone: 'faint' }))
  return out
}

/** The knurled hand-wheel on the near arm's outboard face. */
function wheelSvg(P) {
  const W = G.frameAlong(F.at(-27.4, 0, DRUM_W), F.dir(-1, 0, 0))
  const out = []
  // an open rim, knurled all the way round, on four spokes and a fat hub
  out.push(k.solidSvg(G.ringBand(0.6, 3.6, 6.1, 8.4, W, P, { steps: 56 }), { tone: 'mid', className: 'home-cine-cast' }))
  out.push(k.lineSvg(G.ribsOf(W, 0.6, 3.6, 8.4, 30, P), { tone: 'lo' }))
  out.push(`<path class="home-cine-spoke" d="${G.spokesOf(W, 3.6, 3, 6.2, 4, P)}"/>`)
  out.push(k.solidSvg(G.disc(0.4, 3.8, 3.1, W, P, { steps: 32 }), { tone: 'mid', className: 'home-cine-cast' }))
  out.push(brassRing(G.ringBand(3.8, 5, 2.1, 3.2, W, P, { steps: 32 })))
  out.push(k.lineSvg(G.circleOf(W, 3.8, 3.1, P), { tone: 'lo' }))
  return out
}

/** The boiler: the drum, its bands, the gauge, the valve and the stack. */
function boilerSvg(P) {
  const out = []
  out.push(k.solidSvg(G.lathe(DRUM, DRUM_F, P, { steps: 56 }), { tone: 'mid', className: 'home-cine-body' }))
  // two riveted bands, cast with the shell
  for (const s of BANDS) {
    out.push(k.solidSvg(G.ringBand(s - 1.7, s + 1.7, DRUM_R - 0.2, DRUM_R + 1.2, DRUM_F, P, { steps: 56 }), { tone: 'mid', className: 'home-cine-cast' }))
    out.push(k.lineSvg(G.arcOf(DRUM_F, s - 1.7, DRUM_R + 1.2, P), { tone: 'lo' }))
    out.push(k.lineSvg(G.arcOf(DRUM_F, s + 1.7, DRUM_R + 1.2, P), { tone: 'lo' }))
    out.push(k.dotsSvg(G.dotsOf(DRUM_F, s, DRUM_R + 1.4, 22, P), { size: 0.62, tone: 'hi' }))
  }
  // the end cap's own seam, on the near face
  out.push(k.lineSvg(G.circleOf(DRUM_F, 1.4, 12.4, P), { tone: 'faint' }))

  // ---- the pressure gauge, square to the camera on the near flank ---------
  out.push(brassRing(G.ringBand(-0.2, 1.9, 4.5, 5.7, GAUGE, P, { steps: 48 })))
  out.push(`<path class="home-cine-dial" d="${G.circleOf(GAUGE, 2, 4.4, P)}"/>`)
  out.push(`<path class="home-cine-tick" d="${G.spokesOf(GAUGE, 2.05, 3.1, 4.2, 12, P)}"/>`)
  out.push(`<path class="home-cine-tick" data-major d="${G.spokesOf(GAUGE, 2.05, 2.7, 4.2, 4, P)}"/>`)
  out.push(`<path class="home-cine-needle" d="${k.pathOf([
    k.iso(G.pointOf(GAUGE, 2.1, -0.7, 0.9), P),
    k.iso(G.pointOf(GAUGE, 2.1, 3.7, 0.9), P),
  ])}"/>`)
  out.push(k.lineSvg(G.circleOf(GAUGE, 2.2, 0.7, P), { tone: 'mid' }))

  // ---- the relief valve on the near flank, and the exhaust stack ----------
  const valveTheta = 1.72
  const valveAt = onDrum(11.4, valveTheta, -1.2)
  const VALVE = G.frameAlong(F.at(...valveAt), F.dir(0, Math.sin(valveTheta), Math.cos(valveTheta)))
  out.push(k.solidSvg(G.solidOf([[0, 2], [0.8, 2.6], [3, 2.6], [3.6, 2]], VALVE, P, { steps: 24 }), { tone: 'mid', className: 'home-cine-cast' }))
  out.push(brassRing(G.ringBand(3.4, 4.6, 1.2, 2.4, VALVE, P, { steps: 24 })))
  out.push(seg([11.4, Math.sin(valveTheta) * 18, DRUM_W + Math.cos(valveTheta) * 18], [13.8, Math.sin(valveTheta) * 20.4, DRUM_W + Math.cos(valveTheta) * 20.4], P, 'lo'))

  const stack = F.at(16.4, -1, DRUM_W + DRUM_R - 2)
  out.push(k.solidSvg(k.cylinder(stack[0], stack[1], 2.4, stack[2], 12, P, 22), { tone: 'mid', className: 'home-cine-cast' }))
  out.push(k.lineSvg(k.sideArc(stack[0], stack[1], 2.4, stack[2] + 3.6, P, 16), { tone: 'faint' }))
  out.push(k.lineSvg(k.sideArc(stack[0], stack[1], 2.4, stack[2] + 8, P, 16), { tone: 'faint' }))
  // a flared mouth, open and dark, so the stack reads as a chimney
  out.push(k.solidSvg(G.solidOf([[0, 2.4], [0.5, 3.5], [1.9, 3.5]], G.frameAlong([stack[0], stack[1], stack[2] + 12], [0, 0, 1]), P, { steps: 28 }), { tone: 'mid', className: 'home-cine-cast' }))
  out.push(k.lineSvg(k.ring(stack[0], stack[1], 2.6, stack[2] + 13.6, P, 18), { tone: 'lo' }))
  return out
}

/** Three pipes running off the boiler's belly into the deck. */
function pipeSvg(P) {
  const routes = [
    { r: 2.2, points: [[-1, 12.6, 22], [-2.2, 15.2, 15], [-3, 17.2, 9.2]] },
    { r: 1.9, points: [[5.8, 10, 21], [7.6, 12.6, 14.6], [8.6, 14.4, 9.2]] },
    { r: 1.7, points: [[-8.6, 10.6, 22.6], [-11, 12.4, 16.4], [-12.6, 13.6, 9.2]] },
  ]
  const out = []
  for (const { r, points } of routes) {
    const route = G.fillet(points.map((p) => F.at(...p)), 4.2, { P, tube: r })
    for (const piece of tubePieces(route, r, P, { maxLength: 30 }))
      out.push(`<g class="home-cine-pipe">${tubeSvg(piece, { tone: 'lo' })}</g>`)
    // a union nut where the pipe leaves the boiler
    const [x, y] = F.at(...points[0])
    out.push(k.lineSvg(k.ring(x, y, r + 1.5, TOP + points[0][2], P, 16), { tone: 'mid' }))
  }
  return out
}

/** The barrel: one turned brass tube, three rings, a flared hood. */
function lensSvg(P) {
  const brass = { tone: 'mid', className: 'home-cine-brass' }
  const out = []
  out.push(k.solidSvg(G.solidOf([[0, 6], [1.4, 6.4], [12.2, 6.4], [13, 7.1]], BARREL, P, { steps: 44 }), brass))
  // the mount flange where the barrel is bolted to the drum's shoulder
  out.push(k.solidSvg(G.ringBand(-1.4, 1.2, 6.4, 8.1, BARREL, P, { steps: 44 }), brass))
  out.push(k.lineSvg(G.arcOf(BARREL, 1.2, 8.1, P), { tone: 'lo' }))
  // three rings down the tube
  for (const s of [4.2, 7.4, 10.6]) {
    out.push(k.solidSvg(G.ringBand(s - 0.7, s + 0.7, 6.4, 7.3, BARREL, P, { steps: 44 }), brass))
    out.push(k.lineSvg(G.arcOf(BARREL, s + 0.7, 7.3, P), { tone: 'lo' }))
  }
  // the hood, and the glass behind it
  out.push(k.solidSvg(G.bandOfProfile([[12.2, 6.8], [13.4, 7.4], [HOOD_END, HOOD_R]], BARREL, P, { steps: 48 }), brass))
  out.push(`<path class="home-cine-glass" d="${G.circleOf(BARREL, HOOD_END - 1.2, HOOD_R - 1.2, P)}"/>`)
  out.push(k.lineSvg(G.circleOf(BARREL, HOOD_END, HOOD_R, P), { tone: 'lo' }))
  return out
}

/** The film gate clamped on the boiler's front flank, and its stencil. */
function gateSvg(P, caption) {
  const frame = { o: F.at(0, 13, 0), a: F.dir(0, 1, 0), u: F.dir(1, 0, 0), v: F.dir(0, 0, 1) }
  const poly = [[GATE_U - 3.2, 25.4], [GATE_U + 3.2, 25.4], [GATE_U + 3.2, 36.2], [GATE_U - 3.2, 36.2]]
  const out = []
  out.push(shutterSvg(P))
  out.push(k.solidSvg(G.prismOf(frame, poly, 0, GATE_V - 13, P), { tone: 'lo', className: 'home-cine-gate' }))
  // the slot the strip runs down, and the lip it passes
  out.push(`<path class="home-cine-slot" d="${k.pathOf([
    k.iso(F.at(GATE_U - 1, GATE_V + 0.1, 26.6), P), k.iso(F.at(GATE_U + 1, GATE_V + 0.1, 26.6), P),
    k.iso(F.at(GATE_U + 1, GATE_V + 0.1, 33.4), P), k.iso(F.at(GATE_U - 1, GATE_V + 0.1, 33.4), P),
  ], true)}"/>`)
  out.push(seg([GATE_U - 3.2, GATE_V + 0.2, 36.2], [GATE_U + 3.2, GATE_V + 0.2, 36.2], P, 'mid'))
  if (caption)
    out.push(k.faceTextSvg(faceMatrix(F, [GATE_U, GATE_V + 0.15, 34.9], [1, 0, 0], [0, 0, -1], P), caption, { size: 2.7, tone: 'faint', anchor: 'middle' }))
  out.push(filmSvg(P))
  return out
}

/** The curved arm the reels hang from, and the two axles. */
function gantrySvg(P) {
  const out = []
  // the gantry: it rises out of the boiler's back, turns over above the spools
  // and reaches out to the far side of them, so the arm is visibly carrying them
  const route = G.fillet([
    [17, GANTRY_V, 41],
    [17, GANTRY_V, 57],
    [14.4, GANTRY_V, 65.4],
    [5, GANTRY_V, 68.4],
    [-7, GANTRY_V, 68.2],
    [-14.6, GANTRY_V, 64.6],
  ].map((p) => F.at(...p)), 6, { P, tube: 2.6 })
  for (const piece of tubePieces(route, 2.6, P, { maxLength: 34 }))
    out.push(`<g class="home-cine-pipe">${tubeSvg(piece, { tone: 'lo' })}</g>`)
  // each spool hangs off the arm on a short rod, and turns on its own axle
  for (const reel of REELS) {
    const rod = G.frameAlong(F.at(reel.u, GANTRY_V, 66.6), F.dir(0, 0, -1))
    out.push(k.solidSvg(G.disc(0, 66.6 - REEL_W, 1.4, rod, P, { steps: 20 }), { tone: 'mid', className: 'home-cine-cast' }))
    const axle = G.frameAlong(F.at(reel.u, GANTRY_V + 1.6, REEL_W), F.dir(0, 1, 0))
    out.push(k.solidSvg(G.disc(0, Math.abs(REEL_V - GANTRY_V) - 0.4, 2.2, axle, P), { tone: 'mid', className: 'home-cine-cast' }))
    out.push(k.lineSvg(G.circleOf(axle, Math.abs(REEL_V - GANTRY_V) - 0.6, 2.2, P), { tone: 'faint' }))
  }
  return out
}

/** The flywheel on the far end and the belt running down into the socket. */
function driveSvg(P) {
  const F2 = G.frameAlong(F.at(22.6, 0, DRUM_W), F.dir(1, 0, 0))
  const out = []
  out.push(k.solidSvg(G.solidOf([[0, 3.4], [1.6, 8], [3.4, 9.2], [4.6, 9.2], [5, 7.8]], F2, P, { steps: 56 }), { tone: 'mid', className: 'home-cine-cast' }))
  out.push(k.lineSvg(G.spokesOf(F2, 0.2, 3, 8, 5, P), { tone: 'faint' }))
  out.push(k.lineSvg(G.circleOf(F2, 0.2, 2.6, P), { tone: 'faint' }))
  out.push(k.lineSvg(G.ribsOf(F2, 1.8, 4.4, 9.2, 24, P), { tone: 'faint' }))
  // the belt: a flat strap off the rim, down into the slot
  const beltFrame = { o: F.at(0, -1.1, 0), a: F.dir(0, 1, 0), u: F.dir(1, 0, 0), v: F.dir(0, 0, 1) }
  out.push(k.solidSvg(G.prismOf(beltFrame, [[23.2, 22.4], [25.4, 21], [32, -3.2], [29.4, -3.9]], 0, 2.2, P), { tone: 'lo', className: 'home-cine-belt' }))
  return out
}

// ---------------------------------------------------------------------------

export function buildCinema(P, options = {}) {
  const caption = options.caption || ''

  // ---- the beam: a cone that leaves the page at the upper left -----------
  const [mx, my] = k.iso(F.at(...MOUTH_L), P)
  const [ax, ay] = k.iso(F.at(MOUTH_L[0] + AIM[0], MOUTH_L[1] + AIM[1], MOUTH_L[2] + AIM[2]), P)
  const aimLen = Math.hypot(ax - mx, ay - my) || 1
  const dir = [(ax - mx) / aimLen, (ay - my) / aimLen]
  const perp = [-dir[1], dir[0]]
  const REACH = 520
  const HALF = 880
  const rim = Array.from({ length: 28 }, (_, i) =>
    k.iso(G.pointOf(BARREL, HOOD_END, HOOD_R, (i / 28) * Math.PI * 2), P))
  const rootR = Math.max(...rim.map(([x, y]) => Math.hypot(x - mx, y - my)))
  /** The throw opens late: narrow at the hood, as wide as the page at the end. */
  const halfAt = (t) => rootR + (HALF - rootR) * t ** 1.45
  const edge = (t, side) => {
    const half = halfAt(t)
    return [
      mx + dir[0] * REACH * t + perp[0] * half * side,
      my + dir[1] * REACH * t + perp[1] * half * side,
    ]
  }
  const outline = []
  const STEPS_EDGE = 16
  for (let i = 0; i <= STEPS_EDGE; i++)
    outline.push(edge(i / STEPS_EDGE, 1))
  // the far edge bows away, so the end of the throw is never a hard chord
  for (let i = 1; i < 7; i++) {
    const f = i / 7
    const a = edge(1, 1)
    const b = edge(1, -1)
    outline.push([a[0] + (b[0] - a[0]) * f + dir[0] * 30, a[1] + (b[1] - a[1]) * f + dir[1] * 30])
  }
  for (let i = STEPS_EDGE; i >= 0; i--)
    outline.push(edge(i / STEPS_EDGE, -1))
  // the root, a round cap tucked back under the hood
  for (let i = 1; i < 9; i++) {
    const a = Math.PI * (i / 9)
    outline.push([
      mx - perp[0] * rootR * Math.cos(a) - dir[0] * rootR * 0.55 * Math.sin(a),
      my - perp[1] * rootR * Math.cos(a) - dir[1] * rootR * 0.55 * Math.sin(a),
    ])
  }
  const [fx, fy] = [mx + dir[0] * REACH, my + dir[1] * REACH]
  const defs = `<defs><linearGradient id="home-beam-fade" gradientUnits="userSpaceOnUse" x1="${mx.toFixed(1)}" y1="${my.toFixed(1)}" x2="${fx.toFixed(1)}" y2="${fy.toFixed(1)}"><stop offset="0" stop-color="#fff" stop-opacity=".52"/><stop offset=".1" stop-color="#fff" stop-opacity=".34"/><stop offset=".24" stop-color="#fff" stop-opacity=".2"/><stop offset=".52" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`
  const beam = [`<path class="home-cine-beam" d="${k.pathOf(outline, true)}"/>`]

  return [
    defs,
    part('beam', beam),
    part('base', socketSvg(P)),
    part('yoke', [...armSvg(1, P), ...driveSvg(P)]),
    part('body', boilerSvg(P)),
    part('pipes', pipeSvg(P)),
    part('yoke', [...armSvg(-1, P), ...wheelSvg(P)]),
    part('lens', lensSvg(P)),
    part('gate', gateSvg(P, caption)),
    part('reels', [...gantrySvg(P), ...REELS.map((reel) => reelSvg(reel, P))]),
  ].join('')
}

/** Machine-only: the cone and the film's reach are not part of the footprint. */
export function cinemaBounds() {
  const out = []
  // the socket, top and bottom
  for (const w of [SEAT, SOCKET_TOP]) {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      out.push(F.at(Math.cos(a) * SOCKET_R, Math.sin(a) * SOCKET_R, w))
    }
  }
  // the drum's ends and the arms that hold it
  for (const u of [-DRUM_HALF, DRUM_HALF]) {
    for (const v of [-DRUM_R, DRUM_R])
      out.push(F.at(u, v, DRUM_W + DRUM_R), F.at(u, v, DRUM_W - DRUM_R))
  }
  for (const side of [-1, 1]) {
    for (const [u, w] of [[18.8, 5.2], [26.8, 3.8], [23.4, 29.5], [22.8, 36.2]])
      out.push(F.at(side * u, -3, w), F.at(side * u, 3, w))
  }
  // the hand-wheel and the flywheel
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    out.push(F.at(-30.8, Math.cos(a) * 10.6, DRUM_W + Math.sin(a) * 10.6))
    out.push(F.at(27.4, Math.cos(a) * 9.6, DRUM_W + Math.sin(a) * 9.6))
  }
  // the reels and the arm that carries them
  for (const reel of REELS) {
    out.push(F.at(reel.u, REEL_V - REEL_R - 2.2, REEL_W))
    out.push(F.at(reel.u, REEL_V + REEL_R + 2.2, REEL_W))
    out.push(F.at(reel.u, REEL_V, REEL_W + REEL_R + 2.2))
    out.push(F.at(reel.u, GANTRY_V, REEL_W + 2.6))
  }
  // the gantry's crest, the highest thing on the machine
  for (const u of [-14.6, 5, 17])
    out.push(F.at(u, GANTRY_V, 68.4 + 2.6))
  // the barrel's mouth, and the stack's cap
  out.push(F.at(...MOUTH_L))
  out.push(F.at(MOUTH_L[0] + AIM[0] * HOOD_R, MOUTH_L[1] + AIM[1] * HOOD_R, MOUTH_L[2] + AIM[2] * HOOD_R))
  out.push(F.at(16.4, -1, DRUM_W + DRUM_R + 10))
  return out
}
