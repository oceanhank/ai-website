## Why

現有 WordPress 網站負責所有頁面渲染，效能受限且前端難以客製化。本專案將前後端分離，以 Astro 靜態框架取代 WordPress 的頁面渲染職責，打造一個高效能的 AI 內容部落格與作品集網站。

## What Changes

- **新增** Astro 前端專案，採用 Brutalist/Retro 設計風格（仿 Flowmingo 模板：黑白配色、粗邊框、browser window mockup 卡片）
- **新增** WordPress REST API 串接模組，支援分頁查詢（預設每頁 10 篇）
- **新增** 靜態頁面生成流程：Build 階段預先抓取所有文章，輸出純靜態 HTML
- **新增** GitHub Actions CI/CD 流程，透過 WordPress Webhook 自動觸發重建並部署至 GitHub Pages
- **新增** 首頁（Hero + Quick Links + 文章列表）、文章列表頁、單篇文章詳情頁

## Non-Goals

- 不實作 ISR（Incremental Static Regeneration）—— 採用純 SSG，更新透過 Webhook 觸發全站重建
- 不使用 WPGraphQL，WordPress REST API 已足夠此規模的內容需求
- 不部署至 Cloudflare Pages，統一使用 GitHub Pages 管理
- 不在前端實作評論、會員登入等動態功能

## Capabilities

### New Capabilities

- `wordpress-api-client`: 與 WordPress REST API 溝通的服務層，提供分頁文章列表與單篇文章查詢
- `static-site-generation`: Astro SSG 建置流程，Build 階段預先抓取 WordPress 內容並輸出靜態 HTML
- `blog-listing`: 首頁與文章列表頁的 UI 元件，含分頁導覽
- `post-detail`: 單篇文章詳情頁 UI 元件，含文章內容渲染
- `brutalist-design-system`: Brutalist/Retro 設計系統，含導覽列、Hero、Quick Links、卡片元件
- `github-pages-deployment`: GitHub Actions CI/CD 流程，含 Webhook 自動觸發與 GitHub Pages 部署

### Modified Capabilities

（無——此為全新專案）

## Impact

- Affected specs: 以上 6 個新 capability，各需建立對應 spec 檔
- Affected code:
  - New: src/pages/index.astro
  - New: src/pages/blog/index.astro
  - New: src/pages/blog/[slug].astro
  - New: src/lib/wordpress.ts
  - New: src/components/PostCard.astro
  - New: src/components/NavBar.astro
  - New: src/components/Hero.astro
  - New: src/components/QuickLinks.astro
  - New: src/layouts/BaseLayout.astro
  - New: src/styles/global.css
  - New: astro.config.mjs
  - New: .github/workflows/deploy.yml
  - New: package.json
