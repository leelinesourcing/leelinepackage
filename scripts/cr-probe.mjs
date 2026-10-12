// CDP harness for the child-resistant vape page: doc geometry, overflow, section padding,
// nav clearance, placeholder aspects, rail/stop geometry, and a body-copy word census.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9338;
const URL = process.argv[2] || 'http://127.0.0.1:4322/custom-vape-packaging/child-resistant-vape-packaging/';
const W = Number(process.argv[3] || 1440);
const H = Number(process.argv[4] || 900);

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  `--user-data-dir=${process.env.TEMP}/prof-cr${W}`,
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
await sleep(5000);

const expr = `(() => {
  const de = document.documentElement;
  const nav = document.querySelector('.site-nav');
  const first = document.querySelector('main > section');
  const out = {
    width: ${W}, docH: de.scrollHeight, scrollW: de.scrollWidth, clientW: de.clientWidth,
    overflowX: de.scrollWidth > de.clientWidth,
    navH: nav ? Math.round(nav.getBoundingClientRect().height) : null,
    firstTop: first ? Math.round(first.getBoundingClientRect().top + scrollY) : null,
    firstPadTop: first ? getComputedStyle(first).paddingTop : null,
    sections: [...document.querySelectorAll('main > section')].map((s) => ({
      cls: s.className.split(' ')[0], top: Math.round(s.getBoundingClientRect().top + scrollY),
      h: Math.round(s.getBoundingClientRect().height),
      padTop: getComputedStyle(s).paddingTop, padBot: getComputedStyle(s).paddingBottom,
      bg: getComputedStyle(s).backgroundColor,
    })),
    wide: [],
  };
  if (out.overflowX) {
    const clipped = (el) => {
      let p = el.parentElement;
      while (p && p !== document.documentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === 'auto' || ox === 'hidden' || ox === 'scroll' || ox === 'clip') return true;
        p = p.parentElement;
      }
      return false;
    };
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      const pos = getComputedStyle(el).position;
      if (r.right > de.clientWidth + 1 && r.width > 4 && pos !== 'fixed' && !clipped(el)) {
        out.wide.push({ tag: el.tagName, cls: String(el.className).slice(0, 60), right: Math.round(r.right), w: Math.round(r.width) });
      }
    });
    out.wide = out.wide.slice(0, 12);
  }
  // placeholder slot aspects
  out.ph = {};
  for (const s of ['.cr-hero-ph', '.cr-lock-ph']) {
    const el = document.querySelector(s);
    if (!el) { out.ph[s] = 'missing'; continue; }
    const r = el.getBoundingClientRect();
    out.ph[s] = { w: Math.round(r.width), h: Math.round(r.height), ar: getComputedStyle(el).aspectRatio };
  }
  // rail geometry: are the two rows separated, is the stop chip laid out?
  out.rail = [...document.querySelectorAll('.cr-rail')].map((ol) => ({
    li: ol.children.length,
    liH: [...ol.children].map((li) => Math.round(li.getBoundingClientRect().height)),
    stopChip: !!ol.querySelector('.cr-rail-stop'),
  }));
  // heading weights/sizes
  out.h = {};
  for (const s of ['.cr-hero-title', '.cr-locks-title', '.cr-report .section-title', '.cr-final-title']) {
    const el = document.querySelector(s);
    if (!el) { out.h[s] = 'missing'; continue; }
    const cs = getComputedStyle(el);
    out.h[s] = { fs: cs.fontSize, fw: cs.fontWeight, lines: Math.round(el.getBoundingClientRect().height / parseFloat(cs.lineHeight || cs.fontSize)) };
  }
  // word census over main text
  const txt = document.querySelector('main').innerText.toLowerCase().replace(/[^a-z0-9\\s']/g, ' ').split(/\\s+/).filter(Boolean);
  const cnt = {};
  for (const w of ['we','our','you','your','every','so','one','a','the']) cnt[w] = txt.filter((x) => x === w).length;
  out.words = cnt; out.totalWords = txt.length;
  return out;
})()`;
const evalRes = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
const payload = evalRes.result?.result ?? evalRes.result;
if (payload?.exceptionDetails) console.error('EXC', JSON.stringify(payload.exceptionDetails).slice(0, 600));
console.log(JSON.stringify(payload?.value ?? payload, null, 1));
ws.close();
chrome.kill();
