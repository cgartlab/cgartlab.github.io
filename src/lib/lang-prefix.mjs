/**
 * 单一来源：语言前缀（与 src/config.ts 的 allLocales 保持一致，但 Worker / 纯 .mjs
 * 脚本读不到 TS 配置，所以单独放一份在这里）。
 *
 * 默认语言（zh）不带 URL 前缀，只有 /en/ 这类「额外语言」才进这个数组。
 * 用途：noindex 判定、旧法律页 301 的语言前缀白名单。
 * 新增带前缀的语言时只改这里。
 */
export const LANG_PREFIXES = ['en']
