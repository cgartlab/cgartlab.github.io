import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 01 — the typewriter.
 *
 * A key drives a hammer into the ribbon, the platen turns, and the sheet keeps
 * what was struck. The paper is the only lit part, and it carries a real
 * excerpt: the client types it one character at a time and the sheet feeds up
 * out of the roller a line at a time, so the text emerges from the machine.
 */

const BASE_Z = TOP
const BASE = { x: -85, y: -43, w: 170, d: 86, r: 10 }
const DECK_TOP = BASE_Z + 8

const PLATEN = { y: -24, z: 131, r: 10, half: 64 }
const PAPER_BOTTOM = { y: -30, z: 141 }
const PAPER_TOP = { y: -52, z: 188 }
const PAPER_HALF = 64

const SHEET_W = PAPER_HALF * 2
const SHEET_H = Math.hypot(PAPER_TOP.y - PAPER_BOTTOM.y, PAPER_TOP.z - PAPER_BOTTOM.z)
const TEXT = { x: 9, top: 6, leading: 7.8, size: 5.7 }

// rows run back to front; each nearer row sits on a lower step
const ROWS = [
  { y: 4, d: 8, lift: 9 },
  { y: 13, d: 8, lift: 7 },
  { y: 22, d: 8, lift: 5 },
  { y: 31, d: 8, lift: 3 },
]

// a standard staggered typewriter keyboard: numbers, QWERTY, home, bottom
const KEY_ROWS = [
  { chars: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], x0: -67, n: 10 },
  { chars: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'], x0: -60.3, n: 10 },
  { chars: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], x0: -53.6, n: 9 },
  { chars: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'], x0: -46.9, n: 9 },
]
const PITCH = 13.4

export const TYPEWRITER_TOP = PAPER_TOP.z

/** Affine matrix for text laid on an arbitrary 3D plane. */
function planeMatrix(origin, u, v, P) {
  const o = k.iso(origin, P)
  const a = k.iso([origin[0] + u[0], origin[1] + u[1], origin[2] + u[2]], P)
  const b = k.iso([origin[0] + v[0], origin[1] + v[1], origin[2] + v[2]], P)
  const f = (n) => Number(n.toFixed(4))
  return `matrix(${f(a[0] - o[0])},${f(a[1] - o[1])},${f(b[0] - o[0])},${f(b[1] - o[1])},${f(o[0])},${f(o[1])})`
}

