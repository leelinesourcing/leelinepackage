#!/usr/bin/env node
/*
  import-blog — one-off migration of the WordPress blog into this Astro site's
  `blog` content collection.

  Reads the WordPress export (WXR) and produces:
    • src/content/blog/<slug>.md   — one file per post, hybrid Markdown
    • an image manifest            — every image re-hosted on R2

  Phases are individually runnable and resumable (state lives in the work dir):

    node scripts/import-blog.mjs scan      parse the WXR -> posts.json + images.json
    node scripts/import-blog.mjs images    download -> measure -> upload to R2 -> image-map.json
    node scripts/import-blog.mjs convert   write src/content/blog/*.md
    node scripts/import-blog.mjs verify    re-check the written .md files
    node scripts/import-blog.mjs all       scan + images + convert

  Flags:
    --xml=<path>        WXR file            (default: the export on the Desktop)
    --work=<dir>        scratch dir         (default: %TEMP%/wpblog/work)
    --concurrency=<n>   parallel transfers  (default 6)
    --only=<slug,...>   limit convert/verify to these slugs
    --no-upload         images: download + measure only, skip the R2 PUT
    --max-para=<n>      paragraph split target in characters (default 330)

  ⚠️ Every R2 key below is NEW. The bucket is not edge-cached, so re-uploading over an
  existing key does not change what the CDN serves — the migration must never reuse a key.
*/

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import GithubSlugger from 'github-slugger';
import { htmlToMarkdown, splitLongParagraphs, decodeEntities } from './wp-to-markdown.mjs';

/* ── config ──────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(3);
const args = {};
for (const a of argv) {
  const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
  if (m) args[m[1]] = m[2] === undefined ? true : m[2];
}
const PHASE = process.argv[2] || 'all';

const XML_PATH = args.xml || 'C:/Users/Administrator/Desktop/leelinepackage.WordPress.2026-09-24.xml';
const WORK = args.work || path.join(process.env.TEMP || '/tmp', 'wpblog', 'work');
const CONCURRENCY = Number(args.concurrency || 6);
const MAX_PARA = Number(args['max-para'] || 290);
const DO_UPLOAD = args['no-upload'] !== true;
const ONLY = typeof args.only === 'string' ? args.only.split(',').map((s) => s.trim()).filter(Boolean) : null;

const R2_BUCKET = 'leelinepackage-images';
const R2_PUBLIC = 'https://img.leelinepackage.com';
const KEY_PREFIX = 'blog/media';
/** Non-image uploads (the downloadable PDF checklists) live here, flat and easy to find. */
const FILE_PREFIX = 'blog/pdf';
const AUTHOR_ID = 'lofty-shen';     // the only author in the export (display name "Lofty Shen")
const OUT_DIR = 'src/content/blog';

const FILES = {
  posts: path.join(WORK, 'posts.json'),
  images: path.join(WORK, 'images.json'),
  imageMap: path.join(WORK, 'image-map.json'),
  report: path.join(WORK, 'report.json'),
};

const log = (...a) => console.log(...a);
const ensureDir = (d) => fsp.mkdir(d, { recursive: true });

/* ── tiny utilities ──────────────────────────────────────────────────────── */
/* WordPress content is full of zero-width characters (U+200B) and non-breaking hyphens that
   are invisible in a URL but break filesystem paths and CDN keys. Strip/normalise them. */
export function cleanText(s) {
  return String(s)
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function mapLimit(items, limit, fn) {
  let next = 0;
  let done = 0;
  return new Promise((resolve, reject) => {
    const worker = async () => {
      while (true) {
        const i = next++;
        if (i >= items.length) return;
        try {
          await fn(items[i], i);
        } catch (e) {
          reject(e);
          return;
        }
        if (++done % 50 === 0) log(`   … ${done}/${items.length}`);
      }
    };
    Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker))
      .then(resolve, reject);
  });
}

