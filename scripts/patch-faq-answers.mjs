#!/usr/bin/env node
/*
  patch-faq-answers — re-emit the `<div class="post-faq">` block of every affected post from the
  WordPress export.

  WHY THIS EXISTS
  ---------------
  All 39 posts that carry a FAQ block shipped with **143 questions and ZERO answers**: the `.md`
  files were written by an earlier revision of `wp-to-markdown.mjs` that emitted only the question
  `<h3>`. The panel therefore rendered as a bare list of questions, and the article pages carried no
  FAQPage schema at all.

  ⚠️ A full `import-blog.mjs convert` is NOT an option. It hard-requires `$TEMP/wpblog/work/
  image-map.json` (line: `JSON.parse(fs.readFileSync(FILES.imageMap))`), that work directory is
  gone, and rebuilding it would re-download and re-upload every blog image under NEW keys — the
  bucket is not edge-cached, so keys can never be reused. That would rewrite every image URL on
  every post and orphan the current R2 objects. So this script touches ONE construct: the FAQ block.

    node scripts/patch-faq-answers.mjs            # dry run: report only
    node scripts/patch-faq-answers.mjs --write    # apply

  The id queue is rebuilt exactly as the importer does it — every `"id": "faq-question-…"` from the
  post's raw content, in document order, shared across the post's FAQ blocks — so the ids the TOC
  links to are preserved byte-for-byte.
*/

import fs from 'node:fs';
import path from 'node:path';
import { faqToHtml } from './wp-to-markdown.mjs';

const XML = process.argv.find((a) => a.startsWith('--xml='))?.slice(6)
  || 'C:/Users/Administrator/Desktop/leelinepackage.WordPress.2026-09-24.xml';
const OUT_DIR = 'src/content/blog';
const WRITE = process.argv.includes('--write');

const FAQ_OPEN = '<div class="wp-block-rank-math-faq-block">';
const FAQ_END = '<!-- /wp:rank-math/faq-block -->';
const MD_OPEN = '<div class="post-faq">';

const raw = fs.readFileSync(XML, 'utf8');
const items = [...raw.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);

const cdata = (item, tag) => {
  const m = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`).exec(item);
  return m ? m[1] : '';
};

const report = { patched: 0, shortened: [], noXmlBlock: [], noMdBlock: [], idDrift: [], answers: 0 };
const diffs = [];

for (const item of items) {
  if (cdata(item, 'wp:post_type') !== 'post') continue;
  const slug = cdata(item, 'wp:post_name');
  const content = cdata(item, 'content:encoded');
  if (!slug || !content) continue;

  const file = path.join(OUT_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) continue;

  const md = fs.readFileSync(file, 'utf8');
  const lines = md.split('\n');
  const lineIdx = lines.findIndex((l) => l.startsWith(MD_OPEN));
  if (lineIdx < 0) continue;                       // unaffected post

  // Every FAQ block in the post, in document order, sharing one id queue (as the importer does).
  const blocks = [];
  let from = 0;
  for (;;) {
    const s = content.indexOf(FAQ_OPEN, from);
    if (s < 0) break;
    const e = content.indexOf(FAQ_END, s);
    if (e < 0) break;
    blocks.push(content.slice(s, e).trimEnd());
    from = e + FAQ_END.length;
  }
  if (!blocks.length) { report.noXmlBlock.push(slug); continue; }

  const idQueue = [...content.matchAll(/"id":\s*"(faq-question-[A-Za-z0-9-]+)"/g)].map((m) => m[1]);
  const nextId = () => idQueue.shift() || '';
  const fresh = blocks.map((b) => faqToHtml(b, nextId)).join('');

  // The ids must not move: the in-body TOC and the rail link to them.
  const ids = (s) => [...s.matchAll(/id="(faq-question-[A-Za-z0-9-]+)"/g)].map((m) => m[1]).join(',');
  if (ids(fresh) !== ids(lines[lineIdx])) report.idDrift.push(slug);

  const before = (lines[lineIdx].match(/<p>/g) || []).length;
  const after = (fresh.match(/<p>/g) || []).length;
  report.answers += after;
  if (after < before) report.shortened.push(`${slug} (${before} -> ${after})`);
  if (after !== before) diffs.push(`${slug}: ${before} -> ${after} paragraphs`);

  if (WRITE) {
    lines[lineIdx] = fresh;
    fs.writeFileSync(file, lines.join('\n'));
  }
  report.patched += 1;
}

console.log(`${WRITE ? 'WROTE' : 'DRY RUN'} — ${report.patched} post(s), ${report.answers} answer paragraph(s)`);
if (diffs.length) console.log('\nparagraph count changes:\n  ' + diffs.join('\n  '));
if (report.idDrift.length) console.log(`\n⚠️ ID DRIFT (must be empty):\n  ${report.idDrift.join('\n  ')}`);
if (report.shortened.length) console.log(`\n⚠️ FEWER paragraphs than before:\n  ${report.shortened.join('\n  ')}`);
if (report.noXmlBlock.length) console.log(`\n⚠️ no FAQ block found in the XML:\n  ${report.noXmlBlock.join(', ')}`);
