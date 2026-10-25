import * as k from '../anatomy/iso-kit.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 03 — the newsstand that carries the column.
 *
 * Three shelves, six issues. Each issue is a leaning sheet with its masthead
 * number, a real cover photograph and a few headline rules. The cover is grey
 * until the pointer is on it; the whole sheet lifts a little as it colours.
 */

const RACK = { x: -88, y: -30, w: 176, d: 60 }
const SIDE = 7
const BACK_Y = RACK.y
const SHELF_Z = [TOP + 9, TOP + 43, TOP + 77]
const PAPER_W = 72
const PAPER_H = 30
const LEAN_FRONT = 14
const LEAN_BACK = -10

const COVER = { u0: 4, u1: PAPER_W - 4, v0: 8, v1: 22 }
const MAST = { v0: 23, v1: PAPER_H }

function sheetPoint(x0, z0, u, v) {
  return [
    x0 + u,
    LEAN_FRONT + (LEAN_BACK - LEAN_FRONT) * (v / PAPER_H),
    z0 + v,
  ]
}

/** A matrix that lays a w×h rectangle on the leaning sheet, top-left at (u,v). */
function sheetMatrix(at, u, v, P) {
  const o = at(u, v)
  const a = at(u + 1, v)
  const b = at(u, v - 1)
  const f = (n) => Number(n.toFixed(4))
  return `matrix(${f(a[0] - o[0])},${f(a[1] - o[1])},${f(b[0] - o[0])},${f(b[1] - o[1])},${f(o[0])},${f(o[1])})`
}

export function buildNewsrack(P, options = {}) {
  const issues = options.issues || []
  const out = []

  // frame
  out.push(k.solidSvg(k.slabOf(RACK, TOP, 6, P, 6, 1), { tone: 'mid' }))
  out.push(k.solidSvg(k.slabOf({ x: RACK.x, y: BACK_Y, w: RACK.w, d: 5, r: 1 }, TOP + 6, 96, P, 4, 0.8), { tone: 'mid' }))
  for (const side of [-1, 1]) {
    out.push(k.solidSvg(k.slabOf({ x: side * (RACK.w / 2 - SIDE), y: RACK.y, w: SIDE, d: RACK.d, r: 1 }, TOP + 6, 96, P, 4, 0.8), { tone: 'mid' }))
    // knurled cap on each post
    out.push(k.solidSvg(k.cylinder(side * (RACK.w / 2 - SIDE / 2), BACK_Y + RACK.d / 2, 4.6, TOP + 102, 3, P, 20), { tone: 'mid' }))
    out.push(k.lineSvg(k.knurl(side * (RACK.w / 2 - SIDE / 2), BACK_Y + RACK.d / 2, 4.6, TOP + 102, TOP + 105, 18, P, 0.3), { tone: 'faint' }))
  }

  // shelves, each with a front lip and a label plate
  SHELF_Z.forEach((z, shelf) => {
    const plan = { x: RACK.x + SIDE, y: RACK.y + 4, w: RACK.w - SIDE * 2, d: RACK.d - 8, r: 1 }
    out.push(k.solidSvg(k.slabOf(plan, z, 3, P, 4, 0.6), { tone: 'hi' }))
    out.push(k.solidSvg(k.slabOf({ x: plan.x, y: plan.y + plan.d - 4, w: plan.w, d: 4, r: 1 }, z + 3, 2.4, P, 3, 0.4), { tone: 'mid' }))
    out.push(k.faceTextSvg(
      k.sideMatrix([0, plan.y + plan.d], z + 4, P, 'left'),
      `0${shelf + 1}`,
      { size: 2.6, tone: 'faint', anchor: 'middle' },
    ))
    // screws at the lip ends
    for (const sx of [plan.x + 6, plan.x + plan.w - 6])
      out.push(k.dotsSvg([k.iso([sx, plan.y + plan.d - 2, z + 5.4], P)], { size: 0.6, tone: 'mid' }))
  })

  // six issues, two per shelf
  const slots = []
  SHELF_Z.forEach((z) => {
    for (const side of [-1, 1])
      slots.push({ x: side * 44, z: z + 3 })
  })

  slots.forEach((slot, index) => {
    const issue = issues[index] || {}
    const x0 = slot.x - PAPER_W / 2
    const z0 = slot.z
    const at = (u, v) => k.iso(sheetPoint(x0, z0, u, v), P)

    const sheet = k.pathOf([at(0, 0), at(PAPER_W, 0), at(PAPER_W, PAPER_H), at(0, PAPER_H)], true)
    const href = issue.href || '#'
    const label = issue.label || ''

    out.push(`<a class="home-issue" data-index="${index}" href="${href}" aria-label="${label}"><title>${label}</title>`)
    out.push(`<path class="home-issue-sheet" d="${sheet}"/>`)
    out.push(k.lineSvg(sheet, { tone: 'lo' }))

    // cover photograph
    const cw = COVER.u1 - COVER.u0
    const ch = COVER.v1 - COVER.v0
    const coverPath = k.pathOf([
      at(COVER.u0, COVER.v0), at(COVER.u1, COVER.v0), at(COVER.u1, COVER.v1), at(COVER.u0, COVER.v1),
    ], true)
    if (issue.cover) {
      out.push(`<image class="home-issue-photo" href="${issue.cover}" width="${cw}" height="${ch}" preserveAspectRatio="xMidYMid slice" transform="${sheetMatrix(at, COVER.u0, COVER.v1, P)}"/>`)
    }
    out.push(`<path class="home-issue-cover" d="${coverPath}"/>`)
    out.push(k.lineSvg(coverPath, { tone: 'faint' }))

    // masthead band and the number on it
    const mast = k.pathOf([at(0, MAST.v0), at(PAPER_W, MAST.v0), at(PAPER_W, MAST.v1), at(0, MAST.v1)], true)
    out.push(`<path class="home-issue-mast" d="${mast}"/>`)
    out.push('<g class="home-issue-number">')
    out.push(k.faceTextSvg(sheetMatrix(at, 4.5, MAST.v0 + 2.2, P), issue.number || '', { size: 4.2, tone: 'hi' }))
    out.push('</g>')

    // two headline rules under the cover
    for (let i = 0; i < 2; i++) {
      const v = 5.4 - i * 1.7
      out.push(k.lineSvg(k.pathOf([at(4, v), at(PAPER_W - 12 - i * 10, v)], false), { tone: 'faint' }))
    }

    // two clips holding the sheet
    for (const cx of [10, PAPER_W - 10]) {
      out.push(k.lineSvg(k.pathOf([at(cx - 3, PAPER_H - 1), at(cx + 3, PAPER_H - 1)], false), { tone: 'mid' }))
    }

    out.push('</a>')
  })

  return out.join('')
}

export function newsrackBounds() {
  return [
    ...k.boxCorners(RACK, TOP, TOP + 106),
    [-PAPER_W / 2, LEAN_FRONT, TOP + 77 + PAPER_H],
    [PAPER_W / 2, LEAN_FRONT, TOP + 77 + PAPER_H],
  ]
}
