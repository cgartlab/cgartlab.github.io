import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { TOP } from './chassis.mjs'

/**
 * Module 04 — the data server that carries "资源".
 * A 1960s cabinet standing on a recessed toe-kick: an inset front door under a
 * machined lid, two tape reels turning in the upper half, a patch panel and a
 * nixie strip below them, lamp rails down both edges. The camera is nearly
 * head-on, so the door carries the whole design; every fitting is seated on it.
 */

const BODY = { x: -80, y: -30, w: 160, d: 56, r: 6 }
const HALF = BODY.w / 2
const FRONT = BODY.y + BODY.d
const PLINTH = k.insetPlan(BODY, 6)
const PLINTH_H = 5
const BASE = TOP + PLINTH_H
const LID_Z = BASE + 94
const LID = k.insetPlan(BODY, 4)
const FACE = FRONT - 0.8
const RECESS = FACE - 1.4
const DOOR = { x: -74, y: FRONT - 3.2, w: 148, d: 2.4, r: 3 }
const DOOR_Z0 = BASE + 6, DOOR_Z1 = LID_Z - 4
const GRIP = { w: 9, d: 19, y: 8, z: BASE + 56, h: 16 }
const REEL_X = 19, REEL_R = 14.5, REEL_Z = TOP + 79
const PATCH = { x: -30, w: 60, z0: TOP + 48, z1: TOP + 62 }
const NIX = { x: -28, w: 56, z0: TOP + 37, z1: TOP + 46, z: TOP + 41.5 }
const GRILLE_Z = TOP + 17
const RAIL_X = 58, RAIL_Z = TOP + 35

