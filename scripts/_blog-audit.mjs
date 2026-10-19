import fs from 'node:fs';
import path from 'node:path';

const DIR = 'E:/AI/LeelinePackage/src/content/blog';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md'));

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { fm: {}, body: raw };
  const fmText = m[1];
  const body = raw.slice(m[0].length);
  const fm = {};
  // simple line-based yaml parse (single-level)
  for (const line of fmText.split(/\r?\n/)) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (mm) {
      let val = mm[2].trim();
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      fm[mm[1]] = val;
    }
  }
  return { fm, body };
}

function stripToText(body) {
  let t = body;
  t = t.replace(/<[^>]+>/g, ' ');            // html tags
  t = t.replace(/```[\s\S]*?```/g, ' ');     // code fences
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ' '); // images
  t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1'); // links -> label
  t = t.replace(/[#>*_`~|-]/g, ' ');
  return t;
}

function countWords(t) {
  const words = t.split(/\s+/).filter(w => /[a-zA-Z0-9]/.test(w));
  return words.length;
}

const posts = [];
for (const file of files) {
  const raw = fs.readFileSync(path.join(DIR, file), 'utf8');
  const { fm, body } = parseFrontmatter(raw);
  const slug = file.replace(/\.md$/, '');
  const text = stripToText(body);
  const words = countWords(text);

  const title = fm.title || '';
  const seoTitle = fm.seoTitle || '';
  const description = fm.description || '';
  const keywords = fm.keywords || '';
  const category = fm.category || '';
  const publishDate = fm.publishDate || '';

  const imgMatches = body.match(/<img\b[^>]*>/g) || [];
  const imgCount = imgMatches.length;
  const hasFeatured = !!fm.featuredImage;

  // links
  const linkMatches = [...body.matchAll(/\[([^\]]*)\]\((https?:[^)]+)\)/g)];
  const htmlLinkMatches = [...body.matchAll(/<a\b[^>]*href="(https?:[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  let internal = 0, external = 0;
  const internalUrls = new Set();
  const externalUrls = new Set();
  const allHrefs = [];
  for (const lm of linkMatches) allHrefs.push(lm[2]);
  for (const lm of htmlLinkMatches) allHrefs.push(lm[1]);
  for (const href of allHrefs) {
    if (/leelinepackage\.com/.test(href)) { internal++; internalUrls.add(href); }
    else if (/^https?:/.test(href)) { external++; externalUrls.add(href); }
  }

  const hasFaq = /class="post-faq"/.test(body);
  const faqCount = (body.match(/post-faq-q/g) || []).length;
  const hasVideo = /post-embed|youtube\.com\/embed/.test(body);
  const hasTable = /<table/.test(body);
  const hasToc = /class="post-toc"/.test(body);
  const hasQuote = /class="post-quote"/.test(body);

  posts.push({
    slug, url: `https://www.leelinepackage.com/${slug}/`,
    title, seoTitle, titleLen: title.length, seoTitleLen: seoTitle.length,
    descLen: description.length,
    desc: description,
    keywords, category, publishDate,
    year: publishDate.slice(0,4),
    words, imgCount, hasFeatured,
    internalLinks: internal, internalUnique: internalUrls.size,
    externalLinks: external, externalUnique: externalUrls.size,
    internalUrls: [...internalUrls],
    hasFaq, faqCount, hasVideo, hasTable, hasToc, hasQuote,
  });
}

fs.writeFileSync('E:/AI/LeelinePackage/scripts/_blog-audit.json', JSON.stringify(posts, null, 2));

// summary stats
const n = posts.length;
const avg = a => (a.reduce((x,y)=>x+y,0)/a.length).toFixed(1);
console.log('TOTAL POSTS:', n);
console.log('avg words:', avg(posts.map(p=>p.words)));
console.log('min words:', Math.min(...posts.map(p=>p.words)), 'max:', Math.max(...posts.map(p=>p.words)));
console.log('words < 900:', posts.filter(p=>p.words<900).length);
console.log('words < 1200:', posts.filter(p=>p.words<1200).length);
console.log('no keywords:', posts.filter(p=>!p.keywords).length);
console.log('desc len off (not 150-160):', posts.filter(p=>p.descLen<150||p.descLen>160).length);
console.log('desc < 120:', posts.filter(p=>p.descLen<120).length, ' desc > 160:', posts.filter(p=>p.descLen>160).length);
console.log('seoTitle len off (not 55-60):', posts.filter(p=>p.seoTitleLen<55||p.seoTitleLen>60).length);
console.log('seoTitle > 60:', posts.filter(p=>p.seoTitleLen>60).length, 'seoTitle=0:', posts.filter(p=>p.seoTitleLen===0).length);
console.log('no internal links:', posts.filter(p=>p.internalLinks===0).length);
console.log('internal links <=1:', posts.filter(p=>p.internalLinks<=1).length);
console.log('no faq:', posts.filter(p=>!p.hasFaq).length);
console.log('no video:', posts.filter(p=>!p.hasVideo).length);
console.log('no table:', posts.filter(p=>!p.hasTable).length);
console.log('imgCount 0:', posts.filter(p=>p.imgCount===0).length, ' imgCount <=2:', posts.filter(p=>p.imgCount<=2).length);
console.log('categories:', JSON.stringify(posts.reduce((a,p)=>{a[p.category]=(a[p.category]||0)+1;return a;},{}), null, 0));
console.log('years:', JSON.stringify(posts.reduce((a,p)=>{const y=p.year||'?';a[y]=(a[y]||0)+1;return a;},{})));
