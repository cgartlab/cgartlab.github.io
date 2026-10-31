/**
 * 创建带有前置事项的新文章
 * 用法: pnpm new-post <title>
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import process from 'node:process'
import { themeConfig } from '../src/config'

// 处理文件路径
const rawPath = process.argv[2] ?? 'new-post'
const baseName = basename(rawPath).replace(/\.(md|mdx)$/, '')
const targetFile = ['.md', '.mdx'].includes(extname(rawPath))
  ? rawPath
  : `${rawPath}.md`
const fullPath = join('src/content/posts', targetFile)

// 检查文件是否已存在
if (existsSync(fullPath)) {
  console.error(`❌ 文件已存在: ${fullPath}`)
  process.exit(1)
}

// 创建目录结构
mkdirSync(dirname(fullPath), { recursive: true })

// 专栏文章：期号与标签必须齐 —— 首页报架和 /column/ 都靠它们列出这一期，
// 漏一个就是「静默少一期」（2026-11-01 的 No.25 如此）。这里直接填好，
// 由 pnpm check-columns 在 CI 里兜底。
const isColumn = targetFile.replace(/\\/g, '/').startsWith('column/')
const columnTags = isColumn ? ['专栏'] : ['Tag']
let abbrlink = ''
if (isColumn) {
  const numbers = readdirSync('src/content/posts/column')
    .filter(name => name.endsWith('.md'))
    .map((name) => {
      const text = readFileSync(join('src/content/posts/column', name), 'utf8')
      return Number(text.match(/(?:weekly|column)-(\d+)/i)?.[1] ?? 0)
    })
  abbrlink = `column-${String(Math.max(0, ...numbers) + 1).padStart(2, '0')}`
}

// 准备文件内容
const content = `---
title: ${baseName}
published: ${new Date().toISOString()}
description: ''
updated: ''
tags:
${columnTags.map(tag => `  - ${tag}`).join('\n')}
draft: false
pin: 0
toc: ${themeConfig.global.toc}
lang: ''
abbrlink: '${abbrlink}'
---
`

// 写入文件
try {
  writeFileSync(fullPath, content)
  console.log(`✅ 文章已创建: ${fullPath}`)
}
catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  console.error('❌ 创建文章失败:', message)
  process.exit(1)
}
