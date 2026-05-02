---
name: headless-wp-astro
description: "Build a Headless WordPress + Astro SSG frontend and deploy to GitHub Pages, including automatic rebuild webhook."
---

# Headless WordPress + Astro 網站建置指南

本 skill 記錄了從零到部署的完整流程，並包含所有實際踩過的坑與注意事項。

## 架構概覽

```
WordPress (CMS)
    │  REST API (/wp-json/wp/v2/posts)
    ▼
Astro SSG (Build time fetch)
    │  npm run build → dist/
    ▼
GitHub Pages (靜態托管)

WordPress 發布文章
    │  Code Snippets (wp_remote_post)
    ▼
GitHub Actions repository_dispatch
    │  重新 build & deploy
    ▼
網站自動更新
```

---

## Step 1：建立 Astro 專案

```bash
npm create astro@latest
# 選擇 Empty 模板、TypeScript Strict
cd your-project
npm install
```

`astro.config.mjs` — 部署到 GitHub Pages 必須設定 `site` 和 `base`：

```js
import { defineConfig } from 'astro/config';

const GITHUB_USERNAME = 'your-username';
const REPO_NAME = 'your-repo-name';

export default defineConfig({
  output: 'static',
  site: `https://${GITHUB_USERNAME}.github.io`,
  base: `/${REPO_NAME}`,
});
```

> **坑**：`base` 不設定的話，所有連結和靜態資源在 GitHub Pages 上都會 404。

---

## Step 2：WordPress API 客戶端

建立 `src/lib/wordpress.ts`。完整版本包含：

- `fetchPosts(page, perPage)` — 分頁抓取
- `fetchAllPosts()` — 抓全部（用於 `getStaticPaths`）
- `fetchPostBySlug(slug)` — 支援數字 ID（中文 slug fallback）
- `getPostSlug(post)` — **關鍵：處理中文 slug**
- `getFeaturedImageUrl / Alt` — 從 `_embedded` 取特色圖片
- `formatDate / truncateExcerpt / stripHtml` — 工具函式

### 中文 Slug 處理（重要！）

WordPress 文章如果用中文標題自動產生 slug，build 時 Astro 會嘗試建立含 `%xx` 編碼字元的目錄，**導致 build 失敗**。

解法：偵測到非 ASCII slug 時，改用文章 ID 作為網址參數：

```typescript
export function getPostSlug(post: WPPost): string {
  try {
    const decoded = decodeURIComponent(post.slug);
    if (/[^\x00-\x7F]/.test(decoded)) return String(post.id);
  } catch {
    return String(post.id);
  }
  return post.slug;
}

export async function fetchPostBySlug(slug: string): Promise<WPPost> {
  // 數字 ID → 直接用 /posts/{id} 端點
  if (/^\d+$/.test(slug)) {
    const url = new URL(`${WORDPRESS_URL}/wp-json/wp/v2/posts/${slug}`);
    url.searchParams.set('_embed', '1');
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`WordPress API error: ${response.status}`);
    return response.json();
  }
  // 一般英文 slug → ?slug=xxx
  const url = new URL(`${WORDPRESS_URL}/wp-json/wp/v2/posts`);
  url.searchParams.set('slug', slug);
  url.searchParams.set('_embed', '1');
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`WordPress API error: ${response.status}`);
  const posts: WPPost[] = await response.json();
  if (!posts.length) throw new Error(`Post not found: ${slug}`);
  return posts[0];
}
```

> **坑**：`getPostSlug()` 必須在**所有用到 slug 的地方**都使用，包括：
> - `src/pages/blog/[slug].astro` 的 `getStaticPaths`
> - `src/pages/index.astro` 的 PostCard
> - `src/pages/blog/index.astro` 的 PostCard
> - `src/pages/blog/page/[n].astro` 的 PostCard
>
> 只改 `getStaticPaths` 但忘記改 PostCard 連結，會導致 build 成功但點進去 404。

---

## Step 3：頁面結構

```
src/pages/
  index.astro              # 首頁（最新 10 篇）
  blog/
    index.astro            # 文章列表第 1 頁
    [slug].astro           # 單篇文章（動態路由）
    page/
      [n].astro            # 文章列表第 2..N 頁
```

### `[slug].astro` 重點

```astro
---
import { fetchAllPosts, fetchPostBySlug, getPostSlug, ... } from '../../lib/wordpress';

export async function getStaticPaths() {
  const posts = await fetchAllPosts();
  return posts.map((post) => ({
    params: { slug: getPostSlug(post) },  // ← 務必用 getPostSlug，不是 post.slug
  }));
}

const { slug } = Astro.params;
const post = await fetchPostBySlug(slug!);
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
---
```

### Base URL 處理

所有頁面內的連結都要加 `base`：

```astro
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
// 用法：<a href={`${base}/blog`}>
```

---

## Step 4：環境變數

`.env`（本地開發）：
```
WORDPRESS_URL=https://your-wordpress-site.com
```

`.env.example`（提交到 git）：
```
WORDPRESS_URL=
```

> **坑**：`.env` 加入 `.gitignore`，不要提交真實網址。

---

## Step 5：GitHub Actions 部署

`.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  repository_dispatch:
    types:
      - wordpress-update

permissions:
  contents: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          WORDPRESS_URL: ${{ secrets.WORDPRESS_URL }}
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### GitHub 儲存庫設定

1. Settings → Secrets and variables → Actions → New repository secret
   - Name: `WORDPRESS_URL`，Value: `https://your-wordpress-site.com`
2. Settings → Pages → Source: `Deploy from a branch` → Branch: `gh-pages` / `root`

