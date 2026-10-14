# AGENTS.md — src/content/posts/

博客文章与专栏内容目录。148 个文件（74 篇独立文章 + 74 篇英文翻译），含 column/ 专栏子目录。

## STRUCTURE

```
posts/
├── column/           # 玄光专栏 (19 期，中英双语)
├── _images/          # 文章图片（同名文章目录）
├── _files/           # 文章附件
├── works/            # 作品展示
└── *.md              # 博客文章
```

## WHERE TO LOOK

| Task     | Location               | Notes                              |
| -------- | ---------------------- | ---------------------------------- |
| 新建文章 | `pnpm new-post "标题"` | 自动创建 frontmatter               |
| 专栏     | `column/`              | 命名: `[主题] - No.XX 玄光专栏.md` |
| 文章图片 | `_images/`             | 与文章同名子目录                   |
| 作品     | `works/`               | 作品展示页面                       |
| 双语文章 | `*.md` + `*-en.md`     | 英文版加 `-en` 后缀                |

## CONVENTIONS

- **文件名**: 中文标题，专栏含 `No.XX 玄光专栏`
- **图片路径**: `_images/{文章名}/` 或 `_images/{文章名}.{ext}`
- **附件路径**: `_files/{文章名}/`
- **Frontmatter 完整字段**: `title`, `published` (必需); `tags`, `draft`, `pin`, `lang`, `abbrlink`, `description`, `updated`, `toc` (可选)

## NOTES

- ESLint 忽略 `src/content/**` — 此目录不受 lint 约束
- Obsidian 配置 (`.obsidian/`) 用于本地编辑，不影响构建
- 文章数量: 148 个文件 (含 19 期专栏，每期中英双语)
