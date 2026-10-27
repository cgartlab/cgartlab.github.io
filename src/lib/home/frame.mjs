// Local coordinate frames for devices that are not square to the camera.
//
// Everything else in `src/lib/home` is built in world axes, which is fine while
// the camera is head-on: a plan is a plan, a slab is a slab. A rack that stands
// at an angle, or a lid that hinges open, needs its own frame. This module maps
// local (u, v, w) — width, depth, height — into world axes and renders a box
// through the same four-tone shading the kit uses, so angled solids still read
// as part of the same drawing.
//
//   const F = frameOf({ yaw: 28, origin: [0, -6, TOP] })
//   F.at(0, 0, 20)              -> world point
//   boxSvg(F, { u: -50, v: -4, w: 0, uw: 100, vd: 8, wh: 4 }, P)

import * as k from '../anatomy/iso-kit.mjs'

const RAD = Math.PI / 180

/** Rz(yaw) · Rx(pitch), applied to a local offset. */
function rotate([u, v, w], yaw, pitch) {
  const a = yaw * RAD
  const b = pitch * RAD
  const ca = Math.cos(a)
  const sa = Math.sin(a)
  const cb = Math.cos(b)
  const sb = Math.sin(b)
  const v1 = v * cb - w * sb
  const w1 = v * sb + w * cb
  return [u * ca - v1 * sa, u * sa + v1 * ca, w1]
}

/**
 * A local frame. `yaw` turns about the vertical axis (0 = facing the reader),
 * `pitch` tilts about the local u axis (0 = level, 90 = standing up).
 */
export function frameOf({ yaw = 0, pitch = 0, origin = [0, 0, 0] } = {}) {
  return {
    yaw,
    pitch,
    origin,
    at: (u, v, w) => {
      const [dx, dy, dz] = rotate([u, v, w], yaw, pitch)
      return [origin[0] + dx, origin[1] + dy, origin[2] + dz]
    },
    dir: (u, v, w) => rotate([u, v, w], yaw, pitch),
  }
}

/** A filled polygon on the frame's surface. */
export function facePath(F, points, P) {
  return k.pathOf(points.map(([u, v, w]) => k.iso(F.at(u, v, w), P)), true)
}

/** An affine matrix that lays text on an arbitrary plane of the frame. */
export function faceMatrix(F, origin, uAxis, vAxis, P) {
  const o = k.iso(F.at(...origin), P)
  const a = k.iso(F.at(origin[0] + uAxis[0], origin[1] + uAxis[1], origin[2] + uAxis[2]), P)
  const b = k.iso(F.at(origin[0] + vAxis[0], origin[1] + vAxis[1], origin[2] + vAxis[2]), P)
  const f = (n) => Number(n.toFixed(4))
  return `matrix(${f(a[0] - o[0])},${f(a[1] - o[1])},${f(b[0] - o[0])},${f(b[1] - o[1])},${f(o[0])},${f(o[1])})`
}

function signedArea(points) {
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const [ax, ay] = points[i]
    const [bx, by] = points[(i + 1) % points.length]
    area += ax * by - bx * ay
  }
  return area / 2
}

function hull(points) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (sorted.length < 3)
    return sorted
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower = []
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop()
    lower.push(p)
  }
  const upper = []
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop()
    upper.push(p)
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)]
}

// the six faces of a box, each wound counter-clockwise seen from outside
const FACES = [
  { n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
  { n: [0, 0, -1], c: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]] },
  { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
  { n: [0, 1, 0], c: [[1, 1, 0], [0, 1, 0], [0, 1, 1], [1, 1, 1]] },
  { n: [-1, 0, 0], c: [[0, 1, 0], [0, 0, 0], [0, 0, 1], [0, 1, 1]] },
  { n: [1, 0, 0], c: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]] },
]

/**
 * An angled box, shaded and painter-sorted against itself.
 * `box` is in frame units: u/v/w is the near-bottom-left corner, uw/vd/wh the
 * three extents. Returns one <g class="iso-solid"> so the usual tone classes
 * apply.
 */
export function boxSvg(F, box, P, { tone = 'mid', className, skip = [] } = {}) {
  const { u, v, w, uw, vd, wh } = box
  const [vx, vy, vz] = (() => {
    const { sinA, cosA, sinE, cosE } = k.cameraOf(P)
    return [cosA * cosE, sinA * cosE, sinE]
  })()
  const { sinA, cosA } = k.cameraOf(P)
  const visible = []
  FACES.forEach((face, index) => {
    if (skip.includes(index))
      return
    const n = F.dir(...face.n)
    const facing = n[0] * vx + n[1] * vy + n[2] * vz
    if (facing <= 1e-6)
      return
    const corners = face.c.map(([a, b, c]) => [
      u + a * uw,
      v + b * vd,
      w + c * wh,
    ])
    const projected = corners.map((p) => k.iso(F.at(...p), P))
    const depth = corners.reduce((sum, p) => sum + k.depthOf(F.at(...p), P), 0) / 4
    const up = Math.abs(n[2])
    const lit = (n[0] * -sinA + n[1] * cosA + 1) / 2
    visible.push({ projected, depth, up, shade: Math.min(3, Math.max(0, Math.floor(lit * 4))) })
  })
  visible.sort((a, b) => a.depth - b.depth)
  const parts = []
  const all = visible.flatMap((f) => f.projected)
  parts.push(`<path class="iso-fill" d="${k.pathOf(hull(all), true)}"/>`)
  for (const face of visible) {
    const d = k.pathOf(face.projected, true)
    parts.push(face.up > 0.6
      ? `<path class="iso-top" d="${d}"/>`
      : `<path class="iso-shade" data-shade="${face.shade}" d="${d}"/>`)
    parts.push(`<path class="iso-line iso-edge" data-tone="${tone}" d="${d}"/>`)
  }
  return `<g class="iso-solid${className ? ` ${className}` : ''}">${parts.join('')}</g>`
}

/** A single angled quad, e.g. a hanging sheet. */
export function quadSvg(F, points, P, { tone = 'lo', className, fillClass } = {}) {
  const d = facePath(F, points, P)
  const fill = fillClass ? `<path class="${fillClass}" d="${d}"/>` : ''
  return `${fill}${k.lineSvg(d, { tone, className })}`
}

/**
 * A part's own assembly axis, in the stage's screen space.
 *
 * Pass the two ends of the axis the part is fitted along — a shaft's two ends,
 * a panel's centre and a point out along its normal, a post's foot and its
 * head — and this returns the CSS custom properties a part needs to come in
 * along that axis: the unit vector (`--axis-x`, `--axis-y`), how far it should
 * travel (`--travel`), and the pivot it should scale about (`--pivot-x`,
 * `--pivot-y`, the midpoint of the axis, in stage px).
 *
 * The point is that no entry motion is guessed in screen space: a platen slides
 * on its own bearing, a knob screws down its own shaft, a panel comes in square
 * to its own face, because the direction was read off the geometry.
 */
export function axisStyle(P, from, to, travel = 28) {
  const [ax, ay] = k.iso(from, P)
  const [bx, by] = k.iso(to, P)
  const len = Math.hypot(bx - ax, by - ay) || 1
  return [
    `--axis-x:${((bx - ax) / len).toFixed(3)}`,
    `--axis-y:${((by - ay) / len).toFixed(3)}`,
    `--travel:${travel.toFixed(1)}px`,
    `--pivot-x:${((ax + bx) / 2).toFixed(1)}px`,
    `--pivot-y:${((ay + by) / 2).toFixed(1)}px`,
  ].join(';')
}

export { signedArea }
