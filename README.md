# AI Notes — Headless WordPress + Astro 網站

以 WordPress 作為後端 CMS、Astro 作為前端框架的靜態網站，部署於 GitHub Pages，並在 WordPress 發布文章時自動觸發重新建置。

## 架構概覽

```
WordPress (CMS)
    │  REST API (/wp-json/wp/v2/posts)
    ▼
Astro SSG（Build 階段預先抓取所有文章）
    │  npm run build → dist/
    ▼
GitHub Pages（靜態托管）

WordPress 發布 / 更新文章
    │  Code Snippets (wp_remote_post)
    ▼
GitHub Actions repository_dispatch
    │  重新 build & deploy
    ▼
網站自動更新（約 2 分鐘後生效）
```

## 技術堆疊

| 層級 | 技術 |
|------|------|
| CMS | WordPress（REST API） |
| 前端框架 | Astro 4（Static output） |
| 樣式 | 純 CSS（Brutalist 設計系統） |
| 部署 | GitHub Pages（`gh-pages` branch） |
| CI/CD | GitHub Actions |
| 自動觸發 | WordPress Code Snippets + GitHub PAT |

---

## 本地開發

### 前置需求

- Node.js 20+
- 一個可存取的 WordPress 網站（需開放 REST API）

### 啟動步驟

```bash
# 1. 安裝相依套件
npm install

# 2. 建立本地環境變數
cp .env.example .env
# 編輯 .env，填入你的 WordPress 網址
# WORDPRESS_URL=https://your-wordpress-site.com

# 3. 啟動開發伺服器
npm run dev
# 瀏覽器開啟 http://localhost:4321

# 4. 打包靜態檔案
npm run build

# 5. 預覽打包結果
npm run preview
```

> **注意**：`npm install` 若遇到 `EACCES` 權限錯誤，改用：
> ```bash
> npm install --cache /tmp/npm-cache
> ```

---

## 部署到 GitHub Pages

### 1. 更新 `astro.config.mjs`

```js
const GITHUB_USERNAME = 'your-actual-username';  // 換成你的 GitHub 帳號
const REPO_NAME = 'your-actual-repo-name';        // 換成你的 repo 名稱
```

### 2. 設定 GitHub Repository Secrets

前往 GitHub 儲存庫 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Name | Value |
|------|-------|
| `WORDPRESS_URL` | `https://your-wordpress-site.com` |

> **重要**：先設定 Secret，再 push 程式碼。若順序相反，第一次 build 會因取不到 WordPress 資料而失敗。

### 3. 設定 GitHub Pages

前往 **Settings** → **Pages**：
- Source：`Deploy from a branch`
- Branch：`gh-pages` / `root`

### 4. Push 到 main branch

```bash
git push origin main
```

GitHub Actions 會自動執行 build 並部署到 `gh-pages` branch，約 2 分鐘後網站上線。

---

## WordPress 自動觸發重新建置

每當 WordPress 發布或更新文章時，自動觸發 GitHub Actions 重新 build 網站。

### 建立 GitHub Personal Access Token（PAT）

1. 前往 GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. 點擊 **Generate new token**
3. 勾選權限：`repo`
4. 設定有效期限（建議 90 天，到期前需更新）
5. 複製產生的 token（格式：`ghp_xxxxxxxxxxxxxxxxxxxx`）

### 安裝 Code Snippets 外掛

1. WordPress 後台 → **外掛** → **安裝外掛**
2. 搜尋 **Code Snippets**，安裝並啟用

### 新增觸發 Webhook 的程式碼片段

前往 **Snippets** → **Add New**，貼入以下程式碼：

