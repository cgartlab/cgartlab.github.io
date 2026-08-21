/**
 * remark-glossary
 *
 * 读取 frontmatter.lang 写入 vfile.data.glossaryLang，
 * 供下游 rehype-glossary 插件根据文章语言选择术语匹配集。
 *
 * lang 为空字符串（默认中文文章）→ 归一为 'zh'
 * lang 为 'zh-tw' → 保持 'zh-tw'（rehype 插件内会映射到 zh.wikipedia.org）
 */

import { defaultLocale } from "../config.ts";

export function remarkGlossary(): any {
	return (_tree: any, vfile: any) => {
		if (!vfile) return;
		const fm = vfile?.data?.astro?.frontmatter;
		if (!fm) {
			vfile.data.glossaryLang = defaultLocale ?? "zh";
			return;
		}
		const rawLang = typeof fm.lang === "string" ? fm.lang.trim() : "";
		if (rawLang === "") {
			vfile.data.glossaryLang = defaultLocale ?? "zh";
		} else {
			vfile.data.glossaryLang = rawLang;
		}
	};
}
