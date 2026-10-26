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
/** chassis (0 → 1.2 s) + device (1.2 → 3 s): the page is whole at three */
const BOOT_TOTAL = 3000
/** the projector threads the film before the reel rolls (the cinema's build) */
const SCREEN_DELAY = 900
/** the frame's rect is cached; layout is re-read at most this often */
const RECT_TTL = 250

interface State {
  stage: HTMLElement
  svg: SVGSVGElement
  lines: string[]
  textEls: SVGTextElement[]
  paper: SVGGElement | null
  keys: Map<string, SVGGElement>
  shown: number
  total: number
  timer: number
  resume: number
  swapTimer: number
  bootTimer: number
  bootEnd: number
  /** a key chosen while the chassis is still building, seated at 1200 ms */
  pending: number
  /** false until the boot is over: the tour waits for a whole page */
  ready: boolean
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
  group.style.transform = `translateY(${(-line * leading).toFixed(2)}px)`
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
 * Which machine is on the platform. Hovering a key swaps it, and it stays
 * swapped until another key is chosen — the reader's selection is not undone
 * by moving the pointer away.
 */
function applyModule(s: State, index: number): void {
  let section = ''
  for (const m of s.modules) {
    const on = Number(m.dataset.index) === index
    m.classList.remove('is-leaving')
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
  document.documentElement.dataset.homeSection = section
  projectSection(section)
}

/**
 * Swap choreography: the outgoing machine drops through the deck while the
 * lift dips, then the incoming one rides up on the platform and its
 * sub-assemblies settle in sequence (see .home-part in home.css).
 */
function setModule(s: State, index: number): void {
  if (index === s.active)
    return
  if (s.stage.classList.contains('is-booting')) {
    // the deck is still building: remember the key, seat it when the lift arrives
    s.pending = index
    return
  }
  const prev = s.modules.find(m => Number(m.dataset.index) === s.active)
  s.active = index
  window.clearTimeout(s.swapTimer)
  if (!prev || prefersReducedMotion()) {
    applyModule(s, index)
    return
  }
  prev.classList.add('is-leaving')
  s.stage.classList.remove('is-swapping')
  void s.stage.offsetWidth
  s.stage.classList.add('is-swapping')
  s.swapTimer = window.setTimeout(() => {
    s.swapTimer = 0
    applyModule(s, index)
  }, 180)
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
  void s.stage.offsetWidth
  s.stage.classList.add('is-swapping')
  applyModule(s, index)
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
    lines = []
  }

  const modules = [...svg.querySelectorAll<SVGGElement>('.home-module')]
  const caps = [...svg.querySelectorAll<SVGGElement>('.home-keycap')]
  const channels = [...svg.querySelectorAll<SVGAElement>('.home-channel')]
  const textEls = [...svg.querySelectorAll<SVGTextElement>('.home-typed-line')]
  const paper = svg.querySelector<SVGGElement>('.home-paper-group')
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
    keys,
    shown: totalChars(lines),
    total: totalChars(lines),
    timer: 0,
    resume: 0,
    swapTimer: 0,
    bootTimer: 0,
    bootEnd: 0,
    pending: -1,
    ready: false,
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
    refreshFrame()
    syncHover()
  }
  document.addEventListener('pointermove', onProjectionMove, { passive: true })
  window.addEventListener('resize', onProjectionResize, { passive: true })
  const detachProjection = () => {
    document.removeEventListener('pointermove', onProjectionMove)
    window.removeEventListener('resize', onProjectionResize)
  }

  if (prefersReducedMotion()) {
    // nothing assembles and nothing types: the machine is simply there
    s.ready = true
    setModule(s, 0)
    s.cleanup = detachProjection
    state = s
    return
  }

  // ---- the boot ----------------------------------------------------------
  // the chassis carries its own build, gated on .is-booting; the device is
  // held back (no .is-active) so its own assembly cannot run behind it
  stage.classList.add('is-booting')
  for (const m of modules)
    m.classList.remove('is-active')
  bootActive = true

  // start from a blank sheet and let the machine fill it
  s.shown = 0
  paint(s, 0)

  const onKey = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey)
      return
    if (event.key === 'Tab')
      return
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
    if (target?.closest('a'))
      return
    stopTour(s)
    typeOne(s)
    scheduleResume(s)
  }

  const onOver = (event: Event) => {
    const target = event.target instanceof Element ? event.target : null
    const link = target?.closest('.home-channel')
    if (!link)
      return
    setModule(s, Number(link.getAttribute('data-index')))
  }

  const onFocus = (event: Event) => {
    const target = event.target instanceof Element ? event.target : null
    const link = target?.closest('.home-channel')
    if (link)
      setModule(s, Number(link.getAttribute('data-index')))
  }

  const onVisibility = () => {
    if (document.hidden) {
      stopTour(s)
    }
    else if (!s.timer) {
      startTour(s)
    }
  }

  window.addEventListener('keydown', onKey)
  stage.addEventListener('pointermove', onPointerMove, { passive: true })
  stage.addEventListener('pointerdown', onPointerDown, { passive: true })
  stage.addEventListener('pointerover', onOver, { passive: true })
  stage.addEventListener('focusin', onFocus)
  document.addEventListener('visibilitychange', onVisibility)

  s.cleanup = () => {
    detachProjection()
    window.removeEventListener('keydown', onKey)
    stage.removeEventListener('pointermove', onPointerMove)
    stage.removeEventListener('pointerdown', onPointerDown)
    stage.removeEventListener('pointerover', onOver)
    stage.removeEventListener('focusin', onFocus)
    document.removeEventListener('visibilitychange', onVisibility)
  }

  state = s

  s.bootTimer = window.setTimeout(() => {
    s.bootTimer = 0
    seatDevice(s)
  }, BOOT_DEVICE)

  s.bootEnd = window.setTimeout(() => {
    s.bootEnd = 0
    bootActive = false
    s.ready = true
    // the reel may have been asked for while the console was still building
    projectSection(document.documentElement.dataset.homeSection || '')
    startTour(s)
  }, BOOT_TOTAL)
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
