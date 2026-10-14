// Miya model sheet: turnaround (front, 3/4, side) + the pose library, drawn with the Miya module itself.
import * as G from '../../../cel/engine.js';
import { PAL, MIYA } from '../../../cel/palette.js';
import { loadPaper, drawPaper, drawTooth } from '../../../cel/paper.js';
import { drawMiya, pose } from '../miya.js';

export const W = 2400, H = 2000;
let ctx, DPR = 1;

export async function init(canvas, dpr) {
  DPR = dpr;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  ctx = canvas.getContext('2d');
  await loadPaper();
}

const S1 = 1.08, S2 = 1.02;
const TURN = [ // ground y 560
  { label: 'FRONT', x: 300, view: 90 },
  { label: 'THREE-QUARTER', x: 760, view: 45 },
  { label: 'SIDE', x: 1300, view: 0 },
];
const POSE_ROW = [
  { label: 'SIT', name: 'sit', x: 300, y: 1060, view: 20 },
  { label: 'LIE DOWN', name: 'lie', x: 790, y: 1060, view: 15 },
  { label: 'PAW RAISE', name: 'pawRaise', x: 1310, y: 1060, view: 35 },
  { label: 'SCRATCHING', name: 'scratch', x: 300, y: 1470, view: 15, note: 'hook pose: paw on 1s' },
  { label: 'HAPPY TAIL WAG', name: 'wag', x: 830, y: 1470, view: 20, note: 'tail on 1s, 3 drawings' },
  { label: 'SPIN (CHASING TAIL)', name: 'spin', x: 1330, y: 1385, labelY: 1536, view: 0, elev: 38, note: 'on 1s, smear on the tail' },
  { label: 'SLEEP (CHIN ON PAWS) · NEW', name: 'sleep', x: 330, y: 1850, view: 15, note: 'new 2026-10-13, awaiting approval', isNew: true },
  { label: 'CURL (DONUT) · NEW', name: 'curl', x: 850, y: 1820, labelY: 1916, view: 20, elev: 45, note: 'new 2026-10-13: view 20, elev 45', isNew: true },
  { label: 'SQUAT · NEW', name: 'squat', x: 1330, y: 1850, view: 10, note: 'new 2026-10-14, awaiting approval', isNew: true },
  { label: 'LOOK DOWN · NEW', name: 'lookDown', x: 1730, y: 1850, view: 15, note: 'new 2026-10-14, awaiting approval', isNew: true },
];

function pencilLine(c, x0, y0, x1, y1, seed, w = 2) {
  c.save(); c.globalAlpha = 0.55;
  G.inkStroke(c, [[x0, y0], [x1, y1]], { seed, w, t0: 20, t1: 20, min: 0.3, amp: 1.2, heavy: 0, color: PAL.pencil });
  c.restore();
}
function label(c, text, x, y, o = {}) {
  c.save();
  c.fillStyle = o.color || PAL.ink; c.textAlign = o.align || 'center';
  c.font = o.font || '600 21px "Inter"';
  if ('letterSpacing' in c) c.letterSpacing = o.track || '0.16em';
  c.fillText(text, x, y);
  c.restore();
}
function pencilNote(c, text, x, y, o = {}) {
  c.save(); c.fillStyle = PAL.pencil; c.globalAlpha = 0.9; c.textAlign = o.align || 'center';
  c.font = o.font || '500 30px "Caveat"'; c.fillText(text, x, y); c.restore();
}

