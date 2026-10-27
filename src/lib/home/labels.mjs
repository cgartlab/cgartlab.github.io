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
 * clear of the cutter. One ticket per tag on the site has already left the slot
 * and hangs in the air, each printed with a real tag; they are the only parts
 * that are not seated.
 *
 * The tickets are not a fixed table. The module prints exactly as many as it is
 * given, so the stack is laid out from `tags.length`: five across, rows filling
 * upward from just above the stock roll, a sheet 30 wide by 13 tall with 3.5
 * between. Twenty-six tags make six rows; sixty would make twelve, and the stack
 * grows rather than the module capping it. The widest row may not reach past
 * |x| = 100, and since a wider span would drag the shared projection sideways,
 * it is the sheet that shrinks there — to a floor of 24 × 11 — not the span.
 *
 * Each ticket stands in its frame's u-w plane — tipped 18 degrees so its top edge
 * comes toward the reader — and is drawn at its floating position with no
 * transform of its own. The CSS flies it out of the slot with two screen-space
 * deltas:
 *
 *   --fly-x / --fly-y   from the float back to the slot mouth  (it appears there)
 *   --out-x / --out-y   from the float to a point a few units clear of the
 *                       front face at slot height (it slides out and waits)
 *
 * The beat follows the count, too: twenty-six sheets at the old 700ms stagger
 * would have taken eighteen seconds, so the gap is 5600/N clamped to 140–700ms.
 * The sheets then arrive over five and a half seconds whatever the count, and the
 * last one settles before eight; the first still waits for the case to close.
 *
 * Painter order is far to near: feet, body, lid, the frame's back and side bars,
 * the roll and its clear cover, the frame's front bar (which hides the roll's
 * underside), the front face and its mechanism, then the tickets.
 *
 * Those runs are also the sub-assemblies: feet / body / window / roll / cradle /
 * face / tickets, each a contiguous `<g class="home-part">` carrying a --step.
 * Wrapping them changes no painter's order, only which assembly a path belongs
 * to; labels.css turns the shared settle into the real build — feet land, the
 * body settles on them, the frame swings down, the roll drops into it and rocks
 * once, the front bar closes, the face plate comes on last, and only then does
 * the printing start.
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

const CARD = { w: 32, h: 13.6, r: 2.2, pitch: -18 }
/** The plane the sheets hang in: a few units clear of the front face. */
const FLOAT_Y = 38
/**
 * The stage looks down at 18°, so a sheet hung d in front of a thing sits
 * d·tan18 lower on screen than the thing itself.
 */
const RAKE = (18 * Math.PI) / 180
/** The crown of the stock roll, its clear cover included. */
const CROWN = ROLL_Z + ROLL.r + 1.8
/**
 * The stack: five across, a 3.5 gutter between sheets, the lowest row above the
 * roll's crown so the stack rises out of the machine. Rows fill upward, so the
 * stack reads bottom-up in the site's own order — the most-used tag was printed
 * first and sits nearest the machine. Heights here are above TOP; cardAt adds
 * the deck.
 *
 * The lowest row cannot sit on the lid: the sheets stand three units in front of
 * the front face, and that depth alone drops them ~13 units on screen — enough
 * to print straight through the roll. Clearing the crown is what fixes the base.
 */
const GRID = {
  maxCols: 6,
  /** honeycomb pitch: air between the sheets, rows half a cell apart */
  pitchX: 38,
  pitchZ: 30,
  gap: 4.5,
  base: CROWN - TOP + (FLOAT_Y - ROLL.y) * Math.tan(RAKE) + (CARD.h / 2) * Math.cos(RAKE) + 4,
}
/** The stack may not reach past this in x; past it the sheet shrinks, not the span. */
const REACH = 100
/** The smallest a sheet may shrink to and still read as a label. */
const FLOOR = { w: 24, h: 11 }

/**
 * How long the case takes to build. The tickets wait for it: the first one
 * leaves the slot just after the last panel closes, so printing starts on a
 * finished machine. The beat between sheets then divides a fixed run between
 * however many tags there are, so 26 tickets print in the same handful of
 * seconds as 8 — clamped, because a 140ms beat is as fast as the eye reads a
 * sheet arriving and 700ms is as slow as a short run should feel.
 */
