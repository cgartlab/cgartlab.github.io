/**
 * Home stage runtime.
 *
 * The machine is static SVG; this file drives what moves: the typewriter
 * striking keys and feeding its sheet, the device swap, and the page-level
 * projection behind the 作品 section.
 *
 * There is no camera tilt. A rotation of the drawing plane only ever reads as
 * a sheet of paper turning, so the stage stays square to the reader.
 *
 * Everything degrades to the server-rendered state when motion is reduced.
 */

const STAGE = '[data-home-stage]'
const PROJECTION = '.home-projection'
const TOUR_DELAY = 600
const TOUR_INTERVAL = 34
const RESUME_DELAY = 5200

interface State {
  stage: HTMLElement
  svg: SVGSVGElement
  lines: string[]
  textEls: SVGTextElement[]
  block: SVGGElement | null
  keys: Map<string, SVGGElement>
  shown: number
  total: number
  timer: number
  resume: number
  modules: SVGGElement[]
  caps: SVGGElement[]
  channels: SVGAElement[]
  active: number
  cleanup: () => void
}

let state: State | null = null

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
 * The sheet feeds up one line at a time: the line being struck always sits at
 * the roller, and everything already typed rides up out of frame. The CSS
 * transition on `.home-typed-block` is what makes it a feed rather than a jump.
 */
function feed(s: State, count: number): void {
  if (!s.block)
    return
  const bottom = Number(s.block.dataset.bottom || 48)
  let line = 0
  let left = count
  for (let i = 0; i < s.lines.length && left > 0; i++) {
    left -= s.lines[i].length
    line = i
  }
  const el = s.textEls[line]
  const y = Number(el?.getAttribute('y') || 8)
  s.block.style.transform = `translateY(${(bottom - y).toFixed(2)}px)`
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
  s.timer = window.setTimeout(() => step(s), TOUR_INTERVAL)
}

function startTour(s: State): void {
  if (s.timer || s.shown >= s.total)
    return
  s.timer = window.setTimeout(() => step(s), TOUR_DELAY)
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

/** Only the 作品 section projects; everything else keeps the page quiet. */
function projectSection(section: string): void {
  const video = document.querySelector<HTMLVideoElement>(`${PROJECTION} video`)
  if (!video)
    return
  if (section === 'works') {
    // autoplay may be refused; the frame then simply keeps its poster
    video.play().catch(() => {})
  }
  else {
    video.pause()
  }
}

/**
 * Which machine is on the platform. Hovering a key swaps it, and it stays
 * swapped until another key is chosen — the reader's selection is not undone
 * by moving the pointer away.
 */
function setModule(s: State, index: number): void {
  if (index === s.active)
    return
  s.active = index
  let section = ''
  for (const m of s.modules) {
    const on = Number(m.dataset.index) === index
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
  const block = svg.querySelector<SVGGElement>('.home-typed-block')
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
    block,
    keys,
    shown: totalChars(lines),
    total: totalChars(lines),
    timer: 0,
    resume: 0,
    modules,
    caps,
    channels,
    active: -1,
    cleanup: () => {},
  }

  setModule(s, 0)

  if (prefersReducedMotion())
    return

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
    window.removeEventListener('keydown', onKey)
    stage.removeEventListener('pointermove', onPointerMove)
    stage.removeEventListener('pointerdown', onPointerDown)
    stage.removeEventListener('pointerover', onOver)
    stage.removeEventListener('focusin', onFocus)
    document.removeEventListener('visibilitychange', onVisibility)
  }

  state = s
  s.resume = window.setTimeout(() => startTour(s), TOUR_DELAY)
}

function unmount(): void {
  // the projection is page-level, so it must stop even when the reduced-motion
  // bail-out left no state behind
  projectSection('')
  document.documentElement.removeAttribute('data-home-section')
  if (!state)
    return
  stopTour(state)
  if (state.resume)
    window.clearTimeout(state.resume)
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
