## ADDED Requirements

### Requirement: Monochrome color palette

The design system SHALL use a strictly monochrome color palette defined as CSS Custom Properties:
- `--color-black: #000000`
- `--color-white: #ffffff`
- `--color-gray-light: #f5f5f5`
- `--color-border: #000000`

No color other than black, white, and gray SHALL appear in the UI.

#### Scenario: All UI elements use palette tokens

- **WHEN** any UI component is rendered
- **THEN** all foreground, background, and border colors reference the defined CSS Custom Properties

### Requirement: Bold typography system

The design system SHALL define a typography scale using heavy-weight fonts:
- Display / Hero heading: `font-size: clamp(2.5rem, 8vw, 5rem)`, `font-weight: 900`
- Section heading (H2): `font-size: 2rem`, `font-weight: 800`
- Card title: `font-size: 1.25rem`, `font-weight: 700`
- Body text: `font-size: 1rem`, `font-weight: 400`, `line-height: 1.7`

Font stack SHALL prefer system fonts: `'Georgia', 'Times New Roman', serif` for headings; `system-ui, sans-serif` for body.

#### Scenario: Hero heading renders at display size

- **WHEN** the Hero component is rendered on a desktop viewport (≥1024px)
- **THEN** the heading text renders at approximately 5rem with font-weight 900

### Requirement: Navigation bar component

The NavBar component SHALL render a horizontal top navigation with the site logo/name on the left and navigation links on the right.

Navigation links SHALL include: Blog, Projects, About, Contact.

The NavBar SHALL have a `2px solid #000` bottom border and white background.

On mobile viewports (< 768px), navigation links SHALL collapse into a hamburger menu toggle.

#### Scenario: NavBar renders desktop layout

- **WHEN** rendered on viewport ≥ 768px
- **THEN** all navigation links are visible in a horizontal row with the site name on the left

#### Scenario: NavBar renders mobile layout

- **WHEN** rendered on viewport < 768px
- **THEN** navigation links are hidden and a hamburger icon (≡) is displayed

### Requirement: Quick Links bar component

The QuickLinks component SHALL render a horizontal strip of link items, each containing a label and an arrow symbol (`↗`).

The strip SHALL have a black background with white text for the link items, separated by `1px solid #fff` vertical dividers.

#### Scenario: Quick Links renders link items

- **WHEN** given an array of `{ label, href }` objects
- **THEN** each item renders as a bordered cell with label text and `↗` icon

### Requirement: Hero section component

The Hero component SHALL render a two-column layout: left column contains a large greeting heading and a subtitle paragraph; right column contains an illustration or image.

On mobile viewports (< 768px), the layout SHALL stack vertically with the image below the text.

#### Scenario: Hero renders two-column on desktop

- **WHEN** rendered on viewport ≥ 768px
- **THEN** heading/text and image appear side-by-side in a 60/40 column split

### Requirement: Post card browser window mockup component

The PostCard component SHALL render a card with:
1. Top bar: `2px solid #000` border, two filled circles (`●●`, 8px diameter), and the URL slug text centered
2. Image area: full-width featured image or a `background: #f0f0f0` placeholder
3. Content area: title, excerpt, date, and a "View project" / "Read more" button with `2px solid #000` border, no fill, `border-radius: 0`

The entire card SHALL have `2px solid #000` border and `box-shadow: 4px 4px 0 #000`.

#### Scenario: PostCard renders mockup chrome elements

- **WHEN** given a post with title, slug, excerpt, and featured image
- **THEN** the card top bar shows two black circles and the slug, the image fills the image area, and the content area shows title, excerpt, date, and button
