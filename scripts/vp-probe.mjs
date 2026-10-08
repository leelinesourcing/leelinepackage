// Minimal CDP harness: measures document height, horizontal overflow, and per-section
// geometry on both a desktop and a mobile viewport. No dependencies — Node's global
// WebSocket (Node 22+) talks to a chrome.exe launched with --remote-debugging-port.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;
const URL = process.argv[2] || 'http://localhost:4321/custom-vape-packaging/';
const W = Number(process.argv[3] || 1440);
const H = Number(process.argv[4] || 900);

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
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
await sleep(4500);

const expr = `(() => {
  const de = document.documentElement;
  const out = { width: ${W}, docH: de.scrollHeight, scrollW: de.scrollWidth, clientW: de.clientWidth };
  out.overflowX = de.scrollWidth > de.clientWidth;
  const secs = [...document.querySelectorAll('main > section, main .wrap')].slice(0, 40);
  out.sections = [...document.querySelectorAll('section')].map((s) => {
    const r = s.getBoundingClientRect();
    return { cls: s.className, top: Math.round(r.top + scrollY), h: Math.round(r.height),
             padTop: getComputedStyle(s).paddingTop, padBot: getComputedStyle(s).paddingBottom };
  });
  // widest offending elements if we overflow
  out.wide = [];
  if (out.overflowX) {
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > de.clientWidth + 1 && r.width > 40 && getComputedStyle(el).position !== 'fixed') {
        out.wide.push({ tag: el.tagName, cls: String(el.className).slice(0, 60), right: Math.round(r.right), w: Math.round(r.width) });
      }
    });
    out.wide = out.wide.slice(0, 12);
  }
  out.boxes = {};
  for (const s of ['.vp-mat-ph', '.vp-shelf-ph', '.vp-hero-tile', '.vp-cmp-rail', '.vp-type-card']) {
    const el = document.querySelector(s);
    if (!el) { out.boxes[s] = 'missing'; continue; }
    const r = el.getBoundingClientRect();
    out.boxes[s] = { w: Math.round(r.width), h: Math.round(r.height), ar: getComputedStyle(el).aspectRatio };
  }
  return out;
})()`;
const evalRes = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
if (evalRes.result?.exceptionDetails) console.error('EXC', JSON.stringify(evalRes.result.exceptionDetails).slice(0, 600));
const result = evalRes.result;
console.log(JSON.stringify(result.value ?? result, null, 1));
ws.close();
chrome.kill();
