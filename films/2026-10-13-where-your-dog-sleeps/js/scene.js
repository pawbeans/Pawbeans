// BEANS · Dog Decoded: Where your dog sleeps. 32.5 s, 1080×1920, 24 fps, cel / line boil (BEANS house style).
// Six spots, six meanings, counter 1/6 → 6/6, the sweetest saved for last; ends on a question and loops to frame 0.
// Dog Decoded: no BEANS mention anywhere (no logo, product or URL). Miya is the only brand signal.
import * as G from '../../../cel/engine.js';
import { PAL, ACCENTS, MIYA } from '../../../cel/palette.js';
import { loadPaper, drawPaper, drawTooth } from '../../../cel/paper.js';
import * as FX from '../../../cel/fx.js';
import { drawMiya, pose } from '../../../characters/miya/miya.js';
import * as CA from './cast.js';

const { E, hs, lerp, clamp, inv, sstep, spline, circlePts, fillShape, inkLoop, inkStroke, polyPath } = G;
export const W = 1080, H = 1920, FPS = 24, DUR = 32.5;
const NF = Math.round(DUR * FPS);
let ctx, DPR = 1;

// mood accent (no product meaning): lilac, for night and calm
const LIL = ACCENTS.calming.c, LILS = ACCENTS.calming.shade, LILD = '#7E6E8C'; // LILD: lilac shade × 0.8 (folds)
const ACC = LIL; // Miya's collar tag

// ------------------------------------------------------------------ the spots
const SP = [ // start, end, label
  [4.0, 8.0, '1/6 · ON YOUR BED'], [8.0, 12.0, '2/6 · FOOT OF THE BED'], [12.0, 16.0, '3/6 · BY THE DOOR'],
  [16.0, 20.0, '4/6 · ON YOUR CLOTHES'], [20.0, 24.0, '5/6 · BACK AGAINST YOU'], [24.0, 28.8, '6/6 · TUCKED AGAINST YOU'],
];
const WHIPS = [8.0, 12.0, 16.0, 20.0, 24.0, 28.8], WH = 0.125; // whip pans: ±0.125 s round each cut, on 1s
const DIVE = 24.58; // Miya dives under the covers (hero)

// ------------------------------------------------------------------ exposure sheet: on 2s, fast action on 1s, holds on 3s
const STEP = new Array(NF).fill(2);
const setStep = (a, b, s) => { for (let f = Math.round(a * FPS); f < Math.min(NF, Math.round(b * FPS)); f++) STEP[f] = s; };
setStep(4.0, 4.25, 1);                                  // punch-in
for (const b of WHIPS) setStep(b - WH, b + WH, 1);      // whips
setStep(24.4, 25.45, 1);                                // the dive and the pop-out
setStep(21.6, 21.9, 1);                                 // the shuffle back
setStep(29.4, 31.2, 3);                                 // the question holds
const FQ = new Int32Array(NF), ID = new Int32Array(NF);
{ let last = 0, id = 0; for (let f = 0; f < NF; f++) { if (f > 0 && (STEP[f] !== STEP[f - 1] || f - last >= STEP[f])) { last = f; id++; } FQ[f] = last; ID[f] = id; } }
function drawing(f) { return { fq: FQ[f], id: ID[f], step: STEP[f] }; }
const bv = (D) => (D.step === 3 ? D.id % 3 : D.id % 4);

export async function init(canvas, dpr) {
  DPR = dpr; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  ctx = canvas.getContext('2d');
  await loadPaper();
}

// ------------------------------------------------------------------ captions (≤ 3.5 words/s, every card ≥ 1.5 s, centred at y 1440)
const md = (s) => { let b = false; return s.split(' ').map((w) => { const st = w.startsWith('**'); if (st) b = true; const ww = w.replace(/\*\*/g, ''); const o = { w: ww, b }; if (w.endsWith('**') || (st && w.slice(2).includes('**'))) b = false; return o; }); };
const CAPS = [
  [2.2, 4.0, 'Six spots. The best is **last.**'],
  [4.2, 6.1, 'It can mean you\'re **family.**'],
  [6.1, 7.9, 'Puppies pile up for **warmth and safety.**'],
  [8.2, 10.1, 'Close to you...'],
  [10.1, 11.9, '...but **watching the room.**'],
  [12.2, 14.1, 'Often a dog on **guard duty.**'],
  [14.1, 15.9, 'They see themselves as your **protector.**'],
  [16.2, 18.1, 'Your **scent** comforts them...'],
  [18.1, 19.9, '...especially when **you\'re out.**'],
  [20.2, 22.1, 'It can mean **"I\'ve got your back."**'],
  [22.1, 23.9, 'It\'s a sign of **deep trust.**'],
  [24.2, 25.9, 'And the sweetest spot...'],
  [25.9, 28.7, 'Against you? You\'re their **safe place.**'],
].map(([a, b, s]) => [a, b, md(s)]);
const CAP_Y = 1440;
const popK = (t, t0, d = 0.35) => (t < t0 ? 0 : G.K(t, [[t0, 0], [t0 + d * 0.6, 1.14, 'out3'], [t0 + d, 1.0]]));

