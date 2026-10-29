/**
 * Home stage runtime.
 *
 * The machine is static SVG; this file drives what moves: the three-second
 * page-load build, the typewriter striking keys and feeding its sheet, the
 * device swap, and the page-level projection behind the 作品 section.
 *
 * There is no camera tilt. A rotation of the drawing plane only ever reads as
 * a sheet of paper turning, so the stage stays square to the reader.
 *
 * Everything degrades to the server-rendered state when motion is reduced.
 */

const STAGE = '[data-home-stage]'
const PROJECTION = '.home-projection'
const FRAME = '.home-projection-frame'
const TOUR_DELAY = 600
const TOUR_INTERVAL = 34
const RESUME_DELAY = 5200
/** the chassis has finished building; the device rides up on the lift */
const BOOT_DEVICE = 1200
/** chassis (0 → 1.2 s) + the device's own assembly (2.2–2.6 s): the page is
 *  whole at four, and the sheet only starts printing on a finished machine */
const BOOT_TOTAL = 4000
/** how long the intro will wait for the four fetched machines before playing anyway */
const PRELOAD_DEADLINE = 2500
/** a single fragment may not hold the whole stage hostage */
const PRELOAD_TIMEOUT = 8000
/** the projector threads the film and strikes the lamp before the reel rolls:
 *  the machine is whole at 2.6 s, the arc catches at 2.68 s, and the picture on
 *  the wall opens 270 ms after that */
const SCREEN_DELAY = 2950
/** the frame's rect is cached; layout is re-read at most this often */
const RECT_TTL = 250
/** how far the camera pushes in on a switch, and how long it stays there */
const ZOOM = 1.75
const ZOOM_HOLD = 3200
/** tablet and phone: there is no hover, so the machine turns itself over */
const COMPACT = '(max-width: 899px), (hover: none)'
/** one machine per turn, long enough for the swap and a beat of stillness */
const AUTO_SWAP = 6000
/** what each machine is given once it is whole, so its own performance plays
 *  out: the sheet types its excerpt, the reel runs, the papers swing, the
 *  tickets are printed. 作品 is the longest because its reel is the reason to
 *  stop there at all. */
const DWELL: Record<string, number> = {
  posts: 4000,
  works: 30000,
  column: 14000,
  resource: 8000,
  tags: 12000,
}

const isCompact = (): boolean => window.matchMedia(COMPACT).matches

interface State {
  stage: HTMLElement
  svg: SVGSVGElement
  lines: string[]
  textEls: SVGTextElement[]
  paper: SVGGElement | null
  lever: SVGGElement | null
  leverTimer: number
  line: number
  keys: Map<string, SVGGElement>
  shown: number
  total: number
  timer: number
  resume: number
  swapTimer: number
  zoomTimer: number
  zoomMaskTimer: number
  autoTimer: number
  bootTimer: number
  bootEnd: number
  preloadTimer: number
  /** a key chosen while the chassis is still building, seated at 1200 ms */
  pending: number
  /** false until the boot is over: the tour waits for a whole page */
  ready: boolean
  /** true once every machine is in the document — the ones fetched after paint */
  whole: boolean
  modules: SVGGElement[]
  caps: SVGGElement[]
  channels: SVGAElement[]
  active: number
  cleanup: () => void
}

let state: State | null = null

/* --------------------------------------------------------------------------
   The projection. The layer is page-level and sits behind the page
   (z-index: -1), so the frame can never be hovered and nothing is thrown until
   the projector has threaded. Both are flags on <html>, read by home.css.
   -------------------------------------------------------------------------- */

let screenTimer = 0
let frameRect: DOMRect | null = null
let frameAt = 0
let pointerX = -1
let pointerY = -1
/** true while the console is assembling: nothing is screened until it is whole */
let bootActive = false

