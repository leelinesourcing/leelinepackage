import { getPublishedPosts, categoryLabel } from '../lib/blog';

/*
  Build-time search index for the navbar's blog search.

  The live WordPress site used GeneratePress's search modal, which GETs `?s=<query>` and lets PHP
  query the database. This build is static, so the same UI is backed by this file instead.

  ⚠️ Deliberately a SEPARATE request, fetched the first time the search panel is opened — never on
  page load. Inlining the array into `Navbar.astro` would add ~34 KB of JSON to all 176 pages for
  a feature most visitors never open, and the site's LCP is already CDN-bound.

  Keys are abbreviated because every byte here is a byte over the wire: `u`rl, `t`itle, `c`ategory,
  e`x`cerpt. Articles live at the ROOT (`/<slug>/`), not under `/blog/`.
*/
export async function GET() {
  const posts = await getPublishedPosts();
  const items = posts.map((p) => ({
    u: `/${p.id}/`,
    t: p.data.title,
    c: categoryLabel(p.data.category),
    x: p.data.description,
  }));

  return new Response(JSON.stringify(items), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
