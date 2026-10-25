import * as k from '../anatomy/iso-kit.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 03 — the newsstand that carries the column.
 *
 * A three-shelf rack with six issues. Each issue is a leaning sheet with its
 * number and a cover block; the cover is grey until the pointer is on it.
 * Every sheet is a real link to its issue.
 */

const RACK = { x: -88, y: -30, w: 176, d: 60 }
const SIDE = 7
const BACK_Y = RACK.y
const SHELF_Z = [TOP + 9, TOP + 43, TOP + 77]
const PAPER_W = 72
const PAPER_H = 30
const LEAN_FRONT = 14
const LEAN_BACK = -10

/** Local (u along the sheet, v up the sheet) to world. */
function sheetPoint(x0, z0, u, v) {
  return [
    x0 + u,
    LEAN_FRONT + (LEAN_BACK - LEAN_FRONT) * (v / PAPER_H),
    z0 + v,
  ]
}

export function buildNewsrack(P, options = {}) {
  const issues = options.issues || []
  const out = []

  // frame
  out.push(k.solidSvg(k.slabOf(RACK, TOP, 6, P, 6, 1), { tone: 'mid' }))
  out.push(k.solidSvg(k.slabOf({ x: RACK.x, y: BACK_Y, w: RACK.w, d: 5, r: 1 }, TOP + 6, 96, P, 4, 0.8), { tone: 'mid' }))
  for (const side of [-1, 1]) {
    out.push(k.solidSvg(k.slabOf({ x: side * (RACK.w / 2 - SIDE), y: RACK.y, w: SIDE, d: RACK.d, r: 1 }, TOP + 6, 96, P, 4, 0.8), { tone: 'mid' }))
  }
  // shelves
  for (const z of SHELF_Z) {
    out.push(k.solidSvg(k.slabOf({ x: RACK.x + SIDE, y: RACK.y + 4, w: RACK.w - SIDE * 2, d: RACK.d - 8, r: 1 }, z, 3, P, 4, 0.6), { tone: 'hi' }))
    out.push(k.lineSvg(k.planOutline(k.insetPlan({ x: RACK.x + SIDE, y: RACK.y + 4, w: RACK.w - SIDE * 2, d: RACK.d - 8, r: 1 }, 3), z + 3, P, 4), { tone: 'faint' }))
  }

  // six issues, two per shelf
  const slots = []
  SHELF_Z.forEach((z, shelf) => {
    for (const side of [-1, 1])
      slots.push({ x: side * 44, z: z + 3, shelf })
  })

  slots.forEach((slot, index) => {
    const issue = issues[index] || {}
    const x0 = slot.x - PAPER_W / 2
    const z0 = slot.z
    const at = (u, v) => k.iso(sheetPoint(x0, z0, u, v), P)

    // the sheet
    const sheet = k.pathOf([
      at(0, 0), at(PAPER_W, 0), at(PAPER_W, PAPER_H), at(0, PAPER_H),
    ], true)

    const href = issue.href || '#'
    const label = issue.label || ''
    out.push(`<a class="home-issue" data-index="${index}" href="${href}" aria-label="${label}"><title>${label}</title>`)
    out.push(`<path class="home-issue-sheet" d="${sheet}"/>`)
    out.push(k.lineSvg(sheet, { tone: 'lo' }))

    // masthead band
    const mast = k.pathOf([at(0, PAPER_H - 7), at(PAPER_W, PAPER_H - 7), at(PAPER_W, PAPER_H), at(0, PAPER_H)], true)
    out.push(`<path class="home-issue-mast" d="${mast}"/>`)

    // cover block
    const cover = k.pathOf([at(4, 7), at(PAPER_W - 4, 7), at(PAPER_W - 4, PAPER_H - 9), at(4, PAPER_H - 9)], true)
    out.push(`<path class="home-issue-cover" d="${cover}"/>`)
    out.push(k.lineSvg(cover, { tone: 'faint' }))

    // three headline rules under the cover
    for (let i = 0; i < 3; i++) {
      const v = 4.6 - i * 1.5
      out.push(k.lineSvg(k.pathOf([at(6, v), at(PAPER_W - 14 - i * 8, v)], false), { tone: 'faint' }))
    }

    out.push('</a>')

    // the number sits on the masthead, drawn after the sheet
    out.push('<g class="home-issue-number">')
    out.push(k.faceTextSvg(
      planeText(at, 4.5, PAPER_H - 2.1, P),
      issue.number || '',
      { size: 4.2, tone: 'hi' },
    ))
    out.push('</g>')
  })

  return out.join('')
}

/** A matrix that lays text on the leaning sheet. */
function planeText(at, u, v, P) {
  const o = at(u, v)
  const a = at(u + 1, v)
  const b = at(u, v - 1)
  const f = (n) => Number(n.toFixed(4))
  return `matrix(${f(a[0] - o[0])},${f(a[1] - o[1])},${f(b[0] - o[0])},${f(b[1] - o[1])},${f(o[0])},${f(o[1])})`
}

export function newsrackBounds() {
  return [
    ...k.boxCorners(RACK, TOP, TOP + 88),
    [-PAPER_W / 2, LEAN_FRONT, TOP + 77 + PAPER_H],
    [PAPER_W / 2, LEAN_FRONT, TOP + 77 + PAPER_H],
  ]
}
