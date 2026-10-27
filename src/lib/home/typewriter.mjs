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
const PAPER_HALF = 64

/** the sheet leans back off the roller along this unit vector */
const PAPER_DOWN = [0, 0.4239, -0.9057]
/**
 * The page's top margin, in paper units. It is the blank the sheet keeps above
 * the first line, so it is also the whole sheet standing above the roller
 * before a character is struck — a fresh page shows its margin, not a banner.
 */
const SHEET_MARGIN = 16
const PAPER_TOP = {
  y: PAPER_BOTTOM.y - SHEET_MARGIN * PAPER_DOWN[1],
  z: PAPER_BOTTOM.z - SHEET_MARGIN * PAPER_DOWN[2],
}

const SHEET_H = Math.hypot(PAPER_TOP.y - PAPER_BOTTOM.y, PAPER_TOP.z - PAPER_BOTTOM.z)
/** the roller line, in paper units measured from the sheet's top edge */
const ROLLER_V = Math.round(SHEET_H)
/** the strip is 92 units long, always longer than the fullest feed, so the tail
 *  below the roller is paper too; the platen and the clip hide the rest */
const SHEET_BOTTOM = 92
/** the sheet is cut for six lines of eighteen characters, set like a typed page */
const TEXT = { x: 10.5, leading: 8.1, size: 5.8 }
const MAX_LINES = 6

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

  /**
   * One sub-assembly. The groups are contiguous runs of what already painted
   * together, so splitting the machine changes no painter's order — only which
   * of the five assemblies a path belongs to. `--step` is the shared settle
   * contract (home.css); typewriter.css replaces it with the real mechanism.
   */
  const part = (name, step, ...items) =>
    `<g class="home-part" data-part="${name}" style="--step:${step}">${items.join('')}</g>`

  // ---- base: the case the whole machine is bolted to --------------------
  out.push(part('base', 0,
    k.solidSvg(k.slabOf(BASE, BASE_Z, 8, P, 12, 3), { tone: 'mid' }),
    k.lineSvg(k.sideSeam(BASE, BASE_Z + 8, P, 12), { tone: 'faint' }),
    k.lineSvg(k.planOutline(k.insetPlan(BASE, 1.2), BASE_Z + 8, P, 12), { tone: 'hi' }),
    k.solidSvg(k.slabOf({ x: -85, y: -39, w: 13, d: 74, r: 3 }, DECK_TOP, 22, P, 5, 1.4), { tone: 'mid' }),
    k.solidSvg(k.slabOf({ x: 72, y: -39, w: 13, d: 74, r: 3 }, DECK_TOP, 22, P, 5, 1.4), { tone: 'mid' }),
    k.solidSvg(k.slabOf({ x: -72, y: -35, w: 144, d: 39, r: 6 }, DECK_TOP, 16, P, 6, 1.2), { tone: 'mid' }),
    k.solidSvg(k.slabOf({ x: -72, y: -43, w: 144, d: 8, r: 2 }, DECK_TOP, 25, P, 4, 2), { tone: 'mid' }),
    k.lineSvg(k.planOutline(k.insetPlan({ x: -72, y: -43, w: 144, d: 8, r: 2 }, 2), DECK_TOP + 25, P, 4), { tone: 'faint' }),
  ))

  // ---- keyboard: four stepped decks, far row first ---------------------
  // Each deck is its own run, and so is each row of keys, so the rows can land
  // one after another instead of all at once. Both loops keep their order.
  const rows = [...ROWS].reverse()

  rows.forEach((row, index) => {
    out.push(part('deck', index, k.solidSvg(
      k.slabOf({ x: -72, y: row.y, w: 144, d: row.d, r: 2 }, DECK_TOP, row.lift, P, 4, 0.6),
      { tone: 'mid' },
    )))
  })

  rows.forEach((row, index) => {
    const keyRow = KEY_ROWS[ROWS.length - 1 - index]
    const cy = row.y + row.d / 2
    const z = DECK_TOP + row.lift
    const caps = []
    for (let i = 0; i < keyRow.n; i++) {
      const cx = keyRow.x0 + i * PITCH
      const char = keyRow.chars[i]
      caps.push(`<g class="home-key" data-key="${char}">${keycap(cx, cy, z, P)}</g>`)
    }
    out.push(part('keys', index, ...caps))
  })

  // space bar, the two shift keys beside it, and the basket guard behind them:
  // all of it is bolted to the frame, so it comes up with the deck under it.
  // The guard is part of the basket, not the carriage — it does not travel when
  // the carriage returns.
  out.push(part('keys', 4,
    `<g class="home-key" data-key=" ">${k.solidSvg(k.slabOf({ x: -28, y: 35, w: 56, d: 6, r: 3 }, DECK_TOP, 2.4, P, 6, 0.8), { tone: 'lo' })}</g>`,
    `<g class="home-key" data-key="shift">${k.solidSvg(k.slabOf({ x: -56, y: 35, w: 22, d: 6, r: 3 }, DECK_TOP, 2.4, P, 6, 0.8), { tone: 'lo' })}</g>`,
    `<g class="home-key" data-key="shift">${k.solidSvg(k.slabOf({ x: 34, y: 35, w: 22, d: 6, r: 3 }, DECK_TOP, 2.4, P, 6, 0.8), { tone: 'lo' })}</g>`,
    k.solidSvg(k.slabOf({ x: -52, y: -12, w: 104, d: 8, r: 4 }, DECK_TOP + 16, 6, P, 5, 1), { tone: 'mid' }),
  ))

  // ---- carriage: the assembly that travels on the rails ----------------
  out.push(part('carriage', 5,
    k.lineSvg(k.segment([-70, -32, DECK_TOP + 16.3], [70, -32, DECK_TOP + 16.3], P), { tone: 'mid' }),
    k.lineSvg(k.segment([-70, -16, DECK_TOP + 16.3], [70, -16, DECK_TOP + 16.3], P), { tone: 'mid' }),
  ))

  // ---- paper table and sheet -------------------------------------------
  const table = [k.iso([-66, -35, BASE_Z + 33], P), k.iso([66, -35, BASE_Z + 33], P), k.iso([66, -46, BASE_Z + 65], P), k.iso([-66, -46, BASE_Z + 65], P)]
  out.push(part('paper', 8,
    `<path class="home-table" d="${k.pathOf(table, true)}"/>`,
    k.lineSvg(k.pathOf(table, true), { tone: 'lo' }),
    k.lineSvg(k.segment([-60, -44.5, BASE_Z + 63], [60, -44.5, BASE_Z + 63], P), { tone: 'faint' }),
  ))

  const u = [1, 0, 0]
  const vRaw = [0, PAPER_BOTTOM.y - PAPER_TOP.y, PAPER_BOTTOM.z - PAPER_TOP.z]
  const vLen = Math.hypot(vRaw[1], vRaw[2])
  const v = [0, vRaw[1] / vLen, vRaw[2] / vLen]

  // The sheet is a long strip in the paper's own coordinates, not a fixed quad.
  // The client slides the strip up through the roller a line at a time, so the
  // paper and the typing travel together — exactly what a platen does.
  const matrix = planeMatrix([-PAPER_HALF, PAPER_TOP.y, PAPER_TOP.z], u, v, P)
  const strip = (dx, dy) => {
    const x0 = dx
    const x1 = PAPER_HALF * 2 + dx
    return `M${x0} ${dy}H${x1}V${SHEET_BOTTOM + dy}H${x0}Z`
  }

  const paper = []
  // The clip stops a couple of units below the roller line, where the platen's
  // own silhouette takes over: the sheet disappears behind the roller, and the
  // line standing at the type point keeps its descenders.
  paper.push(`<defs><clipPath id="home-sheet-clip" clipPathUnits="userSpaceOnUse"><rect x="-14" y="-440" width="${PAPER_HALF * 2 + 28}" height="${440 + ROLLER_V + 2}"/></clipPath></defs>`)
  paper.push(`<g transform="${matrix}" clip-path="url(#home-sheet-clip)">`)
  paper.push(`<g class="home-paper-group" data-leading="${TEXT.leading}" data-lines="${lines.length}">`)
  paper.push(`<path class="home-paper-shadow" d="${strip(2.5, 2.5)}"/>`)
  paper.push(`<a class="home-paper-link" href="${paperHref}" aria-label="${paperLabel}"><path class="home-paper" d="${strip(0, 0)}"/></a>`)
  lines.forEach((line, index) => {
    paper.push(`<text class="iso-face-text home-typed-line" data-line="${index}" data-tone="lit" font-size="${TEXT.size}" x="${TEXT.x}" y="${(ROLLER_V + index * TEXT.leading).toFixed(2)}">${escapeText(line)}</text>`)
  })
  paper.push('</g></g>')
  // The holder is wrapped whole: the sheet, its clip and the group the client
  // translates are untouched inside.
  out.push(part('paper', 8, `<g class="home-paper-holder">${paper.join('')}</g>`))

  // ---- platen, ribbon, carriage ----------------------------------------
  const platenFrame = G.frameAlong([0, PLATEN.y, PLATEN.z], [1, 0, 0])
  out.push(part('platen', 6,
    k.solidSvg(G.disc(-PLATEN.half, PLATEN.half, PLATEN.r, platenFrame, P, { smooth: true }), { tone: 'hi' }),
    k.lineSvg(k.segment([-PLATEN.half + 2, PLATEN.y - PLATEN.r, PLATEN.z + 2], [PLATEN.half - 2, PLATEN.y - PLATEN.r, PLATEN.z + 2], P), { tone: 'faint' }),
    k.lineSvg(
      Array.from({ length: 2 }, (_, i) => G.arcOf(platenFrame, i ? PLATEN.half : -PLATEN.half, PLATEN.r, P, { steps: 28 })).join(''),
      { tone: 'faint' },
    ),
  ))

  // ribbon spools sit on the carriage deck, in front of the roller
  out.push(part('carriage', 5,
    ...[-54, 54].flatMap(sx => [
      k.solidSvg(k.cylinder(sx, -4, 7, DECK_TOP + 16, 5, P, 22), { tone: 'mid' }),
      k.solidSvg(k.cylinder(sx, -4, 9, DECK_TOP + 15, 1.6, P, 24), { tone: 'lo' }),
      k.solidSvg(k.cylinder(sx, -4, 4, DECK_TOP + 21, 1.4, P, 16), { tone: 'lo' }),
    ]),
  ))

  // typebars and ribbon sit in front of the roller, so they paint over it
  out.push(part('mechanism', 7,
    ...Array.from({ length: 9 }, (_, i) => {
      const t = (i / 8) * 2 - 1
      return k.lineSvg(k.segment([t * 34, -2, BASE_Z + 26], [t * 16, -12, BASE_Z + 33], P), { tone: 'mid' })
        + k.dotsSvg([k.iso([t * 16, -12, BASE_Z + 33], P)], { size: 0.6, tone: 'hi' })
    }),
    k.lineSvg(k.segment([-50, -6, DECK_TOP + 22.2], [-6, -10, DECK_TOP + 22.2], P), { tone: 'lit' }),
    k.lineSvg(k.segment([6, -10, DECK_TOP + 22.2], [50, -6, DECK_TOP + 22.2], P), { tone: 'lit' }),
  ))

  // carriage return lever, drawn before the knobs so they hide its root
  // carriage return lever: a real mechanism on the right cheek — a pivot boss,
  // a tapered arm, a knurled grip and a link rod back to the carriage. The
  // client swings it whenever the sheet feeds a new line.
  // carriage return lever: a collar clamped round the platen's right end, an
  // arm rising from it, and a turned grip. Nothing floats: the collar turns on
  // the same axle as the roller, so the lever is part of the carriage.
  const PIVOT = [PLATEN.half + 12, PLATEN.y, PLATEN.z]
  const armStart = [PLATEN.half + 12, PLATEN.y, PLATEN.z + 12]
  const tip = [PLATEN.half + 30, PLATEN.y + 9, PLATEN.z + 21]
  const armDir = (() => {
    const d = [tip[0] - armStart[0], tip[1] - armStart[1], tip[2] - armStart[2]]
    const len = Math.hypot(...d)
    return [d[0] / len, d[1] / len, d[2] / len]
  })()
  const ARM_LEN = Math.hypot(tip[0] - armStart[0], tip[1] - armStart[1], tip[2] - armStart[2])
  const ARM = G.frameAlong(armStart, armDir)
  const [pivotX, pivotY] = k.iso(PIVOT, P)
  const collar = G.ringBand(PLATEN.half + 8, PLATEN.half + 16, PLATEN.r + 1.4, PLATEN.r + 3.6, platenFrame, P)
  const lever = [
    // the collar: a machined band clamped on the roller's end
    `<path class="home-brass" d="${[...collar.shades, collar.top].join('')}"/>`,
    k.lineSvg(G.arcOf(platenFrame, PLATEN.half + 16, PLATEN.r + 3.6, P), { tone: 'lo' }),
    k.lineSvg(G.arcOf(platenFrame, PLATEN.half + 8, PLATEN.r + 3.6, P), { tone: 'lo' }),
    // the arm springs off the top of the collar
    k.solidSvg(G.solidOf([[0, 2.4], [ARM_LEN - 9, 2.4], [ARM_LEN - 9, 2.9], [ARM_LEN - 2, 2.9], [ARM_LEN - 2, 4.6], [ARM_LEN + 4, 4.6], [ARM_LEN + 4, 2.2]], ARM, P), { tone: 'mid' }),
    // grip rings
    ...[-1.5, 0.6, 2.7].map(d => k.lineSvg(G.arcOf(ARM, ARM_LEN + d, 4.7, P, { steps: 20 }), { tone: 'faint' })),
  ]
  out.push(part('carriage', 5,
    `<g class="home-return-lever" style="transform-origin:${pivotX.toFixed(1)}px ${pivotY.toFixed(1)}px">${lever.join('')}</g>`,
  ))

  // one knob per side, so each twists about its own axis rather than the pair
  for (const side of [-1, 1]) {
    const s0 = side > 0 ? PLATEN.half : -PLATEN.half - 8
    const s1 = side > 0 ? PLATEN.half + 8 : -PLATEN.half
    out.push(part('platen', 6,
      k.solidSvg(G.disc(s0, s1, PLATEN.r + 1.4, platenFrame, P, { bevel: 1 }), { tone: 'mid' }),
      k.lineSvg(G.circleOf(platenFrame, s1, PLATEN.r - 1.5, P), { tone: 'faint' }),
      k.lineSvg(
        Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2
          return G.arcOf(platenFrame, s1, PLATEN.r + 1.6, P, { from: a, to: a + 0.16, steps: 2 })
        }).join(''),
        { tone: 'faint' },
      ),
    ))
  }

  out.push(part('carriage', 5,
    k.lineSvg(k.segment([-60, -14.2, BASE_Z + 39], [60, -14.2, BASE_Z + 39], P), { tone: 'hi' }),
    k.dotsSvg([k.iso([-60, -14.2, BASE_Z + 39], P), k.iso([60, -14.2, BASE_Z + 39], P)], { size: 0.9, tone: 'mid' }),
  ))

  // ---- badge, vents ----------------------------------------------------
  const plate = { x: -38, y: 43, w: 76, d: 3, r: 1.2 }
  out.push(part('base', 0,
    k.solidSvg(k.slabOf(plate, BASE_Z + 1.5, 5, P, 3, 0.3), { tone: 'lo' }),
    k.faceTextSvg(k.sideMatrix([0, plate.y + plate.d], BASE_Z + 4.2, P, 'left'), 'No.01 · TYPE', {
      size: 3.8,
      tone: 'mid',
      anchor: 'middle',
    }),
  ))

  out.push(part('base', 0,
    ...Array.from({ length: 4 }, (_, i) =>
      k.lineSvg(k.segment([85, -22 + i * 10, DECK_TOP + 4], [85, -22 + i * 10, DECK_TOP + 17], P), { tone: 'faint' })),
  ))

  return out.join('')
}

export function typewriterBounds() {
  const feed = (MAX_LINES - 1) * TEXT.leading
  return [
    ...k.boxCorners(BASE, BASE_Z, BASE_Z + 30),
    [-PAPER_HALF, PAPER_TOP.y, PAPER_TOP.z],
    [PAPER_HALF, PAPER_TOP.y, PAPER_TOP.z],
    // the sheet's top edge rises by (maxLines - 1) * leading as it feeds
    [-PAPER_HALF, PAPER_TOP.y - feed * PAPER_DOWN[1], PAPER_TOP.z - feed * PAPER_DOWN[2]],
    [PAPER_HALF, PAPER_TOP.y - feed * PAPER_DOWN[1], PAPER_TOP.z - feed * PAPER_DOWN[2]],
    [PLATEN.half + 30, PLATEN.y + 9, PLATEN.z + 21],
  ]
}
