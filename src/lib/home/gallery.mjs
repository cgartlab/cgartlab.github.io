import * as k from '../anatomy/iso-kit.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 02 — the gallery room that carries "作品".
 *
 * A cutaway exhibition box: floor slab, a back wall pierced by a doorway on the
 * left, two short side returns, the front left open. Three framed works hang at
 * different heights, each a heavy frame around a recessed panel of flat bars; a
 * track bar under the soffit drops two heads on them, and a bench sits mid-floor.
 *
 * Every part is seated — frames on the wall, bar on the soffit, heads on their
 * stems, bench on the mat, mat and threshold on the floor — painted far to near.
 */

const FLOOR = { x: -100, y: -38, w: 200, d: 76, r: 1.2 }
const FZ = TOP + 4
const WALL_Y = -33
const WALL_TOP = TOP + 94
const DOOR = { x: -90, w: 28, top: TOP + 58 }
const SOFFIT = { x: -100, y: WALL_Y, w: 200, d: 10, r: 0.6 }
const SOFFIT_Z = TOP + 88
const BAR = { x: -70, y: -33.4, w: 140, d: 6.2, r: 0.6 }
const BAR_Z = TOP + 84
const SIDE = { w: 5, d: 44, h: 58 }
const T = 3.4, FD = 5
const MAT = { x: -42, y: -16, w: 84, d: 32, r: 2 }
const BENCH = { x: -25, y: -7.5, w: 50, d: 15, r: 1.5 }
const BENCH_TOP = FZ + 16.4
const LAMPS = [-26, 20]
const FRAMES = [
  { cx: -26, cz: TOP + 52, w: 42, h: 32, marks: [[4, 4, 10, 17], [18, 4, 13, 6], [18, 13, 13, 8]] },
  { cx: 20, cz: TOP + 60, w: 26, h: 18, marks: [[3, 2, 13, 4], [3, 2, 4, 7], [13, 7, 4, 4]] },
  { cx: 58, cz: TOP + 42, w: 30, h: 26, marks: [[4, 4, 9, 11], [16, 4, 5, 14]] },
]

/** A solid block with a soft bevel. */
const block = (plan, z, h, P, tone = 'mid') => k.solidSvg(k.slabOf(plan, z, h, P, 4, 0.4), { tone })
/** A flat plate for the low-relief compositions. */
const plate = (plan, z, h, P, tone = 'hi') => k.solidSvg(k.slabOf(plan, z, h, P, 3, 0), { tone })
/** An opening: filled with the page ground, so it reads as a hole and not a panel. */
const gap = (plan, z, h, P, tone = 'lo') => k.solidSvg(k.slabOf(plan, z, h, P, 3, 0), { tone, flat: true })

/** One work: recessed panel first, its bars on top, then the frame that laps it. */
function hang(f, index, P) {
  const out = []
  const x0 = f.cx - f.w / 2
  const z0 = f.cz - f.h / 2
  const pz = z0 + T
  const panel = { x: x0 + T, y: WALL_Y, w: f.w - T * 2, d: 1.8, r: 0.6 }

  out.push(block(panel, pz, f.h - T * 2, P, 'lo'))
  for (const [dx, dz, w, h] of f.marks)
    out.push(plate({ x: panel.x + dx, y: WALL_Y + panel.d, w, d: 0.8, r: 0.3 }, pz + dz, h, P))

  // bottom rail, top rail, then the two stiles between them
  out.push(block({ x: x0, y: WALL_Y, w: f.w, d: FD, r: 0.6 }, z0, T, P, 'hi'))
  out.push(block({ x: x0, y: WALL_Y, w: f.w, d: FD, r: 0.6 }, z0 + f.h - T, T, P, 'hi'))
  for (const x of [x0, x0 + f.w - T])
    out.push(block({ x, y: WALL_Y, w: T, d: FD, r: 0.6 }, pz, f.h - T * 2, P, 'hi'))

  out.push(k.faceTextSvg(k.sideMatrix([x0, WALL_Y], z0 - 5.4, P, 'left'), `0${index + 1}`, { size: 3.4, tone: 'faint' }))
  return out
}

