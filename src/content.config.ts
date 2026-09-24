import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

/*
  Content collections for the blog.

  ⚠️ Image fields are plain `z.string()`, never the `image()` helper. Every content image on
  this site is served from the R2 bucket (https://img.leelinepackage.com/<key>) as a raw URL
  rendered with a plain <img>. The Astro image pipeline is deliberately absent — see the
  "Image handling" section of CLAUDE.md. Using `image()` here would reintroduce `/_image?href=`
  rewriting and break the R2 URLs.
*/

const authors = defineCollection({
  // JSON array. The `file()` loader requires every item to carry a unique `id` or `slug`.
  loader: file('src/data/authors.json'),
  schema: z.object({
    name: z.string(),
    title: z.string().optional(),
    bio: z.string(),
    avatar: z.string(),
    avatarWidth: z.number().int().positive(),
    avatarHeight: z.number().int().positive(),
    /**
     * The "Areas of Expertise" list the author card renders. `t` is the bolded area,
     * `d` the sentence after it. Text carried over from the live site's author box.
     */
    expertise: z.array(z.object({ t: z.string(), d: z.string() })).optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    /** Feeds <meta description> and the card excerpt. Sourced from Rank Math's `rank_math_description`. */
    description: z.string(),
    /**
     * SEO <title>. WordPress stores a separate SEO headline from the on-page one
     * (`rank_math_title`, sometimes carrying a `%currentyear%` token which the importer
     * resolves); falls back to `title` when absent.
     */
    seoTitle: z.string().optional(),
    /** Rank Math focus keyword, surfaced as <meta keywords>. */
    keywords: z.string().optional(),
    publishDate: z.coerce.date(),
    /** Reference to an entry id in the `authors` collection (e.g. `lofty-shen`). */
    author: reference('authors'),
    /** WordPress category slug. Drives the /category/<slug>/ routes. */
    category: z.string(),
    featuredImage: z.string(),
    featuredImageAlt: z.string(),
    /**
     * Intrinsic size of `featuredImage`, read from the file itself during import. Every content
     * image on this site ships real `width`/`height` so the layout does not shift while it
     * loads — these are what the card and post templates render.
     */
    featuredImageWidth: z.number().int().positive().optional(),
    featuredImageHeight: z.number().int().positive().optional(),
    /** WordPress drafts. Filtered out of every listing, feed and sitemap. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { authors, blog };
