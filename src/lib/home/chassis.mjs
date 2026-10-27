import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { tubePieces, tubeSvg } from '../anatomy/tube.mjs'

/**
 * The shared chassis: a low, wide console with a machined front panel.
 * Camera is nearly head-on, so the front face carries the design.
 *
 * The cabinet is not solid. It is a shell around a bay: the deck is pierced by
 * the well (HATCH), the bay has a back wall and a pair of guide rods, and a
 * lift carriage (PLATFORM) rides inside it. Everything below the deck line is
 * drawn through one clip — the well opening seen from this camera — so the bay
 * reads as a hole rather than a plate laid on top:
 *
 *   well      the cavity tone and the bay's far wall
 *   mechanism the gear train, the folding arms, the lead screw and guide rods
 *   bay       two cover plates, split on the centre line, that part and close
 *   platform  the lift, clipped to the opening so its near edge is always
 *             swallowed by the deck's front lip (see .home-lift in home.css)
 *   rim       the opening's own outline, repainted over the lift
 *
 * Paint order is far to near, so the lift covers the bay, the bay covers the
 * mechanism, and the rim closes over all three.
 *
 * The runs are also the sub-assemblies: each is a contiguous `<g class=
 * "home-part">` carrying a --step, and chassis.css turns the shared settle into
 * the page-load build — feet come up, the body rises and seats, the mouth of the
 * well is cut out of the deck, the train climbs out of the bay and turns over,
 * the covers are pushed up and slid shut over it, the lift comes up the shaft,
 * the panel is pressed on from the front, the keys come up out of their
 * recesses, the grille draws in, the power parts snap on and the cable swings in
 * behind.
 */

export const TOP = 74
export const CABINET = { x: -155, y: -90, w: 310, d: 180, r: 7 }
export const HATCH = { x: -96, y: -44, w: 192, d: 88, r: 4 }
export const PLATFORM = k.insetPlan(HATCH, 4)
export const PLATFORM_Z = TOP - 5

const BODY = k.insetPlan(CABINET, 3)
const FRONT = CABINET.y + CABINET.d
const WELL_ID = 'home-well-clip'
const PANEL_Z0 = 9
const PANEL_Z1 = 65
const KEY_Z0 = 28
const KEY_Z1 = 47

// the bay: the cover plates sit just under the lift, the mechanism under them
const BAY_Z0 = TOP - 12
const BAY_Z1 = TOP - 10
const LIFT_H = 4
const LIFT_Z1 = PLATFORM_Z
const LIFT_Z0 = LIFT_Z1 - LIFT_H
/** Everything in the bay stops at this height, so the closed plates hide it. */
const MECH_TOP = BAY_Z0 - 1
/** The plane the gear train hangs on, and the plate behind it. */
const MECH_Y = -35
const BACK_Y = -38.5
/** How far the cover plates slide to clear the opening, in world units. */
const BAY_TRAVEL = 104

/** Five keys, centred on the panel: one per section that still has a device. */
export const PLATES = (() => {
  const w = 45
  const gap = 4
  const total = 5 * w + 4 * gap
  return Array.from({ length: 5 }, (_, index) => ({
    index,
    x: -total / 2 + index * (w + gap),
    w,
    z: KEY_Z0,
    h: KEY_Z1 - KEY_Z0,
  }))
})()

/**
 * One sub-assembly. Each run is a contiguous stretch of what already painted
 * together, so wrapping it changes no painter's order — only which assembly a
 * path belongs to. `--step` is the shared settle contract in home.css;
 * chassis.css replaces it with the real build.
 */
function part(name, step, ...items) {
  return `<g class="home-part" data-part="${name}" style="--step:${step}">${items.join('')}</g>`
}

export function chassisDefs(P) {
  const ring = k.ringOf(HATCH, 12).map(([x, y]) => k.iso([x, y, TOP], P))
  // The deck's near rim, carried well past the machine on both sides and up out
  // of the drawing. Everything below this line is the inside of the box: the
  // machines are clipped by it, so one coming up the lift is hidden until it
  // clears the rim instead of sliding across the cabinet's front.
  const [, cy] = k.iso([0, HATCH.y + HATCH.d, TOP], P)
  const edge = (cy + 3).toFixed(1)
  return `<defs><clipPath id="${WELL_ID}"><path d="${k.pathOf(ring, true)}"/></clipPath>`
    + `<clipPath id="home-deck-clip"><path d="M-400 -200L1200 -200L1200 ${edge}L-400 ${edge}Z"/></clipPath></defs>`
}

