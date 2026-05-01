## ADDED Requirements

### Requirement: GitHub Actions workflow for automated deployment

The project SHALL include a GitHub Actions workflow file at `.github/workflows/deploy.yml` that:
1. Triggers on `push` to the `main` branch
2. Triggers on `repository_dispatch` event with event type `wordpress-update`
3. Runs `astro build` with the `WORDPRESS_URL` environment variable sourced from GitHub Secrets
4. Deploys the `dist/` directory to the `gh-pages` branch using the `peaceiris/actions-gh-pages` action

The workflow SHALL NOT expose the `WORDPRESS_URL` value in build logs.

#### Scenario: Push to main triggers build and deploy

- **WHEN** a commit is pushed to the `main` branch
- **THEN** the GitHub Actions workflow runs, builds the Astro project, and deploys to GitHub Pages

#### Scenario: WordPress Webhook triggers rebuild

- **WHEN** WordPress sends a POST request to the GitHub API `repository_dispatch` endpoint with event type `wordpress-update`
- **THEN** the GitHub Actions workflow triggers and rebuilds the site

### Requirement: WordPress Webhook configuration

The WordPress site SHALL be configured with the WP Webhooks plugin (or equivalent) to send a POST request to the GitHub API endpoint `https://api.github.com/repos/{owner}/{repo}/dispatches` upon post publish or update.

The Webhook payload SHALL include `{"event_type": "wordpress-update"}`.

Authentication SHALL use a GitHub Personal Access Token with `repo` scope, stored as a WordPress option (not in code).

#### Scenario: Post published triggers Webhook

- **WHEN** a new post is published in WordPress
- **THEN** a POST request is sent to the GitHub dispatches endpoint within 30 seconds

### Requirement: GitHub Pages configuration

The Astro `astro.config.mjs` SHALL set `site` to the GitHub Pages URL (`https://{username}.github.io/{repo}/`) and `base` to `/{repo}/` for correct asset path resolution.

The `gh-pages` branch SHALL be configured as the GitHub Pages source in repository settings.

#### Scenario: Deployed site resolves assets correctly

- **WHEN** the site is accessed at `https://{username}.github.io/{repo}/`
- **THEN** all CSS, JS, and image assets load without 404 errors

### Requirement: Environment variable management

The `WORDPRESS_URL` value SHALL be stored as a GitHub Actions secret named `WORDPRESS_URL`.

The project SHALL include a `.env.example` file listing `WORDPRESS_URL=https://your-wordpress-site.com` as documentation for local development setup.

Local development SHALL use a `.env` file (git-ignored) to set `WORDPRESS_URL`.

#### Scenario: Local development with .env file

- **WHEN** a developer creates `.env` with `WORDPRESS_URL=https://example.com`
- **THEN** `astro dev` fetches posts from that WordPress URL
