## ADDED Requirements

### Requirement: Build-time data fetching from WordPress API

The Astro project SHALL fetch all WordPress post data exclusively during the Build phase using `getStaticPaths` and top-level `await` in `.astro` page files.

No WordPress API request SHALL be made at runtime (client-side or server-side) during visitor page loads.

#### Scenario: Build produces static HTML for all published posts

- **WHEN** the Build command (`astro build`) is executed
- **THEN** a separate static HTML file is generated for each published WordPress post at the path `/blog/[slug]/index.html`

#### Scenario: Build fetches all pages of posts

- **WHEN** WordPress has more than one page of posts (more than `perPage` posts)
- **THEN** the Build process iterates through all pages until `totalPages` is reached, collecting all posts before generating pages

### Requirement: Static output compatible with GitHub Pages

The Astro project SHALL be configured with `output: 'static'` and `site` pointing to the GitHub Pages URL.

The Build output directory SHALL be `dist/`.

All internal links SHALL use relative paths or the configured `base` path to ensure correct routing on GitHub Pages.

#### Scenario: Build output is self-contained static files

- **WHEN** the Build completes successfully
- **THEN** the `dist/` directory contains only static HTML, CSS, JS, and asset files with no server-side runtime dependencies

### Requirement: Pagination pages generated at Build time

The Astro project SHALL generate a separate static page for each blog listing page at the path `/blog/page/[n]/index.html`.

Page 1 SHALL also be accessible at `/blog/index.html` (redirect or canonical).

#### Scenario: Multiple listing pages generated

- **GIVEN** WordPress has 25 posts and perPage is 10
- **WHEN** Build runs
- **THEN** generates listing pages at `/blog/index.html`, `/blog/page/2/index.html`, `/blog/page/3/index.html`
