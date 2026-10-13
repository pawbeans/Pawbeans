// BEANS cel FX: hand-drawn effects layered over the main animation (Buck-style hybrid): sparks, twinkles, star
// bursts, speed lines, smoke puffs that dissipate through holes, impact frames. Pure functions of their inputs + seed.
// Sparks / twinkles / star bursts / speed lines adapted from mg-styles-15/demos/05-cel-boil/js/scene.js (MIT).
import * as G from './engine.js';
import { PAL } from './palette.js';
import { field, primBounds, contours } from './shape.js';

const { hs, xf, spline, fillShape, inkLoop, inkStroke, circlePts } = G;
export const REG = { dx: -4, dy: 3 };

export function starPts(n, rOut, rIn, seed, rot = 0, jit = 0.25) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2 + (hs(seed, i, 1) - 0.5) * (Math.PI / n) * 0.6;
    const ro = rOut * (1 - jit + jit * 2 * hs(seed, i, 2));
    P.push([Math.cos(a) * ro, Math.sin(a) * ro, 1]);
    const b = a + Math.PI / n + (hs(seed, i, 3) - 0.5) * (Math.PI / n) * 0.3;
    const ri = rIn * (0.85 + 0.3 * hs(seed, i, 4));
    P.push([Math.cos(b) * ri, Math.sin(b) * ri]);
  }
  return P;
}

// four-point twinkle
export function drawTwinkle(c, x, y, R, seed, o = {}) {
  if (R < 2) return;
  const P = [];
  const rot = o.rot ?? 0;
  for (let i = 0; i < 4; i++) {
    const a = rot + (i * Math.PI) / 2, r = R * (i % 2 ? 0.78 : 1) * (0.92 + 0.16 * hs(seed, i));
    P.push([x + Math.cos(a) * r, y + Math.sin(a) * r, 1]);
    const b = a + Math.PI / 4;
    P.push([x + Math.cos(b) * R * 0.2, y + Math.sin(b) * R * 0.2]);
  }
  const d = spline(P, true, 3);
  fillShape(c, d, o.fill ?? PAL.hi, { seed, amp: 1.2, dx: REG.dx * 0.6, dy: REG.dy * 0.6 });
  inkLoop(c, d, { seed, w: o.w ?? Math.max(2.5, R * 0.09), amp: 1.2, t0: 4, t1: 8, heavy: 0.2, color: o.ink ?? PAL.ink });
}

// teardrop spark oriented along its velocity (vx, vy)
export function drawSpark(c, x, y, vx, vy, size, seed, o = {}) {
  const sp = Math.hypot(vx, vy) || 1;
  const len = size * (1.4 + Math.min(5, sp / 450)), r = size * 0.55;
  const P = [[r, 0], [r * 0.7, r * 0.72], [0, r], [-len, 0, 1], [0, -r], [r * 0.7, -r * 0.72]];
  const d = spline(xf(P, { x, y, r: Math.atan2(vy, vx) }), true, 3);
  if (o.inkOnly) { fillShape(c, d, o.ink ?? PAL.ink, { seed, amp: 1 }); return; }
  fillShape(c, d, o.fill ?? PAL.hi, { seed, amp: 1.2, dx: REG.dx * 0.5, dy: REG.dy * 0.5 });
  inkLoop(c, d, { seed, w: Math.max(2.2, size * 0.16), amp: 1, t0: 3, t1: 10, heavy: 0.2, color: o.ink ?? PAL.ink });
}

// layered star burst: outer, middle and core stars
export function drawStarburst(c, x, y, R, seed, rot, cols, o = {}) {
  const outer = spline(xf(starPts(o.n ?? 15, R, R * (o.ri ?? 0.5), seed, rot, 0.28), { x, y }), true, 6);
  fillShape(c, outer, cols[0], { seed, amp: 2.5, dx: REG.dx, dy: REG.dy });
  const mid = spline(xf(starPts(11, R * 0.66, R * 0.36, seed + 1, rot + 0.2, 0.3), { x, y }), true, 5);
  fillShape(c, mid, cols[1], { seed: seed + 2, amp: 2.5, dx: REG.dx, dy: REG.dy });
  const core = spline(xf(starPts(9, R * 0.34, R * 0.2, seed + 3, rot + 0.5, 0.3), { x, y }), true, 4);
  fillShape(c, core, cols[2], { seed: seed + 4, amp: 2 });
  inkLoop(c, outer, { seed: seed + 5, w: o.w ?? 9, amp: 2.5, heavy: 0.3, splits: 2, color: o.ink ?? PAL.ink });
}

