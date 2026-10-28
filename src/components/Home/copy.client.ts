/**
 * First light on the copy block.
 *
 * The headline and the line under it are not simply there when the page opens:
 * every character is scrambled first — the line reads as noise, in the accent —
 * and then the characters lock one after another until it is the real sentence.
 * It happens once in a session — a reader who comes back to the page finds the
 * sheet already set — and it is finished long before the machine on the
 * platform is built.
 *
 * Two rules shape it:
 *   - a scrambling glyph keeps the advance of the letter it will become, so the
 *     line never reflows while it is noise (worth fixing for the English
 *     headline, which wraps);
 *   - once the last character locks, the spans are thrown away and the element
 *     gets its own text back, so the settled line is laid out by the font
 *     exactly as it was authored — the fragile moment is over, not permanent.
 *
 * The rest of the sheet — header, section list, the latest line, the foot —
 * comes in on CSS (see "first light" in home.css), so it still arrives when
 * this script never runs.
 */

const COPY = '.home-copy'
const COPY_SEEN = 'cgartlab-copy-seen'
/** how often the headline drops a scanline, and for how long */
const SLIP_EVERY = 6500
const SLIP_FOR = 240

/** Where the noise comes from. CJK for CJK, so the boxes keep their width. */
const NOISE_CJK = '字墨印迹影光镜轴簧销楔齿槽轨标尺针页图版检录序偏旁部首构件栓凸轮杆簧片'
// narrow on purpose: the boxes are cut to the advance of the letters they stand
// in for, so a wide M or W would have to be shaved to fit
const NOISE_LATIN = '0123456789#+-*/=<>:;!?'

interface ScrambleOptions {
  /** when this line starts flickering */
  begin: number
  /** how long after its own begin a character locks */
  hold: number
  /** the whole line resolves inside this many milliseconds, whatever its length */
  beat: number
  /** how often a single glyph is re-rolled */
  rate: number
}

const prefersReducedMotion = (): boolean =>
  document.documentElement.classList.contains('reduce-motion')
  || window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Break a line into one span per character, then roll noise in each until its
 * own moment. Spaces stay as text nodes: an inline-block space would stop the
 * line from wrapping where it should.
 */
function scramble(el: HTMLElement, { begin, hold, beat, rate }: ScrambleOptions): void {
  const source = el.textContent ?? ''
  if (!source.trim())
    return
  const cjk = /[\u2E80-\u9FFF\uF900-\uFAFF]/.test(source)
  const pool = cjk ? NOISE_CJK : NOISE_LATIN
  // Latin noise glyphs are wider than the letter they stand in for, so the box
  // has to cut them off rather than let them run over their neighbours
  el.dataset.scramble = cjk ? 'cjk' : 'latin'
  // while the glyphs are noise the accessible name is the line itself: a screen
  // reader must never be handed the scramble
  el.setAttribute('aria-label', source)

  el.textContent = ''
  const spans: HTMLSpanElement[] = []
  for (const ch of source) {
    // only letters and figures are scrambled: the separators between the
    // disciplines stay put, the way a printed sheet keeps its rules
    if (!/[\p{L}\p{N}]/u.test(ch)) {
      el.append(document.createTextNode(ch))
      continue
    }
    const span = document.createElement('span')
    span.className = 'home-glyph is-noise'
    span.textContent = ch
    span.dataset.glyph = ch
    el.append(span)
    spans.push(span)
  }
  // the advance is read off the settled glyph, so the noise can never push the
  // line into a different wrap
  const measure = (): void => {
    // three passes, not a write/read pair per glyph: writing then reading then
    // writing again forced the browser to lay the line out once per character
    for (const span of spans)
      span.style.width = 'auto'
    const widths = spans.map(span => span.getBoundingClientRect().width)
    spans.forEach((span, i) => {
      span.style.width = `${widths[i].toFixed(2)}px`
    })
  }
  measure()
  // if the webfont swaps in mid-run, the advances move with it
  void document.fonts.ready.then(measure)

  // a long line locks faster than a short one: the sweep takes the same beat
  // down the line either way
  const step = Math.min(64, beat / Math.max(1, spans.length - 1))
  const glyphs = spans.map((indexed, index) => ({
    span: indexed,
    to: indexed.dataset.glyph ?? '',
    lock: begin + index * step + hold,
    next: 0,
  }))
  const started = performance.now()
  const settle = (): void => {
    for (const glyph of glyphs) {
      glyph.span.textContent = glyph.to
      glyph.span.classList.remove('is-noise')
    }
    el.textContent = source
    el.removeAttribute('aria-label')
    delete el.dataset.scramble
  }

  const tick = (now: number): void => {
    const at = now - started
    let live = false
    for (const glyph of glyphs) {
      if (at >= glyph.lock) {
        if (glyph.span.textContent !== glyph.to) {
          glyph.span.textContent = glyph.to
          glyph.span.classList.remove('is-noise')
        }
        continue
      }
      live = true
      if (now >= glyph.next) {
        glyph.span.textContent = pool[Math.floor(Math.random() * pool.length)]
        glyph.next = now + rate
      }
    }
    if (live)
      requestAnimationFrame(tick)
    else
      settle()
  }
  requestAnimationFrame(tick)
}

