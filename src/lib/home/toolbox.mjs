import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'
import { axisStyle, boxSvg, faceMatrix, facePath, frameOf } from './frame.mjs'

/**
 * Module 04 — the machined tool case that carries "资源".
 *
 * The case is shut when the reader meets it: a latched slab lying on the rim.
 * Opening it is the whole point — the lid is a real hinged group standing up
 * behind the body, tipped fifteen degrees past vertical so the inner face
 * turns toward the camera, with a folding stay holding it there.
 *
 * Inside, the case is a stationery drawer with three floors. The lid carries
 * the *index* of the resource page, not tools: a display board of app tiles on
 * the left and a column of name plates on the right, split by a hairline. The
 * well carries the play: three interchangeable sets of stationery — a drafting
 * kit, a reading set, a set of cards and film — and a three-position rotary
 * knob on the front-right indexes between them.
 *
 * The camera looks down at 18° with azimuth 90, so the lid's face projects to
 * a flat 168 × 70 rectangle with no foreshortening: u and v keep their true
 * proportions, which is why type printed on it stays readable instead of being
 * squashed to a third of its height the way a mark on the well floor is. The
 * well is only seven units deep and the near wall is thirty tall, so everything
 * in the trays is composed within y ∈ [−30, 8] — the rest of the floor is
 * behind the front wall.
 *
 * Painter order is the case's own depth: lid and its board first (furthest),
 * then the hinge, the body, the far wall, the well floor, the three sets, the
 * near wall with its dial, the stay — and the shut lid last of all, so it
 * covers the whole interior while the case is closed.
 */

const SHELL = { x: -84, y: -37, w: 168, d: 74, r: 6 }
const WALL = 5, BASE_H = 23, LID_H = 70, LID_TH = 7
const FLOOR_Z = TOP + BASE_H, RIM_Z = TOP + 30, HINGE_Z = TOP + 27, LID_TOP = RIM_Z + LID_TH
const BACK = SHELL.y, FRONT = SHELL.y + SHELL.d
const LID = frameOf({ pitch: 105, origin: [0, BACK, HINGE_Z] })
const IN = { x0: -79, y0: -32, x1: 79, y1: 32 }
const TRAY_X = [[-79, -5], [-3, 37], [39, 79]]
const TRAY_MID = TRAY_X.map(([a, b]) => (a + b) / 2)
const DIVIDERS = [-5, 37]
/** The plane the well floor is painted on — everything in the trays sits here. */
const FZ = FLOOR_Z + 0.06

const num = (n) => Number(n.toFixed(3))

const solid = (plan, z, h, P, tone = 'mid', steps = 4, bevel = 0.5) => k.solidSvg(k.slabOf(plan, z, h, P, steps, bevel), { tone })

/**
 * One sub-assembly. Every run is a contiguous stretch of what already painted
 * together, so wrapping it changes no painter's order — only which assembly a
 * path belongs to. `--step` is the index *inside* a run (the third wall, the
 * ninth chip); toolbox.css owns the clock that reads it, so the order the case
 * is built in lives in one place and the drawing stays a drawing.
 *
 * `axis` is the CSS `axisStyle` returned for the part — the stage-space unit
 * vector it arrives along, how far it travels and the pivot it turns about.
 * The stylesheet reads nothing else, so no entry motion is guessed by eye.
 */
const part = (name, step, axis, items) =>
  `<g class="home-part" data-part="${name}" style="--step:${step}${axis ? `;${axis}` : ''}">${items.join('')}</g>`

/**
 * The stroke a part is fitted along, as the CSS it needs.
 *
 * `seat` is the world point the part comes to rest on, `dir` the world
 * direction it travels to get there — up out of the deck, down onto a rim,
 * square into a panel — and `half` how much of that axis the part spans. The
 * axis is laid symmetrically about the seat, so the pivot the stylesheet folds
 * about *is* the seat: a pad grows out of the deck it stands on, a wall out of
 * its own base line, a chip about its own centre on the board.
 */
function stroke(P, seat, dir, half, travel) {
  const [x, y, z] = seat
  const [dx, dy, dz] = dir
  const n = Math.hypot(dx, dy, dz) || 1
  const end = (sign) => [x + (sign * dx * half) / n, y + (sign * dy * half) / n, z + (sign * dz * half) / n]
  return axisStyle(P, end(-1), end(1), travel)
}

/** Fill an already-projected path with one of the four shades. */
const paint = (d, shade, tone = 'faint') => `<path class="iso-shade" data-shade="${shade}" d="${d}"/>${k.lineSvg(d, { tone })}`

const faceQuad = (pts, P, shade, tone) => paint(k.pathOf(pts.map((p) => k.iso(p, P)), true), shade, tone)
const topRect = (x0, y0, x1, y1, z, P, shade, tone) => faceQuad([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], P, shade, tone)
const frontRect = (x0, z0, x1, z1, y, P, shade, tone) => faceQuad([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], P, shade, tone)
/** A rounded plan filled in one shade, lying at height z. */
const topPlan = (plan, z, P, shade, tone) => paint(k.pathOf(k.ringOf(plan, 5).map(([x, y]) => k.iso([x, y, z], P)), true), shade, tone)

/** A flat mark on the floor plane, in one of the set tones. */
const flat = (d, cls, tone) => `<path class="${cls}" d="${d}"/>${tone ? k.lineSvg(d, { tone }) : ''}`
const flatPlan = (ring, z, P, cls, tone) => flat(k.pathOf(ring.map(([x, y]) => k.iso([x, y, z], P)), true), cls, tone)

/** A line of engraving on the near panel, laid on its own face plane. */
const frontText = (x, z, text, size, tone, P, anchor = 'start') =>
  k.faceTextSvg(k.sideMatrix([x, FRONT + 0.3], z, P, 'left'), text, { size, tone, anchor })

/** A circle on the near panel — a rivet head, not a plan circle. */
const faceCircle = (cx, cz, r, y, P, n = 12) =>
  k.pathOf(Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return k.iso([cx + r * Math.cos(a), y, cz + r * Math.sin(a)], P)
  }), true)

// ---- the lid -------------------------------------------------------------
//
// The inner face of the lid is a display board: a recessed panel, a grid of app
// tiles on the left, a column of name plates on the right, a hairline between
// them and a caption over each zone. The face projects one-to-one (see the
// module comment), so (u, v) on the lid *is* (x, y) on screen — which is the
// whole reason the names can be read at homepage scale.

const LW = -2.7
/** The lid's face normal — what every mark on the board is pressed on square to. */
const LID_N = LID.dir(0, 0, 1)
/**
 * The axis a printed mark on the board arrives along, through its own centre.
 *
 * The board is parallel to the picture plane, so its normal projects to almost
 * nothing: at this focal length the lens offsets between the axis's two ends are
 * larger than the direction itself, and every chip would arrive from a slightly
 * different angle. The normal is a property of the face, not of the lens, so the
 * direction is read off a parallel projection. The pivot shifts by under two
 * pixels, which is well inside the chip's own scale.
 */
const boardAxis = (P, u, v, travel) => stroke({ ...P, focal: 0 }, LID.at(u, v, LW), LID_N, 3, travel)

/**
 * The board. Its bottom edge stops at v = 5: the case's back rim stands in
 * front of the hinge, and anything printed below that line is swallowed by it
 * when the lid is up.
 */
const BOARD = [-78, 5, 78, 68]

/** A rounded rectangle on the lid face, in (u, v). */
function lidRect([u0, v0, u1, v1], r, P, w = LW) {
  const ru = Math.max(0, Math.min(r, (u1 - u0) / 2, (v1 - v0) / 2))
  const pts = []
  const arc = (cu, cv, from) => {
    for (let i = 0; i <= 3; i++) {
      const a = ((from + i * 30) * Math.PI) / 180
      pts.push([cu + ru * Math.cos(a), cv + ru * Math.sin(a), w])
    }
  }
  arc(u1 - ru, v0 + ru, -90)
  arc(u1 - ru, v1 - ru, 0)
  arc(u0 + ru, v1 - ru, 90)
  arc(u0 + ru, v0 + ru, 180)
  return facePath(LID, pts, P)
}

const lidLine = (pts, tone, P, w = LW) => k.lineSvg(facePath(LID, pts.map(([u, v]) => [u, v, w]), P), { tone })

/** Type laid on the lid: u runs right, v runs down the page. */
const lidText = (u, v, text, size, tone, P, anchor = 'start') =>
  k.faceTextSvg(faceMatrix(LID, [u, v, LW], [1, 0, 0], [0, -1, 0], P), text, { size, tone, anchor })

// --- the app glyphs -------------------------------------------------------
//
// Each glyph is drawn in a ±2 box with y up, then scaled onto its tile. The
// tile is a printed chip, not a solid: at eleven units across, a bevel would be
// invisible, so the mark carries the whole read.

const ink = (d) => `<path class="home-lid-ink" d="${d}"/>`
const carve = (d) => `<path class="home-lid-carve" d="${d}"/>`
const trace = (d) => `<path class="home-lid-trace" d="${d}"/>`

