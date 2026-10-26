/*
  THROWAWAY PREVIEW — 90-second assembly, isometric counter unit.
  Shared by _preview-90s-assembly.html (live) and _preview-90s-frames.html (WebP frames).
  Everything is driven by setTime(ms) so the live loop and the rendered frames match exactly.
  Delete this file with the preview pages.
*/

export const STEPS = [
  { t: 15, name: 'Tray formed',    note: 'One die-cut blank, tabs dry-fit' },
  { t: 35, name: 'Lower tier in',  note: 'Slot-and-tab, seats in one push' },
  { t: 55, name: 'Upper tier in',  note: 'Locks over the lower tier' },
  { t: 75, name: 'Stock loaded',   note: 'Placed from the front, no re-packing' },
  { t: 90, name: 'Header up',      note: 'The unit is on the counter' },
];

export const END = 8600;    // ms at which the 90 s mark is reached
export const LOOP = 10300;  // + hold before restarting
const DUR = 1300;           // per-part tween — long enough that the build reads as continuous
const STEP_MS = STEPS.map((s) => Math.max(0, (s.t / 90) * END - DUR)); // each tween LANDS on its tick

const NS = 'http://www.w3.org/2000/svg';

/* ── geometry ─────────────────────────────────────────────────────────── */
const A = 160, B = 100;      // footprint, drawing units
const HB = 96;               // tall back wall
const HF = 18;               // rim on the other three sides
const T = 2.6;               // board thickness
const HDR = 34;              // header panel
const C30 = Math.cos(Math.PI / 6), SY = 0.5;
const OX = 104, OY = 146;

const P = (a, b, c = 0) => [OX + (a - b) * C30, OY + (a + b) * SY - c];
const f1 = (n) => n.toFixed(1);
const pts = (arr) => arr.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ');

