import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import mediaSitemaps from './integrations/media-sitemaps.mjs';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';

/*
  Every link on this site opens in a new tab — internal ones included. Doing that by hand across
  122 imported Markdown files would be unmaintainable, so it happens once here.

  `markdown.remarkPlugins` / `markdown.rehypePlugins` are NOT the hook anymore: Astro 7 renders
  Markdown with Sätteri (Rust), and those options now require installing `@astrojs/markdown-remark`,
  which swaps the processor back to unified and DROPS the heading ids the blog's 1,311 table-of-
  contents links point at. Sätteri takes hast plugins directly instead, and its own heading-id
  plugin is appended AFTER any user plugins, so heading slugs stay exactly as they are.

  In-page `#anchor` links are skipped — a table-of-contents jump must not open a second tab.
*/
const openLinksInNewTab = {
  name: 'open-links-in-new-tab',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const href = typeof node.properties?.href === 'string' ? node.properties.href : '';
      if (!href || href.startsWith('#')) return;
      ctx.setProperty(node, 'target', '_blank');
      ctx.setProperty(node, 'rel', 'noopener');
    },
  },
};

/*
  The sitemap is emitted from `site` above, so every URL in it is absolute and matches the
  canonical on the page. `/404` is dropped by the integration itself; these two are ours:
  both carry `<meta name="robots" content="noindex, nofollow">`, and advertising a noindex
  URL in the sitemap is a Search Console error, not a ranking help.

  `/search-index.json` is the navbar search's build-time index — see
  `src/pages/search-index.json.ts`. A data endpoint, not a page, so nothing should crawl it.
*/
const SITEMAP_EXCLUDE = ['/thank-you/', '/design-system/', '/search-index.json'];

/*
  `lastmod` is the one field in a sitemap that Google actually reads — which is also why a
  wrong value is worse than none: stamping every URL with the build date teaches the crawler
  to ignore the field. The 122 posts carry a real `publishDate` in frontmatter, so they get
  one; the static pages have no date we can honestly claim, so they stay bare.

  Read from disk rather than from the content collection, because `astro.config.mjs` is
  evaluated before the content layer exists. Resolved off `import.meta.url`, never
  `process.cwd()` — the config is bundled to a temp file, but always into the project root.
*/
const blogDir = new URL('./src/content/blog/', import.meta.url);
const postDates = new Map(
  readdirSync(blogDir)
    .filter((file) => file.endsWith('.md'))
    .flatMap((file) => {
      const date = /^publishDate:\s*['"]?(\d{4}-\d{2}-\d{2})/m.exec(readFileSync(new URL(file, blogDir), 'utf8'))?.[1];
      return date ? [[file.slice(0, -3), date]] : [];
    }),
);

export default defineConfig({
  output: 'static',
  site: 'https://www.leelinepackage.com',
  adapter: cloudflare(),
  integrations: [
    react(),
    /*
      Emits `dist/client/robots.txt` at `astro:build:done`. The defaults are exactly what this
      site needs — `User-agent: *` / `Allow: /` plus a `Sitemap:` line derived from `site`
      above. Deriving it is the whole point: hard-coding that URL in `public/robots.txt` meant
      keeping the domain in sync by hand in two files.

      ⚠️ The emitted filename is coupled to `@astrojs/sitemap` by coincidence of defaults:
      `sitemapBaseFileName` is `sitemap-index`, matching the `sitemap-index.xml` that
      integration writes. Change `filenameBase` there and this line starts pointing at a 404.

      Nothing is disallowed on purpose. `/thank-you/` and `/design-system/` are `noindex`, and a
      `Disallow` would stop the crawler ever *reading* that noindex tag — the two directives
      fight each other. Leave them crawlable and let the meta tag do the work.

      Build-only, like every integration here: `astro dev` does not serve /robots.txt.

      `sitemap-media-index.xml` is written by `integrations/media-sitemaps.mjs` and lists the
      image and video sitemaps. Naming only that one file here means adding a chunk can never
      leave this list stale — the index is generated from the files actually written.
    */
    robotsTxt({
      sitemap: [
        'https://www.leelinepackage.com/sitemap-index.xml',
        'https://www.leelinepackage.com/sitemap-media-index.xml',
      ],
    }),
    sitemap({
      filter: (page) => !SITEMAP_EXCLUDE.includes(new URL(page).pathname),
      serialize(item) {
        const date = postDates.get(new URL(item.url).pathname.replace(/^\/+|\/+$/g, ''));
        return date ? { ...item, lastmod: date } : item;
      },
    }),
    /*
      Image + video sitemaps. Separate files because Google treats `<image:image>` and
      `<video:video>` as their own extensions, and because the client asked for the image set to
      be chunked. Runs on the BUILT HTML (§ docs/seo.md), so it reports what actually rendered.
      `excludePages` reuses SITEMAP_EXCLUDE so the media sitemaps skip the same `noindex` pages.
    */
    mediaSitemaps({ excludePages: SITEMAP_EXCLUDE, imagesPerFile: 500 }),
  ],
  markdown: {
    processor: satteri({ hastPlugins: [openLinksInNewTab] }),
  },
  server: {
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
