## ADDED Requirements

### Requirement: Homepage displays latest posts

The homepage (`/`) SHALL display the latest 10 WordPress posts in a card grid layout.

Each post card SHALL display: featured image (or placeholder), post title, excerpt (truncated to 150 characters), and publication date formatted as `YYYY-MM-DD`.

The homepage SHALL include a "View all posts" link pointing to `/blog`.

#### Scenario: Homepage renders with posts

- **WHEN** a visitor loads the homepage
- **THEN** up to 10 post cards are displayed, sorted by date descending

#### Scenario: Homepage with no posts

- **WHEN** WordPress has no published posts
- **THEN** homepage displays an empty state message: "No posts yet."

### Requirement: Blog listing page with pagination controls

The blog listing page (`/blog`) and paginated variants (`/blog/page/[n]`) SHALL display 10 posts per page in a card grid layout.

The listing page SHALL render pagination controls showing: "Previous" link (disabled on page 1), page number indicator (`Page N of M`), and "Next" link (disabled on last page).

Pagination links SHALL point to statically generated pages (`/blog/page/[n]`).

#### Scenario: Pagination controls on middle page

- **GIVEN** visitor is on `/blog/page/2` and totalPages is 3
- **WHEN** the page renders
- **THEN** displays "Previous" link to `/blog/page/1`, "Page 2 of 3", "Next" link to `/blog/page/3`

#### Scenario: Pagination controls on first page

- **GIVEN** visitor is on `/blog` (page 1)
- **WHEN** the page renders
- **THEN** "Previous" link is absent or rendered as disabled (non-clickable)

#### Scenario: Pagination controls on last page

- **GIVEN** visitor is on the last page
- **WHEN** the page renders
- **THEN** "Next" link is absent or rendered as disabled

### Requirement: Post cards use browser window mockup style

Each post card in the listing SHALL be rendered in browser window mockup style: a top bar containing two filled circles (●●) on the left and the post URL slug in the center, followed by the featured image or a placeholder image, followed by title and excerpt.

#### Scenario: Post card renders mockup chrome

- **WHEN** a post card is rendered
- **THEN** the card top bar shows two circles and the text pattern `/blog/[slug]`
