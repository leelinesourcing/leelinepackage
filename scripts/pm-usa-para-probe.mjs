// Paragraph line-count probe for a blog article: reports every .post-prose <p> whose rendered
// height exceeds four line boxes, using the real layout (line box = computed line-height).
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9341;
const URL = process.argv[2] || 'http://127.0.0.1:4322/packaging-manufacturers-in-usa/';
const W = Number(process.argv[3] || 1440);
const H = Number(process.argv[4] || 900);

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  `--user-data-dir=${process.env.TEMP}/prof-pm${W}`,
  `--remote-debugging-port=${PORT}`, `--window-size=${W},${H}`, 'about:blank',
], { stdio: 'ignore' });

async function targets() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json`);
      const list = await r.json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error('CDP not reachable');
}

const page = await targets();
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
await new Promise((res) => ws.addEventListener('open', res));
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 700 });
await send('Page.navigate', { url: URL });
await sleep(6000);

const expr = `(() => {
  const prose = document.querySelector('.post-prose');
  if (!prose) return { error: 'no .post-prose' };
  const out = [];
  let heading = '';
  prose.querySelectorAll('h2, h3, p').forEach((el) => {
    if (/^H[23]$/.test(el.tagName)) { heading = el.textContent.trim(); return; }
    if (!el.textContent.trim()) return;
    const cs = getComputedStyle(el);
    const lh = parseFloat(cs.lineHeight) || 32;
    const h = el.getBoundingClientRect().height;
    const lines = Math.round(h / lh);
    const inFaq = !!el.closest('.post-faq');
    const inNote = !!el.closest('.post-note');
    const inQuote = !!el.closest('.post-quote');
    out.push({
      lines, chars: el.textContent.replace(/\\s+/g, ' ').trim().length,
      width: Math.round(el.getBoundingClientRect().width),
      where: inFaq ? 'faq' : inNote ? 'note' : inQuote ? 'quote' : 'body',
      heading, text: el.textContent.replace(/\\s+/g, ' ').trim().slice(0, 90),
    });
  });
  const over = out.filter((p) => p.lines > 4);
  return { total: out.length, over4: over.length, maxLines: Math.max(...out.map((p) => p.lines)), paragraphs: out };
})()`;

const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
const v = r.result?.result?.value;
const ps = (v.paragraphs || []).sort((a, b) => b.lines - a.lines || b.chars - a.chars);
console.log(`total paragraphs: ${v.total}  over 4 lines: ${v.over4}  max lines: ${v.maxLines}`);
for (const p of ps) {
  if (p.lines < 4) continue;
  console.log(`${p.lines}L ${p.chars}c [${p.where}] ${p.heading.slice(0, 40)} :: ${p.text}`);
}
ws.close();
chrome.kill();
process.exit(0);
