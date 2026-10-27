import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { PLATFORM_Z, TOP } from './chassis.mjs'

/**
 * Module 01 — the typewriter.
 *
 * A key drives a hammer into the ribbon, the platen turns, and the sheet keeps
 * what was struck. The paper is the only lit part, and it carries a real
 * excerpt: the client types it one character at a time and the sheet feeds up
 * out of the roller a line at a time, so the text emerges from the machine.
 *
 * The build reads like a real one: the feet take the case, the case takes the
 * keyboard, the basket goes in, the carriage lands on its rails, the platen and
 * its fittings go on, the covers close, the plate is screwed down, and only then
 * is the sheet fed in and the machine run for the first time.
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

/** the four rubber feet; they fill the gap between the bay's platform and the case */
const FOOT = { x: 78, y: 33, r: 5.6 }
/**
 * The side covers sit outside the platen's knobs (which end at x 72) and stay
 * below the roller's axis, so neither the knobs nor the ribbon spools on the
 * deck (x 45–63) are ever crowded by them. `d` is kept well short of the case's
 * own depth: a full-depth panel reads as a wall, a shallow one as a shoulder.
 */
const HOOD = { x: 74, y: -36, w: 11, d: 56, h: 22 }
/** the ribbon runs across the front of the basket, level with the type point */
const RIBBON_Z = DECK_TOP + 22.2
/** the fork sits in the gap between the two halves of the ribbon */
const FORK = { y: -10, z: RIBBON_Z }
/**
 * The paper bail rides at the roller's 3 o'clock — on the axis line, just clear
 * of the rubber's surface — so it draws a line straight across the roller's
 * face instead of hiding under its silhouette.
 */
const BAIL = { y: -13.6, z: 130.2, half: 58, r: 1.1, wheel: 2, wheelHalf: 3.2 }
/**
 * The margin bell is bolted to the left rear of the deck, clear of the ribbon
 * spools: it has to be heard before the carriage reaches the margin, so it
 * hangs off the frame rather than off the carriage.
 */
