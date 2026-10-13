// BEANS pilot: "It's not the dog. It's the protein." 10 s, 1080×1920, 24 fps, cel / line boil.
// Miya scratches → the camera pushes into the itch and the fur opens → under the skin, immune cells spot a food
// protein → they burst into cel FX → the FX re-form into the line → BEANS end card.
import * as G from '../../../cel/engine.js';
import { PAL, ACCENTS, MIYA } from '../../../cel/palette.js';
import { loadPaper, drawPaper, drawTooth } from '../../../cel/paper.js';
import { field, primBounds, contours } from '../../../cel/shape.js';
import * as FX from '../../../cel/fx.js';
import { drawMiya, pose, locate } from '../../../characters/miya/miya.js';

const { K, E, hs, lerp, clamp, inv, sstep, spline, xf, circlePts, fillShape, inkLoop, inkStroke, polyPath } = G;
export const W = 1080, H = 1920, FPS = 24;
const ACC = ACCENTS['allergy-itch'];          // this film's one accent: Allergy & Itch sky
let ctx, DPR = 1, CUES, LOGO;

// ------------------------------------------------------------------ exposure sheet [fromFrame, toFrame, exposure]
const SCHED = [[0, 36, 2], [36, 60, 1], [60, 132, 2], [132, 180, 1], [180, 214, 2], [214, 240, 3]];
function drawing(f) {
  let id = 0;
  for (const [a, b, s] of SCHED) {
    if (f >= b) { id += Math.ceil((b - a) / s); continue; }
    const k = Math.floor((f - a) / s);
    return { fq: a + k * s, id: id + k, step: s };
  }
  return { fq: 239, id, step: 3 };
}
const bv = (D) => (D.step === 3 ? D.id % 3 : D.id % 4); // boil variant

export async function init(canvas, dpr) {
  DPR = dpr; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  ctx = canvas.getContext('2d');
  await loadPaper();
  CUES = await (await fetch('/beans/films/2026-10-13-its-the-protein/cues.json')).json();
  LOGO = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = '/beans/assets/brand/logo/beans-wordmark-navy.png'; });
  await LOGO.decode();
}

// ------------------------------------------------------------------ shared bits
function text(c, s, x, y, font, color, o = {}) {
  c.save(); c.font = font; c.fillStyle = color; c.textAlign = o.align || 'center'; c.textBaseline = 'alphabetic';
  if (o.rot) { c.translate(x, y); c.rotate(o.rot); c.fillText(s, 0, 0); } else c.fillText(s, x, y);
  c.restore();
}
// a scalloped (curly-edged) circle: the edge of the fur iris and the paper iris
function scallopCircle(cx, cy, r, seed, bumps = 26, amp = 0.06) {
  const P = [];
  const n = 240;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const u = (a / (Math.PI * 2)) * bumps, k = Math.floor(u), f = u - k;
    const bump = Math.sqrt(Math.sin(Math.PI * f)) * amp * r * (0.75 + 0.5 * hs(seed, k));
    P.push([cx + Math.cos(a) * (r + bump), cy + Math.sin(a) * (r + bump)]);
  }
  return P;
}
// hand-drawn arrow (shaft + two barbs)
function arrow(c, P, seed, color, w = 5) {
  inkStroke(c, P, { seed, w, t0: 8, t1: 6, min: 0.4, amp: 1.2, heavy: 0, color });
  const B = P[P.length - 1], A = P[P.length - 2], d = Math.atan2(B[1] - A[1], B[0] - A[0]);
  for (const sg of [-1, 1]) { const a = d + Math.PI + sg * 0.55; inkStroke(c, [B, [B[0] + Math.cos(a) * 30, B[1] + Math.sin(a) * 30]], { seed: seed + sg + 3, w, t0: 4, t1: 8, min: 0.4, amp: 1, heavy: 0, color }); }
}

