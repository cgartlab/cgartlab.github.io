/**
 * The wall, once it has been papered.
 *
 * The printer deals one sheet per tag and sticks them up; what the tag page is
 * actually about is the *links* between those tags, and a wall of paper cannot
 * show them — a sheet cannot be dragged toward another sheet without leaving a
 * hole in the wall. So after the last sheet is pressed on, the sheets gather
 * into nodes and the wall becomes the net: nodes drifting on their own slow
 * orbits, links arriving last, from nothing to a whisper.
 *
 * Three things make this cheap enough to run beside the rest of the stage, and
 * they are the reasons for the shape of the code rather than incidental
 * detail:
 *
 * 1. **The canvas is a `<foreignObject>` inside `.home-tag-wall`, beside the
 *    `.home-tag-paper` group.** It then shares the wall's user space and the
 *    wall's own CSS scale, which `fitWall()` writes for a phone (up to 2.2x
 *    about the foot). A canvas positioned in the page would have to re-derive
 *    all of that on every resize, rotation and swap; here it is free, and it
 *    inherits the stage's feather mask and the zoom for the same reason.
 * 2. **The sheets give the net its box, not its seats.** `getBBox()` over
 *    `.home-tag-paper` is measured twice: once when the net is created, and
 *    again at the gather, because the wall is still being papered over the
 *    first ~10 s and the sheets in flight are not where they land. The nodes
 *    are laid on a sunflower spiral inside an ellipse drawn over that box,
 *    which is what makes the net a shape instead of the rectangle the sheets
 *    were dealt into. What the build does give the net is the *weights* (how
 *    many posts carry each tag) as `data-uses`, and the full tag name as
 *    `data-tag` for the hover label.
 * 3. **Nothing is drawn per node per frame beyond a circle.** The net is 38
 *    nodes and ~68 links; the loop is capped at 30 fps and stops on its own
 *    when the stage scrolls away or the tab is hidden, because a decorative
 *    net that keeps a phone awake is a bug, not a feature.
 *
 * Reduced motion gets the settled picture — gathered sheets, links at their
 * final strength, no drift, no loop.
 */

const SVG_NS = 'http://www.w3.org/2000/svg'
const XHTML_NS = 'http://www.w3.org/1999/xhtml'

const WALL = '.home-tag-wall'
// the sheets alone: the net's own canvas is a sibling inside the wall, so
// measuring the wall would count what it is about to draw
const PAPER = '.home-tag-paper'
const TICKET = '.home-ticket'
const MODULE = '.home-module[data-module="tags"]'
const GATHERED = 'is-gathered'
const GRAPH = 'home-tag-graph'
/** ?perf=1 leaves the net's own timing marks for the probe */
const PERF = /[?&]perf\b/.test(location.search)
const mark = (name: string): void => {
  if (PERF)
    performance.mark(name)
}

/**
 * A sheet's flight is over this long after its own `--fly-delay`: the emerge
 *  runs 1500 ms and the press starts 1420 ms in for 300 ms.
 */
const STICK_END = 1720
/** a beat of stillness on a full wall before the sheets start to gather */
const GATHER_AFTER = 420
/** the nodes come in while the sheets are still shrinking, so nothing blinks */
const NODE_AFTER = 220
const NODE_RAMP = 620
/** links last, and slowly: a suggestion, not a diagram */
const EDGE_AFTER = 980
const EDGE_RAMP = 1300
const EDGE_ALPHA = 0.1
/** the same compact query the stage uses: phones and touch-only screens */
const COMPACT = '(max-width: 899px), (hover: none)'
/** the net's budget on a desktop GPU, and on a phone */
const FRAME_HZ = 30
const FRAME_HZ_COMPACT = 24
/** the drop that a device which cannot hold the phone budget falls back to */
const FRAME_HZ_FLOOR = 20
/** bitmap density ceiling: the own pixels of the wall, and a phone's share */
const RATIO_CAP = 4
const RATIO_CAP_COMPACT = 2
/** nearest-neighbour links per node, and the ceiling on a busy hub */
const LINKS = 3
const LINKS_HUB = 8
const LINKS_NODE = 6
/** a net, not a constellation: ~68 links over 38 nodes, ~3–4 per node */
const EDGE_TARGET = 68
/**
 * The wall's node budget. A knowledge net, not a star field: the previous ninety
 * read as visual noise on a 645×305 wall (a reader called it 密集恐惧 on
 * 2026-11-05). Every tag still gets its own node — what moves is the filler.
 */
const NODE_TARGET = 38
const SEED = 0x9E3779B9

interface Node {
  x: number
  y: number
  r: number
  hub: boolean
  cap: number
  /** the spiral slot's position, normalized to the net's frame (-1 … 1) */
  nx: number
  ny: number
  /** how much the site leans on this tag, 0 … 1 (bridges are 0) */
  weight: number
  /** a bridge point stands for nothing: it is only somewhere for links to pass */
  bridge: boolean
  /** bridge points carry their own size jitter, so they are not one flat tier */
  jitter: number
  /** the tag this node stands for, or null for a bridge point */
  label: string | null
  /**
   * milliseconds this node waits for its own ramp, so the net arrives as a
   *  spread of points rather than one flat flash
   */
  lag: number
  /** the slow orbit */
  phase: number
  ampX: number
  ampY: number
  omega: number
  /** the faster second harmonic that keeps the orbit from closing into a loop */
  phase2: number
  ampX2: number
  ampY2: number
  omega2: number
  cx: number
  cy: number
}