const APPS = [
  // Figma — a pen nib
  () => [ink('M-1.55 1.95 L1.55 1.95 L0 -1.95 Z'), carve('M-0.16 1.95 L0.16 1.95 L0.16 0.5 L-0.16 0.5 Z')],
  // ColorHunt — a map pin
  () => [
    ink('M0 2 C0.63 2 1.15 1.48 1.15 0.85 C1.15 0.22 0.63 -0.3 0 -0.3 C-0.63 -0.3 -1.15 0.22 -1.15 0.85 C-1.15 1.48 -0.63 2 0 2 Z'),
    ink('M-0.95 0.6 L0.95 0.6 L0 -2 Z'),
    carve('M0 1.3 C0.25 1.3 0.45 1.1 0.45 0.85 C0.45 0.6 0.25 0.4 0 0.4 C-0.25 0.4 -0.45 0.6 -0.45 0.85 C-0.45 1.1 -0.25 1.3 0 1.3 Z'),
  ],
  // OpenCode — a terminal chevron
  () => [trace('M-1.7 1.35 L-0.35 0.05 L-1.7 -1.25'), trace('M0.45 -1.2 L1.8 -1.2')],
  // OpenClaw — a pincer over a stem
  () => [
    trace('M-1.9 0.2 C-1.7 1.75 -0.55 2.1 0.1 1.15'),
    trace('M1.9 0.2 C1.7 1.75 0.55 2.1 -0.1 1.15'),
    ink('M-0.5 -1.9 L0.5 -1.9 L0.5 0.1 L-0.5 0.1 Z'),
  ],
  // VSCode — angle brackets
  () => [trace('M-0.65 1.65 L-1.9 0 L-0.65 -1.65'), trace('M0.65 1.65 L1.9 0 L0.65 -1.65')],
  // Obsidian — a crystal
  () => [ink('M0 2 L1.4 0.55 L0 -2 L-1.4 0.55 Z'), carve('M-1.4 0.55 L1.4 0.55 L1.15 0.85 L-1.15 0.85 Z')],
  // Affine — three blocks
  () => [
    ink('M-1.9 -1.7 L-0.45 -1.7 L-0.45 1.7 L-1.9 1.7 Z'),
    ink('M0.15 -1.7 L1.9 -1.7 L1.9 0.35 L0.15 0.35 Z'),
    ink('M0.15 0.95 L1.9 0.95 L1.9 1.7 L0.15 1.7 Z'),
  ],
  // Blinko — a bulb
  () => [
    ink('M0 1.95 C1.05 1.95 1.6 1.1 1.4 0.25 C1.28 -0.3 0.85 -0.6 0.6 -0.95 L0.6 -1.5 L-0.6 -1.5 L-0.6 -0.95 C-0.85 -0.6 -1.28 -0.3 -1.4 0.25 C-1.6 1.1 -1.05 1.95 0 1.95 Z'),
    carve('M-0.42 -0.55 L0.42 -0.55 L0.42 -0.95 L-0.42 -0.95 Z'),
  ],
  // Docker — containers on a base
  () => [
    ink('M-1.95 -1.5 L1.95 -1.5 L1.95 -0.95 L-1.95 -0.95 Z'),
    ink('M-1.85 -0.65 L-0.75 -0.65 L-0.75 0.45 L-1.85 0.45 Z'),
    ink('M-0.55 -0.65 L0.55 -0.65 L0.55 0.45 L-0.55 0.45 Z'),
    ink('M0.75 -0.65 L1.85 -0.65 L1.85 0.45 L0.75 0.45 Z'),
  ],
  // PVE — a shield
  () => [
    ink('M0 2 L1.75 1.25 L1.75 -0.25 C1.75 -1.3 0.9 -1.8 0 -2.05 C-0.9 -1.8 -1.75 -1.3 -1.75 -0.25 L-1.75 1.25 Z'),
    carve('M-0.85 0.5 L0 -0.4 L0.85 0.5 L0.5 0.82 L0 0.26 L-0.5 0.82 Z'),
  ],
  // FnOS — a pair of drives
  () => [
    ink('M-1.9 0.2 L1.9 0.2 L1.9 1.35 L-1.9 1.35 Z'),
    ink('M-1.9 -1.35 L1.9 -1.35 L1.9 -0.2 L-1.9 -0.2 Z'),
    carve('M1.05 0.55 L1.6 0.55 L1.6 1.0 L1.05 1.0 Z'),
    carve('M1.05 -1.0 L1.6 -1.0 L1.6 -0.55 L1.05 -0.55 Z'),
  ],
  // Argus — an eye
  () => [
    trace('M-2 -0.1 C-1.2 0.9 1.2 0.9 2 -0.1 C1.2 -1.1 -1.2 -1.1 -2 -0.1 Z'),
    ink('M0 0.45 C0.42 0.45 0.72 0.15 0.72 -0.1 C0.72 -0.35 0.42 -0.65 0 -0.65 C-0.42 -0.65 -0.72 -0.35 -0.72 -0.1 C-0.72 0.15 -0.42 0.45 0 0.45 Z'),
  ],
  // Men — a head on the shoulders
  () => [
    ink('M0 1.6 C0.62 1.6 1.1 1.12 1.1 0.5 C1.1 -0.12 0.62 -0.6 0 -0.6 C-0.62 -0.6 -1.1 -0.12 -1.1 0.5 C-1.1 1.12 -0.62 1.6 0 1.6 Z'),
    trace('M-1.85 -1.85 C-1.85 -1.0 -1.0 -0.72 0 -0.72 C1.0 -0.72 1.85 -1.0 1.85 -1.85'),
  ],
  // Cinema 4D — a cube
  () => [trace('M0 2 L1.7 1 L1.7 -1 L0 -2 L-1.7 -1 L-1.7 1 Z'), trace('M0 2 L0 0 L1.7 -1'), trace('M0 0 L-1.7 -1')],
  // After Effects — a play triangle
  () => [ink('M-1.3 1.9 L1.8 0 L-1.3 -1.9 Z')],
  // Photoshop — a palette
  () => [
    ink('M0 1.95 C1.08 1.95 1.95 1.08 1.95 0 C1.95 -1.08 1.08 -1.95 0 -1.95 C-1.08 -1.95 -1.95 -1.08 -1.95 0 C-1.95 1.08 -1.08 1.95 0 1.95 Z'),
    carve('M-1.05 0.55 L-0.65 0.95 L-0.25 0.55 L-0.65 0.15 Z'),
    carve('M0.35 0.9 L0.7 1.25 L1.05 0.9 L0.7 0.55 Z'),
    carve('M-0.3 -0.15 L0.05 0.2 L0.4 -0.15 L0.05 -0.5 Z'),
  ],
]

// The names behind the tiles — the real list from 我常用的工具. They are not
// printed on the board (there is no room for sixteen labels at this size), so
// they ride as <title> on each tile: the drawing stays a drawing, and the
// board still says what it is holding.
const APP_NAMES = [
  'Figma', 'ColorHunt', 'OpenCode', 'OpenClaw', 'VSCode', 'Obsidian', 'Affine', 'Blinko',
  'Docker', 'PVE', 'FnOS', 'Argus', 'Men', 'Cinema 4D', 'After Effects', 'Photoshop',
]

/** The real favicon of each tool, copied into public/icons/tools. */
const ICONS = [
  'figma.png', 'colorhunt.svg', 'opencode.ico', 'openclaw.svg', 'vscode.ico', 'obsidian.ico',
  'affine.ico', 'blinko.png', 'docker.svg', 'pve.ico', 'fnos.ico', 'argus.png',
  'men.svg', 'cinema4d.svg', 'aftereffects.svg', 'photoshop.svg',
]

const FRIENDS = ['阮一峰', '卢昌海', '李笑来', 'Tw93', 'Richard Chan', 'Yihui Xie', 'Takuya Matsuyama', 'Bo.Ke']

const TILE = 11
const TILE_PITCH = 13.8
const TILE_COL_PITCH = 15
const TILE_GRID = [-40, 32.75]
const LINKS_ZONE = [3, 73]

/** A circle on the lid's face — a screw head, not a plan circle. */
const lidRing = (cu, cv, r, P, w = LW) =>
  facePath(LID, Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2
    return [cu + r * Math.cos(a), cv + r * Math.sin(a), w]
  }), P)

/**
 * One app chip, as its own sub-assembly. The board is not printed in one pass:
 * it is pinned up chip by chip, and `--step` is the order they go on.
 */
function appBadge(index, cu, cv, href, name, P) {
  const half = TILE / 2
  const inset = 1.15
  const size = TILE - inset * 2
  // The mark is the tool's own favicon, laid on the tile in the lid's plane. The
  // board's v runs up the lid while an image's y runs down the page, so the
  // vertical axis is negated and the origin taken at the tile's top edge —
  // without that the marks hang upside down.
  const m = faceMatrix(LID, [cu - size / 2, cv + size / 2, LW - 0.25], [1, 0, 0], [0, -1, 0], P)
  const tile = lidRect([cu - half, cv - half, cu + half, cv + half], 2.3, P)
  return part('tb-badge', index, boardAxis(P, cu, cv, 7), [
    `<g class="home-lid-app"><title>${name}</title>`,
    `<path class="home-lid-tile" d="${tile}"/>`,
    k.lineSvg(tile, { tone: 'lo' }),
    `<image class="home-lid-icon" href="/icons/tools/${href}" width="${num(size)}" height="${num(size)}" preserveAspectRatio="xMidYMid meet" transform="${m}"/>`,
    '</g>',
  ])
}

