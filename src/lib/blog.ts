import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/*
  Category display names.

  The WordPress taxonomy stores these under slugs the live site still uses (`csae-study`,
  spelled that way, typo included), so the slugs are kept verbatim — they are part of the
  /category/<slug>/ URLs. The labels below are the ones the live site actually renders, which
  is why `csae-study` reads "Case Study" rather than the older, longer term name still sitting
  in the WordPress database.
*/
export const CATEGORY_LABELS: Record<string, string> = {
  material: 'Chapter 1： Material',
  'supplier-list': 'Chapter 2：Supplier List',
  'how-to-guide': 'Chapter 3：How To Guide',
  manufacturing: 'Chapter 4：Manufacturing',
  'quality-control': 'Chapter 5：Quality Control',
  shipping: 'Chapter 6：Shipping',
  selling: 'Chapter 7：Selling',
  'csae-study': 'Case Study',
};

/** Every category the live site exposes, in chapter order. */
export const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

export const POSTS_PER_PAGE = 10;

export const categoryLabel = (slug: string) => CATEGORY_LABELS[slug] ?? slug;

/** Posts shown anywhere: drafts never are. Newest first. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => data.draft !== true);
  return posts.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export function readingTime(body: string | undefined): number {
  const words = (body ?? '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/*
  The blog index's category rail: every chapter that currently holds something, in chapter
  order, with its article count. Empty chapters are dropped — the /category/<slug>/ URL still
  resolves and shows its empty state, but a rail entry with a "0" beside it is a dead end.
*/
export async function getCategoryIndex(): Promise<Array<{ slug: string; label: string; count: number }>> {
  const posts = await getPublishedPosts();
  return CATEGORY_ORDER
    .map((slug) => ({ slug, label: categoryLabel(slug), count: posts.filter((p) => p.data.category === slug).length }))
    .filter((c) => c.count > 0);
}

/*
  Dates are stored as `YYYY-MM-DD`, which JavaScript parses as UTC midnight. Formatting in UTC
  keeps the printed day from slipping backwards for readers west of Greenwich.
*/
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
});
export const formatDate = (d: Date) => DATE_FORMAT.format(d);
