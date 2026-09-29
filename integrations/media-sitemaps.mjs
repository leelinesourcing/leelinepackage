import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEAD_VIDEOS } from '../src/data/dead-videos.mjs';

/*
  Media sitemaps: images and videos.

  Two files Google treats differently from the URL sitemap, so they get their own writer:

    image-sitemap-N.xml   one <url> per page, each carrying <image:image><image:loc>
    video-sitemap.xml     one <url> per page, each carrying <video:video>
    sitemap-media-index.xml  a <sitemapindex> listing exactly the files above

  They are generated from the BUILT HTML rather than from the content collections, because the
  HTML is the only thing that knows what actually rendered. `[slug].astro` builds page content
  from `src/data/case-studies/*.ts`, and six case-study `.md` bodies never reach the output at
  all — a source scan would report images and videos that no page has, and miss ones it does.

  Runs at `astro:build:done`, after every page has been written. `astro-robots-txt` writes
  robots.txt the same way; `astro.config.mjs` lists `sitemap-media-index.xml` there, and because
  the index is generated from the files this integration just wrote, it cannot drift out of sync
  with the number of chunks.
*/

const PAGE_ORIGIN = 'https://www.leelinepackage.com';
const CDN_ORIGIN = 'https://img.leelinepackage.com';

const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const IMAGE_NS = 'http://www.google.com/schemas/sitemap-image/1.1';
const VIDEO_NS = 'http://www.google.com/schemas/sitemap-video/1.1';

/*
  Site chrome, not content. Both are repeated on hundreds of pages by the layout itself — the
  logo 354 times (Navbar + Footer) and the author avatar 239 times (every post byline). Listing
  them would add ~600 entries describing two decorative assets.
*/
const CHROME = new Set([
  `${CDN_ORIGIN}/leelinepackage-logo.webp`,
  `${CDN_ORIGIN}/blog/author-lofty-shen.webp`,
]);

/* Google's documented ceilings for a video sitemap entry. */
const VIDEO_TITLE_MAX = 100;
const VIDEO_DESC_MAX = 2048;

/*
  `thumbnail_loc` is REQUIRED, so an embed whose thumbnail 404s would be an invalid entry — and
  Google's rules for this site forbid listing dead assets at all.

  ⚠️ This is a content problem, not just a sitemap one: those pages still render a dead player.
  The warning in `astro:build:done` names them on every build so it cannot be forgotten.

  A build-time probe was tried first and rejected: Node's `fetch` cannot reach `i.ytimg.com` from
  this machine (curl fails the same way with a schannel handshake error), so every video looked
  dead and the four-variant fallback chain added 105 seconds to the build for nothing.

  The list itself lives in `src/data/dead-videos.mjs`, shared with `[slug].astro`'s VideoObject so
  the sitemap and the JSON-LD can never disagree about which embeds are playable.
*/

/*
  `hqdefault.jpg` (480x360, above Google's 120x90 minimum) resolves for all 50 live videos —
  measured, not assumed. `maxresdefault.jpg` is sharper but 404s on some uploads.
*/
const youTubeThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const youTubePlayer = (id) => `https://www.youtube.com/embed/${id}`;

/** XML escaping. Unlike `<script>`, XML parsers DO decode these, so escaping is correct here. */
const xml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** `dist/client/foo/index.html` -> `https://www.leelinepackage.com/foo/` */
function pageUrlFor(root, file) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  if (rel === 'index.html') return `${PAGE_ORIGIN}/`;
  return `${PAGE_ORIGIN}/${rel.slice(0, -'index.html'.length)}`;
}

function htmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/*
  `srcset` would otherwise list the same photo twice at two sizes, which the brief rules out as a
  redundant near-duplicate. Take the widest candidate; fall back to `src`.
  Only `pouches/hero-2` uses srcset today, but the rule is cheap and stops the next one slipping in.
*/
function imageFromTag(tag) {
  const srcset = /srcset="([^"]+)"/.exec(tag)?.[1];
  if (srcset) {
    let best = null;
    let bestW = -1;
    for (const part of srcset.split(',')) {
      const [url, descriptor] = part.trim().split(/\s+/);
      if (!url?.startsWith(CDN_ORIGIN)) continue;
      const w = descriptor?.endsWith('w') ? Number.parseInt(descriptor, 10) : 0;
      if (w > bestW) {
        bestW = w;
        best = url;
      }
    }
    if (best) return best;
  }
  const src = /src="([^"]+)"/.exec(tag)?.[1];
  return src?.startsWith(CDN_ORIGIN) ? src : null;
}

/**
 * @param {{ excludePages?: string[], imagesPerFile?: number }} options
 *   excludePages — page path prefixes to skip, so the media sitemaps stay consistent with the
 *   `noindex` pages the URL sitemap already excludes.
 */