/** One creator's name plate, printed on the right-hand column. */
function linkPlate(index, name, cy, P) {
  const [u0, u1] = LINKS_ZONE
  const chip = lidRect([u0, cy - 2.95, u1, cy + 2.95], 1.3, P)
  return part('tb-link', index, boardAxis(P, (u0 + u1) / 2, cy, 7), [
    `<g class="home-lid-chip"><title>${name}</title>`,
    `<path class="home-lid-chip-face" d="${chip}"/>`,
    k.lineSvg(chip, { tone: 'faint' }),
    lidText(u0 + 3.4, cy - 1.75, name, 5, 'hi', P),
    // the arrow: a diagonal with a corner head, pointing off the plate
    lidLine([[u1 - 8.2, cy - 1.25], [u1 - 4.6, cy + 1.25]], 'lo', P),
    lidLine([[u1 - 4.6, cy + 1.25], [u1 - 6.5, cy + 1.25]], 'lo', P),
    lidLine([[u1 - 4.6, cy + 1.25], [u1 - 4.6, cy - 0.5]], 'lo', P),
    '</g>',
  ])
}

/**
 * The lid's index, in the order it is built: the recessed panel, the clamp rail
 * screwed over its top edge, then the chips and the name plates one at a time.
 * Each comes back as its own run so the clock can hold it back.
 */
function lidBoard(P) {
  const panel = []
  // the panel: a recessed board, double-ruled the way a specimen board is
  panel.push(`<path class="home-lid-board" d="${lidRect(BOARD, 3.2, P)}"/>`)
  panel.push(k.lineSvg(lidRect(BOARD, 3.2, P), { tone: 'lo' }))
  panel.push(k.lineSvg(lidRect([BOARD[0] + 1.7, BOARD[1] + 1.7, BOARD[2] - 1.7, BOARD[3] - 1.7], 2.4, P), { tone: 'faint' }))
  // four screws holding it to the lid
  for (const [u, v] of [[-75, 8], [75, 8], [-75, 65], [75, 65]])
    panel.push(k.lineSvg(k.ring(u, v, 0.95, 0, P, 12), { tone: 'faint' }))

  // captions over each zone, and the count of what is pinned there
  panel.push(lidText(-70, 63.2, '常用工具', 3.6, 'mid', P))
  panel.push(lidText(-10, 62.9, String(APPS.length), 3.0, 'lo', P, 'end'))
  panel.push(lidText(3.2, 63.2, '喜欢的创作者', 3.6, 'mid', P))
  panel.push(lidText(73, 62.9, String(FRIENDS.length).padStart(2, '0'), 3.0, 'lo', P, 'end'))
  // the hairline that splits the two zones
  panel.push(lidLine([[-2.5, 6.5], [-2.5, 59]], 'lo', P))

  // the clamp rail: the one thing on the board that is a solid rather than a
  // print, so the panel reads as bolted to the lid instead of painted on it
  const bead = [
    boxSvg(LID, { u: -83, v: 66, w: -3.9, uw: 166, vd: 3.6, wh: 1.8 }, P, { tone: 'mid' }),
    k.lineSvg(lidRing(-78, 67.8, 0.85, P, -3.95), { tone: 'faint' }),
    k.lineSvg(lidRing(78, 67.8, 0.85, P, -3.95), { tone: 'faint' }),
  ]

  // the app grid, reading order top-left to bottom-right
  const rows = Math.ceil(APPS.length / 4)
  const x0 = TILE_GRID[0] - ((3 * TILE_COL_PITCH) / 2)
  const y0 = TILE_GRID[1] + (((rows - 1) * TILE_PITCH) / 2)
  const badges = APPS.map((_glyph, index) => {
    const cu = x0 + (index % 4) * TILE_COL_PITCH
    const cv = y0 - Math.floor(index / 4) * TILE_PITCH
    return appBadge(index, cu, cv, ICONS[index], APP_NAMES[index], P)
  })

  // the name plates: one chip per creator, a hairline plate with its own arrow
  const pitch = 6.65
  const top = 56
  const links = FRIENDS.map((name, index) => linkPlate(index, name, top - index * pitch, P))

  const boardMid = [(BOARD[0] + BOARD[2]) / 2, (BOARD[1] + BOARD[3]) / 2]
  return [
    part('tb-board', 0, boardAxis(P, boardMid[0], boardMid[1], 8), panel),
    part('tb-bead', 0, boardAxis(P, 0, 67.8, 6), bead),
    ...badges,
    ...links,
  ].join('')
}

function lidSvg(P) {
  // pin the swing to the hinge itself: a bbox-relative origin drifts as soon as
  // anything in the group reaches past the lid, and the lid then folds out from
  // under the case instead of up from its back rim
  const [, hy] = k.iso([0, BACK, HINGE_Z], P)
  const out = [`<g class="home-case-lid" style="--hinge:${hy.toFixed(1)}px">`]
  out.push(boxSvg(LID, { u: -84, v: 0, w: -2, uw: 168, vd: LID_H, wh: 4 }, P, { tone: 'mid' }))
  // the board is the lid's cargo: it rides the swing, so every chip is already
  // square to the camera by the time the case is open
  out.push(lidBoard(P))
  out.push('</g>')
  return out.join('')
}

// ---- the shut lid -------------------------------------------------------
//
// The case the reader first meets is shut. This is the lid as it reads then:
// 168 × 74 lying flat on the rim, a seam down its length, two hasps clasping
// the shell's latch plate and a carry handle folded onto the top. It stays
// shut while the case assembles and only then hands over to the hinged lid, so
// the case really does open instead of fading in.

const HASPS = [-8.8, 3.4]
const HASP_W = 5.4

/** One hasp: a tongue off the lid's front edge, dropping over the latch plate. */
function haspSvg(x, P) {
  const plan = { x, y: FRONT - 0.2, w: HASP_W, d: 2.4, r: 0.8 }
  const out = [solid(plan, RIM_Z - 3.4, LID_TH + 3.6, P, 'mid', 4, 0.5)]
  out.push(k.lineSvg(k.planOutline(k.insetPlan(plan, 0.9), LID_TOP + 0.35, P, 4), { tone: 'faint' }))
  // the rivet that holds the tongue to the lid
  out.push(k.lineSvg(G.circleOf(G.frameAlong([x + HASP_W / 2, FRONT + 2.25, RIM_Z + 3.4], [0, 1, 0]), 0, 1.1, P), { tone: 'faint' }))
  return out.join('')
}

function closedLidSvg(P) {
  const out = ['<g class="home-case-closed">']
  // the slab: full footprint of the case, sitting exactly on the rim
  out.push(solid(SHELL, RIM_Z, LID_TH, P, 'mid', 6, 1.2))
  // a pressed panel across the back of the top, so it is not a blank face
  out.push(topPlan({ x: -75, y: -31, w: 150, d: 40, r: 5 }, LID_TOP + 0.05, P, 2, 'faint'))
  // the seam, down the length of the lid: a groove with a lit lip behind it
  out.push(topRect(-82.5, 19.4, 82.5, 24.2, LID_TOP + 0.06, P, 0, 'faint'))
  out.push(k.lineSvg(k.lineOnTop([-82.5, 19.1], [82.5, 19.1], LID_TOP + 0.1, P), { tone: 'hi' }))
  // the carry handle, folded down onto the top: two posts, a grip between them
  for (const x of [-27, 21.4]) out.push(solid({ x, y: 2.8, w: 5.6, d: 4.2, r: 1.2 }, LID_TOP, 4.2, P, 'mid', 4, 0.4))
  out.push(solid({ x: -23.6, y: 3.4, w: 47.2, d: 3, r: 1.5 }, LID_TOP + 4.2, 3.8, P, 'hi', 6, 0.8))
  // two screws at the front corners of the lid
  for (const x of [-76, 76]) out.push(k.lineSvg(k.ring(x, 28, 1.6, LID_TOP + 0.1, P, 16), { tone: 'faint' }))
  // the hasps last, so they read as clasping over the lid's front edge
  for (const x of HASPS) out.push(haspSvg(x, P))
  out.push('</g>')
  return out.join('')
}

// ---- the stay ------------------------------------------------------------
//
// A folding arm from the back rim up to a bracket on the lid's inner face, so
// the lid reads as held open rather than floating. Two things decide its
// geometry. It has to stand proud of the face, because the lid leans fifteen
// degrees back and anything bolted flush to it would be swallowed by it. And
// it has to fold in x, because the camera looks straight down the y axis, so a
// knee in the y–z plane would project to a straight vertical line.

const STAY_U = 79.5
const STAY_FOOT = [76.5, -33, RIM_Z + 2.4]
const STAY_ELBOW = [82.2, -33.4, RIM_Z + 16.5]
const STAY_HEAD = [STAY_U, -42.8, RIM_Z + 32.3]

/** A thin bar between two points, as a prism with a flat rectangular section. */
function stayBar(from, to, P) {
  const axis = [to[0] - from[0], to[1] - from[1], to[2] - from[2]]
  const [halfW, halfT] = [1.7, 0.75]
  const section = [[-halfT, -halfW], [halfT, -halfW], [halfT, halfW], [-halfT, halfW]]
  return k.solidSvg(G.prismOf(G.frameAlong(from, axis), section, 0, Math.hypot(...axis), P), { tone: 'mid' })
}

/** A pivot pin: a short barrel along `axis`, protruding toward the camera. */
function pinSvg(at, r, len, axis, P) {
  return k.solidSvg(G.disc(0, len, r, G.frameAlong(at, axis), P), { tone: 'lo' })
}

