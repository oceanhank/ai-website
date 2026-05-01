## ADDED Requirements

### Requirement: Single post page renders full content

The single post page (`/blog/[slug]`) SHALL render the full post content from the WordPress `content.rendered` field as raw HTML inside a semantic `<article>` element.

The page SHALL display: post title (H1), publication date, last modified date (if different from publication date), featured image (full width, above content), and full post body HTML.

The page SHALL include a "← Back to Blog" navigation link.

#### Scenario: Post page renders all fields

- **WHEN** a visitor loads `/blog/my-post-slug`
- **THEN** the page displays the post title as H1, the featured image, the formatted publication date, and the full rendered HTML content

#### Scenario: Post with modified date

- **WHEN** a post's `modified` date differs from its `date`
- **THEN** both dates are displayed: "Published: YYYY-MM-DD | Updated: YYYY-MM-DD"

#### Scenario: Post without featured image

- **WHEN** a post has no featured image set
- **THEN** the featured image section is omitted entirely (no placeholder shown)

### Requirement: Post page sets correct HTML metadata

The single post page SHALL set the `<title>` tag to `{post title} | Site Name` and the `<meta name="description">` tag to the post excerpt (stripped of HTML tags, max 160 characters).

The page SHALL include `<meta property="og:title">`, `<meta property="og:description">`, and `<meta property="og:image">` (featuring image URL when available).

#### Scenario: SEO metadata populated

- **WHEN** a post page is rendered
- **THEN** the HTML `<head>` contains correct title, description, and Open Graph tags specific to that post

### Requirement: Post content typography scoped to article

WordPress-rendered HTML content within the `<article>` element SHALL have scoped typography styles applied: headings (H2-H4) styled with the Brutalist design system fonts, paragraph line-height of 1.7, inline code styled with monospace font.

#### Scenario: Content HTML styled correctly

- **WHEN** WordPress content contains H2, paragraph, and code elements
- **THEN** these elements render with the Brutalist typography styles without affecting navigation or other page elements
