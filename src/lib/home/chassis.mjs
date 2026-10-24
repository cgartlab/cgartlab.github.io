import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { tubePieces, tubeSvg } from '../anatomy/tube.mjs'

/**
 * The shared chassis: a low, wide console with a machined front panel.
 * Camera is nearly head-on, so the front face carries the design.
 */

export const TOP = 74
export const CABINET = { x: -155, y: -90, w: 310, d: 180, r: 6 }
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

/** Seven keys, centred on the panel. */
export const PLATES = (() => {
  const w = 35
  const gap = 3
  const total = 7 * w + 6 * gap
  return Array.from({ length: 7 }, (_, index) => ({
    index,
    x: -total / 2 + index * (w + gap),
    w,
    z: KEY_Z0,
    h: KEY_Z1 - KEY_Z0,
  }))
})()

export function chassisDefs(P) {
  const ring = k.ringOf(HATCH, 12).map(([x, y]) => k.iso([x, y, TOP], P))
  return `<defs><clipPath id="${WELL_ID}"><path d="${k.pathOf(ring, true)}"/></clipPath></defs>`
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
  out.push(k.solidSvg(k.slabOf({ x: x - w / 2, y: FRONT - 0.2, w: w, d: 1.4, r: 0.8 }, z - h / 2, h * 0.55, P, 4, 0.4), { tone: 'hi' }))
  out.push(k.solidSvg(k.slabOf({ x: x - w / 2, y: FRONT - 0.2, w: w, d: 1.4, r: 0.8 }, z - h * 0.05, h * 0.55, P, 4, 0.4), { tone: 'mid' }))
  return out.join('')
}

