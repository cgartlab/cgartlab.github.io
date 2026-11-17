import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'
import { allLocales, themeConfig } from '@/config'

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    // 必需字段
    title: z.string(),
    published: z.date(),
    // 可选字段
    description: z.string().optional().default(''),
    updated: z.preprocess(
      val => (val === '' ? undefined : val),
      z.date().optional(),
    ),
    tags: z.array(z.string()).optional().default([]),
    // 高级选项
    draft: z.boolean().optional().default(false),
    pin: z.number().int().min(0).max(99).optional().default(0),
    katex: z.boolean().optional().default(themeConfig.global.katex),
    toc: z.boolean().optional().default(themeConfig.global.toc),
    lang: z
      .enum(['', ...allLocales])
      .optional()
      .default(''),
    abbrlink: z
      .string()
      .optional()
      .default('')
      .refine(abbrlink => !abbrlink || /^[a-z0-9\-]*$/.test(abbrlink), {
        message: '缩写链接只能包含小写字母、数字和连字符',
      }),
  }),
})

const about = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/about' }),
  schema: z.object({
    lang: z
      .enum(['', ...allLocales])
      .optional()
      .default(''),
  }),
})

// 《用户协议》—— 2026-11-17 把原先的《服务条款》《隐私政策》《免责声明》合并为一份文档。
// 旧集合 privacy 已删除；如需追溯旧文本，查 git 历史里的 src/content/privacy/。
const agreement = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/agreement' }),
  schema: z.object({
    lang: z
      .enum(['', ...allLocales])
      .optional()
      .default(''),
  }),
})

export const collections = { posts, about, agreement }
