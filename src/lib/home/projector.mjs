import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 03 — the film projector that carries the column.
 *
 * Two upright reels, a lens looking at the reader, and a gate between them.
 * The camera is nearly head-on, so the reels are drawn face-on and the lens
 * reads as concentric rings.
 */

const BODY = { x: -88, y: -38, w: 176, d: 76, r: 8 }
const BODY_H = 46
const FRONT = BODY.y + BODY.d

const REEL_R = 30
const REEL_Z = TOP + BODY_H + 30
const REEL_X = 46

const LENS = { y: FRONT, z: TOP + 26, r: 13, length: 18 }

export function buildProjector(P, options = {}) {
  const caption = options.caption || ''
  const issue = options.issue || 'No.16'
  const out = []

  // body
  out.push(k.solidSvg(k.slabOf(BODY, TOP, BODY_H, P, 8, 2), { tone: 'mid', className: 'home-proj-body' }))
  out.push(k.lineSvg(k.sideSeam(BODY, TOP + BODY_H, P, 8), { tone: 'faint' }))
  // a machined lid
  out.push(k.solidSvg(k.slabOf(k.insetPlan(BODY, 5), TOP + BODY_H, 3, P, 8, 1), { tone: 'hi' }))

  // reel arms
  for (const side of [-1, 1]) {
    out.push(k.solidSvg(k.slabOf({ x: side * REEL_X - 5, y: -12, w: 10, d: 24, r: 2 }, TOP + BODY_H, 34, P, 4, 1), { tone: 'mid' }))
  }

  // reels
  for (const side of [-1, 1]) {
    const F = G.frameAlong([side * REEL_X, -6, REEL_Z], [0, 1, 0])
    // an open reel: rim, inner flange and hub, with air between the spokes
    out.push(k.solidSvg(G.ringBand(0, 5, REEL_R - 6, REEL_R, F, P), { tone: 'mid', className: 'home-reel' }))
    out.push(k.solidSvg(G.ringBand(4.4, 6, REEL_R - 9, REEL_R - 5.2, F, P), { tone: 'lo', className: 'home-reel' }))
    out.push(k.solidSvg(G.disc(0, 7, 8, F, P), { tone: 'mid', className: 'home-reel' }))
    out.push(k.lineSvg(G.circleOf(F, 5.4, REEL_R - 7.5, P), { tone: 'faint' }))
    // three spokes on the face
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4
      out.push(k.lineSvg(k.segment(
        [side * REEL_X + Math.cos(a) * 8, -0.8, REEL_Z + Math.sin(a) * 8],
        [side * REEL_X + Math.cos(a) * (REEL_R - 8), -0.8, REEL_Z + Math.sin(a) * (REEL_R - 8)],
        P,
      ), { tone: 'mid' }))
    }
  }

  // film between the reels
  out.push(k.lineSvg(k.segment([-REEL_X + REEL_R - 6, -0.6, REEL_Z + 18], [REEL_X - REEL_R + 6, -0.6, REEL_Z + 18], P), { tone: 'mid' }))
  out.push(k.lineSvg(k.segment([-REEL_X + REEL_R - 6, -0.6, REEL_Z + 26], [REEL_X - REEL_R + 6, -0.6, REEL_Z + 26], P), { tone: 'mid' }))

  // lamp house with fins
  out.push(k.solidSvg(k.cylinder(0, -18, 13, TOP + BODY_H + 3, 16, P, 26), { tone: 'mid' }))
  for (let i = 0; i < 4; i++) {
    out.push(k.lineSvg(k.sideArc(0, -18, 13, TOP + BODY_H + 5 + i * 3.4, P, 20), { tone: 'faint' }))
  }
  out.push(k.solidSvg(k.cylinder(0, -18, 9, TOP + BODY_H + 19, 3, P, 20), { tone: 'lo' }))

  // lens barrel, looking at the reader
  const lensF = G.frameAlong([0, LENS.y, LENS.z], [0, 1, 0])
  out.push(k.solidSvg(G.disc(0, LENS.length, LENS.r, lensF, P), { tone: 'hi' }))
  out.push(k.solidSvg(G.ringBand(LENS.length - 3, LENS.length, LENS.r - 1.5, LENS.r + 1.2, lensF, P), { tone: 'mid' }))
  out.push(k.solidSvg(G.disc(LENS.length, LENS.length + 1.4, LENS.r - 3.2, lensF, P), { tone: 'lo' }))
  out.push(k.lineSvg(G.circleOf(lensF, LENS.length + 1.5, LENS.r - 5.6, P), { tone: 'faint' }))

  // focus ring
  out.push(k.lineSvg(
    Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2
      return G.arcOf(lensF, LENS.length - 6, LENS.r + 0.4, P, { from: a, to: a + 0.12, steps: 2 })
    }).join(''),
    { tone: 'faint' },
  ))

  // controls on the front face
  for (const x of [-62, 62]) {
    const knob = G.frameAlong([x, FRONT, TOP + 14], [0, 1, 0])
    out.push(k.solidSvg(G.disc(0, 5, 7, knob, P), { tone: 'mid' }))
    out.push(k.lineSvg(G.circleOf(knob, 5.1, 4.2, P), { tone: 'faint' }))
    out.push(k.lineSvg(k.segment([x, FRONT + 5.2, TOP + 14], [x, FRONT + 5.2, TOP + 19], P), { tone: 'hi' }))
  }

  // engraved name
  out.push(k.faceTextSvg(
    k.sideMatrix([0, FRONT], TOP + 17, P, 'left'),
    `${issue} / 24`,
    { size: 5.2, tone: 'hi', anchor: 'middle' },
  ))
  if (caption) {
    out.push(k.faceTextSvg(
      k.sideMatrix([0, FRONT], TOP + 10, P, 'left'),
      caption,
      { size: 3.2, tone: 'faint', anchor: 'middle' },
    ))
  }

  return out.join('')
}

export function projectorBounds() {
  return [
    ...k.boxCorners(BODY, TOP, TOP + BODY_H + 4),
    [-REEL_X - REEL_R, -6, REEL_Z + REEL_R],
    [REEL_X + REEL_R, -6, REEL_Z + REEL_R],
    [0, FRONT + LENS.length + 2, LENS.z],
  ]
}
