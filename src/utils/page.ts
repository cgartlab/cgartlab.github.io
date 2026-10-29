import { base, moreLocales } from "@/config";
import { getLangFromPath } from "@/i18n/lang";
import { getLocalizedPath } from "@/i18n/path";

// 判断路径是否匹配特定页面类型
function matchPageType(path: string, prefix: string = "") {
	// 如果配置了基础路径则移除它
	const pathWithoutBase =
		base && path.startsWith(base) ? path.slice(base.length) : path;

	// 移除路径开头和结尾的斜杠
	const normalizedPath = pathWithoutBase.replace(/^\/|\/$/g, "");

	// 首页检查：匹配根路径('')或语言代码('en', 'zh-tw')
	if (prefix === "") {
		return (
			normalizedPath === "" ||
			(moreLocales as readonly string[]).includes(normalizedPath)
		);
	}

	// 确保严格的段边界匹配以防止部分匹配
	const startsWithSegment = (target: string, segment: string) =>
		target === segment || target.startsWith(`${segment}/`);

	// 匹配默认语言路径和本地化路径
	return (
		startsWithSegment(normalizedPath, prefix) ||
		moreLocales.some((lang) =>
			startsWithSegment(normalizedPath, `${lang}/${prefix}`),
		)
	);
}

export function isHomePage(path: string) {
	return matchPageType(path);
}

/**
 * 文章列表页（/posts/）。与文章详情页（/posts/<slug>/）区分开：
 * 列表页沿用首页的排版，详情页才用文章排版。
 */
export function isPostsListPage(path: string) {
	const pathWithoutBase =
		base && path.startsWith(base) ? path.slice(base.length) : path;
	const normalizedPath = pathWithoutBase.replace(/^\/|\/$/g, "");
	return (
		normalizedPath === "posts" ||
		(moreLocales as readonly string[]).some(
			(lang) => normalizedPath === `${lang}/posts`,
		)
	);
}

export function isPostPage(path: string) {
	return matchPageType(path, "posts") && !isPostsListPage(path);
}

export function isTagPage(path: string) {
	return matchPageType(path, "tags");
}

export function isAboutPage(path: string) {
	return matchPageType(path, "about");
}

export function isWorksPage(path: string) {
	return matchPageType(path, "works");
}

export function isColumnPage(path: string) {
	return matchPageType(path, "column");
}

export function isResourcePage(path: string) {
	return matchPageType(path, "resource");
}

export function isPrivacyPage(path: string) {
	return matchPageType(path, "privacy");
}

export function isTermsPage(path: string) {
	return matchPageType(path, "terms");
}

export function isContactPage(path: string) {
	return matchPageType(path, "contact");
}

// 返回包含语言、页面类型和本地化助手的页面上下文
export function getPageInfo(path: string) {
	const currentLang = getLangFromPath(path);
	const isHome = isHomePage(path);
	const isPostsList = isPostsListPage(path);
	const isPost = isPostPage(path);
	const isTag = isTagPage(path);
	const isAbout = isAboutPage(path);
	const isWorks = isWorksPage(path);
	const isColumn = isColumnPage(path);
	const isResource = isResourcePage(path);
	const isPrivacy = isPrivacyPage(path);
	const isTerms = isTermsPage(path);
	const isContact = isContactPage(path);

	return {
		currentLang,
		isHome,
		isPostsList,
		isPost,
		isTag,
		isAbout,
		isWorks,
		isColumn,
		isResource,
		isPrivacy,
		isTerms,
		isContact,
		getLocalizedPath: (targetPath: string) =>
			getLocalizedPath(targetPath, currentLang),
	};
}
