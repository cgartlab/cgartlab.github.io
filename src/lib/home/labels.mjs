import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'
import { faceMatrix, facePath, frameOf } from './frame.mjs'

/**
 * Module 05 — the label printer that carries "标签".
 *
 * A squat ticket printer: four short feet, a 96-wide body, a domed lid, a roll of
 * stock in a window frame on the lid, and a slot across the front with a cutter
 * bar over it and two transport rollers just inside. Eight tickets have already
 * left the slot and hang in the air, each printed with a real tag; they are the
 * only parts that are not seated.
 *
 * Each ticket stands in its frame's u-w plane — a card 26 wide by 12 tall, tipped
 * 18 degrees so its top edge comes toward the reader — and is drawn at its
 * floating position with no transform of its own. The CSS flies it in from the
 * slot mouth using the screen-space delta in `--fly-x` / `--fly-y`.
 *
 * Painter order is far to near: feet, body, lid, the frame's back and side bars,
 * the roll and its clear cover, the frame's front bar (which hides the roll's
 * underside), the front face, then the tickets.
 */
const BODY = { x: -48, y: -26, w: 96, d: 56, r: 7 }
const FOOT = 6
const BZ = TOP + FOOT
const LID_Z = BZ + 44
const LID_TOP = LID_Z + 4
const FRONT = BODY.y + BODY.d
const SLOT = { x: -34, w: 68, z: TOP + 30, h: 6 }
const CUTTER = SLOT.z + SLOT.h / 2 + 1.3
const MOUTH = [0, FRONT, SLOT.z]

// the window frame on the lid: four bars around an open tray, 54 x 28 inside
const TRAY = { x: -32, y: -19, w: 64, d: 38, r: 4 }
const TRAY_H = 5
const ROLL = { x0: -22, x1: 16, y: -2, r: 8.5 }
const ROLL_Z = LID_TOP + ROLL.r
const LEN = ROLL.x1 - ROLL.x0
const ROLL_F = G.frameAlong([ROLL.x0, ROLL.y, ROLL_Z], [1, 0, 0])

const CARD = { w: 31, h: 14, r: 2.4, pitch: -18 }
// x, y, height above TOP — five low and near, three high and far: a loose arc
const FLY = [
  [-84, 38, 84], [-42, 36, 90], [0, 34, 92], [42, 36, 90], [84, 38, 84],
  [-56, 18, 100], [0, 14, 104], [56, 18, 100],
]

const HAN = /[\u3000-\u9fff\uff00-\uffef]/
/** Rough advance in em, so a six-character tag still fits the paper. */
const measure = (text) => [...text].reduce((n, ch) => n + (HAN.test(ch) ? 1 : 0.62), 0)
const sizeOf = (text) => Math.min(5.3, 22 / Math.max(1, measure(text)))

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
function rocker(x, z, P, w = 13, h = 7) {
  const base = { x: x - w / 2 - 1, y: FRONT - 1.4, w: w + 2, d: 2.6, r: 1 }
  const cap = { x: x - w / 2, y: FRONT - 0.2, w, d: 1.4, r: 0.8 }
  return k.solidSvg(k.slabOf(base, z - h / 2 - 1, h + 2, P, 4, 0.5), { tone: 'lo' })
    + k.solidSvg(k.slabOf(cap, z - h / 2, h * 0.55, P, 4, 0.4), { tone: 'hi' })
    + k.solidSvg(k.slabOf(cap, z - h * 0.05, h * 0.55, P, 4, 0.4), { tone: 'mid' })
}

/** Half arc over the roll: an end rib of the clear cover. */
function rib(x, P) {
  const r = ROLL.r + 1.4
  const at = (t) => k.iso([x, ROLL.y + r * Math.cos(t), ROLL_Z + r * Math.sin(t)], P)
  return k.pathOf(Array.from({ length: 15 }, (_, i) => at((Math.PI * i) / 14)))
}