/** A cross-head screw sitting on the front face. */
function faceScrew(x, z, P, r = 2.2) {
  const F = G.frameAlong([x, FRONT + 0.4, z], [0, 1, 0])
  return k.solidSvg(G.ringBand(0, 0.5, r - 0.8, r, F, P), { tone: 'lo' })
    + k.solidSvg(G.disc(0, 0.6, r - 0.8, F, P), { tone: 'mid' })
    + k.lineSvg(k.segment([x - r * 0.55, FRONT + 1.1, z], [x + r * 0.55, FRONT + 1.1, z], P), { tone: 'faint' })
    + k.lineSvg(k.segment([x, FRONT + 1.1, z - r * 0.55], [x, FRONT + 1.1, z + r * 0.55], P), { tone: 'faint' })
}

/** A rocker switch on the front face. */
function rocker(x, z, P, w = 9, h = 6) {
  const out = []
  out.push(k.solidSvg(k.slabOf({ x: x - w / 2 - 1, y: FRONT - 1.4, w: w + 2, d: 2.6, r: 1 }, z - h / 2 - 1, h + 2, P, 4, 0.5), { tone: 'lo' }))
  out.push(k.solidSvg(k.slabOf({ x: x - w / 2, y: FRONT - 0.2, w, d: 1.4, r: 0.8 }, z - h / 2, h * 0.55, P, 4, 0.4), { tone: 'hi' }))
  out.push(k.solidSvg(k.slabOf({ x: x - w / 2, y: FRONT - 0.2, w, d: 1.4, r: 0.8 }, z - h * 0.05, h * 0.55, P, 4, 0.4), { tone: 'mid' }))
  return out.join('')
}

// ---------------------------------------------------------------------------
// the mechanism inside the bay
//
// Everything here is drawn on planes parallel to the front face, because the
// camera looks almost straight down the y axis: a disc whose axis runs into the
// screen is seen face-on, so a gear train hanging on the bay's backplate reads
// with real teeth instead of collapsing to an ellipse. All of it stops below
// MECH_TOP, so the closed cover plates hide it completely and the resting
// drawing is untouched.
// ---------------------------------------------------------------------------

/** A flat plate standing on the x–z plane at a given depth. */
function facePlate(x0, x1, z0, z1, y, P, { fill = 'home-mech-mid', tone = 'faint' } = {}) {
  const d = k.pathOf([
    k.iso([x0, y, z0], P), k.iso([x1, y, z0], P),
    k.iso([x1, y, z1], P), k.iso([x0, y, z1], P),
  ], true)
  return `<path class="${fill}" d="${d}"/><path class="iso-line iso-edge" data-tone="${tone}" d="${d}"/>`
}

/** A bar lying on the x–z plane: the folding arms are built from these. */
function armBar([ax, az], [bx, bz], w, y, P) {
  const dx = bx - ax
  const dz = bz - az
  const len = Math.hypot(dx, dz) || 1
  const nx = (-dz / len) * (w / 2)
  const nz = (dx / len) * (w / 2)
  const d = k.pathOf([
    k.iso([ax + nx, y, az + nz], P), k.iso([bx + nx, y, bz + nz], P),
    k.iso([bx - nx, y, bz - nz], P), k.iso([ax - nx, y, az - nz], P),
  ], true)
  return `<path class="home-mech-edge" d="${d}" transform="translate(1.6 2.2)"/>`
    + `<path class="home-mech-face" d="${d}"/>`
    + k.lineSvg(d, { tone: 'mid' })
}

/** A joint pin, seen face-on. */
function pin(x, z, y, r, P) {
  const F = G.frameAlong([x, y, z], [0, 1, 0])
  const ring = G.circleOf(F, 0, r, P)
  return `<path class="home-mech-edge" d="${ring}" transform="translate(1.2 1.6)"/>`
    + `<path class="home-mech-light" d="${ring}"/>`
    + k.lineSvg(ring, { tone: 'lo' })
    + k.lineSvg(G.circleOf(F, 0, r * 0.34, P), { tone: 'faint' })
}

