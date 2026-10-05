import { SKIP, visit } from "unist-util-visit";

// Obsidian 风格的图片尺寸语法：alt 末尾的 |宽 或 |宽x高，如 ![描述|319](img) / ![描述|693x452](img)
const ALT_SIZE_PATTERN = /\|\s*(\d+)(?:x(\d+))?\s*$/;

// 从 alt 文本中剥离尺寸后缀。仅当 | 之后为纯数字（或 宽x高）形态时才切分，避免误伤正常的 | 文本
function parseAltSize(altText) {
	if (typeof altText !== "string") {
		return { caption: altText };
	}
	const match = altText.match(ALT_SIZE_PATTERN);
	if (!match) {
		return { caption: altText };
	}
	return {
		caption: altText.slice(0, match.index).trim(),
		width: Number(match[1]),
		height: match[2] ? Number(match[2]) : undefined,
	};
}

function createFigure(imgNode, isInGallery = false) {
	// 获取替代文本，并剥离 |宽x高 尺寸语法（该后缀不应进入图注，也不应留在 alt 中）
	const { caption, width, height } = parseAltSize(imgNode.properties?.alt);
	if (typeof imgNode.properties?.alt === "string") {
		imgNode.properties.alt = caption;
	}
	// 让尺寸语法真正生效：落到 img 的 width/height 属性
	if (width) {
		imgNode.properties.width = width;
	}
	if (height) {
		imgNode.properties.height = height;
	}

	// 如果没有替代文本或者以_开头则跳过说明
	const shouldSkipCaption = !caption || caption.startsWith("_");

	// 非画廊的单图无 alt：直接返回裸 imgNode（不包裹 figure）
	if (shouldSkipCaption && !isInGallery) {
		return imgNode;
	}

	const children = [imgNode];

	// 添加说明文字（有 alt 且不以 _ 开头）
	if (!shouldSkipCaption) {
		children.push({
			type: "element",
			tagName: "figcaption",
			properties: {},
			children: [{ type: "text", value: caption }],
		});
	}

	return {
		type: "element",
		tagName: "figure",
		// 画廊图片无论是否有 alt 都必须有 gallery-item class
		properties: isInGallery ? { className: ["gallery-item"] } : {},
		children,
	};
}

export function rehypeImageProcessor() {
	return (tree) => {
		visit(tree, "element", (node, index, parent) => {
			// 跳过非段落元素、空段落和孤立节点
			if (
				node.tagName !== "p" ||
				!node.children ||
				node.children.length === 0 ||
				!parent
			) {
				return;
			}

			// 从段落中收集图片
			const imgNodes = [];
			for (const child of node.children) {
				if (child.tagName === "img") {
					imgNodes.push(child);
				} else if (child.type !== "text" || child.value.trim() !== "") {
					return; // 跳过包含非图像内容的段落
				}
			}

			if (imgNodes.length === 0) {
				return;
			}

			const isInGallery =
				parent?.properties?.className?.includes("gallery-container");

			// 画廊容器：将图片转换为带说明的图像
			if (isInGallery) {
				const figures = imgNodes.map((imgNode) =>
					createFigure(imgNode, true),
				);
				parent.children.splice(index, 1, ...figures);
				// splice 后更新游标，避免索引偏移导致跳过或重复遍历兄弟节点
				return [SKIP, index + figures.length];
			}

			// 单张图片：在非画廊容器中转换为带说明的图像
			if (imgNodes.length === 1) {
				const figure = createFigure(imgNodes[0], false);
				if (figure !== imgNodes[0]) {
					// 仅在发生转换时替换
					node.tagName = "figure";
					node.properties = figure.properties;
					node.children = figure.children;
				}
				return;
			}

			// 多张图片：在非画廊容器中，每张图片均通过 createFigure 处理以保留 alt/figcaption
			const figures = imgNodes.map((imgNode) =>
				createFigure(imgNode, false),
			);
			parent.children.splice(index, 1, ...figures);
			// splice 后更新游标
			return [SKIP, index + figures.length];
		});

		// 兜底：不在独立 <p> 中的图片（如列表项内、与文字同行）不包 figure，
		// 但同样剥离 alt 末尾的尺寸段，避免 |尺寸 残留在 alt 中（读屏 / 裂图 / RSS 可见）
		visit(tree, "element", (node) => {
			if (node.tagName !== "img") {
				return;
			}
			if (typeof node.properties?.alt === "string") {
				const { caption } = parseAltSize(node.properties.alt);
				if (caption !== node.properties.alt) {
					node.properties.alt = caption;
				}
			}
		});
	};
}