// the hook headline (frame 0 = the cover; it returns at the end so the loop is seamless)
function headline(c, a, dy, v) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  let size = 92;
  c.font = `600 ${size}px "Fraunces"`;
  const w1 = c.measureText('Where your dog sleeps').width;
  if (w1 > 860) size = Math.floor(size * 860 / w1);
  c.font = `600 ${size}px "Fraunces"`; c.fillStyle = PAL.navy;
  c.fillText('Where your dog sleeps', 540 + (v % 2 ? 1 : -1), 450 + dy);
  const a1 = 'says ', a2 = 'a lot.';
  const wA = c.measureText(a1).width; c.font = `italic 600 ${size}px "Fraunces"`; const wB = c.measureText(a2).width;
  const x0 = 540 - (wA + wB) / 2; c.textAlign = 'left';
  c.font = `600 ${size}px "Fraunces"`; c.fillStyle = PAL.navy; c.fillText(a1, x0, 450 + size * 1.1 + dy);
  c.font = `italic 600 ${size}px "Fraunces"`; c.fillStyle = PAL.orange; c.fillText(a2, x0 + wA, 450 + size * 1.1 + dy + (v % 2 ? 1 : 0));
  // a hand-drawn orange underline under "a lot."
  inkStroke(c, [[x0 + wA, 450 + size * 1.1 + dy + 22], [x0 + wA + wB * 0.5, 450 + size * 1.1 + dy + 28], [x0 + wA + wB, 450 + size * 1.1 + dy + 20]], { seed: 31 + v, w: 7, t0: 6, t1: 10, min: 0.3, amp: 1, heavy: 0, color: PAL.orange });
  c.restore();
}
function headlineState(t) { // alpha, dy
  if (t < 2.2) return [1, 0];
  if (t < 2.45) { const u = E.in2(inv(2.2, 2.45, t)); return [1 - u, -40 * u]; }
  if (t >= 32.0) { const u = E.out3(inv(32.0, 32.3, t)); return [u, 30 * (1 - u)]; }
  return [0, 0];
}
function questionCard(c, t, v) {
  if (t < 29.0 || t >= 31.9) return;
  const sIn = G.K(t, [[29.0, 0.82], [29.12, 1.05, 'out3'], [29.22, 1]]), out = clamp((31.9 - t) / 0.2);
  c.save(); c.globalAlpha = out; c.translate(540, 520); c.scale(sIn * (1 - 0.1 * (1 - out)), sIn * (1 - 0.1 * (1 - out))); c.translate(-540, -520);
  const P = G.resample(CA.roundRect(110, 360, 860, 330, 36), 6, true);
  fillShape(c, P.map(([a, b]) => [a + 8, b + 10]), 'rgba(27,47,82,0.3)', { seed: 40 + v, amp: 1.4 });
  fillShape(c, P, PAL.hi, { seed: 41 + v, amp: 1.6 }); inkLoop(c, P, { seed: 42 + v, w: 4, amp: 1.6 });
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.font = '600 80px "Fraunces"'; const a1 = 'Where does ', a3 = ' sleep?';
  const w1 = c.measureText(a1).width, w3 = c.measureText(a3).width; c.font = 'italic 600 80px "Fraunces"'; const w2 = c.measureText('yours').width;
  const x0 = 540 - (w1 + w2 + w3) / 2;
  c.font = '600 80px "Fraunces"'; c.fillStyle = PAL.navy; c.fillText(a1, x0, 520); c.fillText(a3, x0 + w1 + w2, 520);
  c.font = 'italic 600 80px "Fraunces"'; c.fillStyle = PAL.orange; c.fillText('yours', x0 + w1, 520);
  const u = clamp((t - 29.5) / 0.25);
  if (u > 0) { c.globalAlpha = out * u; c.font = '600 50px "Inter"'; c.fillStyle = PAL.navy; c.textAlign = 'center'; c.fillText('Tell us below.', 540, 615 + 10 * (1 - u)); }
  c.restore();
}
function overlays(c, t, v) {
  CA.pill(c, 'DOG DECODED', 540, 214, { size: 28, fill: PAL.navy, color: PAL.hi, edge: PAL.navyDeep, alpha: 0.92, seed: 11, shadow: false }, v);
  for (const [a, b, txt] of SP) {
    const t0 = a + 0.15, t1 = b - WH - 0.02;
    if (t < t0 || t >= t1) continue;
    CA.pill(c, txt, 540, 320, { size: 40, fill: PAL.orange, color: PAL.hi, scale: popK(t, t0), alpha: clamp((t1 - t) / 0.12), seed: 21, rot: -0.02 }, v);
  }
  const [ha, hdy] = headlineState(t); headline(c, ha, hdy, v);
  questionCard(c, t, v);
  CAPS.forEach(([a, b, words], i) => CA.caption(c, words, 540, CAP_Y, t, a, b, v, { cont: i > 0 && CAPS[i - 1][1] === a, hold: i < CAPS.length - 1 && CAPS[i + 1][0] === b }));
}

