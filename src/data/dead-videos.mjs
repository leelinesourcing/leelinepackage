/*
  YouTube embeds that do not resolve, and must never be described as if they were playable.

  Each of these 404s on EVERY thumbnail variant AND on YouTube's oEmbed endpoint, which means
  deleted or private rather than merely thumbnail-less. Verified 2026-09-29. Re-verify with:

    curl -s -o /dev/null -w '%{http_code}' \
      'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json'

  ✅ **The embeds were removed from the three articles on 2026-09-29**, so those pages no longer
  render a broken player: `aqueous-vs-uv-coating.md`, `what-is-a-pr-package.md`,
  `what-is-kraft-paper.md`. The titles they carried named generic channels ("Trend Unwrapper",
  "Graphic Design Nerd") where the 50 working embeds name real companies — these ids look
  fabricated during content generation, so there is no "original" to restore: supply a real
  video, or leave the post without one.

  ⚠️ **This list is now a GUARD, not an active filter.** It stays because
  `scripts/import-blog.mjs convert` REGENERATES `src/content/blog/*.md`, and a re-import would
  silently put these three dead embeds back. It has two consumers:

    * integrations/media-sitemaps.mjs  — keeps them out of video-sitemap.xml, since a
      missing thumbnail_loc invalidates the entry
    * src/pages/[slug].astro           — keeps VideoObject out of the page's JSON-LD, since a
      thumbnailUrl that 404s is equally invalid

  A build after removing the embeds no longer warns, because nothing embeds these ids any more —
  that silence is the guard working, not the guard being unnecessary.
*/
export const DEAD_VIDEOS = new Set(['DHbSfMlxBH8', 'FPD6eRE0zTg', 'bna9KczcD5Y']);

