# AI资源导航 SEO优化审计报告

**生成日期**: 2026-02-08
**项目路径**: `/home/dev/agigps/ai-resource-navigator`
**审计工具**: seo-optimizer skill, Manual Code Review

---

## 1. 现状摘要

项目基于 **Next.js (App Router)** 构建，具备良好的性能基础（如 `next/font`）。然而，当前实现严重依赖 **客户端渲染 (CSR)**，导致初始 HTML 内容空洞，对搜索引擎极不友好。关键内容（资源列表）通过异步 `fetch` 和懒加载获取，这使得大部分爬虫无法索引核心数据。此外，缺失关键的结构化数据 (JSON-LD) 和 H1 标签。

**预估 SEO 健康度**: 🔴 差 (Critical Issues Found)

---

## 2. 技术SEO审计

### 2.1 渲染与索引 (Critical)
- **问题**: 首页 (`src/app/page.tsx`) 和分类组件 (`CategorySection.tsx`) 均标记为 `'use client'`。
- **影响**: 初始 HTML 响应中不包含任何资源数据。`CategorySection` 使用 `IntersectionObserver` 进行懒加载，意味着只有当用户滚动时才加载内容。爬虫（通常不滚动）将只看到空白页面。
- **建议**: **必须**重构为 **服务器组件 (RSC)**。在 `page.tsx` 中直接查询数据库（Prisma），将数据作为 props 传递给客户端组件（如果需要交互）。

### 2.2 元标签与 Head
- **Title/Description**: ✅ 在 `layout.tsx` 中已配置基础元数据。
- **Canonical**: ❌ 缺失。建议在 `layout.tsx` 的 `metadataBase` 基础上显式添加规范链接，防止参数（如 `?sort=newest`）导致重复内容问题。
- **Hreflang**: ❌ 未配置。虽然目前仅有中文，但建议添加 `x-default` 指向首页。
- **Viewport**: ✅ Next.js 自动处理。

### 2.3 站点地图与 Robots
- **Sitemap**: ⚠️ `src/app/sitemap.ts` 仅包含首页和隐私页。缺失具体的资源详情页（如有）或分类页。
- **Robots.txt**: ✅ `src/app/robots.ts` 配置正确，屏蔽了 `/admin/` 和 `/api/`。

### 2.4 URL 结构
- **现状**: 资源跳转使用 `/api/go/[id]` (302 Redirect)。
- **建议**: 对于 SEO，直接链接到目标网站通常会流失权重（Link Juice）。建议保留跳转页但添加 `rel="nofollow"` 给外部链接，或者如果希望传递权重，确保跳转页本身不被索引（`X-Robots-Tag: noindex`）。

---

## 3. 内容SEO评估

### 3.1 标题层级
- **H1 缺失**: ❌ 首页没有 `<h1>` 标签。`src/app/page.tsx` 使用了 `h2` ("发现最佳 AI 工具")。
- **建议**: 将 Hero Section 的主标题改为 `<h1>`。

### 3.2 关键词与内容
- **关键词分布**: 关键词主要集中在 JS 加载的内容中，HTML 中稀缺。
- **图片 Alt**: ⚠️ 需确保 `ResourceCard` 中的 Logo 图片具有描述性 `alt` 属性（如 "ChatGPT Logo" 而非 "logo"）。

### 3.3 结构化数据 (Schema.org)
- **现状**: ❌ 完全缺失。
- **建议**: 在 `layout.tsx` 或 `page.tsx` 中注入 `WebSite` 和 `CollectionPage` 的 JSON-LD。

---

## 4. 性能指标 (Core Web Vitals)
- **CLS (累积布局偏移)**: ⚠️ `CategorySection` 使用高度占位符 (`min-h-[300px]`)，但加载后高度可能变化，导致布局抖动。
- **LCP (最大内容绘制)**: ⚠️ 依赖客户端 fetch，LCP 会显著延迟。迁移到 SSR 将大幅改善。

---

## 5. 优化建议清单 (按优先级排序)

| 优先级 | 任务类型 | 任务描述 | 预期影响 |
| :--- | :--- | :--- | :--- |
| **P0** | **架构重构** | **将首页重构为 SSR**：在 `page.tsx` 中使用 `await db.resource.findMany()` 获取首屏数据，直接渲染 HTML。移除首屏的懒加载。 | **索引率提升 100%** (核心内容可见) |
| **P0** | **标签修复** | **添加 H1 标签**：将首页主标题改为 `<h1>`。 | 关键词排名提升 |
| **P0** | **结构化数据** | **添加 JSON-LD**：注入 `WebSite` 和 `ItemList` 结构化数据。 | 搜索结果富媒体展示 |
| **P1** | **链接规范** | **配置 Canonical URL**：在 `layout.tsx` 中添加。 | 防止重复内容降权 |
| **P1** | **Sitemap** | **完善 Sitemap**：如果添加了分类页路由（如 `/category/coding`），需加入 sitemap。 | 提升抓取效率 |
| **P2** | **图片优化** | 确保所有图片使用 `next/image` 并包含正确 `alt`。 | 图片搜索流量 |
| **P2** | **性能优化** | 优化 CLS，确保骨架屏高度与实际内容一致。 | 提升用户体验评分 |

---

## 6. 代码片段示例

### 6.1 推荐的 `layout.tsx` JSON-LD 注入

```tsx
// src/app/layout.tsx
import Script from 'next/script'

// ... existing code ...

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI资源导航",
    "url": "https://ai-nav.example.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://ai-nav.example.com/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  )
}
```

### 6.2 推荐的 H1 修改 (`src/app/page.tsx`)

```tsx
// 将 h2 改为 h1
<h1 className="text-4xl sm:text-5xl font-bold mb-6 ...">
  发现最佳 AI 工具
</h1>
```
