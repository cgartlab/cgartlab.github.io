/**
 * 创建带有前置事项的新文章
 * 用法: pnpm new-post <title>
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
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

// 准备文件内容
const content = `---
title: ${baseName}
published: ${new Date().toISOString()}
description: ''
updated: ''
tags:
  - Tag
draft: false
pin: 0
toc: ${themeConfig.global.toc}
lang: ''
abbrlink: ''
---
`

// 写入文件
try {
  writeFileSync(fullPath, content)
  console.log(`✅ 文章已创建: ${fullPath}`)
}
catch (error) {
  console.error('❌ 创建文章失败:', error)
  process.exit(1)
}