/** The toothed outline of a cog: a square wave around the rim. */
function cogOutline(F, s, r, teeth, P, depth = 0.24) {
  const steps = teeth * 4
  const points = []
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    const raised = i % 4 === 1 || i % 4 === 2
    points.push(k.iso(G.pointOf(F, s, raised ? r * (1 + depth) : r * 0.96, angle), P))
  }
  return k.pathOf(points, true)
}

/**
 * A gear: a cogged disc with a web, five lightening spokes and a hub, hung
 * face-on so the camera sees the teeth. `turn` is a whole number of tooth
 * pitches, so the gear comes back to exactly this pose when the boot spin ends.
 */
function gear({ x, z, r, teeth, dir, y, thick }, P) {
  const F = G.frameAlong([x, y, z], [0, 1, 0])
  const pitch = 360 / teeth
  const turn = dir * Math.round((260 * 8) / r / pitch) * pitch
  const [ox, oy] = k.iso([x, y, z], P)
  const face = cogOutline(F, thick, r, teeth, P)
  const web = G.circleOf(F, thick, r * 0.58, P)
  const hub = G.circleOf(F, thick, r * 0.26, P)
  return `<g class="home-gear" style="transform-origin:${ox.toFixed(1)}px ${oy.toFixed(1)}px;--turn:${turn}deg">`
    + `<path class="home-mech-edge" d="${face}" transform="translate(1.8 2.4)"/>`
    + `<path class="home-mech-face" d="${face}"/>`
    + k.lineSvg(face, { tone: 'mid' })
    + `<path class="home-mech-light" d="${web}"/>`
    + k.lineSvg(web, { tone: 'faint' })
    + k.lineSvg(G.spokesOf(F, thick, r * 0.26, r * 0.58, 5, P), { tone: 'faint' })
    + `<path class="home-mech-mid" d="${hub}"/>`
    + k.lineSvg(hub, { tone: 'lo' })
    + `<path class="home-mech-dark" d="${G.circleOf(F, thick, r * 0.12, P)}"/>`
    + '</g>'
}

/** A vertical rod with thread crests and its collars. */
function guideRod(x, y, z0, z1, r, collars, P) {
  const out = []
  out.push(k.solidSvg(k.cylinder(x, y, r, z0, z1 - z0, P, 20), { tone: 'mid' }))
  for (let z = z0 + 1.6; z < z1 - 1.4; z += 2.1) {
    out.push(k.lineSvg(k.sideArc(x, y, r + 0.3, z, P, 12), { tone: 'faint' }))
  }
  for (const z of collars) {
    out.push(k.solidSvg(k.cylinder(x, y, r + 1.5, z, 2.4, P, 20), { tone: 'hi' }))
    out.push(k.lineSvg(k.sideArc(x, y, r + 1.5, z + 1.2, P, 14), { tone: 'faint' }))
  }
  return out.join('')
}

/** The gear train: four cogs meshing along a shallow arc, large to small. */
const TRAIN = [
  { x: -60, z: 52.6, r: 7.4, teeth: 14, dir: 1 },
  { x: -47.2, z: 54.2, r: 6, teeth: 12, dir: -1 },
  { x: -36.6, z: 52, r: 4.6, teeth: 10, dir: 1 },
  { x: -28.6, z: 53.6, r: 3.2, teeth: 8, dir: -1 },
]

