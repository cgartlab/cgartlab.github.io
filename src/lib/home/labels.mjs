import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'
import { boxSvg, faceMatrix, facePath, frameOf } from './frame.mjs'

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
 * and been stuck to the wall above the machine, each printed with a real tag;
 * they are the only parts that are not seated.
 *
 * The tickets are not a fixed table. The module prints exactly as many as it is
 * given, so the wall is dealt from `tags.length`: the sheets are dealt into a
 * grid of cells above the stock roll, then each one is nudged, turned and sized
 * on its own, so the result reads as paper stuck up by hand rather than a table.
 * Twenty-six tags make seven across and four rows; ninety-one make twelve and
 * eight, and the wall grows denser rather than the module capping it.
 *
 * Each ticket stands upright in its frame's u-w plane — a vertical wall facing
 * the reader — and is drawn at its stuck position with no transform of its own.
 * The CSS flies it out of the slot with two screen-space deltas:
 *
 *   --fly-x / --fly-y   from the wall back to the slot mouth  (it appears there)
 *   --out-x / --out-y   from the wall to a point a few units clear of the
 *                       front face at slot height (it slides out and waits)
 *
 * The beat follows the count, too: twenty-six sheets at the old 700ms stagger
 * would have taken eighteen seconds, so the gap is 5600/N clamped to 140–700ms.
 * The sheets then arrive over five and a half seconds whatever the count, and the
 * last one settles before eight; the first still waits for the case to close.
 *
 * Painter order is far to near: feet, body, lid, the frame's back and side bars,
 * the roll and its clear cover, the frame's front bar (which hides the roll's
 * underside), the blade bar, the front face and its mechanism, then the fittings
 * that bolt onto it — the chute, the pinch roller, the badge, the lid latch and
 * the waste drawer — and last the tickets.
 *
 * Those runs are also the sub-assemblies: feet / body / window / roll / cradle /
 * cutter / face / guide / pinch / plate / latch / bin / tickets, each a
 * contiguous `<g class="home-part">` carrying a --step. Wrapping them changes no
 * painter's order, only which assembly a path belongs to; labels.css turns the
 * shared settle into the real build — the feet land, the body settles on them,
 * the frame swings down, the roll drops into it and rocks once, the front bar
 * clamps over it, the blade seats on the panel's top edge, the face plate comes
 * on carrying the whole mechanism, and only then do the fittings go on one at a
 * time. The machine then runs itself for a beat — the transport wheel turns a
 * revolution and the blade snaps at nothing — before the first ticket is
 * printed, so the wall is only ever fed by a machine that works.
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
/** One turn of the wound seam: the roll turns by exactly this much per loop. */
const COIL_PITCH = 14
const ROLL_F = G.frameAlong([ROLL.x0, ROLL.y, ROLL_Z], [1, 0, 0])

// the platen inside the mouth, and the transport dial at its right
const INNER = { y: FRONT - 4.2, z: SLOT.z - 2.4, r: 2.8 }
const WHEEL = { x: 47, z: SLOT.z, r: 6.2, face: 2.4 }
const WHEEL_F = G.frameAlong([WHEEL.x, FRONT, WHEEL.z], [0, 1, 0])
const WHEEL_AT = [WHEEL.x, FRONT + WHEEL.face * 0.5, WHEEL.z]

// print carriage: rail on top, the carriage hanging under it, dark bar at its foot
const RAIL = { x: SLOT.x - 7, w: SLOT.w + 14, z: SLOT.z + SLOT.h / 2 + 16.1, h: 2.6 }
const CARRIAGE = { x: -15, w: 30, z: RAIL.z - 6.2, h: 6.2 }
const PRINT_BAR = { x: -12, w: 24, z: CARRIAGE.z - 2.8, h: 2.8 }

