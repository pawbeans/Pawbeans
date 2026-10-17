// "Inside Your Dog: what the haze does to your dog": overlay helpers copied from the poop chart cast (pill, caption card,
// cel mass, glow), plus this film's props: the window and the haze, the airway and lungs, tip icons, the aircon,
// the Rabbit treats pouch and the treat bits.
import * as G from '../../../cel/engine.js';
import { PAL, ACCENTS, MIYA } from '../../../cel/palette.js';
import { field, primBounds, contours } from '../../../cel/shape.js';
import * as FX from '../../../cel/fx.js';

const { hs, lerp, clamp, circlePts, fillShape, inkLoop, inkStroke, polyPath, E, K } = G;
export const REG = FX.REG;

// ------------------------------------------------------------------ generic cel mass
export function outline(prims, cell = 3) { return contours(field(prims), primBounds(prims, 8), cell)[0] || null; }
export function celMass(c, loop, fill, shade, seed, v, o = {}) {
  if (!loop) return null;
  fillShape(c, loop, fill, { seed: seed + 1 + v * 7, amp: o.amp ?? 1.6, dx: REG.dx, dy: REG.dy });
  if (shade) {
    const sh = o.sh ?? 12;
    c.save(); c.beginPath(); polyPath(c, loop); c.clip();
    c.beginPath(); c.rect(-1e4, -1e4, 2e4, 2e4); polyPath(c, loop.map(([x, y]) => [x - sh, y - sh * 1.15])); c.fillStyle = shade; c.fill('evenodd');
    if (o.inside) o.inside(c);
    c.restore();
  } else if (o.inside) { c.save(); c.beginPath(); polyPath(c, loop); c.clip(); o.inside(c); c.restore(); }
  inkLoop(c, loop, { seed: seed + 3 + v * 13, w: o.w ?? 5, amp: o.amp ?? 1.6, splits: 2, heavy: 0.45, color: o.ink ?? PAL.ink });
  return loop;
}
// stepped cel glow: two flat halos multiplied / screened behind a thing
export function glow(c, x, y, r, col, seed, v, a = 0.22) {
  c.save(); c.globalAlpha = a;
  fillShape(c, circlePts(x, y, r * 1.45, 60), col, { seed: seed + v, amp: 3 });
  c.globalAlpha = a * 1.4;
  fillShape(c, circlePts(x, y, r * 1.12, 50), col, { seed: seed + 2 + v, amp: 3 });
  c.restore();
}
// ------------------------------------------------------------------ overlays: labels, pills, captions
export function roundRect(x, y, w, h, r) {
  const P = [], n = 6;
  const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * Math.PI / 2; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
  return P;
}
// pill label: hand-cut (boiling edge), Oswald caps; optional coloured particle dot; scale for pop-ins
export function pill(c, text, x, y, o, v) {
  const size = o.size ?? 34;
  c.save(); c.font = `600 ${size}px "Oswald"`; if ('letterSpacing' in c) c.letterSpacing = '0.08em';
  const tw = c.measureText(text).width; c.restore();
  const dot = o.dot ? size * 0.9 : 0;
  const w = tw + size * 1.2 + dot, h = size * 1.6;
  c.save(); c.translate(x, y); c.rotate(o.rot ?? 0); c.scale(o.scale ?? 1, o.scale ?? 1); c.globalAlpha = o.alpha ?? 1;
  const P = G.resample(roundRect(-w / 2, -h / 2, w, h, h / 2), 5, true);
  if (o.shadow !== false) fillShape(c, P.map(([a, b]) => [a + 6, b + 7]), 'rgba(27,47,82,0.35)', { seed: (o.seed ?? 1) + 9 + v, amp: 1 });
  fillShape(c, P, o.fill ?? PAL.hi, { seed: (o.seed ?? 1) + v, amp: 1.2 });
  if (o.ink !== false) inkLoop(c, P, { seed: (o.seed ?? 1) + 3 + v, w: 3, amp: 1.2, color: o.edge ?? PAL.ink });
  if (o.dot) { const dx = -w / 2 + size * 0.55 + dot * 0.3; fillShape(c, circlePts(dx, 0, size * 0.32, 16), o.dot, { seed: (o.seed ?? 1) + 5, amp: 0.5 }); inkLoop(c, circlePts(dx, 0, size * 0.32, 16), { seed: (o.seed ?? 1) + 6 + v, w: 2.4, amp: 0.5 }); }
  c.font = `600 ${size}px "Oswald"`; if ('letterSpacing' in c) c.letterSpacing = '0.08em';
  c.fillStyle = o.color ?? PAL.navy; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(text, dot * 0.5, size * 0.04);
  c.restore();
}
// caption card: card-cream, hand-cut boiling edge, CENTRED on y (owner: three-quarter height). The card pops in opaque (scale, no grey half-alpha slab); only the words build in, one by one, highlight
// words in orange. o.cont: the previous caption ends where this one starts, so the card is already up (no re-pop);
// o.hold: the next caption starts where this one ends, so the card doesn't pop out.
// o.on: the second each word is spoken (voiceover); a word builds in one frame before it is heard.
export function caption(c, words, x, y, t, tIn, tOut, v, o = {}) {
  if (t < tIn || t >= tOut) return;
  const size = 50, lh = 70, maxW = 740;
  c.save(); c.font = `600 ${size}px "Inter"`;
  const sp = c.measureText(' ').width;
  const ws = words.map((wd) => { c.font = `${wd.b ? 800 : 600} ${size}px "Inter"`; return { ...wd, width: c.measureText(wd.w).width }; });
  c.restore();
  const span = (L) => L.reduce((a, q) => a + q.width + sp, -sp);
  let lines = [ws];
  if (span(ws) > maxW) { // two balanced lines, preferring a break after a comma
    let best = null;
    for (let k = 1; k < ws.length; k++) {
      const A = ws.slice(0, k), B = ws.slice(k), m = Math.max(span(A), span(B));
      if (m > maxW) continue;
      const score = m - (/,$/.test(A[A.length - 1].w) ? 120 : 0);
      if (!best || score < best.score) best = { score, lines: [A, B] };
    }
    if (best) lines = best.lines;
  }
  const boxW = Math.min(810, Math.max(...lines.map((L) => L.reduce((a, q) => a + q.width + sp, -sp))) + 70), boxH = lines.length * lh + 46;
  const sIn = o.cont ? 1 : K(t, [[tIn, 0.82], [tIn + 0.1, 1.04, 'out3'], [tIn + 0.18, 1]]);
  // out: an opaque pop-out on 1s (1 → 1.06 → 0 over 3 frames), never a half-transparent ghost card
  const sOut = o.hold || t < tOut - 0.125 ? 1 : K(t, [[tOut - 0.125, 1], [tOut - 0.08, 1.06], [tOut, 0]]);
  const sc = sIn * sOut, fade = 1;
  c.save(); c.globalAlpha = fade; c.translate(x, y); c.scale(sc, sc); c.translate(-x, -y);
  const P = G.resample(roundRect(x - boxW / 2, y - boxH / 2, boxW, boxH, 28), 6, true);
  fillShape(c, P.map(([a, b]) => [a + 6, b + 8]), 'rgba(27,47,82,0.3)', { seed: 300 + v, amp: 1.2 });
  fillShape(c, P, PAL.hi, { seed: 301 + v, amp: 1.4 });
  inkLoop(c, P, { seed: 302 + v, w: 3.5, amp: 1.4 });
  let k = 0;
  lines.forEach((L, li) => {
    const lwid = L.reduce((a, q) => a + q.width + sp, -sp);
    let wx = x - lwid / 2;
    const wy = y - boxH / 2 + 23 + lh * (li + 0.5) + size * 0.34;
    for (const wd of L) {
      const tw = o.on ? o.on[k] - 1 / 24 : tIn + 0.05 + k * 0.07, u = clamp((t - tw) / 0.14);
      if (u > 0) {
        c.save(); c.globalAlpha = fade * u; c.font = `${wd.b ? 800 : 600} ${size}px "Inter"`; c.fillStyle = wd.b ? PAL.orangeShade : PAL.navy; c.textBaseline = 'alphabetic';
        c.fillText(wd.w, wx, wy + 10 * (1 - E.out3(u))); c.restore();
      }
      wx += wd.width + sp; k++;
    }
  });
  c.restore();
}

