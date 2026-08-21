/**
 * 更新 GitHub 贡献热力图数据（方案 A 实施脚本）
 *
 * 从 GitHub GraphQL API 抓取贡献日历，写入 git 跟踪的
 * src/data/github-contributions.json，供构建时兜底读取。
 *
 * 数据流闭环：
 *   GitHub Actions cron → 本脚本 → 提交数据文件 → Cloudflare Git 集成重建
 *
 * 用法:
 * - 本地手动: pnpm update-gh-contributions（读取 .env 或环境变量 GITHUB_TOKEN）
 * - CI 定时:  由 .github/workflows/update-contributions.yml 注入 GITHUB_TOKEN 调用
 *
 * 输出文件格式与 .temp/gh-contributions.json 一致:
 * { data: ContributionData, ts: number }
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(
  __dirname,
  '..',
  'src',
  'data',
  'github-contributions.json',
)

const USERNAME = 'cgartlab'
const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const FETCH_TIMEOUT = 10_000

const CONTRIBUTIONS_QUERY = `
  query($userName: String!) {
    user(login: $userName) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              color
              contributionCount
              contributionLevel
              date
            }
          }
        }
      }
    }
  }
`

/**
 * 解析 GitHub token: 优先环境变量，本地回退 .env 文件
 */
function resolveToken(): string {
  if (process.env.GITHUB_TOKEN)
    return process.env.GITHUB_TOKEN

  try {
    const envPath = join(process.cwd(), '.env')
    if (existsSync(envPath)) {
      for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
        const m = line.match(/^\s*GITHUB_TOKEN\s*=\s*(\S+)\s*$/)
        if (m)
          return m[1].replace(/^["']|["']$/g, '')
      }
    }
  }
  catch {
    /* 忽略 .env 解析错误，交由下方缺失 token 报错兜底 */
  }

  return ''
}

/**
 * 从 GitHub GraphQL API 抓取贡献数据
 */
async function fetchContributions(token: string): Promise<unknown> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

  try {
    const response = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: { userName: USERNAME },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`GitHub API 返回 ${response.status}`)
    }

    const json = (await response.json()) as {
      data?: {
        user?: {
          contributionsCollection?: {
            contributionCalendar?: {
              totalContributions: number
              weeks: Array<{ contributionDays: unknown[] }>
            }
          }
        }
      }
      errors?: Array<{ message: string }>
    }

    if (json.errors?.length) {
      throw new Error(`GitHub API GraphQL 错误: ${json.errors[0]?.message ?? '未知'}`)
    }

    const calendar
      = json?.data?.user?.contributionsCollection?.contributionCalendar
    if (!calendar || !Array.isArray(calendar.weeks)) {
      throw new Error('GitHub API 返回结构异常（无 contributionCalendar）')
    }

    return {
      contributions: calendar.weeks.map(w => w.contributionDays),
      total: calendar.totalContributions,
    }
  }
  catch (e) {
    clearTimeout(timeout)
    throw e
  }
}

/**
 * 写入跟踪数据文件（格式与 .temp 缓存一致）
 */
function writeDataFile(data: unknown): void {
  const payload = JSON.stringify({ data, ts: Date.now() }, null, 2)
  writeFileSync(DATA_FILE, `${payload}\n`, 'utf-8')
}

async function main(): Promise<void> {
  console.log('[update-gh-contributions] 开始获取 GitHub 贡献数据…')
  const token = resolveToken()

  if (!token) {
    console.error(
      '❌ 未找到 GITHUB_TOKEN（环境变量或 .env 文件中）——无法更新贡献数据',
    )
    process.exit(1)
  }

  try {
    const data = await fetchContributions(token)
    writeDataFile(data)
    const total = (data as { total: number }).total
    console.log(`✅ 已写入 ${DATA_FILE}（total=${total}）`)
  }
  catch (e) {
    console.error(
      `❌ 数据抓取失败: ${e instanceof Error ? e.message : '未知错误'}`,
    )
    process.exit(1)
  }
}

main()
