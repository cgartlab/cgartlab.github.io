import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { tubePieces, tubeSvg } from '../anatomy/tube.mjs'

/**
 * The shared chassis: one cabinet, one lift well, one seven-plate channel strip.
 * Built once and reused by every module.
 */

export const TOP = 96
export const CABINET = { x: -170, y: -95, w: 310, d: 180, r: 8 }
export const HATCH = { x: -108, y: -48, w: 216, d: 96, r: 5 }
export const PLATFORM = k.insetPlan(HATCH, 4)
export const PLATFORM_Z = TOP - 5

const BODY = k.insetPlan(CABINET, 4)
const FRONT = CABINET.y + CABINET.d
const WELL_ID = 'home-well-clip'

/** Seven plates, evenly spread across the front face. */
export const PLATES = (() => {
  const w = 254 / 7
  return Array.from({ length: 7 }, (_, index) => ({
    index,
    x: -127 + index * w,
    w,
    z: 42,
    h: 30,
  }))
})()

export function chassisDefs(P) {
  const ring = k.ringOf(HATCH, 12).map(([x, y]) => k.iso([x, y, TOP], P))
  return `<defs><clipPath id="${WELL_ID}"><path d="${k.pathOf(ring, true)}"/></clipPath></defs>`
}

export function buildChassis(P, options = {}) {
  const labels = options.labels || []
  const labelSize = options.labelSize ?? 9
  const out = []

  // soft shadow under the whole machine
  out.push(`<path class="iso-halo" d="${k.haloOf(CABINET, -22, TOP + 22, P)}"/>`)

  // power cable leaves the back face — drawn before the body so its root is hidden
  const route = G.fillet(
    [[92, -86, 34], [92, -112, 12], [118, -128, -10], [150, -116, -16]],
    14,
    { P, tube: 3.2 },
  )
  for (const piece of tubePieces(route, 3.2, P, { maxLength: 34 })) {
    out.push(tubeSvg(piece, { tone: 'lo' }))
  }

  // feet, far before near
  const feet = k.corners(BODY, 12)
    .map(([x, y]) => ({ x, y, d: k.depthOf([x, y, 0], P) }))
    .sort((a, b) => a.d - b.d)
  for (const { x, y } of feet) {
    out.push(k.solidSvg(k.cylinder(x, y, 13, -22, 18, P, 28), { tone: 'lo' }))
    out.push(k.solidSvg(k.cylinder(x, y, 8.4, -4, 4, P, 24), { tone: 'mid' }))
    out.push(k.lineSvg(k.knurl(x, y, 8.4, -4, 0, 24, P, 0.3), { tone: 'faint' }))
  }

  // cabinet body + top plate
  out.push(k.solidSvg(k.slabOf(BODY, 0, TOP - 8, P, 10, 1.2), { tone: 'mid' }))
  out.push(k.solidSvg(k.slabOf(CABINET, TOP - 8, 8, P, 12, 1.6), { tone: 'mid' }))

  // the well: cavity + guide posts, clipped to the opening
  const ring = k.ringOf(HATCH, 12).map(([x, y]) => k.iso([x, y, TOP], P))
  const wellPath = k.pathOf(ring, true)
  out.push(`<g clip-path="url(#${WELL_ID})">`)
  out.push(`<path class="home-cavity" d="${wellPath}"/>`)
  for (const [x, y] of k.corners(k.insetPlan(HATCH, 11))) {
    out.push(k.solidSvg(k.cylinder(x, y, 3.2, TOP - 54, 50, P, 20), { tone: 'mid' }))
    out.push(k.lineSvg(k.sideArc(x, y, 3.2, TOP - 40, P, 14), { tone: 'faint' }))
  }
  out.push('</g>')

  // the lift platform the module stands on
  out.push(k.solidSvg(k.slabOf(PLATFORM, TOP - 5, 5, P, 8, 0.8), { tone: 'hi' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan(PLATFORM, 3), TOP, P, 8), { tone: 'faint' }))

  // ruler strip along the top's front edge
  const strip = { x: -140, y: 62, w: 280, d: 7, r: 1 }
  out.push(k.solidSvg(k.slabOf(strip, TOP, 0.8, P, 3), { tone: 'lo', crease: 'none' }))
  const ticks = k.topTicks(strip.x + 6, strip.x + strip.w - 6, 4, 5, strip.y + 0.8, 1, [2, 3.8], P)
  out.push(k.lineSvg(ticks.minor, { tone: 'lo' }), k.lineSvg(ticks.major, { tone: 'mid' }))
  out.push(k.dotsSvg([
    k.iso([strip.x + 2, strip.y + 3.5, TOP + 0.8], P),
    k.iso([strip.x + strip.w - 2, strip.y + 3.5, TOP + 0.8], P),
  ], { size: 0.45 }))

  // name plate on the front face
  const name = { x: -132, y: FRONT - 2, w: 88, d: 4, r: 1.5 }
  out.push(k.solidSvg(k.slabOf(name, 72, 18, P, 4, 0.4), { tone: 'lo' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan(name, 2), 88, P, 4), { tone: 'faint' }))
  out.push(k.faceTextSvg(
    k.sideMatrix([name.x + 6, name.y + name.d], 81, P, 'left'),
    'CGARTLAB',
    { size: 5.4, tone: 'mid' },
  ))
  out.push(k.faceTextSvg(
    k.sideMatrix([name.x + 6, name.y + name.d], 76, P, 'left'),
    'FLOW BENCH No.1',
    { size: 3.2, tone: 'faint' },
  ))

  // channel strip — one continuous brass panel with engraved dividers
  const panel = { x: -127, y: FRONT - 2, w: 254, d: 4, r: 2 }
  out.push(k.solidSvg(k.slabOf(panel, 42, 30, P, 4, 0.8), { tone: 'mid' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan(panel, 2.2), 71.4, P, 4), { tone: 'faint' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan(panel, 2.2), 42.2, P, 4), { tone: 'faint' }))

  const step = panel.w / 7
  for (let i = 1; i < 7; i++) {
    const x = panel.x + step * i
    out.push(k.lineSvg(k.segment([x, FRONT + 2, 46], [x, FRONT + 2, 68], P), { tone: 'faint' }))
  }

  for (const plate of PLATES) {
    const cx = plate.x + plate.w / 2
    const label = labels[plate.index] ?? ''
    if (label) {
      out.push(k.faceTextSvg(
        k.sideMatrix([cx, FRONT + 2], plate.z + 8, P, 'left'),
        label,
        { size: labelSize, tone: 'hi', anchor: 'middle' },
      ))
    }
    // lamp bezel on the panel face
    out.push(k.solidSvg(k.cylinder(cx, FRONT + 1.4, 2.4, plate.z + 19, 1.6, P, 16), { tone: 'lo' }))
  }

  return out.join('')
}