// ------------------------------------------------------------------ props reused from the poop chart
const cone = (ax, ay, bx, by, r1, r2, k = 10) => ({ t: 'cone', a: { x: ax, y: ay }, b: { x: bx, y: by }, r1, r2, k });
const circ = (x, y, r, k = 10) => ({ t: 'circle', x, y, r, k });
const ellipse = (x, y, rx, ry, n = 32) => Array.from({ length: n }, (_, i) => [x + rx * Math.cos(2 * Math.PI * i / n), y + ry * Math.sin(2 * Math.PI * i / n)]);
// a dog bowl (navy); fill: 'kibble' | 'rich' | 'empty' | 'water'
export function bowl(c, x, y, s, seed, v, fill = 'kibble') {
  const w = 120 * s, h = 54 * s, top = y - h / 2;
  if (fill === 'kibble' || fill === 'rich') { // the food heaped above the rim
    const heap = fill === 'rich' ? 46 : 26, col = fill === 'rich' ? BROWN_HI : MIYA.apricotShade;
    celMass(c, G.resample(G.spline([[x - w * 0.8, top + 4], [x - w * 0.5, top - heap * 0.6 * s], [x, top - heap * s], [x + w * 0.5, top - heap * 0.6 * s], [x + w * 0.8, top + 4]], true, 4), 5, true), col, fill === 'rich' ? BROWN_SH : MIYA.patch, seed + 40, v, { w: 4, sh: 6 * s });
    if (fill === 'rich') for (let k = 0; k < 3; k++) inkStroke(c, [[x - 30 * s + k * 30 * s, top - heap * s - 14 * s], [x - 26 * s + k * 30 * s + 6 * s, top - heap * s - 40 * s], [x - 30 * s + k * 30 * s, top - heap * s - 62 * s]], { seed: seed + 50 + k + v, w: 3, t0: 4, t1: 4, min: 0.3, amp: 1, heavy: 0, color: PAL.navyLight }); // steam: rich and new
  }
  const body = G.resample([[x - w, top], [x + w, top], [x + w * 0.78, y + h / 2], [x - w * 0.78, y + h / 2]], 5, true);
  celMass(c, body, PAL.navy, PAL.navyDeep, seed, v, { w: 5, sh: 8 * s });
  const rim = G.resample(ellipse(x, top, w, 14 * s), 5, true);
  celMass(c, rim, fill === 'water' ? PAL.navyLight : PAL.navyDeep, null, seed + 10, v, { w: 4 });
  if (fill === 'empty') for (let k = 0; k < 3; k++) inkStroke(c, [[x - 40 * s + k * 34 * s, top - 2], [x - 30 * s + k * 34 * s, top + 4]], { seed: seed + 60 + k + v, w: 2.6, t0: 2, t1: 2, min: 0.3, amp: 0.6, heavy: 0, color: PAL.navyLight });
}
// a dog lead hanging on its hook: a handle loop over the hook, a long strap, a clip at the bottom (too few walks)
export function lead(c, x, y, s, seed, v) {
  celMass(c, G.resample([[x - 60 * s, y - 110 * s], [x + 60 * s, y - 110 * s], [x + 60 * s, y - 92 * s], [x - 60 * s, y - 92 * s]], 4, true), PAL.navy, null, seed, v, { w: 4 }); // the rail
  inkStroke(c, [[x, y - 92 * s], [x, y - 76 * s], [x + 14 * s, y - 70 * s]], { seed: seed + 1 + v, w: 6, t0: 4, t1: 4, min: 0.5, amp: 0.6, heavy: 0, color: PAL.navy }); // the hook
  const handle = G.resample(G.spline([[x, y - 76 * s], [x - 34 * s, y - 50 * s], [x - 20 * s, y - 14 * s], [x + 20 * s, y - 14 * s], [x + 34 * s, y - 50 * s]], true, 4), 4, true);
  inkLoop(c, handle, { seed: seed + 2 + v, w: 12, amp: 0.8, color: PAL.orange });
  const strap = [[x, y - 14 * s], [x + 22 * s, y + 30 * s], [x - 18 * s, y + 70 * s], [x + 10 * s, y + 110 * s]];
  inkStroke(c, strap, { seed: seed + 3 + v, w: 12, t0: 2, t1: 2, min: 1, amp: 0.8, heavy: 0, color: PAL.orange });
  inkStroke(c, strap, { seed: seed + 4 + v, w: 3, t0: 2, t1: 2, min: 0.5, amp: 0.8, heavy: 0, color: PAL.orangeShade });
  celMass(c, G.resample([[x - 9 * s, y + 108 * s], [x + 29 * s, y + 108 * s], [x + 25 * s, y + 140 * s], [x - 5 * s, y + 140 * s]], 4, true), PAL.navyLight, PAL.navy, seed + 5, v, { w: 3.5, sh: 4 * s }); // the clip
  celMass(c, G.resample(circlePts(x + 10 * s, y + 152 * s, 11 * s, 12), 4, true), PAL.navyLight, null, seed + 6, v, { w: 3 });
}
// a water drop (navy light, a cream glint)
export function drop(c, x, y, s, seed, v) {
  const P = G.resample(G.spline([[x, y - 80 * s], [x + 30 * s, y - 30 * s], [x + 48 * s, y + 10 * s], [x + 36 * s, y + 42 * s], [x, y + 56 * s], [x - 36 * s, y + 42 * s], [x - 48 * s, y + 10 * s], [x - 30 * s, y - 30 * s]], true, 4), 4, true);
  celMass(c, P, PAL.navyLight, PAL.navy, seed, v, { w: 5, sh: 9 * s });
  inkStroke(c, [[x - 24 * s, y + 4 * s], [x - 20 * s, y + 26 * s]], { seed: seed + 5 + v, w: 6, t0: 3, t1: 3, min: 0.4, amp: 0.5, heavy: 0, color: PAL.hi });
}