/**
 * The readout in the foot counts up to its own numbers, then stops being a
 * counter: the text is put back exactly as the server drew it.
 */
function countUp(el: HTMLElement, delay: number, duration: number): void {
  const source = el.textContent ?? ''
  const numbers = [...source.matchAll(/\d[\d,]*/g)]
  if (!numbers.length)
    return
  const parts = numbers.map(match => ({
    at: match.index ?? 0,
    raw: match[0],
    value: Number(match[0].replace(/,/g, '')),
    grouped: match[0].includes(','),
  }))
  const started = performance.now() + delay
  const render = (now: number): void => {
    const p = Math.min(1, Math.max(0, (now - started) / duration))
    if (p >= 1) {
      el.textContent = source
      return
    }
    const eased = 1 - (1 - p) ** 3
    let out = ''
    let cursor = 0
    for (const part of parts) {
      const value = Math.round(part.value * eased)
      out += source.slice(cursor, part.at)
      out += part.grouped ? value.toLocaleString('en-US') : String(value)
      cursor = part.at + part.raw.length
    }
    el.textContent = out + source.slice(cursor)
    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}

let slipTimer = 0
let slipOut = 0

/**
 * The headline's hiccup, on a clock instead of a six-and-a-half second loop.
 * The burst is 180 ms; running it as an infinite animation meant the compositor
 * was asked for a frame every frame of every second to show it.
 */
function startSlips(title: HTMLElement): void {
  window.clearInterval(slipTimer)
  window.clearTimeout(slipOut)
  title.classList.remove('is-slipping')
  slipTimer = window.setInterval(() => {
    // the page may have been swapped away under this timer
    if (!title.isConnected) {
      window.clearInterval(slipTimer)
      slipTimer = 0
      return
    }
    if (document.hidden)
      return
    title.classList.add('is-slipping')
    window.clearTimeout(slipOut)
    slipOut = window.setTimeout(() => title.classList.remove('is-slipping'), SLIP_FOR)
  }, SLIP_EVERY)
}

function bootCopy(): void {
  const copy = document.querySelector<HTMLElement>(COPY)
  if (!copy || copy.dataset.copyReady)
    return
  copy.dataset.copyReady = '1'
  // the page hid the copy so it could not be read settled before the scramble;
  // from here on the spans are what is on screen
  document.documentElement.classList.remove('copy-arming')
  document.documentElement.classList.add('copy-ready')
  if (prefersReducedMotion())
    return
  const titleEl = copy.querySelector<HTMLElement>('.home-title')
  if (titleEl)
    startSlips(titleEl)
  // once per session, not once per visit: coming back to the home page should
  // find the sheet already set, not scramble it again
  try {
    if (sessionStorage.getItem(COPY_SEEN) === '1')
      return
    sessionStorage.setItem(COPY_SEEN, '1')
  }
  catch {}

  const title = copy.querySelector<HTMLElement>('.home-title')
  const sub = copy.querySelector<HTMLElement>('.home-sub')
  const readout = document.querySelector<HTMLElement>('.home-readout')

  // straight away: the line is under the reader's eye from the first frame, so
  // it is scrambled from the first frame too. The advances are re-measured when
  // the webfont lands (see scramble), so a late font cannot break the wrap.
  if (title)
    scramble(title, { begin: 140, hold: 0, beat: 620, rate: 44 })
  if (sub)
    scramble(sub, { begin: 600, hold: 160, beat: 700, rate: 34 })
  if (readout)
    countUp(readout, 900, 1100)
}

document.addEventListener('astro:page-load', bootCopy)
if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', bootCopy, { once: true })
else
  bootCopy()

export {}