/** Lamps are emitted after the module so they stay readable. */
export function buildChannelOverlay(P, { active = 0 } = {}) {
  const out = []
  for (const plate of PLATES) {
    const cx = plate.x + plate.w / 2
    const lit = plate.index === active
    out.push(k.dotsSvg([k.iso([cx, FRONT + 2.2, plate.z + 20.6], P)], {
      size: lit ? 1.7 : 1.2,
      tone: lit ? 'hi' : 'lo',
    }))
  }
  return out.join('')
}

/**
 * Real anchors over the channel strip: crawlable, focusable, and big enough to
 * hit. Emitted after everything so they sit on top of the panel.
 */
export function buildChannelLinks(P, options = {}) {
  const labels = options.labels || []
  const hrefs = options.hrefs || []
  const active = options.active ?? 0
  return PLATES.map((plate) => {
    const x0 = plate.x + 1
    const x1 = plate.x + plate.w - 1
    const quad = [
      [x0, FRONT + 2.4, 43],
      [x1, FRONT + 2.4, 43],
      [x1, FRONT + 2.4, 71],
      [x0, FRONT + 2.4, 71],
    ]
    const d = k.pathOf(quad.map((p) => k.iso(p, P)), true)
    const label = labels[plate.index] ?? ''
    const href = hrefs[plate.index] ?? '#'
    const current = plate.index === active ? ' aria-current="page"' : ''
    return `<a class="home-channel" href="${href}" aria-label="${label}"${current}><path class="home-channel-hit" d="${d}"/></a>`
  }).join('')
}
