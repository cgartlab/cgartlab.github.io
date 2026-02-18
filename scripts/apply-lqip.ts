/**
 * 生成并应用LQIP（低质量图像占位符）到图像
 * 来源: https://frzi.medium.com/lqip-css-73dc6dda2529
 * 用法: pnpm apply-lqip
 */

import type { HTMLElement } from 'node-html-parser'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import glob from 'fast-glob'
import { parse } from 'node-html-parser'
import sharp from 'sharp'

const distDir = 'dist'
const assetsDir = 'src/assets'
const lqipMapPath = 'src/assets/lqip-map.json'

interface LqipMap {
  [path: string]: string
}

interface ImageStats {
  total: number
  cached: number
  new: number
}

interface FileMapping {
  filePath: string
  webUrl: string
}

// 将RGB颜色打包为11位（4位R，4位G，3位B）
function packColor11Bit(r: number, g: number, b: number): number {
  const pr = Math.round((r / 255) * 15)
  const pg = Math.round((g / 255) * 15)
  const pb = Math.round((b / 255) * 7)
  return (pr << 7) | (pg << 3) | pb
}

// 将RGB颜色打包为10位（3位R，4位G，3位B）
function packColor10Bit(r: number, g: number, b: number): number {
  const pr = Math.round((r / 255) * 7)
  const pg = Math.round((g / 255) * 15)
  const pb = Math.round((b / 255) * 7)
  return (pr << 7) | (pg << 3) | pb
}

async function generateLqipValue(imagePath: string): Promise<string | null> {
  try {
    const instance = sharp(imagePath)

    // 调整为3x3以获取关键颜色（左上角、中心、右下角）
    const buffer = await instance
      .resize(3, 3, { fit: 'fill' })
      .removeAlpha() // 强制RGB输出
      .raw()
      .toBuffer()

    // 在特定位置提取颜色
    // 0: 左上角, 4: 中心, 8: 右下角
    // 每个像素为3个字节（RGB）
    const getPixel = (index: number) => ({
      r: buffer[index * 3],
      g: buffer[index * 3 + 1],
      b: buffer[index * 3 + 2],
    })

    const c0 = getPixel(0)
    const c1 = getPixel(4)
    const c2 = getPixel(8)

    // 打包颜色: [颜色0 11位] [颜色1 11位] [颜色2 10位]
    const pc0 = packColor11Bit(c0.r, c0.g, c0.b)
    const pc1 = packColor11Bit(c1.r, c1.g, c1.b)
    const pc2 = packColor10Bit(c2.r, c2.g, c2.b)

    // 组合成一个32位整数
    const combined = (BigInt(pc0) << 21n) | (BigInt(pc1) << 10n) | BigInt(pc2)

    // 转换为8位十六进制字符串
    return combined.toString(16).padStart(8, '0')
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`⚠️ 处理图像失败: ${imagePath}`, message)
    return null
  }
}

/**
 * LQIP处理函数
 * 图像分析、映射生成和HTML应用
 */
async function loadExistingLqipMap(): Promise<LqipMap> {
  try {
    const data = await fs.readFile(lqipMapPath, 'utf-8')
    return JSON.parse(data) as LqipMap
  }
  catch {
    return {} as LqipMap
  }
}

async function scanAndAnalyzeImages(): Promise<{ fileMappings: FileMapping[], imageStats: ImageStats, existingMap: LqipMap }> {
  await fs.mkdir(assetsDir, { recursive: true })

  const webpFiles = await glob('_astro/**/*.webp', {
    cwd: distDir,
    absolute: true,
  })

  const existingMap = await loadExistingLqipMap()

  const fileMappings = webpFiles.map(filePath => ({
    filePath,
    webUrl: `/${path.relative(distDir, filePath).replace(/\\/g, '/')}`,
  }))

  const { cached, new: newCount } = fileMappings.reduce((acc, { webUrl }) => {
    existingMap[webUrl] !== undefined ? acc.cached++ : acc.new++
    return acc
  }, { cached: 0, new: 0 })

  return {
    fileMappings,
    imageStats: { total: fileMappings.length, cached, new: newCount },
    existingMap,
  }
}

