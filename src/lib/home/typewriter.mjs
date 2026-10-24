import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 01 — the typewriter.
 * Its mechanism: a key drives a hammer into the ribbon, the platen advances,
 * and the paper keeps what was struck. The paper is the only lit part.
 *
 * Every part is seated: keys stand on their deck, the platen turns between the
 * cheeks, the ribbon rides the spool tops, and the badge sits on the base face.
 */

const BASE_Z = TOP
const BASE = { x: -85, y: -43, w: 170, d: 86, r: 10 }
const DECK_TOP = BASE_Z + 8

const PLATEN = { y: -24, z: 131, r: 10, half: 64 }
const PAPER_BOTTOM = { y: -30, z: 141 }
const PAPER_TOP = { y: -48, z: 178 }
const PAPER_HALF = 66

// front row first in the list, drawn back to front
const ROWS = [
  { y: 28, d: 8, top: DECK_TOP + 3 },
  { y: 20, d: 8, top: DECK_TOP + 5 },
  { y: 12, d: 8, top: DECK_TOP + 7 },
  { y: 4, d: 8, top: DECK_TOP + 9 },
]

const KEY_ROWS = [
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
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
  out.push(k.lineSvg(k.sideSeam(BASE, BASE_Z + 8, P, 12), { tone: 'faint' }))
  // bright trim along the base's top edge
  out.push(k.lineSvg(k.planOutline(k.insetPlan(BASE, 1.2), BASE_Z + 8, P, 12), { tone: 'hi' }))
  out.push(k.solidSvg(k.slabOf({ x: -85, y: -39, w: 13, d: 74, r: 3 }, DECK_TOP, 22, P, 5, 1.4), { tone: 'mid' }))
  out.push(k.solidSvg(k.slabOf({ x: 72, y: -39, w: 13, d: 74, r: 3 }, DECK_TOP, 22, P, 5, 1.4), { tone: 'mid' }))
  out.push(k.solidSvg(k.slabOf({ x: -72, y: -35, w: 144, d: 39, r: 6 }, DECK_TOP, 16, P, 6, 1.2), { tone: 'mid' }))
  // raised rear housing behind the platen, butted against the deck
  out.push(k.solidSvg(k.slabOf({ x: -72, y: -43, w: 144, d: 8, r: 2 }, DECK_TOP, 25, P, 4, 2), { tone: 'mid' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan({ x: -72, y: -43, w: 144, d: 8, r: 2 }, 2), DECK_TOP + 25, P, 4), { tone: 'faint' }))

  // keyboard decks, far row first so the near row paints over it
  for (const row of [...ROWS].reverse()) {
    out.push(k.solidSvg(
      k.slabOf({ x: -72, y: row.y, w: 144, d: row.d, r: 2 }, DECK_TOP, row.top - DECK_TOP, P, 4, 0.6),
      { tone: 'mid' },
    ))
  }

  // keys — tagged so the client can strike the one that matches the character
  ;[...ROWS].reverse().forEach((row) => {
    const rowIndex = ROWS.indexOf(row)
    const cy = row.y + row.d / 2
    const chars = KEY_ROWS[rowIndex]
    for (let i = 0; i < 10; i++) {
      const cx = -63 + i * 14
      out.push(`<g class="home-key" data-key="${chars[i]}">${k.solidSvg(k.cylinder(cx, cy, 2.5, row.top, 3, P, 14), { tone: 'lo' })}</g>`)
    }
  })

  // space bar + shifts, seated on the base's front edge
  out.push(k.solidSvg(k.slabOf({ x: -32, y: 36, w: 64, d: 7, r: 3 }, DECK_TOP, 3, P, 4, 0.6), { tone: 'lo' }))
  out.push(k.solidSvg(k.slabOf({ x: -68, y: 36, w: 12, d: 7, r: 2 }, DECK_TOP, 3, P, 4, 0.5), { tone: 'lo' }))
  out.push(k.solidSvg(k.slabOf({ x: 56, y: 36, w: 12, d: 7, r: 2 }, DECK_TOP, 3, P, 4, 0.5), { tone: 'lo' }))

  // type basket guard, seated on the deck
  out.push(k.solidSvg(k.slabOf({ x: -52, y: -8, w: 104, d: 10, r: 5 }, DECK_TOP + 16, 6, P, 5, 1), { tone: 'mid' }))

  // typebars, fanning up from the basket to the platen
  for (let i = 0; i < 9; i++) {
    const t = (i / 8) * 2 - 1
    out.push(k.lineSvg(k.segment([t * 34, -2, BASE_Z + 26], [t * 16, -13, BASE_Z + 33], P), { tone: 'mid' }))
    out.push(k.dotsSvg([k.iso([t * 16, -13, BASE_Z + 33], P)], { size: 0.6, tone: 'hi' }))
  }

  // ribbon spools, standing on the deck, with the ribbon riding their tops
  for (const sx of [-54, 54]) {
    out.push(k.solidSvg(k.cylinder(sx, -4, 7, DECK_TOP + 16, 5, P, 22), { tone: 'mid' }))
    out.push(k.solidSvg(k.cylinder(sx, -4, 9, DECK_TOP + 15, 1.6, P, 24), { tone: 'lo' }))
    out.push(k.solidSvg(k.cylinder(sx, -4, 4, DECK_TOP + 21, 1.4, P, 16), { tone: 'lo' }))
  }
  out.push(k.lineSvg(k.segment([-50, -6, DECK_TOP + 22.2], [-6, -10, DECK_TOP + 22.2], P), { tone: 'mid' }))
  out.push(k.lineSvg(k.segment([6, -10, DECK_TOP + 22.2], [50, -6, DECK_TOP + 22.2], P), { tone: 'mid' }))

  // carriage rails, lying on the deck
  out.push(k.lineSvg(k.segment([-70, -32, DECK_TOP + 16.3], [70, -32, DECK_TOP + 16.3], P), { tone: 'mid' }))
  out.push(k.lineSvg(k.segment([-70, -16, DECK_TOP + 16.3], [70, -16, DECK_TOP + 16.3], P), { tone: 'mid' }))

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
  const paper = []
  paper.push(`<path class="home-paper-shadow" d="${k.pathOf(corners.map((p) => k.iso([p[0] + 3, p[1] - 2, p[2] - 2], P)), true)}"/>`)
  paper.push(`<a class="home-paper-link" href="${paperHref}" aria-label="${paperLabel}"><path class="home-paper" d="${paperPath}"/></a>`)
  paper.push(k.lineSvg(paperPath, { tone: 'lo' }))

  // the typed title, laid on the leaning paper plane
  const matrix = planeMatrix([-PAPER_HALF, PAPER_TOP.y, PAPER_TOP.z], u, v, P)
  const lines = wrap(title, 15, 3)
  lines.forEach((line, index) => {
    paper.push(`<text class="iso-face-text home-typed-line" data-line="${index}" data-tone="lit" transform="${matrix}" font-size="6.2" x="8" y="${17 + index * 9.4}">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`)
  })
  out.push(`<g class="home-paper-group">${paper.join('')}</g>`)

  // platen, turning between the cheeks
  const platenFrame = G.frameAlong([0, PLATEN.y, PLATEN.z], [1, 0, 0])
  out.push(k.solidSvg(G.disc(-PLATEN.half, PLATEN.half, PLATEN.r, platenFrame, P, { smooth: true }), { tone: 'hi' }))
  // lengthwise seam, before the knobs so it can never paint over them
  out.push(k.lineSvg(k.segment([-PLATEN.half + 2, PLATEN.y - PLATEN.r, PLATEN.z + 2], [PLATEN.half - 2, PLATEN.y - PLATEN.r, PLATEN.z + 2], P), { tone: 'faint' }))
  out.push(k.lineSvg(
    Array.from({ length: 2 }, (_, i) => G.arcOf(platenFrame, i ? PLATEN.half : -PLATEN.half, PLATEN.r, P, { steps: 28 })).join(''),
    { tone: 'faint' },
  ))
  // carriage return lever, drawn before the knobs so they hide its root
  out.push(k.lineSvg(k.segment([69, -30, BASE_Z + 46], [102, -18, BASE_Z + 60], P), { tone: 'mid' }))
  out.push(k.dotsSvg([k.iso([102, -18, BASE_Z + 60], P)], { size: 2.6, tone: 'mid' }))

  // knobs: a collar and a cap, running out to the case sides so the roller is held
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

  // paper guide rod, riding the roller's front face and held at both ends
  out.push(k.lineSvg(k.segment([-60, -14.2, BASE_Z + 39], [60, -14.2, BASE_Z + 39], P), { tone: 'hi' }))
  out.push(k.dotsSvg([k.iso([-60, -14.2, BASE_Z + 39], P), k.iso([60, -14.2, BASE_Z + 39], P)], { size: 0.9, tone: 'mid' }))

  // paper bail, across the sheet just above the platen
  out.push(k.lineSvg(k.segment([-PAPER_HALF + 4, PAPER_TOP.y + 8, PAPER_TOP.z - 8], [PAPER_HALF - 4, PAPER_TOP.y + 8, PAPER_TOP.z - 8], P), { tone: 'mid' }))

  // badge on the base's front face
  const plate = { x: -38, y: 43, w: 76, d: 3, r: 1.2 }
  out.push(k.solidSvg(k.slabOf(plate, BASE_Z + 1.5, 5, P, 3, 0.3), { tone: 'lo' }))
  out.push(k.faceTextSvg(k.sideMatrix([0, plate.y + plate.d], BASE_Z + 4.2, P, 'left'), 'No.01 · TYPE', {
    size: 3.8,
    tone: 'mid',
    anchor: 'middle',
  }))

  // vents on the right cheek, which is the face the camera sees
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