// ------------------------------------------------------------------ A. hook + push-in
const MIYA_AT = { x: 520, y: 1480, s: 3.0, view: 15 };
function scratchPose(f) { // the paw scratches on 1s: two drawings alternating, head jolting with it
  const a = f % 2 === 0;
  return pose('scratch', {
    legs: { HN: a ? [[10, 78], [-20, 126], [2, 184]] : [[16, 72], [-10, 116], [14, 166]] },
    head: { pitch: -12, yaw: 8, roll: a ? 16 : 12 },
    face: { eyes: 'squint', mouth: 'closed', brow: -0.5 },
  });
}
const pawOf = (R) => R.legs.find((l) => l.key === 'HN').pts[3];
function sceneHook(c, f, t1, D) {
  const P = scratchPose(f);
  // push-in: zoom about the itch, which slides to the centre of the frame (on 1s, ease-in)
  const u = E.in2(inv(CUES.push[0], CUES.push[1], t1));
  const z = lerp(1, 4.6, u);
  const itch = locate(P, MIYA_AT, (R) => pawOf(R));
  const fx = lerp(itch.x, W / 2, u), fy = lerp(itch.y + 20, H / 2, u);
  const o = { ...MIYA_AT, x: fx + (MIYA_AT.x - itch.x) * z, y: fy + (MIYA_AT.y - itch.y - 20) * z, s: MIYA_AT.s * z, v: bv(D), seed: 4000,
    accent: ACC.c, w: 4.4 / Math.pow(z, 0.75), clip: { x0: -200, y0: -200, x1: W + 200, y1: H + 200 } };
  G.GLOBAL.amp = 1 / Math.pow(z, 0.7);
  if (u < 0.3) { // tiny camera jolt with each scratch
    c.save(); c.translate(f % 2 ? 2 : -2, f % 2 ? -1 : 1);
  } else c.save();
  drawMiya(c, P, o);
  // itch marks round the paw: three zigzags flicking on 1s
  const paw = locate(P, o, (R) => pawOf(R));
  if (u < 0.6) {
    const k = 1 - u / 0.6;
    for (let i = 0; i < 3; i++) {
      const a = -2.6 + i * 0.55 + (f % 2) * 0.12, r0 = (70 + 14 * i) * MIYA_AT.s / 2.25 * z, L = 34 * z;
      const x0 = paw.x + Math.cos(a) * r0, y0 = paw.y + Math.sin(a) * r0;
      const zz = []; for (let j = 0; j <= 4; j++) zz.push([x0 + Math.cos(a) * L * j / 4 + (j % 2 ? -1 : 1) * 7 * z * Math.sin(a), y0 + Math.sin(a) * L * j / 4 - (j % 2 ? -1 : 1) * 7 * z * Math.cos(a)]);
      c.globalAlpha = k; inkStroke(c, zz, { seed: 70 + i + f, w: 3.4 * Math.pow(z, 0.3), t0: 4, t1: 6, amp: 0.8, heavy: 0 }); c.globalAlpha = 1;
    }
  }
  c.restore();
  G.GLOBAL.amp = 1;
  // handwritten callout, pops in at 0.25 on 2s, leaves as the push starts
  if (t1 >= CUES.callout && t1 < CUES.push[0] + 0.2) {
    const pop = K(D.fq / FPS, [[CUES.callout, 0.6], [CUES.callout + 0.083, 1.12, 'out2'], [CUES.callout + 0.167, 1.0]]);
    const out = 1 - inv(CUES.push[0], CUES.push[0] + 0.2, t1);
    c.save(); c.globalAlpha = out; c.translate(330, 430); c.scale(pop, pop); c.rotate(-0.06);
    text(c, 'Itchy. Again.', 0, 0, '700 124px "Caveat"', PAL.orange);
    c.restore();
    if (out > 0.5) arrow(c, [[300, 490], [270, 600], [paw.x - 120, paw.y - 60]], 90 + bv(D), PAL.orange, 6);
  }
  // speed lines toward the itch while pushing (on 1s)
  if (u > 0.15 && u < 0.98) FX.speedLinesRadial(c, W / 2, H / 2, lerp(900, 420, u), 1500, 22, 300 + f, 7 * (1 - u * 0.4), -1);
}

