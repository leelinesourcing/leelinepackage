/*
  YouTube embeds that no longer resolve, and must not be described as if they were playable.

  Each of these 404s on EVERY thumbnail variant AND on YouTube's oEmbed endpoint, which means
  deleted or private rather than merely thumbnail-less. Verified 2026-09-29. Re-verify with:

    curl -s -o /dev/null -w '%{http_code}' \
      'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json'

  Two consumers, one list — this file is the single source of truth:
    * integrations/media-sitemaps.mjs  — keeps them out of video-sitemap.xml, since a
      missing thumbnail_loc invalidates the entry
    * src/pages/[slug].astro           — keeps VideoObject out of the page's JSON-LD, since a
      thumbnailUrl that 404s is equally invalid

  ⚠️ Dead embeds are a CONTENT problem, not just a markup one: those pages still render a player
  that says "Video unavailable". Replace or remove the embeds, then delete the ids here.
*/
export const DEAD_VIDEOS = new Set(['DHbSfMlxBH8', 'FPD6eRE0zTg', 'bna9KczcD5Y']);
