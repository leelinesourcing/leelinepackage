# LeelinePackage — SEO Guide

> The single source of truth for how this site's SEO surface is generated. Three build-time
> writers produce it; a page's own `<Layout>` call is what authors touch day to day. Read this
> before adding a page, changing a URL, or reaching for an SEO package.
>
> Counts and file sizes below were **measured on 2026-09-29** from a real `npm run build`. They
> are evidence that the system works, not invariants — re-measure with §6 rather than trusting them.

Everything derives from one line in `astro.config.mjs`:

```js
site: 'https://www.leelinepackage.com',
```

Change that and the sitemap URLs **and** the `Sitemap:` line in `robots.txt` follow automatically.
Page canonicals do **not** — those are written per page (§4).

---

## 1. Who writes what

| Surface | Written by | Output |
|---|---|---|
| URL sitemap | `@astrojs/sitemap` — configured in `astro.config.mjs` | `dist/client/sitemap-index.xml` + `sitemap-0.xml` |
| Image + video sitemaps | `integrations/media-sitemaps.mjs` — configured in `astro.config.mjs` | `dist/client/image-sitemap-1..N.xml`, `video-sitemap.xml`, `sitemap-media-index.xml` |
| `robots.txt` | `astro-robots-txt` — configured in `astro.config.mjs` | `dist/client/robots.txt` |
| `<head>` — title, description, canonical, Open Graph, Twitter, JSON-LD | `src/layouts/Layout.astro` | the `<head>` of every page |

All four run **at build time only**. `astro dev` serves none of these files; check them in
`dist/client/` after `npm run build`, or on the deployed site.

---

## 2. Sitemap

```js
import sitemap from '@astrojs/sitemap';

const SITEMAP_EXCLUDE = ['/thank-you/', '/design-system/'];

const blogDir = new URL('./src/content/blog/', import.meta.url);
const postDates = new Map(/* slug → publishDate, read from frontmatter */);

integrations: [
  sitemap({
    filter: (page) => !SITEMAP_EXCLUDE.includes(new URL(page).pathname),
    serialize(item) {
      const date = postDates.get(new URL(item.url).pathname.replace(/^\/+|\/+$/g, ''));
      return date ? { ...item, lastmod: date } : item;
    },
  }),
]
```

**What it produces.** `sitemap-index.xml` pointing at one chunk, `sitemap-0.xml`. Measured:
**174 URLs for 177 built pages**, broken down as 152 root-level pages and posts, 13 blog index +
pagination pages, 8 category pages, 1 author page. Every `<loc>` is absolute
`https://www.leelinepackage.com/…` with a trailing slash.

**Why 174 and not 177.** `/404` and `/500` are dropped by the integration itself (its own
`STATUS_CODE_PAGES`). `/thank-you/` and `/design-system/` are dropped by the `filter` above,
because both carry `<meta name="robots" content="noindex, nofollow">`.

> ⚠️ **The integration does not read `noindex` meta tags.** Verified against the installed
> package — grep its `dist/index.js` for `noindex` and you get zero hits. **Any new `noindex`
> page must be added to `SITEMAP_EXCLUDE` by hand**, or it will be advertised in the sitemap
> while simultaneously asking not to be indexed. That contradiction is a Search Console error.

**`lastmod` — present on 122 of the 174 URLs.** It is the one sitemap field Google actually
reads, and a *wrong* value is worse than none: stamping every URL with the build date teaches
the crawler to ignore the field. So only the 122 posts get one, taken from the real
`publishDate` in their frontmatter. The homepage, `/blog/`, `/blog/N/`, `/category/*` and the
static pages have no date we can honestly claim and are left without a `lastmod`.

The dates are read **off disk** (`readdirSync`/`readFileSync` on `src/content/blog/`), not from
the content collection, because `astro.config.mjs` is evaluated before the content layer exists.
Paths resolve off `import.meta.url`, never `process.cwd()`.

