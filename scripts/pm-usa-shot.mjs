// Clip-screenshot of the disclosure + FAQ area on the article.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { writeFileSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9343;
const URL = process.argv[2] || 'http://127.0.0.1:4322/packaging-manufacturers-in-usa/';
const OUT = process.argv[3] || 'E:/AI/LeelinePackage/_images/pm-usa-faq.png';
const W = 1440, H = 900;

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  `--user-data-dir=${process.env.TEMP}/prof-pmshot`,
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
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: URL });
await sleep(6000);

const pos = await send('Runtime.evaluate', {
  expression: `(() => {
    const d = [...document.querySelectorAll('.post-prose p')].find((p) => p.textContent.startsWith('Disclosure:'));
    const f = document.querySelector('.post-faq');
    const top = d.getBoundingClientRect().top + scrollY - 60;
    const bottom = f.getBoundingClientRect().bottom + scrollY + 40;
    return { top: Math.round(top), height: Math.round(bottom - top), dw: Math.round(document.documentElement.clientWidth) };
  })()`,
  returnByValue: true,
});
const { top, height } = pos.result.result.value;
const shot = await send('Page.captureScreenshot', {
  format: 'png', captureBeyondViewport: true,
  clip: { x: 0, y: top, width: W, height, scale: 1 },
});
writeFileSync(OUT, Buffer.from(shot.result.data, 'base64'));
console.log('saved', OUT, W + 'x' + height);
ws.close();
chrome.kill();
process.exit(0);