export function buildGallery(P, options = {}) {
  const caption = options.caption || '作品'
  const note = options.note || 'CUTAWAY ROOM'
  const out = []

  // the floor, its inset border and one joint; the mat rests on it
  out.push(block(FLOOR, TOP, 4, P))
  out.push(k.lineSvg(k.planOutline(k.insetPlan(FLOOR, 3), FZ, P, 3), { tone: 'faint' }))
  out.push(k.lineSvg(k.segment([-96, 22, FZ], [96, 22, FZ], P), { tone: 'faint' }))
  out.push(block(MAT, FZ, 0.8, P, 'lo'))

  // doorway: the recess deep in the wall, a threshold stepping into the room,
  // then the two piers and the lintel that span the opening
  const rim = (x0, x1, z0, z1, y) => k.pathOf([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]].map(pt => k.iso(pt, P)), true)
  out.push(gap({ x: DOOR.x + 0.6, y: -38, w: DOOR.w - 1.2, d: 2, r: 0.6 }, FZ, DOOR.top - FZ - 0.8, P))
  out.push(k.lineSvg(rim(DOOR.x + 3.6, DOOR.x + DOOR.w - 3.6, FZ + 3.4, DOOR.top - 4.4, -35.9), { tone: 'faint' }))
  out.push(block({ x: DOOR.x, y: -36, w: DOOR.w, d: 8, r: 0.6 }, FZ, 2, P, 'lo'))
  out.push(block({ x: -100, y: -38, w: 10, d: 5, r: 0.6 }, FZ, WALL_TOP - FZ, P))
  out.push(block({ x: DOOR.x + DOOR.w, y: -38, w: 100 - DOOR.x - DOOR.w, d: 5, r: 0.6 }, FZ, WALL_TOP - FZ, P))
  out.push(block({ x: DOOR.x, y: -38, w: DOOR.w, d: 5, r: 0.6 }, DOOR.top, WALL_TOP - DOOR.top, P))
  out.push(k.lineSvg(k.segment([DOOR.x, -36, DOOR.top - 0.8], [DOOR.x + DOOR.w, -36, DOOR.top - 0.8], P), { tone: 'faint' }))

  // the works, hung on the wall face
  FRAMES.forEach((f, i) => out.push(...hang(f, i, P)))

  // dropped soffit, the track bar under it, and two heads aimed at the frames
  out.push(block(SOFFIT, SOFFIT_Z, WALL_TOP - SOFFIT_Z, P))
  out.push(block(BAR, BAR_Z, SOFFIT_Z - BAR_Z, P))
  for (const x of LAMPS) {
    out.push(k.solidSvg(k.cylinder(x, -27.6, 1.5, TOP + 79, 5, P, 12), { tone: 'mid' }))
    out.push(k.solidSvg(k.cylinder(x, -27.6, 5, TOP + 76, 3, P, 20), { tone: 'hi' }))
    out.push(k.solidSvg(k.cylinder(x, -27.6, 3.6, TOP + 73.6, 2.4, P, 18), { tone: 'lo' }))
    out.push(k.lineSvg(k.planOutline({ x: x - 2.6, y: -30.2, w: 5.2, d: 5.2, r: 2.6 }, TOP + 73.6, P, 12), { tone: 'faint' }))
  }

  // the two side returns, cut short so the front stays open
  for (const x of [-100, 100 - SIDE.w])
    out.push(block({ x, y: WALL_Y, w: SIDE.w, d: SIDE.d, r: 0.6 }, FZ, SIDE.h, P))

  // the bench, standing on the mat
  for (const x of [BENCH.x + 4, BENCH.x + BENCH.w - 8])
    out.push(block({ x, y: -5, w: 4, d: 10, r: 0.6 }, FZ + 0.8, 12, P))
  out.push(block(BENCH, FZ + 12.8, 3.6, P))
  out.push(k.lineSvg(k.segment([BENCH.x + 3, -6, BENCH_TOP], [BENCH.x + BENCH.w - 3, -6, BENCH_TOP], P), { tone: 'faint' }))

  // nameplate on the soffit, index on the front lip of the floor
  out.push(k.faceTextSvg(k.sideMatrix([-2, SOFFIT.y + SOFFIT.d], TOP + 89.4, P, 'left'), caption, { size: 3.6, tone: 'mid', anchor: 'middle' }))
  out.push(k.faceTextSvg(k.sideMatrix([-96, FLOOR.y + FLOOR.d], TOP + 1.2, P, 'left'), note, { size: 2.4, tone: 'faint' }))

  return out.join('')
}

export function galleryBounds() {
  return [
    ...k.boxCorners(FLOOR, TOP, FZ),
    ...k.boxCorners({ x: -100, y: -38, w: 200, d: 5 }, FZ, WALL_TOP),
    ...k.boxCorners(SOFFIT, SOFFIT_Z, WALL_TOP),
    ...k.boxCorners({ x: -100, y: WALL_Y, w: 5, d: SIDE.d }, FZ, FZ + SIDE.h),
    ...k.boxCorners({ x: 95, y: WALL_Y, w: 5, d: SIDE.d }, FZ, FZ + SIDE.h),
    ...k.boxCorners(BENCH, FZ, BENCH_TOP),
    [-70, BAR.y, BAR_Z], [70, BAR.y + BAR.d, BAR_Z],
    [-26, -22.6, TOP + 73.6], [20, -22.6, TOP + 73.6],
  ]
}