export function buildLabels(P, options = {}) {
  const tags = options.tags || []
  const caption = options.caption || '标签'
  const out = []

  // feet, far to near
  for (const { x, y } of k.corners(BODY, 8).map(([x, y]) => ({ x, y, d: k.depthOf([x, y, 0], P) })).sort((a, b) => a.d - b.d)) {
    out.push(k.solidSvg(k.cylinder(x, y, 5, TOP, FOOT, P, 18), { tone: 'lo' }))
    out.push(k.lineSvg(k.sideArc(x, y, 5, TOP + FOOT - 1.4, P, 12), { tone: 'faint' }))
  }

  // body, its lid seam, then the lid: one slab with a heavy bevel, so it domes
  out.push(k.solidSvg(k.slabOf(BODY, BZ, 44, P, 8, 2), { tone: 'mid' }))
  out.push(k.lineSvg(k.sideSeam(BODY, LID_Z, P, 8), { tone: 'faint' }))
  out.push(k.solidSvg(k.slabOf(k.insetPlan(BODY, 4), LID_Z, LID_TOP - LID_Z, P, 8, 2.6), { tone: 'hi' }))

  // window frame: back and side bars first, so the roll sits inside them
  for (const bar of [
    { x: TRAY.x, y: TRAY.y, w: TRAY.w, d: 5, r: 2 },
    { x: TRAY.x, y: TRAY.y + 5, w: 5, d: 28, r: 2 },
    { x: TRAY.x + TRAY.w - 5, y: TRAY.y + 5, w: 5, d: 28, r: 2 },
  ]) {
    out.push(k.solidSvg(k.slabOf(bar, LID_TOP, TRAY_H, P, 4, 0.5), { tone: 'mid' }))
    out.push(k.lineSvg(k.planOutline(k.insetPlan(bar, 1.6), LID_TOP + TRAY_H, P, 4), { tone: 'faint' }))
  }

  // the stock roll: wound surface, the two axles it turns on, and a clear cover
  out.push(k.solidSvg(G.solidOf([[0, ROLL.r], [LEN, ROLL.r]], ROLL_F, P), { tone: 'mid' }))
  out.push(k.lineSvg(k.coil(ROLL.x0 + 3, ROLL.x1 - 3, [ROLL.y, ROLL_Z], ROLL.r + 0.16, 3, 'x', P, 20).front, { tone: 'lo' }))
  for (const s of [-4, LEN]) {
    out.push(k.solidSvg(G.solidOf([[s, 3.4], [s + 4, 3.4]], ROLL_F, P), { tone: 'hi' }) + k.lineSvg(G.circleOf(ROLL_F, s + 4, 3.4, P), { tone: 'lo' }))
  }
  out.push(k.lineSvg(k.segment([ROLL.x0, ROLL.y, ROLL_Z + ROLL.r + 1.4], [ROLL.x1, ROLL.y, ROLL_Z + ROLL.r + 1.4], P), { tone: 'lo' }))
  for (const x of [ROLL.x0, ROLL.x1]) out.push(k.lineSvg(rib(x, P), { tone: 'lo' }))

  // the frame's front bar closes over the roll: it hides the underside
  out.push(k.solidSvg(k.slabOf({ x: TRAY.x, y: TRAY.y + TRAY.d - 5, w: TRAY.w, d: 5, r: 2 }, LID_TOP, TRAY_H, P, 4, 0.5), { tone: 'mid' }))

  // ---- front face -------------------------------------------------------
  // the slot: a dark recess with two transport rollers just inside it
  const slot = k.pathOf([
    k.iso([SLOT.x, FRONT + 0.06, SLOT.z - SLOT.h / 2], P), k.iso([SLOT.x + SLOT.w, FRONT + 0.06, SLOT.z - SLOT.h / 2], P),
    k.iso([SLOT.x + SLOT.w, FRONT + 0.06, SLOT.z + SLOT.h / 2], P), k.iso([SLOT.x, FRONT + 0.06, SLOT.z + SLOT.h / 2], P),
  ], true)
  out.push(`<path class="iso-shade" data-shade="0" d="${slot}"/>`)
  for (const dz of [-1.7, 1.7])
    out.push(k.solidSvg(G.solidOf([[0, 1.3], [SLOT.w - 12, 1.3]], G.frameAlong([SLOT.x + 6, FRONT - 2.4, SLOT.z + dz], [1, 0, 0]), P), { tone: 'hi' }))
  // cutter bar over the slot, with its blade line
  out.push(k.solidSvg(k.slabOf({ x: SLOT.x - 1, y: FRONT - 0.8, w: SLOT.w + 2, d: 2.2, r: 0.9 }, CUTTER, 1.9, P, 4, 0.5), { tone: 'hi' }))
  out.push(k.lineSvg(k.segment([SLOT.x, FRONT + 1.5, CUTTER - 0.15], [SLOT.x + SLOT.w, FRONT + 1.5, CUTTER - 0.15], P), { tone: 'lo' }))

  // rocker, LED, vent grille, engraved caption
  out.push(rocker(-30, TOP + 13, P))
  const led = G.frameAlong([-8, FRONT, TOP + 13], [0, 1, 0])
  out.push(k.solidSvg(G.ringBand(0, 1.2, 2.1, 2.9, led, P), { tone: 'mid' }))
  out.push(k.solidSvg(G.disc(0.8, 2, 1.9, led, P), { tone: 'hi' }))
  out.push(k.lineSvg(G.circleOf(led, 2.05, 1.9, P), { tone: 'faint' }))
  for (let i = 0; i < 5; i++) out.push(k.lineSvg(k.segment([8, FRONT + 0.3, TOP + 9 + i * 2], [38, FRONT + 0.3, TOP + 9 + i * 2], P), { tone: 'lo' }))
  out.push(k.faceTextSvg(k.sideMatrix([0, FRONT], TOP + 21, P, 'left'), caption, { size: 3, tone: 'lo', anchor: 'middle' }))

  // ---- the tickets, last ------------------------------------------------
  const ring = cardRing().map(([u, w]) => [u, 0, w])
  const [mx, my] = k.iso(MOUTH, P)
  FLY.map((at, index) => ({ F: cardAt(at), index }))
    .sort((a, b) => k.depthOf(a.F.at(0, 0, 0), P) - k.depthOf(b.F.at(0, 0, 0), P))
    .forEach(({ F, index }) => {
      const tag = [...(tags[index] || '')].slice(0, 6).join('')
      const paper = facePath(F, ring, P)
      const [fx, fy] = k.iso(F.at(0, 0, 0), P)
      out.push(`<g class="home-ticket" style="--fly-x:${(fx - mx).toFixed(1)}px;--fly-y:${(fy - my).toFixed(1)}px;--fly-delay:${index * 700}ms">`)
      out.push(`<path class="home-ticket-paper" fill="var(--home-paper)" d="${paper}"/>`)
      out.push(k.dotsSvg([-4.2, 0, 4.2].map((w) => k.iso(F.at(-12.6, 0, w), P)), { size: 0.6, tone: 'lo' }))
      out.push(k.faceTextSvg(faceMatrix(F, [-9.8, 0, 1.9], [1, 0, 0], [0, 0, -1], P), tag, { size: sizeOf(tag), tone: 'hi' }))
      out.push(k.lineSvg(paper, { tone: 'lo' }))
      out.push('</g>')
    })

  return out.join('')
}

export function labelsBounds() {
  const out = [
    ...k.boxCorners(BODY, TOP, LID_TOP),
    ...k.boxCorners(TRAY, LID_TOP, LID_TOP + TRAY_H),
    [ROLL.x0 - 4, ROLL.y - ROLL.r, ROLL_Z], [ROLL.x1 + 4, ROLL.y, ROLL_Z + ROLL.r + 2],
    [MOUTH[0], FRONT + 1.5, CUTTER + 2], [SLOT.x - 1, FRONT, SLOT.z - SLOT.h / 2], [SLOT.x + SLOT.w + 1, FRONT, SLOT.z - SLOT.h / 2],
  ]
  for (const at of FLY) {
    const F = cardAt(at)
    for (const [u, w] of [[-13, -6], [13, -6], [13, 6], [-13, 6]]) out.push(F.at(u, 0, w))
  }
  return out
}
