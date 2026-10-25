import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 05 — the punched-card sorter that carries "标签".
 * The deck climbs in three treads: the five-pocket bed on the front one, the
 * hopper magazine on the back one, the needle gantry bridged over the bed. The
 * card stack is the subject, so it is the only lit part; one card is caught in
 * the air in the gap between the magazine and the bed.
 * Every part is seated — treads on the plinth, bed on the front tread, ribs on
 * the bed, posts on the end ribs, bar on the posts, hopper walls on the back
 * tread, crank on the right cheek — and painted far to near.
 */

const BODY = { x: -88, y: -34, w: 176, d: 68, r: 7 }
const BODY_TOP = TOP + 26, FRONT = BODY.y + BODY.d

const TREADS = [
  { y: -34, d: 20, top: TOP + 50 },
  { y: -16, d: 24, top: TOP + 40 },
  { y: 6, d: 28, top: TOP + 30 },
]
const DECK = TREADS[2].top

// the bed is a raised plate with six ribs left standing between five slots
const BED = { x: -40, y: 8, w: 116, d: 26, r: 2 }
const SLOTS = [-26, -4, 18, 40, 62]
const RIBS = [[-40, -34], [-18, -12], [4, 10], [26, 32], [48, 54], [70, 76]]
const PLINTH = 3.4, BED_TOP = DECK + 5.5

const BAR = { x: -40, y: 12, w: 116, d: 8, r: 1.2 }
const BAR_Z = TOP + 52, NEEDLE_Y = 16, NEEDLE_Z = BED_TOP + 3, POSTS = [-40, 70]

const HOPPER = { x: -84, y: -32, w: 32, d: 18, r: 2 }
const CARD = { x: -80, y: -28, w: 24, d: 12, r: 0.5 }
const HOPPER_Z = TOP + 50, WALL_Z = TOP + 76, WALL = 4
const CARD_H = 1.2, CARD_PITCH = 2.4

const CRANK = { x: BODY.x + BODY.w, y: 12, z: TOP + 15, rim: 4.8, boss: 5.4, disc: 8.5 }
const ARM = [0, 0.6, 0.8], GRIP_Y = 9.6, GRIP_Z = 12.8