export function buildUnit(svg) {
  svg.setAttribute('viewBox', '0 0 260 292');
  const parts = [];

  const add = (node, step, delay, from) => {
    svg.appendChild(node);
    parts.push({ node, step, delay, from });
    return node;
  };

  const poly = (arr, cls, step, delay = 0, from = 14) => {
    const n = document.createElementNS(NS, 'polygon');
    n.setAttribute('points', pts(arr));
    n.setAttribute('class', `asm-p ${cls}`);
    add(n, step, delay, from);
    return n;
  };

  const line = (x1, y1, x2, y2, cls) => {
    const n = document.createElementNS(NS, 'line');
    n.setAttribute('x1', f1(x1)); n.setAttribute('y1', f1(y1));
    n.setAttribute('x2', f1(x2)); n.setAttribute('y2', f1(y2));
    n.setAttribute('class', cls);
    svg.appendChild(n);
    return n;
  };

  const box = (a0, b0, c0, w, d, h, step, delay) => {
    // near corner is (a0+w, b0+d) — those are the two visible faces
    poly([P(a0, b0, c0 + h), P(a0 + w, b0, c0 + h), P(a0 + w, b0 + d, c0 + h), P(a0, b0 + d, c0 + h)],
      'asm-pack-top', step, delay, -9);
    poly([P(a0 + w, b0, c0), P(a0 + w, b0 + d, c0), P(a0 + w, b0 + d, c0 + h), P(a0 + w, b0, c0 + h)],
      'asm-pack-a', step, delay + 70, -9);
    poly([P(a0, b0 + d, c0), P(a0 + w, b0 + d, c0), P(a0 + w, b0 + d, c0 + h), P(a0, b0 + d, c0 + h)],
      'asm-pack-b', step, delay + 130, -9);
  };

  /* ground — always on */
  line(24, 276, 236, 276, 'asm-ground');

  /* ── STEP 1 · the tray ────────────────────────────────────────────── */
  const S1 = 1;
  poly([P(0, 0, 0), P(A, 0, 0), P(A, B, 0), P(0, B, 0)], 'asm-floor', S1, 0, 16);

  // tall back wall, inner face
  poly([P(0, 0, 0), P(A, 0, 0), P(A, 0, HB), P(0, 0, HB)], 'asm-back', S1, 70, 16);
  poly([P(0, 0, HB), P(A, 0, HB), P(A, T, HB), P(0, T, HB)], 'asm-edge', S1, 70, 16);
  // side wall running back to front, inner face
  poly([P(0, 0, 0), P(0, B, 0), P(0, B, HF), P(0, 0, HB)], 'asm-wall', S1, 130, 16);
  poly([P(0, 0, HB), P(0, B, HF), P(T, B, HF), P(T, 0, HB)], 'asm-edge', S1, 130, 16);

  /* ── STEP 2 · lower (front) tier ──────────────────────────────────── */
  const S2 = 2;
  poly([P(10, 52, 28), P(150, 52, 28), P(150, 92, 28), P(10, 92, 28)], 'asm-tier', S2, 0, -16);
  poly([P(10, 92, 28), P(150, 92, 28), P(150, 92, 28 - T), P(10, 92, 28 - T)], 'asm-riser', S2, 0, -16);

  /* ── STEP 3 · upper (back) tier + riser ───────────────────────────── */
  const S3 = 3;
  poly([P(10, 8, 52), P(150, 8, 52), P(150, 52, 52), P(10, 52, 52)], 'asm-tier', S3, 0, -16);
  poly([P(10, 52, 52), P(150, 52, 52), P(150, 52, 28), P(10, 52, 28)], 'asm-riser', S3, 0, -16);

  /* ── STEP 4 · stock ───────────────────────────────────────────────── */
  const S4 = 4;
  [22, 27, 20].forEach((h, i) => box([18, 64, 110][i], 12, 52, 36, 34, h, S4, i * 100));
  [25, 20, 27].forEach((h, i) => box([18, 64, 110][i], 56, 28, 36, 34, h, S4, 320 + i * 100));

  /* ── near walls, painted last so they occlude the shelves ─────────── */
  poly([P(A, 0, 0), P(A, B, 0), P(A, B, HF), P(A, 0, HB)], 'asm-near', S1, 190, 16);
  poly([P(A, 0, HB), P(A, B, HF), P(A - T, B, HF), P(A - T, 0, HB)], 'asm-edge', S1, 190, 16);
  poly([P(0, B, 0), P(A, B, 0), P(A, B, HF), P(0, B, HF)], 'asm-near', S1, 240, 16);
  poly([P(0, B, HF), P(A, B, HF), P(A, B - T, HF), P(0, B - T, HF)], 'asm-edge', S1, 240, 16);

  /* ── STEP 5 · header ──────────────────────────────────────────────── */
  const S5 = 5;
  poly([P(8, 0, HB), P(152, 0, HB), P(152, 0, HB + HDR), P(8, 0, HB + HDR)], 'asm-header', S5, 0, 9);
  poly([P(8, 0, HB + HDR), P(152, 0, HB + HDR), P(152, T, HB + HDR), P(8, T, HB + HDR)], 'asm-edge', S5, 0, 9);
  const mark = line(P(34, 0, HB + 14)[0], P(34, 0, HB + 14)[1], P(126, 0, HB + 14)[0], P(126, 0, HB + 14)[1], 'asm-p asm-header-mark');
  add(mark, S5, 150, 9);

  return parts;
}

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export function setTime(parts, ms) {
  for (const p of parts) {
    const start = STEP_MS[p.step - 1] + p.delay;
    const k = Math.min(1, Math.max(0, (ms - start) / DUR));
    const e = easeOut(k);
    p.node.style.opacity = e === 0 ? '0' : e === 1 ? '' : e.toFixed(3);
    p.node.style.transform = e === 1 ? '' : `translateY(${((1 - e) * p.from).toFixed(2)}px)`;
  }

  /* which step are we on */
  let idx = -1;
  for (let i = 0; i < STEPS.length; i++) if (ms >= (STEPS[i].t / 90) * END - DUR / 2) idx = i;
  return idx;
}

/* ── the rail + readout, shared markup ───────────────────────────────── */
export function buildPanel(root) {
  const ticks = STEPS.map((s, i) => `
    <li class="asm-tick${i === 0 ? ' is-first' : ''}${i === STEPS.length - 1 ? ' is-last' : ''}"
        style="left:${(s.t / 90 * 100).toFixed(2)}%">
      <button type="button" data-i="${i}"><strong>${s.t} s</strong><span>${s.name}</span></button>
    </li>`).join('');

  const marks = STEPS.map((s) => `<u style="left:${(s.t / 90 * 100).toFixed(2)}%"></u>`).join('');

  root.insertAdjacentHTML('beforeend', `
    <div class="asm-panel">
      <div class="asm-now"><strong data-now-t>0 s</strong><span data-now-n>Flat blank</span></div>
      <div class="asm-rail">
        <div class="asm-track"><i data-fill></i>${marks}<b data-dot></b></div>
        <ol class="asm-ticks">${ticks}</ol>
      </div>
      <div class="asm-ctrl">
        <button type="button" class="asm-play" data-play>Pause</button>
        <span class="asm-hint">Click a time to jump</span>
      </div>
    </div>`);

  return {
    fill: root.querySelector('[data-fill]'),
    dot: root.querySelector('[data-dot]'),
    nowT: root.querySelector('[data-now-t]'),
    nowN: root.querySelector('[data-now-n]'),
    play: root.querySelector('[data-play]'),
    tickBtns: [...root.querySelectorAll('.asm-tick button')],
  };
}