function escapeText(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

/** A round key: a collar sunk into the deck and a dished cap above it. */
function keycap(cx, cy, z, P) {
  return k.solidSvg(k.cylinder(cx, cy, 5.5, z, 1.1, P, 18), { tone: 'lo' })
    + k.solidSvg(k.cylinder(cx, cy, 4.4, z + 1.1, 2.3, P, 18), { tone: 'mid' })
    + k.lineSvg(k.ring(cx, cy, 3, z + 3.5, P, 16), { tone: 'faint' })
}

export function buildTypewriter(P, options = {}) {
  const lines = options.lines || []
  const paperHref = options.paperHref || '#'
  const paperLabel = options.paperLabel || 'Open the latest article'
  const out = []

  // ---- body ------------------------------------------------------------
  out.push(k.solidSvg(k.slabOf(BASE, BASE_Z, 8, P, 12, 3), { tone: 'mid' }))
  out.push(k.lineSvg(k.sideSeam(BASE, BASE_Z + 8, P, 12), { tone: 'faint' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan(BASE, 1.2), BASE_Z + 8, P, 12), { tone: 'hi' }))
  out.push(k.solidSvg(k.slabOf({ x: -85, y: -39, w: 13, d: 74, r: 3 }, DECK_TOP, 22, P, 5, 1.4), { tone: 'mid' }))
  out.push(k.solidSvg(k.slabOf({ x: 72, y: -39, w: 13, d: 74, r: 3 }, DECK_TOP, 22, P, 5, 1.4), { tone: 'mid' }))
  out.push(k.solidSvg(k.slabOf({ x: -72, y: -35, w: 144, d: 39, r: 6 }, DECK_TOP, 16, P, 6, 1.2), { tone: 'mid' }))
  out.push(k.solidSvg(k.slabOf({ x: -72, y: -43, w: 144, d: 8, r: 2 }, DECK_TOP, 25, P, 4, 2), { tone: 'mid' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan({ x: -72, y: -43, w: 144, d: 8, r: 2 }, 2), DECK_TOP + 25, P, 4), { tone: 'faint' }))

  // ---- keyboard: four stepped decks, far row first ---------------------
  for (const row of [...ROWS].reverse()) {
    out.push(k.solidSvg(
      k.slabOf({ x: -72, y: row.y, w: 144, d: row.d, r: 2 }, DECK_TOP, row.lift, P, 4, 0.6),
      { tone: 'mid' },
    ))
  }

  ;[...ROWS].reverse().forEach((row, index) => {
    const keyRow = KEY_ROWS[ROWS.length - 1 - index]
    const cy = row.y + row.d / 2
    const z = DECK_TOP + row.lift
    for (let i = 0; i < keyRow.n; i++) {
      const cx = keyRow.x0 + i * PITCH
      const char = keyRow.chars[i]
      out.push(`<g class="home-key" data-key="${char}">${keycap(cx, cy, z, P)}</g>`)
    }
  })

  // space bar and the two shift keys beside it, on the base's front edge
  out.push(`<g class="home-key" data-key=" ">${k.solidSvg(k.slabOf({ x: -28, y: 35, w: 56, d: 6, r: 3 }, DECK_TOP, 2.4, P, 6, 0.8), { tone: 'lo' })}</g>`)
  out.push(`<g class="home-key" data-key="shift">${k.solidSvg(k.slabOf({ x: -56, y: 35, w: 22, d: 6, r: 3 }, DECK_TOP, 2.4, P, 6, 0.8), { tone: 'lo' })}</g>`)
  out.push(`<g class="home-key" data-key="shift">${k.solidSvg(k.slabOf({ x: 34, y: 35, w: 22, d: 6, r: 3 }, DECK_TOP, 2.4, P, 6, 0.8), { tone: 'lo' })}</g>`)

  // type basket guard, behind the keys and under the platen
  out.push(k.solidSvg(k.slabOf({ x: -52, y: -12, w: 104, d: 8, r: 4 }, DECK_TOP + 16, 6, P, 5, 1), { tone: 'mid' }))

  // carriage rails
  out.push(k.lineSvg(k.segment([-70, -32, DECK_TOP + 16.3], [70, -32, DECK_TOP + 16.3], P), { tone: 'mid' }))
  out.push(k.lineSvg(k.segment([-70, -16, DECK_TOP + 16.3], [70, -16, DECK_TOP + 16.3], P), { tone: 'mid' }))

  // ---- paper table and sheet -------------------------------------------
  const table = [k.iso([-66, -35, BASE_Z + 33], P), k.iso([66, -35, BASE_Z + 33], P), k.iso([66, -46, BASE_Z + 65], P), k.iso([-66, -46, BASE_Z + 65], P)]
  out.push(`<path class="home-table" d="${k.pathOf(table, true)}"/>`)
  out.push(k.lineSvg(k.pathOf(table, true), { tone: 'lo' }))
  out.push(k.lineSvg(k.segment([-60, -44.5, BASE_Z + 63], [60, -44.5, BASE_Z + 63], P), { tone: 'faint' }))

  const u = [1, 0, 0]
  const vRaw = [0, PAPER_BOTTOM.y - PAPER_TOP.y, PAPER_BOTTOM.z - PAPER_TOP.z]
  const vLen = Math.hypot(vRaw[1], vRaw[2])
  const v = [0, vRaw[1] / vLen, vRaw[2] / vLen]
  const corners = [
    [-PAPER_HALF, PAPER_TOP.y, PAPER_TOP.z],
    [PAPER_HALF, PAPER_TOP.y, PAPER_TOP.z],
    [PAPER_HALF, PAPER_BOTTOM.y, PAPER_BOTTOM.z],
    [-PAPER_HALF, PAPER_BOTTOM.y, PAPER_BOTTOM.z],
  ]
  const paperPath = k.pathOf(corners.map((p) => k.iso(p, P)), true)
  const paper = []
  paper.push(`<path class="home-paper-shadow" d="${k.pathOf(corners.map((p) => k.iso([p[0] + 3, p[1] - 2, p[2] - 2], P)), true)}"/>`)
  paper.push(`<a class="home-paper-link" href="${paperHref}" aria-label="${paperLabel}"><path class="home-paper" d="${paperPath}"/></a>`)
  paper.push(k.lineSvg(paperPath, { tone: 'lo' }))

  // the typed excerpt, laid on the leaning sheet. The block is translated by
  // the client so the line being struck always sits at the roller.
  const matrix = planeMatrix([-PAPER_HALF, PAPER_TOP.y, PAPER_TOP.z], u, v, P)
  paper.push(`<defs><clipPath id="home-sheet-clip" clipPathUnits="userSpaceOnUse"><rect x="0" y="0" width="${SHEET_W}" height="${SHEET_H.toFixed(2)}"/></clipPath></defs>`)
  paper.push(`<g transform="${matrix}" clip-path="url(#home-sheet-clip)">`)
  paper.push(`<g class="home-typed-block" data-bottom="${(SHEET_H - 3).toFixed(2)}">`)
  lines.forEach((line, index) => {
    paper.push(`<text class="iso-face-text home-typed-line" data-line="${index}" data-tone="lit" font-size="${TEXT.size}" x="${TEXT.x}" y="${(TEXT.top + index * TEXT.leading).toFixed(2)}">${escapeText(line)}</text>`)
  })
  paper.push('</g></g>')
  out.push(`<g class="home-paper-group">${paper.join('')}</g>`)

  // ---- platen, ribbon, carriage ----------------------------------------
  const platenFrame = G.frameAlong([0, PLATEN.y, PLATEN.z], [1, 0, 0])
  out.push(k.solidSvg(G.disc(-PLATEN.half, PLATEN.half, PLATEN.r, platenFrame, P, { smooth: true }), { tone: 'hi' }))
  out.push(k.lineSvg(k.segment([-PLATEN.half + 2, PLATEN.y - PLATEN.r, PLATEN.z + 2], [PLATEN.half - 2, PLATEN.y - PLATEN.r, PLATEN.z + 2], P), { tone: 'faint' }))
  out.push(k.lineSvg(
    Array.from({ length: 2 }, (_, i) => G.arcOf(platenFrame, i ? PLATEN.half : -PLATEN.half, PLATEN.r, P, { steps: 28 })).join(''),
    { tone: 'faint' },
  ))

  for (const sx of [-54, 54]) {
    out.push(k.solidSvg(k.cylinder(sx, -4, 7, DECK_TOP + 16, 5, P, 22), { tone: 'mid' }))
    out.push(k.solidSvg(k.cylinder(sx, -4, 9, DECK_TOP + 15, 1.6, P, 24), { tone: 'lo' }))
    out.push(k.solidSvg(k.cylinder(sx, -4, 4, DECK_TOP + 21, 1.4, P, 16), { tone: 'lo' }))
  }

  // typebars and ribbon sit in front of the roller, so they paint over it
  for (let i = 0; i < 9; i++) {
    const t = (i / 8) * 2 - 1
    out.push(k.lineSvg(k.segment([t * 34, -2, BASE_Z + 26], [t * 16, -12, BASE_Z + 33], P), { tone: 'mid' }))
    out.push(k.dotsSvg([k.iso([t * 16, -12, BASE_Z + 33], P)], { size: 0.6, tone: 'hi' }))
  }
  out.push(k.lineSvg(k.segment([-50, -6, DECK_TOP + 22.2], [-6, -10, DECK_TOP + 22.2], P), { tone: 'mid' }))
  out.push(k.lineSvg(k.segment([6, -10, DECK_TOP + 22.2], [50, -6, DECK_TOP + 22.2], P), { tone: 'mid' }))

  // carriage return lever, drawn before the knobs so they hide its root
  out.push(k.lineSvg(k.segment([69, -30, BASE_Z + 46], [102, -18, BASE_Z + 60], P), { tone: 'mid' }))
  out.push(k.dotsSvg([k.iso([102, -18, BASE_Z + 60], P)], { size: 2.6, tone: 'mid' }))

  for (const side of [-1, 1]) {
    const s0 = side > 0 ? PLATEN.half : -PLATEN.half - 8
    const s1 = side > 0 ? PLATEN.half + 8 : -PLATEN.half
    out.push(k.solidSvg(G.disc(s0, s1, PLATEN.r + 1.4, platenFrame, P, { bevel: 1 }), { tone: 'mid' }))
    out.push(k.lineSvg(G.circleOf(platenFrame, s1, PLATEN.r - 1.5, P), { tone: 'faint' }))
    out.push(k.lineSvg(
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2
        return G.arcOf(platenFrame, s1, PLATEN.r + 1.6, P, { from: a, to: a + 0.16, steps: 2 })
      }).join(''),
      { tone: 'faint' },
    ))
  }

  out.push(k.lineSvg(k.segment([-60, -14.2, BASE_Z + 39], [60, -14.2, BASE_Z + 39], P), { tone: 'hi' }))
  out.push(k.dotsSvg([k.iso([-60, -14.2, BASE_Z + 39], P), k.iso([60, -14.2, BASE_Z + 39], P)], { size: 0.9, tone: 'mid' }))
  out.push(k.lineSvg(k.segment([-PAPER_HALF + 4, PAPER_TOP.y + 9, PAPER_TOP.z - 9], [PAPER_HALF - 4, PAPER_TOP.y + 9, PAPER_TOP.z - 9], P), { tone: 'mid' }))

  // ---- badge, vents ----------------------------------------------------
  const plate = { x: -38, y: 43, w: 76, d: 3, r: 1.2 }
  out.push(k.solidSvg(k.slabOf(plate, BASE_Z + 1.5, 5, P, 3, 0.3), { tone: 'lo' }))
  out.push(k.faceTextSvg(k.sideMatrix([0, plate.y + plate.d], BASE_Z + 4.2, P, 'left'), 'No.01 · TYPE', {
    size: 3.8,
    tone: 'mid',
    anchor: 'middle',
  }))

  for (let i = 0; i < 4; i++) {
    out.push(k.lineSvg(k.segment([85, -22 + i * 10, DECK_TOP + 4], [85, -22 + i * 10, DECK_TOP + 17], P), { tone: 'faint' }))
  }

  return out.join('')
}

export function typewriterBounds() {
  return [
    ...k.boxCorners(BASE, BASE_Z, BASE_Z + 30),
    [-PAPER_HALF, PAPER_TOP.y, PAPER_TOP.z],
    [PAPER_HALF, PAPER_TOP.y, PAPER_TOP.z],
    [-PAPER_HALF, PAPER_BOTTOM.y, PAPER_BOTTOM.z],
    [PAPER_HALF, PAPER_BOTTOM.y, PAPER_BOTTOM.z],
    [102, -18, BASE_Z + 60],
  ]
}
