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