// ------------------------------------------------------------------ this film's props
export const RABBIT = ACCENTS.rabbit;                 // the one product accent: Rabbit treats
export const HAZE = '#D9D0C1', HAZE_SH = '#B8AE9E';   // DERIVED: cream paper darkened 15 % / 28 % (the haze outside; a mood, no product meaning)

// the window on the wall: a frame (navy), two sliding panes; open 0..1 = the right pane slid away, a gap on the left
// half. Outside: a hazy sky, tower blocks fading into it, smoke puffs drifting. fog 0..1 = how thick.
export const WIN = { x0: 330, y0: 680, x1: 960, y1: 1150 };
export function windowOut(c, tq, v, fog = 1) {
  const { x0, y0, x1, y1 } = WIN;
  c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip();
  c.fillStyle = HAZE; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  // tower blocks (HDB slabs), fading into the haze: navy light, hatched windows
  const blocks = [[x0 + 40, 140, 420], [x0 + 210, 110, 300], [x0 + 360, 170, 470], [x0 + 560, 120, 360], [x0 + 680, 110, 250]];
  c.globalAlpha = 1 - 0.55 * fog;
  blocks.forEach(([bx, bw, bh], k) => {
    const P = G.resample([[bx, y1], [bx, y1 - bh], [bx + bw, y1 - bh], [bx + bw, y1]], 5, true);
    celMass(c, P, PAL.navyLight, null, 500 + k * 7, v, { w: 3.5 });
    for (let r = 0; r < Math.floor(bh / 46); r++) inkStroke(c, [[bx + 16, y1 - bh + 30 + r * 46], [bx + bw - 16, y1 - bh + 30 + r * 46]], { seed: 520 + k * 13 + r + v, w: 2.4, t0: 2, t1: 2, min: 0.4, amp: 0.6, heavy: 0, color: PAL.navy });
  });
  c.globalAlpha = 1;
  // drifting smoke puffs (cel FX), haze filled
  for (let k = 0; k < 7; k++) {
    const sp = 18 + 10 * hs(k, 3), px = x0 - 160 + ((hs(k, 1) * 1100 + tq * sp) % 1100), py = y0 + 60 + hs(k, 2) * (y1 - y0 - 120);
    FX.smokePuff(c, px, py, (70 + 50 * hs(k, 4)) * (0.6 + 0.4 * fog), 540 + k * 11 + v, { fill: HAZE, ink: HAZE_SH, w: 4 });
  }
  if (fog > 0.2) { c.globalAlpha = 0.35 * fog; G.hatch(c, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], { seed: 560 + v, gap: 22, ang: -0.5, w: 2, amp: 1.2, color: HAZE_SH, cx: 540, cy: 640 }); c.globalAlpha = 1; }
  c.restore();
}
export function windowFrame(c, v, open = 0, o = {}) {
  const { x0, y0, x1, y1 } = WIN, mx = (x0 + x1) / 2;
  // the panes: left pane fixed on the left half; the sliding pane covers the right half, slid left over it when shut
  // (open = 1: the sliding pane sits over the left pane, the right half is an open gap)
  const slideX = lerp(mx, x0, open) + (o.dx ?? 0), sx = o.smear ?? 1;
  const pane = (px, seed) => {
    const P = G.resample([[px + 6, y0 + 6], [px + (mx - x0) - 6, y0 + 6], [px + (mx - x0) - 6, y1 - 6], [px + 6, y1 - 6]], 5, true);
    c.save(); c.globalAlpha = 0.18; fillShape(c, P, PAL.hi, { seed, amp: 1 }); c.restore();
    inkLoop(c, P, { seed: seed + 1 + v, w: 7, amp: 1, color: PAL.navy });
    inkStroke(c, [[px + 40, y0 + 60], [px + 110, y0 + 20]], { seed: seed + 2 + v, w: 5, t0: 3, t1: 3, min: 0.4, amp: 0.6, heavy: 0, color: PAL.hi }); // glint
  };
  pane(x0, 600);
  c.save(); if (sx !== 1) { c.translate(slideX + (mx - x0) / 2, 0); c.scale(sx, 1); c.translate(-slideX - (mx - x0) / 2, 0); } pane(slideX, 610); c.restore();
  // the frame
  const F = G.resample([[x0 - 26, y0 - 26], [x1 + 26, y0 - 26], [x1 + 26, y1 + 26], [x0 - 26, y1 + 26]], 5, true);
  inkLoop(c, F, { seed: 620 + v, w: 9, amp: 1.2, color: PAL.ink });
  inkLoop(c, G.resample([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 5, true), { seed: 621 + v, w: 6, amp: 1.2, color: PAL.ink });
  // the sill
  celMass(c, G.resample([[x0 - 60, y1 + 26], [x1 + 60, y1 + 26], [x1 + 60, y1 + 62], [x0 - 60, y1 + 62]], 5, true), PAL.hi, '#EADFCB', 630, v, { w: 5, sh: 6 });
}
// haze wisps that drift into the room through the open gap (a few puffs, by index); u = 0..1 along the drift
export function wisp(c, x, y, r, seed, v, stage = 0) { FX.smokePuff(c, x, y, r, seed + v, { fill: HAZE, ink: HAZE_SH, w: 4, stage }); }

// inside: the airway, from the nose (upper left) down the windpipe into two lungs (Rabbit accent as the tissue colour)
export function airway(c, v, glowLung = 0) {
  // the nose tip on the left (ink, a cream nostril) so the airway reads as starting at her nose
  fillShape(c, circlePts(112, 560, 62, 18), PAL.ink, { seed: 690 + v, amp: 1.4 });
  const tube = G.spline([[150, 560], [250, 570], [420, 610], [520, 690], [540, 780], [540, 860]], false, 6);
  inkStroke(c, tube, { seed: 700 + v, w: 118, t0: 1, t1: 1, min: 1, amp: 0.3, heavy: 0, color: PAL.ink, dense: true });
  inkStroke(c, tube, { seed: 701 + v, w: 100, t0: 1, t1: 1, min: 1, amp: 0.3, heavy: 0, color: PAL.hi, dense: true });
  // nose filter hairs near the entrance
  for (let k = 0; k < 6; k++) { const x = 170 + k * 26, top = k % 2; inkStroke(c, top ? [[x, 518], [x + 8, 556]] : [[x, 620], [x + 8, 582]], { seed: 710 + k + v, w: 4, t0: 2, t1: 3, min: 0.3, amp: 0.6, heavy: 0, color: PAL.ink }); }
  // the lungs: two lobes, branches inside
  for (const sd of [-1, 1]) {
    const cx = 540 + sd * 190, prims = [circ(cx, 1060, 170, 30), circ(cx + sd * 10, 920, 120, 30), cone(cx, 900, cx, 1180, 110, 150, 30)];
    const L = outline(prims, 3);
    celMass(c, L, RABBIT.c, RABBIT.shade, 720 + (sd + 1) * 5, v, { w: 6, sh: 16 });
    if (glowLung > 0) inkLoop(c, L.map(([a, b]) => [cx + (a - cx) * 1.06, 1040 + (b - 1040) * 1.06]), { seed: 750 + (sd + 1) * 3 + v, w: 10 * glowLung, amp: 1.6, color: PAL.orange }); // the lungs light up: an orange ring
    for (let b = 0; b < 4; b++) inkStroke(c, [[540 + sd * 30, 880], [cx - sd * 40, 960 + b * 40], [cx + sd * (20 + b * 20), 1000 + b * 50]], { seed: 740 + b + (sd + 1) * 9 + v, w: 4, t0: 3, t1: 5, min: 0.3, amp: 0.8, heavy: 0, color: RABBIT.shade });
  }
  inkStroke(c, [[540, 840], [540, 880], [390, 940]], { seed: 760 + v, w: 26, t0: 2, t1: 8, min: 0.4, amp: 0.4, heavy: 0, color: PAL.ink });
  inkStroke(c, [[540, 840], [540, 880], [690, 940]], { seed: 761 + v, w: 26, t0: 2, t1: 8, min: 0.4, amp: 0.4, heavy: 0, color: PAL.ink });
  return tube;
}
// a speck of haze: big ones are smoke puffs, tiny ones are ink dots
export function speck(c, x, y, r, seed, v) {
  if (r > 12) { FX.smokePuff(c, x, y, r, seed + v, { fill: HAZE, ink: PAL.ink, w: 3 }); return; }
  const P = circlePts(x, y, r, 10); fillShape(c, P, HAZE_SH, { seed: seed + v, amp: 0.6 }); inkLoop(c, P, { seed: seed + 1 + v, w: 3, amp: 0.6 }); // a tiny haze speck, not a pin
}
// the aircon unit high on the wall, blowing clean air (cel lines) when on
export function aircon(c, x, y, s, seed, v, on = 0, tq = 0) {
  const P = G.resample(roundRect(x - 170 * s, y - 50 * s, 340 * s, 100 * s, 22 * s), 5, true);
  celMass(c, P, PAL.hi, '#E6D8BE', seed, v, { w: 5, sh: 8 * s });
  inkStroke(c, [[x - 140 * s, y + 26 * s], [x + 140 * s, y + 26 * s]], { seed: seed + 3 + v, w: 4, t0: 3, t1: 3, min: 0.4, amp: 0.6, heavy: 0, color: PAL.navyLight });
  fillShape(c, circlePts(x + 130 * s, y - 22 * s, 7 * s, 10), on > 0.5 ? RABBIT.c : PAL.navyLight, { seed: seed + 4, amp: 0.4 });
  if (on > 0) for (let k = 0; k < 4; k++) {
    const ph = (tq * 1.6 + k / 4) % 1, yy = y + 70 * s + ph * 160 * s, xx = x - 120 * s + k * 80 * s;
    c.save(); c.globalAlpha = on * (1 - ph);
    inkStroke(c, [[xx, yy], [xx + 14 * s, yy + 30 * s], [xx, yy + 60 * s]], { seed: seed + 10 + k + v, w: 4, t0: 3, t1: 3, min: 0.3, amp: 0.8, heavy: 0, color: PAL.navyLight });
    c.restore();
  }
}
// tiny bits of treat (Rabbit accent), scattered
export function bit(c, x, y, s, seed, v) {
  const P = G.resample([[x - 14 * s, y - 8 * s], [x + 10 * s, y - 14 * s], [x + 16 * s, y + 6 * s], [x - 6 * s, y + 12 * s]], 3, true);
  celMass(c, P, MIYA.apricot, MIYA.apricotShade, seed, v, { w: 3, sh: 3 * s });
}
// the Rabbit treats pouch, redrawn in the cel style (no logo: the logo is on the end card only)
export function pouch(c, x, y, s, seed, v) {
  const w = 290 * s, h = 400 * s, top = y - h;
  const body = G.resample(G.spline([[x - w / 2, top + 20 * s], [x + w / 2, top + 20 * s], [x + w / 2 + 14 * s, y - 60 * s], [x + w / 2 - 10 * s, y], [x - w / 2 + 10 * s, y], [x - w / 2 - 14 * s, y - 60 * s]], true, 5), 5, true);
  celMass(c, body, RABBIT.c, RABBIT.shade, seed, v, { w: 5, sh: 16 * s });
  celMass(c, G.resample([[x - w / 2 + 4, top], [x + w / 2 - 4, top], [x + w / 2 - 4, top + 34 * s], [x - w / 2 + 4, top + 34 * s]], 5, true), PAL.navy, null, seed + 5, v, { w: 4 }); // the seal
  const band = G.resample(roundRect(x - w / 2 + 28 * s, top + 120 * s, w - 56 * s, 170 * s, 16 * s), 5, true);
  celMass(c, band, PAL.hi, null, seed + 10, v, { w: 3.5 });
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = PAL.navy;
  c.font = `600 ${Math.round(56 * s)}px "Oswald"`; if ('letterSpacing' in c) c.letterSpacing = '0.08em';
  c.fillText('RABBIT', x, top + 180 * s);
  c.font = `500 ${Math.round(22 * s)}px "Inter"`; if ('letterSpacing' in c) c.letterSpacing = '0.12em'; c.fillStyle = PAL.navyLight;
  c.fillText('FREEZE-DRIED', x, top + 232 * s); c.fillText('1 INGREDIENT', x, top + 262 * s); c.restore();
}
