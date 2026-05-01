## 1. 專案初始化

- [x] 1.1 建立 Astro 專案（採用 Astro 而非 Next.js 的決策）：執行 `npm create astro@latest` 選擇 Empty template，安裝依賴（Node.js 18+）
- [x] 1.2 設定 `astro.config.mjs`：設定 `output: 'static'`、`site` 與 `base` 對應 GitHub Pages URL
- [x] 1.3 建立 `.env.example` 檔案，列出 `WORDPRESS_URL=https://your-wordpress-site.com`；建立 `.env`（git-ignored）供本地開發使用（Environment variable management）
- [x] 1.4 確認 `WORDPRESS_URL` 環境變數管理：Astro 可正確讀取，缺少時拋出設定錯誤

## 2. WordPress API Client 模組

- [x] 2.1 建立 `src/lib/wordpress.ts`（使用 WordPress REST API 而非 WPGraphQL 的決策）：實作 WordPress base URL via environment variable，驗證 `WORDPRESS_URL` 環境變數，未設定時拋出錯誤訊息 `WORDPRESS_URL environment variable is required`
- [x] 2.2 實作 Fetch paginated post list 函數：接受 `page` 與 `perPage` 參數，加入 `_embed` query parameter，從 response headers 解析 `X-WP-TotalPages` 與 `X-WP-Total`，回傳 `{ posts, totalPages, total }`
- [x] 2.3 實作 Fetch single post by slug 函數：查詢 `/wp-json/wp/v2/posts?slug={slug}&_embed`，找不到時拋出 `POST_NOT_FOUND` 錯誤
- [x] 2.4 驗證 Out-of-range page request 場景：`page` 超過 `totalPages` 時回傳 `{ posts: [], totalPages, total }`

## 3. Brutalist 設計系統

- [x] 3.1 建立 `src/styles/global.css`（設計系統：純 CSS 實作 Brutalist 風格）：定義 Monochrome color palette CSS Custom Properties（`--color-black`、`--color-white`、`--color-gray-light`、`--color-border`）
- [x] 3.2 實作 Bold typography system：定義 display/H2/card-title/body 字型比例，套用 Georgia/serif 標題字型堆疊，`font-display: swap`
- [x] 3.3 建立 `src/components/NavBar.astro`：Navigation bar component，含左側 Logo、右側導覽連結（Blog/Projects/About/Contact）、底部 `2px solid #000` 邊框；行動版 hamburger 選單
- [x] 3.4 建立 `src/components/Hero.astro`：Hero section component，兩欄佈局（60/40），行動版垂直堆疊
- [x] 3.5 建立 `src/components/QuickLinks.astro`：Quick Links bar component，黑底白字，`↗` 箭頭符號，垂直分隔線
- [x] 3.6 建立 `src/components/PostCard.astro`：Post card browser window mockup component（Post cards use browser window mockup style），含頂部圓點與 slug URL、featured image 或佔位圖、標題/摘要/日期/按鈕；`box-shadow: 4px 4px 0 #000`，`border-radius: 0`

## 4. 頁面佈局與路由

- [x] 4.1 建立 `src/layouts/BaseLayout.astro`：包含 `<head>` SEO metadata（title、description、OG tags）、NavBar、主內容區、頁尾
- [x] 4.2 建立 `src/pages/index.astro`：Homepage displays latest posts，Build 時呼叫 `fetchPosts(page=1, perPage=10)`，渲染 PostCard 列表與 "View all posts" 連結
- [x] 4.3 建立 `src/pages/blog/index.astro`：Blog listing page with pagination controls（第 1 頁），含分頁導覽（上一頁/下一頁/頁碼顯示）
- [x] 4.4 建立 `src/pages/blog/page/[n].astro`（分頁機制：Build 時分頁 + URL 分頁）：使用 `getStaticPaths` 實作 Pagination pages generated at Build time，迭代所有頁碼生成靜態頁面
- [x] 4.5 建立 `src/pages/blog/[slug].astro`：使用 `getStaticPaths` 對所有文章生成 Single post page，Build 時抓取所有 slug，每頁渲染 `content.rendered` 全文 HTML

## 5. 文章詳情頁功能

- [x] 5.1 實作 Single post page renders full content：`<article>` 包裹 `content.rendered`（`set:html`），顯示 H1 標題、日期、最後修改日期（若不同則同時顯示）
- [x] 5.2 實作 Post page sets correct HTML metadata：從 post 資料填入 `<title>`（格式：`{title} | 站名`）、`<meta name="description">`（excerpt 去 HTML，限 160 字元）、OG tags
- [x] 5.3 實作 Post content typography scoped to article：在 `src/styles/global.css` 撰寫 `article` 範圍內的 H2-H4、`p`、`code` 樣式，不影響頁面其他元素
- [x] 5.4 處理 Post without featured image 場景：`featured_media` 為 0 或 embedded 媒體不存在時，完全省略 featured image 區塊

## 6. Static Site Generation 建置流程

- [x] 6.1 驗證 Build-time data fetching from WordPress API（純 SSG + Webhook 觸發重建，不用 ISR）：確認 `astro build` 執行時無任何 client-side API fetch，所有資料呼叫均在 Build 階段完成
- [x] 6.2 驗證 Build fetches all pages of posts：API client 迴圈抓取所有頁碼，確認 25 篇文章時生成 3 頁靜態列表頁
- [x] 6.3 驗證 Static output compatible with GitHub Pages：`dist/` 目錄輸出純靜態檔案，內部連結使用正確的 base path

## 7. GitHub Actions CI/CD 與部署

- [x] 7.1 建立 `.github/workflows/deploy.yml`：GitHub Actions workflow for automated deployment，設定觸發條件（`push` to `main` 與 `repository_dispatch` 事件類型 `wordpress-update`）
- [x] 7.2 workflow 中設定 `WORDPRESS_URL` 從 GitHub Secrets 讀取，使用 `peaceiris/actions-gh-pages` 部署 `dist/` 至 `gh-pages` branch
- [x] 7.3 在 GitHub 儲存庫 Settings > Secrets 新增 `WORDPRESS_URL` secret；在 Settings > Pages 設定來源為 `gh-pages` branch（GitHub Pages configuration）
- [x] 7.4 在 WordPress 安裝 WP Webhooks 外掛，設定 WordPress Webhook configuration：文章發布/更新時 POST `{"event_type": "wordpress-update"}` 至 GitHub dispatches API，使用 Personal Access Token（`repo` scope）
- [x] 7.5 端對端驗證：在 WordPress 發布測試文章，確認 GitHub Actions 自動觸發、Build 成功、GitHub Pages 30 秒內更新
