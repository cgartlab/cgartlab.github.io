/**
 * Dev-only screenshot helper: real viewport sizes, optional dark scheme.
 *
 *   node scripts/home-stage/shot.mjs <url> <width> <height> <out.png> [--dark] [--wait=1200]
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = 9334

const [, , url, wArg, hArg, out] = process.argv
const width = Number(wArg ?? 1440)
const height = Number(hArg ?? 900)
const dark = process.argv.includes('--dark')
const waitArg = process.argv.find((a) => a.startsWith('--wait='))
const wait = waitArg ? Number(waitArg.slice(7)) : 1600

const profile = mkdtempSync(join(tmpdir(), 'home-shot-'))
const child = spawn(EDGE, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--window-size=800,600',
  url,
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function target() {
  for (let i = 0; i < 80; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page)
        return page
    }
    catch {}
    await sleep(250)
  }
  throw new Error('no devtools target')
}

const page = await target()
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true })
  ws.addEventListener('error', reject, { once: true })
})

let nextId = 1
const pending = new Map()
ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data)
  const resolve = pending.get(data.id)
  if (resolve) {
    pending.delete(data.id)
    resolve(data.result)
  }
})
function send(method, params = {}) {
  const id = nextId++
  return new Promise((resolve) => {
    pending.set(id, resolve)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 2,
  mobile: width < 700,
})
if (dark)
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] })

await send('Page.enable')
await send('Page.reload')
await sleep(wait)

const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
writeFileSync(out, Buffer.from(shot.data, 'base64'))
console.log(`wrote ${out} (${width}x${height}${dark ? ' dark' : ''})`)

ws.close()
child.kill()
await sleep(300)
try {
  rmSync(profile, { recursive: true, force: true })
}
catch {}
process.exit(0)