**Options deliberately not used** — so they are not re-litigated: `changefreq` and `priority`
(Google ignores both), `i18n` (single-language site), `customPages` / `customSitemaps` (every URL
is build-generated), `entryLimit` (174 is far below the 45,000 default), `xslURL`, and the
image/video `namespaces` — those live in §9 instead, because images and videos are written by a
separate integration rather than as extension tags on the URL sitemap.

> ⚠️ **Correction (2026-09-29):** an earlier version of this file claimed Google deprecated
> standalone video sitemaps in 2023. **That is wrong** — video sitemaps are still supported, and
> Google recommends one when your own pages are the play pages, which is the case here. The URL
> sitemap still carries no video data, but a real video sitemap now exists: see §9.

---

## 3. `robots.txt`

```js
import robotsTxt from 'astro-robots-txt';
integrations: [react(), robotsTxt(), sitemap(/* … */)]
```

**Output** — byte-for-byte, LF line endings, 81 bytes:

```
User-agent: *
Allow: /
Sitemap: https://www.leelinepackage.com/sitemap-index.xml
```

**Why an integration rather than a static file.** The `Sitemap:` URL is *derived*:
`new URL(config.base, config.site)` plus `sitemapBaseFileName` (default `sitemap-index`). A
hand-written `public/robots.txt` meant the domain lived in two files and had to be kept in sync
by hand.

> ⚠️ **There is no `public/robots.txt`, and you must not create one.** Astro copies `public/`
> into `dist/client/` during the build, and this integration writes `dist/client/robots.txt` at
> `astro:build:done` — two writers on one file. The integration is the only source of truth.

> ⚠️ **`sitemap-index` is a coincidence of defaults, not a link.** This package's
> `sitemapBaseFileName` happens to equal `@astrojs/sitemap`'s output filename. Change
> `filenameBase` on the sitemap and this line silently points at a 404 — the build will not
> catch it.

> ⚠️ **It runs only on `astro:build:done`,** so **`astro dev` returns 404 for `/robots.txt`**.
> That is expected, not a bug.

**Available options** (v1.0.0 — the shipped `.d.ts` is authoritative):
`host`, `sitemap`, `policy`, `sitemapBaseFileName`, `transform`. There is **no `resolveEnv`**;
older blog posts recommend it for blocking crawlers in dev, and it does not exist in this version.

**Nothing is disallowed, on purpose.** `/thank-you/` and `/design-system/` are `noindex`, and a
`Disallow` would stop a crawler ever *reading* that `noindex` tag — the two directives fight each
other. Leave them crawlable and let the meta tag do the work. The site has no `/search`, no
`/admin`, and no parameterised URLs, so there is nothing else worth disallowing. The default
policy `[{ userAgent: '*', allow: '/' }]` is therefore correct and `policy` is not overridden.

Add `host: true` only if Yandex ever matters — it emits the `Host` directive, which Yandex itself
deprecated.

---

## 4. Page `<head>`: the `Layout` props

`src/layouts/Layout.astro` is the only thing that writes a page's `<head>`. Pass it props and it
emits the tags. **Never hand-write SEO meta tags in a page** — you would get duplicates.

| Prop | Type | Emits |
|---|---|---|
| `title` | `string` (required) | `<title>`, `og:title`, `twitter:title` |
| `description` | `string` | `<meta name="description">`, `og:description`, `twitter:description` |
| `keywords` | `string` | `<meta name="keywords">` — omitted when empty |
| `canonical` | `string` | `<link rel="canonical">`, `<meta property="og:url">` — **write the full `https://www.leelinepackage.com/…` URL, trailing slash included** |
| `ogType` | `string` (default `website`) | `og:type`. Posts pass `article` |
| `ogImage` | `string` | `og:image`, `twitter:image` |
| `ogImageAlt` | `string` | `og:image:alt`, `twitter:image:alt` — emitted only alongside `ogImage` |
| `ogImageWidth` / `ogImageHeight` | `number` | `og:image:width` / `og:image:height` — let a social card lay out before the image downloads |
| `publishedTime` | `string` (ISO 8601) | `article:published_time` |
| `articleAuthor` | `string` | `article:author` |
| `robots` | `string` | `<meta name="robots" content="…">` — **opt-out, see below** |
| `jsonLd` | `string` | a `<script type="application/ld+json">` block |