// ------------------------------------------------------------------ B. under the skin
const CELLS = [
  { x: 250, y: 1010, r: 165, seed: 11 },
  { x: 830, y: 1170, r: 175, seed: 23 },
  { x: 420, y: 1430, r: 155, seed: 37 },
];
const PROT = { x: 600, y: 760 };
function proteinPos(tq) {
  const u = E.out3(inv(CUES.protein_in[0], CUES.protein_in[1], tq));
  return { x: lerp(-180, PROT.x, u), y: lerp(560, PROT.y, u) + Math.sin(tq * 2.4) * 10, rot: tq * 0.5 };
}
function cellState(k, tq, t1, D) {
  const C = CELLS[k];
  const p = proteinPos(tq);
  let x = C.x + Math.sin(tq * 1.7 + k * 2) * 14, y = C.y + Math.cos(tq * 1.3 + k) * 12;
  let sx = 1, sy = 1, rot = 0;
  const dx = p.x - x, dy = p.y - y, dl = Math.hypot(dx, dy) || 1;
  // noticing: lean toward the protein
  const n = E.out2(inv(CUES.notice, CUES.notice + 0.33, tq));
  rot = Math.atan2(dy, dx) * n; sx = 1 + 0.12 * n; sy = 1 - 0.06 * n;
  // gathering on 1s: close in on the protein, squash and tremble
  const g = E.io2(inv(CUES.gather[0], CUES.gather[1], t1));
  if (g > 0) {
    const ring = 300 + 30 * k, ta = Math.atan2(-dy, -dx);
    x = lerp(x, p.x + Math.cos(ta) * ring, g); y = lerp(y, p.y + Math.sin(ta) * ring * 0.9, g);
    sx = lerp(sx, 1.18, g); sy = lerp(sy, 0.8, g);
    x += (hs(D.id, k, 1) - 0.5) * 10 * g; y += (hs(D.id, k, 2) - 0.5) * 8 * g;
  }
  return { x, y, r: C.r, sx, sy, rot, seed: C.seed };
}
function drawCell(c, s, D, o = {}) {
  // body: a smooth union of a core and gently wobbling pseudopod lobes (boils with the drawing)
  const prims = [{ t: 'circle', x: 0, y: 0, r: s.r * 0.82, k: s.r * 0.3 }];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + hs(s.seed, i) * 0.8, d = s.r * (0.42 + 0.12 * Math.sin(D.fq / FPS * 3 + i * 1.7 + s.seed));
    prims.push({ t: 'circle', x: Math.cos(a) * d, y: Math.sin(a) * d, r: s.r * (0.42 + 0.12 * hs(s.seed, i, 2)), k: s.r * 0.3 });
  }
  const loop0 = contours(field(prims), primBounds(prims, 8), 3)[0];
  if (!loop0) return;
  const sm = o.smear || 1; // smear frame: stretched along the lunge
  const T = (P) => xf(P, { x: s.x, y: s.y, r: s.rot, sx: s.sx * sm, sy: s.sy / Math.sqrt(sm) });
  const loop = T(loop0);
  fillShape(c, loop, PAL.hi, { seed: s.seed + D.id * 3, amp: 1.6, dx: FX.REG.dx, dy: FX.REG.dy });
  c.save(); c.beginPath(); polyPath(c, loop); c.clip();
  c.beginPath(); c.rect(-1e4, -1e4, 2e4, 2e4); polyPath(c, loop.map(([x, y]) => [x - 12, y - 14])); c.fillStyle = PAL.cream; c.fill('evenodd');
  c.restore();
  // lobed nucleus in the accent, plus granules
  const nuc = T(spline([[-0.34, -0.06], [-0.2, -0.3], [0.04, -0.18], [0.24, -0.32], [0.38, -0.08], [0.2, 0.16], [-0.04, 0.06], [-0.24, 0.22]].map(([x, y]) => [x * s.r, y * s.r]), true, 3));
  fillShape(c, nuc, ACC.c, { seed: s.seed + 5 + D.id, amp: 1.2, dx: FX.REG.dx * 0.6, dy: FX.REG.dy * 0.6 });
  inkLoop(c, nuc, { seed: s.seed + 6 + bv(D), w: 3.2, amp: 1.2, heavy: 0.3 });
  for (let i = 0; i < 7; i++) {
    const [gx, gy] = T([[(hs(s.seed, i, 7) - 0.5) * s.r * 1.1, (0.22 + 0.4 * hs(s.seed, i, 8)) * s.r]])[0];
    fillShape(c, circlePts(gx, gy, 5 + 2 * hs(s.seed, i, 9), 10), ACC.shade, { seed: s.seed + 40 + i, amp: 0.6 });
  }
  inkLoop(c, loop, { seed: s.seed + 9 + bv(D) * 13, w: 5.5, amp: 1.8, splits: 2, heavy: 0.45 });
}
function drawProtein(c, tq, D, scale = 1) {
  // a folded protein chain: beads along a curl, brand orange, inked
  const p = proteinPos(tq);
  const beads = [];
  for (let i = 0; i < 11; i++) {
    const a = i * 0.72, r = (28 + 7.5 * i) * scale;
    beads.push([p.x + Math.cos(a + p.rot) * r, p.y + Math.sin(a + p.rot) * r * 0.82]);
  }
  inkStroke(c, beads, { seed: 500 + bv(D), w: 6 * scale, t0: 6, t1: 6, min: 0.6, amp: 1, heavy: 0 });
  beads.forEach(([x, y], i) => {
    const r = (19 + (i % 3 === 0 ? 5 : 0)) * scale, B = circlePts(x, y, r, 16);
    fillShape(c, B, i % 4 === 1 ? PAL.orangeShade : PAL.orange, { seed: 510 + i + D.id, amp: 1, dx: FX.REG.dx * 0.5, dy: FX.REG.dy * 0.5 });
    inkLoop(c, B, { seed: 530 + i + bv(D) * 7, w: 3.4 * scale, amp: 1, t0: 3, t1: 6, heavy: 0.4 });
  });
  return p;
}
function drawInside(c, f, t1, D) {
  const tq = D.fq / FPS;
  c.fillStyle = PAL.navy; c.fillRect(0, 0, W, H);
  // deep tissue texture: loose hatching in deep navy + drifting particles in light navy
  c.save(); c.globalAlpha = 0.55;
  G.hatch(c, [[0, 300], [W, 300], [W, H], [0, H]], { seed: 900 + bv(D), gap: 46, ang: -0.6, w: 2.4, amp: 2, color: PAL.navyDeep, cx: W / 2, cy: H / 2 });
  c.restore();
  for (let i = 0; i < 26; i++) {
    const x = (hs(i, 1) * W + tq * 18 * (0.5 + hs(i, 2))) % W, y = 380 + hs(i, 3) * (H - 380) + Math.sin(tq + i) * 8;
    fillShape(c, circlePts(x, y, 3 + 4 * hs(i, 4), 10), PAL.navyLight, { seed: 950 + i, amp: 0.6 });
  }
  // the skin, seen in cross-section at the top: cream band with a wavy inked edge and curly hair shafts
  const edge = []; for (let i = 0; i <= 24; i++) { const x = (i / 24) * (W + 80) - 40; edge.push([x, 300 + Math.sin(i * 0.9) * 18 + Math.sin(i * 2.3) * 6]); }
  const band = [[-40, -40], [W + 40, -40], ...edge.slice().reverse()];
  fillShape(c, band, MIYA.coat, { seed: 960 + bv(D), amp: 1.6 });
  fillShape(c, [[-40, 200], [W + 40, 200], ...edge.slice().reverse()], ACC.c, { seed: 961 + bv(D), amp: 1.6, dx: FX.REG.dx, dy: FX.REG.dy });
  inkStroke(c, edge, { seed: 962 + bv(D), w: 6, t0: 10, t1: 10, min: 0.5, amp: 1.6, heavy: 0 });
  for (let i = 0; i < 6; i++) { // hair follicles + shafts
    const x = 90 + i * 180 + hs(i, 5) * 40;
    const hair = [[x, 330], [x - 14, 250], [x + 12, 170], [x - 14, 90], [x + 12, 10], [x - 6, -40]];
    inkStroke(c, hair, { seed: 970 + i + bv(D) * 5, w: 22, t0: 14, t1: 4, min: 0.5, amp: 1.4, heavy: 0 });
    inkStroke(c, hair, { seed: 970 + i + bv(D) * 5, w: 13, t0: 12, t1: 2, min: 0.5, amp: 1.4, heavy: 0, color: MIYA.coat });
    inkLoop(c, circlePts(x, 330, 12, 14, 9), { seed: 980 + i + bv(D), w: 3, amp: 1 });
  }
  // the protein + its label
  const p = tq >= CUES.protein_in[0] ? drawProtein(c, tq, D, 1.45) : null;
  if (p && tq >= CUES.protein_label && t1 < CUES.burst - 0.1) {
    const pop = K(tq, [[CUES.protein_label, 0.6], [CUES.protein_label + 0.083, 1.1, 'out2'], [CUES.protein_label + 0.167, 1]]);
    c.save(); c.translate(760, 470); c.scale(pop, pop); c.rotate(-0.05);
    text(c, 'chicken protein', 0, 0, '700 92px "Caveat"', PAL.hi);
    c.restore();
    arrow(c, [[860, 500], [880, 600], [p.x + 160, p.y - 40]], 990 + bv(D), PAL.hi, 5);
  }
  // the immune cells
  const smearF = Math.round(CUES.smear * FPS);
  CELLS.forEach((C, k) => {
    const s = cellState(k, tq, t1, D);
    drawCell(c, s, D, { smear: f === smearF && k === 1 ? 2.4 : 1 });
    // noticing: three alert ticks over each cell (on 2s)
    const n = inv(CUES.notice, CUES.notice + 0.25, tq);
    if (n > 0 && tq < CUES.gather[0] + 0.3) {
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + (i - 1) * 0.5, r0 = s.r * 1.08, r1 = r0 + 34 * E.out2(n);
        inkStroke(c, [[s.x + Math.cos(a) * r0, s.y + Math.sin(a) * r0], [s.x + Math.cos(a) * r1, s.y + Math.sin(a) * r1]], { seed: 1000 + k * 9 + i + bv(D), w: 5, t0: 4, t1: 6, amp: 0.8, heavy: 0, color: PAL.hi });
      }
    }
  });
  // converging speed lines before the burst (on 1s)
  if (p && t1 >= 6.0 && t1 < CUES.burst) {
    const u = inv(6.0, CUES.burst, t1);
    FX.speedLinesRadial(c, p.x, p.y, lerp(620, 360, u), lerp(1100, 700, u), 20, 1100 + f, 6, -1, PAL.hi);
  }
}

