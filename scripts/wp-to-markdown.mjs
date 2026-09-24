/*
  wp-to-markdown — converts a WordPress Gutenberg post body into the "hybrid markdown" shape
  this site's blog collection expects.

  Hybrid = plain prose becomes Markdown; anything Markdown cannot express faithfully is emitted
  as raw HTML in place (tables, the table of contents, quote callouts, FAQ blocks, CTAs,
  embeds). Astro passes raw HTML inside a `.md` straight through, so both halves coexist.

  Two things here are load-bearing and easy to get wrong:

  1. HEADINGS ARE RENDERED IN TWO PASSES. Astro assigns each Markdown heading an `id` itself,
     using github-slugger, and the WordPress table of contents links to the ORIGINAL ids. So
     every TOC href has to be rewritten to Astro's slug. The TOC sits near the top of the
     article, above the headings it points at, so a single pass walks the TOC before any slug
     exists. Pass A registers every heading slug in document order (which is also what makes
     github-slugger's `-1`, `-2` duplicate suffixes line up), then pass B renders using that map.

  2. `GithubSlugger` MUST be the same implementation Astro uses. Verified against 15 tricky
     headings (punctuation, emoji, CJK, duplicates, `**bold**`): v2 matched all 15.

  Also: empty `<p></p>` runs are dropped (WordPress leaves them around embeds and they render
  as dead vertical space), images keep their real intrinsic size, and no `<a>` is emitted
  without `target="_blank"` — see the rehype pass in astro.config.mjs for Markdown links.
*/

const BLOCK_TAGS = [
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'table', 'figure', 'blockquote', 'div', 'nav', 'iframe', 'pre', 'hr',
];
const VOID_TAGS = new Set(['hr', 'br', 'img', 'input', 'meta', 'link', 'source']);

/* ── entities ────────────────────────────────────────────────────────────── */
/*
  Emits real Unicode rather than HTML entities, which is what this project's copy rules ask
  for. `&lt;`/`&gt;` are deliberately NOT decoded: a literal `<` inside Markdown text can start
  an HTML tag, while the entity always renders as the character.
*/
export function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
    .replace(/&nbsp;/g, '\u00A0')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“');
}
function safeChar(code) {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return '';
  try { return String.fromCodePoint(code); } catch { return ''; }
}

export function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, ''));
}

export function plainText(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

/* ── inline HTML → Markdown ──────────────────────────────────────────────── */
export function inline(html) {
  let s = html;
  s = s.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<br\s*\/?>/gi, '  \n');

  // these nest (a > strong > em), so iterate to a fixed point
  for (let n = 0; n < 6; n++) {
    const before = s;
    s = s.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, inner) => `**${inner}**`);
    s = s.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, inner) => `*${inner}*`);
    s = s.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, inner) => '`' + stripTags(inner) + '`');
    if (s === before) break;
  }

  s = s.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_, attrs, inner) => {
    const href = (attrs.match(/href="([^"]*)"/i) || [])[1];
    const text = inner.replace(/\s+/g, ' ').trim();
    if (!href || !text) return inner;
    const label = text.replace(/[[\]]/g, (c) => '\\' + c);
    return `[${label}](${href})`;
  });

  s = s.replace(/<\/?(span|small|u|mark|sub|sup|abbr|figure|figcaption)\b[^>]*>/gi, '');
  s = s.replace(/<img\b[^>]*>/gi, '');
  s = s.replace(/<[^>]+>/g, '');
  s = decodeEntities(s);
  return s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/*
  The same conversion, but producing HTML instead of Markdown.

  Anything the converter wraps in a raw HTML block — the pull-quote, the GenerateBlocks note,
  the inline CTA, the FAQ — is NOT processed as Markdown, because Markdown leaves the inside of
  a block-level HTML element alone. Emitting `**bold**` and `[text](url)` in there renders the
  asterisks and the brackets literally, which is exactly what happened on the first pass.
  So those contexts get real `<strong>`/`<em>`/`<a>` tags instead.

  Entities stay entities here (`&amp;`, `&lt;`, `&gt;` are all valid in HTML and re-decoding
  `&amp;` would leave a bare `&` in the output).
*/
export function inlineHtml(html) {
  let s = html;
  s = s.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<br\s*\/?>/gi, '<br />');

  for (let n = 0; n < 6; n++) {
    const before = s;
    s = s.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, inner) => `<strong>${inner}</strong>`);
    s = s.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, inner) => `<em>${inner}</em>`);
    s = s.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, inner) => `<code>${stripTags(inner)}</code>`);
    if (s === before) break;
  }

  s = s.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_, attrs, inner) => {
    const href = (attrs.match(/href="([^"]*)"/i) || [])[1];
    const label = inner.replace(/\s+/g, ' ').trim();
    if (!href || !label) return label;
    const extra = /^#/.test(href) ? '' : ' target="_blank" rel="noopener"';
    return `<a href="${href}"${extra}>${label}</a>`;
  });

  // keep the tags we mean to keep; drop every other element but not its text
  s = s.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (m, tag) =>
    ['strong', 'em', 'code', 'a', 'br'].includes(tag.toLowerCase()) ? m : '',
  );
  s = decodeHtmlEntities(s);
  return s.replace(/[ \t]+\n/g, '\n').replace(/\s{2,}/g, ' ').trim();
}

function decodeHtmlEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
    .replace(/&nbsp;/g, '\u00A0')
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“');
}

/* ── structural scanning ─────────────────────────────────────────────────── */
function findMatchingClose(html, start, tag) {
  const openRe = new RegExp(`<${tag}\\b`, 'gi');
  const closeRe = new RegExp(`</${tag}\\s*>`, 'gi');
  let depth = 0;
  let i = start;
  while (i < html.length) {
    openRe.lastIndex = i;
    closeRe.lastIndex = i;
    const o = openRe.exec(html);
    const c = closeRe.exec(html);
    if (!c) return -1;
    if (o && o.index < c.index) {
      depth++;
      i = o.index + o[0].length;
    } else {
      depth--;
      i = c.index + c[0].length;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export function splitBlocks(html) {
  const out = [];
  let i = 0;
  let text = '';
  const flushText = () => {
    if (text.trim()) out.push({ tag: '#text', html: text });
    text = '';
  };
  while (i < html.length) {
    if (html.startsWith('<!--', i)) {
      const e = html.indexOf('-->', i);
      i = e < 0 ? html.length : e + 3;
      continue;
    }
    if (html[i] === '<') {
      const m = /^<([a-zA-Z][a-zA-Z0-9]*)\b/.exec(html.slice(i));
      if (m) {
        const tag = m[1].toLowerCase();
        if (BLOCK_TAGS.includes(tag)) {
          if (VOID_TAGS.has(tag)) {
            const gt = html.indexOf('>', i);
            flushText();
            out.push({ tag, html: html.slice(i, gt + 1) });
            i = gt + 1;
            continue;
          }
          const end = findMatchingClose(html, i, tag);
          if (end > 0) {
            flushText();
            out.push({ tag, html: html.slice(i, end) });
            i = end;
            continue;
          }
        }
      }
    }
    text += html[i];
    i++;
  }
  flushText();
  return out;
}

/* Replaces a wrapper `<div class="…token…">…</div>` with its inner content. */
function unwrapDiv(html, token) {
  let guard = 0;
  let out = html;
  for (;;) {
    if (guard++ > 50) break;
    const m = new RegExp(`<div\\b[^>]*class="[^"]*\\b${token}\\b[^"]*"[^>]*>`, 'i').exec(out);
    if (!m) break;
    const end = findMatchingClose(out, m.index, 'div');
    if (end < 0) break;
    const inner = out.slice(m.index + m[0].length, end).replace(/<\/div>\s*$/, '');
    out = out.slice(0, m.index) + inner + out.slice(end);
  }
  return out;
}

/*
  Two shapes in the WordPress HTML stop the block scanner from seeing what it needs:
  the TOC arrives wrapped in a pointless `<div class="wp-block-rank-math-toc-block">`, and
  GenerateBlocks' CTA anchors sit at the top level with no wrapper at all (so they would be
  swallowed as inline text). Normalise both before scanning.
*/
function prepare(html) {
  // Block delimiters go first: `<!-- wp:… -->` would otherwise survive inside any raw-HTML
  // block, because the tag-stripping regexes match element tags, not comments.
  let h = html.replace(/<!--[\s\S]*?-->/g, '');
  h = unwrapDiv(h, 'wp-block-rank-math-toc-block');
  h = h.replace(
    /<a\b[^>]*class="[^"]*\bgb-button\b[^"]*"[\s\S]*?<\/a>/gi,
    (m) => `<div class="wp-block-gb-cta">${m}</div>`,
  );
  return h;
}

/* ── lists ───────────────────────────────────────────────────────────────── */
function listToMarkdown(html, ordered = false, depth = 0) {
  const body = html.replace(/^<(ul|ol)\b[^>]*>/i, '').replace(/<\/(ul|ol)>\s*$/i, '');
  const items = [];
  let i = 0;
  while (i < body.length) {
    const start = body.indexOf('<li', i);
    if (start < 0) break;
    const gt = body.indexOf('>', start);
    const end = findMatchingClose(body, start, 'li');
    if (end < 0) break;
    items.push(body.slice(gt + 1, end).replace(/<\/li>\s*$/, ''));
    i = end;
  }
  return items
    .map((raw, idx) => {
      const nested = [];
      const outer = raw.replace(/<(ul|ol)\b[^>]*>[\s\S]*?<\/\1>/gi, (m) => {
        nested.push(m);
        return '';
      });
      const marker = ordered ? `${idx + 1}. ` : '- ';
      const text = inline(outer).replace(/\n/g, ' ').trim();
      if (!text) return '';
      let line = '  '.repeat(depth) + marker + text;
      for (const n of nested) {
        line += '\n' + listToMarkdown(n, /^<ol/i.test(n), depth + 1);
      }
      return line;
    })
    .filter(Boolean)
    .join('\n');
}

/* ── tables ──────────────────────────────────────────────────────────────── */
/*
  Markup kept, WordPress palette classes dropped: the table's appearance is decided once in
  `src/styles/blog.css`, so every imported table looks the same on purpose.
*/
function tableToHtml(html) {
  return html
    .replace(/\s(?:class|style|data-[a-z-]+)="[^"]*"/gi, '')
    .replace(/<colgroup[\s\S]*?<\/colgroup>/gi, '')
    .replace(/<col\b[^>]*>/gi, '')
    /* `&nbsp;` becomes the real character — the source tables use it as trailing padding and
       this project's copy rules want Unicode rather than entities in the output. */
    .replace(/&nbsp;/g, '\u00A0')
    .replace(/>\s+</g, '><')
    .trim();
}

/* ── images ──────────────────────────────────────────────────────────────── */
function imageToHtml(figureHtml, resolveImage) {
  const img = figureHtml.match(/<img\b[^>]*>/i);
  if (!img) return '';
  const src = (img[0].match(/src="([^"]*)"/i) || [])[1] || '';
  const alt = decodeEntities((img[0].match(/alt="([^"]*)"/i) || [])[1] || '');
  const info = resolveImage(src);
  if (!info) return '';
  const dims = info.width && info.height ? ` width="${info.width}" height="${info.height}"` : '';
  const link = figureHtml.match(/<a\b[^>]*href="([^"]*)"[^>]*>\s*<img/i);
  const tag = `<img src="${info.url}" alt="${alt.replace(/"/g, '&quot;')}"${dims} loading="lazy" decoding="async" />`;
  if (link && link[1]) {
    const attrs = /^#/.test(link[1])
      ? `href="${link[1]}"`
      : `href="${link[1]}" target="_blank" rel="noopener"`;
    return `<figure class="post-figure"><a ${attrs}>${tag}</a></figure>`;
  }
  return `<figure class="post-figure">${tag}</figure>`;
}

/* ── embeds ──────────────────────────────────────────────────────────────── */
function embedToHtml(html) {
  const direct = html.match(/<iframe\b[^>]*src="([^"]*)"/i);
  let src = direct ? direct[1] : '';
  if (!src) {
    const bare = html.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    if (bare) src = `https://www.youtube.com/embed/${bare[1]}`;
  }
  if (!src) return '';
  src = src.replace(/youtube\.com\/watch\?v=/, 'youtube.com/embed/');
  return `<iframe class="post-embed" src="${src}" width="100%" height="480" frameborder="0" loading="lazy" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>`;
}

/*
  Headings are emitted as Markdown, but a link inside one has to survive — WordPress puts
  downloadable-PDF links inside h2/h3 text, and the earlier pass ran them through `plainText()`,
  which strips every tag and silently deleted two download links. Emphasis is dropped (article
  headings are already bold) while anchors are kept as real HTML.
*/
function headingInline(html) {
  return inlineHtml(html)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?(?:strong|em|code)\b[^>]*>/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/* ── TOC ─────────────────────────────────────────────────────────────────── */
function tocToHtml(navHtml, slugMap) {
  const inner = navHtml.replace(/^<nav\b[^>]*>/i, '').replace(/<\/nav>\s*$/i, '');
  const rewritten = inner.replace(/href="#([^"]*)"/gi, (full, id) => {
    const target = slugMap.get(id);
    return target ? `href="#${target}"` : full;
  });
  return `<nav class="post-toc">${rewritten.replace(/>\s+</g, '><')}</nav>`;
}

