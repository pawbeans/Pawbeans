// BEANS palette swatch sheet: brand colours + DERIVED values, flat chips and in use on a cel shape.
import * as G from '../engine.js';
import { PAL, ACCENTS } from '../palette.js';
import { loadPaper, drawPaper, drawTooth } from '../paper.js';

export const W = 1920, H = 1200;
let ctx, DPR = 1;
export async function init(canvas, dpr) {
  DPR = dpr; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  ctx = canvas.getContext('2d'); await loadPaper();
}

function text(c, s, x, y, font, color = PAL.navy, align = 'left', track = '0') {
  c.save(); c.font = font; c.fillStyle = color; c.textAlign = align; if ('letterSpacing' in c) c.letterSpacing = track; c.fillText(s, x, y); c.restore();
}
function chip(c, x, y, w, h, col) { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, 10); c.fill(); c.strokeStyle = 'rgba(29,25,21,0.25)'; c.lineWidth = 1.5; c.stroke(); }
function derivedTag(c, x, y) {
  c.save(); c.font = '600 13px "Oswald"'; if ('letterSpacing' in c) c.letterSpacing = '0.12em';
  const w = c.measureText('DERIVED').width + 14;
  c.fillStyle = PAL.orange; c.beginPath(); c.roundRect(x, y - 13, w, 19, 9); c.fill();
  c.fillStyle = PAL.hi; c.fillText('DERIVED', x + 7, y + 1); c.restore();
}
// a little inked cel bean: accent fill, its shadow as the lower-right crescent, ink line on top
function celBean(c, cx, cy, r, col, sh, seed) {
  const P = G.spline([[-r, 0.1 * r], [-0.7 * r, -0.75 * r], [0.1 * r, -0.85 * r], [0.85 * r, -0.45 * r], [0.95 * r, 0.3 * r], [0.35 * r, 0.8 * r], [-0.5 * r, 0.75 * r]].map(([x, y]) => [cx + x, cy + y]), true, 3);
  G.fillShape(c, P, col, { seed, amp: 1.4, dx: -4, dy: 3 });
  c.save(); c.beginPath(); G.polyPath(c, P); c.clip();
  c.beginPath(); c.rect(0, 0, W, H); G.polyPath(c, P.map(([x, y]) => [x - 0.28 * r, y - 0.34 * r])); c.fillStyle = sh; c.fill('evenodd');
  c.restore();
  G.inkLoop(c, P, { seed: seed + 3, w: 4, amp: 1.4, splits: 2, heavy: 0.45 });
}

function pairRow(c, title, keys, y0) {
  text(c, title, 80, y0, '600 20px "Oswald"', PAL.navy, 'left', '0.16em');
  keys.forEach((k, i) => {
    const A = ACCENTS[k], x = 80 + i * 296, y = y0 + 24;
    chip(c, x, y, 128, 96, A.c); chip(c, x + 134, y, 128, 96, A.shade);
    const nm = k.replace(/-/g, ' & ').replace('digestive & probiotics', 'digestive probiotics').replace('allergy & itch', 'allergy & itch');
    text(c, (A.name ? `${nm} · ${A.name}` : nm).toUpperCase(), x, y + 126, '600 16px "Oswald"', PAL.navy, 'left', '0.1em');
    text(c, A.c, x, y + 150, '500 16px "Inter"', '#3a3530');
    text(c, A.shade, x + 134, y + 150, '500 16px "Inter"', '#3a3530'); derivedTag(c, x + 134, y + 175);
    celBean(c, x + 200, y + 236, 50, A.c, A.shade, 300 + i * 17 + y0);
    text(c, 'in use', x + 60, y + 242, 'italic 400 24px "Caveat"', PAL.pencil, 'center');
  });
}

export function render(t) {
  const v = Math.floor(t * 12) % 4, c = ctx;
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawPaper(c, W, H);
  text(c, 'BEANS palette', 80, 96, '500 64px "Fraunces"', PAL.navy);
  text(c, 'swatches for approval, derived shadows marked', 82, 136, 'italic 400 28px "Fraunces"', PAL.orange);
  text(c, 'Shadows = brightness × 0.75, same hue (HSL lightness × 0.75 made the pastels garish).', 1840, 96, '500 17px "Inter"', '#3a3530', 'right');
  text(c, 'Paper texture here is the film paper: judge hues against it.', 1840, 122, '500 17px "Inter"', '#3a3530', 'right');
  // core
  text(c, 'CORE', 80, 196, '600 20px "Oswald"', PAL.navy, 'left', '0.16em');
  const core = [['NAVY', PAL.navy], ['DEEP NAVY', PAL.navyDeep], ['LIGHT NAVY', PAL.navyLight, 1], ['CREAM PAPER', PAL.cream], ['CARD CREAM', PAL.hi], ['BRAND ORANGE', PAL.orange], ['ORANGE SHADOW', PAL.orangeShade, 1]];
  core.forEach(([n, col, der], i) => {
    const x = 80 + i * 252, y = 220;
    chip(c, x, y, 232, 96, col);
    text(c, n, x, y + 124, '600 16px "Oswald"', PAL.navy, 'left', '0.1em');
    text(c, col.toUpperCase(), x, y + 148, '500 16px "Inter"', '#3a3530');
    if (der) derivedTag(c, x + 120, y + 148);
  });
  pairRow(c, 'TREATS · PROTEIN ACCENT + SHADOW', ['rabbit', 'kangaroo', 'venison', 'turkey', 'ostrich', 'horse'], 430);
  pairRow(c, 'SUPPLEMENTS · PASTEL ACCENT + SHADOW', ['digestive-probiotics', 'skin-coat', 'multivitamin', 'allergy-itch', 'calming', 'hip-joint'], 790);
  drawTooth(c, W, H, v, DPR, 0.13);
}
