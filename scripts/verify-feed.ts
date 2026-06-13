/**
 * 验证 RSS/Atom Feed 中的链接是否有效
 * 用法: pnpm tsx scripts/verify-feed.ts
 */

import { parse } from 'node-html-parser'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

interface BrokenLink {
  url: string
  status?: number
  error?: string
}

async function fetchWithTimeout(url: string, timeout = 5000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, { signal: controller.signal, method: 'HEAD' })
  }
  finally {
    clearTimeout(timeoutId)
  }
}

async function verifyFeed(feedPath: string): Promise<BrokenLink[]> {
  const fullPath = resolve(process.cwd(), 'dist', feedPath)
  let xml: string
  try {
    xml = await readFile(fullPath, 'utf-8')
  }
  catch {
    console.error(`❌ 无法读取 Feed 文件: ${fullPath}`)
    console.error('   请先运行 pnpm build 生成 Feed')
    process.exit(1)
  }

  const doc = parse(xml)
  const items = doc.querySelectorAll('item')
  const links = items.map(item => item.querySelector('link')?.textContent?.trim()).filter(Boolean) as string[]

  console.log(`🔍 检查 ${links.length} 个 Feed 链接...`)

  const broken: BrokenLink[] = []
  for (const url of links) {
    try {
      const response = await fetchWithTimeout(url)
      if (!response.ok) {
        broken.push({ url, status: response.status })
      }
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      broken.push({ url, error: message })
    }
  }

  return broken
}

async function main() {
  console.log('📡 开始校验 RSS Feed...\n')

  const brokenRss = await verifyFeed('rss.xml')
  const brokenAtom = await verifyFeed('atom.xml')

  if (brokenRss.length === 0 && brokenAtom.length === 0) {
    console.log('✅ 所有 Feed 链接有效，无死链')
    return
  }

  if (brokenRss.length > 0) {
    console.error(`\n❌ RSS Feed 中发现 ${brokenRss.length} 个死链:`)
    for (const { url, status, error } of brokenRss) {
      console.error(`   ${status || 'ERROR'}: ${url} ${error || ''}`)
    }
  }

  if (brokenAtom.length > 0) {
    console.error(`\n❌ Atom Feed 中发现 ${brokenAtom.length} 个死链:`)
    for (const { url, status, error } of brokenAtom) {
      console.error(`   ${status || 'ERROR'}: ${url} ${error || ''}`)
    }
  }

  console.error('\n💥 Feed 校验失败，请检查上述死链')
  process.exit(1)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error('❌ 校验脚本执行失败:', message)
  process.exit(1)
})