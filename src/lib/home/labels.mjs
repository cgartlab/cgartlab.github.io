import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'
import { faceMatrix, facePath, frameOf } from './frame.mjs'

/**
 * Module 05 — the label printer that carries "标签".
 *
 * A ticket printer scaled to the deck: four short feet, a 124 × 70 body standing
 * 56 tall, a domed lid, and a stock roll resting in a window frame on top. The
 * front face carries the mechanism in bands — a rocker, an indicator lamp and a
 * vent grille low down; the engraved caption; the slot with its platen just
 * inside and the knurled transport wheel at its right; the cutter bar over the
 * slot; and above that a print carriage riding a rail, its dark print bar hanging
 * clear of the cutter. Eight tickets have already left the slot and hang in the
 * air, each printed with a real tag; they are the only parts that are not seated.
 *
 * Each ticket stands in its frame's u-w plane — a card 40 wide by 18 tall, tipped
 * 18 degrees so its top edge comes toward the reader — and is drawn at its
 * floating position with no transform of its own. The CSS flies it out of the
 * slot with two screen-space deltas:
 *
 *   --fly-x / --fly-y   from the float back to the slot mouth  (it appears there)
 *   --out-x / --out-y   from the float to a point a few units clear of the
 *                       front face at slot height (it slides out and waits)
 *
 * Painter order is far to near: feet, body, lid, the frame's back and side bars,
 * the roll and its clear cover, the frame's front bar (which hides the roll's
 * underside), the front face and its mechanism, then the tickets.
 */

const BODY = { x: -62, y: -35, w: 124, d: 70, r: 9 }
const FOOT = 8
const BODY_H = 56
const BZ = TOP + FOOT
const LID_Z = BZ + BODY_H
const LID_TOP = LID_Z + 5
const FRONT = BODY.y + BODY.d

const SLOT = { x: -36, w: 72, z: TOP + 38, h: 9 }
const CUTTER = SLOT.z + SLOT.h / 2 + 1.3
const MOUTH = [0, FRONT, SLOT.z]
const OUT = [0, FRONT + 8, SLOT.z]

// the window frame on the lid: four bars around an open tray, 72 x 38 inside
const TRAY = { x: -42, y: -25, w: 84, d: 50, r: 5 }
const TRAY_H = 6
const BAR = 6
const ROLL = { x0: -29, x1: 21, y: -3, r: 10.5 }
const ROLL_Z = LID_TOP + ROLL.r
const LEN = ROLL.x1 - ROLL.x0
const ROLL_F = G.frameAlong([ROLL.x0, ROLL.y, ROLL_Z], [1, 0, 0])

// the platen inside the mouth, and the knurled transport wheel at its right
const INNER = { y: FRONT - 4.2, z: SLOT.z - 2.4, r: 2.8 }
const WHEEL = { x: 47, z: SLOT.z, r: 6.2, face: 2.4 }
const WHEEL_F = G.frameAlong([WHEEL.x, FRONT, WHEEL.z], [0, 1, 0])
const WHEEL_AT = [WHEEL.x, FRONT + WHEEL.face * 0.5, WHEEL.z]

// print carriage: rail on top, the carriage hanging under it, dark bar at its foot
const RAIL = { x: SLOT.x - 7, w: SLOT.w + 14, z: SLOT.z + SLOT.h / 2 + 16.1, h: 2.6 }
const CARRIAGE = { x: -15, w: 30, z: RAIL.z - 6.2, h: 6.2 }
const PRINT_BAR = { x: -12, w: 24, z: CARRIAGE.z - 2.8, h: 2.8 }

const CARD = { w: 40, h: 18, r: 2.8, pitch: -18 }
/**
 * x, y, height above TOP. Five low and near on a shallow arc, three high and
 * far in a tighter one nested over the gaps: the fan rises clear of the roll and
 * never overlaps itself or the machine.
 */
