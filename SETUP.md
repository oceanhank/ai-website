# Deployment Setup Guide

## 1. Update astro.config.mjs

Replace the placeholders with your actual values:

```js
const GITHUB_USERNAME = 'your-actual-username';
const REPO_NAME = 'your-actual-repo-name';
```

## 2. Update .env for local development

Copy `.env.example` to `.env` and fill in your WordPress URL:

```
WORDPRESS_URL=https://your-wordpress-site.com
```

## 3. GitHub Repository Setup (Task 7.3)

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `WORDPRESS_URL`, Value: `https://your-wordpress-site.com`
4. Go to **Settings** → **Pages**
5. Set **Source** to `Deploy from a branch`
6. Set **Branch** to `gh-pages` / `root`

## 4. WordPress Webhook Setup (Task 7.4)

Install the **WP Webhooks** plugin on your WordPress site, then:

1. Go to **WP Webhooks** → **Send Data** → **Add Webhook**
2. Set the webhook URL to:
   ```
   https://api.github.com/repos/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/dispatches
   ```
3. Set method to `POST`
4. Add headers:
   - `Accept: application/vnd.github.v3+json`
   - `Authorization: Bearer YOUR_GITHUB_PAT`
   - `Content-Type: application/json`
5. Set body to:
   ```json
   {"event_type": "wordpress-update"}
   ```
6. Trigger on: **Post published** and **Post updated**

**Note**: Create a GitHub Personal Access Token with `repo` scope at  
GitHub → Settings → Developer settings → Personal access tokens.

## 5. End-to-End Test (Task 7.5)

1. Push all files to the `main` branch
2. Check GitHub Actions tab — workflow should start automatically
3. After workflow completes (~2 min), visit `https://YOUR_USERNAME.github.io/YOUR_REPO/`
4. Publish a test post on WordPress → confirm GitHub Actions triggers again within 30 seconds

## Local Development

```bash
cp .env.example .env
# Edit .env with your WordPress URL

npm install
npm run dev       # Start dev server at http://localhost:4321
npm run build     # Build static files to dist/
npm run preview   # Preview built site
```
