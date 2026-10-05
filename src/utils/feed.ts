import type { APIContext, ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import type { Language } from "@/i18n/config";
import { getImage } from "astro:assets";
import { getCollection } from "astro:content";
import { Feed } from "feed";
import MarkdownIt from "markdown-it";
import { parse } from "node-html-parser";
import sanitizeHtml from "sanitize-html";
import { base, defaultLocale, themeConfig } from "@/config";
import { ui } from "@/i18n/ui";
import { memoize } from "@/utils/cache";
import { getPostDescription } from "@/utils/description";

const markdownParser = new MarkdownIt();
const { title, description, i18nTitle, url, author } = themeConfig.site;
const { folo } = themeConfig.seo ?? {};

// Obsidian 风格的图片尺寸语法：alt 末尾的 |宽 或 |宽x高。
// 与 src/plugins/rehype-image-processor.mjs 保持同一规则——feed 走独立的 markdown-it 渲染，
// 不经过 rehype 管线，需在此单独剥离，避免尺寸段污染 content:encoded 的 alt 文本。
const ALT_SIZE_PATTERN = /\|\s*(\d+)(?:x(\d+))?\s*$/;

function stripAltSize(alt: string): string {
	return alt.replace(ALT_SIZE_PATTERN, "").trim();
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// 动态导入 /src/content/posts/_images 下的所有图像
const imagesGlob = import.meta.glob<{ default: ImageMetadata }>(
	"/src/content/posts/_images/**/*.{jpeg,jpg,png,gif,webp}",
);

/**
 * 百分号解码，解码失败时原样返回。
 *
 * markdown-it 在渲染时用 mdurl.encode 归一化链接目标（中文 → %E4%B8%BA、
 * 空格 → %20），而 import.meta.glob 的键是磁盘上的原始文件名。两者不先对齐
 * 就查表必然 miss——表现为 RSS content:encoded 里的 <img> 静默停留在
 * `../_images/...` 相对路径，第三方阅读器直接裂图。
 *
 * decodeURIComponent 遇到残缺转义序列（如裸 `%`）会抛 URIError，必须兜住。
 */
function decodePathSafe(src: string) {
	try {
		return decodeURIComponent(src);
	}
	catch {
		return src;
	}
}

/**
 * 将相对图像路径转换为绝对URL
 *
 * @param srcPath - 来自markdown内容的相对图像路径（已过 markdown-it 归一化）
 * @param baseUrl - 站点基础URL
 * @returns 优化后的图像URL，如果处理失败则返回null
 */
async function _getAbsoluteImageUrl(srcPath: string, baseUrl: string) {
	// 先解码再剥前缀：前缀本身不会被编码，但文件名会，两者顺序不能颠倒
	const decoded = decodePathSafe(srcPath);
	// 从图像源路径中移除相对路径前缀 (../ 和 ./)
	const prefixRemoved = decoded.replace(/^(?:\.\.\/)+|^\.\//, "");
	const absolutePath = `/src/content/posts/${prefixRemoved}`;
	const imageImporter = imagesGlob[absolutePath];

	if (!imageImporter) {
		return null;
	}

	// 导入图像模块并提取其元数据
	const imageMetadata = await imageImporter()
		.then((importedModule) => importedModule.default)
		.catch((error: unknown) => {
			const message =
				error instanceof Error ? error.message : String(error);
			console.warn(`导入图像失败: ${absolutePath}`, message);
			return null;
		});

	if (!imageMetadata) {
		return null;
	}

	// 从元数据创建优化图像
	const optimizedImage = await getImage({ src: imageMetadata });
	return new URL(optimizedImage.src, baseUrl).toString();
}

// 导出记忆化版本
const getAbsoluteImageUrl = memoize(_getAbsoluteImageUrl);

/**
 * 修复HTML内容中的相对图像路径
 *
 * @param htmlContent HTML内容字符串
 * @param baseUrl 站点的基础URL
 * @returns 处理后的HTML字符串，其中所有图像路径都已转换为绝对URL
 */
async function fixRelativeImagePaths(
	htmlContent: string,
	baseUrl: string,
): Promise<string> {
	const htmlDoc = parse(htmlContent);
	const images = htmlDoc.getElementsByTagName("img");
	const imagePromises = [];

	for (const img of images) {
		// 剥离 alt 中的尺寸语法，避免污染 feed 输出
		const alt = img.getAttribute("alt");
		if (alt) {
			const cleanedAlt = stripAltSize(alt);
			if (cleanedAlt !== alt) {
				img.setAttribute("alt", cleanedAlt);
			}
		}

		const src = img.getAttribute("src");
		if (!src) {
			continue;
		}

		imagePromises.push(
			(async () => {
				try {
					// 如果不是指向src/content/posts/_images目录的相对路径则跳过
					if (
						!src.startsWith("./") &&
						!src.startsWith("../") &&
						!src.startsWith("_images/")
					) {
						return;
					}

					// 处理来自src/content/posts/_images目录的图像
					const absoluteImageUrl = await getAbsoluteImageUrl(
						src,
						baseUrl,
					);
					if (absoluteImageUrl) {
						img.setAttribute("src", absoluteImageUrl);
					}
				} catch (error: unknown) {
					const message =
						error instanceof Error ? error.message : String(error);
					console.warn(
						`无法将相对图像路径转换为绝对URL: ${src}`,
						message,
					);
				}
			})(),
		);
	}

	await Promise.all(imagePromises);

	return htmlDoc.toString();
}

/**
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * 生成支持RSS和Atom格式的订阅源对象
 *
 * @param options 订阅源生成选项
 * @param options.lang 可选的语言代码
 * @returns 已准备好用于RSS或Atom输出的Feed实例
 */
export async function generateFeed({ lang }: { lang?: Language } = {}) {
	const currentUI =
		ui[lang as keyof typeof ui] ??
		ui[defaultLocale as keyof typeof ui] ??
		{};
	const siteURL = lang ? `${url}${base}/${lang}/` : `${url}${base}/`;

	// 创建Feed实例
	const feed = new Feed({
		title: i18nTitle ? currentUI.title : title,
		description: i18nTitle ? currentUI.description : description,
		id: siteURL,
		link: siteURL,
		language: lang ?? themeConfig.global.locale,
		copyright: `版权所有 © ${new Date().getFullYear()} ${author}`,
		updated: new Date(),
		generator: "CGArtLab",

		feedLinks: {
			rss: new URL(
				lang ? `${base}/${lang}/rss.xml` : `${base}/rss.xml`,
				url,
			).toString(),
			atom: new URL(
				lang ? `${base}/${lang}/atom.xml` : `${base}/atom.xml`,
				url,
			).toString(),
		},

		author: {
			name: author,
			link: `${url}${base}/`,
		},
	});

	// 按语言筛选文章并排除草稿
	const posts = await getCollection(
		"posts",
		({ data }: { data: CollectionEntry<"posts">["data"] }) => {
			const isNotDraft = !data.draft;
			const isCorrectLang =
				data.lang === lang ||
				data.lang === "" ||
				(lang === undefined && data.lang === defaultLocale);

			return isNotDraft && isCorrectLang;
		},
	);

	// 按发布日期降序排列文章并限制为最新的25篇
	const recentPosts = [...posts]
		.sort(
			(a, b) =>
				new Date(b.data.published).getTime() -
				new Date(a.data.published).getTime(),
		)
		.slice(0, 25);

	// 将文章添加到订阅源
	for (const post of recentPosts) {
		const slug = post.data.abbrlink || post.id;
		const link = new URL(`posts/${slug}/`, siteURL).toString();

		// 优化内容处理
		const postContent = post.body
			? sanitizeHtml(
					await fixRelativeImagePaths(
						markdownParser.render(post.body),
						`${url}${base}/`,
					),
					{
						// 在订阅源内容中允许<img>标签
						allowedTags: sanitizeHtml.defaults.allowedTags.concat([
							"img",
						]),
					},
				)
			: "";

		// publishDate -> Atom:<published>, RSS:<pubDate>
		const publishDate = new Date(post.data.published);
		// updateDate -> Atom:<updated>, RSS没有更新标签
		const updateDate = post.data.updated
			? new Date(post.data.updated)
			: publishDate;

		feed.addItem({
			title: post.data.title,
			id: link,
			link,
			description: getPostDescription(post, "feed"),
			content: postContent,
			author: [
				{
					name: author,
					link: `${url}${base}/`,
				},
			],
			published: publishDate,
			date: updateDate,
		});
	}

	// Add folo verification if available
	if (folo?.feedID && folo?.userID) {
		feed.addExtension({
			name: "folo_challenge",
			objects: {
				feedId: folo.feedID,
				userId: folo.userID,
			},
		});
	}

	return feed;
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// 生成RSS 2.0格式的订阅源
export async function generateRSS(context: APIContext) {
	const feed = await generateFeed({
		lang: context.params?.lang as Language | undefined,
	});

	// 为RSS订阅源添加XSLT样式表
	let rssXml = feed.rss2();
	rssXml = rssXml.replace(
		'<?xml version="1.0" encoding="utf-8"?>',
		`<?xml version="1.0" encoding="utf-8"?>\n<?xml-stylesheet href="${base}/feeds/rss-style.xsl" type="text/xsl"?>`,
	);

	return new Response(rssXml, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
		},
	});
}

// 生成Atom 1.0格式的订阅源
export async function generateAtom(context: APIContext) {
	const feed = await generateFeed({
		lang: context.params?.lang as Language | undefined,
	});

	// 为Atom订阅源添加XSLT样式表
	let atomXml = feed.atom1();
	atomXml = atomXml.replace(
		'<?xml version="1.0" encoding="utf-8"?>',
		`<?xml version="1.0" encoding="utf-8"?>\n<?xml-stylesheet href="${base}/feeds/atom-style.xsl" type="text/xsl"?>`,
	);

	return new Response(atomXml, {
		headers: {
			"Content-Type": "application/atom+xml; charset=utf-8",
		},
	});
}