// ------------------------------------------------------------------ room props (a few lines each)
const R = (pts, s = 6) => G.resample(pts, s, true);
function rect(x, y, w, h, r = 18) { return R(CA.roundRect(x, y, w, h, r)); }
function line(c, P, seed, v, w = 5, color = PAL.ink) { inkStroke(c, P, { seed: seed + v, w, t0: 10, t1: 10, min: 0.45, amp: 1.4, heavy: 0, color }); }
function cam(c, x, y, z) { c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-x, -y); }
function floor(c, v, y = 1250) {
  c.save(); c.globalAlpha = 0.55;
  G.hatch(c, [[-400, y], [W + 400, y], [W + 400, y + 1200], [-400, y + 1200]], { seed: 60 + v, gap: 30, ang: -0.95, w: 2.2, amp: 1.2, color: MIYA.coatDeep, cx: 540, cy: y + 400 });
  c.restore();
  line(c, [[-400, y], [W + 400, y]], 62, v, 5);
}
function zzz(c, x, y, t, t0, v, col = PAL.navy) {
  if (t < t0) return;
  for (let k = 0; k < 3; k++) {
    const u = ((t - t0) / 1.8 + k / 3) % 1;
    c.save(); c.globalAlpha = Math.sin(Math.PI * u) * 0.9; c.font = `italic 600 ${40 + k * 12}px "Fraunces"`; c.fillStyle = col;
    c.fillText('z', x + 50 * u + k * 8 + (v % 2), y - 150 * u - k * 34); c.restore();
  }
}
function windowNight(c, x, y, w, h, v, tq) {
  const P = rect(x, y, w, h, 10);
  fillShape(c, P, PAL.navyDeep, { seed: 70 + v, amp: 1.4, dx: CA.REG.dx, dy: CA.REG.dy });
  // a crescent moon and two stars
  const mx = x + w * 0.68, my = y + h * 0.3, mr = Math.min(w, h) * 0.15;
  c.save(); c.beginPath(); polyPath(c, circlePts(mx, my, mr, 30)); c.clip();
  fillShape(c, circlePts(mx, my, mr, 30), PAL.hi, { seed: 71 + v, amp: 0.8 });
  fillShape(c, circlePts(mx + mr * 0.5, my - mr * 0.25, mr * 0.9, 30), PAL.navyDeep, { seed: 72 + v, amp: 0.8 });
  c.restore();
  FX.drawTwinkle(c, x + w * 0.25, y + h * 0.25, 11 + 3 * Math.sin(tq * 3), 73 + v, { fill: PAL.hi });
  FX.drawTwinkle(c, x + w * 0.4, y + h * 0.62, 8 + 2 * Math.sin(tq * 2.3 + 1), 74 + v, { fill: PAL.hi });
  inkLoop(c, P, { seed: 75 + v, w: 6, amp: 1.4 });
  line(c, [[x + w / 2, y + 6], [x + w / 2, y + h - 6]], 76, v, 5); line(c, [[x + 6, y + h / 2], [x + w - 6, y + h / 2]], 77, v, 5);
  line(c, [[x - 24, y + h + 14], [x + w + 24, y + h + 14]], 78, v, 8); // sill
}
// the bed, side view. Duvet top: flat, or over a person (head on the pillow at the left, legs to x ≈ 600)
const P_PROFILE = [[250, 1000], [280, 900], [360, 872], [450, 892], [520, 902], [600, 880], [700, 905], [770, 918], [820, 960], [840, 1000]];
function bed(c, v, tq, o = {}) {
  // headboard
  const hb = rect(60, 690, 110, 600, 50);
  CA.celMass(c, hb, PAL.navyLight, PAL.navy, 80, v, { w: 5, sh: 10 });
  // base and legs
  for (const lx of [150, 990]) CA.celMass(c, rect(lx - 20, 1160, 40, 96, 10), PAL.navy, null, 81 + lx, v, { w: 4 });
  CA.celMass(c, rect(110, 1110, 920, 70, 16), PAL.navy, PAL.navyDeep, 83, v, { w: 5, sh: 8 });
  // mattress
  CA.celMass(c, rect(120, 990, 900, 130, 26), PAL.hi, '#EADFCB', 84, v, { w: 5, sh: 10 });
  // pillow
  CA.celMass(c, R(spline([[170, 1000], [175, 930], [250, 905], [330, 925], [345, 990], [260, 1004]], true, 4)), PAL.hi, '#EADFCB', 85, v, { w: 4.5, sh: 9 });
  if (o.person) { // the back of a head on the pillow (hair), under the duvet edge
    CA.celMass(c, circlePts(235, 905, 62, 40), PAL.navyDeep, null, 86, v, { w: 4.5 });
    inkStroke(c, [[205, 870], [232, 858], [262, 872]], { seed: 87 + v, w: 3, t0: 4, t1: 4, min: 0.3, amp: 0.8, heavy: 0, color: PAL.navyLight });
  }
  // duvet: lilac, over the mattress, folding down over the foot of the bed
  const top = o.person
    ? [[230, 1010], ...P_PROFILE.slice(1, -1), [880, 975], [960, 970], [1030, 985]]
    : [[300, 1000], [330, 975], [500, 965], [700, 972], [880, 968], [1030, 985]];
  const bump = o.bump || null; // a travelling hump (Miya under the covers)
  const topB = spline(top, false, 6).map(([x, y]) => (bump ? [x, y - bump.h * Math.exp(-((x - bump.x) ** 2) / (2 * 70 * 70))] : [x, y]));
  const duv = [...topB, [1046, 1060], [1040, 1150], [960, 1160], [600, 1130], [top[0][0], 1120]];
  CA.celMass(c, R(duv, 6), LIL, LILS, 88, v, { w: 5, sh: 12 });
  line(c, [[960, 1000], [975, 1080], [962, 1150]], 89, v, 3.5, LILD); // fold at the foot
  line(c, [[top[0][0] + 30, 1040], [top[0][0] + 220, 1050]], 90, v, 3.5, LILD);  // turned-down edge
  return topB;
}
function door(c, v, tq, knock) {
  CA.celMass(c, rect(560, 520, 360, 740, 8), PAL.navyLight, PAL.navy, 100, v, { w: 6, sh: 12 }); // frame
  const ajar = 0;
  CA.celMass(c, rect(590 + ajar, 550, 300, 702, 6), PAL.hi, '#EADFCB', 101, v, { w: 5, sh: 10 }); // door
  for (const [y, h] of [[600, 280], [930, 270]]) inkLoop(c, rect(630, y, 220, h, 10), { seed: 102 + y + v, w: 3.5, amp: 1.2, color: PAL.navy });
  CA.celMass(c, circlePts(625, 920, 16, 18), PAL.navy, null, 104, v, { w: 3.5 }); // handle
  // a doormat
  CA.celMass(c, R([[440, 1236], [1000, 1236], [1010, 1262], [430, 1262]], 6), LIL, LILS, 105, v, { w: 4, sh: 5 });
  if (knock > 0) { // sound ticks off the door
    for (let k = 0; k < 3; k++) {
      const a = -0.5 + k * 0.5, r0 = 40 + 20 * knock, r1 = r0 + 34;
      c.save(); c.globalAlpha = clamp(knock * 2) * (1 - clamp((knock - 0.7) / 0.3));
      inkStroke(c, [[600 + Math.cos(Math.PI + a) * r0, 760 + Math.sin(Math.PI + a) * r0], [600 + Math.cos(Math.PI + a) * r1, 760 + Math.sin(Math.PI + a) * r1]], { seed: 106 + k + v, w: 6, t0: 4, t1: 4, min: 0.4, amp: 0.8, heavy: 0, color: PAL.orange });
      c.restore();
    }
  }
}
function sofa(c, v) {
  CA.celMass(c, R(spline([[110, 1060], [120, 760], [200, 720], [880, 720], [960, 760], [970, 1060]], true, 6)), PAL.navyLight, PAL.navy, 110, v, { w: 6, sh: 14 }); // back
  CA.celMass(c, rect(150, 990, 780, 150, 30), PAL.navyLight, PAL.navy, 111, v, { w: 5, sh: 10 });                 // seat
  for (const x of [60, 900]) CA.celMass(c, rect(x, 900, 120, 290, 50), PAL.navyLight, PAL.navy, 112 + x, v, { w: 5, sh: 10 }); // arms
  for (const x of [200, 900]) CA.celMass(c, rect(x - 15, 1180, 30, 70, 8), PAL.navyDeep, null, 113 + x, v, { w: 3.5 }); // feet
  line(c, [[540, 1000], [540, 1130]], 114, v, 3, PAL.navy); // cushion seam
}
function sweater(c, v) { // a lilac knit sweater, sleeves flopped over the seat edge
  const body = R(spline([[300, 1010], [330, 970], [520, 958], [760, 966], [800, 1000], [780, 1040], [520, 1050], [320, 1046]], true, 5));
  CA.celMass(c, body, LIL, LILS, 120, v, { w: 4.5, sh: 8 });
  CA.celMass(c, R(spline([[700, 1020], [760, 1030], [790, 1120], [760, 1170], [730, 1160], [720, 1080]], true, 5)), LIL, LILS, 121, v, { w: 4.5, sh: 7 });
  for (let i = 0; i < 6; i++) line(c, [[360 + i * 70, 1018], [372 + i * 70, 1040]], 122 + i, v, 2.4, LILD); // ribbing
}