// ------------------------------------------------------------------ C. burst + D. line
const C0 = { x: PROT.x, y: PROT.y };
const NSPARK = 28;
function sparkState(k, t) {
  const a = (k / NSPARK) * Math.PI * 2 + (hs(k, 11) - 0.5) * 0.8, v0 = 1600 + 1400 * hs(k, 12), drag = 4.2;
  const u = Math.max(0, t - CUES.burst);
  const d = 90 + 80 * hs(k, 14) + (v0 / drag) * (1 - Math.exp(-drag * u));
  const sp = v0 * Math.exp(-drag * u);
  return { x: C0.x + Math.cos(a) * d, y: C0.y + Math.sin(a) * d + 220 * u * u, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp + 440 * u, size: [9, 14, 22][k % 3] };
}
const PUFFS = [[150, 560, 120], [930, 600, 130], [540, 380, 90], [120, 1380, 125], [960, 1360, 115], [300, 1640, 95], [800, 1660, 100], [90, 1240, 80], [990, 760, 85]];
function puffAt(k, t) {
  const [px, py, r] = PUFFS[k], u = E.out3(inv(CUES.burst, CUES.burst + 0.6, t));
  const g = E.outBack(clamp((t - CUES.burst) / 0.35), 1.4) * (1 + 0.04 * Math.sin(t * 5 + k));
  const away = inv(8.5, 8.9, t); // drift outward and shrink as the line settles
  return { x: lerp(C0.x, px, u) + (px - 540) * 0.25 * away, y: lerp(C0.y, py, u) - 40 * away, r: r * g * (1 - 0.55 * away) };
}
const LINE1 = { y: 930, words: ["It's", 'not', 'the', 'dog.'] }, LINE2 = { y: 1110, words: ["It's", 'the', 'protein.'] };
function wordLayout(c) { // measured word positions for both lines, centred
  const out = [];
  for (const [L, li] of [[LINE1, 0], [LINE2, 1]]) {
    const fonts = L.words.map((w) => (w === 'protein.' ? 'italic 600 140px "Fraunces"' : '600 124px "Fraunces"'));
    c.save();
    const ws = L.words.map((w, i) => { c.font = fonts[i]; return c.measureText(w).width; });
    c.font = '600 124px "Fraunces"'; const sp = c.measureText(' ').width;
    c.restore();
    const tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    let x = 500 - tot / 2; // centred on the 9:16 safe box (x 60–940), not the frame
    L.words.forEach((w, i) => { out.push({ w, x: x + ws[i] / 2, y: L.y, font: fonts[i], color: w === 'protein.' ? PAL.orange : PAL.navy, li, width: ws[i] }); x += ws[i] + sp; });
  }
  return out;
}
function drawBurstAndLine(c, f, t1, D) {
  const tq = D.fq / FPS;
  // the paper world returns: a curly-edged iris of cream paper growing from the burst
  const pu = E.out3(inv(CUES.paper_iris[0], CUES.paper_iris[1], t1));
  const ironR = lerp(80, 1500, pu);
  if (pu < 1) {
    drawInside(c, f, t1, D);
    c.save(); c.beginPath(); polyPath(c, scallopCircle(C0.x, C0.y, ironR, 77, 30, 0.05)); c.clip();
    drawPaper(c, W, H); c.restore();
    if (pu > 0) inkLoop(c, scallopCircle(C0.x, C0.y, ironR, 77, 30, 0.05), { seed: 1200 + bv(D), w: 7, amp: 2, heavy: 0.3 });
  }
  // star burst + radial speed lines (on 1s), shrinking as the paper opens
  if (t1 < 7.1) {
    const R = K(t1, [[CUES.burst, 1100], [6.6, 1000], [7.1, 160, 'in2']]);
    FX.speedLinesRadial(c, C0.x, C0.y, R * 0.7, 1600, 26, 1300 + f, 9, 1, PAL.hi);
    FX.drawStarburst(c, C0.x, C0.y, R, 1400 + f, f * 0.37, [ACC.c, PAL.orange, PAL.hi]);
  }
  // smoke puffs (cream, inked), dissipating on 2s after the line lands
  PUFFS.forEach((_, k) => {
    const p = puffAt(k, t1 < 7 ? t1 : tq);
    FX.smokePuff(c, p.x, p.y, p.r, 1500 + k * 31 + (t1 < 7 ? f : bv(D)) * 7, { fill: PAL.hi });
  });
  // sparks (on 1s): fly out, then a few re-gather to write the words
  if (t1 < 7.4) for (let k = 0; k < NSPARK; k++) {
    const s = sparkState(k, t1), fade = 1 - inv(7.1, 7.4, t1);
    if (fade <= 0) continue;
    if (k % 4 === 3) FX.drawTwinkle(c, s.x, s.y, s.size * 1.6 * fade, 1600 + k * 7 + f, { rot: f * 0.3 + k, fill: PAL.hi });
    else FX.drawSpark(c, s.x, s.y, s.vx, s.vy, s.size * fade, 1600 + k * 7 + f, { fill: k % 3 ? ACC.c : PAL.orange });
  }
  // the line: each word pops in on its cue, a spark arriving just before it (on 1s), boiling after
  const WL = wordLayout(c);
  WL.forEach((wd, i) => {
    const tw = CUES.words[i];
    // each word's puff: blown out by the burst, it flies to the word's spot (on 1s), parks, then dissipates through
    // growing holes over 3 frames, revealing the word underneath (the FX re-form into the line)
    const a0 = -2.4 + i * 0.75, start = { x: C0.x + Math.cos(a0) * 300, y: C0.y + 120 + Math.sin(a0) * 260 };
    const tA = tw - 0.33, u = E.io2(inv(tA, tw - 0.02, t1));
    const np = Math.max(1, Math.round(wd.width / 170)), pr = Math.min(80, Math.max(62, wd.width / (np * 1.55))); // long words get a small cluster of puffs
    const px = lerp(start.x, wd.x, u), py = lerp(start.y, wd.y - 44, u) - Math.sin(Math.PI * u) * 90;
    const stage = t1 < tw ? 0 : Math.floor((t1 - tw) * FPS) + 1;
    if (t1 >= tw) { // the word, boiling a hair once it is down
      const pop = K(t1, [[tw, 1.12], [tw + 0.125, 1.0, 'out2']]);
      const jx = (hs(bv(D), i, 1) - 0.5) * 1.6, jy = (hs(bv(D), i, 2) - 0.5) * 1.6;
      c.save(); c.translate(wd.x + jx, wd.y + jy); c.scale(pop, pop);
      text(c, wd.w, 0, 0, wd.font, wd.color);
      c.restore();
    }
    if (t1 >= tA && stage < 4) {
      if (stage === 0 && u < 0.95) { // speed streaks behind the travelling puff
        const dx = wd.x - start.x, dy = wd.y - start.y, dl = Math.hypot(dx, dy) || 1;
        for (let k = 0; k < 3; k++) inkStroke(c, [[px - dx / dl * (pr * 1.1 + 60 + 30 * k), py - dy / dl * (pr * 1.1 + 60) + (k - 1) * 24], [px - dx / dl * pr * 0.9, py - dy / dl * pr * 0.9 + (k - 1) * 20]], { seed: 1750 + i * 5 + k + f, w: 4, t0: 30, t1: 6, min: 0.05, amp: 1, heavy: 0 });
      }
      for (let j = 0; j < np; j++) {
        const ox = (j - (np - 1) / 2) * (wd.width / np) * u, oy = (j % 2 ? 12 : -8) * u;
        FX.smokePuff(c, px + ox, py + oy, pr * (stage === 0 ? E.outBack(clamp((t1 - tA - j * 0.04) / 0.2), 1.3) : 1), 1700 + i * 37 + j * 11 + f, { stage: Math.min(4, stage + (stage ? j % 2 : 0)), fill: PAL.hi });
      }
    }
    if (t1 >= tw && t1 < tw + 0.17) FX.drawTwinkle(c, wd.x + wd.width * 0.5, wd.y - 96, 30, 1800 + i + f, { fill: wd.color === PAL.orange ? PAL.orange : ACC.c });
  });
  // a hand-brushed orange underline under "protein." (on 1s)
  const pr = WL[WL.length - 1], ul = E.out2(inv(CUES.underline[0], CUES.underline[1], t1));
  if (ul > 0) {
    const P = [[pr.x - pr.width / 2 - 6, pr.y + 30], [pr.x, pr.y + 40], [pr.x + pr.width / 2 + 10, pr.y + 26]];
    inkStroke(c, G.prefix(spline(P, false, 4), ul), { seed: 1900 + bv(D), w: 14, t0: 10, t1: 40, min: 0.3, amp: 1.2, heavy: 0, color: PAL.orange, dense: true });
  }
}