// The fittings that go on after the panel. Each sits inside the envelope the
// projection is already fitted to: the deepest of them stops at y = 37.2, a
// whisker behind the transport wheel's cap at 37.4.
//
// the paper guide: a chute off the frame's front bar, over the body's bevel and
// down to the mouth, so the stock never rides the lid seam
const GUIDE = { y: 25.2, z: LID_TOP + 0.4, pitch: -16, w: 78, d: 11, h: 1.4 }
const GUIDE_F = frameOf({ pitch: GUIDE.pitch, origin: [0, GUIDE.y, GUIDE.z] })
// the pinch roller: two steel wheels pressing the stock onto the platen. They
// sit inside the mouth rather than on the panel — the module clips them to the
// slot, so only the rim above the lower lip shows and the pair reads as part of
// the feed instead of two buttons bolted to the front.
const PINCH = { x: -23, gap: 8, r: 2, z: SLOT.z - SLOT.h / 2 + 0.2 }
// the badge, the lid latch and the waste drawer, spread over the front panel
const PLATE = { x: 10, w: 22, z: TOP + 8.6, h: 4.2 }
const LATCH = { z: TOP + 53.6, h: 10.4 }
const BIN = { z: TOP + 8.2, h: 7.8, d: 3.2 }

const CARD = { w: 32, h: 13.6, r: 1.2 }
/**
 * The wall the sheets are stuck to: a vertical plane a few units clear of the
 * front face, square to the reader. A sheet pinned to a wall stands upright in
 * it — the only lean it gets is the 18° the stage looks down from.
 */
const WALL_PITCH = 0
const FLOAT_Y = 38
/**
 * The stage looks down at 18°, so a sheet hung d in front of a thing sits
 * d·tan18 lower on screen than the thing itself.
 */
const RAKE = (18 * Math.PI) / 180
/** The crown of the stock roll, its clear cover included. */
const CROWN = ROLL_Z + ROLL.r + 1.8
/**
 * The wall's cells: one sheet per cell, the lowest row above the roll's crown so
 * the wall rises out of the machine. Rows fill upward, so the wall reads
 * bottom-up in the site's own order — the most-used tag was printed first and
 * sits nearest the machine. Heights here are above TOP; cardAt adds the deck.
 *
 * The lowest row cannot sit on the lid: the sheets stand three units in front of
 * the front face, and that depth alone drops them ~13 units on screen — enough
 * to print straight through the roll. Clearing the crown is what fixes the base.
 */
const GRID = {
  maxCols: 12,
  /** cell pitch: a sheet's own size plus the gutter it is stuck up with */
  pitchX: CARD.w + 5,
  pitchZ: CARD.h + 5.2,
  /** the box the wall may occupy — the same on every locale */
  box: { w: 259, h: 76 },
  base: CROWN - TOP + (FLOAT_Y - ROLL.y) * Math.tan(RAKE) + CARD.h / 2 + 4,
}

/**
 * How long the case takes to build. The tickets wait for it: the last fitting
 * lands at ~2.3s, the machine then runs a trial beat of its own — one turn of
 * the transport wheel, one snap of the blade at nothing — and only then does the
 * first sheet leave the slot, so the wall is fed by a machine that works. The
 * beat between sheets then divides a fixed run between however many tags there
 * are, so 26 tickets print in the same handful of seconds as 8 — clamped,
 * because a 140ms beat is as fast as the eye reads a sheet arriving and 700ms is
 * as slow as a short run should feel.
 */
const BUILD = 3000
const RUN = 5600
const BEAT = { min: 140, max: 700 }

/** A fixed pseudo-random in [0, 1): the wall is dealt the same way every build. */
function rnd(seed) {
  let t = (seed + 0x9e3779b9) | 0
  t = Math.imul(t ^ (t >>> 16), 0x21f0aaad)
  t = Math.imul(t ^ (t >>> 15), 0x735a2d97)
  return ((t ^ (t >>> 15)) >>> 0) / 4294967296
}

/**
 * The layout for a given number of tags. The sheets are dealt into a grid of
 * cells and then each one is nudged off its cell, turned and sized on its own —
 * a grid is only there to stop them burying each other, and it should not be
 * visible. A short last row is centred on its own length, so the wall keeps its
 * balance when the count does not divide.
 */
