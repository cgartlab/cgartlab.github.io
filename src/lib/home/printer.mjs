import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 06 — the continuous-form printer that carries "about".
 * A plain box with an inset lid; the sheet is the subject. Paper leaves the
 * slot, stands up toward the reader and folds over at the top, so the printed
 * rows face the camera. Every part is seated: the sheet rises out of the slot,
 * the knobs turn out of the front face, the feed dial rests on the lid.
 */

const BODY = { x: -88, y: -34, w: 176, d: 68, r: 7 }
const BODY_H = 44, LID_Z = TOP + BODY_H, DECK = LID_Z + 3, FRONT = BODY.y + BODY.d
const SLOT = { x: -50, y: -22, w: 100, d: 16, r: 2 }
const HALF = 48, HINGE = { y: -14, z: DECK }
const FOLD = { y: 14, z: TOP + 94 }, CURL = { y: 34, z: TOP + 88 }
const SHEET_H = FOLD.z - HINGE.z
const KNOBS = [-74, -56], KNOB_Z = TOP + 30, ROCKER_Z = TOP + 14, GRILLE_Z = TOP + 10

/** Sheet-local (u across, v up the sheet) to world. */
const sheetPoint = (u, v) => [
  -HALF + u,
  HINGE.y + (FOLD.y - HINGE.y) * (v / SHEET_H),
  HINGE.z + (FOLD.z - HINGE.z) * (v / SHEET_H),
]

/** A matrix that lays text on the sheet. */
function planeText(at, u, v) {
  const o = at(u, v)
  const a = at(u + 1, v)
  const b = at(u, v - 1)
  const f = (n) => Number(n.toFixed(4))
  return `matrix(${f(a[0] - o[0])},${f(a[1] - o[1])},${f(b[0] - o[0])},${f(b[1] - o[1])},${f(o[0])},${f(o[1])})`
}

/** A rocker switch, seated on the front face. */
function rocker(x, z, P, w = 13, h = 7) {
  const base = { x: x - w / 2 - 1, y: FRONT - 1.4, w: w + 2, d: 2.6, r: 1 }
  const cap = { x: x - w / 2, y: FRONT - 0.2, w, d: 1.4, r: 0.8 }
  return k.solidSvg(k.slabOf(base, z - h / 2 - 1, h + 2, P, 4, 0.5), { tone: 'lo' })
    + k.solidSvg(k.slabOf(cap, z - h / 2, h * 0.55, P, 4, 0.4), { tone: 'hi' })
    + k.solidSvg(k.slabOf(cap, z - h * 0.05, h * 0.55, P, 4, 0.4), { tone: 'mid' })
}