export function speedLinesRadial(c, cx, cy, r0, r1, n, seed, w = 7, dir = 1, color = PAL.ink) {
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + hs(seed, k) * 0.5;
    const a0 = r0 * (0.9 + 0.3 * hs(seed, k, 2)), a1 = r1 * (0.8 + 0.4 * hs(seed, k, 3));
    const P = [[cx + Math.cos(a) * a0, cy + Math.sin(a) * a0], [cx + Math.cos(a) * a1, cy + Math.sin(a) * a1]];
    inkStroke(c, dir > 0 ? P : P.reverse(), { seed: seed * 7 + k, w: w * (0.6 + 0.8 * hs(seed, k, 4)), t0: 12, t1: 90, min: 0.05, amp: 1.5, heavy: 0, color });
  }
}

// smoke puff: a smooth union of circles traced into one outline, cream fill, ink line, one inked shade curl,
// and dissipation holes (stage 0 solid → 1 small hole → 2 big hole → 3 broken ring → gone)
export function smokePuff(c, x, y, r, seed, o = {}) {
  if (r < 3) return;
  const stage = o.stage ?? 0;
  if (stage >= 4) return;
  const n = o.n ?? 7, prims = [{ t: 'circle', x, y, r: r * 0.62, k: r * 0.12 }];
  for (let i = 1; i < n; i++) { // a ring of lobes round a core: a cloudy, billowing silhouette
    const a = (i / (n - 1)) * Math.PI * 2 + hs(seed, i) * 0.5, d = r * (0.5 + 0.12 * hs(seed, i, 3));
    prims.push({ t: 'circle', x: x + Math.cos(a) * d * (o.wide ?? 1), y: y + Math.sin(a) * d * 0.8, r: r * (0.34 + 0.16 * hs(seed, i, 2)), k: r * 0.12 });
  }
  const ha = hs(seed, 26) * 6.28;
  const holes = stage === 1 ? [{ x: x + Math.cos(ha) * r * 0.25, y: y + Math.sin(ha) * r * 0.2, r: r * 0.3 }]
    : stage === 2 ? [{ x: x + Math.cos(ha) * r * 0.15, y: y + Math.sin(ha) * r * 0.12, r: r * 0.62 }]
    : stage === 3 ? [{ x, y, r: r * 0.92 }, { x: x + Math.cos(ha + 2.6) * r * 0.9, y: y + Math.sin(ha + 2.6) * r * 0.6, r: r * 0.45 }] : [];
  for (const h of holes) prims.push({ t: 'circle', ...h, sub: true });
  const loops = contours(field(prims), primBounds(prims, 8), Math.max(2, r / 24));
  for (const L of loops) {
    if (L.length < 10) continue;
    fillShape(c, L, o.fill ?? PAL.hi, { seed: seed + 1, amp: 1.6, dx: REG.dx, dy: REG.dy });
  }
  for (const [k, L] of loops.entries()) {
    if (L.length < 10) continue;
    inkLoop(c, L, { seed: seed + 3 + k, w: o.w ?? Math.max(3, r * 0.06), amp: 1.6, heavy: 0.4, color: o.ink ?? PAL.ink });
  }
  if (stage === 0 && r > 24) { // one inked shade curl in the lower right
    const P = [], a0 = 0.2 + hs(seed, 5) * 0.3, a1 = a0 + 1.2;
    for (let i = 0; i <= 10; i++) { const a = a0 + (a1 - a0) * i / 10; P.push([x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.55]); }
    inkStroke(c, P, { seed: seed + 9, w: (o.w ?? Math.max(3, r * 0.06)) * 0.75, t0: 10, t1: 16, min: 0.1, amp: 1.2, heavy: 0, color: o.ink ?? PAL.ink });
  }
}

// full-frame impact frame: flat colour + a star (hold for 1 frame each, on 1s)
export function impactFrame(c, W, H, x, y, bg, star, seed, o = {}) {
  c.save(); c.fillStyle = bg; c.fillRect(0, 0, W, H);
  if (o.lines) speedLinesRadial(c, x, y, 380, Math.max(W, H), 30, seed + 7, 16, 1, o.lineColor ?? PAL.ink);
  const P = spline(xf(starPts(14, o.R ?? 620, (o.R ?? 620) * 0.45, seed, seed * 0.3, 0.3), { x, y }), true, 6);
  fillShape(c, P, star, { seed, amp: 2 });
  if (o.core) { const Q = spline(xf(starPts(10, (o.R ?? 620) * 0.45, (o.R ?? 620) * 0.24, seed + 1, 0.4, 0.3), { x, y }), true, 5); fillShape(c, Q, o.core, { seed: seed + 2, amp: 2 }); }
  c.restore();
}