function layout(count) {
  const n = Math.max(0, Math.floor(count))
  const cols = Math.min(GRID.maxCols, Math.max(1, Math.ceil(Math.sqrt(n * 1.45))))
  const rows = Math.max(1, Math.ceil(n / cols))
  // squeeze the pitch (and with it the sheets) into the fixed box, so a locale
  // with many tags gets a denser wall rather than a smaller machine
  const fit = Math.min(1, GRID.box.w / (cols * GRID.pitchX), GRID.box.h / (rows * GRID.pitchZ))
  const pitchX = GRID.pitchX * fit
  const pitchZ = GRID.pitchZ * fit
  const seats = []
  for (let index = 0; index < n; index++) {
    const row = Math.floor(index / cols)
    const column = index % cols
    const inRow = Math.min(cols, n - row * cols)
    const r = slot => rnd(index * 11 + slot)
    // every row is also pushed along a little, so the vertical seams of the
    // grid never line up down the wall
    const rowShift = (rnd(row * 31 + 13) - 0.5) * pitchX * 0.7
    const scale = fit * (0.93 + r(1) * 0.13)
    seats.push({
      x: (column - (inRow - 1) / 2) * pitchX + rowShift + (r(2) - 0.5) * pitchX * 0.16,
      // a hair of depth either way, so overlapping sheets layer instead of
      // fighting — the wall has a little relief, not a plane of stickers
      y: FLOAT_Y + (r(3) - 0.5) * 2.2,
      z: GRID.base + row * pitchZ + (rnd(row * 17 + 3) - 0.5) * pitchZ * 0.5 + (r(4) - 0.5) * pitchZ * 0.16,
      scale,
      tilt: (r(5) - 0.5) * 9,
      corner: r(6) < 0.5 ? -1 : 1,
      tape: r(7) < 0.74,
      tapeAngle: (r(8) - 0.5) * 74,
      card: { ...CARD, w: CARD.w * scale, h: CARD.h * scale, r: CARD.r * scale },
    })
  }
  return { seats }
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

const cardAt = ({ x, y, z }) => frameOf({ pitch: WALL_PITCH, origin: [x, y, TOP + z] })

/**
 * A strip of tape over a corner of the sheet, half on the paper and half on the
 * wall. It is drawn in the card's own plane, a whisker in front of it, so it
 * turns with the sheet; the angle is the sheet's, not the reader's.
 */
function tapeOn(F, card, corner, angle, P) {
  const a = (angle * Math.PI) / 180
  const ca = Math.cos(a)
  const sa = Math.sin(a)
  const cu = corner * (card.w / 2 - 1.9)
  const cv = card.h / 2 - 1.5
  const half = { u: 4.4, v: 1.5 }
  const pts = [[-half.u, -half.v], [half.u, -half.v], [half.u, half.v], [-half.u, half.v]]
    .map(([u, v]) => [cu + u * ca - v * sa, 0.35, cv + u * sa + v * ca])
  return `<path class="home-ticket-tape" d="${facePath(F, pts, P)}"/>`
}

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

  // The wound paper turns. A cylinder's spin cannot be drawn — the surface is
  // the same from every angle — so the seam does the work: it is a helix, and a
  // helix slid along its own axis by one pitch looks exactly like the roll
  // turning. The coil is drawn a pitch past both ends and clipped to the
  // silhouette, so the loop has no visible start or finish.
  const { sinE, cosE } = k.cameraOf(P)
  const [ax] = k.iso([ROLL.x0, ROLL.y, ROLL_Z], P)
  const [bx] = k.iso([ROLL.x1, ROLL.y, ROLL_Z], P)
  const shift = ((bx - ax) / LEN) * COIL_PITCH
  const from = ROLL.x0 - COIL_PITCH
  const to = ROLL.x1 + COIL_PITCH
  const wound = k.coil(from, to, [ROLL.y, ROLL_Z], ROLL.r + 0.2, (to - from) / COIL_PITCH, 'x', P, 20)
  // the roll's silhouette: the two generators the camera sees edge-on, one at
  // elevation - 90, one at elevation + 90
  const edge = (x, side) => k.iso([x, ROLL.y + side * ROLL.r * sinE, ROLL_Z - side * ROLL.r * cosE], P)
  const outline = k.pathOf([edge(ROLL.x0, -1), edge(ROLL.x1, -1), edge(ROLL.x1, 1), edge(ROLL.x0, 1)], true)
  out.push(`<defs><clipPath id="home-roll-clip"><path d="${outline}"/></clipPath></defs>`)
  out.push(`<g class="home-stock-roll" style="--roll-shift:${shift.toFixed(2)}px" clip-path="url(#home-roll-clip)">`)
  out.push(k.lineSvg(wound.front, { tone: 'lo' }))
  out.push('</g>')

  for (const s of [-5, LEN]) {
    out.push(k.solidSvg(G.solidOf([[s, 4.2], [s + 5, 4.2]], ROLL_F, P), { tone: 'hi' }) + k.lineSvg(G.circleOf(ROLL_F, s + 5, 4.2, P), { tone: 'lo' }))
  }
  out.push(k.lineSvg(k.segment([ROLL.x0, ROLL.y, ROLL_Z + ROLL.r + 1.8], [ROLL.x1, ROLL.y, ROLL_Z + ROLL.r + 1.8], P), { tone: 'lo' }))
  for (const x of [ROLL.x0, ROLL.x1]) out.push(k.lineSvg(rib(x, P), { tone: 'lo' }))
  return out.join('')
}

