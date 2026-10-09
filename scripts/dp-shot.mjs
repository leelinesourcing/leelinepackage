// Mobile banded screenshots via CDP: 390 px wide, prefers-reduced-motion forced so every
// [data-reveal] is already `in`, captureBeyondViewport for each vertical band.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9337;
const W = Number(process.argv[2] || 390);
const URL = process.argv[3] || 'http://127.0.0.1:4322/custom-vape-packaging/disposable-vape-packaging/';
const OUT = process.argv[4] || `${process.env.TEMP}/dp-m`;
const BAND = Number(process.argv[5] || 4300);

const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  `--user-data-dir=${process.env.TEMP}/prof-dpshot`, `--remote-debugging-port=${PORT}`, `--window-size=${W},844`, 'about:blank'], { stdio: 'ignore' });

async function targets() {
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json`); const l = await r.json(); const p = l.find((t) => t.type === 'page'); if (p) return p; } catch { /* wait */ }
    await sleep(250);
  }
  throw new Error('no cdp');
}
const page = await targets();
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pend = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
await new Promise((r) => ws.addEventListener('open', r));
const send = (m, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });

await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: 844, deviceScaleFactor: 1, mobile: W < 700 });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await send('Page.navigate', { url: URL });
await sleep(5500);

const ev = await send('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true });
const H = ev.result.result.value;
console.log('docH', H);
let band = 0;
for (let y = 0; y < H; y += BAND) {
  band += 1;
  const h = Math.min(BAND, H - y);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width: W, height: h, scale: 1 } });
  const file = `${OUT}-${band}.png`;
  fs.writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
  console.log('wrote', file, W, h);
}
ws.close(); chrome.kill();
