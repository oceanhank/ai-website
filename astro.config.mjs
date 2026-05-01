import { defineConfig } from 'astro/config';

// Replace YOUR_GITHUB_USERNAME and YOUR_REPO_NAME before deploying
const GITHUB_USERNAME = 'oceanhank';
const REPO_NAME = 'ai-website';

export default defineConfig({
  output: 'static',
  site: `https://${GITHUB_USERNAME}.github.io`,
  base: `/${REPO_NAME}`,
});