/**
 * The paper guide. A chute on the lid's front lip: its back edge tucks under the
 * frame's front bar, its lip hangs past the body's bevel, and the two rails keep
 * the stock on it. Without it the strip would have to cross the lid seam and
 * drop over the rounded front edge on its way to the mouth.
 */
function paperGuide(P) {
  const out = [boxSvg(GUIDE_F, { u: -GUIDE.w / 2, v: 0, w: 0, uw: GUIDE.w, vd: GUIDE.d, wh: GUIDE.h }, P, { tone: 'mid' })]
  for (const u of [-GUIDE.w / 2, GUIDE.w / 2 - 3.4])
    out.push(boxSvg(GUIDE_F, { u, v: 0.6, w: GUIDE.h, uw: 3.4, vd: GUIDE.d - 1.4, wh: 2.4 }, P, { tone: 'hi' }))
  for (const u of [-13, 13]) {
    out.push(k.lineSvg(k.pathOf([
      k.iso(GUIDE_F.at(u, 1.2, GUIDE.h + 0.1), P), k.iso(GUIDE_F.at(u, GUIDE.d - 1.2, GUIDE.h + 0.1), P),
    ]), { tone: 'faint' }))
  }
  return out.join('')
}

/** The mouth's rectangle on the front plane — the dark recess, and the window
 *  anything seated inside it is clipped to. */
function mouthPath(P) {
  return k.pathOf([
    k.iso([SLOT.x, FRONT + 0.06, SLOT.z - SLOT.h / 2], P), k.iso([SLOT.x + SLOT.w, FRONT + 0.06, SLOT.z - SLOT.h / 2], P),
    k.iso([SLOT.x + SLOT.w, FRONT + 0.06, SLOT.z + SLOT.h / 2], P), k.iso([SLOT.x, FRONT + 0.06, SLOT.z + SLOT.h / 2], P),
  ], true)
}

/**
 * The pinch roller: two small steel wheels carried up into the mouth by a short
 * bracket on the panel's lower lip. The wheels are clipped to the slot, so the
 * half below the lip is hidden behind the panel and only the rim that is really
 * inside the mouth shows — the strip is being gripped, not decorated.
 */