// ------------------------------------------------------------------ shots
// hook + spot 1 + end: Miya curled into a donut on the bed
const CURL = { x: 640, y: 1004, s: 2.0, view: 20, elev: 45 };
function shotBed(c, t, f, D) {
  const v = bv(D), tq = D.fq / FPS;
  drawPaper(c, W, H);
  // camera: still on the cover, punch-in at 4.0 (on 1s), slow push; wide again for the end
  let z = 1, fx = 540, fy = 960;
  if (tq >= 4.0 && tq < 8.2) { const u = E.out3(inv(4.0, 4.2, tq)); z = lerp(1, 1.3, u) + 0.06 * inv(4.2, 8.0, tq); fx = lerp(540, 630, u); fy = lerp(960, 930, u); }
  c.save(); cam(c, fx, fy, z);
  windowNight(c, 690, 600, 250, 300, v, tq);
  floor(c, v);
  bed(c, v, tq);
  // breathing, a tail thump at 6.1, a yawn at the end (31.2–31.9)
  const yawn = sstep(31.2, 31.45, tq) * (1 - sstep(31.7, 31.95, tq));
  const thump = tq >= 6.1 && tq < 6.6 ? Math.sin(Math.PI * inv(6.1, 6.6, tq)) : 0;
  const P = pose('curl', { tail: { a0: 170 + 12 * thump, curl: -16 }, head: { pitch: -20 + 26 * yawn, yaw: -90 + 20 * yawn, roll: 0 },
    face: { eyes: yawn > 0.3 ? 'squint' : 'closed', mouth: yawn > 0.4 ? 'open' : 'closed', brow: 0 }, ears: { swing: 8 * yawn } });
  const br = 1 + 0.012 * Math.sin(tq * 2.6);
  drawMiya(c, P, { ...CURL, s: CURL.s * br, v, seed: 3000, accent: ACC });
  if (tq < 31.0 || tq > 32.0) zzz(c, 800, 830, tq, tq >= 4 && tq < 29 ? 4.2 : 99, v);
  c.restore();
}
// spot 2: at the foot of the bed, head up, watching the room
function shotFoot(c, t, f, D) {
  const v = bv(D), tq = D.fq / FPS;
  drawPaper(c, W, H);
  const z = lerp(1, 1.12, E.io2(inv(8.0, 12.0, tq)));
  c.save(); cam(c, lerp(540, 700, E.io2(inv(8.0, 12.0, tq))), 960, z);
  windowNight(c, 420, 560, 220, 270, v, tq);
  floor(c, v);
  const topB = bed(c, v, tq, { person: true });
  zzz(c, 330, 820, tq, 8.3, v, PAL.navyLight);
  const look = E.io2(inv(10.0, 10.4, tq)); // 10.0: she turns her head to the room
  const P = pose('lie', { head: { pitch: 4 + 4 * look, yaw: 10 + 40 * look, roll: -4 * look }, face: { eyes: 'open', mouth: 'closed', brow: 0.2 + 0.3 * look }, ears: { swing: -6 * look } });
  drawMiya(c, P, { x: 760, y: 990, s: 1.45, view: 30, v, seed: 3100, accent: ACC });
  if (tq >= 10.4) { // a dashed look line out to the room
    const u = E.out2(inv(10.4, 10.9, tq));
    c.save(); c.globalAlpha = 0.9; c.setLineDash([16, 14]); c.lineDashOffset = -tq * 40; c.strokeStyle = PAL.orange; c.lineWidth = 5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(940, 760); c.lineTo(lerp(940, 1060, u), lerp(760, 700, u)); c.stroke(); c.restore();
  }
  c.restore();
}
// spot 3: by the door, on guard
function shotDoor(c, t, f, D) {
  const v = bv(D), tq = D.fq / FPS;
  drawPaper(c, W, H);
  c.save(); cam(c, 540, 980, lerp(1, 1.1, E.io2(inv(12.0, 16.0, tq))));
  floor(c, v);
  const knock = tq >= 13.8 && tq < 14.6 ? inv(13.8, 14.6, tq) : 0;
  door(c, v, tq, knock);
  const alert = E.out3(inv(13.9, 14.15, tq));
  const P = pose('lie', { head: { pitch: 2 + 10 * alert, yaw: 20 - 14 * alert, roll: 0 }, face: { eyes: 'open', mouth: 'closed', brow: 0.6 * alert }, ears: { swing: -12 * alert }, tail: { a0: 194 - 20 * alert, curl: 10 } });
  drawMiya(c, P, { x: 370, y: 1250, s: 1.8, view: 25, v, seed: 3200, accent: ACC });
  if (alert > 0 && tq < 14.6) FX.drawTwinkle(c, 640, 640, 14, 210 + v, { fill: PAL.orange });
  c.restore();
}
// spot 4: asleep on your sweater, on the sofa; your scent drifts up
function shotSofa(c, t, f, D) {
  const v = bv(D), tq = D.fq / FPS;
  drawPaper(c, W, H);
  c.save(); cam(c, 540, 1000, lerp(1.04, 1.14, E.io2(inv(16.0, 20.0, tq))));
  floor(c, v);
  sofa(c, v); sweater(c, v);
  const sm = sstep(18.0, 18.4, tq);
  const P = pose('sleep', { face: { eyes: 'closed', mouth: sm > 0.5 ? 'smile' : 'closed', brow: 0.2 * sm } });
  drawMiya(c, P, { x: 470, y: 1004, s: 1.5 * (1 + 0.012 * Math.sin(tq * 2.6)), view: 15, v, seed: 3300, accent: ACC, shadow: false });
  if (tq >= 17.2) for (let k = 0; k < 3; k++) { // scent wisps: wavy lines rising off the sweater towards her nose
    const u = ((tq - 17.2) / 1.6 + k / 3) % 1, x0 = 800 + k * 36, P2 = [];
    for (let i = 0; i <= 12; i++) { const s = i / 12 * (0.4 + 0.6 * u); P2.push([lerp(x0, 745, s) + Math.sin(s * 9 + k + tq * 3) * 12, lerp(1010, 905, s) - 40 * Math.sin(Math.PI * s)]); }
    c.save(); c.globalAlpha = Math.sin(Math.PI * u); inkStroke(c, P2, { seed: 330 + k + v, w: 12, t0: 6, t1: 12, min: 0.2, amp: 0.8, heavy: 0, color: PAL.ink }); inkStroke(c, P2, { seed: 330 + k + v, w: 7, t0: 6, t1: 12, min: 0.2, amp: 0.8, heavy: 0, color: PAL.hi }); c.restore();
  }
  c.restore();
}
// spot 5: from above, back to back against you on the bed
function shotAbove(c, t, f, D) {
  const v = bv(D), tq = D.fq / FPS;
  c.fillStyle = LIL; c.fillRect(0, 0, W, H); // the whole frame is duvet
  c.save(); cam(c, 540, 960, lerp(1, 1.1, E.io2(inv(20.0, 24.0, tq))));
  c.save(); c.globalAlpha = 0.35; G.hatch(c, [[-300, -300], [W + 300, -300], [W + 300, H + 300], [-300, H + 300]], { seed: 400 + v, gap: 44, ang: -0.7, w: 2.2, amp: 1.4, color: LILS, cx: 540, cy: 960 }); c.restore();
  // pillow + head (back of the head) at the left, the person's back as a long mound
  CA.celMass(c, R(spline([[20, 560], [300, 540], [330, 900], [40, 920]], true, 6)), PAL.hi, '#EADFCB', 401, v, { w: 5, sh: 10 });
  CA.celMass(c, R(spline([[200, 860], [330, 640], [700, 600], [1040, 640], [1120, 760], [1000, 900], [600, 905], [300, 930]], true, 6)), LIL, LILS, 402, v, { w: 5, sh: 14 });
  line(c, [[380, 860], [700, 846], [1000, 852]], 403, v, 3.5, LILD); // the fold along your back
  CA.celMass(c, circlePts(190, 730, 92, 40), PAL.navyDeep, null, 404, v, { w: 5 });
  for (let k = 0; k < 5; k++) inkStroke(c, [[150 + k * 18, 660 + k * 4], [175 + k * 16, 720 + k * 6], [160 + k * 20, 790]], { seed: 405 + k + v, w: 3, t0: 4, t1: 6, min: 0.2, amp: 0.8, heavy: 0, color: PAL.navyLight }); // hair
  // Miya shuffles back against you at 21.6 (on 1s), a squash on contact
  const sh = E.in2(inv(21.6, 21.85, tq)), y = lerp(1150, 1080, sh);
  const sq = tq >= 21.85 && tq < 22.0 ? 1.06 : 1;
  c.save(); c.translate(600, y); c.scale(sq, 1 / sq); c.translate(-600, -y);
  drawMiya(c, pose('sleep'), { x: 600, y, s: 1.8 * (1 + 0.01 * Math.sin(tq * 2.6)), view: 0, elev: 60, v, seed: 3400, accent: ACC, shadow: false });
  c.restore();
  if (tq >= 21.85 && tq < 22.6) { // contact puffs + twinkles where her back meets yours
    const u = inv(21.85, 22.6, tq);
    for (const [px, sd] of [[420, -1], [780, 1]]) for (let k = 0; k < 3; k++) {
      const P2 = circlePts(px + sd * (k * 30 + 60 * u), 905 - k * 12 - 30 * u, (16 - 4 * k) * (1 - 0.6 * u), 14);
      c.save(); c.globalAlpha = 1 - u; fillShape(c, P2, PAL.hi, { seed: 410 + k, amp: 1 }); inkLoop(c, P2, { seed: 412 + k + v, w: 3, amp: 1 }); c.restore();
    }
  }
  if (tq >= 22.0) { FX.drawTwinkle(c, 620, 880, 14 + 4 * Math.sin(tq * 4), 420 + v, { fill: PAL.hi }); FX.drawTwinkle(c, 860, 930, 10 + 3 * Math.sin(tq * 3), 421 + v, { fill: PAL.hi }); }
  c.restore();
}
// spot 6 (hero): she dives under the covers and pops out tucked against your legs
const TUCK = { x: 470, y: 1012, s: 1.4, view: 10 };
function shotTuck(c, t, f, D) {
  const v = bv(D), tq = D.fq / FPS;
  drawPaper(c, W, H);
  const z = lerp(1, 1.42, E.io2(inv(25.5, 28.8, tq))), shake = tq >= DIVE + 0.08 && tq < DIVE + 0.5 ? 10 * Math.exp(-(tq - DIVE - 0.08) / 0.12) : 0;
  c.save(); cam(c, lerp(540, 650, E.io2(inv(25.5, 28.8, tq))) + (hs(f, 1) - 0.5) * 2 * shake, lerp(960, 930, E.io2(inv(25.5, 28.8, tq))) + (hs(f, 2) - 0.5) * 2 * shake, z);
  windowNight(c, 420, 560, 220, 270, v, tq);
  floor(c, v);
  const fdive = Math.round(DIVE * FPS);
  // the hump under the duvet: lands at 24.67, travels to her spot by 25.2, then stays as her body
  const land = (fdive + 2) / FPS, under = tq >= land && tq < 25.25;
  const bump = under ? { x: lerp(820, 470, E.io2(inv(land, 25.2, tq))), h: 60 * (tq < land + 0.08 ? 1.3 : 1) + 8 * Math.sin(tq * 30) } : tq >= 25.2 ? { x: 450, h: 34 + 3 * Math.sin(tq * 2.6) } : null;
  bed(c, v, tq, { person: true, bump });
  if (tq < DIVE) { // standing on the bed by your feet, then a crouch (anticipation)
    const cr = E.io2(inv(24.3, DIVE, tq));
    const P = pose('stand', { head: { pitch: -10 - 20 * cr, yaw: 10, roll: 0 }, face: { eyes: 'open', mouth: 'smile', brow: 0.4 }, tail: { a0: 100 + 30 * Math.sin(tq * 12), curl: -30 } });
    c.save(); c.translate(880, 975); c.scale(1 + 0.06 * cr, 1 - 0.1 * cr); c.translate(-880, -975);
    drawMiya(c, P, { x: 880, y: 975, s: 1.25, view: 20, mirror: true, v, seed: 3500, accent: ACC });
    c.restore();
  } else if (f < fdive + 2) { // the dive, on 1s: one smear frame stretched 2.6× along the path, then she's gone
    const dir = Math.atan2(40, -120), k = f - fdive;
    c.save(); c.translate(lerp(860, 780, k), lerp(900, 960, k)); c.rotate(dir); c.scale(k === 0 ? 2.6 : 1.8, 0.6); c.rotate(-dir); c.translate(-860, -900);
    drawMiya(c, pose('stand', { face: { eyes: 'closed', mouth: 'closed', brow: 0 } }), { x: 860, y: 960, s: 1.15, view: 0, mirror: true, v, seed: 3510, accent: ACC, shadow: false });
    c.restore();
    for (let i = 0; i < 4; i++) inkStroke(c, [[930 + i * 10, 860 - i * 22], [1010 + i * 16, 830 - i * 30]], { seed: 520 + i + f, w: 4, t0: 20, t1: 4, min: 0.1, amp: 0.8, heavy: 0 });
  }
  if (tq >= land && tq < land + 0.6) { // the duvet flops: dust puffs and twinkles burst off it
    const u = inv(land, land + 0.6, tq);
    for (let k = 0; k < 6; k++) {
      const a = -Math.PI + k * (Math.PI / 5), d = 60 + 140 * E.out2(u), P2 = circlePts(820 + Math.cos(a) * d, 920 + Math.sin(a) * d * 0.6 - 30 * u, (22 - 2 * k % 3 * 3) * (1 - 0.7 * u), 14);
      c.save(); c.globalAlpha = 1 - u; fillShape(c, P2, PAL.hi, { seed: 530 + k, amp: 1 }); inkLoop(c, P2, { seed: 536 + k + v, w: 3.2, amp: 1 }); c.restore();
    }
    if (u < 0.3) FX.drawStarburst(c, 820, 900, 120 * (1 - u), 545 + f, 0.4, [PAL.hi, PAL.hi, PAL.orange], { n: 10, w: 5 });
  }
  if (tq >= 25.2) { // her head pops out at the duvet edge, tucked against your legs; the duvet covers her body
    const pop = E.outBack(clamp((tq - 25.2) / 0.25), 1.8);
    const P = pose('sleep', { head: { pitch: -6, yaw: 18, roll: -6 }, face: { eyes: tq >= 25.9 ? 'closed' : 'happy', mouth: 'smile', brow: 0.3 }, ears: { swing: 4 * Math.sin(tq * 2) } });
    c.save(); c.beginPath(); c.rect(588, 0, 2000, 2000); c.clip(); // only her head and paws show past the duvet's edge
    c.translate(TUCK.x + 160, TUCK.y); c.scale(pop, pop); c.translate(-TUCK.x - 160, -TUCK.y);
    drawMiya(c, P, { ...TUCK, s: TUCK.s * (1 + 0.01 * Math.sin(tq * 2.6)), v, seed: 3520, accent: ACC, shadow: false });
    c.restore();
    // the duvet's folded edge over her neck
    const flap = R(spline([[548, 915], [590, 890], [618, 906], [624, 955], [604, 996], [560, 992]], true, 4));
    CA.celMass(c, flap, LIL, LILS, 560, v, { w: 5, sh: 8 });
    zzz(c, 760, 820, tq, 26.0, v, PAL.navyLight);
    if (tq >= 26.0) { FX.drawTwinkle(c, 760, 880, 13 + 4 * Math.sin(tq * 4), 570 + v, { fill: PAL.hi }); FX.drawTwinkle(c, 520, 820, 10 + 3 * Math.sin(tq * 3 + 1), 571 + v, { fill: PAL.hi }); }
  }
  c.restore();
}

