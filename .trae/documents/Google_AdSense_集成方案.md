# Google AdSense 集成方案

## 项目现状分析

当前项目基于 **Astro** 构建的博客网站，已具备以下基础：
- ✅ `ads.txt` 已配置：`google.com, pub-6319932112761670, DIRECT, f08c47fec0942fa0`
- ✅ Google Search Console 验证完成
- ✅ Google Analytics 已集成（使用 Partytown 优化）
-  Publisher ID: `pub-6319932112761670`

## 实施步骤

### 第一步：在配置文件中添加 AdSense 配置

**文件：** `src/config.ts`

在 `seo` 配置对象中添加 Google AdSense 相关配置：

```ts
seo: {
  // ... 现有配置
  googleAdSense: {
    // 启用 AdSense
    enabled: true,
    // AdSense Publisher ID（已配置）
    publisherID: 'pub-6319932112761670',
  },
}
```

### 第二步：在 Head.astro 中添加 AdSense 脚本

**文件：** `src/layouts/Head.astro`

在 Google Analytics 脚本之后添加 AdSense 加载脚本：

```astro
<!-- Google AdSense -->
{seo.googleAdSense?.enabled && (
  <script
    is:inline
    type="text/partytown"
    async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${seo.googleAdSense.publisherID}`}
    crossorigin="anonymous"
  />
)}
```

**说明：**
- 使用 `type="text/partytown"` 保持与现有 Analytics 一致的第三方脚本优化策略
- `async` 属性确保不阻塞页面渲染
- `crossorigin="anonymous"` 确保跨域资源加载安全

### 第三步：创建广告组件

**新建文件：** `src/components/AdSense.astro`

创建可复用的广告位组件，支持多种广告类型：

```astro
---
interface Props {
  // 广告单元 ID（从 AdSense 后台获取）
  slot: string
  // 广告布局类型
  layout?: 'in-article' | 'display' | 'multiplex' | 'in-feed'
  // 广告格式
  format?: 'auto' | 'fluid' | 'rectangle'
  // 响应式设置
  responsive?: boolean
  // 样式类名
  className?: string
}

const { 
  slot, 
  layout = 'in-article', 
  format = 'auto', 
  responsive = true,
  className = '' 
} = Astro.props

const { publisherID } = themeConfig.seo.googleAdSense
---

<div class={`adsense-container ${className}`}>
  <ins 
    class="adsbygoogle"
    style={{ display: 'block' }}
    data-ad-client={publisherID}
    data-ad-slot={slot}
    data-ad-layout={layout}
    data-ad-format={format}
    data-full-width-responsive={responsive.toString()}
  />
  <script is:inline>
    (adsbygoogle = window.adsbygoogle || []).push({})
  </script>
</div>

<style>
  .adsense-container {
    margin: 2rem 0;
    text-align: center;
  }
  
  /* 防止广告加载时的布局抖动 */
  .adsense-container:empty {
    min-height: 100px;
  }
</style>
```

### 第四步：在文章页面中插入广告位

**修改文件：** `src/layouts/Post.astro`（如果存在）或文章内容组件

在以下位置插入广告组件：

1. **文章中广告（In-Article Ads）：**
   - 文章开头下方
   - 文章中间位置（第一段落后）
   - 文章结尾上方

2. **文章侧边/底部广告：**
   - 文章底部评论区上方

**示例插入位置：**

```astro
<!-- 文章开头广告 -->
<AdSense slot="YOUR_AD_SLOT_ID_1" layout="in-article" />

<!-- 文章内容 -->
<Content />

<!-- 文章结尾广告 -->
<AdSense slot="YOUR_AD_SLOT_ID_2" layout="display" />
```

### 第五步：在类型定义中添加 AdSense 配置类型

**文件：** `src/types.ts`（或相应的类型定义文件）

```ts
interface GoogleAdSenseConfig {
  enabled: boolean
  publisherID: string
}

interface SEOConfig {
  // ... 现有类型
  googleAdSense?: GoogleAdSenseConfig
}
```

### 第六步：测试与验证

1. **本地测试：**
   ```bash
   npm run dev
   ```
   检查 AdSense 脚本是否正确加载

2. **部署后验证：**
   - 访问 AdSense 后台查看广告单元状态
   - 使用浏览器开发者工具检查 `adsbygoogle.js` 是否加载
   - 验证广告是否正确展示

3. **性能检查：**
   - 使用 Lighthouse 检查页面性能
   - 确认 Partytown 正确转发 AdSense 脚本
   - 验证 Core Web Vitals 指标

## 广告位规划建议

### 推荐广告位置

| 位置 | 类型 | 说明 |
|------|------|------|
| 文章头部 | In-Article | 文章标题下方，自然融入阅读流 |
| 文章中部 | In-Article | 长文章中间，提高曝光率 |
| 文章底部 | Display | 评论区上方，用户停留时间长 |
| 侧边栏 | Display | 桌面端固定展示 |

### 注意事项

1. **用户体验优先：**
   - 每篇文章不超过 3 个广告位
   - 避免广告遮挡主要内容
   - 移动端适当减少广告数量

2. **合规要求：**
   - 保持 `ads.txt` 文件更新
   - 遵循 Google AdSense 政策
   - 确保内容符合广告展示要求

3. **性能优化：**
   - 已使用 Partytown 优化第三方脚本
   - 使用 `async` 加载不阻塞渲染
   - 避免累积布局偏移（CLS）

## 后续优化建议

1. **自动插入广告：** 创建 Astro 插件，根据文章长度自动计算广告插入位置
2. **A/B 测试：** 测试不同广告位数量和位置的收益效果
3. **AdSense Auto Ads：** 考虑启用 Google 自动广告功能
4. **广告懒加载：** 实现视口内广告才加载的优化