function cleanLqipMap(existingMap: LqipMap, fileMappings: FileMapping[]): LqipMap {
  return fileMappings.reduce((acc, { webUrl }) => {
    if (existingMap[webUrl] !== undefined) {
      acc[webUrl] = existingMap[webUrl]
    }
    return acc
  }, {} as LqipMap)
}

async function processNewImages(fileMappings: FileMapping[], stats: ImageStats, cleanedMap: LqipMap): Promise<LqipMap> {
  const newMap = { ...cleanedMap }
  let processed = 0
  const concurrencyLimit = 10

  const processFile = async ({ filePath, webUrl }: FileMapping) => {
    const lqipValue = await generateLqipValue(filePath)
    if (lqipValue !== null) {
      newMap[webUrl] = lqipValue
    }
    processed++
    if (processed % 10 === 0 || processed === stats.new) {
      console.log(`🔄 处理中: ${processed}/${stats.new}`)
    }
  }

  const toProcess = fileMappings.filter(m => cleanedMap[m.webUrl] === undefined)

  for (let i = 0; i < toProcess.length; i += concurrencyLimit) {
    const batch = toProcess.slice(i, i + concurrencyLimit)
    await Promise.all(batch.map(processFile))
  }

  console.log(`✅ 为${stats.new}个新图像生成了LQIP样式`)

  const isNewFile = Object.keys(cleanedMap).length === 0
  await fs.writeFile(lqipMapPath, `${JSON.stringify(newMap, null, 2)}\n`)
  console.log(`📁 LQIP映射${isNewFile ? '保存到' : '更新于'} ${lqipMapPath}`)

  return newMap
}

function processImage(img: HTMLElement, lqipMap: LqipMap): boolean {
  const src = img.getAttribute('src')
  if (!src) {
    return false
  }

  const lqipValue = lqipMap[src]
  if (lqipValue === undefined) {
    return false
  }

  const currentStyle = img.getAttribute('style') ?? ''
  if (currentStyle.includes('--lqip:')) {
    return false
  }

  const newStyle = currentStyle
    ? `${currentStyle}; --lqip:#${lqipValue}`
    : `--lqip:#${lqipValue}`

  img.setAttribute('style', newStyle)
  return true
}

async function applyLqipToHtml(lqipMap: LqipMap): Promise<number> {
  const htmlFiles = await glob('**/*.html', { cwd: distDir })
  let totalApplied = 0

  for (const htmlFile of htmlFiles) {
    try {
      const filePath = `${distDir}/${htmlFile}`
      const root = parse(await fs.readFile(filePath, 'utf-8'))
      const images = root.querySelectorAll('img')

      if (images.length === 0) {
        continue
      }

      let hasChanges = false
      for (const img of images) {
        const wasUpdated = processImage(img, lqipMap)
        if (wasUpdated) {
          totalApplied++
          hasChanges = true
        }
      }

      if (hasChanges) {
        await fs.writeFile(filePath, root.toString())
      }
    }
    catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`⚠️ 处理${htmlFile}失败:`, message)
      continue
    }
  }

  return totalApplied
}

/**
 * 主工作流程
 * 协调LQIP生成和应用过程
 */
async function main() {
  console.log('🔍 开始LQIP处理...')

  const { fileMappings, imageStats, existingMap } = await scanAndAnalyzeImages()

  if (imageStats.total === 0) {
    console.log('✨ 没有找到需要处理的图像')
    return
  }

  console.log(`📦 找到${imageStats.total}个图像（${imageStats.cached}个已缓存，${imageStats.new}个新增）`)

  const cleanedMap = cleanLqipMap(existingMap, fileMappings)

  let lqipMap: LqipMap
  if (imageStats.new > 0) {
    lqipMap = await processNewImages(fileMappings, imageStats, cleanedMap)
  }
  else {
    lqipMap = cleanedMap

    if (Object.keys(existingMap).length > Object.keys(cleanedMap).length) {
      await fs.writeFile(lqipMapPath, `${JSON.stringify(cleanedMap, null, 2)}\n`)
    }
  }

  const appliedCount = await applyLqipToHtml(lqipMap)

  if (appliedCount === 0) {
    console.log('✨ 所有图像已具有LQIP样式')
    return
  }

  console.log(`✨ 成功为${appliedCount}个图像应用了LQIP样式`)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error('❌ LQIP处理失败:', message)
  process.exit(1)
})
