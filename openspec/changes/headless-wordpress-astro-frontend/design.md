## Context

本專案是全新的無頭式 WordPress 前端網站。WordPress 站已運作中，REST API 可公開存取。前端目前不存在——從零開始建立。網站定位為 AI 內容部落格與作品集，設計風格採用 Brutalist/Retro（仿 Flowmingo 模板），部署於 GitHub Pages。

## Goals / Non-Goals

**Goals:**
- 以 Astro 建立完整靜態前端，Build 時從 WordPress REST API 抓取資料
- 實作 Brutalist/Retro 視覺設計系統
- 設定 GitHub Actions 自動化 CI/CD，支援 WordPress Webhook 觸發重建
- 分頁機制確保 API 查詢效率（每頁 10 篇）

**Non-Goals:**
- 不實作 ISR、Server-Side Rendering、API Routes
- 不整合 WPGraphQL
- 不部署至 Cloudflare Pages
- 不實作前端評論、會員登入等動態功能

## Decisions

### 採用 Astro 而非 Next.js

採用 Astro 作為前端框架。

理由：本專案是純內容型靜態網站，Astro 預設輸出零 KB JavaScript（除非顯式加入 Islands），適合部落格與作品集。Next.js 的 ISR、Server Components、API Routes 在純 GitHub Pages 部署下無法使用，引入這些功能是額外負擔而非優勢。Astro 的 Content Collections 與 `getStaticPaths` 對 WordPress REST API 資料模型映射直觀。

替代方案：Next.js `output: 'export'` 模式可靜態輸出，但需關閉大量 Next.js 核心功能，且產出的 JS bundle 仍比 Astro 大 3-5 倍。

### 使用 WordPress REST API 而非 WPGraphQL

使用 WordPress 內建 REST API（`/wp-json/wp/v2/posts`）。

理由：REST API 無需安裝外掛，降低維護負擔。此專案的查詢模式單純（列表分頁、單篇取得），不需要 GraphQL 的欄位選取彈性。WPGraphQL 帶來額外的 WordPress 外掛依賴，引入維護風險。

替代方案：WPGraphQL 可減少 over-fetching，但對這個規模的內容網站節省幅度有限，且 Build 時間不是瓶頸。

### 純 SSG + Webhook 觸發重建，不用 ISR

採用純靜態生成（SSG），更新機制依賴 Webhook 觸發 GitHub Actions 重建全站。

理由：GitHub Pages 不支援 Edge Functions，ISR 無法在此部署環境運作。預期發文頻率為每日一篇以下，全站重建時間約 1-3 分鐘，可接受。ISR 的複雜度（需要 Workers、快取控制邏輯）對此需求不划算。

### 分頁機制：Build 時分頁 + URL 分頁

Build 時針對每個頁碼生成獨立靜態頁面（`/blog/page/1`、`/blog/page/2`...），每頁 10 篇，使用 WordPress REST API 的 `per_page` 與 `page` 參數控制。

理由：靜態頁面保證每頁的 Lighthouse 效能分數一致，URL 可書籤/SEO 友善。

### 設計系統：純 CSS 實作 Brutalist 風格

不使用 CSS 框架（Tailwind 可選），以原生 CSS Custom Properties 實作設計 token。

核心視覺元素：
- 字型：`font-weight: 900`，serif 標題（如 `Georgia` 或 Google Fonts `Playfair Display`）
- 色彩：純黑（`#000000`）+ 純白（`#ffffff`）+ 淺灰點陣紋理背景
- 邊框：`2px solid #000`，無圓角（`border-radius: 0`）
- 卡片：browser window mockup（頂部有兩個圓點 + 假 URL 欄）
- 快速連結：水平排列，右上箭頭（`↗`）

## Risks / Trade-offs

- [WordPress REST API 無認證] → Astro Build 環境透過環境變數管理 WordPress URL，不暴露於前端靜態輸出中
- [全站重建時間] → 文章數量增長至 500+ 篇時，Build 時間可能超過 5 分鐘；屆時可考慮增量快取策略，現階段不需解決
- [字型載入效能] → 使用 `font-display: swap` + preload 避免 FOUT；或選用系統字型堆疊規避外部依賴
- [Webhook 安全性] → GitHub Actions 的 `repository_dispatch` endpoint 使用 Personal Access Token 驗證，需在 WordPress 外掛設定中妥善保管
