/**
 * Home stage runtime.
 *
 * The machine is static SVG; this file drives what moves: the typewriter
 * striking keys and feeding its sheet, a slow camera breath while nobody is
 * touching it, and the pointer-driven orbit.
 *
 * The orbit is a real spring, not a lerp: the camera keeps a little momentum
 * after the pointer stops and settles back. It turns around the centre of mass
 * of the cabinet, which the server passes in viewBox units, so the model does
 * not slide sideways as it swings.
 *
 * Everything degrades to the server-rendered state when motion is reduced.
 */

const STAGE = '[data-home-stage]'
const TOUR_DELAY = 600
const TOUR_INTERVAL = 34
const RESUME_DELAY = 5200

/** degrees of orbit at the edge of the stage */
const MAX_TILT = 10
/** spring: how hard it pulls, and how much momentum it keeps */
const STIFF = 0.085
const DAMP = 0.80
/** idle breathing, small enough to read as a live camera */
const BREATH_Y = 1.15
const BREATH_X = 0.6
const BREATH_PERIOD = 3.6

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
  tiltRaf: number
  tx: number
  ty: number
  cx: number
  cy: number
  vx: number
  vy: number
  idle: boolean
  idleSince: number
  pivot: [number, number]
  viewBox: [number, number]
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

/** The line being struck stays at the roller; the sheet has fed up to it. */
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
  s.block.setAttribute('transform', `translate(0 ${(bottom - y).toFixed(2)})`)
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

/** Place the orbit's axis on the cabinet's centre of mass. */
function setPivot(s: State): void {
  const rect = s.stage.getBoundingClientRect()
  if (!rect.width || !rect.height)
    return
  const [vw, vh] = s.viewBox
  const scale = Math.min(rect.width / vw, rect.height / vh)
  const ox = (rect.width - vw * scale) / 2
  const oy = (rect.height - vh * scale) / 2
  const x = ((ox + s.pivot[0] * scale) / rect.width) * 100
  const y = ((oy + s.pivot[1] * scale) / rect.height) * 100
  s.svg.style.transformOrigin = `${x.toFixed(2)}% ${y.toFixed(2)}%`
}

function tiltLoop(s: State): void {
  if (s.idle) {
    const t = (performance.now() - s.idleSince) / 1000
    s.tx = Math.sin(t / BREATH_PERIOD) * BREATH_Y
    s.ty = Math.sin(t / (BREATH_PERIOD * 1.45)) * BREATH_X
  }
  s.vx = (s.vx + (s.tx - s.cx) * STIFF) * DAMP
  s.vy = (s.vy + (s.ty - s.cy) * STIFF) * DAMP
  s.cx += s.vx
  s.cy += s.vy
  s.stage.style.setProperty('--cam-y', s.cx.toFixed(3))
  s.stage.style.setProperty('--cam-x', s.cy.toFixed(3))
  const settled = !s.idle
    && Math.abs(s.tx - s.cx) < 0.01
    && Math.abs(s.ty - s.cy) < 0.01
    && Math.abs(s.vx) < 0.005
    && Math.abs(s.vy) < 0.005
  if (settled) {
    s.cx = s.tx
    s.cy = s.ty
    s.vx = 0
    s.vy = 0
    s.stage.style.setProperty('--cam-y', s.cx.toFixed(3))
    s.stage.style.setProperty('--cam-x', s.cy.toFixed(3))
    s.tiltRaf = 0
    return
  }
  s.tiltRaf = window.requestAnimationFrame(() => tiltLoop(s))
}

function nudgeTilt(s: State): void {
  if (!s.tiltRaf)
    s.tiltRaf = window.requestAnimationFrame(() => tiltLoop(s))
}

function goIdle(s: State): void {
  s.idle = true
  s.idleSince = performance.now()
  nudgeTilt(s)
}

/** Which machine is on the platform. Hovering a key swaps it. */
function setModule(s: State, index: number): void {
  if (index === s.active)
    return
  s.active = index
  for (const m of s.modules)
    m.classList.toggle('is-active', Number(m.dataset.index) === index)
  for (const c of s.caps)
    c.classList.toggle('is-active', Number(c.dataset.index) === index)
  for (const a of s.channels) {
    if (Number(a.dataset.index) === index)
      a.setAttribute('aria-current', 'page')
    else
      a.removeAttribute('aria-current')
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

  const viewBox = (stage.dataset.viewbox || '760 620').split(' ').map(Number) as [number, number]
  const pivot = (stage.dataset.pivot || '0 0').split(' ').map(Number) as [number, number]

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
    tiltRaf: 0,
    tx: 0,
    ty: 0,
    cx: 0,
    cy: 0,
    vx: 0,
    vy: 0,
    idle: false,
    idleSince: 0,
    pivot,
    viewBox,
    modules,
    caps,
    channels,
    active: -1,
    cleanup: () => {},
  }

  setModule(s, 0)
  setPivot(s)

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

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen')
      return
    const rect = stage.getBoundingClientRect()
    if (!rect.width || !rect.height)
      return
    const nx = (event.clientX - rect.left) / rect.width - 0.5
    const ny = (event.clientY - rect.top) / rect.height - 0.5
    s.idle = false
    s.tx = -nx * 2 * MAX_TILT
    s.ty = ny * 2 * MAX_TILT
    nudgeTilt(s)
    stopTour(s)
    scheduleResume(s)
  }

  const onPointerLeave = () => {
    goIdle(s)
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

  const onOut = () => setModule(s, 0)

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
    else {
      goIdle(s)
      if (!s.timer)
        startTour(s)
    }
  }

  let resizeRaf = 0
  const onResize = () => {
    if (resizeRaf)
      return
    resizeRaf = window.requestAnimationFrame(() => {
      resizeRaf = 0
      setPivot(s)
    })
  }

  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize)
  stage.addEventListener('pointermove', onPointerMove, { passive: true })
  stage.addEventListener('pointerleave', onPointerLeave, { passive: true })
  stage.addEventListener('pointerdown', onPointerDown, { passive: true })
  stage.addEventListener('pointerover', onOver, { passive: true })
  stage.addEventListener('pointerleave', onOut, { passive: true })
  stage.addEventListener('focusin', onFocus)
  document.addEventListener('visibilitychange', onVisibility)

  s.cleanup = () => {
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('resize', onResize)
    stage.removeEventListener('pointermove', onPointerMove)
    stage.removeEventListener('pointerleave', onPointerLeave)
    stage.removeEventListener('pointerdown', onPointerDown)
    stage.removeEventListener('pointerover', onOver)
    stage.removeEventListener('pointerleave', onOut)
    stage.removeEventListener('focusin', onFocus)
    document.removeEventListener('visibilitychange', onVisibility)
    if (s.tiltRaf)
      window.cancelAnimationFrame(s.tiltRaf)
    if (resizeRaf)
      window.cancelAnimationFrame(resizeRaf)
    stage.style.removeProperty('--cam-y')
    stage.style.removeProperty('--cam-x')
    svg.style.removeProperty('transform-origin')
  }

  state = s
  s.resume = window.setTimeout(() => startTour(s), TOUR_DELAY)
  window.setTimeout(() => {
    if (!s.idle && !s.timer)
      goIdle(s)
  }, 2600)
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