function staySvg(P) {
  const out = ['<g class="home-case-prop">']
  // the foot: a bracket bolted to the back rim, with its hinge barrel
  out.push(solid({ x: STAY_FOOT[0] - 3.1, y: BACK + 0.6, w: 6.2, d: 4.2, r: 1.2 }, RIM_Z, 2.6, P, 'mid', 4, 0.4))
  out.push(pinSvg([STAY_FOOT[0] - 2.6, STAY_FOOT[1], STAY_FOOT[2]], 1.5, 5.2, [1, 0, 0], P))
  out.push(stayBar(STAY_FOOT, STAY_ELBOW, P))
  out.push(stayBar(STAY_ELBOW, STAY_HEAD, P))
  // the fold: a rivet through the elbow, facing the reader
  out.push(pinSvg([STAY_ELBOW[0], STAY_ELBOW[1] + 0.4, STAY_ELBOW[2]], 1.8, 2, [0, 1, 0], P))
  // the head bracket, bolted to the lid's inner face
  out.push(boxSvg(LID, { u: 76.2, v: 32, w: -3.8, uw: 6.6, vd: 7.2, wh: 1.5 }, P, { tone: 'mid' }))
  out.push('</g>')
  return out.join('')
}

// ---- the dial ------------------------------------------------------------
//
// The front-right of the case carries a three-position rotary switch. It is
// drawn the way a real one is built: a boss screwed to the face, a detent
// collar with three index marks, a knurled dial standing proud of the collar,
// a printed pointer on the dial's face, and a ratchet pawl riding the collar's
// edge. The camera looks straight down +y, so the whole switch is a stack of
// discs on the front face and reads face-on.
//
// The pointer is the only moving part. It is emitted as its own group with the
// dial's centre as its transform origin, and toolbox.css rotates it from
// `data-position` on the enclosing `.home-module` — 0 is up-left, 1 up, 2
// up-right, with a springy detent snap.

const DIAL = { x: 62, z: TOP + 24.3, r: 3.9, collar: 5.3, face: 2.5 }
const DIAL_F = G.frameAlong([DIAL.x, FRONT, DIAL.z], [0, 1, 0])
/** Screen degrees from straight up, and the frame angles they project from. */
const DETENTS = [-55, 0, 55]
const MARKS = DETENTS.map((deg) => 90 - deg)

/** A bar lying on the front face, from (x0, z0) to (x1, z1). */
function faceBar(x0, z0, x1, z1, w, y, P) {
  const dx = x1 - x0
  const dz = z1 - z0
  const len = Math.hypot(dx, dz) || 1
  const nx = (-dz / len) * w
  const nz = (dx / len) * w
  return k.pathOf([[x0 + nx, y, z0 + nz], [x1 + nx, y, z1 + nz], [x1 - nx, y, z1 - nz], [x0 - nx, y, z0 - nz]].map((p) => k.iso(p, P)), true)
}

function dialSvg(P) {
  const y = FRONT
  const [cx, cy] = k.iso([DIAL.x, y + DIAL.face, DIAL.z], P)
  const at = (dx, dz) => k.iso([DIAL.x + dx, y + DIAL.face + 0.08, DIAL.z + dz], P)
  const rad = (deg) => (deg * Math.PI) / 180
  const out = [`<g class="home-dial" role="button" tabindex="0" aria-label="切换资源板块" data-position="0">`]

  // the boss the whole switch is mounted on
  out.push(k.solidSvg(G.disc(0, 0.28, DIAL.collar + 0.28, DIAL_F, P), { tone: 'lo', className: 'home-dial-boss' }))
  // the detent collar: one dark plate the dial sits in, so what reads is a
  // single ring with the three marks cut into it
  out.push(k.solidSvg(G.disc(0.28, 0.72, DIAL.collar, DIAL_F, P), { tone: 'lo', className: 'home-dial-collar' }))
  for (const mark of MARKS) {
    out.push(k.lineSvg(k.pathOf([
      k.iso(G.pointOf(DIAL_F, 0.75, DIAL.collar + 0.05, rad(mark)), P),
      k.iso(G.pointOf(DIAL_F, 0.75, DIAL.collar + 0.2, rad(mark)), P),
    ]), { tone: 'mid' }))
    out.push(k.lineSvg(k.pathOf([
      k.iso(G.pointOf(DIAL_F, 0.75, DIAL.r + 0.42, rad(mark)), P),
      k.iso(G.pointOf(DIAL_F, 0.75, DIAL.collar - 0.06, rad(mark)), P),
    ]), { tone: 'mid', className: 'home-dial-tick' }))
  }
  // the knurled dial: a shallow crown on the collar
  out.push(k.solidSvg(G.solidOf([[0.28, DIAL.r - 0.2], [0.8, DIAL.r], [1.85, DIAL.r - 0.15], [DIAL.face, DIAL.r - 0.35]], DIAL_F, P), { tone: 'mid', className: 'home-dial-knob' }))
  out.push(k.lineSvg(G.ribsOf(DIAL_F, 0.42, 1.9, DIAL.r - 0.05, 30, P, { least: 0.06 }), { tone: 'lo' }))
  out.push(k.lineSvg(G.circleOf(DIAL_F, DIAL.face, DIAL.r - 0.35, P), { tone: 'lo' }))

  // the pointer: the one part the detents turn
  out.push(`<g class="home-dial-pointer" style="transform-origin:${num(cx)}px ${num(cy)}px">`)
  out.push(`<path class="home-dial-mark" d="${k.pathOf([
    at(-0.42, -1.0), at(-0.42, 1.5), at(-1.05, 1.5), at(0, 2.95), at(1.05, 1.5), at(0.42, 1.5), at(0.42, -1.0),
  ], true)}"/>`)
  out.push('</g>')
  out.push(k.solidSvg(G.disc(DIAL.face, DIAL.face + 0.14, 0.78, DIAL_F, P), { tone: 'mid' }))

  // the ratchet pawl: a lever on a screw, its tooth riding the dial's rim
  const pivot = [DIAL.x + 6.3, DIAL.z + 2.0]
  const tooth = [DIAL.x + DIAL.r + 0.2, DIAL.z + 0.6]
  out.push(`<path class="home-dial-pawl" d="${faceBar(pivot[0], pivot[1], tooth[0], tooth[1], 0.62, y + 1.05, P)}"/>`)
  out.push(k.lineSvg(faceBar(pivot[0], pivot[1], tooth[0], tooth[1], 0.62, y + 1.06, P), { tone: 'mid' }))
  out.push(k.solidSvg(G.disc(0, 0.9, 1.0, G.frameAlong([pivot[0], y, pivot[1]], [0, 1, 0]), P), { tone: 'lo' }))
  out.push(k.lineSvg(k.segment([pivot[0] - 0.55, y + 1.0, pivot[1]], [pivot[0] + 0.55, y + 1.0, pivot[1]], P), { tone: 'faint' }))
  // its spring, back to a stud on the face
  out.push(k.lineSvg(k.pathOf([k.iso([pivot[0] + 0.9, y + 0.6, pivot[1] + 0.5], P), k.iso([pivot[0] + 2.2, y + 0.6, pivot[1] + 2.2], P)]), { tone: 'faint' }))
  out.push(k.solidSvg(G.disc(0, 0.5, 0.55, G.frameAlong([pivot[0] + 2.2, y, pivot[1] + 2.2], [0, 1, 0]), P), { tone: 'lo' }))

  out.push('</g>')
  return out.join('')
}

// ---- the interior --------------------------------------------------------
//
// Three interchangeable sets. Each one fills the three bays of the well — the
// dividers are part of the case, so every object has to live inside a bay —
// and each is wrapped in its own `.home-tray-set`. Only the set matching the
// module's `data-position` is visible; toolbox.css plays the changeover (the
// old set drops and fades, the new one rises item by item).
//
// Everything is seated on the floor plane FZ. Within a bay the paint order is
// far to near, which for this camera is increasing y, then increasing z.

/** A tapered bar in plan: the compass legs are built from these. */
function legRing(from, to, w0, w1) {
  const [ax, ay] = from
  const [bx, by] = to
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  return [[ax + nx * w0, ay + ny * w0], [bx + nx * w1, by + ny * w1], [bx - nx * w1, by - ny * w1], [ax - nx * w0, ay - ny * w0]]
}

const hexSection = (r) => Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * Math.PI * 2 + Math.PI / 6
  return [r * Math.cos(a), r * Math.sin(a)]
})

/** One object in a set: the wrapper the changeover staggers, the group it hovers. */
const item = (index, cls, inner, origin) =>
  `<g class="home-set-item" style="--i:${index}"><g class="${cls}"${origin ? ` style="transform-origin:${origin}"` : ''}>${inner}</g></g>`

/** An invisible pad so a pencil or a clip can still be pointed at. */
const hitPad = (x0, y0, x1, y1, P) => `<path class="home-set-hit" d="${k.pathOf([[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => k.iso([x, y, FZ], P)), true)}"/>`

// --- set 0 · 工具: the drafting kit ---------------------------------------

/** A steel rule: a thin slab, graduated along its near edge. */
function steelRule(P) {
  const plan = { x: -75, y: -28, w: 62, d: 4.2, r: 0.4 }
  const h = 0.85
  const top = FZ + h + 0.02
  const out = [k.solidSvg(k.slabOf(plan, FZ, h, P, 3, 0.2), { tone: 'mid' })]
  const ticks = k.topTicks(-72.6, -17, 1.15, 5, -23.9, top, [-0.75, -1.5], P, 'x')
  out.push(k.lineSvg(ticks.minor, { tone: 'faint' }))
  out.push(k.lineSvg(ticks.major, { tone: 'lo' }))
  out.push(k.lineSvg(k.segment([-72.6, -24.05, top], [-17, -24.05, top], P), { tone: 'faint' }))
  return out.join('')
}

