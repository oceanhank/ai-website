## ADDED Requirements

### Requirement: Fetch paginated post list

The WordPress API client module SHALL provide an async function to fetch a paginated list of posts from the WordPress REST API endpoint `/wp-json/wp/v2/posts`.

The function SHALL accept `page` (integer, default: 1) and `perPage` (integer, default: 10) parameters.

The function SHALL return an object containing:
- `posts`: array of post objects with fields: `id`, `slug`, `title.rendered`, `excerpt.rendered`, `date`, `featured_media`, `_embedded['wp:featuredmedia']`
- `totalPages`: integer parsed from the `X-WP-TotalPages` response header
- `total`: integer parsed from the `X-WP-Total` response header

The function SHALL use the `_embed` query parameter to include featured media in a single API request.

#### Scenario: Successful paginated fetch

- **WHEN** called with `page=1, perPage=10`
- **THEN** returns the first 10 posts sorted by date descending, with `totalPages` and `total` populated from response headers

##### Example: Pagination metadata

- **GIVEN** WordPress has 25 published posts
- **WHEN** called with `page=1, perPage=10`
- **THEN** returns `{ posts: [10 items], totalPages: 3, total: 25 }`

#### Scenario: Out-of-range page request

- **WHEN** called with a `page` value exceeding `totalPages`
- **THEN** returns `{ posts: [], totalPages: N, total: N }`

### Requirement: Fetch single post by slug

The WordPress API client module SHALL provide an async function to fetch a single post by its slug from `/wp-json/wp/v2/posts?slug={slug}&_embed`.

The function SHALL return a post object containing: `id`, `slug`, `title.rendered`, `content.rendered`, `excerpt.rendered`, `date`, `modified`, `featured_media`, `_embedded['wp:featuredmedia']`, `_embedded['wp:term']` (categories and tags).

The function SHALL throw a typed error with code `POST_NOT_FOUND` when no post matches the given slug.

#### Scenario: Successful single post fetch

- **WHEN** called with a valid slug string
- **THEN** returns the full post object including embedded featured media and taxonomy terms

#### Scenario: Non-existent slug

- **WHEN** called with a slug that does not match any published post
- **THEN** throws an error with code `POST_NOT_FOUND`

### Requirement: WordPress base URL via environment variable

The API client module SHALL read the WordPress base URL exclusively from the `WORDPRESS_URL` environment variable at Build time.

The module SHALL NOT hard-code any WordPress domain in source code.

The module SHALL throw a configuration error at startup if `WORDPRESS_URL` is not set.

#### Scenario: Missing environment variable

- **WHEN** `WORDPRESS_URL` is not defined in the environment
- **THEN** the Build process fails with an error message: `WORDPRESS_URL environment variable is required`
