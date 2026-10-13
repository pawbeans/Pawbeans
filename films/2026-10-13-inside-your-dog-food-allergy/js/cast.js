// "Inside Your Dog: Food Allergy" cast, built once as reusable cel rigs (the brief's Cast table, in BEANS cel style).
// Every rig: smooth-union silhouette (cel/shape.js) → off-register flat fill → one cel shadow crescent → boiling ink.
import * as G from '../../../cel/engine.js';
import { PAL, ACCENTS, MIYA } from '../../../cel/palette.js';
import { field, primBounds, contours } from '../../../cel/shape.js';
import * as FX from '../../../cel/fx.js';

const { hs, lerp, clamp, spline, xf, circlePts, fillShape, inkLoop, inkStroke, polyPath, E, K } = G;

// cast colours: all from the approved BEANS palette
export const COL = {
  protein: PAL.orange, proteinShade: PAL.orangeShade, proteinEdge: '#8E3F1B',
  neverMet: ACCENTS['digestive-probiotics'].c, neverMetShade: ACCENTS['digestive-probiotics'].shade,
  mast: ACCENTS['skin-coat'].c, mastShade: ACCENTS['skin-coat'].shade, mastHot: '#F7A07A', mastHotShade: '#C8704C',
  guard: ACCENTS['allergy-itch'].c, guardShade: ACCENTS['allergy-itch'].shade,
  bcell: ACCENTS.calming.c, bcellShade: ACCENTS.calming.shade,
  histamine: ACCENTS.calming.shade, itch: ACCENTS.multivitamin.c, itchShade: ACCENTS.multivitamin.shade,
  brain: ACCENTS['skin-coat'].c, brainShade: ACCENTS['skin-coat'].shade,
  gut: ACCENTS['hip-joint'].c, gutShade: ACCENTS['hip-joint'].shade, villus: '#FFF1E2',
  antibody: PAL.hi, antibodyShade: '#E4D6C2',
  crumb: MIYA.apricotShade, crumbShade: '#A8835A',
  poop: ACCENTS.venison.c, poopShade: ACCENTS.venison.shade, stink: ACCENTS.rabbit.c,
};
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
// wobbling blob: core + ring of lobes that breathe with time (cell bodies)
export function blobPrims(x, y, r, seed, t, o = {}) {
  const prims = [{ t: 'circle', x, y, r: r * 0.8, k: r * 0.3 }];
  const n = o.lobes ?? 7, w = o.wob ?? 0.06;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + hs(seed, i) * 0.7;
    const d = r * (0.38 + w * Math.sin(t * 2.1 + i * 1.9 + seed));
    prims.push({ t: 'circle', x: x + Math.cos(a) * d * (o.sx ?? 1), y: y + Math.sin(a) * d * (o.sy ?? 1), r: r * (0.5 + 0.08 * hs(seed, i, 2)), k: r * 0.3 });
  }
  return prims;
}