function run(cmd, cmdArgs) {
  return new Promise((resolve) => {
    const p = spawn(cmd, cmdArgs, { shell: true });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => resolve({ code, out, err }));
  });
}

/* ── WXR parsing ─────────────────────────────────────────────────────────── */
function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  if (!m) return '';
  const cd = m[1].match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return cd ? cd[1] : m[1];
}

/*
  Source URLs must be kept EXACTLY as WordPress wrote them, zero-width characters included —
  the live host 404s the "cleaned" spelling. Only the R2 key gets normalised (see keyFor).
*/
const sourceUrl = (raw) => decodeEntities(raw).trim();

export function parseWxr(xml) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  const attachments = new Map();   // attachment id -> url
  const alts = new Map();          // attachment url -> media-library alt text
  for (const it of items) {
    if (tag(it, 'wp:post_type') !== 'attachment') continue;
    const url = sourceUrl(tag(it, 'wp:attachment_url'));
    if (!url) continue;
    attachments.set(tag(it, 'wp:post_id'), url);
    for (const m of it.matchAll(/<wp:postmeta>([\s\S]*?)<\/wp:postmeta>/g)) {
      if (tag(m[1], 'wp:meta_key') === '_wp_attachment_image_alt') {
        const v = cleanText(tag(m[1], 'wp:meta_value'));
        if (v) alts.set(url, v);
      }
    }
  }

  const posts = [];
  for (const it of items) {
    if (tag(it, 'wp:post_type') !== 'post') continue;
    const meta = {};
    for (const m of it.matchAll(/<wp:postmeta>([\s\S]*?)<\/wp:postmeta>/g)) {
      meta[tag(m[1], 'wp:meta_key')] = tag(m[1], 'wp:meta_value');
    }
    posts.push({
      slug: tag(it, 'wp:post_name'),
      title: cleanText(decodeEntities(tag(it, 'title'))),
      content: tag(it, 'content:encoded'),
      status: tag(it, 'wp:status'),
      date: tag(it, 'wp:post_date_gmt') || tag(it, 'wp:post_date'),
      categories: [...it.matchAll(/<category domain="category"[^>]*nicename="([^"]*)"/g)].map((m) => m[1]),
      focusKeyword: cleanText(decodeEntities(meta.rank_math_focus_keyword || '')),
      seoTitle: cleanText(decodeEntities(meta.rank_math_title || '')),
      seoDescription: cleanText(decodeEntities(meta.rank_math_description || '')),
      thumbnailId: meta._thumbnail_id || '',
    });
  }
  return { posts, attachments, alts };
}

/* ── R2 key naming ───────────────────────────────────────────────────────── */
/*
  Keys mirror the WordPress upload path: blog/media/<yyyy>/<mm>/<file>. A bare basename is
  not unique — 7 filenames exist twice in the library under different months. The basename is
  normalised to ASCII-safe characters and, if still very long, truncated with a content hash
  so the key stays readable and unique.
*/
export function safeName(base) {
  let s = base
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\u00AE\u2122\u2018\u2019\u201C\u201D]/g, '')
    .replace(/[^A-Za-z0-9._-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+/, '');
  const ext = (s.match(/\.[A-Za-z0-9]+$/) || [''])[0];
  let stem = s.slice(0, s.length - ext.length);
  if (stem.length > 80) {
    const h = crypto.createHash('md5').update(base).digest('hex').slice(0, 8);
    stem = `${stem.slice(0, 80).replace(/-$/, '')}-${h}`;
  }
  return `${stem}${ext}`;
}