// ------------------------------------------------------------------ E. end card
function drawEndCard(c, f, t1, D) {
  const tq = D.fq / FPS;
  // the logo, placed clean and still (never boiled or restyled)
  const lw = 800, lh = lw * LOGO.height / LOGO.width, ly = 640;
  c.drawImage(LOGO, W / 2 - lw / 2, ly - lh / 2, lw, lh);
  // Miya, happy, under the logo
  drawMiya(c, pose('sit', { face: { eyes: 'happy', mouth: 'tongue', brow: 0.4 }, head: { pitch: 6, yaw: 14, roll: -4 }, ears: { swing: 4 } }),
    { x: 520, y: 1470, s: 2.2, view: 30, v: bv(D), seed: 6000, accent: ACC.c });
  // twinkles popping round the logo on 3s
  [[130, 470, 9.0, 40], [960, 500, 9.125, 34], [900, 820, 9.25, 28], [180, 800, 9.375, 26]].forEach(([x, y, t0, R], k) => {
    if (tq < t0) return;
    const cyc = [1.0, 0.6, 0.85][Math.floor((tq - t0) * 8) % 3], pop = E.outBack(clamp((tq - t0) / 0.12), 2.2);
    FX.drawTwinkle(c, x, y, R * pop * cyc, 2000 + k * 13 + bv(D), { fill: k % 2 ? ACC.c : PAL.hi });
  });
}