`Layout` also always emits `og:site_name` and `og:locale`, plus the font preloads, favicons and
`<slot name="head" />`.

`og:site_name` comes from a `SITE_NAME` constant inside `Layout.astro`. **Keep it in sync with the
JSON-LD `publisher.name` and the logo's `alt`** — three places spell the brand name.

**`robots` is opt-out.** `index, follow` is already the crawler default, so writing it on the 174
indexable pages would be pure noise. The prop emits the tag only when you pass it, and exactly
three pages do: `404.astro`, `design-system.astro`, `thank-you.astro`, all with
`robots="noindex, nofollow"`. This replaced an earlier pattern of injecting a
`<Fragment slot="head">` — do not bring that back.

**A page that passes `ogImage` but no `ogImageAlt` gets no `og:image:alt`.** That is correct
behaviour (a sub-property without `og:image` would be invalid markup), and it is why the 27 static
pages — none of which declare image dimensions — emit `og:image` alone. Threading
`ogImageAlt`/`ogImageWidth`/`ogImageHeight` through those pages is the obvious next improvement.

---

## 5. Adding a page — the short version

1. Set `title` to **exactly 60 characters** and `description` to **exactly 160**, including a
   number (MOQ, lead time, a percentage). These are hard requirements — see the Copy rules
   section of `CLAUDE.md`, which is the authority on the wording rules.
2. Write `canonical` as the absolute production URL **with** the trailing slash.
3. Add `ogImage` — and `ogImageAlt` / `ogImageWidth` / `ogImageHeight` if you have them.
4. Posts only: also pass `ogType="article"`, `publishedTime` and `articleAuthor`.
5. Only if the page must not be indexed: pass `robots="noindex, nofollow"` **and** add its path
   to `SITEMAP_EXCLUDE` in `astro.config.mjs`. Both, every time — neither one implies the other.
6. Run `npm run lint` and `npm run build`.

---

## 6. Verifying a change

```bash
npx astro dev stop                   # stop dev first, or the build hits EPERM on dist/client
npm run lint                         # never `npm run lint:fix` — it deletes homepage sections
npm run build                        # expect: "astro-robots-txt: `robots.txt` is created."
                                     #         "[@astrojs/sitemap] `sitemap-index.xml` created"

cat dist/client/robots.txt           # must name sitemap-index.xml, and be LF only
grep -o "<loc>" dist/client/sitemap-0.xml | wc -l          # 174
grep -o "<lastmod>" dist/client/sitemap-0.xml | wc -l      # 122 — the posts only
grep -cE "thank-you|design-system" dist/client/sitemap-0.xml   # 0 — the noindex pages must be absent

npx astro dev --background           # always restart dev afterwards
```

For a `lastmod` or URL change, **cross-check every value rather than spot-checking** — a slug
mismatch silently attaches the wrong date to a page. Walk the built XML and compare against
`src/content/blog/*.md`; expect 0 mismatches, 0 missing, 0 extras, 0 future dates.

For a **`<head>` change**, snapshot every page's `<head>` before editing, rebuild, then diff all
of them. The bar to hit is *added-only, nothing removed* — that is what proves no existing tag
(`meta keywords`, `og:title`, the JSON-LD) was lost while you were adding. Three traps in that
harness:

- **Inline `<style>` content looks like markup.** A rule like `@media (width<=640px)` contains a
  `<`, so a naive `<[^>]+>` regex matches a CSS blob as a "tag" and reports hundreds of phantom
  add/remove pairs. Strip `<style>…</style>` first.
- **Filter both sides identically.** Excluding `preload`/`favicon`/`stylesheet` from one side only
  makes all 177 font-preload links look newly added.
- Bash's `/tmp` and Windows Python's `/tmp` are **different directories** — resolve the working
  directory inside the script with `tempfile.gettempdir()`, not from a path passed by bash.

---

## 7. Why there is no `astro-seo`