/** A rectangle laid on a face that looks at the reader. */
const faceQuad = (x0, z0, x1, z1, y) => k.pathOf([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true)

/** A sunken plate let into the door. */
function recess(x, w, z0, z1, P) {
  return k.solidSvg(k.slabOf({ x, y: RECESS - 1.4, w, d: 1.4, r: 2 }, z0, z1 - z0, P, 4, 0.4), { tone: 'lo' })
}

/** A patch jack: a small barrel looking at the reader. */
function jack(x, z, P) {
  const F = G.frameAlong([x, RECESS, z], [0, 1, 0])
  return k.solidSvg(G.disc(0, 2, 1.5, F, P), { tone: 'mid' })
    + k.lineSvg(G.circleOf(F, 2, 0.8, P), { tone: 'faint' })
}

/** A tape reel: flange, wound pack, bright hub, three flange screws. */
function reel(x, P) {
  const F = G.frameAlong([x, FACE, REEL_Z], [0, 1, 0])
  const screws = [0, 1, 2].map((i) => {
    const a = (i / 3) * Math.PI * 2 + 0.6
    return k.iso([x + Math.cos(a) * (REEL_R - 1.6), FACE + 2.3, REEL_Z + Math.sin(a) * (REEL_R - 1.6)], P)
  })
  return k.solidSvg(G.disc(0, 2.2, REEL_R, F, P), { tone: 'mid' })
    + k.solidSvg(G.disc(2.2, 4.4, REEL_R - 3.6, F, P), { tone: 'lo' })
    + k.solidSvg(G.disc(4.4, 5.8, 4.2, F, P), { tone: 'hi' })
    + k.lineSvg(G.circleOf(F, 2.3, REEL_R - 1.1, P), { tone: 'faint' })
    + k.lineSvg(G.circleOf(F, 4.5, 9, P), { tone: 'faint' })
    + k.dotsSvg(screws, { size: 0.7, tone: 'hi' })
}

export function buildServer(P, options = {}) {
  const caption = options.caption || ''
  const out = []

  // recessed toe-kick, cabinet shell, machined lid — far to near
  out.push(k.solidSvg(k.slabOf(PLINTH, TOP, PLINTH_H, P, 8, 0.8), { tone: 'lo' }))
  out.push(k.solidSvg(k.slabOf(BODY, BASE, LID_Z - BASE, P, 8, 1.2), { tone: 'mid' }))
  out.push(k.solidSvg(k.slabOf(LID, LID_Z, 3, P, 8, 0.6), { tone: 'hi' }))
  out.push(k.lineSvg(k.planOutline(k.insetPlan(LID, 5), LID_Z + 3, P, 8), { tone: 'faint' }))

  // carry handles, bolted to both sides
  for (const side of [-1, 1]) {
    const x = side > 0 ? HALF : -HALF - GRIP.w
    out.push(k.solidSvg(k.slabOf({ x, y: GRIP.y, w: GRIP.w, d: GRIP.d, r: 2 }, GRIP.z, GRIP.h, P, 4, 0.6), { tone: 'mid' }))
    out.push(k.lineSvg(faceQuad(x + 2.2, GRIP.z + 3, x + GRIP.w - 2.2, GRIP.z + GRIP.h - 3, GRIP.y + GRIP.d), { tone: 'faint' }))
  }

  // the inset front door and the seam that parts it from the frame
  out.push(k.solidSvg(k.slabOf(DOOR, DOOR_Z0, DOOR_Z1 - DOOR_Z0, P, 6, 0.8), { tone: 'lo' }))
  out.push(k.lineSvg(faceQuad(DOOR.x - 1.4, DOOR_Z0 - 1.4, DOOR.x + DOOR.w + 1.4, DOOR_Z1 + 1.4, FRONT), { tone: 'faint' }))

  // ventilation grille, eight slots
  for (let i = 0; i < 8; i++) {
    const z = GRILLE_Z + i * 2.4
    out.push(k.lineSvg(k.segment([-46, FACE + 0.2, z], [46, FACE + 0.2, z], P), { tone: 'lo' }))
  }

  // nixie readout strip: four short barrels, each with a lit tip
  out.push(recess(NIX.x, NIX.w, NIX.z0, NIX.z1, P))
  for (const x of [-18, -6, 6, 18]) {
    const F = G.frameAlong([x, RECESS, NIX.z], [0, 1, 0])
    out.push(k.solidSvg(G.disc(0, 4.6, 3.1, F, P), { tone: 'lo' }))
    out.push(k.solidSvg(G.disc(4.6, 5.6, 1.9, F, P), { tone: 'hi' }))
    out.push(k.lineSvg(G.circleOf(F, 4.7, 3.2, P), { tone: 'faint' }))
  }

  // patch panel: six by two jacks in a sunken plate
  out.push(recess(PATCH.x, PATCH.w, PATCH.z0, PATCH.z1, P))
  for (let row = 0; row < 2; row++) for (let column = 0; column < 6; column++) out.push(jack(-20 + column * 8, PATCH.z0 + 4.5 + row * 5, P))

  // the two tape reels, side by side in the upper half
  out.push(reel(-REEL_X, P))
  out.push(reel(REEL_X, P))

  // lamp rails down both edges of the door
  for (const x of [-RAIL_X, RAIL_X]) {
    out.push(k.lineSvg(k.segment([x, FACE + 0.2, RAIL_Z], [x, FACE + 0.2, RAIL_Z + 56], P), { tone: 'faint' }))
    for (let band = 0; band < 3; band++) {
      const dots = []
      for (let i = band; i < 15; i += 3) dots.push(k.iso([x, FACE + 0.3, RAIL_Z + i * 4], P))
      out.push(k.dotsSvg(dots, { size: 0.75 + band * 0.28, tone: band === 1 ? 'hi' : 'mid', pulse: true }))
    }
  }

  // engraved caption on the frame under the door
  if (caption) out.push(k.faceTextSvg(k.sideMatrix([0, FRONT], TOP + 7.4, P, 'left'), caption, { size: 3.4, tone: 'faint', anchor: 'middle' }))

  return out.join('')
}

export function serverBounds() {
  return [
    ...k.boxCorners(PLINTH, TOP, BASE),
    ...k.boxCorners(BODY, TOP, LID_Z + 3),
    [-HALF - GRIP.w, GRIP.y + GRIP.d, GRIP.z], [HALF + GRIP.w, GRIP.y + GRIP.d, GRIP.z + GRIP.h],
    [-REEL_X, FACE + 6, REEL_Z + REEL_R], [REEL_X, FACE + 6, REEL_Z + REEL_R], [0, RECESS + 6, NIX.z],
  ]
}