/* ── FAQ ─────────────────────────────────────────────────────────────────── */
/*
  Rank Math writes the anchor id onto each FAQ question at render time, so the exported HTML
  carries no id — but the table of contents links to it anyway. The ids survive in the block's
  JSON, so they are collected up front and handed back out in document order.

  Exported so `scripts/patch-faq-answers.mjs` can re-emit a single post's FAQ block without
  re-running the whole import (which is no longer possible — see that script's header).
*/
export function faqToHtml(divHtml, nextId) {
  const items = [...divHtml.matchAll(/<div class="rank-math-faq-item">([\s\S]*?)<\/div>\s*(?=<div class="rank-math-faq-item">|<\/div>)/g)];
  const blocks = items.map((m) => m[1]).map((raw) => {
    const q = (raw.match(/<h3[^>]*class="rank-math-question"[^>]*>([\s\S]*?)<\/h3>/i) || [])[1] || '';
    /*
      ⚠️⚠️ The item pattern above consumes the ANSWER's own `</div>` as its closing boundary: its
      lazy `([\s\S]*?)<\/div>` stops at the FIRST `</div>`, which closes `.rank-math-answer`, not
      `.rank-math-faq-item`. So `raw` ends in the middle of the answer with no closing tag — and the
      old `…class="rank-math-answer"[^>]*>([\s\S]*?)<\/div>` therefore matched NOTHING. That is why
      all 143 FAQ answers in the collection were silently dropped at import and every FAQ block
      rendered as a bare list of questions.

      Read the answer to the end of the item instead, and drop a trailing `</div>` only if one did
      survive (a differently-shaped item would leave it). `scripts/patch-faq-answers.mjs` re-emits
      the affected blocks; this fix keeps a future full import correct.
    */
    const a = (raw.match(/<div[^>]*class="rank-math-answer"[^>]*>([\s\S]*)/i) || [])[1] || '';
    const answer = a.replace(/<\/div>\s*$/i, '');
    const paras = answer
      .split(/<br\s*\/?>\s*<br\s*\/?>/i)
      .map((p) => inlineHtml(p))
      .filter(Boolean)
      .map((p) => `<p>${p}</p>`)
      .join('');
    if (!q) return '';
    const id = nextId();
    const attr = id ? ` id="${id}"` : '';
    return `<div class="post-faq-item"><h3 class="post-faq-q"${attr}>${inlineHtml(q)}</h3>${paras}</div>`;
  }).filter(Boolean);
  return blocks.length ? `<div class="post-faq">${blocks.join('')}</div>` : '';
}