/** A 30–60 set square: a triangle with its opening cut clean through. */
function setSquare(P) {
  const h = 1.15
  const outer = [[-73, -15], [-31.5, -15], [-73, 9]]
  const inner = [[-68.6, -10.6], [-46.4, -10.6], [-68.6, 1.1]]
  const out = [k.solidSvg(k.extrude(outer, FZ, h, P, { bevel: 0.35 }), { tone: 'mid' })]
  // the opening is the floor showing through, so it takes the floor's own tone
  out.push(flatPlan(inner, FZ + h + 0.04, P, 'home-set-floor'))
  out.push(k.lineSvg(k.pathOf(inner.map(([x, y]) => k.iso([x, y, FZ + h + 0.05], P)), true), { tone: 'lo' }))
  // a graduated edge along the long leg
  const ticks = k.topTicks(-66, -38, 1.6, 5, -13.4, FZ + h + 0.04, [0.6, 1.2], P, 'x')
  out.push(k.lineSvg(ticks.minor, { tone: 'faint' }))
  out.push(k.lineSvg(ticks.major, { tone: 'lo' }))
  return out.join('')
}

/** A pencil lying along x: hex body, wood cone, graphite, ferrule. */
function pencilSvg(x0, x1, y, r, P) {
  const F = G.frameAlong([x0, y, FZ], [1, 0, 0])
  const len = x1 - x0
  return k.solidSvg(G.prismOf(F, hexSection(r), 0, len, P), { tone: 'mid' })
    + k.solidSvg(G.solidOf([[len, r * 0.97], [len + 2.4, r * 0.22]], F, P), { tone: 'hi' })
    + k.solidSvg(G.solidOf([[len + 2.2, r * 0.24], [len + 3.1, 0.02]], F, P), { tone: 'lo' })
    + k.solidSvg(G.solidOf([[1.2, r * 1.02], [3.6, r * 1.02]], F, P), { tone: 'lo' })
}

/** A round brush: a lacquered handle, a metal ferrule, a tapered head. */
function brushSvg(x0, x1, y, P) {
  const F = G.frameAlong([x0, y, FZ + 0.85], [1, 0, 0])
  const len = x1 - x0
  return k.solidSvg(G.solidOf([[0, 0.8], [len * 0.58, 0.68]], F, P), { tone: 'mid' })
    + k.solidSvg(G.solidOf([[len * 0.58, 0.95], [len * 0.74, 0.95]], F, P), { tone: 'hi' })
    + k.solidSvg(G.solidOf([[len * 0.74, 0.92], [len, 0.34]], F, P), { tone: 'lo' })
}

/** A compass: two legs on a hinge barrel, a pencil clamped in the swinging one. */
function compassSvg(P) {
  const pivot = [50, -20]
  const tips = [[43.4, -2.4], [58.6, 1.6]]
  const h = 1.6
  const [px, py] = k.iso([pivot[0], pivot[1], FZ + h / 2], P)
  const out = []
  out.push(k.solidSvg(k.extrude(legRing(pivot, tips[0], 1.75, 0.8), FZ, h, P), { tone: 'mid' }))
  out.push(k.solidSvg(k.cylinder(tips[0][0], tips[0][1], 0.62, FZ, h + 0.4, P, 12), { tone: 'lo' }))
  // the swinging leg, its pencil and the clamp that holds it
  out.push(`<g class="home-compass-arm" style="transform-origin:${num(px)}px ${num(py)}px">`)
  out.push(k.solidSvg(k.extrude(legRing(pivot, tips[1], 1.75, 0.8), FZ, h, P), { tone: 'mid' }))
  const dir = [tips[1][0] - pivot[0], tips[1][1] - pivot[1]]
  const PF = G.frameAlong([tips[1][0], tips[1][1], FZ + h + 0.1], [-dir[0], -dir[1], 0])
  out.push(k.solidSvg(G.solidOf([[0, 0.62], [3.4, 0.55]], PF, P), { tone: 'hi' }))
  out.push(k.solidSvg(G.solidOf([[3.4, 0.5], [4.3, 0.04]], PF, P), { tone: 'lo' }))
  out.push(k.solidSvg(k.slabOf({ x: tips[1][0] - 1.6, y: tips[1][1] - 1.6, w: 3.2, d: 3.2, r: 0.8 }, FZ + h, 0.5, P, 3, 0.2), { tone: 'mid' }))
  out.push('</g>')
  // the hinge barrel closes over both legs
  out.push(k.solidSvg(k.cylinder(pivot[0], pivot[1], 1.9, FZ, 2.7, P, 18), { tone: 'hi' }))
  out.push(k.lineSvg(k.sideArc(pivot[0], pivot[1], 1.9, FZ + 2.7, P, 16), { tone: 'lo' }))
  out.push(k.solidSvg(k.cylinder(pivot[0], pivot[1], 0.75, FZ + 2.7, 0.8, P, 12), { tone: 'mid' }))
  return { svg: out.join(''), pivot: [px, py] }
}

/** A block eraser with a paper sleeve round its middle. */
function eraserSvg(P) {
  const plan = { x: 62.5, y: -7.5, w: 12.5, d: 7.4, r: 1.2 }
  const h = 2.9
  const out = [k.solidSvg(k.slabOf(plan, FZ, h, P, 4, 0.45), { tone: 'mid' })]
  // the sleeve: a printed band, a step darker than the rubber
  out.push(flatPlan(k.ringOf({ x: 66.2, y: -7.5, w: 4.8, d: 7.4, r: 0.3 }, 3), FZ + h + 0.04, P, 'home-set-s1'))
  out.push(k.lineSvg(k.planOutline({ x: 66.2, y: -7.5, w: 4.8, d: 7.4, r: 0.3 }, FZ + h + 0.05, P, 3), { tone: 'faint' }))
  out.push(k.lineSvg(k.segment([66.2, -0.1, FZ + 0.1], [66.2, -0.1, FZ + h], P), { tone: 'faint' }))
  out.push(k.lineSvg(k.segment([71, -0.1, FZ + 0.1], [71, -0.1, FZ + h], P), { tone: 'faint' }))
  return out.join('')
}

function setTools(P) {
  const compass = compassSvg(P)
  const a = [
    item(0, 'home-rule', steelRule(P)),
    item(1, 'home-setsquare', setSquare(P)),
  ]
  const b = [
    item(2, 'home-pencil', pencilSvg(0, 26, -22.6, 1.3, P) + hitPad(-1, -24.6, 30, -20.6, P)),
    item(3, 'home-pencil', pencilSvg(1.6, 29.6, -16.4, 1.25, P) + hitPad(0.6, -18.3, 33.6, -14.5, P)),
    item(4, 'home-pencil', pencilSvg(3, 33.2, -10.2, 1.2, P) + hitPad(2, -12, 36.6, -8.4, P)),
    item(5, 'home-brush', brushSvg(4.5, 34.5, -3.4, P) + hitPad(3.5, -4.9, 35, -1.9, P)),
  ]
  const c = [
    item(6, 'home-compass', compass.svg + hitPad(41, -22, 62, 4, P), `${num(compass.pivot[0])}px ${num(compass.pivot[1])}px`),
    item(7, 'home-eraser', eraserSvg(P) + hitPad(62, -8.2, 76, 0.4, P)),
  ]
  return [a, b, c]
}

// --- set 1 · 学习: books and paper ----------------------------------------

/** A closed book: boards, a raised spine, the page block, a ribbon. */
function bookSvg(P) {
  const plan = { x: -76, y: -26, w: 42, d: 25, r: 1.2 }
  const h = 5
  const out = [k.solidSvg(k.slabOf(plan, FZ, h, P, 5, 0.8), { tone: 'mid' })]
  // the page block, a hair proud on the fore-edge
  out.push(k.solidSvg(k.slabOf({ x: -74.2, y: -1.4, w: 38.4, d: 2.2, r: 0.3 }, FZ + 0.55, h - 1.1, P, 2, 0.2), { tone: 'lo' }))
  // the spine, standing proud along the bound edge
  out.push(k.solidSvg(k.slabOf({ x: -76.5, y: -26, w: 3.8, d: 25, r: 1.1 }, FZ, h + 1, P, 4, 0.5), { tone: 'mid' }))
  // the cover's rule and its title panel
  out.push(k.lineSvg(k.planOutline({ x: -69.6, y: -23.4, w: 31.6, d: 19.4, r: 0.8 }, FZ + h + 0.06, P, 3), { tone: 'faint' }))
  out.push(flatPlan(k.ringOf({ x: -66, y: -20.4, w: 16, d: 4.4, r: 0.4 }, 2), FZ + h + 0.07, P, 'home-set-s1'))
  out.push(flatPlan(k.ringOf({ x: -66, y: -14, w: 24, d: 1.5, r: 0.3 }, 2), FZ + h + 0.07, P, 'home-set-s2'))
  // the ribbon, lying back over the cover and over the fore-edge
  out.push(flatPlan(k.ringOf({ x: -52, y: -12, w: 1.9, d: 13.6, r: 0.2 }, 2), FZ + h + 0.1, P, 'home-set-s3'))
  out.push(paint(k.pathOf([
    [-52, -1.1, FZ + 1.2], [-50.05, -1.1, FZ + 0.4], [-48.1, -1.1, FZ + 1.2],
    [-48.1, -1.1, FZ + h + 0.12], [-52, -1.1, FZ + h + 0.12],
  ].map((p) => k.iso(p, P)), true), 2, 'mid'))
  return out.join('')
}

