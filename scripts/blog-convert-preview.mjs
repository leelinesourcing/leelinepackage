#!/usr/bin/env node
/*
  blog-convert-preview — dry-run the WordPress -> Markdown conversion without touching R2.

  Runs the real converter against the real export but swaps the R2 image map for stub URLs, so
  you can inspect the generated Markdown in seconds instead of waiting on 969 uploads.

  Usage:
    node scripts/blog-convert-preview.mjs                      # first 3 posts, summary
    node scripts/blog-convert-preview.mjs what-is-a-gusset     # specific slugs
    node scripts/blog-convert-preview.mjs --all                # audit every post
    node scripts/blog-convert-preview.mjs --dump=<slug>        # print the full Markdown

  What it checks: leftover Gutenberg comments, un-rewritten WordPress URLs, images that did not
  land on R2 or lost their intrinsic size, and — most importantly — that every table-of-contents
  href still points at a heading id the slugger actually produced.
*/

import fs from 'node:fs';
import path from 'node:path';
import GithubSlugger from 'github-slugger';
import { parseWxr } from './import-blog.mjs';
import { htmlToMarkdown, splitLongParagraphs } from './wp-to-markdown.mjs';

const argv = process.argv.slice(2);
const DUMP = (argv.find((a) => a.startsWith('--dump=')) || '').split('=')[1] || '';
const ALL = argv.includes('--all');
const slugs = argv.filter((a) => !a.startsWith('--'));

const XML = process.env.WP_XML || 'C:/Users/Administrator/Desktop/leelinepackage.WordPress.2026-09-24.xml';
const MAX_PARA = Number(process.env.MAX_PARA || 340);

const { posts, attachments } = parseWxr(fs.readFileSync(XML, 'utf8'));

/* Deterministic stub URLs — stable across runs so diffs are readable. */
const stubIds = new Map();
const resolveImage = (src) => {
  if (!stubIds.has(src)) stubIds.set(src, stubIds.size + 1);
  return {
    url: `https://img.leelinepackage.com/blog/media/STUB/${String(stubIds.get(src)).padStart(4, '0')}.webp`,
    width: 1200,
    height: 800,
  };
};

const chosen = DUMP
  ? posts.filter((p) => p.slug === DUMP)
  : ALL
    ? posts
    : slugs.length
      ? posts.filter((p) => slugs.includes(p.slug))
      : posts.slice(0, 3);

if (!chosen.length) {
  console.error(`no posts matched. known slugs include: ${posts.slice(0, 5).map((p) => p.slug).join(', ')}…`);
  process.exit(1);
}

const totals = { posts: 0, tocLinks: 0, tocDead: 0, gutenberg: 0, wpUploads: 0, nonR2: 0, imgNoDims: 0, droppedSvg: 0 };
const bad = [];

