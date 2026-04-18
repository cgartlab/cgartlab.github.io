/**
 * Google AdSense 工具函数
 * 用于处理 Publisher ID 格式化和相关配置
 */

/**
 * 格式化 Publisher ID，确保其包含 'ca-pub-' 前缀
 * Google AdSense 要求客户端 ID 格式为 'ca-pub-xxxxxxxxxxxxxxx'
 *
 * @param id Publisher ID（可以带或不带 'ca-pub-' 前缀）
 * @returns 格式化后的完整 Publisher ID
 */
export function formatPublisherID(id: string | undefined): string {
  if (!id) {
    return ''
  }
  return id.startsWith('ca-pub-') ? id : `ca-pub-${id}`
}

/**
 * Google AdSense 脚本 URL
 */
export const GOOGLE_ADSENSE_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