```php
add_action('transition_post_status', 'trigger_github_rebuild', 10, 3);

function trigger_github_rebuild($new_status, $old_status, $post) {
    if ($post->post_type !== 'post') return;
    if ($new_status !== 'publish') return;

    // 防抖動：60 秒內只觸發一次，避免同一篇文章重複觸發多個 build
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

替換以下三個佔位符：
- `YOUR_GITHUB_USERNAME` → 你的 GitHub 帳號
- `YOUR_REPO_NAME` → 你的 repo 名稱
- `YOUR_GITHUB_PAT` → 剛才建立的 PAT（單引號內，`Bearer ` 後面緊接 token）

儲存後確認 snippet 狀態為**啟用（Active）**。

### 防抖動說明

WordPress 在發布一篇文章的過程中，內部會多次觸發儲存事件，若不加限制會同時啟動多個 GitHub Actions。`set_transient` 確保 60 秒內只觸發一次。

若需要在短時間內發布多篇文章，可將 `60` 改為 `10`（秒）。

---

## 文章撰寫注意事項

### Slug 必須使用英文

WordPress 文章的 **slug（網址別名）** 請使用英文，例如：`my-first-ai-post`。

中文 slug 雖然不會導致 build 失敗（程式碼已有 fallback 處理，會改用文章 ID 作為網址），但會讓網址變成 `/blog/123/` 而不是語意化的英文網址，SEO 較不理想。

> **技術說明**：`src/lib/wordpress.ts` 中的 `getPostSlug()` 函式會偵測非 ASCII 字元，自動 fallback 到文章 ID，避免 build 失敗。

### 特色圖片

特色圖片（Featured Image）的 URL 必須是公開可存取的連結，否則 build 不會失敗，但圖片在前台會顯示不出來。

---

## PAT 到期處理

GitHub PAT 有設定的有效期限。到期後 webhook 將停止觸發。

**更新方式**：
1. GitHub → Settings → Developer settings → Personal access tokens
2. 對舊 token 點 **Regenerate** 或建立新 token
3. 回到 WordPress → Snippets，將 `Bearer` 後面的 token 換成新的
4. 儲存 snippet

---

## 專案結構

```
.
├── astro.config.mjs          # Astro 設定（site、base）
├── .env.example              # 環境變數範本
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions CI/CD
├── src/
│   ├── lib/
│   │   └── wordpress.ts      # WordPress API 客戶端
│   ├── components/
│   │   ├── NavBar.astro
│   │   ├── Hero.astro
│   │   ├── PostCard.astro    # 文章卡片（browser window 風格）
│   │   ├── QuickLinks.astro
│   │   └── Pagination.astro
│   ├── layouts/
│   │   └── BaseLayout.astro  # HTML 骨架、SEO meta、OG tags
│   ├── pages/
│   │   ├── index.astro       # 首頁
│   │   └── blog/
│   │       ├── index.astro   # 文章列表第 1 頁
│   │       ├── [slug].astro  # 單篇文章
│   │       └── page/
│   │           └── [n].astro # 文章列表第 2..N 頁
│   └── styles/
│       └── global.css        # Brutalist 設計系統
└── SETUP.md                  # 部署設定快速參考
```

---

## 常見問題排解

| 症狀 | 原因 | 解法 |
|------|------|------|
| Build 失敗，路徑含 `%xx` | 文章 slug 是中文且版本較舊 | 更新 `getPostSlug()` 程式碼 |
| 文章卡片點進去 404 | PostCard 連結用了原始中文 slug | 確認所有頁面的 PostCard 都用 `getPostSlug(post)` |
| GitHub Actions 不觸發 | PAT 未替換或填錯位置 | 確認 snippet 中 `Bearer ` 後面是真實 PAT |
| GitHub Actions 一次跑多個 | 缺少防抖動機制 | 確認 snippet 有 `set_transient` 那兩行 |
| Build 失敗（第一次） | `WORDPRESS_URL` secret 未設定 | 先設定 secret，再重新觸發 Actions |
| `npm install` 失敗（EACCES） | `.npm/_cacache` 權限問題 | `npm install --cache /tmp/npm-cache` |
| 靜態資源 404 | `astro.config.mjs` 缺少 `base` | 設定 `base: '/repo-name'` |
| Webhook 突然停止觸發 | GitHub PAT 已到期 | 重新產生 PAT，更新 Code Snippets |
| 文章更新後網站沒變化 | GitHub Actions 未觸發 | 檢查 snippet 是否啟用、PAT 是否有效 |