/* ── cover ───────────────────────────────────────────────────────────────── */
function coverToHtml(divHtml, resolveImage) {
  const parts = [];
  const img = divHtml.match(/<img\b[^>]*>/i);
  if (img) {
    const f = imageToHtml(`<figure>${img[0]}</figure>`, resolveImage);
    if (f) parts.push(f);
  }
  const innerText = (divHtml.match(/wp-block-cover__inner-container[^>]*>([\s\S]*)<\/div>\s*<\/div>\s*$/i) || [])[1] || '';
  const t = inlineHtml(innerText);
  if (t) parts.push(`<p class="post-cover-caption">${t}</p>`);
  return parts.join('\n\n');
}

/* ── main ────────────────────────────────────────────────────────────────── */
export function htmlToMarkdown(html, { resolveImage, slugger }) {
  const blocks = splitBlocks(prepare(html));

  /* FAQ anchors live only in the block JSON — see faqToHtml(). */
  const faqIdQueue = [...html.matchAll(/"id":\s*"(faq-question-[A-Za-z0-9-]+)"/g)].map((m) => m[1]);
  const nextFaqId = () => faqIdQueue.shift() || '';

  /* Pass A — register every heading slug in document order. */
  const headingSlug = new Map();   // block index -> slug
  const slugMap = new Map();       // WordPress heading id -> Astro slug
  blocks.forEach((b, i) => {
    if (!/^h[1-6]$/.test(b.tag)) return;
    const text = plainText(b.html.replace(/^<h[1-6][^>]*>/i, '').replace(/<\/h[1-6]>\s*$/i, ''));
    if (!text) return;
    const slug = slugger.slug(text);
    headingSlug.set(i, slug);
    const wpId = (b.html.match(/\bid="([^"]*)"/i) || [])[1];
    if (wpId) slugMap.set(wpId, slug);
  });

  /* Pass B — render. */
  const out = [];
  blocks.forEach((b, index) => {
    const h = b.html;
    const push = (v) => { if (v && String(v).trim()) out.push(String(v)); };

    if (b.tag === '#text') return push(inline(h));

    if (/^h[1-6]$/.test(b.tag)) {
      const level = Math.min(Math.max(Number(b.tag[1]), 2), 4);
      const inner = h.replace(/^<h[1-6][^>]*>/i, '').replace(/<\/h[1-6]>\s*$/i, '');
      if (!plainText(inner)) return;
      return push(`${'#'.repeat(level)} ${headingInline(inner)}`);
    }

    if (b.tag === 'p') {
      const cls = (h.match(/\bclass="([^"]*)"/i) || [])[1] || '';
      const inner = h.replace(/^<p\b[^>]*>/i, '').replace(/<\/p>\s*$/i, '');
      if (/\bgb-headline\b/.test(cls)) {
        // GenerateBlocks notes are icon + text. Emitted as a div wrapping a <p> so the length
        // splitter can break a long note into several paragraphs inside the same callout.
        const icon = (inner.match(/<svg[\s\S]*?<\/svg>/i) || [''])[0];
        const note = inlineHtml(inner);
        if (note) push(`<div class="post-note">${icon}<p>${note}</p></div>`);
        return;
      }
      return push(inline(inner));   // empty paragraphs produce '' and are dropped
    }

    if (b.tag === 'ul' || b.tag === 'ol') return push(listToMarkdown(h, b.tag === 'ol'));

    if (b.tag === 'table') return push(tableToHtml(h));

    if (b.tag === 'nav') return push(tocToHtml(h, slugMap));

    if (b.tag === 'blockquote') {
      const inner = h.replace(/^<blockquote\b[^>]*>/i, '').replace(/<\/blockquote>\s*$/i, '');
      const parts = splitBlocks(inner)
        .map((x) => inlineHtml(x.html.replace(/^<p\b[^>]*>/i, '').replace(/<\/p>\s*$/i, '')))
        .filter(Boolean);
      return push(parts.length ? `<blockquote class="post-quote">${parts.map((p) => `<p>${p}</p>`).join('')}</blockquote>` : '');
    }

    if (b.tag === 'figure') {
      if (/\bwp-block-embed\b|is-type-video/i.test(h) || /<iframe/i.test(h)) return push(embedToHtml(h));
      if (/wp-block-table/i.test(h)) {
        const t = h.match(/<table\b[\s\S]*<\/table>/i);
        return push(t ? tableToHtml(t[0]) : '');
      }
      return push(imageToHtml(h, resolveImage));
    }

    if (b.tag === 'iframe') return push(embedToHtml(h));
    if (b.tag === 'hr') return push('---');

    if (b.tag === 'div') {
      if (/rank-math-faq-block/.test(h)) return push(faqToHtml(h, nextFaqId));
      if (/wp-block-cover/.test(h)) return push(coverToHtml(h, resolveImage));
      if (/wp-block-gb-cta/.test(h)) {
        const a = h.match(/<a\b([^>]*)>([\s\S]*)<\/a>/i);
        if (!a) return;
        const href = (a[1].match(/href="([^"]*)"/i) || [])[1] || '';
        const label = inlineHtml((a[2].match(/<span[^>]*gb-button-text[^>]*>([\s\S]*?)<\/span>/i) || [])[1] || a[2]);
        if (!label) return;
        const attrs = /^#/.test(href) ? `href="${href}"` : `href="${href}" target="_blank" rel="noopener"`;
        return push(`<p class="post-cta-row"><a class="post-cta" ${attrs}>${label}</a></p>`);
      }
      // a container that survived `prepare()` — render its insides inline
      const nested = htmlToMarkdown(h.replace(/^<div\b[^>]*>/i, '').replace(/<\/div>\s*$/i, ''), {
        resolveImage, slugger,
      });
      return push(nested.markdown);
    }

    return push(inline(h));
  });

  return {
    markdown: out.join('\n\n').replace(/\n{3,}/g, '\n\n').trim(),
    slugMap,
  };
}