// ------------------------------------------------------------------ faces (restrained, ink only)
// state: asleep | open | curious | shocked | dizzy | happy ; look: -1..1 (pupil shift)
export function face(c, x, y, s, state, seed, v, o = {}) {
  const ex = 0.32 * s, ey = -0.08 * s, er = 0.085 * s, lw = Math.max(3, s * 0.03);
  const st = { seed: seed + v * 5, w: lw, t0: 3, t1: 3, amp: 0.6, heavy: 0, color: o.ink ?? PAL.ink };
  for (const sd of [-1, 1]) {
    const cx = x + sd * ex, cy = y + ey;
    if (state === 'asleep') inkStroke(c, [[cx - er * 1.3, cy - er * 0.2], [cx, cy + er * 0.7], [cx + er * 1.3, cy - er * 0.2]], { ...st, seed: st.seed + sd });
    else if (state === 'happy') inkStroke(c, [[cx - er * 1.3, cy + er * 0.4], [cx, cy - er * 0.8], [cx + er * 1.3, cy + er * 0.4]], { ...st, seed: st.seed + sd });
    else if (state === 'dizzy') { const P = []; for (let i = 0; i <= 24; i++) { const a = i * 0.55 * sd, r = er * 1.4 * i / 24; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } inkStroke(c, P, { ...st, seed: st.seed + sd, w: lw * 0.8 }); }
    else {
      const big = state === 'shocked' ? 1.7 : 1.15;
      if (state === 'shocked') { fillShape(c, circlePts(cx, cy, er * big, 18), PAL.hi, { seed: seed + sd, amp: 0.5 }); inkLoop(c, circlePts(cx, cy, er * big, 18), { ...st, seed: st.seed + sd + 2, w: lw * 0.8 }); }
      const px = cx + (o.look ?? 0) * er * 0.5;
      fillShape(c, circlePts(px, cy, er * (state === 'shocked' ? 0.7 : 1), 14), o.ink ?? PAL.ink, { seed: seed + sd + 4, amp: 0.4 });
      c.fillStyle = PAL.hi; c.beginPath(); c.arc(px - er * 0.3, cy - er * 0.35, Math.max(1.6, er * 0.28), 0, 7); c.fill();
      if (state === 'shocked') inkStroke(c, [[cx - er * 1.4, cy - er * 2.6 - sd * 0], [cx + er * 1.2, cy - er * 2.9]].map(([a, b]) => [sd > 0 ? a : 2 * cx - a, b]), { ...st, seed: st.seed + sd + 6 });
    }
  }
  const my = y + 0.16 * s;
  if (state === 'shocked') { const O = circlePts(x, my + 0.03 * s, 0.075 * s, 16, 0.06 * s); fillShape(c, O, o.ink ?? PAL.ink, { seed: seed + 9, amp: 0.5 }); }
  else if (state === 'dizzy') { const P = []; for (let i = 0; i <= 12; i++) P.push([x - 0.14 * s + 0.28 * s * i / 12, my + Math.sin(i * 1.3) * 0.025 * s]); inkStroke(c, P, { ...st, seed: st.seed + 11 }); }
  else if (state === 'happy') { const P = [[x - 0.14 * s, my - 0.01 * s], [x, my + 0.1 * s], [x + 0.14 * s, my - 0.01 * s]]; const M = spline([...P, [x, my + 0.02 * s]], true, 2); fillShape(c, M, o.ink ?? PAL.ink, { seed: seed + 12, amp: 0.4 }); }
  else inkStroke(c, [[x - 0.08 * s, my], [x, my + 0.035 * s], [x + 0.08 * s, my]], { ...st, seed: st.seed + 13 });
}

// ------------------------------------------------------------------ proteins
// trigger protein: a rounded-corner triangle gem, darker lower facet, cream highlight, warm stepped glow.
// It must look identical everywhere: only position, size, rotation and glow change.
export function proteinGem(c, x, y, r, rot, seed, v, o = {}) {
  if (o.glow !== 0) glow(c, x, y, r * 1.25, COL.protein, 50, v, 0.16 * (o.glow ?? 1));
  const sx = o.sx ?? 1, sy = o.sy ?? 1;
  const V = [0, 1, 2].map((i) => { const a = rot - Math.PI / 2 + i * (Math.PI * 2 / 3); return { x: x + Math.cos(a) * r * 0.62 * sx, y: y + Math.sin(a) * r * 0.62 * sy }; });
  const prims = [];
  for (let i = 0; i < 3; i++) prims.push({ t: 'cone', a: V[i], b: V[(i + 1) % 3], r1: r * 0.28, r2: r * 0.28, k: r * 0.1 });
  prims.push({ t: 'circle', x, y, r: r * 0.42, k: r * 0.2 });
  const loop = outline(prims, Math.max(1.5, r / 30));
  celMass(c, loop, COL.protein, null, 70, v, { w: Math.max(3, r * 0.07), inside: (cc) => {
    cc.beginPath(); cc.rect(x - r * 2, y + r * 0.05, r * 4, r * 2); cc.fillStyle = COL.proteinShade; cc.fill(); // lower facet
    inkStroke(cc, [[V[1].x, V[1].y], [x, y + r * 0.05], [V[2].x, V[2].y]].map(([a, b], i) => i === 1 ? [a, b] : [lerp(a, x, 0.25), lerp(b, y, 0.25)]), { seed: 71 + v, w: Math.max(2, r * 0.035), t0: 4, t1: 4, amp: 0.6, heavy: 0, color: COL.proteinEdge });
  } });
  inkStroke(c, [[V[0].x - r * 0.12, V[0].y + r * 0.3], [lerp(V[0].x, V[2].x, 0.38) - r * 0.08, lerp(V[0].y, V[2].y, 0.38)]], { seed: 73 + v, w: Math.max(3, r * 0.09), t0: 4, t1: 6, amp: 0.5, heavy: 0, color: PAL.hi });
}
// never-met protein: a glossy sage sphere with a soft green glow
export function neverMet(c, x, y, r, seed, v, o = {}) {
  glow(c, x, y, r * 1.3, COL.neverMet, 80, v, 0.18 * (o.glow ?? 1));
  celMass(c, circlePts(x, y, r, 40), COL.neverMet, COL.neverMetShade, 81, v, { w: Math.max(3, r * 0.07), sh: r * 0.22 });
  inkStroke(c, [[x - r * 0.5, y - r * 0.1], [x - r * 0.35, y - r * 0.45], [x - r * 0.05, y - r * 0.58]], { seed: 84 + v, w: Math.max(3, r * 0.12), t0: 4, t1: 8, amp: 0.5, heavy: 0, color: PAL.hi });
}