[`astro-seo`](https://github.com/jonasmerlin/astro-seo) was evaluated on 2026-09-29 and
**rejected**. `Layout.astro` already emitted title, description, keywords, canonical, the full
`og:*` + `twitter:*` sets and the JSON-LD — roughly 90% overlap — so adopting it meant rewriting
the `<head>` of all 177 pages to gain about fifteen lines of direct work. The gap was closed by
hand instead, and **no dependency was added.**

If it is proposed again, these are the three reasons, each read out of its `src/SEO.astro` rather
than assumed:

1. **It has no `keywords` prop at all**, so the 122 posts would silently lose
   `<meta name="keywords">`.
2. **`openGraph.basic` requires title *and* type *and* image, or it throws.** Seven pages pass no
   `ogImage` (404, design-system, thank-you, and four legal pages), so they would lose `og:title`
   and `og:type` too — a regression, not a gain.
3. **Its `<meta name="robots">` is unconditional**, emitting `index, follow` on every page, and it
   defaults `canonical` to `Astro.url.href`, so all 177 pages gain both plus a `/404` canonical on
   the 404 page.

---

## 8. Schema markup (JSON-LD)

Every page emits structured data through the `jsonLd` prop on `Layout`, which renders a single
`<script type="application/ld+json">`. Measured: **150 JSON-LD blocks across the 177 built pages**,
built by **28 source files**, usually as an `@graph`. The shapes in use are `BlogPosting` +
`BreadcrumbList` + `FAQPage` (posts — 39 of the 122 carry an FAQ) and `Service` / `ContactPage` /
`AboutPage` + `Organization` + `BreadcrumbList` (static pages).

**The pattern:** `Layout` takes a **string** — `jsonLd={JSON.stringify(jsonLd)}`. The object is
built in the page's frontmatter, so it can be derived from page data. `[slug].astro` is the model
example: it lifts `FAQPage` out of the FAQ block already in the body instead of restating it, so the
markup and the schema cannot disagree.

**Added 2026-09-29, for parity with the old WordPress site** (which had both, in worse form):

- **`VideoObject`** on the 51 playable YouTube embeds — 51 nodes across 50 posts, matching the
  video sitemap's 51 `(page, id)` pairs *exactly* (checked in both directions). Built in
  `[slug].astro` from the iframe itself: its `title` becomes `name`, the page description becomes
  `description`, `thumbnailUrl` is the real `i.ytimg.com/vi/<id>/hqdefault.jpg`, `embedUrl` the
  embed URL. ⚠️ **`uploadDate` is the post's `publishDate`** — an approximation, because Google
  requires the field and there is no per-video date available (oEmbed does not return one; the
  YouTube Data API needs a key).
  ⚠️ **Not copied from the old site**, whose version was malformed: `description` was YouTube's
  generic boilerplate, `thumbnailUrl` was the post's featured image rather than the video
  thumbnail, `isFamilyFriendly` was the string `"True"`, and `publisher` pointed at a `Person`.
- **`Organization.logo`** as a typed `ImageObject` at `#logo`, on the homepage only — Google reads
  the brand entity there, and the other 27 pages carry their own inline `Organization` node where
  duplicating it buys nothing. ⚠️ Our logo is 500×100; Google asks for ≥112 px tall, so it is 12 px
  short (the old site's 150×100 crop was short too).

**Deliberately NOT replicated from the old site:** `SearchAction` (its `target` is WordPress's
`/?s={search_term_string}`; this site has no search, so the markup would be a false claim),
`SiteNavigationElement` (nav noise) and `CreativeWork` (a superclass of `BlogPosting`, redundant).

### `astro-seo-schema` — evaluated, tested, **not adopted**

`astro-seo-schema@7.0.0` (peers `astro ^7`, `schema-dts ^1.1.0`) exposes exactly one component:

```astro
---
import { Schema } from 'astro-seo-schema';
---
<Schema item={jsonLd} />   <!-- item: a Thing, a WithContext<T>, or a @graph -->
```

It emits the same `<script type="application/ld+json">`. **Tested on a real page:** `contact.astro`
rendered its three-node `@graph` through `<Schema>` and the parsed JSON was **identical** to what the
string approach produced — one block, same nodes, same values, no duplicate script tag. The
component works. The test was then reverting (see the verdict below).

> ⚠️ **It HTML-entity-escapes every string value, and `<script>` content is raw text, so nothing
> decodes it back.** Measured in headless Chrome: a script containing `"a &amp; b"` parses to the
> literal `a &amp; b`, not `a & b`. The escaping covers `& < > " '` → `&amp; &lt; &gt; &quot; &apos;`.

That matters here: **37 of the 150 blocks contain a raw `&`** (post titles and descriptions such as
*"Meaning & Measurement Guide"*) and **12 contain an apostrophe** — so adopting it would have
rewritten those values.

Both sides of the trade-off:

| | `JSON.stringify` + `set:html` (today) | `astro-seo-schema` |
|---|---|---|
| `&` and `'` reach the consumer intact | ✅ | ❌ become `&amp;` / `&apos;` |
| a `</script>` inside content can break out | ⚠️ in theory | ✅ escaped, so no |
| `schema-dts` type safety | — | ⚠️ **only if `astro check` runs, and it does not** — there is no `check` script and the eslint config here is not type-aware |

Google's parser changed on **2026-08-21** to apply a **single** pass of HTML unescaping, so a
single-encoded `&amp;` should still arrive as `&`. But that is not verifiable from this repo, and
Google's own guidance is to emit `\u0026` or the literal character — which is what the current
approach already does. Other consumers (schema validators, Rich Results Test previews) do not
unescape at all.

**Verdict: not adopted.** All 28 files keep the string approach, no page uses `<Schema>`, and the
package was removed with `npm uninstall astro-seo-schema schema-dts`. After reverting, the built
output was confirmed back at the exact pre-test state: 150 blocks, **0 containing an HTML entity**,
37 with a raw `&`, 12 with an apostrophe. The reasons to revisit are narrow — if `astro check` is
ever added (which would finally make the `schema-dts` types real) and if the entity question is
settled against a deployed page in Search Console.

### One-off head tags

`Layout` renders `<slot name="head" />` at the end of `<head>`, so a page can add a genuine one-off
tag with `<Fragment slot="head">…</Fragment>`. **Do not use the slot for a repeated need** — a
repeated need gets a named prop on `Layout`, which is why `robots` is a prop and not a fragment.

---

## 9. Media sitemaps (images and videos)

`integrations/media-sitemaps.mjs` generates them at `astro:build:done`, from the **built HTML** —
not from the content collections — because the HTML is the only thing that knows what actually
rendered. Three kinds of file:

| file | contents |
|---|---|
| `image-sitemap-1.xml` … `image-sitemap-5.xml` | one `<url>` per page, each with its `<image:image><image:loc>` entries |
| `video-sitemap.xml` | one `<url>` per page, each with `<video:video>` |
| `sitemap-media-index.xml` | a `<sitemapindex>` naming exactly the files above |

`robots.txt` names only `sitemap-media-index.xml` (§3). The index is generated from the files that
were actually written, so a change in the chunk count can never leave `robots.txt` stale.

**Measured 2026-09-29:** **2,032 image entries over 170 pages → 5 files** (483 / 464 / 496 / 496 /
93, i.e. the client's 500-per-file rule, with a page's images never split across two files), and
**51 video entries → 1 file**.

### What is included, and what is deliberately not

| source | included | why |
|---|---|---|
| `<img src>` | ✅ | content images, all on the CDN |
| CSS `url()` hero/CTA plates, read from the page's linked `_astro/*.css` plus inline `<style>` | ✅ | 66 plates — the most prominent images on the site, and **not one of them appears as an element**, so an `<img>`-only scan would miss every one |
| `srcset` variants | only the widest | the others are the "redundant near-duplicate" the rules exclude |
| nav/footer logo, author avatar | ❌ | site chrome — 354 and 239 occurrences describing two decorative assets |
| `404.html`, `/thank-you/`, `/design-system/` | ❌ | no URL of its own / `noindex` — the same list as `SITEMAP_EXCLUDE` |

**Only `<image:loc>` is emitted.** Google deprecated `image:title`, `image:caption`,
`image:geo_location` and `image:license` effective **2022-08-06** (announced 2022-05-06); the live
docs still list only `<image:image>` + `<image:loc>`.

> ⚠️ **A dead asset must not be listed.** All **1,713** unique CDN image URLs were probed once and
> **every one returns 200**, so images need no per-build check. Videos do — see below.

### Video entries

Required fields only — `video:thumbnail_loc`, `video:title`, `video:description`, `video:player_loc`:

- **`thumbnail_loc`** — `https://i.ytimg.com/vi/<id>/hqdefault.jpg`. `hqdefault` (480×360, above
  Google's 120×90 minimum) resolves for all 50 live videos; `maxresdefault` is sharper but 404s on
  some uploads.
- **`title`** — the embed `<iframe>`'s `title` attribute, i.e. the video's own title, clipped to
  Google's 100-character limit.
- **`description`** — the page's `<meta name="description">`, clipped to 2,048 characters.
- **`player_loc`** — `https://www.youtube.com/embed/<id>`, which must not equal the page URL.

> ⚠️ **Three of the 53 embeds are dead.** `DHbSfMlxBH8`, `FPD6eRE0zTg` and `bna9KczcD5Y` 404 on
> *every* thumbnail variant, and YouTube's oEmbed endpoint returns 404 for them as well — so they
> are deleted or private, not merely thumbnail-less. They sit in `DEAD_VIDEOS` in the integration
> and are excluded; a build warning names them and the pages carrying them.
>
> **This is a content bug, not a sitemap one.** Those pages still render a dead player:
> `/aqueous-vs-uv-coating/`, `/what-is-a-pr-package/`, `/what-is-kraft-paper/`. Replace or remove
> the embeds, then drop the IDs from `DEAD_VIDEOS`.

> ⚠️ **Do not "fix" this with a build-time probe.** One was tried and removed: Node's `fetch`
> cannot reach `i.ytimg.com` from this machine (curl fails identically, `schannel: failed to
> receive handshake`), so every video looked dead and a four-variant fallback chain added **105
> seconds** to the build for nothing. The build must not depend on reaching YouTube.

### Verifying

```bash
npm run build   # expect: "[media-sitemaps] 2032 image entries across 170 pages
                #          -> image-sitemap-1.xml, …; 51 video entries -> video-sitemap.xml"
cat dist/client/robots.txt                                    # must name both indexes
```

Parse the XML with a real parser rather than grepping when the question is structural — a mangled
namespace looks exactly like "0 entries" and sends you hunting a bug that is not there.

### `VideoObject` structured data — done 2026-09-29

A video sitemap aids **discovery**; Google's video **rich results** additionally need `VideoObject`
JSON-LD on the page. That is now emitted (§8) for the 51 playable embeds, from the same shared
dead-video list this integration uses (`src/data/dead-videos.mjs`), so the sitemap and the JSON-LD
cannot drift apart. The two were verified to hold the **identical** `(page, id)` set.

---

## 10. Not in this repo — the Cloudflare side

Three things affect this site's SEO that **cannot be fixed from the repository**. They are listed
here so they are not mistaken for finished work:

1. **The R2 image bucket has no `Cache-Control`.** Every key returns `cf-cache-status: DYNAMIC`
   with no cache headers, so Cloudflare passes each image through to origin. This is the site's
   single biggest Core Web Vitals problem (TTFB measured between 0.99 s and 11.2 s on one key).
   Fix it in Cloudflare/R2 — set `immutable` on the objects, or add a Cache Rule.
2. **The custom domain still served the old WordPress site** as of 2026-09-29. Attaching
   `www.leelinepackage.com` to the Worker is what actually puts this site live; until then
   `robots.txt` and the sitemap exist only in the build output.
3. **The old `robots.txt` advertised `/sitemap_index.xml`** (underscore, Rank Math). The new one
   is `/sitemap-index.xml` (hyphen). If the old path is indexed, add a redirect for it.