function pinchRoller(P) {
  const left = PINCH.x - PINCH.gap / 2
  const right = PINCH.x + PINCH.gap / 2
  const out = [k.solidSvg(k.slabOf({
    x: left - PINCH.r - 0.4, y: FRONT - 0.5, w: right - left + PINCH.r * 2 + 0.8, d: 2.2, r: 1,
  }, PINCH.z - 3.4, 3.4, P, 4, 0.5), { tone: 'lo' })]
  // the mouth is the window: everything below the lip is cut away
  out.push(`<defs><clipPath id="lb-pinch-clip"><path d="${mouthPath(P)}"/></clipPath></defs>`)
  out.push('<g clip-path="url(#lb-pinch-clip)">')
  // the axle first, so it passes behind the two wheels
  out.push(k.solidSvg(k.slabOf({ x: left - 1.2, y: FRONT + 0.2, w: right - left + 2.4, d: 1, r: 0.5 }, PINCH.z - 0.3, 0.9, P, 4, 0.3), { tone: 'lo' }))
  for (const x of [left, right]) {
    const F = G.frameAlong([x, FRONT + 0.3, PINCH.z], [0, 1, 0])
    out.push(k.solidSvg(G.solidOf([[0, PINCH.r], [1.3, PINCH.r]], F, P), { tone: 'mid', className: 'home-lb-pinch' }))
    out.push(k.lineSvg(G.circleOf(F, 1.4, PINCH.r, P), { tone: 'lo' }))
    out.push(k.lineSvg(G.circleOf(F, 1.4, PINCH.r * 0.36, P), { tone: 'faint' }))
  }
  out.push('</g>')
  return out.join('')
}

/** The badge: a stamped plate riveted under the vent, carrying the name the
 *  machine prints its tickets in. */
function namePlate(P, caption) {
  const plan = { x: PLATE.x, y: FRONT - 0.5, w: PLATE.w, d: 1.8, r: 1 }
  const out = [
    k.solidSvg(k.slabOf(plan, PLATE.z, PLATE.h, P, 4, 0.5), { tone: 'hi' }),
    k.lineSvg(k.planOutline(k.insetPlan(plan, 1), PLATE.z + PLATE.h, P, 4), { tone: 'faint' }),
  ]
  for (const x of [PLATE.x + 2.4, PLATE.x + PLATE.w - 2.4])
    out.push(k.solidSvg(G.disc(0, 0.7, 0.95, G.frameAlong([x, FRONT + 1.3, PLATE.z + PLATE.h / 2], [0, 1, 0]), P), { tone: 'lo' }))
  out.push(k.faceTextSvg(k.sideMatrix([PLATE.x + PLATE.w / 2, FRONT + 1.4], PLATE.z + PLATE.h / 2 - 1, P, 'left'), caption, { size: 2.4, tone: 'lo', anchor: 'middle' }))
  return out.join('')
}

/**
 * The lid latch. A lever on the panel's top right, pivoted low and hooking up
 * over the seam: the last thing holding the lid down, so it goes on after the
 * badge and is the beat before the machine is closed for good.
 */
function lidLatch(P) {
  const out = [
    k.solidSvg(k.slabOf({ x: 42.5, y: FRONT - 0.5, w: 11, d: 1.6, r: 1 }, LATCH.z, LATCH.h, P, 4, 0.5), { tone: 'lo' }),
    k.solidSvg(k.slabOf({ x: 44, y: FRONT + 0.2, w: 8, d: 2.2, r: 1.2 }, LATCH.z + 1.6, 8.2, P, 4, 0.6), { tone: 'hi' }),
    k.solidSvg(k.slabOf({ x: 43.4, y: FRONT + 0.1, w: 9.2, d: 2.3, r: 0.8 }, LATCH.z + 8.8, 2.6, P, 4, 0.6), { tone: 'hi' }),
  ]
  const F = G.frameAlong([48, FRONT + 0.3, LATCH.z + 3.4], [0, 1, 0])
  out.push(k.solidSvg(G.solidOf([[0, 2.2], [1.2, 2.2]], F, P), { tone: 'mid' }))
  out.push(k.lineSvg(G.circleOf(F, 1.3, 2.2, P), { tone: 'lo' }))
  return out.join('')
}

/** The waste drawer: the blade trims the liner, and the offcuts drop through the
 *  mouth in its face. It slides home under the switch, on the panel's lower left. */