const BUILD = 1000
const RUN = 5600
const BEAT = { min: 140, max: 700 }

/**
 * The layout for a given number of tags: a centred row of up to five, rows
 * stacked upward. A short last row is centred on its own length, so the stack
 * reads as a stack rather than a grid with a hole punched out of it.
 */
function layout(count) {
  const n = Math.max(0, Math.floor(count))
  const cols = Math.min(GRID.maxCols, Math.max(1, Math.ceil(Math.sqrt(n * 1.45))))
  const rows = Math.max(1, Math.ceil(n / cols))
  const seats = []
  for (let index = 0; index < n; index++) {
    const row = Math.floor(index / cols)
    const column = index % cols
    const inRow = Math.min(cols, n - row * cols)
    // the bottom row is nearest the reader, the top row furthest back and
    // smallest: the projection does the rest
    const t = rows > 1 ? row / (rows - 1) : 0
    const scale = 1.16 - t * 0.38
    const depth = 14 - t * 58
    const card = { ...CARD, w: CARD.w * scale, h: CARD.h * scale, r: CARD.r * scale }
    const honey = row % 2 ? GRID.pitchX / 2 : 0
    seats.push({
      x: (column - (inRow - 1) / 2) * GRID.pitchX + honey,
      y: FLOAT_Y + depth,
      z: GRID.base + row * GRID.pitchZ,
      row,
      scale,
      depth,
      card,
    })
  }
  return { seats, card: CARD }
}

/** One sub-assembly. Each run is a contiguous stretch of what already painted
 *  together, so wrapping it changes no painter's order — only which assembly a
 *  path belongs to. `--step` is the shared settle contract in home.css;
 *  labels.css replaces it with the real assembly. */
function part(name, step, ...items) {
  return `<g class="home-part" data-part="${name}" style="--step:${step}">${items.join('')}</g>`
}

const HAN = /[\u3000-\u9fff\uff00-\uffef]/
/** Rough advance in em, so a nine-character tag still fits the paper. */
const measure = (text) => [...text].reduce((n, ch) => n + (HAN.test(ch) ? 1 : 0.62), 0)
/** The sheet's inner measure, and the type that fits it. */
const inkOf = (card) => card.w * 0.8
const sizeOf = (text, card) => Math.min(card.w * 0.17, inkOf(card) / Math.max(1, measure(text)))
/**
 * A tag too long for the sheet at reading size is clipped with an ellipsis
 * rather than shrunk into a smudge: the type never falls below ~11% of the
 * sheet's width, so every printed tag stays legible at 26 tickets.
 */
function printed(text, card) {
  const room = inkOf(card) / (card.w * 0.113)
  const chars = [...text]
  if (measure(text) <= room)
    return text
  let keep = chars.length - 1
  while (keep > 1 && measure(`${chars.slice(0, keep).join('')}…`) > room) keep--
  return `${chars.slice(0, keep).join('')}…`
}

/** A rounded rectangle in card space: u across, w up the card. */
function cardRing({ w, h, r }) {
  const corners = [[w / 2 - r, -h / 2 + r, -90], [w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180]]
  return corners.flatMap(([cu, cv, s]) => Array.from({ length: 4 }, (_, i) => {
    const a = ((s + i * 30) * Math.PI) / 180
    return [cu + r * Math.cos(a), cv + r * Math.sin(a)]
  }))
}