function prefersReducedMotion(): boolean {
  return document.documentElement.classList.contains('reduce-motion')
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function totalChars(lines: string[]): number {
  return lines.reduce((sum, line) => sum + line.length, 0)
}

function paint(s: State, count: number): void {
  let left = count
  for (let i = 0; i < s.lines.length; i++) {
    const line = s.lines[i]
    const take = Math.max(0, Math.min(line.length, left))
    left -= line.length
    const el = s.textEls[i]
    if (el)
      el.textContent = line.slice(0, Math.max(0, take))
  }
  feed(s, count)
}

/**
 * The sheet feeds up one line at a time: the strip, the typing and the paper's
 * own top edge all travel together, and the line being struck always sits at
 * the roller. The CSS transition on .home-paper-group makes it a feed.
 */
/** Knock the carriage return lever over — one throw per new line. */
function swingLever(s: State): void {
  const lever = s.lever
  if (!lever)
    return
  // Restart the throw without a forced layout. Dropping and re-adding the class
  // in one frame does not restart a CSS animation, so this used to read
  // getBoundingClientRect() to flush style — a synchronous layout every line.
  // If the throw is still in flight, rewind it; if it has landed, the class
  // starts it again on its own.
  // the throw is on the lever's arm, not on the lever itself
  const swing = lever.getAnimations({ subtree: true })
    .filter(a => (a as CSSAnimation).animationName === 'tw-return')
  if (swing.length) {
    for (const a of swing) {
      a.currentTime = 0
      a.play()
    }
  }
  else if (lever.classList.contains('is-returning')) {
    // the class is still on but its throw has landed: let go of it for one
    // frame so the next one starts, without reading layout to force it
    lever.classList.remove('is-returning')
    requestAnimationFrame(() => lever.classList.add('is-returning'))
  }
  else {
    lever.classList.add('is-returning')
  }
  window.clearTimeout(s.leverTimer)
  s.leverTimer = window.setTimeout(() => lever.classList.remove('is-returning'), 460)
}

function feed(s: State, count: number): void {
  const group = s.paper
  if (!group)
    return
  const leading = Number(group.dataset.leading || 7.8)
  let line = 0
  let left = count
  for (let i = 0; i < s.lines.length && left > 0; i++) {
    left -= s.lines[i].length
    line = i
  }
  // a last carriage return: once the piece is typed the sheet feeds one more
  // line, so a blank line stands under the text — the page is finished, not
  // stopped mid-sentence
  if (count >= s.total && s.total > 0)
    line += 1
  group.style.transform = `translateY(${(-line * leading).toFixed(2)}px)`
  if (line > s.line)
    swingLever(s)
  s.line = line
}

function strike(s: State, char: string): void {
  const id = char === ' ' ? ' ' : char.toLowerCase()
  const key = s.keys.get(id)
    ?? s.keys.get([...s.keys.keys()][s.shown % s.keys.size])
  if (!key)
    return
  key.classList.add('is-down')
  window.setTimeout(() => key.classList.remove('is-down'), 90)
}

function typeOne(s: State): void {
  if (s.shown >= s.total)
    return
  const char = s.lines.join('')[s.shown] ?? ''
  s.shown += 1
  paint(s, s.shown)
  if (char.trim())
    strike(s, char)
}

function step(s: State): void {
  if (s.shown >= s.total) {
    s.timer = 0
    return
  }
  typeOne(s)
  s.timer = window.setTimeout(step, TOUR_INTERVAL, s)
}

function startTour(s: State): void {
  // the sheet only starts printing once the console is whole
  if (!s.ready || s.timer || s.shown >= s.total)
    return
  s.timer = window.setTimeout(step, TOUR_DELAY, s)
}

function stopTour(s: State): void {
  if (s.timer) {
    window.clearTimeout(s.timer)
    s.timer = 0
  }
}

function scheduleResume(s: State): void {
  if (s.resume)
    window.clearTimeout(s.resume)
  s.resume = window.setTimeout(() => {
    if (s.shown >= s.total) {
      s.shown = 0
      paint(s, 0)
    }
    startTour(s)
  }, RESUME_DELAY)
}

/* ---- the screening gate -------------------------------------------------- */

function projectionVideo(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>(`${PROJECTION} video`)
}

function projectionFrame(): HTMLElement | null {
  return document.querySelector<HTMLElement>(FRAME)
}

/**
 * Where the picture hangs.
 *
 * On a wide screen it is the wall behind the page: full width, pinned to the
 * top edge, with the machine standing in front of its lower half. On a phone
 * the page is a column — copy, machine, foot — and a band pinned to the top
 * would land across the headline, so the frame is put behind the machine
 * instead, on the blank ground the stage sits on.
 */
function placeProjection(s: State): void {
  const root = document.documentElement
  if (!isCompact()) {
    root.removeAttribute('data-compact')
    root.style.removeProperty('--projection-top')
    root.style.removeProperty('--projection-height')
    return
  }
  // a flag the stylesheet can read: the narrow layout treats the copy as
  // something that sits on the picture, not beside it
  root.dataset.compact = '1'
  const rect = s.stage.getBoundingClientRect()
  // the picture keeps its foot where it is and grows upward by 70% of its own
  // height, so it becomes the wall the whole sheet hangs on — the copy included
  const top = Math.max(0, rect.top - rect.height * 0.7)
  root.style.setProperty('--projection-top', `${Math.round(top)}px`)
  // the stage box is padded: its foot sits a little below the console's, so the
  // picture stops at the base rather than glowing under it
  const bottom = rect.bottom - rect.height * 0.07
  root.style.setProperty('--projection-height', `${Math.round(bottom - top)}px`)
}

/** The layer is fixed and static, so its rect only moves on resize — cache it. */
function refreshFrame(): void {
  const frame = projectionFrame()
  frameRect = frame ? frame.getBoundingClientRect() : null
  frameAt = performance.now()
}

function insideFrame(rect: DOMRect | null, x: number, y: number): boolean {
  return !!rect
    && x >= rect.left
    && x <= rect.right
    && y >= rect.top
    && y <= rect.bottom
}

function setHover(on: boolean): void {
  const html = document.documentElement
  if (on) {
    if (html.dataset.projection !== 'hover')
      html.dataset.projection = 'hover'
    return
  }
  if (html.dataset.projection)
    html.removeAttribute('data-projection')
}

/**
 * The frame is unreachable by :hover (z-index: -1 puts it under the page), so
 * the colour reveal is driven from the pointer position against its rect.
 * No layout is read on every move: the rect is refreshed on resize and at most
 * once per RECT_TTL.
 */
function syncHover(): void {
  const html = document.documentElement
  if (html.dataset.screening !== 'on' || html.dataset.homeSection !== 'works') {
    setHover(false)
    return
  }
  if (!frameRect || performance.now() - frameAt > RECT_TTL)
    refreshFrame()
  setHover(insideFrame(frameRect, pointerX, pointerY))
}

/** Nothing is thrown and nothing plays: the room goes quiet at once. */
function stopScreening(): void {
  if (screenTimer) {
    window.clearTimeout(screenTimer)
    screenTimer = 0
  }
  document.documentElement.removeAttribute('data-screening')
  setHover(false)
  frameRect = null
  const video = projectionVideo()
  if (video)
    video.pause()
}

/** Only the 作品 section projects; everything else keeps the page quiet. */
function projectSection(section: string): void {
  if (section !== 'works') {
    stopScreening()
    return
  }
  if (screenTimer)
    window.clearTimeout(screenTimer)
  // the projector threads first: the reel only rolls once the film is through
  screenTimer = window.setTimeout(() => {
    screenTimer = 0
    const html = document.documentElement
    // the reader may have moved on, or the console may still be assembling
    if (bootActive || html.dataset.homeSection !== 'works')
      return
    html.dataset.screening = 'on'
    refreshFrame()
    const video = projectionVideo()
    if (!video) {
      syncHover()
      return
    }
    if (video.readyState === 0)
      video.load()
    // autoplay may be refused; the frame then simply keeps its poster
    video.play().catch(() => {})
    syncHover()
  }, SCREEN_DELAY)
}

/**
 * Give the tag wall the ground above the machine.
 *
 * On a phone the stage is a column: the sheets sit in a small cluster over the
 * machine and the rest of the space is empty. The wall is scaled as one piece
 * about its own foot so it fills that ground, and every sheet's flight is
 * re-aimed so it still leaves the slot: a sheet starts at
 * foot + k·(seat + fly − foot) and the slot does not move, so the offset is
 * divided by the scale and corrected for the seat's own displacement.
 */
function fitWall(s: State): void {
  const wall = s.svg.querySelector<SVGGElement>('.home-tag-wall')
  if (!wall)
    return
  const stage = s.stage.getBoundingClientRect()
  const vb = s.svg.viewBox.baseVal
  if (!stage.width || !vb.width)
    return
  const px = Math.min(stage.width / vb.width, stage.height / vb.height)
  const box = wall.getBBox()
  if (!box.width)
    return
  // the same rule on every screen: the wall takes the ground it is given, up to
  // a point where the sheets would read as bigger than the machine they hang
  // behind
  const scale = Math.min(2.2, Math.max(1, (stage.width * 0.92) / (box.width * px)))
  const foot = { x: box.x + box.width / 2, y: box.y + box.height }
  wall.style.setProperty('--wall-x', `${foot.x.toFixed(1)}px`)
  wall.style.setProperty('--wall-y', `${foot.y.toFixed(1)}px`)
  wall.style.setProperty('--wall-scale', scale.toFixed(3))
  if (Math.abs(scale - 1) < 0.01)
    return
  for (const t of wall.querySelectorAll<SVGGElement>('.home-ticket')) {
    const b = t.getBBox()
    const seat = { x: b.x + b.width / 2, y: b.y + b.height / 2 }
    for (const k of ['--fly', '--out']) {
      // the untouched offsets are kept on the element, so a rotation or a
      // resize re-aims from the module's own numbers rather than from the
      // numbers this function wrote last time
      const key = k === '--fly' ? 'fly' : 'out'
      if (t.dataset[`${key}X`] === undefined) {
        t.dataset[`${key}X`] = t.style.getPropertyValue(`${k}-x`) || '0px'
        t.dataset[`${key}Y`] = t.style.getPropertyValue(`${k}-y`) || '0px'
      }
      const x = Number.parseFloat(t.dataset[`${key}X`] || '')
      const y = Number.parseFloat(t.dataset[`${key}Y`] || '')
      if (!Number.isFinite(x) || !Number.isFinite(y))
        continue
      const nx = x / scale + (seat.x - foot.x) * (1 / scale - 1)
      const ny = y / scale + (seat.y - foot.y) * (1 / scale - 1)
      t.style.setProperty(`${k}-x`, `${nx.toFixed(1)}px`)
      t.style.setProperty(`${k}-y`, `${ny.toFixed(1)}px`)
    }
  }
}

/**
 * Push the picture in on the machine's upper half.
 *
 * The mechanism is up there — the platen and the sheet, the reels, the roll, the
 * lid — and at the sheet's scale it is too small to read. The drawing itself is
 * scaled about a point over the machine, so the move is one transform rather
 * than a re-layout, and it is aimed with the machine's own bounding box rather
 * than a hand-tuned point per device.
 */
function zoomIn(s: State, index: number): void {
  const m = s.modules.find(x => Number(x.dataset.index) === index)
  if (!m || prefersReducedMotion())
    return
  const rect = s.svg.getBoundingClientRect()
  const vb = s.svg.viewBox.baseVal
  if (!rect.width || !vb.width)
    return
  // the aim was measured at rest (see precomputeDrops); mid-assembly the
  // module's own box is swollen by parts still in flight
  const fx = Number(m.dataset.focusX) || 380
  const fy = Number(m.dataset.focusY) || 300
  const scale = Math.min(rect.width / vb.width, rect.height / vb.height)
  const ox = (rect.width - vb.width * scale) / 2
  const oy = (rect.height - vb.height * scale) / 2
  const x = ox + (fx - vb.x) * scale
  const y = oy + (fy - vb.y) * scale
  s.svg.style.setProperty('--zoom-x', `${x.toFixed(1)}px`)
  s.svg.style.setProperty('--zoom-y', `${y.toFixed(1)}px`)
  // the feathered edge goes on with the push: what runs past the stage is
  // faded out, not cut
  s.stage.classList.add('is-zoomed')
  s.svg.style.setProperty('--zoom', String(ZOOM))
  window.clearTimeout(s.zoomTimer)
  s.zoomTimer = window.setTimeout(() => zoomOut(s), ZOOM_HOLD)
}

/** Back to the whole sheet. */
function zoomOut(s: State): void {
  window.clearTimeout(s.zoomTimer)
  s.zoomTimer = 0
  s.svg.style.setProperty('--zoom', '1')
  // the feather stays until the pull-back has finished; at rest the drawing sits
  // inside the stage's padding and there is nothing near the edges to fade
  window.clearTimeout(s.zoomMaskTimer)
  s.zoomMaskTimer = window.setTimeout(() => s.stage.classList.remove('is-zoomed'), 950)
}

/**
 * Which machine is on the platform. Hovering a key swaps it, and it stays
 * swapped until another key is chosen — the reader's selection is not undone
 * by moving the pointer away.
 */
function applyModule(s: State, index: number): void {
  let section = ''
  for (const m of s.modules) {
    const on = Number(m.dataset.index) === index
    m.classList.remove('is-leaving')
    // a lever left mid-swing by the previous visit would replay its throw on
    // the first frame of the next assembly
    if (on)
      m.querySelector('.home-return-lever')?.classList.remove('is-returning')
    m.classList.toggle('is-active', on)
    if (on)
      section = m.dataset.module || ''
  }
  for (const c of s.caps)
    c.classList.toggle('is-active', Number(c.dataset.index) === index)
  for (const a of s.channels) {
    if (Number(a.dataset.index) === index)
      a.setAttribute('aria-current', 'page')
    else
      a.removeAttribute('aria-current')
  }
  // only the typewriter prints, and only while it is the machine on the
  // platform: feeding a sheet on a hidden device is work nobody can see (and
  // it used to swing the return lever while the machine was off stage)
  if (section === 'posts' && s.ready)
    startTour(s)
  else
    stopTour(s)

  document.documentElement.dataset.homeSection = section
  projectSection(section)
  // the camera moves in as the machine comes up; the first seat (the boot) is
  // left wide, it is the page arriving rather than a switch
  if (s.ready)
    zoomIn(s, index)
}

/**
 * How far each part has to fall to be out of sight.
 *
 * The machines are clipped by the deck's front rim, so a part is gone once its
 * top edge is below that line: that distance, per part, is what the exit hands
 * to CSS as --drop, and it sets how long the part takes to fall. Measured in
 * stage units — the viewBox is fixed, so the numbers hold at any window size —
 * and from the markup's own transforms, so a reading taken while the machine is
 * still riding up is still its resting geometry.
 */
function measureDrops(svg: SVGSVGElement, m: SVGGElement): void {
  if (m.dataset.drops)
    return
  m.dataset.drops = '1'
  const rimY = rimLine(svg)
  for (const p of m.querySelectorAll<SVGGElement>('.home-part'))
    measurePart(rimY, p, m)
}

/** Where the deck's front rim is, in stage units: below it nothing is seen. */
function rimLine(svg: SVGSVGElement): number {
  const rim = svg.querySelector<SVGPathElement>('#home-deck-clip path')
  const box = rim?.getBBox()
  return box ? box.y + box.height : 420
}

/** How far one part has to fall to be out of sight, in stage units. */
function measurePart(rimY: number, p: SVGGElement, m: Element): void {
  // only the transforms written in the markup count here: getCTM() folds in the
  // running CSS animation as well, and a reading taken while the machine is
  // still riding up would put every part 132 px lower than it lives
  let acc = new DOMMatrix()
  let node: Element | null = p
  while (node && node !== m) {
    const own = (node as SVGGraphicsElement).transform?.baseVal.consolidate()
    if (own)
      acc = own.matrix.multiply(acc)
    node = node.parentElement
  }
  const box = p.getBBox()
  let top = Number.POSITIVE_INFINITY
  for (const x of [box.x, box.x + box.width]) {
    for (const y of [box.y, box.y + box.height])
      top = Math.min(top, acc.b * x + acc.d * y + acc.f)
  }
  const drop = Math.round(Math.min(420, Math.max(16, rimY + 26 - top)))
  p.style.setProperty('--drop', String(drop))
}

/**
 * Measure one part again at the moment it leaves.
 *
 * A part whose resting shape depends on a state — the tool case's lid is folded
 * shut while the machine is off the platform and stands open when it is taken
 * apart — was measured against the wrong shape. It is measured here while it
 * still stands as the reader sees it.
 */
function remeasurePart(svg: SVGSVGElement, m: SVGGElement, name: string): void {
  const p = m.querySelector<SVGGElement>(`.home-part[data-part="${name}"]`)
  if (p)
    measurePart(rimLine(svg), p, m)
}

/** A computed animation time ("1.4s", "1420ms", "1s, 300ms") in ms. */
function timeMs(value: string): number {
  let out = 0
  for (const piece of value.split(',')) {
    const n = Number.parseFloat(piece)
    if (!Number.isFinite(n))
      continue
    out = Math.max(out, piece.trim().endsWith('ms') ? n : n * 1000)
  }
  return out
}

/**
 * The order the machine comes apart in.
 *
 * Each part's own place in the build is the moment its entry animation lands —
 * read off the running rule rather than guessed from --step, which only counts
 * within a sub-assembly — and the exit is that list turned upside down: the
 * last part fitted is the first to go, so the machine is taken down from the
 * top. The gaps are levelled to one beat, because the build's own gaps are
 * hundreds of milliseconds apart and a disassembly at that pace would drag.
 */
/**
 * How far the typewriter's sheet has to travel to be wound back into its roller.
 *
 * It is not dropped with the rest of the machine: a sheet is wound on the
 * platen, so it goes back down its own axis. The strip stands 18 paper units
 * above the roller line at its freshest and every line the machine has typed
 * lifts it another line higher, so this is measured at the switch — every time,
 * not once, because the feed has moved since the last one.
 */
function measureSheetRewind(m: SVGGElement): void {
  for (const p of m.querySelectorAll<SVGGElement>('.home-part')) {
    const group = p.querySelector<SVGGElement>('.home-paper-group')
    const feed = p.querySelector<SVGGElement>('.home-sheet-feed')
    if (!group || !feed)
      continue
    const fed = Math.abs(Number(/translateY\((-?[\d.]+)px\)/.exec(group.style.transform)?.[1] ?? 0))
    feed.style.setProperty('--sheet-rewind', `${(22 + fed).toFixed(1)}px`)
  }
}

function scheduleExit(m: SVGGElement, svg: SVGSVGElement): number {
  // the rulings do not change between swaps, and reading computed style for
  // every chip in a toolbox is not free: rank a module once
  // the paper moves between switches, so its rewind is re-measured even when
  // the rest of the schedule comes from the cache
  measureSheetRewind(m)
  // the tool case's lid and stay are folded while the machine is off the
  // platform, so their fall was measured against a shut lid; they are open now
  remeasurePart(svg, m, 'tb-lid')
  remeasurePart(svg, m, 'tb-stay')
  const cached = m.dataset.exitMs
  if (cached)
    return Number(cached)
  // normally already done while the page sat idle (see precomputeDrops); this
  // only runs if the reader switched before that had a chance to happen
  measureDrops(svg, m)
  const parts = [...m.querySelectorAll<SVGGElement>('.home-part')]
  // a part can be fitted by a rule on the element itself or on something
  // inside it (a lid's panel, a strip of ribbon), so its place in the build is
  // the last of everything it carries
  const landedOf = (el: Element): number => {
    const cs = getComputedStyle(el)
    const delays = cs.animationDelay.split(',')
    const runs = cs.animationDuration.split(',')
    const counts = cs.animationIterationCount.split(',')
    const loopsOf = (i: number) => counts[i % counts.length].trim() === 'infinite'
    let landed = 0
    for (let i = 0; i < Math.max(delays.length, runs.length); i++) {
      const delay = timeMs(delays[i % delays.length])
      const run = timeMs(runs[i % runs.length])
      // a part that also runs a loop of its own was fitted when its entry
      // landed, not when the loop next comes round
      landed = Math.max(landed, loopsOf(i) ? delay : delay + run)
    }
    // a part can also be fitted by a transition rather than an animation (the
    // toolbox lid swings up on one), and those delays count the same way
    const trans = timeMs(cs.transitionDelay) + timeMs(cs.transitionDuration)
    landed = Math.max(landed, trans)
    for (const child of el.querySelectorAll('*'))
      landed = Math.max(landed, landedOf(child))
    return landed
  }
  const lands = parts.map(p => landedOf(p))
  const order = lands.map((at, i) => ({ at, i })).sort((a, b) => b.at - a.at)
  // a part should be gone, or nearly, before the next one lets go, or the
  // machine reads as a single mass sliding down instead of a stack coming apart
  const gap = Math.min(38, 900 / Math.max(1, order.length - 1))
  let end = 0
  order.forEach((entry, rank) => {
    const delay = rank * gap
    const drop = Number(parts[entry.i].style.getPropertyValue('--drop')) || 60
    parts[entry.i].style.setProperty('--exit-delay', `${delay.toFixed(0)}ms`)
    end = Math.max(end, delay + Math.min(300, Math.max(150, 90 + drop * 0.7)))
  })
  // The tool case's stay is bolted to the lid's face and leans on the rim: it
  // is one assembly with the lid, so it leaves on the lid's beat. Left to its
  // own rank it hung in the air for half a second after the lid had gone — a
  // rod standing over an empty case.
  const lid = m.querySelector<SVGGElement>('.home-part[data-part="tb-lid"]')
  const stay = m.querySelector<SVGGElement>('.home-part[data-part="tb-stay"]')
  if (lid && stay)
    stay.style.setProperty('--exit-delay', lid.style.getPropertyValue('--exit-delay') || '0ms')

  const total = Math.round(end + 40)
  // only a module that was actually standing can be ranked; one caught halfway
  // through a previous swap has no entry rules in force to read
  if (m.classList.contains('is-active'))
    m.dataset.exitMs = String(total)
  return total
}

/**
 * The turn, for screens without a pointer.
 *
 * Hover is not a thing on a phone, and tapping a key leaves the page, so the
 * platform turns itself over. A machine is never taken away while it is still
 * being put together or still playing: the turn waits for the entry animations
 * to finish (and, for the typewriter, for the sheet to finish typing), then
 * holds that machine for its own dwell before moving on. It stands still while
 * the tab is hidden or the stage is scrolled away, and it stops for good the
 * moment the reader takes over.
 */
function startCycle(s: State): void {
  if (!isCompact() || s.autoTimer || !s.whole)
    return
  const armedAt = performance.now()
  const wait = (): void => {
    s.autoTimer = 0
    if (!isCompact())
      return
    if (document.hidden || s.stage.dataset.idle) {
      s.autoTimer = window.setTimeout(wait, 600)
      return
    }
    const current = s.modules.find(m => Number(m.dataset.index) === s.active)
    // the incoming machine has no .is-active for the length of the exit: it is
    // not settled, it has not even arrived
    const arrived = !!current?.classList.contains('is-active')
    const typing = current?.dataset.module === 'posts' && s.shown < s.total
    if ((!arrived || typing || (current && !settled(current))) && performance.now() - armedAt < 16000) {
      s.autoTimer = window.setTimeout(wait, 250)
      return
    }
    const dwell = DWELL[current?.dataset.module ?? ''] ?? AUTO_SWAP
    s.autoTimer = window.setTimeout(() => {
      s.autoTimer = 0
      if (document.hidden || s.stage.dataset.idle || !isCompact()) {
        startCycle(s)
        return
      }
      setModule(s, (s.active + 1) % s.modules.length)
      startCycle(s)
    }, dwell)
  }
  s.autoTimer = window.setTimeout(wait, 250)
}

/** True when nothing one-shot is still running: the loops never settle, and
 *  they are not what the turn is waiting for. */
function settled(m: SVGGElement): boolean {
  return m.getAnimations({ subtree: true }).every((a) => {
    const loops = a.effect?.getTiming?.().iterations === Infinity
    return loops || a.playState !== 'running'
  })
}

function stopCycle(s: State): void {
  if (!s.autoTimer)
    return
  window.clearTimeout(s.autoTimer)
  s.autoTimer = 0
}

/**
 * Swap choreography: the outgoing machine is taken apart top down — each part
 * comes off its seat along its own axis and falls into the well — and only
 * once the last of it has gone through the deck does the incoming one ride up
 * on the platform and settle its own sub-assemblies in sequence.
 */
function setModule(s: State, index: number): void {
  if (index === s.active)
    return
  // the four fetched machines may still be on their way
  if (!s.modules.some(m => Number(m.dataset.index) === index))
    return
  if (s.stage.classList.contains('is-booting')) {
    // the deck is still building: remember the key, seat it when the lift arrives
    s.pending = index
    return
  }
  // a switch always plays, even if the stage was holding still off screen
  s.stage.removeAttribute('data-idle')
  // and it is taken apart in the wide view
  zoomOut(s)
  // the sheet stops feeding the moment the machine starts to come apart, or the
  // rewind distance measured a frame ago is already stale
  stopTour(s)
  const prev = s.modules.find(m => Number(m.dataset.index) === s.active)
  s.active = index
  window.clearTimeout(s.swapTimer)
  if (!prev || !prev.classList.contains('is-active') || prefersReducedMotion()) {
    applyModule(s, index)
    return
  }
  // the exit is timed off the entry rules still in force, so it has to be read
  // before the machine lets go of .is-active; .is-leaving keeps it on screen
  const exit = scheduleExit(prev, s.svg)
  prev.classList.remove('is-active')
  prev.classList.add('is-leaving')
  s.stage.classList.remove('is-swapping')
  s.stage.style.setProperty('--swap-ms', `${exit}ms`)
  void s.stage.offsetWidth
  s.stage.classList.add('is-swapping')
  // the old machine has gone through the deck: seat the new one, which then
  // takes its own time to clear the rim
  s.swapTimer = window.setTimeout(() => {
    s.swapTimer = 0
    applyModule(s, index)
  }, exit)
}

/**
 * 1200 ms: the chassis has built itself (chassis.css) and the device rides up
 * on the lift with the same choreography as a swap — the lift dips and rises,
 * the machine settles on it and its sub-assemblies seat in sequence.
 */
function seatDevice(s: State): void {
  s.stage.classList.remove('is-booting')
  const index = s.pending >= 0 ? s.pending : 0
  s.pending = -1
  s.active = index
  s.stage.classList.remove('is-swapping')
  // the lift rides up with the first machine over 1200 ms, as it always has
  s.stage.style.setProperty('--swap-ms', '880ms')
  void s.stage.offsetWidth
  s.stage.classList.add('is-swapping')
  applyModule(s, index)
  // the intro runs its own length from the lift, not from the page load, so a
  // preload wait never eats into the assembly
  s.bootEnd = window.setTimeout(() => {
    s.bootEnd = 0
    bootActive = false
    s.ready = true
    startTour(s)
    // prepare() has already measured every machine off the platform and fitted
    // the wall; doing it again over the whole 4467-path set was a ~600 ms block
    // on the last frame of the intro. Only the one-machine fallback needs it.
    if (!s.whole) {
      precomputeDrops(s)
      fitWall(s)
    }
    startCycle(s)
    placeProjection(s)
  }, BOOT_TOTAL - BOOT_DEVICE)
}

/**
 * Measure every module's fall while the page is idle.
 *
 * The first switch otherwise had to measure five machines — bounding boxes and
 * computed styles for a couple of hundred parts — inside the frame that starts
 * the disassembly, which is exactly the frame that must not stutter.
 */
function precomputeDrops(s: State): void {
  const run = () => {
    for (const m of s.modules) {
      measureDrops(s.svg, m)
      // and the point the camera aims at: the union of the machine's own parts,
      // read while it is off the platform (no transforms on it). The whole
      // module's box is no use — the projector's beam and the tag wall are
      // parts of it, and they reach far past the machine.
      let x0 = Number.POSITIVE_INFINITY
      let x1 = Number.NEGATIVE_INFINITY
      let y0 = Number.POSITIVE_INFINITY
      let y1 = Number.NEGATIVE_INFINITY
      for (const p of m.querySelectorAll<SVGGElement>('.home-part')) {
        const b = p.getBBox()
        if (!b.width || !b.height || b.width > 420 || b.height > 420)
          continue
        x0 = Math.min(x0, b.x)
        x1 = Math.max(x1, b.x + b.width)
        y0 = Math.min(y0, b.y)
        y1 = Math.max(y1, b.y + b.height)
      }
      if (x1 > x0 && y1 > y0) {
        m.dataset.focusX = String(Math.round((x0 + x1) / 2))
        m.dataset.focusY = String(Math.round(y0 + (y1 - y0) * 0.28))
      }
    }
  }
  if (typeof window.requestIdleCallback === 'function')
    window.requestIdleCallback(run, { timeout: 1500 })
  else
    window.setTimeout(run, 300)
}

/**
 * Take in the machines that arrived after the page painted.
 *
 * The stage is built for five and only ships one, so every query that walks the
 * machines has to be re-run once the rest are in the document: the swap, the
 * auto-turn and the fall distances all read this list.
 */
function adoptModules(s: State): void {
  s.modules = [...s.svg.querySelectorAll<SVGGElement>('.home-module')]
  s.caps = [...s.svg.querySelectorAll<SVGGElement>('.home-keycap')]
  s.channels = [...s.svg.querySelectorAll<SVGAElement>('.home-channel')]
  s.whole = true
}

/**
 * Fetch the four machines the page left out, then put them in the document in
 * one batch.
 *
 * Three things matter here, and all three were wrong in the first version:
 *
 * - it starts at mount, not on `window.load` — `load` waits for every resource,
 *   and the body font comes from a third-party CDN that can hold it for tens of
 *   seconds, which left four channels unreachable for that whole time;
 * - the four requests go out together, so the wait is one round trip rather than
 *   four;
 * - the markup is inserted in one go, before the intro starts. Inserting a
 *   machine mid-animation blocked the main thread for 80–380 ms each and that
 *   was the stutter on a first visit.
 */
async function prepare(s: State): Promise<void> {
  const urls = (s.stage.dataset.late || '').split(',').filter(Boolean)
  const group = s.svg.querySelector('.home-modules')
  if (!urls.length || !group)
    return
  // the machine already in the document counts as the first of five
  const total = urls.length + 1
  let done = 1
  s.stage.style.setProperty('--load', (done / total).toFixed(3))

  const texts = await Promise.all(urls.map(async (url) => {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(PRELOAD_TIMEOUT) })
      if (!res.ok)
        return ''
      const text = await res.text()
      done += 1
      s.stage.style.setProperty('--load', (done / total).toFixed(3))
      return text
    }
    catch {
      // one missing machine leaves one channel without its device; the keys are
      // still links, so the page degrades to navigation rather than to nothing
      return ''
    }
  }))

  // a View Transition may have torn the stage down while they were in flight
  if (!s.stage.isConnected)
    return

  const parser = new DOMParser()
  for (const text of texts) {
    if (!text)
      continue
    const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${text}</svg>`, 'image/svg+xml')
    for (const node of [...doc.documentElement.childNodes])
      group.appendChild(document.importNode(node, true))
  }

  adoptModules(s)
  // the machines that just arrived are measured now, off the platform, the way
  // the boot measures the first one
  precomputeDrops(s)
  fitWall(s)
  // the reel is not part of the intro; starting it here keeps its decode out of
  // the assembly (it was an ~800 ms block at the end of the intro)
  projectSection(document.documentElement.dataset.homeSection || '')
  s.stage.classList.add('is-prepared')
  startCycle(s)
  if (s.pending >= 0) {
    const index = s.pending
    s.pending = -1
    setModule(s, index)
  }
}

function mount(): void {
  const stage = document.querySelector<HTMLElement>(STAGE)
  if (!stage)
    return
  if (stage.dataset.stageReady)
    return
  const svg = stage.querySelector('svg')
  if (!svg)
    return
  stage.dataset.stageReady = '1'

  let lines: string[] = []
  try {
    lines = JSON.parse(stage.dataset.typed || '[]')
  }
  catch {
    // the excerpt arrives as a JSON attribute from the build. If it is malformed
    // the machine still has to come up: a stage with blank paper is a wrong page,
    // an exception here is a console half-built and no navigation at all.
    lines = []
  }

  const modules = [...svg.querySelectorAll<SVGGElement>('.home-module')]
  const caps = [...svg.querySelectorAll<SVGGElement>('.home-keycap')]
  const channels = [...svg.querySelectorAll<SVGAElement>('.home-channel')]
  const textEls = [...svg.querySelectorAll<SVGTextElement>('.home-typed-line')]
  const paper = svg.querySelector<SVGGElement>('.home-paper-group')
  const lever = svg.querySelector<SVGGElement>('.home-return-lever')
  const keys = new Map<string, SVGGElement>()
  for (const key of svg.querySelectorAll<SVGGElement>('.home-key')) {
    const id = key.getAttribute('data-key')
    if (id)
      keys.set(id, key)
  }

  const s: State = {
    stage,
    svg,
    lines,
    textEls,
    paper,
    lever,
    leverTimer: 0,
    line: 0,
    keys,
    shown: totalChars(lines),
    total: totalChars(lines),
    timer: 0,
    resume: 0,
    swapTimer: 0,
    zoomTimer: 0,
    zoomMaskTimer: 0,
    autoTimer: 0,
    bootTimer: 0,
    bootEnd: 0,
    preloadTimer: 0,
    pending: -1,
    ready: false,
    whole: !stage.dataset.late,
    modules,
    caps,
    channels,
    active: -1,
    cleanup: () => {},
  }

  // the projection is page-level: track the pointer from the document, not the
  // stage, and keep the flag alive for as long as this page is mounted
  const onProjectionMove = (event: PointerEvent) => {
    pointerX = event.clientX
    pointerY = event.clientY
    syncHover()
  }
  const onProjectionResize = () => {
    placeProjection(s)
    fitWall(s)
    refreshFrame()
    syncHover()
  }
  document.addEventListener('pointermove', onProjectionMove, { passive: true })
  window.addEventListener('resize', onProjectionResize, { passive: true })
  const detachProjection = () => {
    document.removeEventListener('pointermove', onProjectionMove)
    window.removeEventListener('resize', onProjectionResize)
  }

  // Reduced motion is about the animation, not about the controls: the branch
  // that seats the first machine now sits after the listeners are on, so a
  // reader with motion turned off can still switch sections and turn the dial.
  const reduced = prefersReducedMotion()

  // ---- the boot ----------------------------------------------------------
  // the chassis carries its own build, gated on .is-booting; the device is
  // held back (no .is-active) so its own assembly cannot run behind it
  if (!reduced) {
    stage.classList.add('is-booting')
    for (const m of modules)
      m.classList.remove('is-active')
    bootActive = true

    // start from a blank sheet and let the machine fill it
    s.shown = 0
    paint(s, 0)
  }

  const onKey = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey)
      return
    if (event.key === 'Tab')
      return
    const focus = event.target instanceof Element ? event.target : null
    const dial = focus?.closest('.home-dial')
    if (dial && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      cycleDial(dial)
      return
    }
    stopTour(s)
    typeOne(s)
    scheduleResume(s)
  }

  // moving over the machine only pauses the tour; it no longer tilts anything
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen')
      return
    stopTour(s)
    scheduleResume(s)
  }

  // tapping the machine types the next character; tapping a link just follows it
  const onPointerDown = (event: PointerEvent) => {
    const target = event.target instanceof Element ? event.target : null
    if (target?.closest('a, .home-dial'))
      return
    stopTour(s)
    typeOne(s)
    scheduleResume(s)
  }

  /** The resource case's three-position dial: 工具 → 学习 → 作者 → 工具. */
  const cycleDial = (dial: Element) => {
    const module = dial.closest('.home-module')
    if (!module)
      return
    const at = Number(module.getAttribute('data-position') || 0)
    module.setAttribute('data-position', String((at + 1) % 3))
  }

  const onClick = (event: Event) => {
    const target = event.target instanceof Element ? event.target : null
    const dial = target?.closest('.home-dial')
    if (!dial)
      return
    event.preventDefault()
    cycleDial(dial)
  }

  const onOver = (event: Event) => {
    // no hover on a touch screen: the keys navigate, they do not preview
    if (isCompact())
      return
    const target = event.target instanceof Element ? event.target : null
    const link = target?.closest('.home-channel')
    if (!link)
      return
    stopCycle(s)
    setModule(s, Number(link.getAttribute('data-index')))
  }

  const onFocus = (event: Event) => {
    if (isCompact())
      return
    const target = event.target instanceof Element ? event.target : null
    const link = target?.closest('.home-channel')
    if (link) {
      stopCycle(s)
      setModule(s, Number(link.getAttribute('data-index')))
    }
  }

  const onVisibility = () => {
    if (document.hidden) {
      stopTour(s)
    }
    else if (!s.timer) {
      startTour(s)
    }
  }

  // Nothing on the stage is on screen (the narrow layout puts it below the
  // copy): stop the loops rather than paint them. The build itself is left
  // alone — it is a one-shot and the reader may be about to scroll to it.
  const idleObserver = new IntersectionObserver(([entry]) => {
    if (!entry)
      return
    if (entry.isIntersecting) {
      stage.removeAttribute('data-idle')
      // the sheet only prints while someone can see it
      if (s.ready && document.documentElement.dataset.homeSection === 'posts')
        startTour(s)
    }
    else if (s.ready) {
      stage.dataset.idle = '1'
      stopTour(s)
    }
  }, { rootMargin: '160px' })
  idleObserver.observe(stage)

  window.addEventListener('keydown', onKey)
  stage.addEventListener('pointermove', onPointerMove, { passive: true })
  stage.addEventListener('pointerdown', onPointerDown, { passive: true })
  stage.addEventListener('pointerover', onOver, { passive: true })
  stage.addEventListener('click', onClick)
  stage.addEventListener('focusin', onFocus)
  document.addEventListener('visibilitychange', onVisibility)

  s.cleanup = () => {
    detachProjection()
    stopCycle(s)
    window.clearTimeout(s.zoomTimer)
    window.clearTimeout(s.zoomMaskTimer)
    window.clearTimeout(s.preloadTimer)
    window.removeEventListener('keydown', onKey)
    stage.removeEventListener('pointermove', onPointerMove)
    stage.removeEventListener('pointerdown', onPointerDown)
    stage.removeEventListener('pointerover', onOver)
    stage.removeEventListener('click', onClick)
    stage.removeEventListener('focusin', onFocus)
    document.removeEventListener('visibilitychange', onVisibility)
    idleObserver.disconnect()
  }

  state = s

  if (reduced) {
    // nothing assembles and nothing types: the machine is simply there, and
    // every control is already live
    s.ready = true
    setModule(s, 0)
    startCycle(s)
    placeProjection(s)
    fitWall(s)
    return
  }

  // The intro waits for the four fetched machines — injecting them while the
  // machine is already rising is what made a first visit stutter. The wait is
  // capped, so a slow or dead request can delay the intro but never cancel it.
  const mountedAt = performance.now()
  const preload = stage.dataset.late
    ? Promise.race([
        prepare(s),
        new Promise<void>((resolve) => {
          s.preloadTimer = window.setTimeout(resolve, PRELOAD_DEADLINE)
        }),
      ])
    : Promise.resolve()

  preload.then(() => {
    window.clearTimeout(s.preloadTimer)
    s.preloadTimer = 0
    // the console is allowed its own beat before the lift moves
    const wait = Math.max(0, BOOT_DEVICE - (performance.now() - mountedAt))
    s.bootTimer = window.setTimeout(() => {
      s.bootTimer = 0
      seatDevice(s)
    }, wait)
  })
}

function unmount(): void {
  // the projection is page-level, so it must stop even when the reduced-motion
  // bail-out left no state behind
  stopScreening()
  bootActive = false
  document.documentElement.removeAttribute('data-home-section')
  if (!state)
    return
  stopTour(state)
  if (state.resume)
    window.clearTimeout(state.resume)
  if (state.swapTimer)
    window.clearTimeout(state.swapTimer)
  if (state.leverTimer)
    window.clearTimeout(state.leverTimer)
  // the page may be left mid-boot: every timer and the gate go with it
  if (state.bootTimer)
    window.clearTimeout(state.bootTimer)
  if (state.bootEnd)
    window.clearTimeout(state.bootEnd)
  state.resume = 0
  state.swapTimer = 0
  state.bootTimer = 0
  state.bootEnd = 0
  state.stage.classList.remove('is-swapping')
  state.stage.classList.remove('is-booting')
  state.cleanup()
  state = null
}

function boot(): void {
  const stage = document.querySelector<HTMLElement>(STAGE)
  if (stage?.dataset.stageReady)
    return
  unmount()
  mount()
}

document.addEventListener('astro:page-load', boot)
document.addEventListener('astro:before-swap', unmount)

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', boot, { once: true })
else
  boot()