export function buildSorter(P, options = {}) {
  const caption = options.caption || '标签'
  const note = options.note || 'PUNCHED CARD'
  const out = []

  // plinth
  out.push(k.solidSvg(k.slabOf(BODY, TOP, BODY_TOP - TOP, P, 8, 2), { tone: 'mid' }))

  // the slope: three treads, each seated on the plinth, back to front
  for (const tread of TREADS) {
    const plan = { x: -84, y: tread.y, w: 168, d: tread.d, r: 3 }
    out.push(k.solidSvg(k.slabOf(plan, BODY_TOP, tread.top - BODY_TOP, P, 5, 1), { tone: 'mid' }))
    out.push(k.lineSvg(k.planOutline(plan, tread.top, P, 5), { tone: 'faint' }))
  }

  // hopper: back wall, then the stack, then the cheeks and the lip
  out.push(k.solidSvg(k.slabOf({ x: HOPPER.x, y: HOPPER.y, w: HOPPER.w, d: WALL, r: 1 }, HOPPER_Z, WALL_Z - HOPPER_Z, P, 3, 0.6), { tone: 'mid' }))
  for (let i = 0; i < 8; i++) out.push(k.solidSvg(k.slabOf(CARD, HOPPER_Z + 0.1 + i * CARD_PITCH, CARD_H, P, 2), { tone: 'hi' }))
  for (const side of [-1, 1]) {
    const x = side < 0 ? HOPPER.x : HOPPER.x + HOPPER.w - WALL
    out.push(k.solidSvg(k.slabOf({ x, y: HOPPER.y, w: WALL, d: HOPPER.d, r: 1 }, HOPPER_Z, WALL_Z - HOPPER_Z, P, 3, 0.6), { tone: 'mid' }))
  }
  out.push(k.solidSvg(k.slabOf({ x: HOPPER.x, y: HOPPER.y + HOPPER.d - WALL, w: HOPPER.w, d: WALL, r: 1 }, HOPPER_Z, 6, P, 3, 0.5), { tone: 'lo' }))

  // the bed plinth, its six ribs, and a pocket outline on each slot floor
  out.push(k.solidSvg(k.slabOf(BED, DECK, PLINTH, P, 6, 0.6), { tone: 'mid' }))
  for (const [x0, x1] of RIBS) {
    out.push(k.solidSvg(k.slabOf({ x: x0, y: BED.y, w: x1 - x0, d: BED.d, r: 1 }, DECK + PLINTH, BED_TOP - DECK - PLINTH, P, 3, 0.4), { tone: 'mid' }))
  }
  for (const cx of SLOTS) out.push(k.lineSvg(k.planOutline({ x: cx - 6, y: BED.y + 3, w: 12, d: BED.d - 6, r: 1 }, DECK + PLINTH, P, 4), { tone: 'faint' }))

  // one card caught in the air, in the gap between the magazine and the bed
  const onCard = (u, t) => k.iso([-56 + u, -2 - 9 * t, TOP + 42 + 11 * t], P)
  const sheet = k.pathOf([onCard(0, 0), onCard(15, 0), onCard(15, 1), onCard(0, 1)], true)
  out.push(`<path class="home-paper" d="${sheet}"/>`)
  out.push(k.lineSvg(sheet, { tone: 'hi' }))
  const holes = []
  for (const t of [0.52, 0.68]) for (let i = 0; i < 6; i++) holes.push(onCard(2.2 + i * 2, t))
  out.push(k.dotsSvg(holes, { size: 0.45, tone: 'lo' }))

  // needle gantry: posts on the end ribs, rods, collars, then the bar over them
  for (const x of POSTS) out.push(k.solidSvg(k.slabOf({ x, y: BAR.y, w: 6, d: BAR.d, r: 1 }, BED_TOP, BAR_Z - BED_TOP, P, 3, 0.6), { tone: 'mid' }))
  for (const cx of SLOTS) {
    out.push(k.solidSvg(k.cylinder(cx, NEEDLE_Y, 1.3, NEEDLE_Z, BAR_Z - NEEDLE_Z, P, 10), { tone: 'lo' }))
    out.push(k.solidSvg(k.cylinder(cx, NEEDLE_Y, 2.9, TOP + 44, 3.2, P, 14), { tone: 'mid' }))
    for (const a of [0.6, 1.57, 2.54]) {
      const nx = cx + 2.9 * Math.cos(a), ny = NEEDLE_Y + 2.9 * Math.sin(a)
      out.push(k.lineSvg(k.segment([nx, ny, TOP + 44.5], [nx, ny, TOP + 46.7], P), { tone: 'faint' }))
    }
  }
  out.push(k.solidSvg(k.slabOf(BAR, BAR_Z, 3, P, 4, 0.6), { tone: 'mid' }))

  // crank on the right cheek, turning about +x: rim, boss, arm, ball grip
  const hub = G.frameAlong([CRANK.x, CRANK.y, CRANK.z], [1, 0, 0])
  out.push(k.solidSvg(G.disc(0, CRANK.rim, CRANK.disc, hub, P, { bevel: 1.2 }), { tone: 'mid' }))
  out.push(k.solidSvg(G.disc(0, CRANK.boss, 4, hub, P, { bevel: 0.8 }), { tone: 'hi' }))
  out.push(k.solidSvg(G.disc(0, 16, 1.8, G.frameAlong([CRANK.x + CRANK.boss, CRANK.y, CRANK.z], ARM), P), { tone: 'mid' }))
  const grip = G.frameAlong([CRANK.x + CRANK.boss, CRANK.y + GRIP_Y, CRANK.z + GRIP_Z], [1, 0, 0])
  out.push(k.solidSvg(G.disc(0, 5.4, 3.4, grip, P, { bevel: 1.5 }), { tone: 'hi' }))
  out.push(k.lineSvg(G.circleOf(grip, 5.4, 1.9, P), { tone: 'faint' }))

  // front face: the pocket index engraved under each slot, then the name
  SLOTS.forEach((cx, i) => {
    out.push(k.lineSvg(k.segment([cx, FRONT + 0.3, TOP + 22], [cx, FRONT + 0.3, TOP + 25.5], P), { tone: 'faint' }))
    out.push(k.faceTextSvg(k.sideMatrix([cx, FRONT], TOP + 19, P, 'left'), String(i + 1), { size: 4.6, tone: 'lo', anchor: 'middle' }))
  })
  out.push(k.faceTextSvg(k.sideMatrix([0, FRONT], TOP + 9.5, P, 'left'), caption, { size: 6, tone: 'mid', anchor: 'middle' }))
  out.push(k.faceTextSvg(k.sideMatrix([0, FRONT], TOP + 4.5, P, 'left'), note, { size: 2.8, tone: 'faint', anchor: 'middle' }))

  return out.join('')
}

export function sorterBounds() {
  return [
    ...k.boxCorners(BODY, TOP, TOP + 50),
    ...k.boxCorners(HOPPER, HOPPER_Z, WALL_Z),
    [BAR.x, BAR.y, BAR_Z + 3], [BAR.x + BAR.w, BAR.y, BAR_Z + 3],
    [CRANK.x + CRANK.boss + 5.4, CRANK.y + GRIP_Y + 3.4, CRANK.z + GRIP_Z + 3.4],
    [-56, -2, TOP + 53], [-41, -11, TOP + 53],
  ]
}