const FLY = [
  [-94, 38, 103], [-47, 38, 115], [0, 38, 121], [47, 38, 115], [94, 38, 103],
  [-68, 14, 132], [0, 14, 138], [68, 14, 132],
]

const HAN = /[\u3000-\u9fff\uff00-\uffef]/
/** Rough advance in em, so a nine-character tag still fits the paper. */
const measure = (text) => [...text].reduce((n, ch) => n + (HAN.test(ch) ? 1 : 0.62), 0)
const sizeOf = (text) => Math.min(6.8, 32 / Math.max(1, measure(text)))

/** A rounded rectangle in card space: u across, w up the card. */
function cardRing() {
  const { w, h, r } = CARD
  const corners = [[w / 2 - r, -h / 2 + r, -90], [w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180]]
  return corners.flatMap(([cu, cv, s]) => Array.from({ length: 4 }, (_, i) => {
    const a = ((s + i * 30) * Math.PI) / 180
    return [cu + r * Math.cos(a), cv + r * Math.sin(a)]
  }))
}

const cardAt = ([x, y, z]) => frameOf({ pitch: CARD.pitch, origin: [x, y, TOP + z] })

/** A rocker switch, seated on the front face. */
function rocker(x, z, P, w = 17, h = 9) {
  const base = { x: x - w / 2 - 1.2, y: FRONT - 1.6, w: w + 2.4, d: 3, r: 1.2 }
  const cap = { x: x - w / 2, y: FRONT - 0.3, w, d: 1.6, r: 1 }
  return k.solidSvg(k.slabOf(base, z - h / 2 - 1.2, h + 2.4, P, 4, 0.6), { tone: 'lo' })
    + k.solidSvg(k.slabOf(cap, z - h / 2, h * 0.55, P, 4, 0.5), { tone: 'hi' })
    + k.solidSvg(k.slabOf(cap, z - h * 0.05, h * 0.55, P, 4, 0.5), { tone: 'mid' })
}

/** Half arc over the roll: an end rib of the clear cover. */
function rib(x, P) {
  const r = ROLL.r + 1.8
  const at = (t) => k.iso([x, ROLL.y + r * Math.cos(t), ROLL_Z + r * Math.sin(t)], P)
  return k.pathOf(Array.from({ length: 15 }, (_, i) => at((Math.PI * i) / 14)))
}

/** The stock roll: wound surface, axles, and the clear cover over it. */
function stock(P) {
  const out = []
  out.push(k.solidSvg(G.solidOf([[0, ROLL.r], [LEN, ROLL.r]], ROLL_F, P), { tone: 'mid' }))
  out.push(k.lineSvg(k.coil(ROLL.x0 + 4, ROLL.x1 - 4, [ROLL.y, ROLL_Z], ROLL.r + 0.2, 3, 'x', P, 20).front, { tone: 'lo' }))
  for (const s of [-5, LEN]) {
    out.push(k.solidSvg(G.solidOf([[s, 4.2], [s + 5, 4.2]], ROLL_F, P), { tone: 'hi' }) + k.lineSvg(G.circleOf(ROLL_F, s + 5, 4.2, P), { tone: 'lo' }))
  }
  out.push(k.lineSvg(k.segment([ROLL.x0, ROLL.y, ROLL_Z + ROLL.r + 1.8], [ROLL.x1, ROLL.y, ROLL_Z + ROLL.r + 1.8], P), { tone: 'lo' }))
  for (const x of [ROLL.x0, ROLL.x1]) out.push(k.lineSvg(rib(x, P), { tone: 'lo' }))
  return out.join('')
}

