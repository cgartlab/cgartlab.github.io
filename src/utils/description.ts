import type { CollectionEntry } from "astro:content";
import type { Language } from "@/i18n/config";
import MarkdownIt from "markdown-it";
import { defaultLocale } from "@/config";

type ExcerptScene = "list" | "meta" | "og" | "feed";

const markdownParser = new MarkdownIt();
const excerptLengths: Record<ExcerptScene, { cjk: number; other: number }> = {
	list: {
		cjk: 120,
		other: 240,
	},
	meta: {
		cjk: 120,
		other: 240,
	},
	og: {
		cjk: 70,
		other: 140,
	},
	feed: {
		cjk: 70,
		other: 140,
	},
};

const htmlEntityMap: Record<string, string> = {
	// &amp; 必须最后解码，避免其他实体中的 & 被提前替换
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	"&apos;": "'",
	"&nbsp;": " ",
	"&amp;": "&",
};

// 预编译正则，避免每次调用都重新构造
// & 和 ; 不是正则特殊字符，直接传入 entity 字符串即可
const htmlEntityRegexes: Array<[RegExp, string]> = Object.entries(
	htmlEntityMap,
).map(([entity, char]) => [new RegExp(entity, "g"), char]);

// 模块级语言判断，避免在每次 getExcerpt 调用时重新创建
function isCJKLang(lang: Language): boolean {
	return ["zh", "zh-tw", "ja", "ko"].includes(lang);
}

// 根据语言和场景创建指定长度的纯净文本摘要
function getExcerpt(text: string, lang: Language, scene: ExcerptScene): string {
	const length = isCJKLang(lang)
		? excerptLengths[scene].cjk
		: excerptLengths[scene].other;

	// 移除HTML标签
	let cleanText = text.replace(/<[^>]*>/g, "");

	// 解码HTML实体（使用预编译正则）
	for (const [re, char] of htmlEntityRegexes) {
		cleanText = cleanText.replace(re, char);
	}

	// 规范化空白字符
	cleanText = cleanText.replace(/\s+/g, " ");

	// 规范化CJK标点符号间距
	cleanText = cleanText.replace(/([。？！："」』])\s+/g, "$1");

	const excerpt = cleanText.slice(0, length).trim();

	// 移除尾部标点符号并添加省略号
	if (cleanText.length > length) {
		return `${excerpt.replace(/\p{P}+$/u, "")}...`;
	}

	return excerpt;
}

// 按行解析去除 fenced code block，避免 regex 误判嵌套/相邻代码块
function stripCodeBlocks(text: string): string {
	const lines = text.split("\n");
	const result: string[] = [];
	let inCodeBlock = false;
	for (const line of lines) {
		if (line.trimStart().startsWith("```")) {
			inCodeBlock = !inCodeBlock;
			continue;
		}
		if (!inCodeBlock) {
			result.push(line);
		}
	}
	return result.join("\n");
}

// 从现有描述或内容生成文章描述
export function getPostDescription(
	post: CollectionEntry<"posts">,
	scene: ExcerptScene,
): string {
	const lang = (post.data.lang || defaultLocale) as Language;

	if (post.data.description) {
		const rendered = markdownParser.render(post.data.description);
		return getExcerpt(rendered, lang, scene);
	}

	const rawContent = post.body || "";
	const cleanContent = stripCodeBlocks(rawContent)
		.replace(/^\s*#{1,6}\s+\S.*$/gm, "")
		.replace(/^\s*::.*$/gm, "")
		.replace(/^\s*>\s*\[!.*\]$/gm, "")
		.replace(/\n{2,}/g, "\n\n");

	const renderedContent = markdownParser.render(cleanContent);
	return getExcerpt(renderedContent, lang, scene);
}