/** The memo pad: a block, a torn top sheet and the clip that binds it. */
function memoPad(P) {
  const plan = { x: 1.5, y: -28, w: 16.5, d: 30, r: 0.8 }
  const h = 3.2
  const out = [k.solidSvg(k.slabOf(plan, FZ, h, P, 4, 0.4), { tone: 'mid' })]
  // the block: the sheet edges read as lines down the near face
  for (let i = 1; i < 6; i++)
    out.push(k.lineSvg(k.segment([plan.x + 0.5, plan.y + plan.d, FZ + (i * h) / 6], [plan.x + plan.w - 0.5, plan.y + plan.d, FZ + (i * h) / 6], P), { tone: 'lo' }))

  // the top sheet, torn along its near edge and left ragged over the block
  const front = plan.y + plan.d
  const ring = [[plan.x, plan.y], [plan.x + plan.w, plan.y], [plan.x + plan.w, front + 1]]
  const tears = 8
  for (let i = 1; i <= tears; i++) {
    const t = i / tears
    ring.push([plan.x + plan.w - t * plan.w, front + (i === tears ? 0.4 : i % 2 ? 2 : 0.45)])
  }
  out.push(k.solidSvg(k.extrude(ring, FZ + h, 0.42, P, { convex: false }), { tone: 'mid' }))
  const paper = FZ + h + 0.46
  for (const y of [-22.5, -17, -11.5])
    out.push(k.lineSvg(k.segment([plan.x + 1.8, y, paper], [plan.x + plan.w - 1.8, y, paper], P), { tone: 'faint' }))

  // the bulldog clip, clamping the bound edge at the back
  out.push(solid({ x: plan.x + 3.6, y: plan.y - 0.4, w: 6.8, d: 3.4, r: 1 }, paper, 1.3, P, 'mid', 4, 0.4))
  out.push(topPlan({ x: plan.x + 3.6, y: plan.y - 0.4, w: 6.8, d: 3.4, r: 1 }, paper + 1.34, P, 0, 'mid'))
  for (const dx of [0.5, 4.9])
    out.push(topRect(plan.x + 3.6 + dx, plan.y + 1.6, plan.x + 3.6 + dx + 1.4, plan.y + 2.6, paper + 1.36, P, 2, 'mid'))
  return out.join('')
}

/** A paper clip: one wire, doubled back on itself. */
function clipSvg(cx, cy, P) {
  const at = (u, v) => k.iso([cx + u, cy + v, FZ + 0.12], P)
  const d = k.pathOf([
    at(0, 4.4), at(-1.5, 4.4), at(-2.6, 3.3), at(-2.6, 1.6), at(-2.6, -1.9),
    at(-2.6, -3.4), at(-1.4, -4.4), at(0, -4.4), at(1.4, -4.4), at(2.6, -3.4), at(2.6, -1.9),
    at(2.6, 2.1), at(2.6, 3.4), at(1.6, 4.2), at(0.6, 4.2), at(-0.5, 4.2), at(-1.4, 3.3), at(-1.4, 2.1),
    at(-1.4, -1.4),
  ])
  return `<path class="home-clip-wire" d="${d}"/>`
}

/** A magnifier: a lens ring, its glass, and a turned handle. */
function magnifierSvg(P) {
  const cx = 48
  const cy = -19
  const z = FZ
  const out = []
  const F = G.frameAlong([cx, cy, z], [0, 0, 1])
  // the handle first, so the ring closes over where they meet
  out.push(k.solidSvg(k.extrude(legRing([cx + 4.2, cy], [cx + 14.4, cy], 1.5, 1.15), z, 1.9, P), { tone: 'mid' }))
  out.push(k.solidSvg(G.ringBand(0, 2.1, 3.9, 5.0, F, P), { tone: 'hi' }))
  // the frame's face, a step off the glass, so the lens reads as a ring
  out.push(flat(k.ring(cx, cy, 5.0, z + 2.12, P, 28), 'home-set-s1', 'lo'))
  out.push(flat(k.ring(cx, cy, 3.9, z + 2.14, P, 28), 'home-set-s3'))
  // the rim itself: a heavy line, because a step of the palette is too small a
  // difference to read at five units across
  out.push(k.lineSvg(k.ring(cx, cy, 4.45, z + 2.15, P, 28), { tone: 'hi', className: 'home-lens-rim' }))
  // one highlight across the glass
  out.push(k.lineSvg(k.segment([cx - 2.6, cy - 2.4, z + 2.16], [cx + 0.4, cy + 2.9, z + 2.16], P), { tone: 'lo' }))
  return out.join('')
}

/** A sheet folded once, the near half turned back over the far one. */
function foldedSheet(P) {
  const z = FZ
  const y0 = -14
  const d = 12
  const out = []
  // the flat half, then the crease, then the half that stands a little proud
  out.push(flatPlan(k.ringOf({ x: 42, y: y0, w: 12.4, d, r: 0.4 }, 2), z + 0.06, P, 'home-set-paper', 'lo'))
  out.push(flatPlan(k.ringOf({ x: 54.2, y: y0, w: 12.4, d, r: 0.4 }, 2), z + 0.1, P, 'home-set-s3', 'lo'))
  out.push(k.lineSvg(k.segment([54.2, y0, z + 0.12], [54.2, y0 + d, z + 0.12], P), { tone: 'lo' }))
  // the shadow the turned-back half throws along the crease
  out.push(flatPlan(k.ringOf({ x: 54.2, y: y0, w: 0.7, d, r: 0 }, 1), z + 0.11, P, 'home-set-s2'))
  out.push(k.lineSvg(k.segment([56.4, y0 + 2, z + 0.14], [64.6, y0 + 2, z + 0.14], P), { tone: 'faint' }))
  out.push(k.lineSvg(k.segment([56.4, y0 + 4.4, z + 0.14], [64.6, y0 + 4.4, z + 0.14], P), { tone: 'faint' }))
  // the corner turned down, a step darker than the sheet
  out.push(flatPlan([[64.2, y0 + d - 0.2], [66.6, y0 + d - 0.2], [66.6, y0 + d - 2.6]], z + 0.16, P, 'home-set-s2', 'lo'))
  return out.join('')
}

function setStudy(P) {
  const a = [item(0, 'home-book', bookSvg(P))]
  const b = [
    item(1, 'home-memo', memoPad(P)),
    item(2, 'home-clip', clipSvg(26, -15, P) + hitPad(22.4, -20.4, 29.6, -9.6, P)),
    item(3, 'home-clip', clipSvg(30, -6.5, P) + hitPad(26.4, -11.9, 33.6, -1.1, P)),
  ]
  const c = [
    item(4, 'home-magnifier', magnifierSvg(P) + hitPad(42.4, -24.6, 63.6, -13.4, P)),
    item(5, 'home-sheet', foldedSheet(P)),
  ]
  return [a, b, c]
}

// --- set 2 · 作者: cards and film -----------------------------------------

const PCARD = { w: 12, h: 10, t: 0.9 }

/** A photo card: a print with a white margin, standing in the fan. */
function photoCard(cx, cy, yaw, P) {
  const F = frameOf({ yaw, origin: [cx, cy, FZ + 0.3] })
  const face = 0.46
  const out = [boxSvg(F, { u: -PCARD.w / 2, v: -PCARD.t / 2, w: 0, uw: PCARD.w, vd: PCARD.t, wh: PCARD.h }, P, { tone: 'mid' })]
  const front = facePath(F, [[-PCARD.w / 2, face, 0], [PCARD.w / 2, face, 0], [PCARD.w / 2, face, PCARD.h], [-PCARD.w / 2, face, PCARD.h]], P)
  out.push(`<path class="iso-top" d="${front}"/>${k.lineSvg(front, { tone: 'mid' })}`)
  // the print: a darker block inside a white margin, and a caption rule under it
  out.push(`<path class="home-photo" d="${facePath(F, [[-4.5, face, 3.2], [4.5, face, 3.2], [4.5, face, 8.7], [-4.5, face, 8.7]], P)}"/>`)
  out.push(k.lineSvg(k.segment(F.at(-3.4, face, 1.6), F.at(3.4, face, 1.6), P), { tone: 'faint' }))
  return out.join('')
}