// ------------------------------------------------------------------ antibody: a Y with cupped tips
export function antibody(c, x, y, ang, s, seed, v, o = {}) {
  const trig = o.triggered;
  const T = (px, py) => { const ca = Math.cos(ang), sa = Math.sin(ang); return { x: x + (px * ca - py * sa) * s, y: y + (px * sa + py * ca) * s }; };
  // local: stem along -y from base (0,0) to fork (0,-30); arms to (±18,-52); ang = direction the tips point
  const base = T(0, 0), fork = T(0, -30), aL = T(-18, -54), aR = T(18, -54);
  const prims = [
    { t: 'cone', a: base, b: fork, r1: 5.5 * s, r2: 6 * s, k: 3 * s },
    { t: 'cone', a: fork, b: aL, r1: 6 * s, r2: 5 * s, k: 3 * s },
    { t: 'cone', a: fork, b: aR, r1: 6 * s, r2: 5 * s, k: 3 * s },
    { t: 'circle', x: aL.x, y: aL.y, r: 7 * s, k: 2 * s }, { t: 'circle', x: aR.x, y: aR.y, r: 7 * s, k: 2 * s },
  ];
  // cupped tips: carve a small notch at each tip
  const nL = T(-21, -60), nR = T(21, -60);
  prims.push({ t: 'circle', x: nL.x, y: nL.y, r: 3.8 * s, sub: true }, { t: 'circle', x: nR.x, y: nR.y, r: 3.8 * s, sub: true });
  if (trig) glow(c, fork.x, fork.y, 34 * s, PAL.orange, 90, v, 0.2);
  const loop = outline(prims, Math.max(1.2, s * 1.4));
  celMass(c, loop, trig ? PAL.orange : COL.antibody, trig ? PAL.orangeShade : COL.antibodyShade, seed, v, { w: Math.max(2.2, 2.6 * s), sh: 3.5 * s, amp: 1 });
}