// ------------------------------------------------------------------ frame
export function render(t) {
  const f = Math.min(239, Math.max(0, Math.round(t * FPS)));
  const D = drawing(f), t1 = f / FPS, tq = D.fq / FPS;
  const c = ctx;
  c.setTransform(DPR, 0, 0, DPR, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  const fi = Math.round(CUES.impact_frames[0] * FPS);
  if (f === fi || f === fi + 1) { // impact frames (hero), one frame each
    if (f === fi) FX.impactFrame(c, W, H, C0.x, C0.y, PAL.hi, PAL.orange, 156, { core: ACC.c, R: 700 });
    else FX.impactFrame(c, W, H, C0.x, C0.y, PAL.navy, PAL.hi, 157, { core: PAL.orange, R: 760, lines: true, lineColor: PAL.hi });
    drawTooth(c, W, H, bv(D), DPR, 0.13);
    return;
  }
  drawPaper(c, W, H);
  if (t1 < CUES.iris[0]) sceneHook(c, f, t1, D);
  else if (t1 < 2.75) { // the fur opens: a curly iris onto the world under the skin
    sceneHook(c, f, t1, D);
    const r = lerp(0, 1350, E.in2(inv(CUES.iris[0], 2.75, t1)));
    const ring = scallopCircle(W / 2, H / 2, r, 55, 22, 0.08);
    c.save(); c.beginPath(); polyPath(c, ring); c.clip(); drawInside(c, f, t1, D); c.restore();
    inkLoop(c, ring, { seed: 1210 + f, w: 9, amp: 2, heavy: 0.4 });
  } else if (t1 < CUES.burst) drawInside(c, f, t1, D);
  else if (t1 < CUES.endcard_wipe[0]) drawBurstAndLine(c, f, t1, D);
  else if (t1 < CUES.endcard_wipe[1]) { // wipe: the puffs swell and close over the line, then open onto the end card
    const u = inv(CUES.endcard_wipe[0], CUES.endcard_wipe[1], t1);
    if (u < 0.5) drawBurstAndLine(c, f, t1, D); else drawEndCard(c, f, t1, D);
    const R = 1300 * Math.sin(Math.PI * u);
    for (let k = 0; k < 5; k++) FX.smokePuff(c, 540 + Math.cos(k * 1.26) * R * 0.32, 960 + Math.sin(k * 1.26) * R * 0.42, R * 0.42, 2100 + k * 17 + D.id, { fill: PAL.hi });
  } else drawEndCard(c, f, t1, D);
  drawTooth(c, W, H, bv(D), DPR, 0.13);
}