function mechanism(P) {
  const out = []

  // the gearbox plate the train hangs on, and the bracket the arms swing from
  out.push(facePlate(-70, -22, 44, 59, BACK_Y, P))
  out.push(facePlate(13, 25, 49, 58, BACK_Y + 2, P))

  // the train, then the bolts holding it to the plate
  for (const g of TRAIN) {
    out.push(gear({ ...g, y: MECH_Y, thick: 4.4 }, P))
  }
  for (const g of TRAIN) {
    out.push(pin(g.x, g.z, MECH_Y + 5.2, Math.max(1.4, g.r * 0.3), P))
  }

  // the folding arms: two bars on a knuckle, with a stop pin at the free end
  const A = [18, 58]
  const B = [39, 54]
  const C = [53, 50.4]
  out.push(armBar(A, B, 5, MECH_Y + 2, P))
  out.push(armBar(B, C, 4.4, MECH_Y + 2, P))
  out.push(pin(A[0], A[1], MECH_Y + 3, 2.6, P))
  out.push(pin(B[0], B[1], MECH_Y + 3, 3.1, P))
  out.push(pin(C[0], C[1], MECH_Y + 3, 2.2, P))

  // the lead screw down the middle, a pair of guide rods with collars, and the
  // travelling nut riding the screw
  out.push(guideRod(7, MECH_Y + 9, 44, MECH_TOP, 2.4, [51, 59], P))
  out.push(k.solidSvg(k.cylinder(7, MECH_Y + 9, 4.2, 54.4, 3.4, P, 20), { tone: 'hi' }))
  out.push(k.lineSvg(k.sideArc(7, MECH_Y + 9, 4.2, 56.1, P, 16), { tone: 'lo' }))
  out.push(guideRod(-78, MECH_Y + 9, 44, MECH_TOP, 2.2, [49, 58], P))
  out.push(guideRod(78, MECH_Y + 9, 44, MECH_TOP, 2.2, [49, 58], P))

  return out.join('')
}

// ---------------------------------------------------------------------------

