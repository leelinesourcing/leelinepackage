import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { writeFileSync } from 'node:fs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9335;
const URL = process.argv[2];
const W = Number(process.argv[3] || 1440);
const H = Number(process.argv[4] || 900);
const OUT = process.argv[5] || null;
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',`--remote-debugging-port=${PORT}`,`--window-size=${W},${H}`,'about:blank'], { stdio: 'ignore' });
async function targets(){for(let i=0;i<40;i++){try{const r=await fetch(`http://127.0.0.1:${PORT}/json`);const l=await r.json();const p=l.find(t=>t.type==='page');if(p)return p;}catch{}await sleep(250);}throw new Error('no cdp');}
const page = await targets();
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id=0; const pending=new Map();
ws.addEventListener('message',e=>{const m=JSON.parse(e.data); if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}});
await new Promise(r=>ws.addEventListener('open',r));
const send=(method,params={})=>new Promise(r=>{const i=++id;pending.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:1,mobile:W<700});
await send('Page.navigate',{url:URL}); await sleep(3500);
// walk down the page so every reveal observer fires the way a human scroll would
await send('Runtime.evaluate',{expression:`(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}scrollTo(0,document.documentElement.scrollHeight);})()`,awaitPromise:true});
await sleep(2500);
const res = await send('Runtime.evaluate',{expression:`(()=>{const q=(s)=>[...document.querySelectorAll(s)].map(e=>({cls:e.className,txt:(e.textContent||'').trim().slice(0,40),op:getComputedStyle(e).opacity,vis:getComputedStyle(e).visibility}));return {hidden:q('[data-reveal]').filter(x=>x.op!=='1'), sub:q('.vp-final-sub'), cta:q('.vp-final .section-cta') , overflowX: document.documentElement.scrollWidth>document.documentElement.clientWidth};})()`,returnByValue:true});
console.log(JSON.stringify(res.result.value ?? res.result, null, 1));
if (OUT) {
  await send('Runtime.evaluate',{expression:`document.querySelector('.vp-final').scrollIntoView({block:'center'})`});
  await sleep(600);
  const shot = await send('Page.captureScreenshot',{format:'png'});
  writeFileSync(OUT, Buffer.from(shot.result.data,'base64'));
  console.log('shot ->', OUT);
}
ws.close(); chrome.kill();
