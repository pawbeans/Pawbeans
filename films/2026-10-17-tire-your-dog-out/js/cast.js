// "Dog Decoded: tire your dog out without leaving the flat": overlay helpers copied from the Inside Your Dog cast (pill,
// caption card, cel mass, glow), plus the window, the haze and the treat bits from the haze film (2026-10-16).
import * as G from '../../../cel/engine.js';
import { PAL, MIYA } from '../../../cel/palette.js';
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

// ------------------------------------------------------------------ props copied from the haze film (2026-10-16): the window, the haze, treat bits
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

// tiny bits of treat, scattered
export function bit(c, x, y, s, seed, v) {
  const P = G.resample([[x - 14 * s, y - 8 * s], [x + 10 * s, y - 14 * s], [x + 16 * s, y + 6 * s], [x - 6 * s, y + 12 * s]], 3, true);
  celMass(c, P, MIYA.apricot, MIYA.apricotShade, seed, v, { w: 3, sh: 3 * s });
}
