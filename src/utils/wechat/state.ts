import * as fs from 'fs/promises'
import * as path from 'path'

interface SyncRecord {
  slug: string
  title: string
  media_id: string
  publish_id: string
  syncedAt: string
  status: number
}

interface SyncState {
  lastSyncTime: string
  records: Record<string, SyncRecord>
}

const STATE_FILE = path.join(process.cwd(), '.wechat-sync-state.json')

let cachedState: SyncState | null = null

async function loadState(): Promise<SyncState> {
  if (cachedState) {
    return cachedState
  }

  try {
    const data = await fs.readFile(STATE_FILE, 'utf-8')
    cachedState = JSON.parse(data)
    return cachedState
  }
  catch (error: any) {
    if (error.code === 'ENOENT') {
      // 文件不存在，创建新状态
      cachedState = {
        lastSyncTime: new Date().toISOString(),
        records: {},
      }
      return cachedState
    }
    throw error
  }
}

async function saveState(state: SyncState): Promise<void> {
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8')
  cachedState = state
}

export async function getSyncRecord(slug: string): Promise<SyncRecord | null> {
  const state = await loadState()
  return state.records[slug] || null
}

export async function saveSyncRecord(record: SyncRecord): Promise<void> {
  const state = await loadState()
  state.records[record.slug] = {
    ...record,
    syncedAt: new Date().toISOString(),
  }
  state.lastSyncTime = new Date().toISOString()
  await saveState(state)
}

export async function getAllSyncRecords(): Promise<Record<string, SyncRecord>> {
  const state = await loadState()
  return state.records
}

export async function removeSyncRecord(slug: string): Promise<void> {
  const state = await loadState()
  delete state.records[slug]
  await saveState(state)
}

export async function getSyncStats(): Promise<{
  totalSynced: number
  lastSyncTime: string
  records: SyncRecord[]
}> {
  const state = await loadState()
  const records = Object.values(state.records)

  return {
    totalSynced: records.length,
    lastSyncTime: state.lastSyncTime,
    records,
  }
}

export async function needsResync(
  slug: string,
  articleUpdatedAt: Date,
): Promise<boolean> {
  const record = await getSyncRecord(slug)

  if (!record) {
    return true // 从未同步过
  }

  const syncedAt = new Date(record.syncedAt)
  return articleUpdatedAt > syncedAt // 文章在同步后被修改过
}
