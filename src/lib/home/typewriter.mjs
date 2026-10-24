import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 01 — the typewriter.
 * Its mechanism: a key drives a hammer into the ribbon, the platen advances,
 * and the paper keeps what was struck. The paper is the only lit part.
 */

const BASE_Z = TOP
const BASE = { x: -85, y: -43, w: 170, d: 86, r: 10 }

const PLATEN = { y: -24, z: 132, r: 9, half: 72 }
const PAPER_BOTTOM = { y: -26, z: 140 }
const PAPER_TOP = { y: -48, z: 178 }
const PAPER_HALF = 66

const KEY_ROWS = [
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
]

const ROWS = [
  { y: 30, d: 14, top: 108 },
  { y: 20, d: 10, top: 111 },
  { y: 11, d: 9, top: 114 },
  { y: 3, d: 8, top: 117 },
]

export const TYPEWRITER_TOP = PAPER_TOP.z

/** Affine matrix for text laid on an arbitrary 3D plane. */
function planeMatrix(origin, u, v, P) {
  const o = k.iso(origin, P)
  const a = k.iso([origin[0] + u[0], origin[1] + u[1], origin[2] + u[2]], P)
  const b = k.iso([origin[0] + v[0], origin[1] + v[1], origin[2] + v[2]], P)
  const f = (n) => Number(n.toFixed(4))
  return `matrix(${f(a[0] - o[0])},${f(a[1] - o[1])},${f(b[0] - o[0])},${f(b[1] - o[1])},${f(o[0])},${f(o[1])})`
}

function wrap(text, perLine, maxLines) {
  const chars = [...text]
  const lines = []
  for (let i = 0; i < chars.length && lines.length < maxLines; i += perLine) {
    lines.push(chars.slice(i, i + perLine).join(''))
  }
  return lines
}