// ------------------------------------------------------------------ frame
function shotAt(t) {
  if (t < 8.0) return shotBed;
  if (t < 12.0) return shotFoot;
  if (t < 16.0) return shotDoor;
  if (t < 20.0) return shotSofa;
  if (t < 24.0) return shotAbove;
  if (t < 28.8) return shotTuck;
  return shotBed;
}
const LAYER = { c: null };
function layer() {
  if (!LAYER.c) { const cv = document.createElement('canvas'); cv.width = W * DPR; cv.height = H * DPR; LAYER.c = cv.getContext('2d'); }
  const L = LAYER.c; L.setTransform(1, 0, 0, 1, 0, 0); L.clearRect(0, 0, W * DPR, H * DPR); L.setTransform(DPR, 0, 0, DPR, 0, 0);
  L.fillStyle = PAL.cream; L.fillRect(0, 0, W, H); return L;
}
export function render(t) {
  const f = Math.min(NF - 1, Math.max(0, Math.round(t * FPS)));
  const D = drawing(f), t1 = f / FPS, v = bv(D);
  const c = ctx;
  c.setTransform(DPR, 0, 0, DPR, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  c.fillStyle = PAL.cream; c.fillRect(0, 0, W, H); // fresh page every frame: no stale pixels
  const wb = WHIPS.find((b) => t1 >= b - WH && t1 < b + WH);
  if (wb !== undefined) { // whip pan: out to the left, in from the right, the middle frames smeared 2× wide, speed lines
    const k = (t1 - (wb - WH)) / (2 * WH), first = k < 0.5;
    const L = layer();
    (first ? shotAt(wb - 0.01) : shotAt(wb + 0.01))(L, t1, f, D);
    const dx = first ? -W * 0.55 * E.in2(k / 0.5) : W * 0.55 * (1 - E.out2((k - 0.5) / 0.5)), sx = 1 + 1.3 * Math.sin(Math.PI * k);
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate((W / 2 + dx) * DPR, 0); c.scale(sx, 1); c.drawImage(L.canvas, -W / 2 * DPR, 0); c.restore();
    for (let i = 0; i < 9; i++) { const y = 360 + i * 120 + hs(i, f) * 40, x0 = hs(i, f, 2) * 500; inkStroke(c, [[x0, y], [x0 + 420 + 200 * hs(i, 3), y + 6]], { seed: 900 + i + f, w: 5, t0: 30, t1: 30, min: 0.1, amp: 0.6, heavy: 0 }); }
  } else shotAt(t1)(c, t1, f, D);
  overlays(c, t1, v);
  drawTooth(c, W, H, v, DPR, 0.13);
}
