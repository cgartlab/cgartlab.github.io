/**
 * 从上游仓库更新主题
 * 用法: pnpm update-theme
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// 检查并设置远程仓库
try {
  execSync('git remote get-url upstream', { stdio: 'ignore' })
}
catch {
  execSync('git remote add upstream https://github.com/radishzzz/astro-theme-retypeset.git', { stdio: 'inherit' })
}

// 从上游仓库更新主题
try {
  execSync('git fetch upstream', { stdio: 'inherit' })

  const beforeHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
  execSync('git merge upstream/master --allow-unrelated-histories', { stdio: 'inherit' })
  const afterHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()

  if (beforeHash === afterHash) {
    console.log('✅ 已经是最新版本')
  }
  else {
    console.log('✨ 更新成功')
  }
}
catch (error) {
  // 检查是否存在合并冲突
  const gitDir = execSync('git rev-parse --git-dir', { encoding: 'utf8' }).trim()
  const mergeHeadPath = path.join(gitDir, 'MERGE_HEAD')

  if (fs.existsSync(mergeHeadPath)) {
    console.log('⚠️ 更新获取完成但存在合并冲突，请手动解决')
  }
  else {
    console.error('❌ 更新失败:', error)
    process.exit(1)
  }
}
