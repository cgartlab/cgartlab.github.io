interface WechatConfig {
  appId: string
  appSecret: string
  enabled: boolean
}

let cachedConfig: WechatConfig | null = null

export function getWechatConfig(): WechatConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  // 使用 dotenv 加载环境变量（如果可用）
  try {
    // 动态导入 dotenv，避免硬依赖
    const dotenv = require('dotenv')
    dotenv.config()
  } catch {
    // dotenv 不可用时使用 process.env
  }

  const appId = process.env.WECHAT_APP_ID || ''
  const appSecret = process.env.WECHAT_APP_SECRET || ''
  const enabled = process.env.WECHAT_SYNC_ENABLED === 'true'

  if (!appId || !appSecret) {
    throw new Error('微信公众号配置无效：缺少 AppID 或 AppSecret')
  }

  cachedConfig = {
    appId,
    appSecret,
    enabled,
  }

  return cachedConfig
}

export function isWechatSyncEnabled(): boolean {
  try {
    const config = getWechatConfig()
    return config.enabled
  }
  catch {
    return false
  }
}