export function buildLabels(P, options = {}) {
  const tags = options.tags || []
  const caption = options.caption || '标签'
  const out = []

  // feet, far to near
  for (const { x, y } of k.corners(BODY, 7).map(([x, y]) => ({ x, y, d: k.depthOf([x, y, 0], P) })).sort((a, b) => a.d - b.d)) {
    out.push(k.solidSvg(k.cylinder(x, y, 7, TOP, FOOT, P, 20), { tone: 'lo' }))
    out.push(k.lineSvg(k.sideArc(x, y, 7, TOP + FOOT - 1.6, P, 14), { tone: 'faint' }))
  }

  // body, its lid seam, then the lid: one slab with a heavy bevel, so it domes
  out.push(k.solidSvg(k.slabOf(BODY, BZ, BODY_H, P, 8, 3), { tone: 'mid' }))
  out.push(k.lineSvg(k.sideSeam(BODY, LID_Z, P, 8), { tone: 'faint' }))
  out.push(k.solidSvg(k.slabOf(k.insetPlan(BODY, 5), LID_Z, LID_TOP - LID_Z, P, 8, 3.4), { tone: 'hi' }))

  // window frame: back and side bars first, so the roll sits inside them
  for (const bar of [
    { x: TRAY.x, y: TRAY.y, w: TRAY.w, d: BAR, r: 2.5 },
    { x: TRAY.x, y: TRAY.y + BAR, w: BAR, d: TRAY.d - BAR * 2, r: 2.5 },
    { x: TRAY.x + TRAY.w - BAR, y: TRAY.y + BAR, w: BAR, d: TRAY.d - BAR * 2, r: 2.5 },
  ]) {
    out.push(k.solidSvg(k.slabOf(bar, LID_TOP, TRAY_H, P, 4, 0.6), { tone: 'mid' }))
    out.push(k.lineSvg(k.planOutline(k.insetPlan(bar, 1.8), LID_TOP + TRAY_H, P, 4), { tone: 'faint' }))
  }

  out.push(stock(P))

  // the frame's front bar closes over the roll: it hides the underside
  out.push(k.solidSvg(k.slabOf({ x: TRAY.x, y: TRAY.y + TRAY.d - BAR, w: TRAY.w, d: BAR, r: 2.5 }, LID_TOP, TRAY_H, P, 4, 0.6), { tone: 'mid' }))

  // ---- front face -------------------------------------------------------
  // the slot: a dark recess with the transport pair just inside it
  const slot = k.pathOf([
    k.iso([SLOT.x, FRONT + 0.06, SLOT.z - SLOT.h / 2], P), k.iso([SLOT.x + SLOT.w, FRONT + 0.06, SLOT.z - SLOT.h / 2], P),
    k.iso([SLOT.x + SLOT.w, FRONT + 0.06, SLOT.z + SLOT.h / 2], P), k.iso([SLOT.x, FRONT + 0.06, SLOT.z + SLOT.h / 2], P),
  ], true)
  out.push(`<path class="home-cavity" d="${slot}"/>`)
  out.push(k.solidSvg(G.solidOf([[0, INNER.r], [SLOT.w - 14, INNER.r]], G.frameAlong([SLOT.x + 7, INNER.y, INNER.z], [1, 0, 0]), P), { tone: 'mid', className: 'home-platen' }))

  // the knurled transport wheel, seated on the face at the mouth's right
  const [wx, wy] = k.iso(WHEEL_AT, P)
  out.push(k.lineSvg(G.circleOf(WHEEL_F, 0.2, WHEEL.r + 2.2, P), { tone: 'faint' }))
  out.push(`<g class="home-feed-roller" style="transform-origin:${wx.toFixed(1)}px ${wy.toFixed(1)}px"><g class="home-wheel">`)
  out.push(k.solidSvg(G.solidOf([[0, WHEEL.r], [WHEEL.face, WHEEL.r]], WHEEL_F, P), { tone: 'mid' }))
  out.push(k.lineSvg(G.spokesOf(WHEEL_F, WHEEL.face, WHEEL.r * 0.68, WHEEL.r * 0.98, 20, P), { tone: 'hi' }))
  out.push(k.lineSvg(G.circleOf(WHEEL_F, WHEEL.face, WHEEL.r * 0.68, P), { tone: 'faint' }))
  out.push(k.solidSvg(G.ringBand(WHEEL.face, WHEEL.face + 1.2, WHEEL.r * 0.28, WHEEL.r * 0.68, WHEEL_F, P), { tone: 'mid' }))
  out.push(k.lineSvg(G.circleOf(WHEEL_F, WHEEL.face + 1.2, WHEEL.r * 0.28, P), { tone: 'lo' }))
  out.push('</g></g>')

  // cutter bar over the slot, with its blade line
  out.push('<g class="home-cutter">')
  out.push(k.solidSvg(k.slabOf({ x: SLOT.x - 2, y: FRONT - 1, w: SLOT.w + 4, d: 2.6, r: 1 }, CUTTER, 2.4, P, 4, 0.6), { tone: 'hi' }))
  out.push(k.lineSvg(k.segment([SLOT.x - 1, FRONT + 1.7, CUTTER - 0.2], [SLOT.x + SLOT.w + 1, FRONT + 1.7, CUTTER - 0.2], P), { tone: 'lo' }))
  out.push('</g>')

  // print carriage: the rail is fixed, the carriage and its dark bar shuttle
  out.push(k.solidSvg(k.slabOf({ x: RAIL.x, y: FRONT - 1.6, w: RAIL.w, d: 3.4, r: 1.2 }, RAIL.z, RAIL.h, P, 4, 0.6), { tone: 'mid' }))
  for (const x of [RAIL.x + 1, RAIL.x + RAIL.w - 6]) {
    out.push(k.solidSvg(k.slabOf({ x, y: FRONT - 1.9, w: 5, d: 4, r: 1 }, RAIL.z - 3.4, 3.4, P, 4, 0.5), { tone: 'lo' }))
  }
  out.push('<g class="home-print-head">')
  out.push(k.solidSvg(k.slabOf({ x: CARRIAGE.x, y: FRONT - 2.4, w: CARRIAGE.w, d: 5, r: 1.6 }, CARRIAGE.z, CARRIAGE.h, P, 4, 0.9), { tone: 'hi' }))
  out.push(k.lineSvg(k.segment([CARRIAGE.x + 3, FRONT + 2.7, CARRIAGE.z + 2.7], [CARRIAGE.x + CARRIAGE.w - 3, FRONT + 2.7, CARRIAGE.z + 2.7], P), { tone: 'lo' }))
  const bar = k.pathOf([
    k.iso([PRINT_BAR.x, FRONT + 2.5, PRINT_BAR.z], P), k.iso([PRINT_BAR.x + PRINT_BAR.w, FRONT + 2.5, PRINT_BAR.z], P),
    k.iso([PRINT_BAR.x + PRINT_BAR.w, FRONT + 2.5, PRINT_BAR.z + PRINT_BAR.h], P), k.iso([PRINT_BAR.x, FRONT + 2.5, PRINT_BAR.z + PRINT_BAR.h], P),
  ], true)
  out.push(`<path class="home-cavity" d="${bar}"/>${k.lineSvg(bar, { tone: 'mid' })}`)
  out.push('</g>')

  // rocker, LED, vent grille, engraved caption
  out.push(rocker(-45, TOP + 19, P))
  const led = G.frameAlong([-20, FRONT, TOP + 19], [0, 1, 0])
  out.push('<g class="home-label-led">')
  out.push(k.solidSvg(G.ringBand(0, 1.5, 2.4, 3.4, led, P), { tone: 'mid' }))
  out.push(k.solidSvg(G.disc(1, 2.5, 2.2, led, P), { tone: 'hi' }))
  out.push(k.lineSvg(G.circleOf(led, 2.6, 2.2, P), { tone: 'faint' }))
  out.push('</g>')
  for (let i = 0; i < 5; i++) out.push(k.lineSvg(k.segment([10, FRONT + 0.3, TOP + 13 + i * 2.6], [50, FRONT + 0.3, TOP + 13 + i * 2.6], P), { tone: 'lo' }))
  out.push(k.faceTextSvg(k.sideMatrix([0, FRONT], TOP + 27, P, 'left'), caption, { size: 4.4, tone: 'lo', anchor: 'middle' }))

  // ---- the tickets, last ------------------------------------------------
  const ring = cardRing().map(([u, w]) => [u, 0, w])
  const [mx, my] = k.iso(MOUTH, P)
  const [ox, oy] = k.iso(OUT, P)
  FLY.map((at, index) => ({ F: cardAt(at), index }))
    .sort((a, b) => k.depthOf(a.F.at(0, 0, 0), P) - k.depthOf(b.F.at(0, 0, 0), P))
    .forEach(({ F, index }) => {
      const tag = [...(tags[index] || '')].slice(0, 9).join('')
      const size = sizeOf(tag)
      const paper = facePath(F, ring, P)
      const [fx, fy] = k.iso(F.at(0, 0, 0), P)
      // deltas run from the float *back* to the machine: mouth first, then out
      const fly = [mx - fx, my - fy]
      const exit = [ox - fx, oy - fy]
      out.push(`<g class="home-ticket" style="--fly-x:${fly[0].toFixed(1)}px;--fly-y:${fly[1].toFixed(1)}px;--out-x:${exit[0].toFixed(1)}px;--out-y:${exit[1].toFixed(1)}px;--fly-delay:${index * 700}ms">`)
      out.push(`<path class="home-ticket-paper" fill="var(--home-paper)" d="${paper}"/>`)
      // the perforated edge down the left margin
      out.push(k.lineSvg(k.pathOf([k.iso(F.at(-14.6, 0, -6.8), P), k.iso(F.at(-14.6, 0, 6.8), P)]), { tone: 'lo', dotted: true }))
      out.push(k.faceTextSvg(faceMatrix(F, [2.4, 0, -size * 0.36], [1, 0, 0], [0, 0, -1], P), tag, { size, tone: 'hi', anchor: 'middle' }))
      out.push(k.lineSvg(paper, { tone: 'lo' }))
      out.push('</g>')
    })

  return out.join('')
}