const cardAt = ({ x, y, z }) => frameOf({ pitch: CARD.pitch, origin: [x, y, TOP + z] })

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

  // feet, far to near: they land first, and the body settles onto them
  const feet = []
  for (const { x, y } of k.corners(BODY, 7).map(([x, y]) => ({ x, y, d: k.depthOf([x, y, 0], P) })).sort((a, b) => a.d - b.d)) {
    feet.push(k.solidSvg(k.cylinder(x, y, 7, TOP, FOOT, P, 20), { tone: 'lo' }))
    feet.push(k.lineSvg(k.sideArc(x, y, 7, TOP + FOOT - 1.6, P, 14), { tone: 'faint' }))
  }
  out.push(part('feet', 0, ...feet))

  // body, its lid seam, then the lid: one slab with a heavy bevel, so it domes
  out.push(part('body', 1,
    k.solidSvg(k.slabOf(BODY, BZ, BODY_H, P, 8, 3), { tone: 'mid' }),
    k.lineSvg(k.sideSeam(BODY, LID_Z, P, 8), { tone: 'faint' }),
    k.solidSvg(k.slabOf(k.insetPlan(BODY, 5), LID_Z, LID_TOP - LID_Z, P, 8, 3.4), { tone: 'hi' }),
  ))

  // window frame: back and side bars first, so the roll sits inside them
  const bars = []
  for (const bar of [
    { x: TRAY.x, y: TRAY.y, w: TRAY.w, d: BAR, r: 2.5 },
    { x: TRAY.x, y: TRAY.y + BAR, w: BAR, d: TRAY.d - BAR * 2, r: 2.5 },
    { x: TRAY.x + TRAY.w - BAR, y: TRAY.y + BAR, w: BAR, d: TRAY.d - BAR * 2, r: 2.5 },
  ]) {
    bars.push(k.solidSvg(k.slabOf(bar, LID_TOP, TRAY_H, P, 4, 0.6), { tone: 'mid' }))
    bars.push(k.lineSvg(k.planOutline(k.insetPlan(bar, 1.8), LID_TOP + TRAY_H, P, 4), { tone: 'faint' }))
  }
  out.push(part('window', 2, ...bars))

  // the stock roll: it drops into the cradle the bars have just made
  out.push(part('roll', 3, stock(P)))

  // the frame's front bar closes over the roll: it hides the underside
  out.push(part('cradle', 4,
    k.solidSvg(k.slabOf({ x: TRAY.x, y: TRAY.y + TRAY.d - BAR, w: TRAY.w, d: BAR, r: 2.5 }, LID_TOP, TRAY_H, P, 4, 0.6), { tone: 'mid' }),
  ))

  // ---- front face -------------------------------------------------------
  // The plate carries the whole mechanism, so it closes on last and brings the
  // slot, the transport pair, the cutter, the carriage, the rocker and the lamp
  // with it. The face's own children keep their own animations untouched.
  const face = []
  // the slot: a dark recess with the transport pair just inside it
  const slot = k.pathOf([
    k.iso([SLOT.x, FRONT + 0.06, SLOT.z - SLOT.h / 2], P), k.iso([SLOT.x + SLOT.w, FRONT + 0.06, SLOT.z - SLOT.h / 2], P),
    k.iso([SLOT.x + SLOT.w, FRONT + 0.06, SLOT.z + SLOT.h / 2], P), k.iso([SLOT.x, FRONT + 0.06, SLOT.z + SLOT.h / 2], P),
  ], true)
  face.push(`<path class="home-cavity" d="${slot}"/>`)
  face.push(k.solidSvg(G.solidOf([[0, INNER.r], [SLOT.w - 14, INNER.r]], G.frameAlong([SLOT.x + 7, INNER.y, INNER.z], [1, 0, 0]), P), { tone: 'mid', className: 'home-platen' }))

  // the knurled transport wheel, seated on the face at the mouth's right
  const [wx, wy] = k.iso(WHEEL_AT, P)
  // the drive is a hand crank, not a wheel: a shaft boss, an arm, a grip and a
  // counterweight, turning on the shaft's own projected centre
  face.push(k.lineSvg(G.circleOf(WHEEL_F, 0.2, 4.6, P), { tone: 'faint' }))
  face.push(k.solidSvg(G.solidOf([[0, 3.6], [2.2, 3.6]], WHEEL_F, P), { tone: 'mid' }))
  face.push(`<g class="home-feed-roller" style="transform-origin:${wx.toFixed(1)}px ${wy.toFixed(1)}px">`)
  // the arm: a bar in the face plane, swung 40 degrees off vertical
  const arm = [[-1.3, 0], [1.3, 0], [8.4 + 1.3, 7.1], [8.4 - 1.3, 7.1]]
  face.push(k.solidSvg(G.prismOf(WHEEL_F, arm, 1.6, 3.4, P), { tone: 'mid' }))
  // the counterweight, opposite the grip
  face.push(k.solidSvg(G.solidOf([[3.4, 3.4], [4.6, 3.4], [4.6, 5.2], [3.4, 5.2]], WHEEL_F, P), { tone: 'lo' }))
  // the grip: a turned handle standing off the arm
  const grip = G.frameAlong([WHEEL.x + 8.4, FRONT + 3.4, WHEEL.z + 7.1], [0, 1, 0])
  face.push(k.solidSvg(G.solidOf([[0, 2.1], [3.6, 2.1], [3.6, 2.6], [6.2, 2.6], [6.2, 2.1]], grip, P), { tone: 'hi' }))
  face.push(k.lineSvg(G.arcOf(grip, 5.6, 2.7, P), { tone: 'faint' }))
  face.push('</g>')
  face.push(k.solidSvg(G.disc(2.2, 4.2, 1.4, WHEEL_F, P), { tone: 'hi' }))


  // cutter bar over the slot, with its blade line
  face.push('<g class="home-cutter">')
  face.push(k.solidSvg(k.slabOf({ x: SLOT.x - 2, y: FRONT - 1, w: SLOT.w + 4, d: 2.6, r: 1 }, CUTTER, 2.4, P, 4, 0.6), { tone: 'hi' }))
  face.push(k.lineSvg(k.segment([SLOT.x - 1, FRONT + 1.7, CUTTER - 0.2], [SLOT.x + SLOT.w + 1, FRONT + 1.7, CUTTER - 0.2], P), { tone: 'lo' }))
  face.push('</g>')

  // print carriage: the rail is fixed, the carriage and its dark bar shuttle
  face.push(k.solidSvg(k.slabOf({ x: RAIL.x, y: FRONT - 1.6, w: RAIL.w, d: 3.4, r: 1.2 }, RAIL.z, RAIL.h, P, 4, 0.6), { tone: 'mid' }))
  for (const x of [RAIL.x + 1, RAIL.x + RAIL.w - 6]) {
    face.push(k.solidSvg(k.slabOf({ x, y: FRONT - 1.9, w: 5, d: 4, r: 1 }, RAIL.z - 3.4, 3.4, P, 4, 0.5), { tone: 'lo' }))
  }
  face.push('<g class="home-print-head">')
  face.push(k.solidSvg(k.slabOf({ x: CARRIAGE.x, y: FRONT - 2.4, w: CARRIAGE.w, d: 5, r: 1.6 }, CARRIAGE.z, CARRIAGE.h, P, 4, 0.9), { tone: 'hi' }))
  face.push(k.lineSvg(k.segment([CARRIAGE.x + 3, FRONT + 2.7, CARRIAGE.z + 2.7], [CARRIAGE.x + CARRIAGE.w - 3, FRONT + 2.7, CARRIAGE.z + 2.7], P), { tone: 'lo' }))
  const bar = k.pathOf([
    k.iso([PRINT_BAR.x, FRONT + 2.5, PRINT_BAR.z], P), k.iso([PRINT_BAR.x + PRINT_BAR.w, FRONT + 2.5, PRINT_BAR.z], P),
    k.iso([PRINT_BAR.x + PRINT_BAR.w, FRONT + 2.5, PRINT_BAR.z + PRINT_BAR.h], P), k.iso([PRINT_BAR.x, FRONT + 2.5, PRINT_BAR.z + PRINT_BAR.h], P),
  ], true)
  face.push(`<path class="home-cavity" d="${bar}"/>${k.lineSvg(bar, { tone: 'mid' })}`)
  face.push('</g>')

  // rocker, LED, vent grille, engraved caption
  face.push(rocker(-45, TOP + 19, P))
  const led = G.frameAlong([-20, FRONT, TOP + 19], [0, 1, 0])
  face.push('<g class="home-label-led">')
  face.push(k.solidSvg(G.ringBand(0, 1.5, 2.4, 3.4, led, P), { tone: 'mid' }))
  face.push(k.solidSvg(G.disc(1, 2.5, 2.2, led, P), { tone: 'hi' }))
  face.push(k.lineSvg(G.circleOf(led, 2.6, 2.2, P), { tone: 'faint' }))
  face.push('</g>')
  for (let i = 0; i < 5; i++) face.push(k.lineSvg(k.segment([10, FRONT + 0.3, TOP + 13 + i * 2.6], [50, FRONT + 0.3, TOP + 13 + i * 2.6], P), { tone: 'lo' }))
  face.push(k.faceTextSvg(k.sideMatrix([0, FRONT], TOP + 27, P, 'left'), caption, { size: 4.4, tone: 'lo', anchor: 'middle' }))

  out.push(part('face', 5, ...face))

  // ---- the tickets, last ------------------------------------------------
  // They wait for the case: the wrapper holds them back until the last panel is
  // on, and each ticket's own delay is measured from that beat. The count is the
  // tag count, so the stack grows with the site rather than stopping at eight.
  const { seats } = layout(tags.length)
  const [mx, my] = k.iso(MOUTH, P)
  const [ox, oy] = k.iso(OUT, P)
  const beat = Math.round(Math.min(BEAT.max, Math.max(BEAT.min, RUN / Math.max(1, seats.length))))
  const tickets = []
  seats.map((seat, index) => ({ F: cardAt(seat), index }))
    .sort((a, b) => k.depthOf(a.F.at(0, 0, 0), P) - k.depthOf(b.F.at(0, 0, 0), P))
    .forEach(({ F, index }) => {
      const seat = seats[index]
      const card = seat.card
      const ring = cardRing(card).map(([u, w]) => [u, 0, w])
      const stitch = -card.w * 0.365
      const tag = printed(tags[index] || '', card)
      const size = sizeOf(tag, card)
      const paper = facePath(F, ring, P)
      const [fx, fy] = k.iso(F.at(0, 0, 0), P)
      // deltas run from the float *back* to the machine: mouth first, then out
      const fly = [mx - fx, my - fy]
      const exit = [ox - fx, oy - fy]
      tickets.push(`<g class="home-ticket" data-depth="${seat.scale > 1.05 ? 'near' : seat.scale > 0.9 ? 'mid' : 'far'}" style="--fly-x:${fly[0].toFixed(1)}px;--fly-y:${fly[1].toFixed(1)}px;--out-x:${exit[0].toFixed(1)}px;--out-y:${exit[1].toFixed(1)}px;--fly-delay:${BUILD + index * beat}ms">`)
      tickets.push(`<path class="home-ticket-paper" fill="var(--home-paper)" d="${paper}"/>`)
      // the perforated edge down the left margin
      tickets.push(k.lineSvg(k.pathOf([k.iso(F.at(stitch, 0, -card.h * 0.38), P), k.iso(F.at(stitch, 0, card.h * 0.38), P)]), { tone: 'lo', dotted: true }))
      tickets.push(k.faceTextSvg(faceMatrix(F, [card.w * 0.06, 0, -size * 0.36], [1, 0, 0], [0, 0, -1], P), tag, { size, tone: 'hi', anchor: 'middle' }))
      tickets.push(k.lineSvg(paper, { tone: 'lo' }))
      tickets.push('</g>')
    })
  out.push(part('tickets', 6, ...tickets))

  return out.join('')
}

/**
 * The envelope the shared projection has to hold. Bounds are read before the
 * tags are known — the caller builds the projection once, for every device —
 * so the stack is reserved at the depth it reaches at the site's tag count
 * today: six rows. A caller that does have the tags can pass them and get the
 * exact envelope for its own stack.
 */
const RESERVE_ROWS = 6
const RESERVE = RESERVE_ROWS * GRID.cols

export function labelsBounds(options = {}) {
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
  const count = options.tags?.length ?? options.count ?? RESERVE
  const { seats, card } = layout(count)
  for (const seat of seats) {
    const F = cardAt(seat)
    for (const [u, w] of [[-card.w / 2, -card.h / 2], [card.w / 2, -card.h / 2], [card.w / 2, card.h / 2], [-card.w / 2, card.h / 2]]) out.push(F.at(u, 0, w))
  }
  return out
}