export default function mediaSitemaps({ excludePages = [], imagesPerFile = 500 } = {}) {
  return {
    name: 'media-sitemaps',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const cssCache = new Map();
        const open = (f) => fs.readFileSync(f, 'utf8');
        /* Escaped: the origin contains dots, which must not act as wildcards. */
        const CDN_URL_RE = new RegExp(`${CDN_ORIGIN.replace(/\./g, '\\.')}/[^)"'\\s]+`, 'g');

        const cdnUrlsInCss = (href) => {
          if (!cssCache.has(href)) {
            const file = path.join(root, href);
            cssCache.set(
              href,
              fs.existsSync(file) ? [...new Set([...open(file).matchAll(CDN_URL_RE)].map((m) => m[0]))] : [],
            );
          }
          return cssCache.get(href);
        };

        const pages = [];
        const videos = [];
        const deadEmbeds = [];

        for (const file of htmlFiles(root).sort()) {
          const rel = path.relative(root, file).split(path.sep).join('/');

          /* `404.html` has no URL of its own — it answers every unknown path, so it cannot be
             listed under one. The noindex pages are excluded to match SITEMAP_EXCLUDE. */
          if (rel === '404.html') continue;
          if (excludePages.some((p) => rel.startsWith(p.replace(/^\//, '')))) continue;

          const html = open(file);
          const pageUrl = pageUrlFor(root, file);

          const images = new Set();
          for (const tag of html.matchAll(/<img\b[^>]*>/g)) {
            const url = imageFromTag(tag[0]);
            if (url && !CHROME.has(url)) images.add(url);
          }

          /*
            Hero and CTA background plates are CSS `url(...)`, never `<img>`. They are the most
            prominent images on the site and none of them appear as an element, so they have to be
            read out of the stylesheets the page links — plus any inline `<style>`. Verified: no
            shared component stylesheet (Navbar, Footer, AuthorCard, blog) contains a single CDN
            URL, so a background never leaks onto pages that do not render it.
          */
          for (const m of html.matchAll(/url\((?:"|')?([^)"']+)/g)) {
            const url = m[1];
            if (url.startsWith(CDN_ORIGIN) && !CHROME.has(url)) images.add(url);
          }
          for (const href of new Set([...html.matchAll(/<link rel="stylesheet" href="(\/_astro\/[^"]+)"/g)].map((m) => m[1]))) {
            for (const url of cdnUrlsInCss(href)) if (!CHROME.has(url)) images.add(url);
          }

          if (images.size) pages.push({ loc: pageUrl, images: [...images].sort() });

          const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';
          const seenHere = new Set();
          for (const m of html.matchAll(
            /<iframe\b[^>]*\bsrc="https?:\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})[^"]*"[^>]*>/g,
          )) {
            const id = m[1];
            if (seenHere.has(id)) continue;
            seenHere.add(id);
            if (DEAD_VIDEOS.has(id)) {
              deadEmbeds.push({ id, page: pageUrl.slice(PAGE_ORIGIN.length) });
              continue;
            }
            videos.push({
              loc: pageUrl,
              id,
              title: (/title="([^"]*)"/.exec(m[0])?.[1] ?? '').slice(0, VIDEO_TITLE_MAX),
              description: description.slice(0, VIDEO_DESC_MAX),
            });
          }
        }

        /* Reported on every build so the dead embeds stay visible until the content is fixed. */
        if (deadEmbeds.length) {
          const ids = [...new Set(deadEmbeds.map((d) => d.id))];
          const where = [...new Set(deadEmbeds.map((d) => d.page))];
          logger.warn(
            `${ids.length} embedded video(s) are dead and left out of the sitemap (DEAD_VIDEOS): ` +
              `${ids.join(', ')}. ⚠️ These pages still render a dead player and want fixing: ${where.join(', ')}`,
          );
        }

        /* Chunk by entry count, never splitting one page's images across two files — a split page
           would appear in both sitemaps and read as a duplicate. */
        const chunks = [];
        let current = [];
        let count = 0;
        for (const page of pages) {
          if (count && count + page.images.length > imagesPerFile) {
            chunks.push(current);
            current = [];
            count = 0;
          }
          current.push(page);
          count += page.images.length;
        }
        if (current.length) chunks.push(current);

        const imageFiles = chunks.map((chunk, i) => {
          const body = chunk
            .map(
              (p) =>
                `  <url>\n    <loc>${xml(p.loc)}</loc>\n` +
                p.images.map((u) => `    <image:image>\n      <image:loc>${xml(u)}</image:loc>\n    </image:image>`).join('\n') +
                `\n  </url>`,
            )
            .join('\n');
          const file = `image-sitemap-${i + 1}.xml`;
          fs.writeFileSync(
            path.join(root, file),
            `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${SITEMAP_NS}" xmlns:image="${IMAGE_NS}">\n${body}\n</urlset>\n`,
          );
          return file;
        });

        const videoFiles = [];
        if (videos.length) {
          const body = videos
            .map(
              (v) =>
                `  <url>\n    <loc>${xml(v.loc)}</loc>\n    <video:video>\n` +
                `      <video:thumbnail_loc>${xml(youTubeThumb(v.id))}</video:thumbnail_loc>\n` +
                `      <video:title>${xml(v.title)}</video:title>\n` +
                `      <video:description>${xml(v.description)}</video:description>\n` +
                `      <video:player_loc>${xml(youTubePlayer(v.id))}</video:player_loc>\n` +
                `    </video:video>\n  </url>`,
            )
            .join('\n');
          fs.writeFileSync(
            path.join(root, 'video-sitemap.xml'),
            `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${SITEMAP_NS}" xmlns:video="${VIDEO_NS}">\n${body}\n</urlset>\n`,
          );
          videoFiles.push('video-sitemap.xml');
        }

        /* The index is built from what was actually written, so robots.txt only ever has to name
           this one file — adding a chunk never leaves robots.txt stale. */
        const all = [...imageFiles, ...videoFiles];
        fs.writeFileSync(
          path.join(root, 'sitemap-media-index.xml'),
          `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="${SITEMAP_NS}">\n` +
            all.map((f) => `  <sitemap>\n    <loc>${PAGE_ORIGIN}/${f}</loc>\n  </sitemap>`).join('\n') +
            `\n</sitemapindex>\n`,
        );

        const imageCount = pages.reduce((n, p) => n + p.images.length, 0);
        logger.info(
          `${imageCount} image entries across ${pages.length} pages -> ${imageFiles.join(', ')}; ` +
            `${videos.length} video entries -> ${videoFiles.join(', ') || '(none)'}`,
        );
      },
    },
  };
}
