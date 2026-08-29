/**
 * GitHub Contribution Data Fetcher
 *
 * Fetches contribution data from the official GitHub GraphQL API
 * with file-based caching and build-time resilience.
 *
 * - Cache-first: reads from .temp/ cache on every build
 * - Falls back to cache if API fails (build never breaks)
 * - 10-second fetch timeout
 * - Module-level deduplication for same-build reuse
 */

import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

export interface ContributionCell {
  color: string
  contributionCount: number
  contributionLevel:
    | 'NONE'
    | 'FIRST_QUARTILE'
    | 'SECOND_QUARTILE'
    | 'THIRD_QUARTILE'
    | 'FOURTH_QUARTILE'
  date: string
}

export interface ContributionData {
  contributions: ContributionCell[][]
  total: number
}

const USERNAME = 'cgartlab'
const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const CACHE_DIR = '.temp'
const CACHE_FILE = 'gh-contributions.json'
const CACHE_TTL = 2 * 60 * 60 * 1000 // 2 hours
const FETCH_TIMEOUT = 10_000 // 10 seconds

// Git-tracked fallback data (updated by CI cron: scripts/update-gh-contributions.ts)
const TRACKED_DATA_FILE = join(
  process.cwd(),
  'src',
  'data',
  'github-contributions.json',
)

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

// Module-level cache for same-build deduplication
let moduleCache: { data: ContributionData, ts: number } | null = null

/**
 * Read cached data from disk
 */
async function readDiskCache(): Promise<{
  data: ContributionData
  ts: number
} | null> {
  try {
    const cachePath = join(process.cwd(), CACHE_DIR, CACHE_FILE)
    const raw = await readFile(cachePath, 'utf-8')
    const cached = JSON.parse(raw) as {
      data: ContributionData
      ts: number
    }
    return cached
  }
  catch {
    return null
  }
}

/**
 * Write data to disk cache
 */
async function writeDiskCache(data: ContributionData): Promise<void> {
  try {
    const cacheDir = join(process.cwd(), CACHE_DIR)
    if (!existsSync(cacheDir)) {
      await mkdir(cacheDir, { recursive: true })
    }
    const cachePath = join(cacheDir, CACHE_FILE)
    await writeFile(
      cachePath,
      JSON.stringify({ data, ts: Date.now() }),
      'utf-8',
    )
  }
  catch (e) {
    console.warn(
      '[GithubHeatmap] Cache write failed:',
      e instanceof Error ? e.message : e,
    )
  }
}

/**
 * Fetch contributions from GitHub GraphQL API with timeout
 */
async function fetchFromAPI(token: string): Promise<ContributionData | null> {
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
      console.warn(`[GithubHeatmap] API returned ${response.status}`)
      return null
    }

    const json = (await response.json()) as {
      data?: {
        user?: {
          contributionsCollection?: {
            contributionCalendar?: {
              totalContributions: number
              weeks: Array<{
                contributionDays: ContributionCell[]
              }>
            }
          }
        }
      }
    }

    const calendar
      = json?.data?.user?.contributionsCollection?.contributionCalendar
    if (!calendar) {
      console.warn('[GithubHeatmap] Unexpected API response shape')
      return null
    }

    return {
      contributions: calendar.weeks.map(w => w.contributionDays),
      total: calendar.totalContributions,
    }
  }
  catch (e) {
    clearTimeout(timeout)
    console.warn(
      `[GithubHeatmap] Fetch failed: ${e instanceof Error ? e.message : 'unknown error'}`,
    )
    return null
  }
}

/**
 * Read git-tracked fallback data file (updated by CI cron)
 */
async function readTrackedDataFile(): Promise<{
  data: ContributionData
  ts: number
} | null> {
  try {
    const raw = await readFile(TRACKED_DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as {
      data: ContributionData
      ts?: number
    }
    if (!parsed.data || !Array.isArray(parsed.data.contributions)) {
      console.warn('[GithubHeatmap] Tracked file: invalid structure')
      return null
    }
    return { data: parsed.data, ts: parsed.ts ?? 0 }
  }
  catch (e) {
    console.warn(
      `[GithubHeatmap] Tracked file read failed (${TRACKED_DATA_FILE}): ${e instanceof Error ? e.message : 'unknown'}`,
    )
    return null
  }
}

/**
 * Get contribution data with cache-first strategy.
 *
 * Strategy:
 * 1. Return module-level cache if fresh (within same build process)
 * 2. Return disk cache if fresh (across builds)
 * 3. Fetch from API → write to disk + module cache
 * 4. Fall back to git-tracked data file (CI/cron updated)
 * 5. Fall back to stale disk cache if API fails
 * 6. Return empty data as last resort (build never throws)
 */
export async function getContributions(): Promise<ContributionData> {
  const token = import.meta.env.GITHUB_TOKEN as string | undefined
  const now = Date.now()

  // 1. Module-level cache (same build, 5 min TTL)
  if (moduleCache && now - moduleCache.ts < 5 * 60 * 1000) {
    return moduleCache.data
  }

  // 2. Disk cache (fresh)
  const diskCache = await readDiskCache()
  if (diskCache && now - diskCache.ts < CACHE_TTL) {
    moduleCache = diskCache
    return diskCache.data
  }

  // 3. Fetch from API
  if (token) {
    const fresh = await fetchFromAPI(token)
    if (fresh) {
      moduleCache = { data: fresh, ts: now }
      await writeDiskCache(fresh)
      return fresh
    }
  }
  else {
    console.warn(
      '[GithubHeatmap] No GITHUB_TOKEN set — skipping API fetch',
    )
  }

  // 4. Git-tracked data file (CI/cron fallback — may be fresher than stale .temp)
  const tracked = await readTrackedDataFile()
  if (tracked) {
    moduleCache = tracked
    return tracked.data
  }

  // 5. Fall back to stale disk cache
  if (diskCache) {
    moduleCache = diskCache
    return diskCache.data
  }

  // 6. Empty data (last resort)
  console.warn('[GithubHeatmap] No data available — rendering empty')
  return { contributions: [], total: 0 }
}
