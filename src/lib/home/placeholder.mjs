import * as k from '../anatomy/iso-kit.mjs'
import { TOP } from './chassis.mjs'

/**
 * Placeholder module — one section waiting for its own machine.
 * A brass index card standing on the lift platform, with the section's
 * initial engraved on it. Replaced by the real device later.
 */
export function buildPlaceholder(P, options = {}) {
  const letter = options.letter || '?'
  const caption = options.caption || ''
  const index = options.index ?? 0
  const out = []

  const baseZ = TOP
  const foot = { x: -54, y: -14, w: 108, d: 30, r: 3 }
  const card = { x: -50, y: -12, w: 100, d: 4, r: 2 }
  const cardH = 62

  // foot, sitting on the platform
  out.push(k.solidSvg(k.slabOf(foot, baseZ, 6, P, 5, 0.8), { tone: 'mid' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan(foot, 3), baseZ + 6, P, 5), { tone: 'faint' }))
  // two screws holding the card
  for (const x of [-42, 42]) {
    out.push(k.dotsSvg([k.iso([x, -6, baseZ + 6], P)], { size: 1.1, tone: 'mid' }))
    out.push(k.lineSvg(k.ring(x, -6, 2, baseZ + 6, P, 14), { tone: 'faint' }))
  }

  // the card
  out.push(k.solidSvg(k.slabOf(card, baseZ + 6, cardH, P, 4, 0.6), { tone: 'hi', className: 'home-card' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan(card, 4), baseZ + 6 + cardH, P, 4), { tone: 'faint' }))

  const face = card.y + card.d
  out.push(k.faceTextSvg(
    k.sideMatrix([0, face], baseZ + 6 + cardH * 0.33, P, 'left'),
    letter,
    { size: 30, tone: 'mid', anchor: 'middle' },
  ))
  if (caption) {
    out.push(k.faceTextSvg(
      k.sideMatrix([0, face], baseZ + 12.5, P, 'left'),
      caption,
      { size: 4.4, tone: 'faint', anchor: 'middle' },
    ))
  }
  // a small index number in the corner
  out.push(k.faceTextSvg(
    k.sideMatrix([-40, face], baseZ + 6 + cardH - 7, P, 'left'),
    `0${index + 1}`,
    { size: 3.2, tone: 'faint' },
  ))

  return out.join('')
}

export function placeholderBounds() {
  return [
    ...k.boxCorners({ x: -54, y: -14, w: 108, d: 30 }, TOP, TOP + 6),
    [-50, -12, TOP + 68],
    [50, -12, TOP + 68],
    [-50, -8, TOP + 68],
    [50, -8, TOP + 68],
  ]
}