export function buildPrinter(P, options = {}) {
  const caption = options.caption || '关于'
  const note = options.note || 'CONTINUOUS FORM'
  const lines = options.lines || ['ABOUT · CGARTLAB', '连续形态打印机', 'NOTES / 2026']
  const out = []
  const at = (u, v) => k.iso(sheetPoint(u, v), P)
  const curlAt = (u, s) => k.iso([-HALF + u, FOLD.y + (CURL.y - FOLD.y) * s, FOLD.z + (CURL.z - FOLD.z) * s], P)

  // body, its seam, and the slightly inset lid
  out.push(k.solidSvg(k.slabOf(BODY, TOP, BODY_H, P, 8, 2), { tone: 'mid' }))
  out.push(k.lineSvg(k.sideSeam(BODY, LID_Z, P, 8), { tone: 'faint' }))
  out.push(k.solidSvg(k.slabOf(k.insetPlan(BODY, 5), LID_Z, DECK - LID_Z, P, 8, 1), { tone: 'hi' }))

  // paper exit: the mouth and its throat, and the feed dial behind the sheet
  out.push(k.lineSvg(k.planOutline(SLOT, DECK, P, 4), { tone: 'lo' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan(SLOT, 2.5), DECK, P, 4), { tone: 'faint' }))
  out.push(k.solidSvg(k.cylinder(-68, 2, 6, DECK, 2.4, P, 24), { tone: 'mid' }))
  out.push(k.lineSvg(k.ring(-68, 2, 3.4, DECK + 2.4, P, 20), { tone: 'faint' }))
  out.push(k.lineSvg(k.segment([-68, 2, DECK + 2.5], [-68, 7.4, DECK + 2.5], P), { tone: 'mid' }))

  // the sheet: a flat quad rising out of the slot toward the reader
  const sheet = k.pathOf([at(0, 0), at(2 * HALF, 0), at(2 * HALF, SHEET_H), at(0, SHEET_H)], true)
  out.push(`<path class="home-paper" d="${sheet}"/>`)
  out.push(k.lineSvg(sheet, { tone: 'hi' }))

  // tractor-feed strips down both edges, holes evenly spaced
  const holes = []
  for (const u of [3, 11, 85, 93]) out.push(k.lineSvg(k.pathOf([at(u, 2), at(u, SHEET_H)]), { tone: 'lo' }))
  for (const u of [7, 89]) for (let v = 5; v < SHEET_H; v += 6) holes.push(at(u, v))
  out.push(k.dotsSvg(holes, { size: 0.95, tone: 'lo' }))

  // the printed rows, laid on the sheet
  lines.slice(0, 3).forEach((line, i) => {
    out.push(k.faceTextSvg(planeText(at, 16, 24 - i * 9), line, { size: 6, tone: 'hi' }))
  })

  // the fold: the sheet turns over at the top and hangs down over the front
  const curl = k.pathOf([curlAt(0, 0), curlAt(2 * HALF, 0), curlAt(2 * HALF, 1), curlAt(0, 1)], true)
  out.push(`<path class="home-paper" d="${curl}"/>`)
  out.push(k.lineSvg(k.pathOf([curlAt(0, 1), curlAt(2 * HALF, 1), curlAt(2 * HALF, 0)]), { tone: 'mid' }))
  out.push(k.lineSvg(k.pathOf([curlAt(0, 0), curlAt(0, 1)]), { tone: 'mid' }))
  out.push(k.lineSvg(k.pathOf([curlAt(0, 0), curlAt(2 * HALF, 0)]), { tone: 'faint' }))
  for (const u of [3, 11, 85, 93]) out.push(k.lineSvg(k.pathOf([curlAt(u, 0), curlAt(u, 1)]), { tone: 'lo' }))

  // front face: two knobs and a rocker
  for (const x of KNOBS) {
    const F = G.frameAlong([x, FRONT, KNOB_Z], [0, 1, 0])
    out.push(k.solidSvg(G.disc(0, 5, 6.5, F, P), { tone: 'mid' }))
    out.push(k.lineSvg(G.circleOf(F, 5.1, 4.2, P), { tone: 'faint' }))
    out.push(k.lineSvg(k.segment([x, FRONT + 5.2, KNOB_Z], [x, FRONT + 5.2, KNOB_Z + 4.6], P), { tone: 'hi' }))
  }
  out.push(rocker(-65, ROCKER_Z, P))

  // ventilation grille
  for (let i = 0; i < 8; i++) {
    const z = GRILLE_Z + i * 2.6
    out.push(k.lineSvg(k.segment([40, FRONT + 0.3, z], [82, FRONT + 0.3, z], P), { tone: 'lo' }))
  }

  // engraved caption
  out.push(k.faceTextSvg(k.sideMatrix([-4, FRONT], TOP + 31, P, 'left'), caption, { size: 7.5, tone: 'hi', anchor: 'middle' }))
  out.push(k.faceTextSvg(k.sideMatrix([-4, FRONT], TOP + 23, P, 'left'), note, { size: 3.2, tone: 'faint', anchor: 'middle' }))

  return out.join('')
}

export function printerBounds() {
  return [
    ...k.boxCorners(BODY, TOP, DECK),
    [-HALF, FOLD.y, FOLD.z], [HALF, FOLD.y, FOLD.z], [-HALF, CURL.y, CURL.z], [HALF, CURL.y, CURL.z],
    [KNOBS[0], FRONT + 5.5, KNOB_Z],
    [82, FRONT, GRILLE_Z],
  ]
}