/**
 * The net is an ellipse, not the rectangle the sheets were dealt into: a wall
 *  is a grid, a graph is a shape. The ellipse is also taller than the paper —
 *  a band three times wider than it is tall reads as a stripe however carefully
 *  its ends are rounded — so the canvas is laid from well above the sheets down
 *  to their foot, into the empty ground between the wall and the console.
 */
const RIM_X = 0.97
const RIM_Y = 0.97
/**
 * How far the papered sheets' frame may move and still be the frame the net was
 * already laid out against, in stage units. Below this the dots would not
 * visibly shift; the value only has to absorb sub-pixel layout noise between two
 * `sheetBox()` calls.
 */
const FRAME_EPSILON = 0.5
const NET_GROW_X = 0.92
const NET_RAISE = 0.34
const NET_GROW_Y = 1.34
/** the golden angle spreads points with no rows, columns or rings */
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

export interface TagGraph {
  dispose: () => void
  /** re-derive the bitmap when the wall's own scale changed */
  resize: () => void
}

/** A seeded generator: the same locale draws the same net on every visit. */
function seeded(seed: number): () => number {
  let t = seed | 0
  return () => {
    t = (t + 0x9E3779B9) | 0
    let x = Math.imul(t ^ (t >>> 16), 0x21F0AAAD)
    x = Math.imul(x ^ (x >>> 15), 0x735A2D97)
    return ((x ^ (x >>> 15)) >>> 0) / 4294967296
  }
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))
const ramp = (ms: number, dur: number): number => clamp(dur > 0 ? ms / dur : 1, 0, 1)
/** an oklch token as a canvas colour, so the net is lit by the same theme hues */
function tone(name: string, alpha: number): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--un-preset-theme-colors-${name}`).trim()
  // every ink comes from the page's own tokens (uno.config.ts publishes them as
  // preflights). If one were ever missing the net simply does not draw that part
  // rather than inventing a grey the rest of the page has never used.
  if (!raw)
    return 'transparent'
  return `oklch(${raw} / ${alpha})`
}

/**
 * The box the papered sheets occupy, in the wall's own user space.
 *
 * One `getBBox()` on the group, not one per sheet: `.home-tag-paper` holds the
 * tickets and nothing else, and every `getBBox()` flushes layout for the whole
 * SVG subtree. Twenty-nine of them twice per device swap was most of the second
 * of frozen main thread a mid-range phone showed when the tag machine came up.
 *
 * Callers pass `.home-tag-paper`, not `.home-tag-wall`: the net's own
 * `<foreignObject>` is mounted beside it inside the wall, so measuring the wall
 * would fold the canvas into the box the canvas is about to be drawn in. The
 * one place that falls back to the wall is when the group is missing entirely
 * (older markup) — there is nothing else to measure then.
 */
function sheetBox(paper: SVGGElement): { x: number, y: number, w: number, h: number } {
  const b = paper.getBBox()
  return { x: b.x, y: b.y, w: b.width, h: b.height }
}

/**
 * How many device pixels one stage unit is worth, so the canvas is not drawn
 *  at 1x and then blown up by the SVG's own scale.
 *
 * The target is the *wall*, not the SVG root: `fitWall()` scales the wall by up
 *  to 2.2x through its own transform, which the root's CTM does not include. Measured
 *  on the root, the bitmap came out exactly `--wall-scale` too small and the dots
 *  were upscaled (soft on every phone, where the wall scale is largest).
 */
function pixelRatio(target: SVGGraphicsElement, cap: number): number {
  const scale = target.getScreenCTM()?.a ?? 1
  return clamp(scale * (window.devicePixelRatio || 1), 1, cap)
}

function nearestFirst(nodes: Node[]): number[][] {
  return nodes.map((node, i) => {
    const order: number[] = []
    for (let j = 0; j < nodes.length; j++) {
      if (j !== i)
        order.push(j)
    }
    // ties are broken by index, so the sort is stable across engines
    return order.sort((a, b) => {
      const da = (nodes[a].x - node.x) ** 2 + (nodes[a].y - node.y) ** 2
      const db = (nodes[b].x - node.x) ** 2 + (nodes[b].y - node.y) ** 2
      return da - db || a - b
    })
  })
}

export function startTagGraph(
  svg: SVGSVGElement,
  reduceMotion: boolean,
  /** called once, when the sheets are finally at rest (just before gathering) */
  onSettled?: () => void,
): TagGraph | null {
  const wall = svg.querySelector<SVGGElement>(WALL)
  const module = svg.querySelector<SVGGElement>(MODULE)
  if (!wall || !module)
    return null
  const sheets = [...wall.querySelectorAll<SVGGElement>(TICKET)]
  if (!sheets.length)
    return null
  const paperGroup = wall.querySelector<SVGGElement>(PAPER) ?? wall
  const paper = sheetBox(paperGroup)
  if (!(paper.w > 0 && paper.h > 0))
    return null

  // The sheets' box is the *foot* of the net, not its frame: the canvas is
  // taller than the paper so the ellipse has a shape instead of a stripe, and
  // it keeps the paper's foot where it was. `fitWall()` measures the paper
  // alone (stage.client.ts), so a taller canvas cannot rescale the wall it is
  // drawn on.
  const frame = (sheet: { x: number, y: number, w: number, h: number }) => ({
    x: sheet.x - (sheet.w * (NET_GROW_X - 1)) / 2,
    y: sheet.y - sheet.h * NET_RAISE,
    w: sheet.w * NET_GROW_X,
    h: sheet.h * NET_GROW_Y,
  })
  // The wall is still being papered when the net is created — 29 sheets are stuck
  // on over the first ~10 s — so `getBBox()` over `.home-tag-paper` reports the
  // sheets in flight (132 × 127 px of flight against the 622 × 177 px paper they
  // become, on a 1440×900 window, measured 2026-11-05) and the net would be drawn
  // into one corner of the wall. The frame is therefore taken again once they
  // land, at the gather below.
  let paperBox = paper
  let box = frame(paperBox)

  // The net is decorative, so it takes the budget its device can pay: a phone
  // gets fewer pixels and fewer frames than a desktop, and a phone that still
  // cannot hold that (a 2020 mid-range chip, measured below 22 fps) drops once
  // more. Everything below is expressed in terms of these three, so the whole
  // cost profile moves together.
  const compact = window.matchMedia(COMPACT).matches
  let frameMs = 1000 / (compact ? FRAME_HZ_COMPACT : FRAME_HZ)
  let ratioCap = RATIO_CAP
  let bakeEvery = compact ? 5 : 3
  const writeEvery = compact ? 4 : 1
  let downgraded = false
  let slowChecks = 0
  let frozen = false

  const random = seeded(SEED)
  const uses = sheets.map(sheet => Number(sheet.dataset.uses) || 0)
  const heaviest = Math.max(1, ...uses)
  let hubR = clamp(box.w / 52, 2.6, 6.4)
  let lineWidth = clamp(box.w / 700, 0.35, 1.2)
  let midX = box.x + box.w / 2
  let midY = box.y + box.h / 2
  /** half the frame: the spiral is kept normalized and projected onto it */
  let halfW = box.w / 2
  let halfH = box.h / 2
  const nodes: Node[] = []

  // One sunflower spiral for the whole net. Sheets come first, heaviest first,
  // so the tags the site leans on most end up nearest the middle and the quiet
  // ones toward the rim; every point then keeps an equal share of the disc. No
  // rows, no columns, no string of beads along the bottom.
  // enough filler to give the spiral a shape and the links somewhere to pass,
  // never so many that the wall turns into dots
  const bridges = Math.max(9, NODE_TARGET - sheets.length)
  const total = sheets.length + bridges
  const onSpiral = (index: number): { nx: number, ny: number } => {
    const spread = Math.sqrt((index + 0.5) / total)
    const angle = index * GOLDEN
    return { nx: Math.cos(angle) * spread * RIM_X, ny: Math.sin(angle) * spread * RIM_Y }
  }

  const ranked = sheets
    .map((sheet, index) => ({ sheet, uses: uses[index] || 0 }))
    .sort((a, b) => b.uses - a.uses)

  // The spiral starts at the middle, so weight order alone would drop every hub
  // into one knot there. Hubs therefore take evenly spaced slots around the net
  // and the rest fill in behind them: the heavy tags are what the eye should
  // find first, and it finds them spread across the shape instead of in a pile.
  const tagSlots: number[] = Array.from<number>({ length: ranked.length }).fill(-1)
  const taken = new Set<number>()
  const hubIndexes = ranked
    .map((entry, index) => ({ index, weight: entry.uses / heaviest }))
    .filter(entry => entry.weight >= 0.5)
  const stride = Math.max(2, Math.floor(total / Math.max(1, hubIndexes.length)))
  hubIndexes.forEach((entry, order) => {
    let slot = (order * stride + 2) % total
    while (taken.has(slot)) slot = (slot + 1) % total
    taken.add(slot)
    tagSlots[entry.index] = slot
  })
  let cursor = 0
  for (let i = 0; i < ranked.length; i++) {
    if (tagSlots[i] >= 0)
      continue
    while (taken.has(cursor)) cursor++
    taken.add(cursor)
    tagSlots[i] = cursor
  }

  // the tags themselves: one node per sheet, sized by how much the site leans on
  // it. A tag carried by most posts is a hub and takes the primary ink; the rest
  // fall back to the secondary. Hierarchy is size and darkness, not colour.
  ranked.forEach(({ sheet, uses: carried }, index) => {
    const weight = carried / heaviest
    const hub = weight >= 0.5
    nodes.push({
      ...onSpiral(tagSlots[index]),
      x: 0,
      y: 0,
      r: 0,
      hub,
      bridge: false,
      weight,
      jitter: 0,
      cap: hub ? LINKS_HUB : LINKS_NODE,
      label: sheet.dataset.tag || sheet.textContent?.trim() || null,
      lag: index * 7,
      phase: random() * Math.PI * 2,
      ampX: 1.3 + random() * 1.5,
      ampY: 0.9 + random() * 1.2,
      omega: (Math.PI * 2) / (3800 + random() * 2600),
      phase2: random() * Math.PI * 2,
      ampX2: 0.45 + random() * 0.55,
      ampY2: 0.35 + random() * 0.45,
      omega2: (Math.PI * 2) / (2100 + random() * 1700),
      cx: 0,
      cy: 0,
    })
  })

  // and the points the wall does not have: a tag list is a thin graph, so the
  // net is thickened by quiet bridge points on the remaining spiral slots. They
  // are the smallest tier and never claim a tag — they are there to give the
  // links somewhere to pass.
  for (let k = 0; k < bridges; k++) {
    let slot = (k * 3 + 1) % total
    while (taken.has(slot)) slot = (slot + 1) % total
    taken.add(slot)
    nodes.push({
      ...onSpiral(slot),
      x: 0,
      y: 0,
      r: 0,
      hub: false,
      bridge: true,
      weight: 0,
      jitter: random() * 0.12,
      cap: LINKS_NODE,
      label: null,
      lag: 260 + random() * 240,
      phase: random() * Math.PI * 2,
      ampX: 1.5 + random() * 1.7,
      ampY: 1.1 + random() * 1.4,
      omega: (Math.PI * 2) / (3600 + random() * 3000),
      phase2: random() * Math.PI * 2,
      ampX2: 0.5 + random() * 0.6,
      ampY2: 0.4 + random() * 0.5,
      omega2: (Math.PI * 2) / (2000 + random() * 1800),
      cx: 0,
      cy: 0,
    })
  }

  /**
   * Project the normalized spiral onto the papered sheets' frame and size the dots
   * from it. That frame moves exactly once per visit — re-measured when the sheets
   * have landed — so this runs again there and no other part of the net has to know.
   */
  const applyLayout = (): void => {
    midX = box.x + box.w / 2
    midY = box.y + box.h / 2
    halfW = box.w / 2
    halfH = box.h / 2
    hubR = clamp(box.w / 52, 2.6, 6.4)
    lineWidth = clamp(box.w / 700, 0.35, 1.2)
    for (const node of nodes) {
      node.x = midX + node.nx * halfW
      node.y = midY + node.ny * halfH
      node.r = node.bridge
        ? hubR * (0.26 + node.jitter)
        : hubR * (node.hub ? 0.7 + node.weight * 0.32 : 0.4 + node.weight * 0.28)
    }
  }
  applyLayout()

  mark('net:nodes')
  // links: three nearest each, so no point floats alone, then out to the target
  const order = nearestFirst(nodes)
  const edges: [number, number][] = []
  const seen = new Set<number>()
  const degree = nodes.map(() => 0)
  const add = (a: number, b: number): void => {
    const key = a < b ? a * nodes.length + b : b * nodes.length + a
    if (seen.has(key) || degree[a] >= nodes[a].cap || degree[b] >= nodes[b].cap)
      return
    seen.add(key)
    degree[a]++
    degree[b]++
    edges.push([a, b])
  }
  for (let i = 0; i < nodes.length; i++) {
    for (const j of order[i].slice(0, LINKS)) add(i, j)
  }
  for (let rank = LINKS; rank < order[0].length && edges.length < EDGE_TARGET; rank++) {
    for (let i = 0; i < nodes.length; i++) {
      const j = order[i][rank]
      if (j !== undefined)
        add(i, j)
      if (edges.length >= EDGE_TARGET)
        break
    }
  }

  let ratio = pixelRatio(wall, ratioCap)
  const canvas = document.createElementNS(XHTML_NS, 'canvas') as HTMLCanvasElement
  canvas.width = Math.max(1, Math.round(box.w * ratio))
  canvas.height = Math.max(1, Math.round(box.h * ratio))
  const holder = document.createElementNS(SVG_NS, 'foreignObject')
  holder.setAttribute('class', GRAPH)
  holder.setAttribute('aria-hidden', 'true')
  holder.appendChild(canvas)
  wall.appendChild(holder)
  /** keep the canvas's window in the wall's own space, whatever the frame is */
  const fitHolder = (): void => {
    holder.setAttribute('x', box.x.toFixed(2))
    holder.setAttribute('y', box.y.toFixed(2))
    holder.setAttribute('width', box.w.toFixed(2))
    holder.setAttribute('height', box.h.toFixed(2))
  }
  fitHolder()
  // the counts are on the element so a reader of the page can see what the wall
  // became, and so the acceptance criteria of the issue are checkable without
  // reaching into the module (see the verification table in the PR)
  holder.setAttribute('data-nodes', String(nodes.length))
  holder.setAttribute('data-edges', String(edges.length))
  holder.setAttribute('data-links', `${Math.min(...degree)}-${Math.max(...degree)}`)
  // the tier the net runs at: a phone gets a lighter net than a desktop, and a
  // phone that still cannot hold that drops one step further (see the loop)
  const tierName = (): string => (downgraded ? 'floor' : compact ? 'compact' : 'full')
  holder.setAttribute('data-tier', tierName())

  mark('net:edges')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    holder.remove()
    return null
  }
  ctx.setTransform(ratio, 0, 0, ratio, -box.x * ratio, -box.y * ratio)

  // The net is drawn in the page's own ink, not in an accent: the stage is an
  // engraved instrument and a green constellation on it reads as a chart from
  // another product. Hierarchy is carried by size and by how dark the dot is —
  // hubs take the primary ink, everything else the secondary — the same two
  // tones the machine's caption and its dial already use.
  let nodeInk = tone('secondary', 0.5)
  let hubInk = tone('primary', 0.86)
  let edgeInk = tone('secondary', EDGE_ALPHA)
  // the hover furniture is drawn whenever the pointer rests on a dot, so its
  // four inks are resolved with the rest — not re-read from the CSSOM per frame
  let inkRing = tone('primary', 0.45)
  let inkPillFill = tone('background', 0.97)
  let inkPillBorder = tone('secondary', 0.4)
  let inkPillText = tone('primary', 0.95)

  // The links are the expensive half of a frame — 68 segments is a lot of
  // stroking for lines drawn at 10% — and the nodes drift at most a couple of
  // units a second, so an edge that is three frames stale is off by a tenth of
  // a pixel. They are therefore baked into an off-screen layer every third
  // frame and blitted the rest of the time: the net stays joined at 30 fps on a
  // 4x throttled phone, which the whole-frame version measured at 22.
  const layer = document.createElementNS(XHTML_NS, 'canvas') as HTMLCanvasElement
  layer.width = canvas.width
  layer.height = canvas.height
  const lctx = layer.getContext('2d')
  const bakeLinks = (): void => {
    if (!lctx)
      return
    lctx.setTransform(ratio, 0, 0, ratio, -box.x * ratio, -box.y * ratio)
    lctx.clearRect(box.x, box.y, box.w, box.h)
    lctx.strokeStyle = edgeInk
    lctx.lineWidth = lineWidth
    lctx.beginPath()
    for (const [a, b] of edges) {
      lctx.moveTo(nodes[a].cx, nodes[a].cy)
      lctx.lineTo(nodes[b].cx, nodes[b].cy)
    }
    lctx.stroke()
  }

  // when the sheets begin to gather: the last sheet to be pressed sets it, so
  // the net never starts over a half-papered wall
  const lastFlight = sheets.reduce((max, sheet) => {
    const delay = Number.parseFloat(sheet.style.getPropertyValue('--fly-delay')) || 0
    return Math.max(max, delay)
  }, 0)
  const gatherAt = lastFlight + STICK_END + GATHER_AFTER
  // Bridge points enter on `260 + random() * 240`, so the last one is up to
  // 500 ms late. The settled fill drops per-node alpha, so it has to wait for
  // the slowest node — a fixed 320 ms let the late dots jump to full opacity
  // ~180 ms early: a twinkle in the middle of the net.
  const maxLag = nodes.reduce((most, node) => Math.max(most, node.lag), 0)
  const settledAt = gatherAt + NODE_AFTER + NODE_RAMP + maxLag

  let elapsed = 0
  let raf = 0
  let frames = 0
  /**
   * the last frame that was actually drawn: the 30 fps gate must not consume
   *  the frames it skips, or it would advance `last` on every rAF tick and never
   *  reach its own threshold again
   */
  let drawn = 0
  let gathered = false
  let disposed = false
  let awake = false
  /** the clock: the last tick, the smoothed frame interval and the tick count */
  let last = 0
  let frameGap = frameMs
  /** the ticket of the one callback allowed in flight, see `schedule()` */
  let chain = 0
  /**
   * the node under the pointer, or -1. Only tag nodes are hoverable: a bridge
   *  point stands for nothing, so a label on it would be a lie.
   */
  let hovered = -1

  /**
   * Text has to read at the same size whatever the wall was scaled to, so the
   *  type is asked for in screen pixels and converted back into stage units.
   */
  const unitPx = (): number => {
    // a measurement, not a budget: clamping it here reintroduces the bug the
    // screen-space `clamp(LABEL_PX, 11, 18)` fixes — above 6 stage px the pill
    // would render larger than its intended screen size
    const scale = wall.getScreenCTM()?.a ?? 1
    return scale > 0 ? scale : 1
  }
  // canvas cannot read var(), so the family is resolved once from the token that
  // uno.config.ts's preflight publishes — one source of truth for the page's type
  const sansStack = getComputedStyle(document.documentElement)
    .getPropertyValue('--un-preset-theme-font-family-sans')
    .trim() || 'OPPOSans, ui-sans-serif, system-ui, sans-serif'
  const labelFont = (size: number): string => `500 ${size}px ${sansStack}`
  /**
   * The pill's type size, in screen pixels: 13 px is what the page's small print
   * (captions, the article's meta line) already uses, so a tag reads as part of
   * the same type scale instead of as an annotation of its own.
   */
  const LABEL_PX = 13
  /** the screen-space window that size may be nudged into */
  const LABEL_PX_MIN = 11
  const LABEL_PX_MAX = 18

  /**
   * The hovered tag: a ring so the node is findable among the net's other dots,
   *  then the tag itself in a pill that flips sides rather than leaving the wall.
   */
  const drawHover = (): void => {
    const node = nodes[hovered]
    if (!node || !node.label)
      return
    const ring = Math.max(1.1, node.r * 0.55)
    ctx.beginPath()
    ctx.arc(node.cx, node.cy, node.r + ring, 0, Math.PI * 2)
    ctx.strokeStyle = inkRing
    ctx.lineWidth = Math.max(0.25, node.r * 0.2)
    ctx.stroke()

    // the pill's type is asked for in screen pixels; the clamp therefore happens
    // in screen space too — clamping stage units would mean two different label
    // sizes at two different wall scales
    const size = clamp(LABEL_PX, LABEL_PX_MIN, LABEL_PX_MAX) / unitPx()
    ctx.font = labelFont(size)
    const pad = size * 0.55
    const w = ctx.measureText(node.label).width + pad * 2
    const h = size * 1.9
    let lx = node.cx + node.r + ring + size * 0.45
    let ly = node.cy - h / 2
    if (lx + w > box.x + box.w - size * 0.2)
      lx = node.cx - node.r - ring - size * 0.45 - w
    ly = clamp(ly, box.y + size * 0.2, box.y + box.h - h - size * 0.2)
    const radius = Math.min(h / 2, size * 0.7)
    ctx.beginPath()
    ctx.moveTo(lx + radius, ly)
    ctx.arcTo(lx + w, ly, lx + w, ly + h, radius)
    ctx.arcTo(lx + w, ly + h, lx, ly + h, radius)
    ctx.arcTo(lx, ly + h, lx, ly, radius)
    ctx.arcTo(lx, ly, lx + w, ly, radius)
    ctx.closePath()
    ctx.fillStyle = inkPillFill
    ctx.fill()
    ctx.lineWidth = Math.max(0.18, size * 0.055)
    ctx.strokeStyle = inkPillBorder
    ctx.stroke()
    ctx.fillStyle = inkPillText
    ctx.textBaseline = 'middle'
    ctx.fillText(node.label, lx + pad, ly + h / 2)
  }

  const draw = (): void => {
    ctx.clearRect(box.x, box.y, box.w, box.h)
    const links = ramp(elapsed - gatherAt - EDGE_AFTER, EDGE_RAMP)
    if (links > 0 && lctx) {
      if (frames % bakeEvery === 0)
        bakeLinks()
      ctx.globalAlpha = links
      ctx.drawImage(layer, box.x, box.y, box.w, box.h)
      ctx.globalAlpha = 1
    }
    // One fill per node is the frame's real cost on a slow phone (each fill is a
    // path submission of its own). Once every node has finished its entry ramp
    // they all share one alpha, so they collapse into one path per ink — two
    // fills instead of one per node. During the ramp they still need their own.

    if (elapsed >= settledAt) {
      for (const [ink, hubs] of [[nodeInk, false], [hubInk, true]] as const) {
        ctx.fillStyle = ink
        ctx.beginPath()
        for (const node of nodes) {
          if (node.hub !== hubs)
            continue
          ctx.moveTo(node.cx + node.r, node.cy)
          ctx.arc(node.cx, node.cy, node.r, 0, Math.PI * 2)
        }
        ctx.fill()
      }
    }
    else {
      for (let i = 0; i < nodes.length; i++) {
        const alpha = ramp(elapsed - gatherAt - NODE_AFTER - nodes[i].lag, NODE_RAMP)
        if (alpha <= 0)
          continue
        ctx.globalAlpha = alpha
        ctx.fillStyle = nodes[i].hub ? hubInk : nodeInk
        ctx.beginPath()
        ctx.arc(nodes[i].cx, nodes[i].cy, nodes[i].r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
    drawHover()
  }

  /**
   * The canvas cannot read CSS variables, so the inks are resolved once — and
   * again whenever the theme flips, or a reader who switches to dark while the
   * wall is up would keep the light-theme greys on a dark page.
   */
  const retint = (): void => {
    nodeInk = tone('secondary', 0.5)
    hubInk = tone('primary', 0.86)
    edgeInk = tone('secondary', EDGE_ALPHA)
    inkRing = tone('primary', 0.45)
    inkPillFill = tone('background', 0.97)
    inkPillBorder = tone('secondary', 0.4)
    inkPillText = tone('primary', 0.95)
    if (lctx) {
      bakeLinks()
      draw()
    }
  }

  /**
   * `fitWall()` can change the wall's scale after the canvas exists (a resize, or
   *  the next time the device is fitted); the bitmap is re-derived when that moves
   *  enough to matter, otherwise a reader who rotated their phone would look at a
   *  net drawn for the old scale.
   */
  const resize = (force = false): void => {
    if (disposed)
      return
    const next = pixelRatio(wall, ratioCap)
    if (!force && Math.abs(next - ratio) / ratio < 0.08)
      return
    ratio = next
    canvas.width = Math.max(1, Math.round(box.w * ratio))
    canvas.height = Math.max(1, Math.round(box.h * ratio))
    layer.width = canvas.width
    layer.height = canvas.height
    ctx.setTransform(ratio, 0, 0, ratio, -box.x * ratio, -box.y * ratio)
    bakeLinks()
    draw()
  }

  /**
   * Take the papered sheets' frame again and project the net onto it. Only worth
   * a `getBBox()` once they have stopped moving — which is the gather, the moment
   * the last sheet is pressed on and the gather animation has not yet stirred
   * them. Called once per visit, so the cost is one layout flush.
   */
  const remeasure = (): void => {
    const measured = sheetBox(paperGroup)
    if (Math.abs(measured.x - paperBox.x) < FRAME_EPSILON && Math.abs(measured.y - paperBox.y) < FRAME_EPSILON
      && Math.abs(measured.w - paperBox.w) < FRAME_EPSILON && Math.abs(measured.h - paperBox.h) < FRAME_EPSILON) {
      return
    }
    paperBox = measured
    box = frame(paperBox)
    applyLayout()
    fitHolder()
    resize(true)
  }

  // The drift: two harmonics per node, on periods that share no neat ratio, so
  // no node retraces its own path and the net never settles into a pattern you
  // can predict by watching it. The second harmonic is the faster, smaller one —
  // it is what makes the motion read as alive rather than as a slow sway.
  const place = (seconds: number): void => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const slow = seconds * node.omega * 1000 + node.phase
      const fast = seconds * node.omega2 * 1000 + node.phase2
      node.cx = node.x + Math.sin(slow) * node.ampX + Math.sin(fast * 1.37) * node.ampX2
      node.cy = node.y + Math.cos(slow * 0.83) * node.ampY + Math.cos(fast * 1.71) * node.ampY2
    }
  }

  /**
   * Exactly one callback may be in flight. Every schedule takes a new ticket and
   * the callback refuses to run when its ticket is stale, which is the only
   * arrangement that cannot drift into two chains: two chains would draw faster
   * than the cap allows — that is how a 30 fps gate once measured 41–52 fps
   * (2026-11-05).
   */

  const step = (now: number, mine: number): void => {
    if (disposed || !awake || mine !== chain)
      return
    // the chain continues with a fresh ticket; a callback whose ticket is no
    // longer the newest one has already returned above
    const ticket = ++chain
    raf = window.requestAnimationFrame((next: number) => step(next, ticket))
    // Two rules, in order, and no counter to drift between them:
    //
    // 1. if the page already delivers frames slower than the budget, drawing
    //    every tick is the best it can do — gating there only throws frames away;
    // 2. otherwise draw when the budget is due, with a couple of milliseconds of
    //    slack, or a 32.6 ms frame would fail a 33.33 ms test on every other tick.
    //
    // Both were measured the hard way: the strict test gave 24 fps beside a
    // 30.7 fps rAF, and a tick counter that skipped every n-th frame oscillated
    // around its own threshold and read as stutter at 21 fps (2026-11-05).
    const interval = last ? now - last : frameMs
    last = now
    frameGap += (interval - frameGap) * 0.25
    // A device that cannot hold its tier's budget gets one more concession. The
    // read is a sustained frame interval, and it is one-way: raising quality again
    // would oscillate between two budgets for the rest of the visit.
    if (!downgraded && ++slowChecks % 40 === 0) {
      slowChecks = 0
      if (frameGap > 42) {
        downgraded = true
        frameMs = 1000 / FRAME_HZ_FLOOR
        ratioCap = RATIO_CAP_COMPACT
        bakeEvery = 7
        resize(true)
        holder.setAttribute('data-tier', tierName())
      }
    }
    // Second concession, and the honest one: if even the floor budget is out of
    // reach, the net stops moving. A static net still shows the links, still
    // answers the pointer, and costs nothing per frame — far better than a net
    // that crawls at 15 fps on a 2020 mid-range phone.
    if (downgraded && !frozen && ++slowChecks % 40 === 0) {
      slowChecks = 0
      if (frameGap > 55) {
        frozen = true
        // stop the loop here rather than through sleep(), which is declared below
        awake = false
        if (raf)
          window.cancelAnimationFrame(raf)
        raf = 0
        place(elapsed / 1000)
        draw()
        holder.setAttribute('data-tier', 'static')
      }
    }
    const slowerThanBudget = frameGap >= frameMs * 0.8
    if (!slowerThanBudget && drawn && now - drawn < frameMs - 2)
      return
    // a tab that slept for a minute must not jump the net forward by a minute
    const delta = drawn ? Math.min(120, now - drawn) : 0
    drawn = now
    elapsed += delta
    // The loop's own odometer. It is written every drawn frame on a desktop, but
    // a phone pays for every DOM write, so it is written every few there — the
    // quantization that costs is reading a counter that only ticks every 30
    // frames, which is how a 19 fps net once read as 29 (2026-11-05).
    if (++frames % writeEvery === 0)
      holder.setAttribute('data-frames', String(frames))
    if (!gathered && elapsed >= gatherAt) {
      gathered = true
      // the wall is only papered now, and the net was laid out over a frame taken
      // while the sheets were still in flight: take it again before the net shows
      remeasure()
      // the sheets are at rest here, which is also the right beat for a re-fit
      onSettled?.()
      if (!reduceMotion)
        module.classList.add(GATHERED)
    }
    place(elapsed / 1000)
    draw()
  }

  const wake = (): void => {
    // a frozen net is final for this visit: waking it would resume exactly the
    // loop the floor budget could not afford, and `step()` only re-freezes while
    // `downgraded && !frozen`, so it would then run forever
    if (awake || disposed || reduceMotion || frozen)
      return
    if (document.hidden)
      return
    awake = true
    // a resumed loop starts a fresh clock, not one carrying the paused gap
    drawn = 0
    last = 0
    frameGap = frameMs
    if (raf)
      window.cancelAnimationFrame(raf)
    const ticket = ++chain
    raf = window.requestAnimationFrame((next: number) => step(next, ticket))
  }
  const sleep = (): void => {
    if (!awake)
      return
    awake = false
    window.cancelAnimationFrame(raf)
    raf = 0
  }

  const onVisibility = (): void => {
    if (document.hidden)
      sleep()
    else
      wake()
  }

  // the stage is one screen tall: once it is scrolled past there is nothing to
  // animate, and on a phone the net would otherwise keep the main thread warm
  const watcher = new IntersectionObserver((entries) => {
    if (entries.some(entry => entry.isIntersecting))
      wake()
    else
      sleep()
  }, { threshold: 0 })

  /* ---- reading the net: the pointer, not the paper ---------------------- */

  const setHover = (index: number): void => {
    if (index === hovered)
      return
    hovered = index
    const label = index >= 0 ? nodes[index].label : null
    if (label)
      holder.setAttribute('data-hover', label)
    else
      holder.removeAttribute('data-hover')
    canvas.style.cursor = 'default'
    // with motion reduced, or once the floor budget froze the net, the loop is
    // not running — paint here or the label never appears (and a ring could stay
    // on screen after the pointer leaves)
    if (reduceMotion) {
      place(0)
      draw()
    }
    else if (frozen) {
      draw()
    }
  }

  /**
   * Pointer in page coordinates → the wall's own user space. Going through the
   *  canvas rect keeps this correct under the wall's scale and the camera zoom
   *  without re-deriving either.
   */
  const hitTest = (event: PointerEvent): void => {
    // the canvas is on the wall for the whole ~10 s papering, but no node is
    // drawn until the gather — pointing at nothing must not name a tag
    if (disposed) {
      setHover(-1)
      return
    }
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height)
      return
    const x = box.x + ((event.clientX - rect.left) / rect.width) * box.w
    const y = box.y + ((event.clientY - rect.top) / rect.height) * box.h
    let best = -1
    let bestGap = Number.POSITIVE_INFINITY
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (!node.label)
        continue
      // nodes enter on their own lag: a dot that has not started drawing yet is
      // not there to point at, however close it already is on paper
      if (ramp(elapsed - gatherAt - NODE_AFTER - node.lag, NODE_RAMP) <= 0)
        continue
      const gap = Math.hypot(node.cx - x, node.cy - y) - node.r
      // a few units of slop: the dots are small and the pointer is a point
      if (gap < 2.4 && gap < bestGap) {
        best = i
        bestGap = gap
      }
    }
    setHover(best)
  }

  const onPointer = (event: PointerEvent): void => {
    hitTest(event)
  }
  const onPointerOut = (): void => {
    setHover(-1)
  }
  canvas.addEventListener('pointermove', onPointer)
  canvas.addEventListener('pointerdown', onPointer)
  canvas.addEventListener('pointerleave', onPointerOut)

  if (reduceMotion) {
    // the settled picture: gathered sheets, links at their final strength
    gathered = true
    // nothing flies under reduced motion, but confirming the frame is one read
    remeasure()
    onSettled?.()
    module.classList.add(GATHERED)
    place(0)
    elapsed = gatherAt + EDGE_AFTER + EDGE_RAMP + NODE_AFTER + NODE_RAMP
    draw()
  }
  else {
    document.addEventListener('visibilitychange', onVisibility)
    watcher.observe(svg)
    wake()
  }

  // the theme lives as a class on <html>: follow it so the net changes clothes
  // with the page rather than staying in the palette it was born in
  const themeWatcher = new MutationObserver(retint)
  themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  return {
    resize,
    dispose: () => {
      disposed = true
      themeWatcher.disconnect()
      sleep()
      watcher.disconnect()
      canvas.removeEventListener('pointermove', onPointer)
      canvas.removeEventListener('pointerdown', onPointer)
      canvas.removeEventListener('pointerleave', onPointerOut)
      document.removeEventListener('visibilitychange', onVisibility)
      holder.remove()
      module.classList.remove(GATHERED)
    },
  }
}