// ------------------------------------------------------------------ cells
// mast cell: blossom-pink wobbling blob packed with lilac + sunny granules; heat 0..1 shifts it to coral
export function mastCell(c, x, y, r, t, seed, v, o = {}) {
  const heat = o.heat ?? 0, fill = o.empty ?? 0;
  const col = heat > 0.5 ? COL.mastHot : COL.mast, sh = heat > 0.5 ? COL.mastHotShade : COL.mastShade;
  const prims = blobPrims(x, y, r * (o.swell ?? 1), seed, t, { wob: 0.05 + 0.04 * heat, sx: o.sx ?? 1, sy: o.sy ?? 1 });
  const loop = outline(prims, Math.max(2, r / 70));
  const jit = (o.jitter ?? 0);
  celMass(c, loop, col, sh, seed, v, { w: o.w ?? Math.max(3, r * 0.026), sh: r * 0.07, inside: (cc) => {
    const n = Math.round(26 * (1 - fill));
    for (let i = 0; i < n; i++) {
      const a = hs(seed, i, 1) * 6.28, d = Math.sqrt(hs(seed, i, 2)) * r * 0.72;
      const gx = x + Math.cos(a) * d + (hs(seed, i, v + 9) - 0.5) * jit, gy = y + 0.12 * r + Math.sin(a) * d * 0.8 + (hs(seed, i, v + 11) - 0.5) * jit;
      if (Math.hypot(gx - x, gy - y + 0.15 * r) < r * 0.36) continue; // keep the face clear
      const gr = r * (0.045 + 0.025 * hs(seed, i, 3));
      fillShape(cc, circlePts(gx, gy, gr, 12), i % 3 ? COL.histamine : COL.itch, { seed: seed + i, amp: 0.4 });
    }
  } });
  if (o.face) face(c, x, y - 0.06 * r, r * 0.95, o.face, seed + 40, v, { look: o.look });
  return loop;
}
// docking angles of the antibodies round a mast cell (top two first)
export function dockAngles(n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(-Math.PI / 2 + (i % 2 ? 1 : -1) * (0.32 + Math.floor(i / 2) * (Math.PI * 2 / n)));
  return out;
}
// guard immune cell: sky blob with 8 wobbling tapered arms ending in round tips; alarm tints it orange
export function guardCell(c, x, y, r, t, seed, v, o = {}) {
  const prims = blobPrims(x, y, r, seed, t, { wob: 0.05 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2 + 0.18 * Math.sin(t * 3 + i * 1.7), L = r * (1.45 + 0.12 * Math.sin(t * 2.2 + i));
    const tip = { x: x + Math.cos(a) * L, y: y + Math.sin(a) * L };
    prims.push({ t: 'cone', a: { x: x + Math.cos(a) * r * 0.7, y: y + Math.sin(a) * r * 0.7 }, b: tip, r1: r * 0.2, r2: r * 0.08, k: r * 0.12 });
    prims.push({ t: 'circle', x: tip.x, y: tip.y, r: r * 0.12, k: r * 0.05 });
  }
  const loop = outline(prims, Math.max(2, r / 60));
  const alarm = o.alarm ?? 0;
  celMass(c, loop, alarm > 0.5 ? '#F6B9A0' : COL.guard, alarm > 0.5 ? PAL.orangeShade : COL.guardShade, seed, v, { w: Math.max(3, r * 0.035), sh: r * 0.09 });
  face(c, x, y - 0.05 * r, r * 0.95, o.face ?? 'curious', seed + 30, v, { look: o.look });
}
// B cell: lilac blob, no arms
export function bCell(c, x, y, r, t, seed, v, o = {}) {
  const prims = blobPrims(x, y, r * (o.swell ?? 1), seed, t, { wob: 0.05, sx: o.sx ?? 1, sy: o.sy ?? 1 });
  celMass(c, outline(prims, Math.max(2, r / 60)), COL.bcell, COL.bcellShade, seed, v, { w: Math.max(3, r * 0.035), sh: r * 0.09 });
  face(c, x, y - 0.05 * r, r * 0.95, o.face ?? 'open', seed + 30, v);
}

// ------------------------------------------------------------------ brain
export function brain(c, x, y, s, t, seed, v, o = {}) {
  const pop = o.pop ?? 1, S = s * pop;
  if (o.lit) {
    glow(c, x, y, 230 * S, PAL.orange, 120, v, 0.18 * o.lit);
    for (let i = 0; i < 14; i++) { // flickering rays
      const a = (i / 14) * Math.PI * 2 + 0.1, r0 = 250 * S * (1 + 0.05 * ((v + i) % 2)), r1 = r0 + (50 + 30 * hs(i, v)) * S * o.lit;
      inkStroke(c, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { seed: 130 + i + v * 3, w: 8 * S, t0: 6, t1: 10, amp: 1, heavy: 0, color: PAL.orange });
    }
  }
  const prims = [
    { t: 'circle', x: x - 92 * S, y: y - 10 * S, r: 130 * S, k: 30 * S }, { t: 'circle', x: x + 92 * S, y: y - 10 * S, r: 130 * S, k: 30 * S },
    { t: 'circle', x: x - 60 * S, y: y - 80 * S, r: 95 * S, k: 30 * S }, { t: 'circle', x: x + 60 * S, y: y - 80 * S, r: 95 * S, k: 30 * S },
    { t: 'cone', a: { x, y: y + 80 * S }, b: { x: x + 8 * S, y: y + 210 * S }, r1: 42 * S, r2: 28 * S, k: 26 * S }, // stem
  ];
  const loop = outline(prims, 3);
  celMass(c, loop, o.lit ? '#FCD9C4' : COL.brain, COL.brainShade, seed, v, { w: 5.5 * S, sh: 18 * S, inside: (cc) => {
    // grooves: a central fissure and wiggly sulci on each lobe
    const gk = { seed: seed + 20 + v, w: 4 * S, t0: 8, t1: 8, min: 0.3, amp: 1.2, heavy: 0, color: COL.brainShade };
    inkStroke(cc, [[x, y - 170 * S], [x - 6 * S, y - 90 * S], [x + 4 * S, y - 20 * S]], gk);
    for (const sd of [-1, 1]) for (let j = 0; j < 3; j++) {
      const P = []; for (let i = 0; i <= 10; i++) { const u = i / 10; P.push([x + sd * (40 + 140 * u) * S, y + (-120 + j * 70 + Math.sin(u * 9 + j) * 14) * S]); }
      inkStroke(cc, P, { ...gk, seed: gk.seed + j * 3 + sd });
    }
  } });
  face(c, x, y + 10 * S, 250 * S, o.face ?? 'asleep', seed + 40, v);
}

// ------------------------------------------------------------------ gut
export function villus(c, x, y, h, w, sway, seed, v) { // a rounded pill rising from the wall
  const top = { x: x + sway, y: y - h };
  const prims = [{ t: 'cone', a: { x, y }, b: top, r1: w * 0.5, r2: w * 0.46, k: 6 }];
  celMass(c, outline(prims, 2.5), COL.villus, COL.gut, seed, v, { w: 4, sh: w * 0.16 });
}
export function foodChunk(c, x, y, r, crumbs, rot, seed, v) { // a protein gem wrapped in tan crumbs
  proteinGem(c, x, y, r, rot, seed, v, { glow: 0 });
  for (let i = 0; i < 4; i++) {
    if (crumbs <= 0.01) break;
    const a = rot + i * Math.PI / 2 + 0.4, d = r * 0.62;
    celMass(c, circlePts(x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.5 * crumbs, 20), COL.crumb, COL.crumbShade, seed + 10 + i, v, { w: 3.5, sh: r * 0.1 * crumbs });
  }
}

// ------------------------------------------------------------------ poop (restrained: no gag, just a little face)
export function poop(c, x, y, s, t, seed, v) {
  const prims = [
    { t: 'cone', a: { x: x - 70 * s, y }, b: { x: x + 70 * s, y }, r1: 42 * s, r2: 42 * s, k: 10 * s },
    { t: 'cone', a: { x: x - 45 * s, y: y - 55 * s }, b: { x: x + 45 * s, y: y - 55 * s }, r1: 34 * s, r2: 34 * s, k: 10 * s },
    { t: 'cone', a: { x: x - 18 * s, y: y - 100 * s }, b: { x: x + 18 * s, y: y - 100 * s }, r1: 26 * s, r2: 26 * s, k: 10 * s },
    { t: 'cone', a: { x: x + 10 * s, y: y - 120 * s }, b: { x: x + 34 * s, y: y - 150 * s }, r1: 14 * s, r2: 6 * s, k: 8 * s }, // swirl tip
  ];
  celMass(c, outline(prims, 2.5), COL.poop, COL.poopShade, seed, v, { w: 5 * s, sh: 12 * s });
  face(c, x, y - 40 * s, 120 * s, 'shocked', seed + 5, v, { ink: PAL.ink });
  for (let i = 0; i < 3; i++) { // stink lines
    const bx = x + (i - 1) * 50 * s, P = []; for (let j = 0; j <= 10; j++) P.push([bx + Math.sin(j * 0.9 + t * 4 + i) * 10 * s, y - 180 * s - j * 12 * s]);
    inkStroke(c, P, { seed: seed + 20 + i + v, w: 6 * s, t0: 6, t1: 10, amp: 0.8, heavy: 0, color: COL.stink });
  }
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
// caption card: card-cream, hand-cut boiling edge, anchored by its BOTTOM edge (yb) so two-line cards stay inside the
// safe zone. The card pops in opaque (scale, no grey half-alpha slab); only the words build in, one by one, highlight
// words in orange. o.cont: the previous caption ends where this one starts, so the card is already up (no re-pop);
// o.hold: the next caption starts where this one ends, so the card doesn't pop out.
export function caption(c, words, x, yb, t, tIn, tOut, v, o = {}) {
  if (t < tIn || t >= tOut) return;
  const size = 50, lh = 70, maxW = 860;
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
  const boxW = Math.min(940, Math.max(...lines.map((L) => L.reduce((a, q) => a + q.width + sp, -sp))) + 70), boxH = lines.length * lh + 46;
  const y = yb - boxH / 2;
  const sIn = o.cont ? 1 : K(t, [[tIn, 0.82], [tIn + 0.1, 1.04, 'out3'], [tIn + 0.18, 1]]);
  const outU = o.hold ? 0 : clamp((t - (tOut - 0.12)) / 0.12);
  const sc = sIn * (1 - 0.12 * outU), fade = 1 - outU;
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
      const tw = tIn + 0.05 + k * 0.07, u = clamp((t - tw) / 0.14);
      if (u > 0) {
        c.save(); c.globalAlpha = fade * u; c.font = `${wd.b ? 800 : 600} ${size}px "Inter"`; c.fillStyle = wd.b ? PAL.orangeShade : PAL.navy; c.textBaseline = 'alphabetic';
        c.fillText(wd.w, wx, wy + 10 * (1 - E.out3(u))); c.restore();
      }
      wx += wd.width + sp; k++;
    }
  });
  c.restore();
}