export function buildTypewriter(P, options = {}) {
  const title = options.title || '探索数字创作的边界'
  const paperHref = options.paperHref || '#'
  const paperLabel = options.paperLabel || 'Open the latest article'
  const out = []

  // body
  out.push(k.solidSvg(k.slabOf(BASE, BASE_Z, 8, P, 12, 3), { tone: 'mid' }))
  out.push(k.solidSvg(k.slabOf({ x: -85, y: -39, w: 12, d: 74, r: 3 }, BASE_Z + 8, 22, P, 5, 1.4), { tone: 'mid' }))
  out.push(k.solidSvg(k.slabOf({ x: 73, y: -39, w: 12, d: 74, r: 3 }, BASE_Z + 8, 22, P, 5, 1.4), { tone: 'mid' }))
  out.push(k.solidSvg(k.slabOf({ x: -73, y: -39, w: 146, d: 47, r: 6 }, BASE_Z + 8, 16, P, 6, 1.2), { tone: 'mid' }))

  // keyboard steps
  for (const row of ROWS) {
    out.push(k.solidSvg(
      k.slabOf({ x: -70, y: row.y, w: 140, d: row.d, r: 2 }, BASE_Z + 8, row.top - (BASE_Z + 8), P, 4, 0.6),
      { tone: 'mid' },
    ))
  }

  // keys — tagged so the client can strike the one that matches the character
  ROWS.forEach((row, rowIndex) => {
    const cy = row.y + row.d / 2
    const chars = KEY_ROWS[rowIndex]
    for (let i = 0; i < 10; i++) {
      const cx = -63 + i * 14
      out.push(`<g class="home-key" data-key="${chars[i]}">${k.solidSvg(k.cylinder(cx, cy, 2.5, row.top, 3, P, 14), { tone: 'lo' })}</g>`)
    }
  })
  // space bar + shifts
  out.push(k.solidSvg(k.slabOf({ x: -32, y: 44, w: 64, d: 7, r: 3 }, BASE_Z + 8, 3, P, 4, 0.6), { tone: 'lo' }))
  out.push(k.solidSvg(k.slabOf({ x: -68, y: 38, w: 12, d: 7, r: 2 }, BASE_Z + 8, 3, P, 4, 0.5), { tone: 'lo' }))
  out.push(k.solidSvg(k.slabOf({ x: 56, y: 38, w: 12, d: 7, r: 2 }, BASE_Z + 8, 3, P, 4, 0.5), { tone: 'lo' }))

  // type basket guard
  out.push(k.solidSvg(k.slabOf({ x: -52, y: -8, w: 104, d: 10, r: 5 }, BASE_Z + 22, 6, P, 5, 1), { tone: 'mid' }))

  // typebars, fanning up from the basket to the platen
  for (let i = 0; i < 9; i++) {
    const t = (i / 8) * 2 - 1
    const x0 = t * 34
    const x1 = t * 16
    out.push(k.lineSvg(k.segment([x0, -2, BASE_Z + 26], [x1, -13, BASE_Z + 33], P), { tone: 'mid' }))
    out.push(k.dotsSvg([k.iso([x1, -13, BASE_Z + 33], P)], { size: 0.6, tone: 'hi' }))
  }

  // ribbon spools + ribbon
  for (const sx of [-54, 54]) {
    out.push(k.solidSvg(k.cylinder(sx, -4, 7, BASE_Z + 22, 6, P, 22), { tone: 'mid' }))
    out.push(k.solidSvg(k.cylinder(sx, -4, 9, BASE_Z + 21, 1.6, P, 24), { tone: 'lo' }))
    out.push(k.solidSvg(k.cylinder(sx, -4, 4, BASE_Z + 28, 1.4, P, 16), { tone: 'lo' }))
  }
  out.push(k.lineSvg(k.segment([-50, -6, BASE_Z + 30], [-6, -10, BASE_Z + 30], P), { tone: 'mid' }))
  out.push(k.lineSvg(k.segment([6, -10, BASE_Z + 30], [50, -6, BASE_Z + 30], P), { tone: 'mid' }))

  // carriage rails
  out.push(k.lineSvg(k.segment([-80, -32, BASE_Z + 26], [80, -32, BASE_Z + 26], P), { tone: 'mid' }))
  out.push(k.lineSvg(k.segment([-80, -16, BASE_Z + 26], [80, -16, BASE_Z + 26], P), { tone: 'mid' }))

  // paper plane — drawn before the platen so the platen reads in front of it
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
  // a second sheet behind, so the stack has thickness
  out.push(k.lineSvg(k.pathOf(corners.map((p) => k.iso([p[0] + 1.6, p[1] - 1.6, p[2] + 1.4], P)), true), { tone: 'faint' }))
  out.push(`<a class="home-paper-link" href="${paperHref}" aria-label="${paperLabel}"><path class="home-paper" d="${paperPath}"/></a>`)
  out.push(k.lineSvg(paperPath, { tone: 'lo' }))

  // the typed title, laid on the leaning paper plane
  const matrix = planeMatrix([-PAPER_HALF, PAPER_TOP.y, PAPER_TOP.z], u, v, P)
  const lines = wrap(title, 15, 3)
  lines.forEach((line, index) => {
    out.push(`<text class="iso-face-text home-typed-line" data-line="${index}" data-tone="lit" transform="${matrix}" font-size="6.2" x="8" y="${17 + index * 9.4}">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`)
  })

  // platen, in front of the paper
  const platenFrame = G.frameAlong([0, PLATEN.y, PLATEN.z], [1, 0, 0])
  out.push(k.solidSvg(G.disc(-PLATEN.half, PLATEN.half, PLATEN.r, platenFrame, P, { smooth: true }), { tone: 'hi' }))
  out.push(k.lineSvg(
    Array.from({ length: 2 }, (_, i) => G.arcOf(platenFrame, i ? PLATEN.half : -PLATEN.half, PLATEN.r, P, { steps: 28 })).join(''),
    { tone: 'faint' },
  ))
  // platen knobs
  out.push(k.solidSvg(G.disc(PLATEN.half, PLATEN.half + 7, PLATEN.r + 2.4, platenFrame, P), { tone: 'mid' }))
  out.push(k.solidSvg(G.disc(-PLATEN.half - 7, -PLATEN.half, PLATEN.r + 2.4, platenFrame, P), { tone: 'mid' }))

  // carriage return lever
  out.push(k.lineSvg(k.segment([76, -22, BASE_Z + 36], [96, -16, BASE_Z + 46], P), { tone: 'mid' }))
  out.push(k.dotsSvg([k.iso([96, -16, BASE_Z + 46], P)], { size: 2.2, tone: 'mid' }))

  // paper bail, across the sheet just above the platen
  out.push(k.lineSvg(k.segment([-PAPER_HALF + 4, PAPER_TOP.y + 8, PAPER_TOP.z - 8], [PAPER_HALF - 4, PAPER_TOP.y + 8, PAPER_TOP.z - 8], P), { tone: 'mid' }))

  // name plate on the base's front face
  const plate = { x: -38, y: 46, w: 76, d: 3, r: 1.2 }
  out.push(k.solidSvg(k.slabOf(plate, BASE_Z + 1.5, 5, P, 3, 0.3), { tone: 'lo' }))
  out.push(k.faceTextSvg(k.sideMatrix([0, plate.y + plate.d], BASE_Z + 4.2, P, 'left'), 'No.01 · TYPE', {
    size: 2.8,
    tone: 'faint',
    anchor: 'middle',
  }))

  // vents on the left cheek
  for (let i = 0; i < 4; i++) {
    out.push(k.lineSvg(k.segment([-85, -30 + i * 9, BASE_Z + 12], [-85, -30 + i * 9, BASE_Z + 24], P), { tone: 'faint' }))
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
    [96, -16, BASE_Z + 46],
  ]
}
