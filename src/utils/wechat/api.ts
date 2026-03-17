import { getWechatConfig } from './config'
import FormData from 'form-data'
import { Readable } from 'stream'
import http from 'http'
import https from 'https'

const BASE_URL = 'https://api.weixin.qq.com'

interface WechatAPIResponse {
  errcode?: number
  errmsg?: string
  access_token?: string
  expires_in?: number
  media_id?: string
  publish_id?: string
}

interface ArticleData {
  title: string
  content: string
  thumb_media_id: string
  author?: string
  digest?: string
  show_cover_pic?: number
  need_open_comment?: number
  only_fans_can_comment?: number
}

interface DraftResponse {
  media_id: string
}

interface PublishResponse {
  publish_id: string
}

export class WechatAPIError extends Error {
  constructor(
    message: string,
    public errcode?: number,
    public errmsg?: string,
  ) {
    super(message)
    this.name = 'WechatAPIError'
  }
}

export class WechatAPI {
  private appId: string
  private appSecret: string
  private accessToken: string | null = null
  private accessTokenExpiresAt: number = 0

  constructor(appId: string, appSecret: string) {
    this.appId = appId
    this.appSecret = appSecret
  }

  private async request<T extends WechatAPIResponse>(
    endpoint: string,
    options: RequestInit = {},
    useAccessToken: boolean = true,
  ): Promise<T> {
    const url = new URL(endpoint, BASE_URL)

    if (useAccessToken) {
      const token = await this.getAccessToken()
      url.searchParams.set('access_token', token)
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data: T = await response.json()

    if (data.errcode && data.errcode !== 0) {
      throw new WechatAPIError(
        `微信 API 错误：${data.errmsg || '未知错误'}`,
        data.errcode,
        data.errmsg,
      )
    }

    return data
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.accessTokenExpiresAt) {
      return this.accessToken
    }

    const endpoint = `${BASE_URL}/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`
    const data = await this.request<{ access_token: string; expires_in: number }>(
      endpoint,
      {},
      false,
    )

    this.accessToken = data.access_token
    this.accessTokenExpiresAt = Date.now() + (data.expires_in - 600) * 1000

    console.log('已获取新的 access_token')
    return this.accessToken
  }

  async uploadCoverImage(imageBuffer: Buffer, filename: string): Promise<string> {
    const token = await this.getAccessToken()
    const endpoint = `${BASE_URL}/cgi-bin/material/add_material?type=image`

    const formData = new FormData()
    formData.append('media', Readable.from(imageBuffer), {
      filename,
      contentType: 'image/jpeg',
    })

    const url = new URL(endpoint, BASE_URL)
    url.searchParams.set('access_token', token)

    const response = await fetch(url.toString(), {
      method: 'POST',
      body: formData as any,
      headers: formData.getHeaders(),
    })

    const data = await response.json() as WechatAPIResponse

    if (data.errcode && data.errcode !== 0) {
      throw new WechatAPIError(
        `上传封面失败：${data.errmsg || '未知错误'}`,
        data.errcode,
        data.errmsg,
      )
    }

    if (!data.media_id) {
      throw new WechatAPIError('上传封面失败：未返回 media_id')
    }

    console.log('封面图片上传成功，media_id:', data.media_id)
    return data.media_id
  }

  async createDraft(article: ArticleData): Promise<string> {
    const token = await this.getAccessToken()
    const endpoint = `${BASE_URL}/cgi-bin/draft/add`

    const payload = {
      articles: [
        {
          title: article.title,
          thumb_media_id: article.thumb_media_id,
          content: article.content,
          author: article.author,
          digest: article.digest,
          show_cover_pic: article.show_cover_pic ?? 1,
          need_open_comment: article.need_open_comment ?? 0,
          only_fans_can_comment: article.only_fans_can_comment ?? 0,
        },
      ],
    }

    const data = await this.request<DraftResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!data.media_id) {
      throw new WechatAPIError('创建草稿失败：未返回 media_id')
    }

    console.log('草稿创建成功，media_id:', data.media_id)
    return data.media_id
  }

  async publishDraft(mediaId: string): Promise<string> {
    const token = await this.getAccessToken()
    const endpoint = `${BASE_URL}/cgi-bin/freepublish/submit`

    const payload = {
      media_id: mediaId,
    }

    const data = await this.request<PublishResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!data.publish_id) {
      throw new WechatAPIError('发布失败：未返回 publish_id')
    }

    console.log('文章发布成功，publish_id:', data.publish_id)
    return data.publish_id
  }

  async checkPublishStatus(publishId: string): Promise<{ status: number; publish_time?: number }> {
    const token = await this.getAccessToken()
    const endpoint = `${BASE_URL}/cgi-bin/freepublish/get`

    const payload = {
      publish_id: publishId,
    }

    const data = await this.request<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    return {
      status: data.status ?? 0,
      publish_time: data.publish_time,
    }
  }

  async syncArticle(
    title: string,
    content: string,
    coverImageBuffer: Buffer,
    coverImageFilename: string,
    author?: string,
    digest?: string,
  ): Promise<{
    media_id: string
    publish_id: string
    status: number
  }> {
    console.log(`开始同步文章：${title}`)

    const coverMediaId = await this.uploadCoverImage(coverImageBuffer, coverImageFilename)

    const draftMediaId = await this.createDraft({
      title,
      content,
      thumb_media_id: coverMediaId,
      author,
      digest,
    })

    const publishId = await this.publishDraft(draftMediaId)

    const { status } = await this.checkPublishStatus(publishId)

    console.log(`文章同步完成：${title}, 状态码：${status}`)

    return {
      media_id: draftMediaId,
      publish_id: publishId,
      status,
    }
  }
}

export function createWechatAPI(): WechatAPI {
  const config = getWechatConfig()
  return new WechatAPI(config.appId, config.appSecret)
}
