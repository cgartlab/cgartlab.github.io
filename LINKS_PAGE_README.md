# 友链页面功能说明

## 概述
已成功为您的Astro主题添加了一个美观的友链页面，用于展示收藏的网站链接等信息。

## 新增文件

### 1. 组件
- **[LinkCard.astro](./src/components/LinkCard.astro)** - 单个链接卡片组件
  - 显示网站标题、描述、icon和外链箭头
  - 支持悬停动画效果
  - 响应式设计

- **[LinksList.astro](./src/components/LinksList.astro)** - 友链列表容器组件
  - 按分类展示链接
  - 自动根据语言加载对应的数据
  - 使用网格布局（Grid）

### 2. 数据配置
- **[src/data/links.ts](./src/data/links.ts)** - 友链数据文件
  - 支持多语言（中文、English、繁體中文）
  - 按分类组织链接数据
  - 易于维护和扩展

### 3. 页面
- **[src/pages/[...lang]/links.astro](./src/pages/[...lang]/links.astro)** - 友链主页面
  - 自动生成所有语言版本的路由
  - 路径：`/links/`（默认语言）和 `/{lang}/links/`（其他语言）

### 4. 国际化配置更新
- **[src/i18n/ui.ts](./src/i18n/ui.ts)** - 添加了"友链"的多语言文本
- **[src/utils/page.ts](./src/utils/page.ts)** - 添加了`isLinksPage()`函数
- **[src/components/Navbar.astro](./src/components/Navbar.astro)** - 导航栏添加了友链链接

## 设计特点

### 样式
- ✨ **现代简洁** - 采用卡片式设计，与现有设计风格一致
- 🎨 **响应式** - 在桌面端为3列网格，移动端为1列
- 🌓 **深色模式支持** - 完美支持亮色和深色主题
- ⚡ **平滑动画** - 悬停时有smooth transition效果

### 交互
- 卡片悬停时升起（transform）
- 边框颜色从secondary变为primary
- 箭头图标会向右移动
- 背景色和阴影平滑变化

## 如何使用

### 添加新链接

编辑 `src/data/links.ts` 文件，在对应的分类下添加新的链接对象：

```typescript
{
  title: '网站名称',
  description: '网站描述',
  url: 'https://example.com',
  icon: 'https://example.com/favicon.ico',
}
```

### 添加新分类

在 `linksData` 中的对应语言部分添加新的分类键值对：

```typescript
'新分类': [
  // 链接数组
]
```

### 修改导航位置

友链在导航栏中的位置可以通过修改 `src/components/Navbar.astro` 中 `navItems` 数组的顺序来调整。

## 访问方式

- 中文版本：`https://yoursite.com/links/`
- 英文版本：`https://yoursite.com/en/links/`
- 繁体中文：`https://yoursite.com/zh-tw/links/`

## 特色功能

1. **多语言支持** - 自动根据访问者语言显示对应的分类和链接
2. **Favicon加载** - 每个链接可以显示网站favicon
3. **分类管理** - 链接按分类展示，易于浏览
4. **SEO友好** - 符合Astro最佳实践，利于搜索引擎收录

## 后续扩展建议

1. 可以添加链接收藏时间、评分等额外字段
2. 可以实现链接搜索和过滤功能
3. 可以添加用户提交友链的表单
4. 可以集成友链检测功能（检查链接可用性）

## 构建和部署

友链页面已集成到项目构建流程中，直接运行：

```bash
pnpm build
```

即可生成包含友链页面的静态网站。