/** A strip of film, turned a few degrees and lying across its bay. */
function filmStrip(P) {
  const F = frameOf({ yaw: -9, origin: [17, -21, FZ] })
  const w = 34
  const d = 7.2
  const top = 0.5
  const face = (u0, v0, u1, v1, cls, tone) =>
    flat(facePath(F, [[u0, v0, top], [u1, v0, top], [u1, v1, top], [u0, v1, top]], P), cls, tone)
  const out = []
  out.push(boxSvg(F, { u: -w / 2, v: -d / 2, w: 0, uw: w, vd: d, wh: top }, P, { tone: 'mid' }))
  // the emulsion: the whole strip is ink. The perforations are the bright marks
  // and the frames sit a step off the base — the other way round, and the strip
  // reads as a row of windows instead of a length of film.
  out.push(face(-w / 2, -d / 2, w / 2, d / 2, 'home-set-ink'))
  for (let i = 0; i < 7; i++) {
    const u = -w / 2 + 2.6 + i * 4.3
    out.push(face(u, -d / 2 + 0.5, u + 1.15, -d / 2 + 1.25, 'home-set-paper'))
    out.push(face(u, d / 2 - 1.25, u + 1.15, d / 2 - 0.5, 'home-set-paper'))
    out.push(face(u - 0.1, -d / 2 + 1.7, u + 1.45, d / 2 - 1.7, 'home-film-frame'))
  }
  out.push(k.lineSvg(facePath(F, [[-w / 2, -d / 2, top + 0.02], [w / 2, -d / 2, top + 0.02], [w / 2, d / 2, top + 0.02], [-w / 2, d / 2, top + 0.02]], P), { tone: 'lo' }))
  return out.join('')
}

/** A rubber stamp: a block, a rubber pad and a turned handle. */
function stampSvg(P) {
  const plan = { x: 53, y: -20.5, w: 12.4, d: 10.4, r: 1.4 }
  const h = 3.4
  const out = [k.solidSvg(k.slabOf(plan, FZ, h, P, 4, 0.5), { tone: 'mid' })]
  // the rubber, a hair proud under the block
  out.push(k.solidSvg(k.slabOf({ x: 54.2, y: -19.3, w: 10, d: 8, r: 1 }, FZ, 0.55, P, 3, 0.2), { tone: 'lo' }))
  // the handle: a turned mushroom on the block
  const H = G.frameAlong([59.2, -15.3, FZ + h], [0, 0, 1])
  out.push(k.solidSvg(G.solidOf([[0, 3.0], [0.7, 2.7], [1.9, 1.5], [3.0, 1.3], [3.8, 1.6], [4.5, 1.0]], H, P), { tone: 'mid' }))
  out.push(k.lineSvg(G.arcOf(H, 4.5, 1.0, P), { tone: 'faint' }))
  return out.join('')
}

/** A roll of tape, wound flat, with its core cut out. */
function tapeSvg(P) {
  const cx = 70
  const cy = -2
  const F = G.frameAlong([cx, cy, FZ], [0, 0, 1])
  const out = [k.solidSvg(G.ringBand(0, 2.4, 3.1, 6.0, F, P), { tone: 'mid' })]
  // the core: the floor showing through the middle
  out.push(flat(k.ring(cx, cy, 3.1, FZ + 2.42, P, 32), 'home-set-floor', 'lo'))
  // the wound layers, as two rings on the top face
  out.push(k.lineSvg(k.ring(cx, cy, 4.2, FZ + 2.44, P, 32), { tone: 'faint' }))
  out.push(k.lineSvg(k.ring(cx, cy, 5.2, FZ + 2.44, P, 32), { tone: 'faint' }))
  out.push(k.lineSvg(k.ring(cx, cy, 6.0, FZ + 2.44, P, 32), { tone: 'lo' }))
  return out.join('')
}

function setAuthor(P) {
  const fan = [
    [-68, -24.5, -13],
    [-59.4, -22.6, -6.5],
    [-50.8, -20.7, 0],
    [-42.2, -18.8, 6.5],
    [-33.6, -16.9, 13],
  ]
  const a = fan.map(([cx, cy, yaw], i) => item(i, 'home-photo-card', photoCard(cx, cy, yaw, P)))
  const b = [item(5, 'home-film', filmStrip(P) + hitPad(0, -27, 34, -14, P))]
  const c = [
    item(6, 'home-stamp', stampSvg(P) + hitPad(52, -21.5, 66.4, -9.1, P)),
    item(7, 'home-tape', tapeSvg(P) + hitPad(63.4, -8.6, 76.6, 4.6, P)),
  ]
  return [a, b, c]
}

/** One set, wrapped so the dial can swap it. Each bay carries the axis its own
 *  tray is lowered along, because a set is three drops, not one. */
function traySet(index, bays, axes) {
  return `<g class="home-tray-set" data-set="${index}">${bays
    .map((body, bay) => `<g class="home-case-tray" data-index="${bay}" style="${axes[bay]}">${body}</g>`)
    .join('')}</g>`
}

// ---- the case -----------------------------------------------------------
//
// The case is built, not faded in. toolbox.css owns the clock; this file only
// decides which paths travel together, and the order a real case would go
// together in:
//
//   pads    four rubber pads on the deck
//   plinth  the machined base, lowered onto them
//   walls   back → left → right, each stood up in its own rebate
//   near    the near wall, the last panel, which closes the body
//   parts   two partitions dropped into their slots
//   hinge   knuckles, pin and end caps on the back rim
//   shut    the slab the reader meets, lowered onto the rim
//   …       then it opens and the index on its face is pinned up chip by chip
//
// The runs are contiguous stretches of what already painted together, so the
// split changes no painter's order — only which assembly a path belongs to.
// The lid, its board, the stay and the shut slab keep their own transitions
// and are wrapped around, never marked.

/** The four pads, left to right. They clear the carry handle's mounts. */
const PADS = [-72, -38, 38, 72]
/** The nameplate on the near panel: right of the latch, clear of the switch. */
const PLATE = [18, TOP + 21.6, 52, TOP + 28.2]