export function render(t) {
  const v = Math.floor(t * 12) % 4; // boil on 2s at 24 fps
  const c = ctx;
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  drawPaper(c, W, H);

  // ---- header
  c.save();
  c.fillStyle = PAL.ink; c.textAlign = 'left';
  c.font = '600 78px "Fraunces"'; c.fillStyle = PAL.navy; c.fillText('Miya', 96, 128);
  c.font = 'italic 400 34px "Fraunces"'; c.fillStyle = PAL.orange; c.fillText('the BEANS dog · model sheet v3 · approved', 100, 176);
  c.restore();
  label(c, 'GOLDENDOODLE · CEL / LINE BOIL · NEVER REDRAW: IMPORT characters/miya', 2304, 128, { align: 'right', font: '600 18px "Inter"', color: PAL.navy });
  G.inkStroke(c, [[96, 206], [2304, 206]], { seed: 11 + v, w: 3, t0: 30, t1: 30, min: 0.4, amp: 1.2, heavy: 0 });

  // ---- turnaround: construction lines across the row
  const gy = 630;
  const heights = [[0, 'ground'], [196, 'withers'], [266, 'top knot'], [228, 'eye line']];
  heights.forEach(([hgt, name], k) => {
    const y = gy - hgt * S1;
    pencilLine(c, 110, y, 1640, y, 30 + k + v * 5, 2);
    pencilNote(c, name, 1700, y + 9, { align: 'left', font: '500 26px "Caveat"' });
  });
  for (const T of TURN) {
    drawMiya(c, pose('stand'), { x: T.x, y: gy, s: S1, view: T.view, v, seed: 100 + T.view, accent: PAL.orange });
    label(c, T.label, T.x, gy + 62);
  }
  label(c, 'STAND · TURNAROUND', 110, 246, { align: 'left', font: '700 20px "Inter"', color: PAL.navy });
  G.inkStroke(c, [[96, 700], [1960, 700]], { seed: 21 + v, w: 2, t0: 30, t1: 30, min: 0.3, amp: 1, heavy: 0 });
  label(c, 'POSES', 110, 746, { align: 'left', font: '700 20px "Inter"', color: PAL.navy });

  // ---- poses
  for (const P of POSE_ROW) {
    drawMiya(c, pose(P.name), { x: P.x, y: P.y, s: S2, view: P.view, elev: P.elev || 0, v, seed: 300 + P.x + P.y, accent: PAL.orange });
    label(c, P.label, P.x, (P.labelY ?? P.y + 66), P.isNew ? { color: PAL.orange } : {});
    if (P.note) pencilNote(c, P.note, P.x, (P.labelY ?? P.y + 66) + 34, { font: '500 26px "Caveat"' });
  }

  // ---- side panel: palette + rules
  const px = 1990;
  G.inkStroke(c, [[1960, 236], [1960, 1540]], { seed: 41 + v, w: 2, t0: 30, t1: 30, min: 0.3, amp: 1, heavy: 0 });
  label(c, 'COLOURS', px, 280, { align: 'left', font: '700 20px "Inter"', color: PAL.navy });
  const sw = [[MIYA.coat, 'cream coat'], [MIYA.coatShade, 'coat shadow'], [MIYA.apricot, 'apricot ears'], [MIYA.patch, 'eye patches'], [MIYA.tongue, 'tongue'], [PAL.navy, 'collar (BEANS navy)'], [PAL.orange, 'tag = video accent']];
  sw.forEach(([col, name], k) => {
    const y = 316 + k * 58;
    const sq = [[px, y], [px + 46, y + 2], [px + 44, y + 44], [px + 2, y + 42]];
    G.fillShape(c, G.resample(sq, 4, true), col, { seed: 60 + k + v, amp: 1.2, dx: -3, dy: 2 });
    G.inkLoop(c, G.resample(sq, 4, true), { seed: 70 + k + v, w: 2.6, amp: 1.2 });
    label(c, name, px + 66, y + 30, { align: 'left', font: '500 21px "Inter"', track: '0.02em' });
  });
  label(c, 'RULES', px, 760, { align: 'left', font: '700 20px "Inter"', color: PAL.navy });
  const rules = ['Miya in every video.', 'Import miya.js, never redraw.', 'Curly edge, no curl marks.', 'Apricot ears and eye patches.', 'Eyes under the fringe.', 'Happy = tongue out.', 'Lines boil: 4 drawings on 2s.', 'Light top left; cel shadow', 'lower right.'];
  rules.forEach((r, k) => label(c, r, px, 800 + k * 36, { align: 'left', font: '400 22px "Inter"', track: '0.01em' }));
  pencilNote(c, 'coat colours sampled', px + 150, 1190, { font: '500 28px "Caveat"' });
  pencilNote(c, 'from photos of Miya', px + 150, 1224, { font: '500 28px "Caveat"' });

  drawTooth(c, W, H, v, DPR, 0.13);
}
