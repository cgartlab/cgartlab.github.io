/**
 * 期号解析。
 *
 * 专栏文章的 `abbrlink` 是期号的唯一来源：URL 靠它稳定，首页的报架（newsrack）与
 * `/column/` 的封面墙靠它显示「No.xx」。历史上栏目叫「周刊」，前缀是 `weekly-24`；
 * 改名「专栏」之后新写的文章可能用 `column-25` —— 两种都要认，否则那篇文章会以
 * **空白期号**挂在架上（2026-11-01 的 No.25 就是这样漏掉的）。
 */
export function issueNumberOf(abbrlink: string | undefined): string {
  const m = (abbrlink || '').match(/(?:weekly|column)-(\d+)/i)
  return m ? m[1] : ''
}