/*
  Images keep the WordPress upload path (`blog/media/<yyyy>/<mm>/<file>`) because a bare
  basename is not unique — 7 filenames appear twice under different months.

  ⚠️ Non-image uploads go to their OWN prefix instead: `blog/pdf/<file>`. The downloadable
  checklists are content people need to find and replace by hand, and burying five PDFs among
  969 images across month folders makes them effectively unfindable in the bucket. Kept as a
  flat prefix on purpose, so a re-run reproduces the same layout.
*/
export function keyFor(url) {
  const clean = sourceUrl(url).split('?')[0];
  const m = /\/uploads\/(\d{4})\/(\d{2})\/(.+)$/.exec(clean);
  const file = safeName(decodeURIComponent(m ? m[3] : path.basename(clean)));
  if (!IMAGE_EXT.test(file)) return `${FILE_PREFIX}/${file}`;
  const folder = m ? `${m[1]}/${m[2]}/` : '';
  return `${KEY_PREFIX}/${folder}${file}`;
}

/* ── image dimensions, without a dependency ──────────────────────────────── */
export function imageSize(buf) {
  const ascii = (o, n) => (o + n <= buf.length ? buf.toString('ascii', o, o + n) : '');
  if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') {
    let off = 12;
    while (off + 8 <= buf.length) {
      const fourcc = ascii(off, 4);
      const size = buf.readUInt32LE(off + 4);
      const data = off + 8;
      if (fourcc === 'VP8X') {
        return {
          width: 1 + (buf[data + 4] | (buf[data + 5] << 8) | (buf[data + 6] << 16)),
          height: 1 + (buf[data + 7] | (buf[data + 8] << 8) | (buf[data + 9] << 16)),
        };
      }
      if (fourcc === 'VP8 ') {
        return { width: buf.readUInt16LE(data + 6) & 0x3fff, height: buf.readUInt16LE(data + 8) & 0x3fff };
      }
      if (fourcc === 'VP8L') {
        const b = buf.readUInt32LE(data + 1);
        return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
      }
      if (!size) break;
      off = data + size + (size % 2);
    }
  }
  if (ascii(4, 4) === 'ftyp') {
    const idx = buf.indexOf(Buffer.from('ispe'));
    if (idx > 0 && idx + 16 <= buf.length) {
      return { width: buf.readUInt32BE(idx + 8), height: buf.readUInt32BE(idx + 12) };
    }
  }
  return { width: null, height: null };
}

const MIME = {
  webp: 'image/webp', avif: 'image/avif', png: 'image/png',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml',
  pdf: 'application/pdf',
};

const IMAGE_EXT = /\.(webp|avif|png|jpe?g|gif|svg)$/i;

async function r2Put(key, file, contentType) {
  const { code, out, err } = await run('npx', [
    'wrangler', 'r2', 'object', 'put', `"${R2_BUCKET}/${key}"`,
    '--file', `"${file}"`, '--content-type', contentType, '--remote',
  ]);
  if (code !== 0 || /ERROR/i.test(out + err)) {
    return { ok: false, detail: (out + err).replace(/\s+/g, ' ').slice(0, 240) };
  }
  return { ok: true };
}

/* ── phase: scan ─────────────────────────────────────────────────────────── */
async function phaseScan() {
  await ensureDir(WORK);
  const xml = fs.readFileSync(XML_PATH, 'utf8');
  log(`WXR: ${XML_PATH} (${(xml.length / 1e6).toFixed(1)} MB)`);
  const { posts, attachments, alts } = parseWxr(xml);
  log(`posts: ${posts.length} | attachments: ${attachments.size} | with alt text: ${alts.size}`);

  const oddCats = posts.filter((p) => p.categories.length !== 1);
  if (oddCats.length) log(`⚠️  posts not carrying exactly one category: ${oddCats.length}`);

  const urls = new Set();
  for (const p of posts) {
    for (const m of p.content.matchAll(/<img\b[^>]*?src="([^"]+)"/gi)) urls.add(sourceUrl(m[1]));
    const thumb = attachments.get(p.thumbnailId);
    if (thumb) urls.add(thumb);
    /*
      Linked non-image uploads — the downloadable PDF checklists. They get the same treatment
      as images: if they stayed on the WordPress host, the link would 404 the day that site is
      retired.
    */
    for (const m of p.content.matchAll(/(?:href|src)="([^"]*\/wp-content\/uploads\/[^"]*)"/gi)) {
      const u = sourceUrl(m[1]);
      if (!IMAGE_EXT.test(u.split('?')[0])) urls.add(u);
    }
  }
  const images = [...urls].sort();

  const byKey = new Map();
  let collisions = 0;
  for (const u of images) {
    const k = keyFor(u);
    if (byKey.has(k)) { collisions++; log(`⚠️  key collision\n    ${k}\n    ${byKey.get(k)}\n    ${u}`); }
    byKey.set(k, u);
  }
  const hosts = {};
  for (const u of images) hosts[new URL(u).host] = (hosts[new URL(u).host] || 0) + 1;
  log(`unique images: ${images.length} | key collisions: ${collisions}`);
  log('image hosts:', JSON.stringify(hosts));

  fs.writeFileSync(FILES.posts, JSON.stringify(posts, null, 2));
  fs.writeFileSync(FILES.images, JSON.stringify(images, null, 2));
  log(`wrote ${FILES.posts}\nwrote ${FILES.images}`);
}

