# Vibe Coding Blog 架構選擇指南

用 AI 輔助開發部落格網站的常見架構比較，包含適用情境與成本分析。

---

## 方案一：Astro + Headless WordPress

**架構**：WordPress 當後台，Astro 產生靜態網站，GitHub Pages 托管

**適合情境**
- 客戶已經在用 WordPress，不想換工具
- 想要完全客製化設計
- 接案幫別人做網站

**自動更新流程**
```
WordPress 發布文章
    → Code Snippets 觸發 GitHub webhook
    → GitHub Actions 重新 build
    → 約 2 分鐘後網站更新
```

**成本**

| 項目 | 費用 |
|------|------|
| GitHub Pages | 免費 |
| GitHub Actions | 免費（2,000 分鐘/月） |
| WordPress 主機 | 約 NT$100~300/月 |
| 網域 | 約 NT$300~500/年 |

---

## 方案二：Astro + Markdown

**架構**：文章直接寫 `.md` 檔案，push 到 GitHub 自動部署

**適合情境**
- 自己的個人部落格
- 不需要後台介面
- 內容更新頻率不高

**自動更新流程**
```
本地寫好 .md 檔案
    → git push 到 GitHub
    → GitHub Actions 自動 build & 部署
```

**成本**

| 項目 | 費用 |
|------|------|
| GitHub Pages | 免費 |
| GitHub Actions | 免費 |
| 網域 | 約 NT$300~500/年 |

> 最省錢的方案，幾乎零成本。

---

## 方案三：Astro + Notion（靜態 + 定時 Build）

**架構**：Notion 當後台，Astro 產生靜態網站，GitHub Actions 每小時自動 build

**適合情境**
- 客戶不熟悉 WordPress，習慣用 Notion
- 接案時客戶需要簡單的後台介面
- 可以接受最多一小時的更新延遲

**自動更新流程**
```
Notion 新增 / 修改文章
    → GitHub Actions 每小時自動 build
    → 最多 1 小時後網站更新
```

**成本**

| 項目 | 費用 |
|------|------|
| GitHub Pages | 免費 |
| GitHub Actions | 免費（定時 build 每月約 48~96 分鐘） |
| Notion | 免費方案夠用 |
| 網域 | 約 NT$300~500/年 |

---

## 方案四：Astro + Notion（靜態 + Zapier/Make 觸發）

**架構**：Notion 欄位改變時，由 Zapier/Make 偵測並觸發 GitHub rebuild

**適合情境**
- 客戶用 Notion 但要求發布後快速上線
- 可以接受 1~15 分鐘的更新延遲

**自動更新流程**
```
Notion 欄位改為「uploaded」
    → Zapier/Make 偵測到變動
    → 打 GitHub API 觸發 rebuild
    → 約 1~15 分鐘後網站更新
```

**成本**

| 項目 | 費用 |
|------|------|
| GitHub Pages | 免費 |
| GitHub Actions | 免費 |
| Zapier 免費方案 | 免費（100 次/月，可能不夠） |
| Zapier 付費方案 | 約 $20 美金/月起 |
| Notion | 免費方案夠用 |
| 網域 | 約 NT$300~500/年 |

> Zapier/Make 的費用可能是這個方案最大的成本。

---

## 方案五：Next.js + Notion（動態網站）

**架構**：Next.js 動態渲染，每次瀏覽即時去 Notion 抓資料，部署在 Vercel 或 Zeabur

**適合情境**
- 需要即時更新（發布後馬上上線）
- 需要複雜互動介面
- 客戶用 Notion 當後台
- AI 生成 UI 元件品質要求高（Next.js + Tailwind 是目前 AI 訓練資料最多的組合）

**自動更新流程**
```
Notion 新增 / 修改文章
    → 訪客瀏覽時即時去 Notion API 抓資料
    → 永遠是最新內容，無需 rebuild
```

**成本**

| 項目 | 費用 |
|------|------|
| Vercel（個人） | 免費 |
| Vercel（商業接案） | $20 美金/月 |
| Zeabur | 有免費額度，超過付費 |
| Notion | 免費方案夠用（注意每秒 3 次 rate limit） |
| 網域 | 約 NT$300~500/年 |

> 注意：Notion API 免費方案每秒只能打 3 次請求，流量大時需留意。

---

## 快速選擇對照表

| 情境 | 推薦方案 |
|------|---------|
| 自己的部落格，最省錢 | 方案二（Astro + Markdown） |
| 自己的部落格，要後台介面 | 方案一（Headless WP + Astro） |
| 接案，客戶用 WordPress | 方案一（Headless WP + Astro） |
| 接案，客戶要簡單後台、可接受延遲 | 方案三（Astro + Notion 定時） |
| 接案，客戶要簡單後台、快速上線 | 方案四（Astro + Notion + Zapier） |
| 接案，客戶要即時上線 | 方案五（Next.js + Notion 動態） |
| AI 生成 UI 元件品質最佳 | 方案五（Next.js + Tailwind） |

---

## 各方案靜態 vs 動態比較

| | 靜態（方案一~四） | 動態（方案五） |
|---|---|---|
| 網站速度 | 非常快（純 HTML） | 較慢（每次打 API） |
| 主機需求 | 免費靜態托管即可 | 需要能執行程式的伺服器 |
| 更新即時性 | 需要 rebuild（數分鐘~1小時） | 即時 |
| 長期維護成本 | 低 | 較高 |
| 適合流量規模 | 大流量也沒問題 | 流量大時 API rate limit 需注意 |