const BELL = { x: -65, y: -29, z: DECK_TOP + 16 }

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
   * of the assemblies a path belongs to. `--step` is the shared settle
   * contract (home.css); typewriter.css replaces it with the real mechanism.
   */
  const part = (name, step, ...items) =>
    `<g class="home-part" data-part="${name}" style="--step:${step}">${items.join('')}</g>`

  // ---- feet: four rubber blocks that take the case's weight --------------
  // They are what the machine actually stands on: without them the case would
  // hover over the bay's platform on its own shadow.
  out.push(part('tw-feet', 0,
    ...[-1, 1].flatMap(sx => [-1, 1].map((sy) => {
      const cx = sx * FOOT.x
      const cy = sy * FOOT.y
      return k.solidSvg(k.cylinder(cx, cy, FOOT.r, PLATFORM_Z, BASE_Z - PLATFORM_Z, P, 20, 0.6), { tone: 'lo' })
        + k.lineSvg(k.ring(cx, cy, FOOT.r - 0.9, PLATFORM_Z + 1.1, P, 18), { tone: 'faint' })
    })),
  ))

  // ---- base: the case the whole machine is bolted to --------------------
  out.push(part('base', 0,
    k.solidSvg(k.slabOf(BASE, BASE_Z, 8, P, 12, 3), { tone: 'mid' }),
    k.lineSvg(k.sideSeam(BASE, BASE_Z + 8, P, 12), { tone: 'faint' }),
    k.lineSvg(k.planOutline(k.insetPlan(BASE, 1.2), BASE_Z + 8, P, 12), { tone: 'hi' }),
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

  // ---- paper table: the fixed rest the sheet leans back against ---------
  const table = [k.iso([-66, -35, BASE_Z + 33], P), k.iso([66, -35, BASE_Z + 33], P), k.iso([66, -46, BASE_Z + 65], P), k.iso([-66, -46, BASE_Z + 65], P)]
  out.push(part('tw-table', 0,
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
  // The feed is its own wrapper so the sheet can be drawn up through the roller
  // without touching the group the client translates a line at a time. The clip
  // is a fixed window at the roller line, so sliding the strip down inside it
  // hides the sheet behind the roller instead of fading it in.
  paper.push(`<g class="home-sheet-feed">`)
  paper.push(`<g class="home-paper-group" data-leading="${TEXT.leading}" data-lines="${lines.length}">`)
  paper.push(`<path class="home-paper-shadow" d="${strip(2.5, 2.5)}"/>`)
  paper.push(`<a class="home-paper-link" href="${paperHref}" aria-label="${paperLabel}"><path class="home-paper" d="${strip(0, 0)}"/></a>`)
  lines.forEach((line, index) => {
    paper.push(`<text class="iso-face-text home-typed-line" data-line="${index}" data-tone="lit" font-size="${TEXT.size}" x="${TEXT.x}" y="${(ROLLER_V + index * TEXT.leading).toFixed(2)}">${escapeText(line)}</text>`)
  })
  paper.push('</g></g>')
  paper.push('</g>')
  // The holder is wrapped whole: the sheet, its clip and the group the client
  // translates are untouched inside. It is its own part because the sheet rides
  // on the carriage, while the table behind it stays bolted to the frame.
  out.push(part('tw-sheet', 0, `<g class="home-paper-holder">${paper.join('')}</g>`))

  // ---- typebar basket: the fan of bars under the type point -------------
  // The middle bar is its own group so the machine can strike once, on its own,
  // when it is first run.
  out.push(part('mechanism', 0,
    ...Array.from({ length: 9 }, (_, i) => {
      const t = (i / 8) * 2 - 1
      const bar = k.lineSvg(k.segment([t * 34, -2, BASE_Z + 26], [t * 16, -12, BASE_Z + 33], P), { tone: 'mid' })
        + k.dotsSvg([k.iso([t * 16, -12, BASE_Z + 33], P)], { size: 0.6, tone: 'hi' })
      return i === 4 ? `<g class="tw-bar">${bar}</g>` : bar
    }),
  ))

  // ---- ribbon fork: the vibrator that lifts the ribbon to the type point -
  // The ribbon cannot run straight across the print point: it has to be held up
  // between two prongs and dropped again between strikes. Those prongs are the
  // gap the ribbon closes when it is threaded.
  out.push(part('tw-fork', 0,
    k.lineSvg(k.segment([-7, FORK.y, DECK_TOP + 19.2], [-7, FORK.y, FORK.z + 6.2], P), { tone: 'mid' }),
    k.lineSvg(k.segment([7, FORK.y, DECK_TOP + 19.2], [7, FORK.y, FORK.z + 6.2], P), { tone: 'mid' }),
    k.lineSvg(k.segment([-7, FORK.y, DECK_TOP + 19.2], [7, FORK.y, DECK_TOP + 19.2], P), { tone: 'mid' }),
    k.dotsSvg([k.iso([-7, FORK.y, FORK.z + 6.2], P), k.iso([7, FORK.y, FORK.z + 6.2], P)], { size: 0.7, tone: 'hi' }),
  ))

  // ---- margin bell: it rings a few characters before the right margin ----
  const bellFrame = G.frameAlong([BELL.x, BELL.y, BELL.z], [0, 0, 1])
  out.push(part('tw-bell', 0,
    k.solidSvg(G.solidOf([[0, 3.7], [0.4, 3.7], [1, 3.2], [2.1, 2.4], [3.2, 1.2], [3.8, 0]], bellFrame, P), { tone: 'lo' }),
    k.lineSvg(G.arcOf(bellFrame, 0.45, 3.7, P, { steps: 18 }), { tone: 'faint' }),
    k.lineSvg(k.segment([BELL.x - 3.4, BELL.y, BELL.z + 0.6], [BELL.x - 6.6, BELL.y + 1.4, BELL.z + 0.6], P), { tone: 'faint' }),
    k.dotsSvg([k.iso([BELL.x + 5.2, BELL.y, BELL.z + 1.9], P)], { size: 0.6, tone: 'mid' }),
  ))

  // ---- carriage: the rails the assembly travels on, and the spool deck --
  out.push(part('carriage', 0,
    k.lineSvg(k.segment([-70, -32, DECK_TOP + 16.3], [70, -32, DECK_TOP + 16.3], P), { tone: 'mid' }),
    k.lineSvg(k.segment([-70, -16, DECK_TOP + 16.3], [70, -16, DECK_TOP + 16.3], P), { tone: 'mid' }),
    // ribbon spools sit on the carriage deck, in front of the roller
    ...[-54, 54].flatMap(sx => [
      k.solidSvg(k.cylinder(sx, -4, 7, DECK_TOP + 16, 5, P, 22), { tone: 'mid' }),
      k.solidSvg(k.cylinder(sx, -4, 9, DECK_TOP + 15, 1.6, P, 24), { tone: 'lo' }),
      k.solidSvg(k.cylinder(sx, -4, 4, DECK_TOP + 21, 1.4, P, 16), { tone: 'lo' }),
    ]),
  ))

  // ---- platen, and the knobs that turn it ------------------------------
  const platenFrame = G.frameAlong([0, PLATEN.y, PLATEN.z], [1, 0, 0])
  out.push(part('platen', 0,
    k.solidSvg(G.disc(-PLATEN.half, PLATEN.half, PLATEN.r, platenFrame, P, { smooth: true }), { tone: 'hi' }),
    k.lineSvg(k.segment([-PLATEN.half + 2, PLATEN.y - PLATEN.r, PLATEN.z + 2], [PLATEN.half - 2, PLATEN.y - PLATEN.r, PLATEN.z + 2], P), { tone: 'faint' }),
    k.lineSvg(
      Array.from({ length: 2 }, (_, i) => G.arcOf(platenFrame, i ? PLATEN.half : -PLATEN.half, PLATEN.r, P, { steps: 28 })).join(''),
      { tone: 'faint' },
    ),
  ))

  // one knob per side, so each twists about its own axis rather than the pair.
  // Only the knurling spins on the first run: the turned body keeps its own
  // shading, which is what a lathed knob does under a fixed light.
  for (const side of [-1, 1]) {
    const s0 = side > 0 ? PLATEN.half : -PLATEN.half - 8
    const s1 = side > 0 ? PLATEN.half + 8 : -PLATEN.half
    out.push(part('tw-knob', side > 0 ? 1 : 0,
      k.solidSvg(G.disc(s0, s1, PLATEN.r + 1.4, platenFrame, P, { bevel: 1 }), { tone: 'mid' }),
      k.lineSvg(G.circleOf(platenFrame, s1, PLATEN.r - 1.5, P), { tone: 'faint' }),
      `<g class="tw-knob-spin">${k.lineSvg(
        Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2
          return G.arcOf(platenFrame, s1, PLATEN.r + 1.6, P, { from: a, to: a + 0.16, steps: 2 })
        }).join(''),
        { tone: 'faint' },
      )}</g>`,
    ))
  }

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
  const [armX, armY] = k.iso(armStart, P)
  const collar = G.ringBand(PLATEN.half + 8, PLATEN.half + 16, PLATEN.r + 1.4, PLATEN.r + 3.6, platenFrame, P)
  const arm = k.solidSvg(G.solidOf([[0, 2.4], [ARM_LEN - 9, 2.4], [ARM_LEN - 9, 2.9], [ARM_LEN - 2, 2.9], [ARM_LEN - 2, 4.6], [ARM_LEN + 4, 4.6], [ARM_LEN + 4, 2.2]], ARM, P), { tone: 'mid' })
    + [-1.5, 0.6, 2.7].map(d => k.lineSvg(G.arcOf(ARM, ARM_LEN + d, 4.7, P, { steps: 20 }), { tone: 'faint' })).join('')
  const lever = [
    // the collar: a machined band clamped on the roller's end
    `<path class="home-brass" d="${[...collar.shades, collar.top].join('')}"/>`,
    k.lineSvg(G.arcOf(platenFrame, PLATEN.half + 16, PLATEN.r + 3.6, P), { tone: 'lo' }),
    k.lineSvg(G.arcOf(platenFrame, PLATEN.half + 8, PLATEN.r + 3.6, P), { tone: 'lo' }),
    // the arm is hinged at its own root, on the top of the collar: it can be
    // swung down onto the axle without the collar leaving the roller
    `<g class="tw-lever-arm" style="transform-origin:${armX.toFixed(1)}px ${armY.toFixed(1)}px">${arm}</g>`,
  ]
  out.push(part('tw-lever', 0,
    `<g class="home-return-lever" style="transform-origin:${pivotX.toFixed(1)}px ${pivotY.toFixed(1)}px">${lever.join('')}</g>`,
  ))

  // ---- paper bail: a rod across the front of the roller, on two arms -----
  // It is what stops the sheet from lifting off the platen, so it goes on after
  // the roller is in and before the ribbon is threaded past it.
  const bailFrame = G.frameAlong([0, BAIL.y, BAIL.z], [1, 0, 0])
  out.push(part('tw-bail', 0,
    ...[1, -1].flatMap((side) => {
      // the arm hugs the roller's front-bottom quadrant: its foot sits on the
      // roller's silhouette, so the bail reads as clamped to the platen rather
      // than hung in front of it
      const from = [side * BAIL.half, -22.8, 121.9]
      const to = [side * BAIL.half, BAIL.y - 0.2, BAIL.z - 0.4]
      const rise = [0, to[1] - from[1], to[2] - from[2]]
      const frame = G.frameAlong(from, rise)
      const len = Math.hypot(rise[1], rise[2])
      return [
        k.solidSvg(G.disc(-0.5, 1.8, 1.6, frame, P), { tone: 'lo' }),
        k.solidSvg(G.disc(0, len, 0.85, frame, P), { tone: 'mid' }),
      ]
    }),
    k.solidSvg(G.disc(-BAIL.half, BAIL.half, BAIL.r, bailFrame, P), { tone: 'mid' }),
    // two rubber tyres slipped onto the rod, not two loose eggs on the basket
    ...[-34, 34].flatMap(cx => [
      k.solidSvg(G.disc(cx - BAIL.wheelHalf, cx + BAIL.wheelHalf, BAIL.wheel, bailFrame, P), { tone: 'lo' }),
      k.lineSvg(G.arcOf(bailFrame, cx + BAIL.wheelHalf, BAIL.wheel, P, { steps: 18 }), { tone: 'faint' }),
      k.lineSvg(G.arcOf(bailFrame, cx - BAIL.wheelHalf, BAIL.wheel, P, { steps: 18 }), { tone: 'faint' }),
    ]),
  ))

  out.push(part('carriage', 1,
    k.lineSvg(k.segment([-60, -14.2, BASE_Z + 39], [60, -14.2, BASE_Z + 39], P), { tone: 'hi' }),
    k.dotsSvg([k.iso([-60, -14.2, BASE_Z + 39], P), k.iso([60, -14.2, BASE_Z + 39], P)], { size: 0.9, tone: 'mid' }),
  ))

  // ---- ribbon: threaded from one spool, through the fork, to the other ---
  // `pathLength` normalises the path so the CSS can draw it with a dash that
  // runs from nothing to the whole length, whatever the projection did to it.
  const ribbon = k.pathOf([[-54, -4, RIBBON_Z], [-50, -6, RIBBON_Z], [-6, FORK.y, RIBBON_Z], [6, FORK.y, RIBBON_Z], [50, -6, RIBBON_Z], [54, -4, RIBBON_Z]].map(p => k.iso(p, P)))
  out.push(part('tw-ribbon', 0,
    `<path class="iso-line tw-ribbon" data-tone="lit" pathLength="1" d="${ribbon}"/>`,
  ))

  // ---- side covers: the two panels that close over the works ------------
  // Shallow and low: they shoulder the carriage at its ends without standing
  // between the reader and the ribbon spools on the deck.
  // Each cover is its own group: the pair has to slide shut from opposite sides,
  // and a single group can only travel one way. `--dir` carries which side.
  out.push(part('tw-hood', 0,
    ...[-1, 1].map((side) => {
      const plan = { x: side > 0 ? HOOD.x : -(HOOD.x + HOOD.w), y: HOOD.y, w: HOOD.w, d: HOOD.d, r: 2.5 }
      const panel = [
        k.solidSvg(k.slabOf(plan, DECK_TOP, HOOD.h, P, 5, 1.2), { tone: 'mid' }),
        k.lineSvg(k.sideSeam(plan, DECK_TOP + HOOD.h, P, 5), { tone: 'faint' }),
        k.lineSvg(k.planOutline(k.insetPlan(plan, 1.6), DECK_TOP + HOOD.h, P, 5), { tone: 'faint' }),
        // louvres on the front face, where the case lets the heat out
        ...Array.from({ length: 2 }, (_, i) =>
          k.lineSvg(k.segment([plan.x + 2.5, plan.y + plan.d, DECK_TOP + 8 + i * 7], [plan.x + plan.w - 2.5, plan.y + plan.d, DECK_TOP + 8 + i * 7], P), { tone: 'faint' })),
      ]
      return `<g class="tw-hood-panel" style="--dir:${side}">${panel.join('')}</g>`
    }),
  ))

  // ---- nameplate: the last thing screwed to the case --------------------
  const plate = { x: -38, y: 43, w: 76, d: 3, r: 1.2 }
  // the two screws go in after the plate is on the case, so they are their own
  // group: a plate that slides up with its screws already in is not a plate
  // being fitted, it is a decal.
  out.push(part('tw-plate', 0,
    k.solidSvg(k.slabOf(plate, BASE_Z + 1.5, 5, P, 3, 0.3), { tone: 'lo' }),
    k.faceTextSvg(k.sideMatrix([0, plate.y + plate.d], BASE_Z + 4.2, P, 'left'), 'No.01 · TYPE', {
      size: 3.8,
      tone: 'mid',
      anchor: 'middle',
    }),
    `<g class="tw-plate-screws">${k.dotsSvg([
      k.iso([-33, plate.y + plate.d + 0.2, BASE_Z + 4], P),
      k.iso([33, plate.y + plate.d + 0.2, BASE_Z + 4], P),
    ], { size: 0.7, tone: 'mid' })}</g>`,
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