/* ── phase: images ───────────────────────────────────────────────────────── */
async function phaseImages() {
  const images = JSON.parse(fs.readFileSync(FILES.images, 'utf8'));
  const map = fs.existsSync(FILES.imageMap) ? JSON.parse(fs.readFileSync(FILES.imageMap, 'utf8')) : {};
  const dir = path.join(WORK, 'files');
  await ensureDir(dir);

  const todo = images.filter((u) => !map[u] || !map[u].verified);
  log(`images: ${images.length} total | ${images.length - todo.length} already verified | ${todo.length} to do`);
  if (!todo.length) return;

  await mapLimit(todo, CONCURRENCY, async (url) => {
    const key = keyFor(url);
    const ext = (key.split('.').pop() || '').toLowerCase();
    const local = path.join(dir, key.slice(KEY_PREFIX.length + 1).replace(/\//g, '__'));

    let bytes;
    try {
      const r = await fetch(url, { redirect: 'follow' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      bytes = Buffer.from(await r.arrayBuffer());
    } catch (e) {
      map[url] = { key, verified: false, error: `download: ${e.message}` };
      log(`  ✗ download ${url} — ${e.message}`);
      return;
    }
    await fsp.writeFile(local, bytes);
    const { width, height } = imageSize(bytes);

    if (DO_UPLOAD) {
      const res = await r2Put(key, local, MIME[ext] || 'application/octet-stream');
      if (!res.ok) {
        map[url] = { key, width, height, bytes: bytes.length, verified: false, error: `upload: ${res.detail}` };
        log(`  ✗ upload ${key} — ${res.detail}`);
        return;
      }
    }

    let verified = false;
    if (DO_UPLOAD) {
      try {
        const r = await fetch(`${R2_PUBLIC}/${key}`);
        const got = Buffer.from(await r.arrayBuffer());
        verified = r.ok && got.length === bytes.length;
        if (!verified) log(`  ✗ verify ${key}: sent ${bytes.length}, got ${got.length} (HTTP ${r.status})`);
      } catch (e) {
        log(`  ✗ verify ${key}: ${e.message}`);
      }
    }

    map[url] = {
      key, r2: `${R2_PUBLIC}/${key}`, width, height,
      bytes: bytes.length, uploaded: DO_UPLOAD, verified,
    };
  });

  fs.writeFileSync(FILES.imageMap, JSON.stringify(map, null, 2));
  const entries = Object.entries(map);
  const ok = entries.filter(([, v]) => v.verified).length;
  const noDims = entries.filter(([, v]) => v.verified && !v.width).length;
  log(`\nimage map: ${ok}/${entries.length} verified | ${noDims} without readable dimensions`);
  const failed = entries.filter(([, v]) => !v.verified);
  if (failed.length) {
    log(`⚠️  ${failed.length} not verified:`);
    failed.slice(0, 15).forEach(([u, v]) => log(`    ${u}\n      ${v.error || 'unverified'}`));
  }
  log(`wrote ${FILES.imageMap}`);
}

/* ── frontmatter helpers ─────────────────────────────────────────────────── */
/*
  YAML values are not HTML. The body must keep `&lt;`/`&gt;` as entities (a literal `<` inside
  Markdown can open a tag), but a frontmatter string can hold the real character — and this
  project's copy rules require real Unicode in frontmatter, never entities.
*/
const yamlStr = (s) =>
  `'${String(s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/'/g, "''")}'`;

function resolveSeoTitle(raw, fallback, year) {
  const v = cleanText(raw || '');
  if (!v) return fallback;
  return v
    .replace(/%currentyear%/gi, String(year))
    .replace(/%year%/gi, String(year))
    .replace(/%title%/gi, fallback)
    .replace(/%sitename%/gi, 'LeelinePackage')
    .replace(/%sep%/gi, '|')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstParagraph(md) {
  for (const block of md.split(/\n{2,}/)) {
    if (/^[<#|]/.test(block.trim())) continue;
    const t = block.replace(/[*_`[\]()]/g, '').replace(/\s+/g, ' ').trim();
    if (t.length > 40) return t;
  }
  return '';
}

function trimTo(text, n) {
  const t = cleanText(text);
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  const at = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (at > n * 0.6) return cut.slice(0, at + 1);
  const sp = cut.lastIndexOf(' ');
  return `${cut.slice(0, sp > 0 ? sp : n).replace(/[,;:—–-]+$/, '')}…`;
}

/* ── phase: convert ──────────────────────────────────────────────────────── */
async function phaseConvert() {
  const { posts, attachments, alts } = parseWxr(fs.readFileSync(XML_PATH, 'utf8'));
  const map = JSON.parse(fs.readFileSync(FILES.imageMap, 'utf8'));
  await ensureDir(OUT_DIR);

  /* Every image URL the content references was collected during `scan`, including WordPress'
     resized copies, so a direct lookup covers all of them. A miss is a real problem and is
     reported rather than papered over. */
  const resolveImage = (src) => {
    const hit = map[sourceUrl(src)];
    return hit?.r2 ? { url: hit.r2, width: hit.width, height: hit.height } : null;
  };

  const year = new Date().getFullYear();
  const written = [];
  const problems = [];
  let sourceAssetsChecked = 0;
  let sourceAssetsLost = 0;

  for (const p of posts) {
    if (ONLY && !ONLY.includes(p.slug)) continue;

    const slugger = new GithubSlugger();
    const { markdown } = htmlToMarkdown(p.content, { resolveImage, slugger });
    const body = rewriteAssets(splitLongParagraphs(markdown, MAX_PARA), map);

    const thumbUrl = attachments.get(p.thumbnailId) || '';
    const featuredMeta = map[thumbUrl] || {};
    const featured = featuredMeta.r2 || '';
    if (!featured) problems.push(`${p.slug}: featured image unresolved (${thumbUrl || 'no _thumbnail_id'})`);

    const unresolved = [...body.matchAll(/<img\b[^>]*src="([^"]+)"/gi)]
      .map((m) => m[1])
      .filter((u) => !u.startsWith(R2_PUBLIC));
    if (unresolved.length) problems.push(`${p.slug}: ${unresolved.length} image(s) not on R2 -> ${unresolved.slice(0, 2).join(', ')}`);

    /*
      Every upload the post links to must still be linked afterwards. This is the check that
      catches a link being dropped rather than mistranslated — two downloadable-PDF links lived
      inside h2/h3 text and vanished when headings were reduced to plain text.
    */
    const sourceAssets = [...new Set(
      [...p.content.matchAll(/(?:href|src)="([^"]*\/wp-content\/uploads\/[^"]*)"/gi)].map((m) => sourceUrl(m[1])),
    )];
    const lostLinks = sourceAssets.filter((u) => !map[u]?.r2 || !body.includes(map[u].r2));
    if (lostLinks.length) {
      problems.push(`${p.slug}: ${lostLinks.length} source link(s) missing from the output -> ${lostLinks.map((u) => u.split('/').pop()).join(', ')}`);
    }
    sourceAssetsChecked += sourceAssets.length;
    sourceAssetsLost += lostLinks.length;

    const seoTitle = resolveSeoTitle(p.seoTitle, p.title, year);
    const description = trimTo(p.seoDescription || firstParagraph(body), 160);
    const featuredAlt = cleanText(alts.get(thumbUrl) || p.title);

    /*
      Built as a list joined with newlines, then closed with an explicit blank line. Joining a
      list that ends in an empty string (and filtering the empties out) is how the body ended up
      welded to the closing `---`, which stops Astro finding the frontmatter at all.
    */
    const frontmatter = [
      '---',
      `title: ${yamlStr(p.title)}`,
      `description: ${yamlStr(description)}`,
      `publishDate: ${(p.date || '').slice(0, 10)}`,
      `author: ${AUTHOR_ID}`,
      `category: ${yamlStr(p.categories[0] || '')}`,
      `featuredImage: ${yamlStr(featured)}`,
      `featuredImageAlt: ${yamlStr(featuredAlt)}`,
      ...(featuredMeta.width && featuredMeta.height
        ? [`featuredImageWidth: ${featuredMeta.width}`, `featuredImageHeight: ${featuredMeta.height}`]
        : []),
      `seoTitle: ${yamlStr(seoTitle)}`,
      ...(p.focusKeyword ? [`keywords: ${yamlStr(p.focusKeyword)}`] : []),
      `draft: ${p.status !== 'publish'}`,
      '---',
    ].join('\n');

    fs.writeFileSync(path.join(OUT_DIR, `${p.slug}.md`), `${frontmatter}\n\n${body.trim()}\n`);

    written.push({
      slug: p.slug,
      chars: body.length,
      images: (body.match(/<img\b/gi) || []).length,
      featured,
    });
  }

  const all = written.map((w) => fs.readFileSync(path.join(OUT_DIR, `${w.slug}.md`), 'utf8')).join('\n');
  /* Frontmatter strings must hold real Unicode, never HTML entities — see the copy rules in
     CLAUDE.md. And a closing `---` with anything after it on the same line means the body got
     welded to the delimiter and Astro will not find the frontmatter at all. */
  const frontBlocks = [...all.matchAll(/^---\n([\s\S]*?)\n---/gm)].map((m) => m[1]);
  const checks = {
    sourceAssetLinks: sourceAssetsChecked,
    sourceAssetLinksLost: sourceAssetsLost,
    entityRefsInFrontmatter: frontBlocks.join('\n').match(/&[a-z]+;/g)?.length ?? 0,
    /* An image without an intrinsic size shifts the layout as it loads. */
    featuredImageMissingDimensions: frontBlocks.filter((f) => !/^featuredImageWidth:/m.test(f)).length,
    frontmatterDelimiterNotOnOwnLine: (all.match(/^---[^\n]/gm) || []).length,
    gutenbergCommentsLeft: (all.match(/<!--\s*\/?wp:/g) || []).length,
    wpUploadUrlsLeft: (all.match(/wp-content\/uploads/g) || []).length,
    nonR2Images: (all.match(/<img\b[^>]*src="(?!https:\/\/img\.leelinepackage\.com)/gi) || []).length,
    imgsWithoutDims: (all.match(/<img\b(?![^>]*\bwidth=)[^>]*>/gi) || []).length,
    /*
      Markdown does not run inside a block-level HTML element, so any raw-HTML block the
      converter emits must contain HTML, not Markdown syntax. This is the check that would have
      caught `**bold**` and `[text](url)` rendering literally inside the pull-quotes.
      `<table>` is excluded: its markup is the source's own HTML and a cell may legitimately
      contain a literal `**` in its text, exactly as the live page shows it.
    */
    markdownSyntaxInsideRawHtml: (
      all
        .split(/\n{2,}/)
        .filter((b) => b.trim().startsWith('<') && !/^<table\b/i.test(b.trim()))
        .join('\n')
        .match(/\*\*|\]\(https?:/g) || []
    ).length,
    iframes: (all.match(/<iframe/gi) || []).length,
    tables: (all.match(/<table/gi) || []).length,
    tocNavs: (all.match(/<nav class="post-toc"/gi) || []).length,
    faqBlocks: (all.match(/<div class="post-faq">/gi) || []).length,
    ctas: (all.match(/class="post-cta"/gi) || []).length,
    notes: (all.match(/class="post-note"/gi) || []).length,
    quotes: (all.match(/class="post-quote"/gi) || []).length,
    figures: (all.match(/class="post-figure"/gi) || []).length,
    headings: (all.match(/^#{2,4} /gm) || []).length,
  };

  fs.writeFileSync(FILES.report, JSON.stringify({ posts: written.length, maxPara: MAX_PARA, checks, problems, written }, null, 2));
  log(`converted ${written.length} posts -> ${OUT_DIR}`);
  log('checks:', JSON.stringify(checks, null, 1));
  if (problems.length) {
    log(`\n⚠️  ${problems.length} problem(s):`);
    problems.slice(0, 25).forEach((x) => log('   ', x));
  }
  log(`wrote ${FILES.report}`);
}

/*
  Rewrites any remaining reference to a migrated asset — the downloadable PDF checklists are
  plain `<a href>` links, not `<img>`, so they never pass through the image resolver. A literal
  swap is enough here and catches the URL wherever it survived.
*/
function rewriteAssets(markdown, map) {
  let out = markdown;
  for (const [source, entry] of Object.entries(map)) {
    if (entry?.r2 && out.includes(source)) out = out.split(source).join(entry.r2);
  }
  return out;
}

/* ── phase: verify ───────────────────────────────────────────────────────── */async function phaseVerify() {
  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.md'));
  const list = ONLY ? files.filter((f) => ONLY.includes(f.replace(/\.md$/, ''))) : files;
  const srcs = new Set();
  let bad = 0;
  for (const f of list) {
    const md = fs.readFileSync(path.join(OUT_DIR, f), 'utf8');
    const issues = [];
    if (/<!--\s*\/?wp:/.test(md)) issues.push('gutenberg comment');
    if (/wp-content\/uploads/.test(md)) issues.push('wordpress upload url');
    if (!/^---\n[\s\S]*?\n---\n/.test(md)) issues.push('frontmatter');
    if (/<img\b(?![^>]*\bwidth=)/i.test(md)) issues.push('img without width');
    for (const m of md.matchAll(/<img\b[^>]*src="([^"]+)"/gi)) {
      if (!m[1].startsWith(R2_PUBLIC)) issues.push(`non-R2 img ${m[1]}`);
      srcs.add(m[1]);
    }
    if (issues.length) { bad++; log(`✗ ${f}: ${issues.slice(0, 4).join('; ')}`); }
  }
  log(`\n${list.length} files checked | ${bad} with issues | ${srcs.size} distinct inline image URLs`);
}

/* ── main ────────────────────────────────────────────────────────────────── */
async function main() {
  if (PHASE === 'scan') return phaseScan();
  if (PHASE === 'images') return phaseImages();
  if (PHASE === 'convert') return phaseConvert();
  if (PHASE === 'verify') return phaseVerify();
  if (PHASE === 'all') {
    await phaseScan();
    await phaseImages();
    return phaseConvert();
  }
  log(`unknown phase "${PHASE}" — use scan | images | convert | verify | all`);
}

// Only run when this file is the entry point, so other scripts can import the helpers.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
