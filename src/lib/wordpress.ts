const WORDPRESS_URL = import.meta.env.WORDPRESS_URL;

if (!WORDPRESS_URL) {
  throw new Error('WORDPRESS_URL environment variable is required');
}

export interface WPPost {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
      media_details?: { width: number; height: number };
    }>;
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

export interface PostListResult {
  posts: WPPost[];
  totalPages: number;
  total: number;
}

export async function fetchPosts(
  page = 1,
  perPage = 10
): Promise<PostListResult> {
  const url = new URL(`${WORDPRESS_URL}/wp-json/wp/v2/posts`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('_embed', '1');

  const response = await fetch(url.toString());

  if (!response.ok) {
    if (response.status === 400) {
      // Out-of-range page: WordPress returns 400 with rest_post_invalid_page_number
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') ?? '0', 10);
      const total = parseInt(response.headers.get('X-WP-Total') ?? '0', 10);
      return { posts: [], totalPages, total };
    }
    throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
  }

  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') ?? '1', 10);
  const total = parseInt(response.headers.get('X-WP-Total') ?? '0', 10);
  const posts: WPPost[] = await response.json();

  return { posts, totalPages, total };
}

export async function fetchAllPosts(): Promise<WPPost[]> {
  const first = await fetchPosts(1, 100);
  if (first.totalPages <= 1) return first.posts;

  const remaining = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, i) => fetchPosts(i + 2, 100))
  );
  return [first.posts, ...remaining.map((r) => r.posts)].flat();
}

/** Returns a URL-safe slug: uses post ID if the WordPress slug contains non-ASCII characters. */
export function getPostSlug(post: WPPost): string {
  try {
    const decoded = decodeURIComponent(post.slug);
    if (/[^\x00-\x7F]/.test(decoded)) return String(post.id);
  } catch {
    return String(post.id);
  }
  return post.slug;
}

export async function fetchPostBySlug(slug: string): Promise<WPPost> {
  // If slug is numeric, fetch by ID directly
  if (/^\d+$/.test(slug)) {
    const url = new URL(`${WORDPRESS_URL}/wp-json/wp/v2/posts/${slug}`);
    url.searchParams.set('_embed', '1');
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    return response.json();
  }

  const url = new URL(`${WORDPRESS_URL}/wp-json/wp/v2/posts`);
  url.searchParams.set('slug', slug);
  url.searchParams.set('_embed', '1');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
  }

  const posts: WPPost[] = await response.json();

  if (!posts.length) {
    const err = new Error(`Post not found: ${slug}`);
    (err as Error & { code: string }).code = 'POST_NOT_FOUND';
    throw err;
  }

  return posts[0];
}

export function getFeaturedImageUrl(post: WPPost): string | null {
  const media = post._embedded?.['wp:featuredmedia'];
  if (!media?.length) return null;
  return media[0].source_url ?? null;
}

export function getFeaturedImageAlt(post: WPPost): string {
  const media = post._embedded?.['wp:featuredmedia'];
  return media?.[0]?.alt_text ?? '';
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export function formatDate(dateStr: string): string {
  return dateStr.slice(0, 10); // YYYY-MM-DD
}

export function truncateExcerpt(html: string, maxLength = 150): string {
  const text = stripHtml(html);
  return text.length <= maxLength ? text : text.slice(0, maxLength).trimEnd() + '…';
}