export function buildChassis(P, options = {}) {
  const labels = options.labels || []
  const labelSize = options.labelSize ?? 9
  const out = []

  // cast shadow under the machine
  out.push(part('shadow', 0, `<path class="iso-halo" d="${k.haloOf(CABINET, -18, TOP + 18, P)}"/>`))

  // feet with metal collars and rubber pads, far to near: they land first
  const feet = []
  for (const { x, y } of k.corners(BODY, 20)
    .map(([x, y]) => ({ x, y, d: k.depthOf([x, y, 0], P) }))
    .sort((a, b) => a.d - b.d)) {
    feet.push(k.solidSvg(k.cylinder(x, y, 10, -14, 10, P, 26), { tone: 'lo' }))
    feet.push(k.solidSvg(k.cylinder(x, y, 7, -4, 4, P, 24), { tone: 'mid' }))
    feet.push(k.lineSvg(k.sideArc(x, y, 7, -2, P, 18), { tone: 'faint' }))
  }
  out.push(part('feet', 1, ...feet))

  // power cable, leaving the back so it never crosses the panel. It is drawn
  // before the body so the shell hides where it enters the cabinet.
  const route = G.fillet(
    [[-60, -84, 34], [-72, -108, 12], [-92, -124, -12], [-118, -110, -18]],
    14,
    { P, tube: 3 },
  )
  const cable = tubePieces(route, 3, P, { maxLength: 34 }).map((piece) => tubeSvg(piece, { tone: 'lo' }))
  out.push(part('cable', 2, ...cable))

  // body: one silhouette, a shallow chamfer at the bottom edge and a seam where
  // the lid would part. Stacking plinth + body + lid drew three outlines that
  // crossed at the corners, so it stays a single slab.
  out.push(part('body', 3, k.solidSvg(k.slabOf(BODY, 0, TOP, P, 12, 1.2), { tone: 'lo' })))

  // ---- the bay, all of it seen through the well opening -------------------
  const ring = k.ringOf(HATCH, 12).map(([x, y]) => k.iso([x, y, TOP], P))
  const well = []
  well.push(`<g clip-path="url(#${WELL_ID})">`)
  well.push(`<path class="home-cavity" d="${k.pathOf(ring, true)}"/>`)
  // the far wall of the cavity: the opening is a hole, and what you see down it
  // is the back of the bay, a step darker than the lip
  well.push(facePlate(HATCH.x, HATCH.x + HATCH.w, 26, TOP, HATCH.y + 0.4, P, { fill: 'home-bay-wall', tone: 'faint' }))
  well.push('</g>')
  out.push(part('well', 4, ...well))

  // the train is wrapped inside the clip, not around it: a transform on the
  // clipped group would drag the clip along with it, and the bay would slide
  // across the deck instead of staying in its hole
  out.push(part('mechanism', 5, `<g clip-path="url(#${WELL_ID})"><g class="home-mech-riser">${mechanism(P)}</g></g>`))

  // the cover plates: two halves that part on the centre line. At rest they are
  // closed and the lift covers them completely, so they cost nothing.
  const bay = []
  const slide = k.axisVector(P, [BAY_TRAVEL, 0, 0])
  bay.push(`<g clip-path="url(#${WELL_ID})">`)
  for (const [side, x0] of [['l', PLATFORM.x], ['r', PLATFORM.x + PLATFORM.w / 2]]) {
    const plan = { x: x0, y: PLATFORM.y, w: PLATFORM.w / 2, d: PLATFORM.d, r: 0 }
    const dx = side === 'l' ? -slide[0] : slide[0]
    bay.push(`<g class="home-bay-plate" data-side="${side}" style="--slide-x:${dx.toFixed(1)}px">`)
    bay.push(k.solidSvg(k.slabOf(plan, BAY_Z0, BAY_Z1 - BAY_Z0, P, 4, 0.4), { tone: 'mid' }))
    bay.push(k.lineSvg(k.planOutline(k.insetPlan(plan, 3), BAY_Z1, P, 4), { tone: 'faint' }))
    bay.push('</g>')
  }
  bay.push('</g>')
  out.push(part('bay', 6, ...bay))

  // the lift platform: inside the cavity, clipped by the opening, so its near
  // edge is always cut off by the deck's front lip — at rest and mid-dip alike
  out.push(part('platform', 7,
    `<g clip-path="url(#${WELL_ID})">`,
    `<g class="home-lift">${k.solidSvg(k.slabOf(PLATFORM, LIFT_Z0, LIFT_H, P, 8, 0.6), { tone: 'hi' })}`
    + `${k.lineSvg(k.planOutline(k.insetPlan(PLATFORM, 5), LIFT_Z1, P, 4), { tone: 'faint' })}</g>`,
    '</g>',
  ))

  // the opening's own rim, repainted after the lift so the lip closes over it
  out.push(part('rim', 8,
    k.lineSvg(k.pathOf(ring, true), { tone: 'lo' }),
    k.lineSvg(k.planOutline(k.insetPlan(HATCH, 1.7), TOP - 1.9, P, 12), { tone: 'faint' }),
  ))

  // ---- deck detailing ----------------------------------------------------
  const deck = []
  for (const [x, y] of k.corners(k.insetPlan(CABINET, 14))) {
    deck.push(k.dotsSvg([k.iso([x, y, TOP], P)], { size: 1.1, tone: 'mid' }))
    deck.push(k.lineSvg(k.ring(x, y, 2.1, TOP, P, 16), { tone: 'faint' }))
  }
  // a machined seam dividing the deck front from back
  deck.push(k.lineSvg(k.lineOnTop([-150, 52], [150, 52], TOP, P), { tone: 'faint' }))
  // model plate, right of the well
  deck.push(k.solidSvg(k.slabOf({ x: 100, y: -10, w: 44, d: 20, r: 2 }, TOP, 1, P, 3), { tone: 'mid' }))
  deck.push(k.faceTextSvg(k.topMatrix([122, 0], TOP + 1.1, P, 'x'), 'FLOW BENCH No.1', { size: 3.4, tone: 'lo', anchor: 'middle' }))
  out.push(part('deck', 9, ...deck))

  // ---- front panel ------------------------------------------------------
  const panel = []
  // recessed plate
  panel.push(k.solidSvg(k.slabOf({ x: -134, y: FRONT - 1.6, w: 268, d: 2.4, r: 2 }, PANEL_Z0, PANEL_Z1 - PANEL_Z0, P, 4, 0.6), { tone: 'mid', className: 'home-panel-plate' }))
  panel.push(k.lineSvg(k.planOutline(k.insetPlan({ x: -134, y: FRONT - 1.6, w: 268, d: 2.4, r: 2 }, 3), PANEL_Z1, P, 4), { tone: 'faint' }))
  panel.push(k.lineSvg(k.planOutline(k.insetPlan({ x: -134, y: FRONT - 1.6, w: 268, d: 2.4, r: 2 }, 3), PANEL_Z0, P, 4), { tone: 'faint' }))

  // title block, engraved straight into the plate
  panel.push(k.faceTextSvg(
    k.sideMatrix([-124, FRONT], 57, P, 'left'),
    'CGARTLAB',
    { size: 5.6, tone: 'hi' },
  ))
  panel.push(k.faceTextSvg(
    k.sideMatrix([-124, FRONT], 50.5, P, 'left'),
    'FLOW BENCH · No.1',
    { size: 3.2, tone: 'faint' },
  ))
  // the corner screws bolt the plate on, so they ride in with it
  for (const [x, z] of [[-127, 12], [127, 12], [-127, 62], [127, 62]]) {
    panel.push(faceScrew(x, z, P))
  }
  out.push(part('panel', 10, ...panel))

  // channel keys: each cap, its engraved outline and its label ride together
  const keys = []
  for (const plate of PLATES) {
    const cx = plate.x + plate.w / 2
    const plan = { x: plate.x, y: FRONT - 0.6, w: plate.w, d: 1.6, r: 1 }
    keys.push(`<g class="home-key-slot" data-index="${plate.index}" style="--slot:${plate.index}">`)
    keys.push(`<g class="home-keycap" data-index="${plate.index}">${k.solidSvg(k.slabOf(plan, plate.z, plate.h, P, 4, 0.5), { tone: 'mid', className: 'home-key-cap' })}</g>`)
    keys.push(k.lineSvg(k.planOutline(k.insetPlan(plan, 2.4), plate.z + plate.h, P, 4), { tone: 'faint' }))
    const label = labels[plate.index] ?? ''
    if (label) {
      keys.push(k.faceTextSvg(
        k.sideMatrix([cx, FRONT + 1], plate.z + 7.5, P, 'left'),
        label,
        { size: labelSize, tone: 'hi', anchor: 'middle' },
      ))
    }
    keys.push('</g>')
  }
  out.push(part('keys', 11, ...keys))

  // vent grille under the keys
  const vents = []
  for (let i = 0; i < 9; i++) {
    const z = 13 + i * 1.6
    vents.push(k.lineSvg(k.segment([-124, FRONT + 0.3, z], [124, FRONT + 0.3, z], P), { tone: 'lo' }))
  }
  out.push(part('vents', 12, ...vents))

  // power switch and fuse holder, right of the title block
  const power = []
  power.push(rocker(104, 56, P))
  power.push(k.faceTextSvg(k.sideMatrix([104, FRONT], 48, P, 'left'), 'POWER', { size: 2.6, tone: 'faint', anchor: 'middle' }))
  const fuse = G.frameAlong([126, FRONT, 56], [0, 1, 0])
  power.push(k.solidSvg(G.disc(0, 1.6, 2.6, fuse, P), { tone: 'lo' }))
  power.push(k.lineSvg(G.circleOf(fuse, 1.6, 1.6, P), { tone: 'faint' }))
  out.push(part('power', 13, ...power))

  // one wrapper for the whole console: the boot rules key off it, so a device's
  // own `data-part="deck"` can never pick up the chassis' entrance
  return `<g class="home-chassis">${out.join('')}</g>`
}

/**
 * Real anchors over the channel keys: crawlable, focusable, big enough to hit.
 */
export function buildChannelLinks(P, options = {}) {
  const labels = options.labels || []
  const hrefs = options.hrefs || []
  const active = options.active ?? 0
  return PLATES.map((plate) => {
    const x0 = plate.x + 0.5
    const x1 = plate.x + plate.w - 0.5
    const quad = [
      [x0, FRONT + 1.4, plate.z],
      [x1, FRONT + 1.4, plate.z],
      [x1, FRONT + 1.4, plate.z + plate.h],
      [x0, FRONT + 1.4, plate.z + plate.h],
    ]
    const d = k.pathOf(quad.map((p) => k.iso(p, P)), true)
    const label = labels[plate.index] ?? ''
    const href = hrefs[plate.index] ?? '#'
    const current = plate.index === active ? ' aria-current="page"' : ''
    return `<a class="home-channel" data-index="${plate.index}" href="${href}" aria-label="${label}"${current}><title>${label}</title><path class="home-channel-hit" d="${d}"/></a>`
  }).join('')
}
