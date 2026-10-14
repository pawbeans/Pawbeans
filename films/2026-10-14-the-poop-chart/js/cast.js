// "Inside Your Dog: the poop chart": overlay helpers copied from the Inside Your Dog cast (pill, caption card, cel mass,
// glow), plus this film's props: the 1–7 samples (restrained), the score ruler, the bag hand and the chews tin.
import * as G from '../../../cel/engine.js';
import { PAL, ACCENTS } from '../../../cel/palette.js';
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
  const lines = [[]]; let lw = 0;
  for (const wd of words) {
    c.font = `${wd.b ? 800 : 600} ${size}px "Inter"`;
    const w = c.measureText(wd.w).width;
    if (lw + w > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; }
    lines[lines.length - 1].push({ ...wd, width: w }); lw += w + sp;
  }
  c.restore();
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

// ------------------------------------------------------------------ this film's props
// poop: the brown from the approved Inside Your Dog poop (Venison accent as an object colour, no product meaning)
export const SAGE = ACCENTS['digestive-probiotics'];
export const BROWN = ACCENTS.venison.c, BROWN_SH = ACCENTS.venison.shade, BROWN_HI = '#8A4A3E'; // BROWN_HI: a highlight streak (DERIVED, brown tinted 20 % toward cream)
const cone = (ax, ay, bx, by, r1, r2, k = 10) => ({ t: 'cone', a: { x: ax, y: ay }, b: { x: bx, y: by }, r1, r2, k });
const circ = (x, y, r, k = 10) => ({ t: 'circle', x, y, r, k });
function sheen(c, P, seed, v) { inkStroke(c, P, { seed: seed + v, w: 6, t0: 4, t1: 6, min: 0.3, amp: 0.6, heavy: 0, color: BROWN_HI }); }
// 7: a flat puddle, no texture
export function puddle(c, x, y, s, seed, v) {
  const L = G.resample(G.spline([[x - 130 * s, y], [x - 90 * s, y - 22 * s], [x - 10 * s, y - 26 * s], [x + 60 * s, y - 30 * s], [x + 140 * s, y - 14 * s],
    [x + 120 * s, y + 10 * s], [x + 20 * s, y + 16 * s], [x - 80 * s, y + 14 * s]], true, 4), 5, true);
  celMass(c, L, BROWN, BROWN_SH, seed, v, { w: 4.5, sh: 5 * s });
  sheen(c, [[x - 60 * s, y - 12 * s], [x + 10 * s, y - 16 * s]], seed + 7, v);
}
// 6: a pile with no defined shape
export function pile(c, x, y, s, seed, v) {
  const prims = [circ(x - 40 * s, y - 14 * s, 40 * s, 14 * s), circ(x + 30 * s, y - 16 * s, 44 * s, 14 * s), circ(x - 2 * s, y - 44 * s, 36 * s, 16 * s),
    cone(x - 100 * s, y - 6 * s, x + 100 * s, y - 6 * s, 14 * s, 14 * s, 18 * s)];
  const L = outline(prims.map((p) => ({ ...p })), 2.5);
  if (!L) return;
  const cut = L.filter(([, py]) => py <= y + 2); // flat on the ground
  celMass(c, cut.length > 10 ? cut : L, BROWN, BROWN_SH, seed, v, { w: 4.5, sh: 9 * s });
  sheen(c, [[x - 30 * s, y - 50 * s], [x, y - 64 * s]], seed + 7, v);
}
// a log; segs: 0 = smooth (3), 3 = segmented (2); sag 0..1 = how soggy (5, 4); u: residue split (picked up)
export function log(c, x, y, s, seed, v, o = {}) {
  const sag = o.sag ?? 0, len = (o.len ?? 220) * s, r = (o.r ?? 30) * s * (1 - 0.25 * sag);
  const n = o.segs || 1, prims = [];
  if (n > 1) {
    for (let i = 0; i < n; i++) { const cx = x - len / 2 + len * (i + 0.5) / n, cy = y - r + (i % 2 ? -3 : 3) * s; prims.push(circ(cx, cy, r * 1.08, 4 * s)); prims.push(cone(cx - len / n * 0.32, cy, cx + len / n * 0.32, cy, r, r, 4 * s)); }
  } else {
    prims.push(cone(x - len / 2, y - r + sag * 8 * s, x + len / 2, y - r + sag * 4 * s, r * (1 + 0.3 * sag), r, 10 * s));
    if (sag > 0) prims.push(cone(x - len * 0.6, y - 6 * s, x + len * 0.6, y - 6 * s, 10 * s, 10 * s, 18 * s));
  }
  const L = outline(prims, 2.5);
  if (!L) return;
  celMass(c, L.map(([a, b]) => [a, Math.min(b, y + 2)]), BROWN, BROWN_SH, seed, v, { w: 4.5, sh: 9 * s });
  if (n > 1) for (let i = 1; i < n; i++) { const sx = x - len / 2 + len * i / n; inkStroke(c, [[sx - 4 * s, y - 2 * r + 4 * s], [sx + 3 * s, y - r], [sx - 2 * s, y - 4 * s]], { seed: seed + 20 + i + v, w: 4, t0: 3, t1: 3, min: 0.3, amp: 0.8, heavy: 0 }); }
  sheen(c, [[x - len * 0.3, y - r * 1.6], [x + len * 0.1, y - r * 1.7]], seed + 7, v);
}
// 1: hard dry pellets (each falls in on its own clock); P = [[x, y, r], ...]
export function pellet(c, x, y, r, seed, v, o = {}) {
  c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); if (o.sx) c.scale(o.sx, o.sy ?? 1);
  const L = G.resample(circlePts(0, -r, r, 18), 4, true);
  celMass(c, L, BROWN, BROWN_SH, seed, v, { w: 4, sh: r * 0.35 });
  for (let k = 0; k < 2; k++) inkStroke(c, [[-r * 0.4 + k * r * 0.5, -r * 1.3], [-r * 0.2 + k * r * 0.5, -r * 1.0]], { seed: seed + 9 + k + v, w: 2.4, t0: 2, t1: 2, min: 0.3, amp: 0.5, heavy: 0, color: BROWN_SH });
  c.restore();
}
// the score ruler: 7 cells; o.hi = {n: 'ring'|'star'|'goal'}; o.stamp(n) → 0..1 pop scale of each number
export const RULER = { x0: 120, x1: 940, y: 1150, h: 96 };
export function ruler(c, v, o = {}) {
  const { x0, x1, y, h } = RULER, cw = (x1 - x0) / 7;
  const P = G.resample(roundRect(x0, y, x1 - x0, h, 16), 6, true);
  fillShape(c, P.map(([a, b]) => [a + 6, b + 8]), 'rgba(27,47,82,0.25)', { seed: 700 + v, amp: 1 });
  celMass(c, P, PAL.hi, '#EADFCB', 701, v, { w: 4.5, sh: 6 });
  for (let i = 1; i < 7; i++) inkStroke(c, [[x0 + cw * i, y + 8], [x0 + cw * i, y + h - 8]], { seed: 710 + i + v, w: 3, t0: 3, t1: 3, min: 0.4, amp: 0.8, heavy: 0, color: PAL.navyLight });
  for (let n = 1; n <= 7; n++) {
    const cx = x0 + cw * (n - 0.5), cy = y + h / 2, sc = o.stamp ? o.stamp(n) : 1, hi = o.hi?.[n];
    if (sc <= 0) continue;
    c.save(); c.translate(cx, cy); c.scale(sc, sc);
    if (hi === 'goal') { fillShape(c, circlePts(0, 0, 40, 30), SAGE.c, { seed: 720 + v, amp: 1.2, dx: REG.dx, dy: REG.dy }); inkLoop(c, circlePts(0, 0, 40, 30), { seed: 721 + v, w: 4, amp: 1.2 }); }
    if (hi === 'ring') inkLoop(c, circlePts(0, 0, 42, 30), { seed: 722 + n + v, w: 6, amp: 1.6, color: PAL.orange });
    c.font = '600 60px "Fraunces"'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = hi === 'ring' ? PAL.orangeShade : PAL.navy; c.fillText(String(n), (v % 2 ? 1 : 0), 4);
    c.restore();
    if (hi === 'goal' || hi === 'star') { // a star over the cell: filled for the goal, outline only for "close"
      const S = FX.starPts(5, 26, 11, 730 + n, -Math.PI / 2, 0.05).map(([a, b]) => [a + cx, b + y - 10]);
      if (hi === 'goal') fillShape(c, S, PAL.orange, { seed: 731 + v, amp: 0.6 });
      inkLoop(c, S, { seed: 732 + v, w: 3.5, amp: 0.8, color: hi === 'goal' ? PAL.ink : PAL.orange });
    }
  }
}
// a hand in a navy sleeve holding a cream poop bag, reaching in from the right; grip 0..1 closes the bag
export function bagHand(c, x, y, s, seed, v, grip = 0) {
  celMass(c, G.resample(G.spline([[x + 60 * s, y - 40 * s], [x + 420 * s, y - 70 * s], [x + 430 * s, y + 30 * s], [x + 70 * s, y + 40 * s]], true, 5), 5, true), PAL.navy, PAL.navyDeep, seed, v, { w: 5, sh: 8 * s }); // sleeve
  const bw = 1 - 0.25 * grip;
  const bag = G.resample(G.spline([[x + 70 * s, y - 50 * s], [x - 60 * s * bw, y - 64 * s * bw], [x - 110 * s * bw, y], [x - 60 * s * bw, y + 66 * s * bw], [x + 70 * s, y + 50 * s], [x + 50 * s, y]], true, 5), 5, true);
  celMass(c, bag, PAL.hi, '#EADFCB', seed + 10, v, { w: 4.5, sh: 7 * s });
  for (let k = 0; k < 3; k++) inkStroke(c, [[x + (40 - k * 30) * s, y - (40 - k * 4) * s], [x + (30 - k * 34) * s, y + (40 - k * 4) * s]], { seed: seed + 20 + k + v, w: 2.6, t0: 3, t1: 3, min: 0.3, amp: 0.8, heavy: 0, color: '#C9BBA2' }); // creases
  celMass(c, circlePts(x + 70 * s, y, 26 * s, 16), PAL.navyLight, null, seed + 30, v, { w: 4 }); // cuff
}
// the Digestive Probiotics chews tin, redrawn in the cel style (no logo: the logo is on the end card only)
export function tin(c, x, y, s, seed, v) {
  const w = 300 * s, h = 330 * s, ry = 34 * s, top = y - h;
  const body = G.resample([[x - w / 2, top], [x + w / 2, top], [x + w / 2, y], ...Array.from({ length: 21 }, (_, i) => [x + w / 2 * Math.cos(Math.PI * i / 20), y + ry * Math.sin(Math.PI * i / 20)]), [x - w / 2, y]], 5, true);
  celMass(c, body, SAGE.c, SAGE.shade, seed, v, { w: 5, sh: 16 * s });
  // label band
  const ly0 = top + h * 0.3, ly1 = top + h * 0.78;
  const band = G.resample([[x - w / 2 + 4, ly0], [x + w / 2 - 4, ly0], [x + w / 2 - 4, ly1], ...Array.from({ length: 11 }, (_, i) => [x + (w / 2 - 4) * Math.cos(Math.PI * i / 10), ly1 + ry * 0.6 * Math.sin(Math.PI * i / 10)]), [x - w / 2 + 4, ly1]], 5, true);
  celMass(c, band, PAL.hi, null, seed + 10, v, { w: 3.5 });
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = PAL.navy;
  c.font = `600 ${Math.round(40 * s)}px "Oswald"`; if ('letterSpacing' in c) c.letterSpacing = '0.08em';
  c.fillText('DIGESTIVE', x, ly0 + (ly1 - ly0) * 0.3); c.fillText('PROBIOTICS', x, ly0 + (ly1 - ly0) * 0.58);
  c.font = `500 ${Math.round(22 * s)}px "Inter"`; if ('letterSpacing' in c) c.letterSpacing = '0.12em'; c.fillStyle = PAL.navyLight;
  c.fillText('SOFT CHEWS', x, ly0 + (ly1 - ly0) * 0.84); c.restore();
  // lid
  const lidTop = circlePts(x, top, ry, 40, w / 2 + 6 * s);
  const lid = G.resample([[x - w / 2 - 6 * s, top - 34 * s], ...Array.from({ length: 21 }, (_, i) => [x - (w / 2 + 6 * s) * Math.cos(Math.PI * i / 20), top - 34 * s - ry * Math.sin(Math.PI * i / 20)]).slice(1), [x + w / 2 + 6 * s, top], ...Array.from({ length: 21 }, (_, i) => [x + (w / 2 + 6 * s) * Math.cos(Math.PI * i / 20), top + ry * Math.sin(Math.PI * i / 20)]).slice(1)], 5, true);
  celMass(c, lid, PAL.navy, PAL.navyDeep, seed + 20, v, { w: 5, sh: 8 * s });
  inkLoop(c, G.resample(lidTop.map(([a, b]) => [a, b - 34 * s]), 5, true), { seed: seed + 25 + v, w: 3.5, amp: 1, color: PAL.ink });
}
// a bush (sage), for modesty
export function bush(c, x, y, s, seed, v) {
  const prims = [circ(x - 70 * s, y - 60 * s, 70 * s, 20 * s), circ(x + 40 * s, y - 80 * s, 84 * s, 20 * s), circ(x - 10 * s, y - 150 * s, 70 * s, 20 * s), circ(x + 110 * s, y - 40 * s, 52 * s, 20 * s), cone(x - 130 * s, y - 10 * s, x + 150 * s, y - 10 * s, 16 * s, 16 * s, 20 * s)];
  const L = outline(prims, 3);
  if (!L) return;
  celMass(c, L.map(([a, b]) => [a, Math.min(b, y + 2)]), SAGE.c, SAGE.shade, seed, v, { w: 5, sh: 14 * s });
  for (let k = 0; k < 5; k++) { const a = -2.6 + k * 0.5, px = x + Math.cos(a) * 90 * s, py = y - 90 * s + Math.sin(a) * 60 * s; inkStroke(c, [[px, py], [px + 14 * s, py - 12 * s]], { seed: seed + 30 + k + v, w: 3, t0: 2, t1: 3, min: 0.3, amp: 0.6, heavy: 0, color: SAGE.shade }); }
}
