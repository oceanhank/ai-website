# 部署設定指南

## 1. 更新 astro.config.mjs

將以下佔位符替換為你的實際值：

```js
const GITHUB_USERNAME = 'your-actual-username';
const REPO_NAME = 'your-actual-repo-name';
```

## 2. 更新本地開發用的 .env

將 `.env.example` 複製為 `.env`，並填入你的 WordPress 網址：

```
WORDPRESS_URL=https://your-wordpress-site.com
```

## 3. GitHub 儲存庫設定

1. 前往你的 GitHub 儲存庫 → **Settings** → **Secrets and variables** → **Actions**
2. 點擊 **New repository secret**
3. Name：`WORDPRESS_URL`，Value：`https://your-wordpress-site.com`
4. 前往 **Settings** → **Pages**
5. 將 **Source** 設定為 `Deploy from a branch`
6. 將 **Branch** 設定為 `gh-pages` / `root`

## 4. WordPress Webhook 設定

在你的 WordPress 網站安裝 **WP Webhooks** 外掛，然後：

1. 前往 **WP Webhooks** → **Send Data** → **Add Webhook**
2. 將 Webhook URL 設定為：
   ```
   https://api.github.com/repos/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/dispatches
   ```
3. 方法（Method）設定為 `POST`
4. 新增以下 Headers：
   - `Accept: application/vnd.github.v3+json`
   - `Authorization: Bearer YOUR_GITHUB_PAT`
   - `Content-Type: application/json`
5. Body 設定為：
   ```json
   {"event_type": "wordpress-update"}
   ```
6. 觸發時機選擇：**Post published**（文章發布）和 **Post updated**（文章更新）

**注意**：需要建立一個具有 `repo` 權限的 GitHub Personal Access Token（個人存取權杖）。  
建立位置：GitHub → Settings → Developer settings → Personal access tokens

## 5. 端對端測試

1. 將所有檔案推送至 `main` branch
2. 前往 GitHub Actions 頁籤，確認 workflow 自動啟動
3. Workflow 完成後（約 2 分鐘），前往 `https://YOUR_USERNAME.github.io/YOUR_REPO/` 確認網站上線
4. 在 WordPress 發布一篇測試文章，確認 GitHub Actions 在 30 秒內自動再次觸發

## 本地開發

```bash
cp .env.example .env
# 編輯 .env，填入你的 WordPress 網址

npm install
npm run dev       # 啟動開發伺服器，網址為 http://localhost:4321
npm run build     # 打包靜態檔案至 dist/
npm run preview   # 預覽打包後的網站
```
