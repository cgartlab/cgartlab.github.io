import { toString } from 'mdast-util-to-string'
import getReadingTime from 'reading-time'

export function remarkReadingTime() {
  return (tree, { data }) => {
    // 提取页面上的所有文本
    const textOnPage = toString(tree)
    // 计算阅读时间
    const readingTime = getReadingTime(textOnPage)

    // 将分钟数四舍五入并设置为至少1分钟
    data.astro.frontmatter.minutes = Math.max(1, Math.round(readingTime.minutes))
  }
}