export function buildToolbox(P, options = {}) {
  const labels = options.labels || ['工具', '学习', '作者']

  // --- the plinth ---------------------------------------------------------
  // A thick machined base, so the trays sit in a shallow well. The well floor
  // is the base's own top face, so it lands with it.
  const plinth = [
    solid(SHELL, TOP, BASE_H, P, 'mid', 6, 1.2),
    topRect(IN.x0, IN.y0, IN.x1, IN.y1, FLOOR_Z + 0.06, P, 0),
  ]

  // --- the three far walls ------------------------------------------------
  // The back wall carries its own shaded inner face, so the well has a lit
  // surface behind the trays instead of the wall's raw shade.
  const back = [
    solid({ x: SHELL.x, y: BACK, w: SHELL.w, d: WALL, r: 1 }, FLOOR_Z, RIM_Z - FLOOR_Z, P, 'mid'),
    faceQuad([[-79, BACK + WALL - 0.2, FLOOR_Z], [79, BACK + WALL - 0.2, FLOOR_Z], [79, BACK + WALL - 0.2, RIM_Z], [-79, BACK + WALL - 0.2, RIM_Z]], P, 1),
  ]
  for (const z of [99.5, 101.8])
    back.push(k.lineSvg(k.segment([-78, BACK + WALL - 0.1, z], [78, BACK + WALL - 0.1, z], P), { tone: 'faint' }))
  const walls = [
    back,
    [solid({ x: SHELL.x, y: BACK, w: WALL, d: SHELL.d, r: 1 }, FLOOR_Z, RIM_Z - FLOOR_Z, P, 'mid')],
    [solid({ x: SHELL.x + SHELL.w - WALL, y: BACK, w: WALL, d: SHELL.d, r: 1 }, FLOOR_Z, RIM_Z - FLOOR_Z, P, 'mid')],
  ]
  // Each wall is raised out of its own rebate: the axis is the vertical through
  // its base line, so it folds about the base and its start pose sits inside the
  // plinth it is standing in.
  const wallAxis = [
    [0, BACK + WALL / 2, FLOOR_Z],
    [SHELL.x + WALL / 2, 0, FLOOR_Z],
    [SHELL.x + SHELL.w - WALL / 2, 0, FLOOR_Z],
  ].map((seat) => stroke(P, seat, [0, 0, 1], (RIM_Z - FLOOR_Z) / 2, 6))

  // --- the partitions -----------------------------------------------------
  // Two full-height dividers make the three bays. Each carries a machined rail
  // on top: the rail is the part that reads at homepage scale, and it is what
  // the shut lid actually lands on.
  const dividers = DIVIDERS.map((x) => [
    solid({ x, y: IN.y0, w: 2, d: IN.y1 - IN.y0, r: 0.5 }, FLOOR_Z, RIM_Z - FLOOR_Z, P, 'mid'),
    solid({ x: x - 0.9, y: IN.y0, w: 3.8, d: IN.y1 - IN.y0, r: 0.9 }, RIM_Z - 2.4, 2.4, P, 'hi', 4, 0.5),
  ])

  // --- the hinge ----------------------------------------------------------
  // Two knuckles stand on the back rim, a pin runs the length of it and a
  // turned cap closes each end. The pin is what makes the two blocks read as
  // one hinge instead of two brackets — and it is drawn here, outside the lid
  // group, because a barrel does not turn with the leaf it carries. Knuckles
  // and pin are separate runs: the blocks are dropped on the rim first, then
  // the pin is driven through them, which is the only way the two read as one
  // hinge rather than as a bracket that grows out of the rim.
  const hinge = []
  for (const x of [-64, 50]) {
    hinge.push(solid({ x, y: BACK + 0.6, w: 14, d: 4.6, r: 1.4 }, RIM_Z, 2.6, P, 'mid', 4, 0.4))
    hinge.push(k.lineSvg(k.segment([x + 4.4, BACK + 0.6, RIM_Z + 2.65], [x + 4.4, BACK + 5.1, RIM_Z + 2.65], P), { tone: 'lo' }))
  }
  const PIN = { y: BACK + 2.4, z: RIM_Z + 1.5, r: 0.85 }
  const pin = [k.solidSvg(G.solidOf([[0, PIN.r], [160, PIN.r]], G.frameAlong([-80, PIN.y, PIN.z], [1, 0, 0]), P), { tone: 'lo' })]
  for (const [x, dir] of [[-80, -1], [80, 1]])
    pin.push(k.solidSvg(G.disc(0, 2.2, 1.55, G.frameAlong([x, PIN.y, PIN.z], [dir, 0, 0]), P), { tone: 'mid' }))

  // --- the three sets -----------------------------------------------------
  // A set is three drops, not one: each bay's tray is lowered into its own
  // slot, so each bay carries the vertical through its own centre.
  const trayAxis = TRAY_X.map(([a, b]) => stroke(P, [(a + b) / 2, 0, FZ], [0, 0, -1], 5, 20))
  const trays = [setTools(P), setStudy(P), setAuthor(P)].map((bays, index) => traySet(index, bays, trayAxis))

  // --- the near wall ------------------------------------------------------
  // It closes the case and hides the near half of the sets, so it is the last
  // panel and gets its own beat.
  const front = [
    solid({ x: SHELL.x, y: IN.y1, w: SHELL.w, d: WALL, r: 1 }, TOP, RIM_Z - TOP, P, 'mid', 4, 1),
    k.lineSvg(k.planOutline(k.insetPlan(SHELL, 3.6), RIM_Z + 0.5, P, 6), { tone: 'faint' }),
    k.lineSvg(k.planOutline({ x: IN.x0, y: IN.y0, w: IN.x1 - IN.x0, d: IN.y1 - IN.y0, r: 2 }, RIM_Z + 0.4, P, 4), { tone: 'faint' }),
  ]

  // --- the hardware -------------------------------------------------------
  const hardware = [
    // the latch, with the slot the hasps drop into
    solid({ x: -10, y: FRONT - 2.2, w: 20, d: 2.4, r: 1 }, TOP + 22, 7, P, 'mid', 4, 0.5),
    frontRect(-4.5, TOP + 24.5, 4.5, TOP + 26.5, FRONT + 0.3, P, 0, 'lo'),
  ]
  // the carry handle, folded onto two mounts
  for (const x of [-25, 19]) hardware.push(solid({ x, y: FRONT - 0.6, w: 6, d: 4.6, r: 1 }, TOP + 1, 8, P, 'mid'))
  hardware.push(solid({ x: -21, y: FRONT + 1.2, w: 42, d: 3.4, r: 1.6 }, TOP + 3.5, 6, P, 'hi', 6, 0.8))

  // --- the legend ---------------------------------------------------------
  // Three engraved plates, one per seat of the dial, each with its label and a
  // small indicator lamp. toolbox.css lights the lamp and the label of whichever
  // seat the knob is standing on, so the switch has a legend. Each plate is its
  // own run, so the legend goes on one bay at a time instead of arriving as a
  // single strip.
  const seats = []
  TRAY_X.forEach(([a, b], i) => {
    const seat = [`<g class="home-seat" data-seat="${i}">`]
    seat.push(k.lineSvg(k.pathOf([[a + 3, FRONT + 0.2, TOP + 10], [b - 3, FRONT + 0.2, TOP + 10], [b - 3, FRONT + 0.2, TOP + 17], [a + 3, FRONT + 0.2, TOP + 17]].map((p) => k.iso(p, P)), true), { tone: 'faint', className: 'home-seat-plate' }))
    const lamp = G.frameAlong([a + 6.6, FRONT + 0.3, TOP + 13.5], [0, 1, 0])
    seat.push(`<path class="home-seat-lamp" d="${G.circleOf(lamp, 0, 1.05, P, 16)}"/>`)
    seat.push(k.lineSvg(G.circleOf(lamp, 0.02, 1.05, P, 16), { tone: 'faint' }))
    if (labels[i])
      seat.push(`<g class="home-seat-label">${k.faceTextSvg(k.sideMatrix([TRAY_MID[i], FRONT], TOP + 13.5, P, 'left'), labels[i], { size: 2.6, tone: 'mid', anchor: 'middle' })}</g>`)
    seat.push('</g>')
    seats.push(part('tb-seat', i, stroke(P, [TRAY_MID[i], FRONT, TOP + 13.5], [0, -1, 0], 5, 10), seat))
  })

  // --- the nameplate ------------------------------------------------------
  // The one place on the near panel a case of this size would carry its maker's
  // mark: a stamped plate, riveted at the corners, with the type code on it.
  // The rivets are their own runs: the plate is slid into its recess first and
  // then each corner is set, which is the order the plate would be fixed in.
  const [p0, pz0, p1, pz1] = PLATE
  const py = FRONT + 0.3
  const plateQuad = (dx, dz, dy = 0) => k.pathOf([
    [p0 + dx, py + dy, pz0 + dz], [p1 - dx, py + dy, pz0 + dz],
    [p1 - dx, py + dy, pz1 - dz], [p0 + dx, py + dy, pz1 - dz],
  ].map((p) => k.iso(p, P)), true)
  const plate = [
    `<path class="home-tb-plate" d="${plateQuad(0, 0)}"/>`,
    k.lineSvg(plateQuad(0, 0), { tone: 'lo' }),
    k.lineSvg(plateQuad(1.4, 1.4, 0.02), { tone: 'faint' }),
    frontText(p0 + 3.4, pz1 - 2.1, 'TOOL CASE', 1.9, 'lo', P),
    frontText(p0 + 3.4, pz0 + 2.0, 'TB-04', 2.9, 'mid', P),
  ]
  const rivets = []
  for (const x of [p0 + 1.8, p1 - 1.8])
    for (const z of [pz0 + 1, pz1 - 1])
      rivets.push(part('tb-rivet', rivets.length, stroke(P, [x, py, z], [0, -1, 0], 2.5, 5), [k.lineSvg(faceCircle(x, z, 0.62, py + 0.03, P), { tone: 'faint' })]))

  // --- the switch ---------------------------------------------------------
  const dial = [dialSvg(P)]

  // --- the pads -----------------------------------------------------------
  // The deck is at TOP and the plinth's underside is flush with it, so there is
  // no room *under* the body for a foot. The pads sit against the plinth's
  // front band and stand proud of the panel: that is where they read from a
  // camera looking straight down +y, and where they would be on a real case.
  // They are laid down first and the case is lowered onto them.
  const pads = PADS.map((cx, index) =>
    part('tb-foot', index, stroke(P, [cx, FRONT + 1, TOP], [0, 0, 1], 1.7, 22), [solid({ x: cx - 7.5, y: FRONT - 0.4, w: 15, d: 2.8, r: 1.2 }, TOP, 3.4, P, 'lo', 4, 0.5)]))

  // the shut slab: the only thing in its run, and the last thing painted
  const closed = [closedLidSvg(P)]

  // the stay sits in front of the lid's face and on the rim, so it comes after
  // the body; the shut lid comes last of all and covers the whole interior
  return [
    // the open lid is one piece — shell, board and every chip on it — so it is
    // wrapped in a part of its own. Its entry stays the hinge transition below;
    // the wrapper exists so the exit can take the whole lid away with the case
    // instead of leaving it hanging in the air while everything else drops.
    part('tb-lid', 0, '', [lidSvg(P)]),
    part('shell', 0, stroke(P, [0, 0, TOP], [0, 0, -1], BASE_H / 2, 46), plinth),
    ...walls.map((wall, index) => part('tb-wall', index, wallAxis[index], wall)),
    part('tb-hinge', 0, stroke(P, [0, BACK + 2.9, RIM_Z], [0, 0, -1], 4, 16), hinge),
    part('tb-pin', 0, stroke(P, [0, PIN.y, PIN.z], [1, 0, 0], 80, 14), pin),
    ...dividers.map((divider, index) => part('tb-divider', index, stroke(P, [DIVIDERS[index] + 1, 0, (FLOOR_Z + RIM_Z) / 2], [0, 0, -1], 3.5, 26), divider)),
    part('trays', 0, '', trays),
    part('front', 0, stroke(P, [SHELL.x, FRONT - WALL / 2, TOP + 15], [0, 0, 1], 15, 5), front),
    ...pads,
    part('tb-hardware', 0, stroke(P, [0, FRONT, RIM_Z], [0, -1, 0], 8, 6), hardware),
    ...seats,
    part('tb-plate', 0, stroke(P, [(p0 + p1) / 2, py, (pz0 + pz1) / 2], [0, -1, 0], 5, 12), plate),
    ...rivets,
    part('tb-dial', 0, stroke(P, [DIAL.x, FRONT, DIAL.z], [0, -1, 0], 3, 14), dial),
    // the stay is bolted to the rim and leans on the lid's face; it is a part of
    // its own so the exit takes it down with the case instead of leaving a rod
    // standing in the air
    part('tb-stay', 0, '', [staySvg(P)]),
    part('closed', 0, stroke(P, [0, 0, RIM_Z], [0, 0, -1], 4, 34), closed),
  ].join('')
}

export function toolboxBounds() {
  const out = [...k.boxCorners(SHELL, TOP, RIM_Z)]
  for (const u of [-84, 84])
    for (const v of [0, LID_H])
      for (const w of [-4.6, 2]) out.push(LID.at(u, v, w))
  out.push([SHELL.x, FRONT + 4.6, TOP + 3], [SHELL.x + SHELL.w, FRONT + 4.6, TOP + 3])
  return out
}