> **坑**：忘記設定 `WORDPRESS_URL` secret 會讓第一次 build 就失敗。先設定 secret，再 push 程式碼。

---

## Step 6：WordPress 自動觸發 rebuild

### 方法：Code Snippets 外掛（推薦）

不要用 WP Webhooks 免費版——**無法自訂 request body**，而 GitHub API 必須有 `{"event_type":"wordpress-update"}`。

1. 安裝 **Code Snippets** 外掛
2. Snippets → Add New，貼入以下程式碼，**必須替換 PAT**：

```php
add_action('transition_post_status', 'trigger_github_rebuild', 10, 3);

function trigger_github_rebuild($new_status, $old_status, $post) {
    if ($post->post_type !== 'post') return;
    if ($new_status !== 'publish') return;

    // 防抖動：60 秒內只觸發一次（可改為 10 秒）
    if (get_transient('github_rebuild_lock')) return;
    set_transient('github_rebuild_lock', true, 60);

    wp_remote_post(
        'https://api.github.com/repos/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/dispatches',
        [
            'headers' => [
                'Accept'        => 'application/vnd.github.v3+json',
                'Authorization' => 'Bearer YOUR_GITHUB_PAT',
                'Content-Type'  => 'application/json',
            ],
            'body'    => '{"event_type":"wordpress-update"}',
            'timeout' => 15,
        ]
    );
}
```

3. 儲存並**確認狀態是啟用（Active）**

### GitHub PAT 建立方式

GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- 權限勾選：`repo`
- 有效期限：依需求設定（到期要更新 snippet 裡的 token）

> **坑**：PHP 字串用單引號，PAT 放在 `'Bearer '` 後面的單引號內：
> `'Authorization' => 'Bearer ghp_xxxxxxxxxxxx',`

> **坑**：WP Webhooks 免費版的 Logs 是 Pro 功能，看不到請求記錄，難以除錯。用 Code Snippets 加 `error_log()` 比較好 debug。

### 防抖動說明

WordPress 發布一篇文章時，內部會多次觸發 hooks，沒有防抖動會同時跑多個 Actions。
- `60` 秒 = 較保守，60 秒內發布兩篇只觸發一次（但兩篇都會出現，因為 build 抓所有文章）
- `10` 秒 = 較寬鬆，適合頻繁發布的情境

---

## Step 7：設定正式網域（Cloudflare + GitHub Pages）

當你申請好正式網域並在 Cloudflare 管理時，依以下三個步驟設定。

### 7-1. GitHub 儲存庫設定

前往 GitHub repo → **Settings** → **Pages** → **Custom domain**，填入網域（例如 `www.yourdomain.com`），按 Save。

GitHub 會自動在 repo 根目錄建立一個 `CNAME` 檔案。

### 7-2. Cloudflare DNS 設定

前往 Cloudflare → 你的網域 → **DNS** → **Add record**，新增以下兩筆記錄（同時支援有 www 和不帶 www）：

| Type | Name | Content |
|------|------|---------|
| CNAME | `www` | `your-github-username.github.io` |
| CNAME | `@` | `your-github-username.github.io` |

> **注意**：Cloudflare 的 Proxy 狀態（橘色雲朵）建議先設成 **DNS only**（灰色），確認連線正常後再視需求開啟。DNS 生效通常需要幾分鐘到幾小時。

### 7-3. 更新 `astro.config.mjs`

換了正式網域後，`base` 不再需要（不是子路徑），`site` 換成正式網域：

```js
export default defineConfig({
  output: 'static',
  site: 'https://www.yourdomain.com',
  base: '',
});
```

> **坑**：`base` 改為空字串後，程式碼中所有用到 `import.meta.env.BASE_URL` 的地方會自動變成 `/`，不需要手動修改其他檔案。

改完後 push 到 GitHub，Actions 重新 build 一次就生效。

---

## npm 常見問題

### 權限錯誤

```
npm error code EACCES
npm error syscall mkdir
npm error path /Users/xxx/.npm/_cacache
```

解法：

```bash
npm install --cache /tmp/npm-cache
```

或修復權限：

```bash
sudo chown -R $(whoami) ~/.npm
```

---

## 除錯備忘

| 症狀 | 原因 | 解法 |
|------|------|------|
| build 失敗，路徑含 `%xx` | 文章 slug 是中文 | 實作 `getPostSlug()` fallback to ID |
| PostCard 點進去 404 | PostCard 連結還在用 `post.slug` | 所有 PostCard 改用 `getPostSlug(post)` |
| GitHub Actions 不觸發 | PAT 還是 `YOUR_PAT_HERE` 未替換 | 替換真實 PAT |
| GitHub Actions 一次跑多個 | 沒有防抖動機制 | 加 `set_transient` 限制 |
| 第一次 build 失敗 | `WORDPRESS_URL` secret 未設定 | 先設定 secret 再 push |
| 本地 `npm install` 失敗 | `.npm/_cacache` 權限問題 | `npm install --cache /tmp/npm-cache` |
| 靜態資源 404 | `astro.config.mjs` 缺少 `base` | 設定 `base: '/repo-name'` |
| PAT 過期後 webhook 停止 | GitHub PAT 有效期限到 | 重新產生 PAT，更新 snippet |
| 換網域後靜態資源 404 | `astro.config.mjs` 的 `base` 未清空 | 將 `base` 改為空字串 `''` |
| 換網域後連結路徑錯誤 | `site` 還是舊的 GitHub Pages 網址 | 將 `site` 換成正式網域 |