export function buildChassis(P, options = {}) {
  const labels = options.labels || []
  const labelSize = options.labelSize ?? 9
  const out = []

  // cast shadow under the machine
  out.push(`<path class="iso-halo" d="${k.haloOf(CABINET, -18, TOP + 18, P)}"/>`)

  // feet with metal collars and rubber pads
  const feet = k.corners(BODY, 20)
    .map(([x, y]) => ({ x, y, d: k.depthOf([x, y, 0], P) }))
    .sort((a, b) => a.d - b.d)
  for (const { x, y } of feet) {
    out.push(k.solidSvg(k.cylinder(x, y, 10, -14, 10, P, 26), { tone: 'lo' }))
    out.push(k.solidSvg(k.cylinder(x, y, 7, -4, 4, P, 24), { tone: 'mid' }))
    out.push(k.lineSvg(k.sideArc(x, y, 7, -2, P, 18), { tone: 'faint' }))
  }

  // power cable, leaving the back so it never crosses the panel
  const route = G.fillet(
    [[96, -86, 30], [96, -110, 10], [124, -126, -12], [156, -112, -16]],
    14,
    { P, tube: 3 },
  )
  for (const piece of tubePieces(route, 3, P, { maxLength: 34 })) {
    out.push(tubeSvg(piece, { tone: 'lo' }))
  }

  // body: a shallow chamfer at the bottom, then the main shell
  out.push(k.solidSvg(k.slabOf(BODY, 0, 6, P, 10, 1.4), { tone: 'lo', className: 'home-plinth' }))
  out.push(k.solidSvg(k.slabOf(BODY, 6, TOP - 12, P, 10, 1), { tone: 'hi' }))
  out.push(k.solidSvg(k.slabOf(CABINET, TOP - 6, 6, P, 12, 1.4), { tone: 'hi', className: 'home-top-plate' }))
  // seam between the shell and the top plate
  out.push(k.lineSvg(k.sideSeam(BODY, TOP - 6, P, 10), { tone: 'faint' }))

  // the well, seen edge-on from this camera
  const ring = k.ringOf(HATCH, 12).map(([x, y]) => k.iso([x, y, TOP], P))
  out.push(`<g clip-path="url(#${WELL_ID})">`)
  out.push(`<path class="home-cavity" d="${k.pathOf(ring, true)}"/>`)
  for (const [x, y] of k.corners(k.insetPlan(HATCH, 11))) {
    out.push(k.solidSvg(k.cylinder(x, y, 3, TOP - 46, 42, P, 18), { tone: 'mid' }))
  }
  out.push('</g>')

  // lift platform
  out.push(k.solidSvg(k.slabOf(PLATFORM, TOP - 4, 4, P, 8, 0.6), { tone: 'hi' }))

  // deck detailing
  out.push(k.lineSvg(k.planOutline(k.insetPlan(CABINET, 7), TOP, P, 12), { tone: 'faint' }))
  for (const [x, y] of k.corners(k.insetPlan(CABINET, 14))) {
    out.push(k.dotsSvg([k.iso([x, y, TOP], P)], { size: 1.1, tone: 'mid' }))
    out.push(k.lineSvg(k.ring(x, y, 2.1, TOP, P, 16), { tone: 'faint' }))
  }
  // a machined seam dividing the deck front from back
  out.push(k.lineSvg(k.lineOnTop([-150, 52], [150, 52], TOP, P), { tone: 'faint' }))
  // model plate, right of the well
  out.push(k.solidSvg(k.slabOf({ x: 100, y: -10, w: 44, d: 20, r: 2 }, TOP, 1, P, 3), { tone: 'mid' }))
  out.push(k.faceTextSvg(k.topMatrix([122, 0], TOP + 1.1, P, 'x'), 'FLOW BENCH No.1', { size: 3.4, tone: 'lo', anchor: 'middle' }))
  // bright rim around the well
  out.push(k.lineSvg(k.planOutline(k.insetPlan(HATCH, 1.2), TOP + 0.3, P, 12), { tone: 'hi' }))

  // ---- front panel ------------------------------------------------------
  // recessed plate
  out.push(k.solidSvg(k.slabOf({ x: -143, y: FRONT - 1.6, w: 286, d: 2.4, r: 2 }, PANEL_Z0, PANEL_Z1 - PANEL_Z0, P, 4, 0.6), { tone: 'mid', className: 'home-panel-plate' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan({ x: -143, y: FRONT - 1.6, w: 286, d: 2.4, r: 2 }, 3), PANEL_Z1, P, 4), { tone: 'faint' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan({ x: -143, y: FRONT - 1.6, w: 286, d: 2.4, r: 2 }, 3), PANEL_Z0, P, 4), { tone: 'faint' }))

  // title block, engraved straight into the plate
  out.push(k.faceTextSvg(
    k.sideMatrix([-132, FRONT], 57, P, 'left'),
    'CGARTLAB',
    { size: 5.6, tone: 'hi' },
  ))
  out.push(k.faceTextSvg(
    k.sideMatrix([-132, FRONT], 50.5, P, 'left'),
    'FLOW BENCH · No.1',
    { size: 3.2, tone: 'faint' },
  ))

  // channel keys
  for (const plate of PLATES) {
    const cx = plate.x + plate.w / 2
    const plan = { x: plate.x, y: FRONT - 0.6, w: plate.w, d: 1.6, r: 1 }
    out.push(k.solidSvg(k.slabOf(plan, plate.z, plate.h, P, 4, 0.5), { tone: 'mid', className: 'home-key-cap' }))
    out.push(k.lineSvg(k.planOutline(k.insetPlan(plan, 2.4), plate.z + plate.h, P, 4), { tone: 'faint' }))
    const label = labels[plate.index] ?? ''
    if (label) {
      out.push(k.faceTextSvg(
        k.sideMatrix([cx, FRONT + 1], plate.z + 7.5, P, 'left'),
        label,
        { size: labelSize, tone: 'hi', anchor: 'middle' },
      ))
    }
  }

  // vent grille under the keys
  for (let i = 0; i < 9; i++) {
    const z = 13 + i * 1.6
    out.push(k.lineSvg(k.segment([-132, FRONT + 0.3, z], [132, FRONT + 0.3, z], P), { tone: 'lo' }))
  }

  // power switch and fuse holder, right of the title block
  out.push(rocker(104, 56, P))
  out.push(k.faceTextSvg(k.sideMatrix([104, FRONT], 48, P, 'left'), 'POWER', { size: 2.6, tone: 'faint', anchor: 'middle' }))
  const fuse = G.frameAlong([126, FRONT, 56], [0, 1, 0])
  out.push(k.solidSvg(G.disc(0, 1.6, 2.6, fuse, P), { tone: 'lo' }))
  out.push(k.lineSvg(G.circleOf(fuse, 1.6, 1.6, P), { tone: 'faint' }))

  // corner screws
  for (const [x, z] of [[-136, 12], [136, 12], [-136, 62], [136, 62]]) {
    out.push(faceScrew(x, z, P))
  }

  return out.join('')
}

/** Lamps are emitted after the module so they stay readable. */
export function buildChannelOverlay(P, { active = 0 } = {}) {
  const out = []
  for (const plate of PLATES) {
    const cx = plate.x + plate.w / 2
    const lit = plate.index === active
    const [sx, sy] = k.iso([cx, FRONT + 1.2, plate.z + 15], P)
    const x = sx.toFixed(1)
    const y = sy.toFixed(1)
    out.push(
      `<g class="home-lamp" style="--i:${plate.index}">`
      + `<circle class="home-lamp-glow" cx="${x}" cy="${y}" r="${lit ? 5.2 : 4.4}"/>`
      + `<circle class="home-lamp-dot" cx="${x}" cy="${y}" r="${lit ? 1.7 : 1.3}"/>`
      + '</g>',
    )
  }
  return out.join('')
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
    return `<a class="home-channel" href="${href}" aria-label="${label}"${current}><title>${label}</title><path class="home-channel-hit" d="${d}"/></a>`
  }).join('')
}