function wasteBin(P) {
  const plan = { x: -54, y: FRONT - 1, w: 17, d: BIN.d, r: 1.4 }
  const face = plan.y + plan.d
  const out = [k.solidSvg(k.slabOf(plan, BIN.z, BIN.h, P, 4, 0.8), { tone: 'mid' })]
  const mouth = k.pathOf([
    k.iso([-50, face, BIN.z + 3.4], P), k.iso([-41, face, BIN.z + 3.4], P),
    k.iso([-41, face, BIN.z + 6], P), k.iso([-50, face, BIN.z + 6], P),
  ], true)
  out.push(`<path class="home-cavity" d="${mouth}"/>`)
  out.push(k.solidSvg(k.slabOf({ x: -50.5, y: face - 0.2, w: 10, d: 1, r: 0.5 }, BIN.z + 1.2, 1.8, P, 4, 0.4), { tone: 'hi' }))
  return out.join('')
}

/** The blade bar: it seats on the panel's top edge and trims each label off the
 *  strip as it leaves the mouth. */
function cutterBar(P) {
  return k.solidSvg(k.slabOf({ x: SLOT.x - 2, y: FRONT - 1, w: SLOT.w + 4, d: 2.6, r: 1 }, CUTTER, 2.4, P, 4, 0.6), { tone: 'hi' })
    + k.lineSvg(k.segment([SLOT.x - 1, FRONT + 1.7, CUTTER - 0.2], [SLOT.x + SLOT.w + 1, FRONT + 1.7, CUTTER - 0.2], P), { tone: 'lo' })
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

  // the blade bar: it seats on the panel's top edge before the panel arrives, so
  // the cutter is a part of the machine and not of the plate
  out.push(part('lb-cutter', 5, `<g class="home-cutter">${cutterBar(P)}</g>`))

  // ---- front face -------------------------------------------------------
  // The plate carries the rest of the mechanism, so it closes on last and brings
  // the slot, the transport pair, the carriage, the rocker and the lamp with it.
  // The face's own children keep their own animations untouched.
  const face = []
  // the slot: a dark recess with the transport pair just inside it
  face.push(`<path class="home-cavity" d="${mouthPath(P)}"/>`)
  face.push(k.solidSvg(G.solidOf([[0, INNER.r], [SLOT.w - 14, INNER.r]], G.frameAlong([SLOT.x + 7, INNER.y, INNER.z], [1, 0, 0]), P), { tone: 'mid', className: 'home-platen' }))

  // the transport dial: a knurled knob seated on the face at the mouth's right,
  // turning on its own axis. The index notch is what makes the turn readable —
  // a round knob on its own looks the same at every angle.
  const [wx, wy] = k.iso(WHEEL_AT, P)
  const R = WHEEL.r
  face.push(k.lineSvg(G.circleOf(WHEEL_F, 0.2, R + 1.9, P), { tone: 'faint' }))
  face.push(`<g class="home-feed-roller" style="transform-origin:${wx.toFixed(1)}px ${wy.toFixed(1)}px"><g class="home-wheel">`)
  // the barrel, its knurled edge, and the cap that rises out of it
  face.push(k.solidSvg(G.solidOf([[0, R], [WHEEL.face, R]], WHEEL_F, P), { tone: 'mid' }))
  face.push(k.lineSvg(G.spokesOf(WHEEL_F, WHEEL.face, R * 0.86, R * 0.99, 18, P), { tone: 'lo' }))
  face.push(k.solidSvg(G.ringBand(WHEEL.face, WHEEL.face + 1.4, R * 0.36, R * 0.84, WHEEL_F, P), { tone: 'hi' }))
  face.push(k.lineSvg(G.circleOf(WHEEL_F, WHEEL.face + 1.4, R * 0.84, P), { tone: 'lo' }))
  face.push(k.solidSvg(G.disc(WHEEL.face + 1.4, WHEEL.face + 2, R * 0.34, WHEEL_F, P), { tone: 'mid' }))
  face.push(k.lineSvg(G.spokesOf(WHEEL_F, WHEEL.face + 1.5, R * 0.4, R * 0.8, 1, P, { phase: Math.PI / 2 }), { tone: 'lo' }))
  face.push('</g></g>')

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
  face.push(k.solidSvg(G.disc(1, 2.5, 2.2, led, P), { tone: 'hi', className: 'home-led-lamp' }))
  face.push(k.lineSvg(G.circleOf(led, 2.6, 2.2, P), { tone: 'faint' }))
  face.push('</g>')
  for (let i = 0; i < 5; i++) face.push(k.lineSvg(k.segment([10, FRONT + 0.3, TOP + 13 + i * 2.6], [50, FRONT + 0.3, TOP + 13 + i * 2.6], P), { tone: 'lo' }))
  face.push(k.faceTextSvg(k.sideMatrix([0, FRONT], TOP + 27, P, 'left'), caption, { size: 4.4, tone: 'lo', anchor: 'middle' }))

  out.push(part('face', 6, ...face))

  // ---- the fittings, one at a time --------------------------------------
  // Each of these bolts onto the panel that has just gone on, so they are drawn
  // after it — and they are separate assemblies, so the build reads as a machine
  // being dressed rather than a plate arriving with everything already on it.
  out.push(part('lb-guide', 7, paperGuide(P)))
  out.push(part('lb-pinch', 8, pinchRoller(P)))
  out.push(part('lb-plate', 9, namePlate(P, caption)))
  out.push(part('lb-latch', 10, lidLatch(P)))
  out.push(part('lb-bin', 11, wasteBin(P)))

  // ---- the tickets, last ------------------------------------------------
  // They wait for the case: the wrapper holds them back until the last fitting
  // is on and the machine has run its trial beat, and each ticket's own delay is
  // measured from that beat. The count is the tag count, so the stack grows with
  // the site rather than stopping at eight.
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
      // deltas run from the wall *back* to the machine: mouth first, then out
      const fly = [mx - fx, my - fy]
      const exit = [ox - fx, oy - fy]
      tickets.push(`<g class="home-ticket" style="--tilt:${seat.tilt.toFixed(2)}deg;--fly-x:${fly[0].toFixed(1)}px;--fly-y:${fly[1].toFixed(1)}px;--out-x:${exit[0].toFixed(1)}px;--out-y:${exit[1].toFixed(1)}px;--fly-delay:${BUILD + index * beat}ms">`)
      // the shadow is drawn, not filtered: one flat offset copy of the sheet, so
      // ninety of them can fly at once without a filter pass per sheet
      tickets.push(`<path class="home-ticket-shadow" d="${paper}" transform="translate(1.2 1.6)"/>`)
      tickets.push(`<path class="home-ticket-paper" fill="var(--home-paper)" d="${paper}"/>`)
      // the perforated edge down the left margin
      tickets.push(k.lineSvg(k.pathOf([k.iso(F.at(stitch, 0, -card.h * 0.38), P), k.iso(F.at(stitch, 0, card.h * 0.38), P)]), { tone: 'lo', dotted: true }))
      tickets.push(k.faceTextSvg(faceMatrix(F, [card.w * 0.06, 0, -size * 0.36], [1, 0, 0], [0, 0, -1], P), tag, { size, tone: 'hi', anchor: 'middle' }))
      tickets.push(k.lineSvg(paper, { tone: 'lo' }))
      // and the strip of tape that holds it up, over one corner
      if (seat.tape) tickets.push(tapeOn(F, card, seat.corner, seat.tapeAngle, P))
      tickets.push('</g>')
    })
  out.push(part('tickets', 12, ...tickets))

  return out.join('')
}

/**
 * The envelope the shared projection has to hold. Bounds are read before the
 * tags are known — the caller builds the projection once, for every device — so
 * the wall is reserved as a fixed box rather than at the count of the moment:
 * a locale with ninety-one tags and one with twenty-six must project at the
 * same size, or the machine changes size with the language.
 */
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
  // the wall's box, with room for the jitter, the largest sheet and the tape
  // that hangs over its edge
  const half = GRID.box.w / 2 + 7
  for (const x of [-half, half])
    for (const y of [FLOAT_Y - 3, FLOAT_Y + 3])
      for (const z of [TOP + GRID.base - 9, TOP + GRID.base + GRID.box.h + 9])
        out.push([x, y, z])
  return out
}
