/**
 * 构建时获取 GitHub 仓库数据并写入静态 JSON
 * 用法: pnpm fetch-github-repos
 *
 * 扫描 src/content 中的 ::github[owner/repo] 指令，
 * 调用 GitHub REST API 获取仓库信息，写入 public/github-repos.json。
 * GithubCard 组件在构建时读取此文件，避免运行时 API 调用。
 */

import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'

interface GithubRepoData {
  owner: { avatar_url: string }
  description: string | null
  stargazers_count: number
  forks_count: number
  license: { spdx_id: string } | null
}

const GITHUB_API = 'https://api.github.com'
const OUTPUT_PATH = join(process.cwd(), 'public', 'github-repos.json')
const FETCH_TIMEOUT = 10_000

async function fetchRepoData(repo: string): Promise<GithubRepoData | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

    const response = await fetch(`${GITHUB_API}/repos/${repo}`, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github.v3+json' },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      console.warn(`[fetch-github-repos] ${repo}: ${response.status}`)
      return null
    }

    const raw = await response.json() as Record<string, any>
    return {
      owner: { avatar_url: raw.owner?.avatar_url ?? '' },
      description: raw.description,
      stargazers_count: raw.stargazers_count ?? 0,
      forks_count: raw.forks_count ?? 0,
      license: raw.license ? { spdx_id: raw.license.spdx_id } : null,
    }
  }
  catch (error) {
    console.warn(`[fetch-github-repos] ${repo}: ${error instanceof Error ? error.message : error}`)
    return null
  }
}

async function main() {
  // 1. 扫描内容文件中的 ::github[owner/repo]
  const files = await fg('src/content/**/*.{md,mdx}', { absolute: false })
  const repos = new Set<string>()

  for (const file of files) {
    const content = await readFile(file, 'utf-8')
    const matches = content.matchAll(/::github\[([^\]]+)\]/g)
    for (const match of matches) {
      const repo = match[1].trim()
      if (repo.includes('/')) {
        repos.add(repo)
      }
    }
  }

  if (repos.size === 0) {
    console.log('[fetch-github-repos] 未找到 ::github 指令，写入空 JSON')
    await writeFile(OUTPUT_PATH, '[]\n')
    return
  }

  console.log(`[fetch-github-repos] 找到 ${repos.size} 个仓库，开始获取...`)

  // 2. 并发获取（限制 5 个并发）
  const repoList = [...repos]
  const data: Record<string, GithubRepoData> = {}

  for (let i = 0; i < repoList.length; i += 5) {
    const batch = repoList.slice(i, i + 5)
    const results = await Promise.all(batch.map(repo => fetchRepoData(repo).then(d => [repo, d] as const)))
    for (const [repo, repoData] of results) {
      if (repoData) {
        data[repo] = repoData
      }
    }
  }

  // 3. 写入 JSON
  await writeFile(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`)
  console.log(`[fetch-github-repos] 写入 ${Object.keys(data).length} 个仓库数据到 ${OUTPUT_PATH}`)
}

main().catch((error) => {
  console.error('[fetch-github-repos] 失败:', error)
  process.exit(1)
})