/* ── paragraph length ────────────────────────────────────────────────────── */
/*
  The brief: no rendered paragraph may run past four lines. The column is fixed (48rem at
  1.125rem — see `src/styles/blog.css`), so the length is controlled in the text rather than by
  widening the measure. Splitting only touches blocks that are actually prose, so headings,
  tables, lists, quotes and raw HTML are never altered.

  `maxChars` is CALIBRATED, not guessed. Measured in headless Chrome against the built pages
  (`scripts/blog-convert-preview.mjs` prints the same numbers): the column is 768px at 18px with
  a 32.04px line box, and real paragraphs average 74–79 characters per line — so four lines is
  roughly 304 characters. 290 leaves headroom for the ragged last line of the following chunk.

  Splitting uses String.split with lookaround rather than match(), because a match() pattern
  silently drops any tail it fails to capture — which is exactly how the first attempt ended up
  leaving 15% of paragraphs over length: the loss check tripped and the whole paragraph was
  kept. split() cannot lose text.
*/
const NOT_PROSE = /^(<|#|\||>)/;
const IS_LIST = /^([-*+]|\d+\.)\s/;
const HAS_HTML = /<[a-z/]/i;

/*
  Length is measured on what will RENDER, not on the Markdown source. Several source paragraphs
  carry 600+ character tracking URLs behind a three-word link label; counting the raw source made
  them look like nine-line paragraphs and would have split perfectly short sentences.
*/
const renderLen = (md) =>
  md
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*`]/g, '')
    .length;

function splitBlock(text, maxChars) {
  if (renderLen(text) <= maxChars) return [text];

  /*
    Shield HTML tags with a sentinel before looking for sentence ends. Without this a sentence
    break inside a link label (…read this. Another… inside <a>) would cut the tag in half.
    The sentinel contains no `.`/`!`/`?`/space, so it can never host a split, and lengths are
    measured on the restored text.
  */
  const tags = [];
  const shielded = text.replace(/<[^>]+>/g, (m) => {
    tags.push(m);
    return `\u0001${tags.length - 1}\u0002`;
  });
  const restore = (s) => s.replace(/\u0001(\d+)\u0002/g, (_, i) => tags[Number(i)]);

  const sentences = shielded
    /*
      Two split points. The first is the normal one (punctuation, whitespace, capital). The
      second catches a sentence whose author forgot the space after the period — WordPress has
      a few (`…sustainable options.To manage costs…`), and without it that paragraph cannot be
      broken at all. Requiring a lowercase letter immediately before the stop keeps `U.S.A`
      and `3.5` intact.
    */
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])|(?<=[a-z][.!?])(?=[A-Z])/)
    .map(restore);
  if (sentences.length < 2) return [text];

  const chunks = [];
  let current = '';
  for (const s of sentences) {
    if (current && renderLen(`${current} ${s}`) > maxChars) {
      chunks.push(current);
      current = s;
    } else {
      current = current ? `${current} ${s}` : s;
    }
  }
  if (current) chunks.push(current);

  /*
    The invariant the split must preserve is that no non-whitespace character is lost. Comparing
    on collapsed whitespace would fail here: re-joining inserts the space the source was missing.
  */
  const squash = (x) => x.replace(/\s+/g, '');
  if (squash(chunks.join('')) !== squash(text)) return [text];
  return chunks;
}

/* The `<p>` blocks inside a pull-quote or callout, each independently length-split. */
function splitInnerParagraphs(innerHtml, maxChars) {
  const bodies = [...innerHtml.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
  if (!bodies.length) return null;
  return bodies
    .flatMap((b) => splitBlock(b.trim(), maxChars))
    .filter(Boolean)
    .map((b) => `<p>${b}</p>`)
    .join('');
}

const NOTE_BLOCK = /^<div class="post-note">([\s\S]*)<\/div>$/;
const QUOTE_BLOCK = /^<blockquote class="post-quote">([\s\S]*)<\/blockquote>$/;

export function splitLongParagraphs(markdown, maxChars = 290) {
  return markdown
    .split(/\n{2,}/)
    .map((para) => {
      const t = para.trim();
      if (!t) return para;

      /*
        Callouts and pull-quotes are raw HTML, so the generic prose path skips them — but they
        hold real body copy and were the only blocks still running past four lines. Their inner
        paragraphs are length-split here, keeping the icon and the container.
      */
      if (NOTE_BLOCK.test(t)) {
        const inner = NOTE_BLOCK.exec(t)[1];
        const icon = (inner.match(/<svg[\s\S]*?<\/svg>/i) || [''])[0];
        const split = splitInnerParagraphs(inner.replace(/<svg[\s\S]*?<\/svg>/i, ''), maxChars);
        return split ? `<div class="post-note">${icon}${split}</div>` : para;
      }
      if (QUOTE_BLOCK.test(t)) {
        const split = splitInnerParagraphs(QUOTE_BLOCK.exec(t)[1], maxChars);
        return split ? `<blockquote class="post-quote">${split}</blockquote>` : para;
      }

      if (NOT_PROSE.test(t) || IS_LIST.test(t) || HAS_HTML.test(t)) return para;
      // A soft hard-break inside a paragraph (WordPress `<br>`) is a paragraph break in spirit,
      // so measure and split each side independently rather than skipping the whole block.
      const parts = t.split(/\n+/).map((x) => x.trim()).filter(Boolean);
      return parts.flatMap((p) => splitBlock(p, maxChars)).join('\n\n');
    })
    .join('\n\n');
}
