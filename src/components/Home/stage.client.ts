/**
 * Home stage runtime.
 *
 * The machine is static SVG; this file only drives what moves: the typewriter
 * striking keys, the paper filling with the latest headline, the idle tour, and
 * the small camera tilt that follows the pointer.
 *
 * Everything degrades to the server-rendered state when motion is reduced.
 */

const STAGE = '[data-home-stage]'
const TOUR_DELAY = 600
const TOUR_INTERVAL = 55
const RESUME_DELAY = 6000
const TILT_Y = 6.2
const TILT_X = 3.2
const EASE = 0.14

interface State {
  stage: HTMLElement
  svg: SVGSVGElement
  lines: string[]
  textEls: SVGTextElement[]
  keys: Map<string, SVGGElement>
  shown: number
  total: number
  timer: number
  resume: number
  raf: number
  tiltRaf: number
  tx: number
  ty: number
  cx: number
  cy: number
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
}

function strike(s: State, char: string): void {
  const key = s.keys.get(char.toLowerCase())
    ?? s.keys.get([...s.keys.keys()][s.shown % s.keys.size])
  if (!key)
    return
  key.classList.add('is-down')
  window.setTimeout(() => key.classList.remove('is-down'), 90)
}

function step(s: State): void {
  if (s.shown >= s.total) {
    s.timer = 0
    return
  }
  const all = s.lines.join('')
  const char = all[s.shown] ?? ''
  s.shown += 1
  paint(s, s.shown)
  if (char.trim())
    strike(s, char)
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

function tiltLoop(s: State): void {
  s.cx += (s.tx - s.cx) * EASE
  s.cy += (s.ty - s.cy) * EASE
  s.stage.style.setProperty('--tilt-y', s.cx.toFixed(3))
  s.stage.style.setProperty('--tilt-x', s.cy.toFixed(3))
  const settled = Math.abs(s.tx - s.cx) < 0.01 && Math.abs(s.ty - s.cy) < 0.01
  if (settled) {
    s.cx = s.tx
    s.cy = s.ty
    s.stage.style.setProperty('--tilt-y', s.cx.toFixed(3))
    s.stage.style.setProperty('--tilt-x', s.cy.toFixed(3))
    s.tiltRaf = 0
    return
  }
  s.tiltRaf = window.requestAnimationFrame(() => tiltLoop(s))
}

function nudgeTilt(s: State): void {
  if (!s.tiltRaf)
    s.tiltRaf = window.requestAnimationFrame(() => tiltLoop(s))
}

function mount(): void {
  const stage = document.querySelector<HTMLElement>(STAGE)
  if (!stage)
    return
  const svg = stage.querySelector('svg')
  if (!svg)
    return

  let lines: string[] = []
  try {
    lines = JSON.parse(stage.dataset.typed || '[]')
  }
  catch {
    lines = []
  }

  const textEls = [...svg.querySelectorAll<SVGTextElement>('.home-typed-line')]
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
    keys,
    shown: totalChars(lines),
    total: totalChars(lines),
    timer: 0,
    resume: 0,
    raf: 0,
    tiltRaf: 0,
    tx: 0,
    ty: 0,
    cx: 0,
    cy: 0,
    cleanup: () => {},
  }

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
    if (s.shown < s.total) {
      const char = s.lines.join('')[s.shown] ?? ''
      s.shown += 1
      paint(s, s.shown)
      if (char.trim())
        strike(s, char)
    }
    scheduleResume(s)
  }

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen')
      return
    const rect = stage.getBoundingClientRect()
    if (!rect.width || !rect.height)
      return
    const nx = (event.clientX - rect.left) / rect.width - 0.5
    const ny = (event.clientY - rect.top) / rect.height - 0.5
    s.tx = -nx * 2 * TILT_Y
    s.ty = ny * 2 * TILT_X
    nudgeTilt(s)
    stopTour(s)
    scheduleResume(s)
  }

  const onPointerLeave = () => {
    s.tx = 0
    s.ty = 0
    nudgeTilt(s)
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
  stage.addEventListener('pointerleave', onPointerLeave, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)

  s.cleanup = () => {
    window.removeEventListener('keydown', onKey)
    stage.removeEventListener('pointermove', onPointerMove)
    stage.removeEventListener('pointerleave', onPointerLeave)
    document.removeEventListener('visibilitychange', onVisibility)
    if (s.tiltRaf)
      window.cancelAnimationFrame(s.tiltRaf)
    stage.style.removeProperty('--tilt-y')
    stage.style.removeProperty('--tilt-x')
  }

  state = s
  s.resume = window.setTimeout(() => startTour(s), TOUR_DELAY)
}

function unmount(): void {
  if (!state)
    return
  stopTour(state)
  if (state.resume)
    window.clearTimeout(state.resume)
  state.cleanup()
  state = null
}

function boot(): void {
  unmount()
  mount()
}

document.addEventListener('astro:page-load', boot)
document.addEventListener('astro:before-swap', unmount)