export function labelsBounds() {
  const out = [
    ...k.boxCorners(BODY, TOP, LID_TOP),
    ...k.boxCorners(TRAY, LID_TOP, LID_TOP + TRAY_H),
    [ROLL.x0 - 5, ROLL.y - ROLL.r, ROLL_Z], [ROLL.x1 + 5, ROLL.y, ROLL_Z + ROLL.r + 2],
    [SLOT.x - 2, FRONT + 3, CUTTER], [SLOT.x + SLOT.w + 2, FRONT + 3, CUTTER + 2.4],
    [RAIL.x, FRONT + 1.8, RAIL.z + RAIL.h], [RAIL.x + RAIL.w, FRONT - 1.9, RAIL.z - 3.4],
    [PRINT_BAR.x, FRONT + 2.5, PRINT_BAR.z], [PRINT_BAR.x + PRINT_BAR.w, FRONT + 2.5, PRINT_BAR.z + PRINT_BAR.h],
    [WHEEL.x - WHEEL.r - 2.4, FRONT + WHEEL.face, WHEEL.z - WHEEL.r - 2.4], [WHEEL.x + WHEEL.r + 2.4, FRONT, WHEEL.z + WHEEL.r + 2.4],
    [MOUTH[0], FRONT + 1.5, SLOT.z - SLOT.h / 2], [SLOT.x + SLOT.w, FRONT, SLOT.z + SLOT.h / 2],
  ]
  for (const at of FLY) {
    const F = cardAt(at)
    for (const [u, w] of [[-CARD.w / 2, -CARD.h / 2], [CARD.w / 2, -CARD.h / 2], [CARD.w / 2, CARD.h / 2], [-CARD.w / 2, CARD.h / 2]]) out.push(F.at(u, 0, w))
  }
  return out
}
