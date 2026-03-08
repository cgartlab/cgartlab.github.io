import assert from 'node:assert/strict'
import {
  normalizePostLang,
  normalizeSearchLang,
  shouldIncludePostByLang,
  shouldIncludePostForSearch,
} from '@/utils/search'

function run() {
  // 1) locale normalization
  assert.equal(normalizeSearchLang('en-US'), 'en')
  assert.equal(normalizeSearchLang('zh-CN'), 'zh')
  assert.equal(normalizeSearchLang('zh-TW'), 'zh-tw')

  // 2) post lang normalization
  assert.equal(normalizePostLang(''), 'zh')
  assert.equal(normalizePostLang(undefined), 'zh')

  // 3) strict language matching
  assert.equal(shouldIncludePostByLang('en', 'en-US'), true)
  assert.equal(shouldIncludePostByLang('zh', 'en'), false)
  assert.equal(shouldIncludePostByLang('', 'en'), false)

  // 4) draft and language checks
  assert.equal(shouldIncludePostForSearch({ lang: 'en', draft: false }, 'en', false), true)
  assert.equal(shouldIncludePostForSearch({ lang: 'zh', draft: false }, 'en', false), false)
  assert.equal(shouldIncludePostForSearch({ lang: 'en', draft: true }, 'en', false), false)
  assert.equal(shouldIncludePostForSearch({ lang: 'en', draft: true }, 'en', true), true)

  console.log('search language checks passed')
}

run()