for (const p of chosen) {
  const slugger = new GithubSlugger();
  const { markdown, slugMap } = htmlToMarkdown(p.content, { resolveImage, slugger });
  const body = splitLongParagraphs(markdown, MAX_PARA);

  /*
    A TOC href is only dead if nothing in the rendered body carries that id. Headings get a
    fresh Astro slug (so the WP id no longer exists), while constructs like FAQ questions keep
    their original id verbatim — so both have to be considered.
  */
  const produced = new Set(slugMap.values());
  const idsInBody = new Set([...body.matchAll(/\bid="([^"]*)"/g)].map((m) => m[1]));
  const valid = new Set([...produced, ...idsInBody]);
  const tocHrefs = [...body.matchAll(/<nav class="post-toc">[\s\S]*?<\/nav>/g)]
    .flatMap((m) => [...m[0].matchAll(/href="#([^"]*)"/g)].map((x) => x[1]));
  const dead = tocHrefs.filter((h) => !valid.has(h));

  const stats = {
    slug: p.slug,
    chars: body.length,
    headings: (body.match(/^#{2,4} /gm) || []).length,
    tables: (body.match(/<table/gi) || []).length,
    tocLinks: tocHrefs.length,
    tocDead: dead.length,
    figures: (body.match(/class="post-figure"/gi) || []).length,
    embeds: (body.match(/<iframe/gi) || []).length,
    faqs: (body.match(/class="post-faq"/gi) || []).length,
    ctas: (body.match(/class="post-cta"/gi) || []).length,
    notes: (body.match(/class="post-note"/gi) || []).length,
    quotes: (body.match(/class="post-quote"/gi) || []).length,
    gutenberg: (body.match(/<!--\s*\/?wp:/g) || []).length,
    wpUploads: (body.match(/wp-content\/uploads/g) || []).length,
    nonR2: (body.match(/<img\b[^>]*src="(?!https:\/\/img\.leelinepackage\.com)/gi) || []).length,
    imgNoDims: (body.match(/<img\b(?![^>]*\bwidth=)[^>]*>/gi) || []).length,
  };

  totals.posts++;
  for (const k of ['tocLinks', 'tocDead', 'gutenberg', 'wpUploads', 'nonR2', 'imgNoDims']) totals[k] += stats[k];

  const problems = [];
  if (stats.tocDead) problems.push(`${stats.tocDead}/${stats.tocLinks} TOC links dead -> ${dead.slice(0, 3).join(', ')}`);
  if (stats.gutenberg) problems.push(`${stats.gutenberg} Gutenberg comments left`);
  if (stats.wpUploads) problems.push(`${stats.wpUploads} wp-content/uploads URLs left`);
  if (stats.nonR2) problems.push(`${stats.nonR2} images not on R2`);
  if (stats.imgNoDims) problems.push(`${stats.imgNoDims} images without width/height`);
  if (problems.length) bad.push({ slug: p.slug, problems });

  if (!ALL && !DUMP) {
    console.log(`\n/${p.slug}/  cat=${p.categories[0]}  date=${p.date}  status=${p.status}`);
    console.log(`  featured: ${attachments.get(p.thumbnailId)}`);
    console.log(`  ${p.content.length} chars HTML -> ${stats.chars} chars markdown`);
    console.log(`  headings=${stats.headings} tables=${stats.tables} figures=${stats.figures} embeds=${stats.embeds} toc=${stats.tocLinks}`);
    console.log(`  faq=${stats.faqs} cta=${stats.ctas} note=${stats.notes} quote=${stats.quotes}`);
    if (problems.length) console.log(`  ⚠️  ${problems.join('; ')}`);
  }
}

console.log(`\n${'='.repeat(80)}`);
console.log(`posts checked: ${totals.posts}`);
console.log(`TOC links: ${totals.tocLinks} | dead: ${totals.tocDead}`);
console.log(`leftover Gutenberg comments: ${totals.gutenberg}`);
console.log(`leftover wp-content/uploads URLs: ${totals.wpUploads}`);
console.log(`images not on R2: ${totals.nonR2}`);
console.log(`images missing width/height: ${totals.imgNoDims}`);
if (bad.length) {
  console.log(`\n⚠️  ${bad.length} post(s) with problems:`);
  bad.slice(0, 25).forEach((b) => console.log(`  /${b.slug}/  ${b.problems.join('; ')}`));
}

if (DUMP) {
  const p = chosen[0];
  const slugger = new GithubSlugger();
  const { markdown } = htmlToMarkdown(p.content, { resolveImage, slugger });
  const out = splitLongParagraphs(markdown, MAX_PARA);
  const file = path.join(process.env.TEMP || '/tmp', `preview-${p.slug}.md`);
  fs.writeFileSync(file, out);
  console.log(`\nfull markdown written to ${file}`);
  console.log(`\n${'-'.repeat(80)}\n`);
  console.log(out.slice(0, 4000));
  console.log(`\n... [${out.length - 4000} chars omitted] ...`);
}
