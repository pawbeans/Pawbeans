// Miya: the BEANS dog. Every BEANS video that shows a dog imports this module; nobody redraws her.
//
//   import { drawMiya, pose } from '/beans/characters/miya/miya.js';
//   drawMiya(ctx, pose('sit', { face: { eyes: 'happy' } }), { x: 540, y: 1500, s: 1.6, view: 30, v: D.id % 4, accent });
//
// Who she is: the founders' Goldendoodle and the reason BEANS exists. Teddy groom: cream curly coat with apricot
// warmth on the ears and round the eyes, a domed head with a top knot, long hanging ears, a short bearded muzzle,
// a broad dark nose, round dark eyes under a fringe, thick column legs with round pom paws, a feathered plume tail,
// and a navy BEANS collar (mostly lost in the fluff) with a tag in the video's accent colour. Happy = tongue out.
// Reference photos: references/miya/.
//
// How she is drawn: a 3D rig (X forward, Y up, Z = her right side) is posed, turned to the view angle and
// projected; each mass (torso+neck, head, each leg, each ear, tail) is a smooth union of round cones and circles
// traced into ONE outline (cel/shape.js), given a scalloped curly edge, filled off-register, shaded with one cel
// shadow crescent plus a few C-curl ticks, and inked with tapered boiling strokes (cel/engine.js).
// `v` = boil variant of the current drawing (0..3 on 2s, 0..2 on 3s).
import * as G from '../../cel/engine.js';
import { PAL, MIYA } from '../../cel/palette.js';
import { field, primBounds, contours } from '../../cel/shape.js';

const { inkStroke, inkLoop, fillShape, polyPath, spline, circlePts, hs, lerp, clamp } = G;
const RAD = Math.PI / 180;
export const REG = { dx: -4, dy: 3 }; // colour-to-line registration offset (hand colouring), px at s = 1

// ------------------------------------------------------------------ 3D helpers
const v3 = (x, y, z = 0) => ({ x, y, z });
const add = (a, b) => v3(a.x + b.x, a.y + b.y, a.z + b.z);
const sub3 = (a, b) => v3(a.x - b.x, a.y - b.y, a.z - b.z);
const lerp3 = (a, b, t) => v3(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
function rotZ(p, a) { const c = Math.cos(a), s = Math.sin(a); return v3(p.x * c - p.y * s, p.x * s + p.y * c, p.z); }   // pitch
function rotY(p, a) { const c = Math.cos(a), s = Math.sin(a); return v3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c); } // yaw
function rotX(p, a) { const c = Math.cos(a), s = Math.sin(a); return v3(p.x, p.y * c - p.z * s, p.y * s + p.z * c); } // roll

// ------------------------------------------------------------------ the rig (units: dog px, ground y = 0)
// Torso space: hip socket at the origin, x toward the chest. Standing: withers ≈ 196, top knot ≈ 285.
const TORSO = [
  { t: 'circle', c: v3(-4, 6), r: 36 },                                   // haunch
  { t: 'cone', a: v3(-8, 26), b: v3(104, 32), r1: 25, r2: 27, k: 20 },    // topline
  { t: 'cone', a: v3(16, 6), b: v3(82, -4), r1: 22, r2: 33, k: 22 },      // loin → brisket (a little tuck-up)
  { t: 'circle', c: v3(100, -4), r: 40, k: 20 },                          // chest
  { t: 'circle', c: v3(124, 6), r: 27, k: 14 },                           // forechest
  { t: 'circle', c: v3(110, 34), r: 26, k: 12 },                          // withers
  { t: 'circle', c: v3(102, 2, 19), r: 32, k: 18 },                       // shoulders: width across the chest
  { t: 'circle', c: v3(102, 2, -19), r: 32, k: 18 },
  { t: 'circle', c: v3(-4, 10, 18), r: 30, k: 18 },                       // hips: width across the rump
  { t: 'circle', c: v3(-4, 10, -18), r: 30, k: 18 },
];
const SHOULDER = v3(110, -6), NECK_BASE = v3(126, 36), TAIL_ROOT = v3(-36, 28);
// Head space: pivot at the top of the neck, x along the muzzle.
const HEAD = [
  { t: 'circle', c: v3(2, 10), r: 38 },                                   // round skull
  { t: 'circle', c: v3(-2, 32), r: 21, k: 16 },                           // small top knot
  { t: 'circle', c: v3(20, 16), r: 23, k: 14 },                           // forehead (kept low)
  { t: 'circle', c: v3(16, -6), r: 33, k: 12 },                           // cheeks
  { t: 'circle', c: v3(14, -4, 18), r: 27, k: 14 },                       // cheek width (makes the face round from the front)
  { t: 'circle', c: v3(14, -4, -18), r: 27, k: 14 },
  { t: 'cone', a: v3(34, -2), b: v3(52, -8), r1: 26, r2: 22, k: 12 },     // short blunt muzzle
  { t: 'circle', c: v3(42, -22), r: 20, k: 10 },                          // beard
];
const EYE = v3(40, 12, 20), NOSE = v3(68, -3, 0);
// pendant ears hanging from the sides of the skull, ending at chin level
const EAR = { top: v3(-10, 26, 34), bot: v3(-6, -16, 40), r1: 15, r2: 22 };
// leg radii at the joints [attach, mid, low] + pom paw radius
const FRONT_R = [19, 14.5, 13.5, 17], HIND_R = [29, 17, 14, 17];
const LEG_Z = { F: 25, H: 23 };

// ------------------------------------------------------------------ poses (side-plane joints, Miya facing +X)
// hip: torso pivot in the world; pitch: torso pitch (deg); neck: angle (deg from +X) + length;
// head: { pitch, yaw, roll } (deg); legs: joints after the shoulder / hip: [elbow|stifle, wrist|hock, paw centre];
// tail: { a0 (deg at the root), curl (deg per segment) }; ears: { swing } (deg, + = flung back);
// face: { eyes: open|happy|squint|closed, mouth: closed|smile|tongue|open (eating), brow: -1..1 }.
export const POSES = {
  stand: {
    hip: [-60, 134], pitch: 2, neck: { a: 64, len: 52 }, head: { pitch: -6, yaw: 0, roll: 0 },
    legs: { FN: [[54, 82], [56, 30], [62, 18]], FF: [[46, 82], [44, 30], [50, 18]],
      HN: [[-40, 84], [-70, 40], [-64, 18]], HF: [[-50, 84], [-80, 40], [-76, 18]] },
    tail: { a0: 100, curl: -30 }, ears: { swing: 0 }, face: { eyes: 'open', mouth: 'smile', brow: 0 },
  },
  sit: {
    hip: [-44, 44], pitch: 45, neck: { a: 84, len: 52 }, head: { pitch: -2, yaw: 0, roll: 0 },
    legs: { FN: [[44, 72], [48, 30], [56, 18]], FF: [[36, 72], [38, 30], [46, 18]],
      HN: [[6, 40], [-42, 20], [-6, 18]], HF: [[-2, 40], [-50, 20], [-16, 18]] },
    tail: { a0: 188, curl: 18 }, ears: { swing: 0 }, face: { eyes: 'open', mouth: 'tongue', brow: 0 }, over: ['FN'],
  },
  lie: {
    hip: [-56, 40], pitch: 6, neck: { a: 72, len: 50 }, head: { pitch: -4, yaw: 0, roll: 0 },
    legs: { FN: [[60, 20], [100, 18], [118, 18]], FF: [[52, 22], [92, 19], [110, 18]],
      HN: [[-16, 30], [-66, 18], [-34, 18]], HF: [[-24, 28], [-74, 18], [-44, 18]] },
    tail: { a0: 194, curl: 10 }, ears: { swing: 0 }, face: { eyes: 'open', mouth: 'smile', brow: 0 },
  },
};
POSES.pawRaise = {
  ...POSES.sit, head: { pitch: 8, yaw: 16, roll: -8 },
  legs: { ...POSES.sit.legs, FN: [[64, 96], [90, 110], [100, 96]] },
  face: { eyes: 'open', mouth: 'smile', brow: 0.5 }, over: ['FN'],
};
POSES.scratch = { // the hook pose: near hind leg up at the neck, head tipped into the scratch, eyes squeezed
  ...POSES.sit, pitch: 40, neck: { a: 100, len: 46 }, head: { pitch: -12, yaw: 8, roll: 16 },
  legs: { ...POSES.sit.legs, HN: [[14, 82], [-12, 124], [8, 166]] },
  tail: { a0: 196, curl: 14 }, ears: { swing: 14 }, face: { eyes: 'squint', mouth: 'closed', brow: -0.5 }, scratch: true, over: ['HN'],
};
POSES.wag = {
  ...POSES.stand, head: { pitch: 4, yaw: 14, roll: 0 }, tail: { a0: 92, curl: -32 }, ears: { swing: 6 },
  face: { eyes: 'happy', mouth: 'tongue', brow: 0.6 }, wag: true,
};
POSES.spin = { // chasing her own tail: body curled into a C, head swung round to the tail, seen from a little above
  ...POSES.stand, bend: -62, pitch: 2, neck: { a: 54, len: 50 }, head: { pitch: -12, yaw: -62, roll: -6 },
  legs: { FN: [[64, 80], [84, 50], [94, 36]], FF: [[42, 82], [40, 30], [48, 18]],
    HN: [[-40, 84], [-70, 40], [-62, 18]], HF: [[-54, 84], [-96, 58], [-108, 38]] },
  tail: { a0: 40, curl: 30 }, ears: { swing: 30 }, face: { eyes: 'open', mouth: 'tongue', brow: 0.3 }, spin: true,
};
POSES.sleep = { // NEW (Dog Decoded, 2026-10-13): lying down asleep, chin resting on the front paws
  ...POSES.lie, neck: { a: -10, len: 40 }, head: { pitch: -10, yaw: 0, roll: 0 },
  face: { eyes: 'closed', mouth: 'closed', brow: 0 },
};
POSES.curl = { // NEW (Dog Decoded, 2026-10-13): curled "donut" asleep, rear swung round, tail wrapped over the front
  // paws, nose tucked to the tail. Draw it seen from a little above: view ≈ 20, elev ≈ 45.
  ...POSES.lie, bend: -170, neck: { a: 0, len: 40 }, head: { pitch: -20, yaw: -90, roll: 0 },
  legs: { ...POSES.lie.legs, FN: [[64, 20], [92, 16], [104, 17]], FF: [[56, 22], [86, 18], [98, 17]] },
  tail: { a0: 170, curl: -16 }, face: { eyes: 'closed', mouth: 'closed', brow: 0 },
};
POSES.squat = { // NEW (Inside Your Dog, 2026-10-14): toilet squat, side view: rear lowered, hind legs tucked forward,
  // front legs straight, tail held up and out. Drawn with restraint (a bush or the frame edge covers the rear).
  ...POSES.sit, hip: [-40, 64], pitch: 24, neck: { a: 70, len: 50 }, head: { pitch: -4, yaw: 10, roll: 0 },
  legs: { FN: [[56, 78], [60, 30], [66, 18]], FF: [[48, 78], [48, 30], [54, 18]],
    HN: [[14, 46], [-24, 28], [6, 18]], HF: [[6, 46], [-32, 28], [-4, 18]] },
  tail: { a0: 128, curl: -16 }, ears: { swing: 0 }, face: { eyes: 'open', mouth: 'closed', brow: -0.2 }, over: ['FN'],
};
POSES.lookDown = { // NEW (Inside Your Dog, 2026-10-14): standing, head lowered to look at something on the ground
  ...POSES.stand, neck: { a: 12, len: 50 }, head: { pitch: -48, yaw: 8, roll: 0 }, ears: { swing: -8 },
  tail: { a0: 150, curl: -14 }, face: { eyes: 'open', mouth: 'closed', brow: -0.3 },
};

// pose('sit', overrides) → a pose object (deep-merged for head / face / tail / legs / ears)
export function pose(name, o = {}) {
  const b = POSES[name];
  return { ...b, ...o, head: { ...b.head, ...(o.head || {}) }, face: { ...b.face, ...(o.face || {}) },
    tail: { ...b.tail, ...(o.tail || {}) }, legs: { ...b.legs, ...(o.legs || {}) }, ears: { ...b.ears, ...(o.ears || {}) } };
}

// ------------------------------------------------------------------ build the posed 3D rig
function rig(P) {
  const hip = v3(P.hip[0], P.hip[1]);
  const bx = hip.x + 52, Bd = (P.bend || 0) * RAD; // optional body bend: the rear swings round a vertical axis
  const B = (p) => {
    if (!Bd || p.x >= bx) return p;
    const a = Bd * clamp((bx - p.x) / 90, 0, 1);
    const q = rotY(v3(p.x - bx, p.y, p.z), -a);
    return v3(q.x + bx, q.y, q.z);
  };
  const T = (p) => B(add(rotZ(p, P.pitch * RAD), hip));
  const torso = TORSO.map((q) => q.t === 'circle' ? { ...q, c: T(q.c) } : { ...q, a: T(q.a), b: T(q.b) });
  const neckBase = T(NECK_BASE);
  const na = P.neck.a * RAD;
  const pivot = add(neckBase, v3(Math.cos(na) * P.neck.len, Math.sin(na) * P.neck.len));
  const H = (p) => add(rotZ(rotY(rotX(p, P.head.roll * RAD), P.head.yaw * RAD), P.head.pitch * RAD), pivot);
  const head = HEAD.map((q) => q.t === 'circle' ? { ...q, c: H(q.c) } : { ...q, a: H(q.a), b: H(q.b) });
  const leg = (key) => {
    const front = key[0] === 'F', near = key[1] === 'N';
    const z = (near ? 1 : -1) * LEG_Z[front ? 'F' : 'H'];
    const top = front ? T(v3(SHOULDER.x, SHOULDER.y, z)) : T(v3(0, 0, z));
    const pts = P.legs[key].map(([x, y]) => (front ? v3(x, y, z) : B(v3(x, y, z))));
    return { key, front, near, z, pts: [top, ...pts], R: front ? FRONT_R : HIND_R };
  };
  const legs = ['FF', 'HF', 'FN', 'HN'].map(leg);
  const tail = [T(TAIL_ROOT)];
  let a = P.tail.a0;
  for (const L of [24, 22, 20, 16]) {
    const p = tail[tail.length - 1];
    tail.push(add(p, v3(Math.cos(a * RAD) * L, Math.sin(a * RAD) * L, P.bend ? L * 0.9 * Math.sign(-P.bend) : 0)));
    a += P.tail.curl;
  }
  const sw = (P.ears?.swing || 0) * RAD;
  const ears = [1, -1].map((side) => {
    const top = v3(EAR.top.x, EAR.top.y, EAR.top.z * side);
    const hang = rotZ(sub3(v3(EAR.bot.x, EAR.bot.y, EAR.bot.z * side), top), -sw); // swing back about the attach
    return { side, top: H(top), bot: H(add(top, hang)), tip: H(add(top, v3(hang.x * 1.12, hang.y * 1.12, hang.z))) };
  });
  const face = {
    eyes: [1, -1].map((side) => ({ side, c: H(v3(EYE.x, EYE.y, EYE.z * side)), n: sub3(H(v3(EYE.x + 7, EYE.y, EYE.z * side * 1.45)), H(v3(EYE.x, EYE.y, EYE.z * side))) })),
    nose: H(NOSE), noseN: sub3(H(v3(NOSE.x + 10, NOSE.y, 0)), H(NOSE)),
    mouth: [1, -1].map((sd) => [H(v3(66, -15, 0)), H(v3(60, -20, 7 * sd)), H(v3(50, -20, 14 * sd)), H(v3(44, -14, 18 * sd))]),
    mouthN: [1, -1].map((sd) => sub3(H(v3(50, -20, 30 * sd)), H(v3(50, -20, 0)))),
    tongue: [H(v3(62, -20)), H(v3(60, -42)), H(v3(51, -44)), H(v3(52, -22))],
    mouthO: H(v3(56, -22)), // centre of the open mouth (eating)
    fringe: [-1, -0.5, 0, 0.5, 1].map((k) => H(v3(40 - 8 * Math.abs(k), 26 - 2 * Math.abs(k), 26 * k))),
    headC: H(v3(10, 10)),
    collar: [lerp3(neckBase, pivot, 0.42), neckBase, pivot],
  };
  return { torso, neckBase, pivot, head, legs, tail, ears, face };
}

// ------------------------------------------------------------------ projection
// view: yaw in degrees (0 = side facing right, 90 = facing the viewer, 45 = three-quarter); elev: camera looking down
function projector(o) {
  const th = (o.view || 0) * RAD, c = Math.cos(th), s = Math.sin(th), S = o.s || 1, m = o.mirror ? -1 : 1;
  const e = (o.elev || 0) * RAD, ce = Math.cos(e), se = Math.sin(e);
  const P = (p) => { const d = p.x * s + p.z * c; return { x: o.x + m * (p.x * c - p.z * s) * S, y: o.y - (p.y * ce - d * se) * S, d: d * ce + p.y * se }; };
  const dirZ = (n) => (n.x * s + n.z * c) * ce + n.y * se;
  return { P, S, dirZ };
}
const prim2 = (q, P, S) => q.t === 'circle'
  ? (() => { const c = P(q.c); return { t: 'circle', x: c.x, y: c.y, r: q.r * S, k: (q.k ?? 10) * S }; })()
  : { t: 'cone', a: P(q.a), b: P(q.b), r1: q.r1 * S, r2: q.r2 * S, k: (q.k ?? 10) * S };
let CLIP = null; // optional screen rectangle {x0,y0,x1,y1}: contours are traced only inside it (for push-ins)
function outlineOf(prims, cell) {
  let b = primBounds(prims, 10);
  if (CLIP) b = { x0: Math.max(b.x0, CLIP.x0), y0: Math.max(b.y0, CLIP.y0), x1: Math.min(b.x1, CLIP.x1), y1: Math.min(b.y1, CLIP.y1) };
  if (b.x1 <= b.x0 || b.y1 <= b.y0) return null;
  return contours(field(prims), b, cell)[0] || null;
}

// ------------------------------------------------------------------ curly coat
// scallop: push the outline outward in round bumps (one curl per bump), cusps between. Stable per pose; the
// boil supplies the per-drawing wobble.
function scallop(loop, S, seed, P = 15, amp = 4.2) {
  if (!loop || loop.length < 8) return loop;
  const pts = G.resample(loop, 2 * S, true), n = pts.length;
  let cx = 0, cy = 0; for (const [x, y] of pts) { cx += x; cy += y; } cx /= n; cy /= n;
  let sgn = 0;
  for (let i = 0; i < n; i += 7) { const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n], p = pts[i]; sgn += (b[1] - a[1]) * (p[0] - cx) - (b[0] - a[0]) * (p[1] - cy); }
  sgn = sgn >= 0 ? 1 : -1;
  const L = G.arclen(pts, true);
  const out = [];
  let s0 = 0, k = 0, per = P * S * (0.8 + 0.4 * hs(seed, 0));
  for (let i = 0; i < n; i++) {
    const s = L[i];
    while (s > s0 + per) { s0 += per; k++; per = P * S * (0.8 + 0.4 * hs(seed, k)); }
    const u = (s - s0) / per, bump = Math.sqrt(Math.sin(Math.PI * u)) * amp * S * (0.75 + 0.5 * hs(seed, k, 3));
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    out.push([pts[i][0] + sgn * ty * bump, pts[i][1] - sgn * tx * bump]);
  }
  return out;
}
// C-curl ticks inside a mass, biased to the shadow side (lower right)
function curls(c, loop, S, seed, n = 5, color = MIYA.coatShade) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of loop) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  c.save(); c.beginPath(); polyPath(c, loop); c.clip();
  for (let k = 0; k < n; k++) {
    const x = lerp(x0, x1, 0.3 + 0.6 * hs(seed, k, 1)), y = lerp(y0, y1, 0.3 + 0.6 * hs(seed, k, 2));
    const r = (4.5 + 2.5 * hs(seed, k, 3)) * S, a0 = hs(seed, k, 4) * 6.28;
    const P = []; for (let i = 0; i <= 8; i++) { const a = a0 + (i / 8) * 4.2; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r * 0.85]); }
    inkStroke(c, P, { seed: seed + k * 7, w: 2.2 * S, t0: 3 * S, t1: 5 * S, min: 0.2, amp: 0.5 * S, heavy: 0, color });
  }
  c.restore();
}

// ------------------------------------------------------------------ cel painting of one mass
function paintMass(c, loop, o) {
  const { seed, S, fill = MIYA.coat, shade = MIYA.coatShade, marks = [], w = 4.4, light = [-1, -1.2], nCurls = 4, curlCol } = o;
  if (!loop) return;
  const L = o.flat ? loop : scallop(loop, S, seed, o.per ?? 15, o.amp ?? 4.2);
  fillShape(c, L, fill, { seed: seed + 1, amp: 1.4 * S, dx: REG.dx * S, dy: REG.dy * S });
  c.save();
  c.beginPath(); polyPath(c, L); c.clip();
  const sh = 10 * S;
  if (!o.noShade) {
    c.beginPath(); c.rect(-1e4, -1e4, 2e4, 2e4); polyPath(c, L.map(([x, y]) => [x + light[0] * sh, y + light[1] * sh]));
    c.fillStyle = shade; c.fill('evenodd');
  }
  for (const mk of marks) mk(c);
  c.restore();
  if (o.skipInkNear) { // ink only the runs of the outline away from the hidden end (open, tapered strokes)
    const q = o.skipInkNear, keep = L.map(([x, y]) => Math.hypot(x - q.x, y - q.y) > q.r);
    let start = keep.findIndex((k) => !k); if (start < 0) start = 0;
    let run = [];
    const flush = (k) => { if (run.length > 6) inkStroke(c, run, { seed: seed + 3 + k, w: w * S, amp: 1.4 * S, t0: 10 * S, t1: 10 * S, heavy: 0.45, dense: true }); run = []; };
    for (let i = 0; i <= L.length; i++) { const j = (start + i) % L.length; if (keep[j]) run.push(L[j]); else flush(i); }
    flush(L.length + 1);
  } else inkLoop(c, L, { seed: seed + 3, w: w * S, amp: 1.4 * S, splits: 2, heavy: 0.45, t0: 8, t1: 16 });
  return L;
}
function shadeOf(hex, k = 0.86) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${Math.round((n >> 16) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`;
}

// where a rig point lands on screen without drawing (e.g. the scratching paw, to aim a push-in)
export function locate(P, o, pick) { const R = rig(P); return projector(o).P(pick(R)); }

// ------------------------------------------------------------------ Miya
// o: { x, y (ground point, screen px), s (scale), view, elev, mirror, v (boil variant), accent (video accent hex),
//      seed (per-shot seed), shadow (false = no ground hatch), w (line weight) }
export function drawMiya(c, P, o = {}) {
  const R = rig(P);
  const { P: Pj, S, dirZ } = projector(o);
  const v = o.v ?? 0, sd = (o.seed ?? 2000) + v * 97;
  const cell = clamp(2.6 * S, 1.6, 4), W = o.w ?? 4.4;
  CLIP = o.clip || null;
  const items = [];
  if (o.shadow !== false) {
    const xs = [...R.legs.map((l) => Pj(l.pts[3]).x), Pj(R.torso[0].c).x, Pj(R.torso[3].c).x];
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    G.hatch(c, circlePts((x0 + x1) / 2 + 10 * S, o.y + 2 * S, 15 * S, 48, (x1 - x0) / 2 + 34 * S), { seed: sd + 5, gap: 9 * S, ang: -0.95, w: 2.2 * S, amp: 0.9 * S });
  }
  if (P.spin) spinArcs(c, Pj, S, sd, o, false);
  // legs: plush columns with round pom paws
  for (const L of R.legs) {
    const pts = L.pts.map(Pj);
    const prims = [];
    for (let i = 0; i < 3; i++) prims.push({ t: 'cone', a: pts[i], b: pts[i + 1], r1: L.R[i] * S, r2: L.R[Math.min(i + 1, 2)] * S, k: 8 * S });
    const paw = pts[3], fwd = Pj(add(L.pts[3], v3(8, 0, 0)));
    prims.push({ t: 'circle', x: lerp(paw.x, fwd.x, 0.5), y: paw.y, r: L.R[3] * S, k: 8 * S });
    const over = (P.over || []).includes(L.key);
    // legs come out from under the fluffy body: drawn before the torso (by depth, far side first), so their tops
    // are hidden by it. A leg listed in pose.over (e.g. the scratching hind leg) is drawn in front, with its top
    // end left un-inked so no bubble shows inside the body.
    items.push({ depth: over ? 1e6 : -1e6 + (pts[0].d + pts[2].d) / 2, draw: () => {
      const far = !L.near;
      paintMass(c, outlineOf(prims, cell), { seed: sd + 100 + (L.front ? 0 : 10) + (far ? 20 : 0), S, w: W * (far ? 0.9 : 1),
        fill: far ? MIYA.coatShade : MIYA.coat, shade: far ? MIYA.coatDeep : MIYA.coatShade, per: 13, amp: 3.2,
        skipInkNear: over ? { x: pts[0].x, y: pts[0].y, r: L.R[0] * S * 1.6 } : null, noShade: over });
      if (!far) for (const k of [-0.35, 0.35]) { // toe splits on the pom
        const tx = lerp(paw.x, fwd.x, 0.5) + k * L.R[3] * S * 0.9 + 6 * S, ty = paw.y + L.R[3] * S * 0.95;
        inkStroke(c, [[tx, ty - 8 * S], [tx + 1 * S, ty]], { seed: sd + 140 + k * 10, w: 2.4 * S, t0: 3 * S, t1: 3 * S, amp: 0.6 * S, heavy: 0 });
      }
    } });
  }
  // tail: a feathered plume
  {
    const pts = R.tail.map(Pj), r = [11, 14, 15, 12, 7];
    const prims = [];
    for (let i = 0; i < 4; i++) prims.push({ t: 'cone', a: pts[i], b: pts[i + 1], r1: r[i] * S, r2: r[i + 1] * S, k: 8 * S });
    items.push({ depth: pts[0].d - 4, draw: () => {
      if (P.wag) wagGhosts(c, P, o);
      paintMass(c, outlineOf(prims, cell), { seed: sd + 200, S, w: W * 0.9, per: 11, amp: 4.6, nCurls: 2 });
      if (P.spin) for (let k = 0; k < 4; k++) { // smear streaks behind the whipping tail
        const a = pts[2 + (k % 2)], b = pts[4];
        inkStroke(c, [[a.x - (16 + 7 * k) * S, a.y + (k * 7 - 6) * S], [b.x - (36 + 12 * k) * S, b.y + (k * 5) * S]], { seed: sd + 210 + k, w: 3 * S, t0: 30 * S, t1: 6 * S, min: 0.05, amp: 1 * S, heavy: 0 });
      }
    } });
  }
  // torso + neck ruff (+ collar peeking through)
  {
    const prims = R.torso.map((q) => prim2(q, Pj, S));
    prims.push({ t: 'cone', a: Pj(R.neckBase), b: Pj(R.pivot), r1: 29 * S, r2: 25 * S, k: 16 * S });
    const depth = Pj(R.torso[3].c).d * 0.5 + Pj(R.torso[0].c).d * 0.5;
    items.push({ depth, draw: () => {
      paintMass(c, outlineOf(prims, cell), { seed: sd + 300, S, w: W, nCurls: 7 });
      collar(c, R, Pj, S, sd, o);
    } });
  }
  // ears + head (ears hang in front of the head when they face the viewer)
  const headC = Pj(R.face.headC);
  for (const E of R.ears) {
    const t = Pj(E.top), b = Pj(E.bot), tp = Pj(E.tip);
    const depth = (t.d + b.d) / 2 > headC.d + 4 * S ? headC.d + 1 : headC.d - 1;
    items.push({ depth, draw: () => {
      const prims = [{ t: 'cone', a: t, b, r1: EAR.r1 * S, r2: EAR.r2 * S, k: 6 * S }, { t: 'circle', x: lerp(b.x, tp.x, 0.5), y: lerp(b.y, tp.y, 0.5), r: EAR.r2 * 0.95 * S, k: 8 * S }];
      paintMass(c, outlineOf(prims, cell), { seed: sd + 500 + (E.side > 0 ? 0 : 20), S, w: W * 0.95, fill: MIYA.apricot, shade: MIYA.apricotShade, per: 12, amp: 4.4, nCurls: 2 });
    } });
  }
  {
    const prims = R.head.map((q) => prim2(q, Pj, S));
    items.push({ depth: headC.d, draw: () => {
      const mz = R.head[6], bd = R.head[7];
      paintMass(c, outlineOf(prims, cell), { seed: sd + 400, S, w: W, nCurls: 3,
        marks: [(cc) => { // lighter beard + muzzle
          const a = Pj(mz.a), b = Pj(mz.b), bb = Pj(bd.c);
          const ml = outlineOf([{ t: 'cone', a, b, r1: 20 * S, r2: 18 * S, k: 6 * S }, { t: 'circle', x: bb.x, y: bb.y, r: 16 * S, k: 8 * S }], cell);
          if (ml) fillShape(cc, scallop(ml, S, sd + 409, 10, 3), MIYA.beard, { seed: sd + 410, amp: 1.2 * S });
        }] });
      drawFace(c, R, P, Pj, dirZ, S, sd, W);
    } });
  }
  items.sort((a, b) => a.depth - b.depth);
  for (const it of items) it.draw();
  if (P.scratch) scratchFX(c, R, Pj, S, sd);
  if (P.spin) spinArcs(c, Pj, S, sd, o, true);
  CLIP = null;
  return { rig: R, project: Pj };
}

function collar(c, R, Pj, S, sd, o) {
  const [m, nb, pv] = R.face.collar.map(Pj);
  const dx = pv.x - nb.x, dy = pv.y - nb.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const hw = 26 * S;
  const A = [m.x + nx * hw, m.y + ny * hw], B = [m.x - nx * hw, m.y - ny * hw], mid = [m.x + dx / l * 4 * S, m.y + dy / l * 4 * S];
  // only the middle stretch shows: the ends are lost in the ruff
  const A2 = [lerp(A[0], mid[0], 0.45), lerp(A[1], mid[1], 0.45)], B2 = [lerp(B[0], mid[0], 0.45), lerp(B[1], mid[1], 0.45)];
  inkStroke(c, [A2, mid, B2], { seed: sd + 600, w: 12 * S, t0: 6 * S, t1: 6 * S, min: 0.5, jit: 0.1, amp: 0.8 * S, heavy: 0, color: PAL.ink });
  inkStroke(c, [A2, mid, B2], { seed: sd + 601, w: 7.5 * S, t0: 6 * S, t1: 6 * S, min: 0.5, jit: 0.1, amp: 0.8 * S, heavy: 0, color: PAL.navy });
  const tx = mid[0] + nx * 4 * S, ty = Math.max(A2[1], B2[1], mid[1]) + 12 * S;
  const tag = circlePts(tx, ty, 7.5 * S, 18);
  fillShape(c, tag, o.accent || PAL.orange, { seed: sd + 602, amp: 0.8 * S, dx: REG.dx * 0.5 * S, dy: REG.dy * 0.5 * S });
  inkLoop(c, tag, { seed: sd + 603, w: 2.6 * S, amp: 0.8 * S, t0: 3, t1: 6 });
}

function drawFace(c, R, P, Pj, dirZ, S, sd, W) {
  const F = R.face, mood = P.face;
  // apricot patches round the eyes (under the eyes, soft-edged cel shapes)
  for (const e of F.eyes) {
    const facing = dirZ(e.n) / (Math.hypot(e.n.x, e.n.y, e.n.z) || 1);
    if (facing < -0.2) continue;
    const p = Pj(e.c), sq = clamp(0.4 + 0.6 * (facing + 0.2) / 1.2, 0.4, 1);
    fillShape(c, circlePts(p.x - 2 * S, p.y + 4 * S, 8 * S, 20, 10 * S * sq), MIYA.patch, { seed: sd + 690 + e.side, amp: 1.2 * S });
  }
  // fringe: a scalloped tuft line across the brow
  const fr = F.fringe.map(Pj);
  const vis = fr.filter((q, i) => dirZ(sub3(R.face.fringe[i], R.face.headC)) > -8);
  if (vis.length >= 2) {
    const pts = []; for (let i = 0; i < vis.length - 1; i++) {
      const a = vis[i], b = vis[i + 1];
      for (let k = 0; k <= 6; k++) { const u = k / 6; pts.push([lerp(a.x, b.x, u), lerp(a.y, b.y, u) - Math.sin(Math.PI * u) * 4.5 * S]); }
    }
    inkStroke(c, pts, { seed: sd + 680, w: 2.6 * S, t0: 6 * S, t1: 6 * S, min: 0.3, amp: 0.7 * S, heavy: 0 });
  }
  // eyes: round, dark, glint; half-hidden under the fringe
  for (const e of F.eyes) {
    const facing = dirZ(e.n) / (Math.hypot(e.n.x, e.n.y, e.n.z) || 1);
    if (facing < -0.2) continue;
    const p = Pj(e.c), sq = clamp(0.4 + 0.6 * (facing + 0.2) / 1.2, 0.4, 1);
    const rx = 6.2 * S * sq, ry = 6.6 * S, seed = sd + 700 + (e.side > 0 ? 0 : 10);
    if (mood.eyes === 'happy') {
      inkStroke(c, [[p.x - rx * 1.3, p.y + 1.5 * S], [p.x, p.y - ry * 0.8], [p.x + rx * 1.3, p.y + 1.5 * S]], { seed, w: 3.4 * S, t0: 3 * S, t1: 3 * S, amp: 0.6 * S, heavy: 0 });
    } else if (mood.eyes === 'closed' || mood.eyes === 'squint') {
      const k = mood.eyes === 'squint' ? -1 : 1;
      inkStroke(c, [[p.x - rx * 1.3, p.y], [p.x, p.y + k * ry * 0.45], [p.x + rx * 1.3, p.y - 1 * S]], { seed, w: 3.4 * S, t0: 3 * S, t1: 3 * S, amp: 0.6 * S, heavy: 0 });
    } else {
      const loop = circlePts(p.x, p.y, ry, 18, rx);
      fillShape(c, loop, PAL.ink, { seed, amp: 0.5 * S });
      c.fillStyle = PAL.hi; c.beginPath(); c.arc(p.x - rx * 0.3, p.y - ry * 0.35, 1.8 * S, 0, 7); c.fill();
    }
  }
  // nose: broad, rounded, with a soft bean notch on top and a glint
  const nf = dirZ(F.noseN) / 10;
  if (nf > -0.6) {
    const n = Pj(F.nose), rx = 12.5 * S * (0.6 + 0.4 * Math.abs(nf)), ry = 9 * S;
    const B = [[-rx, -0.2 * ry], [-0.75 * rx, -ry], [0, -0.82 * ry], [0.75 * rx, -ry], [rx, -0.2 * ry], [0.5 * rx, 0.8 * ry], [0, ry], [-0.5 * rx, 0.8 * ry]];
    fillShape(c, spline(B.map(([x, y]) => [n.x + x, n.y + y]), true, 2), MIYA.nose, { seed: sd + 720, amp: 0.5 * S });
    c.fillStyle = PAL.hi; c.beginPath(); c.arc(n.x - rx * 0.35, n.y - ry * 0.45, 2 * S, 0, 7); c.fill();
  }
  if (nf < -0.8) return;
  // open mouth (eating): a dark oval under the nose with the tongue at its floor
  if (mood.mouth === 'open') {
    const m = Pj(F.mouthO), rx = 15 * S * (0.6 + 0.4 * Math.abs(nf)), ry = 17 * S;
    const O = circlePts(m.x, m.y, ry, 22, rx);
    fillShape(c, O, PAL.ink, { seed: sd + 740, amp: 0.6 * S });
    c.save(); c.beginPath(); polyPath(c, O); c.clip();
    fillShape(c, circlePts(m.x, m.y + ry * 0.75, ry * 0.6, 16, rx * 0.9), MIYA.tongue, { seed: sd + 741, amp: 0.5 * S });
    c.restore();
    inkLoop(c, O, { seed: sd + 742, w: 2.6 * S, amp: 0.6 * S, t0: 3, t1: 6 });
    return;
  }
  // tongue (happy pant): hangs below the beard, under the mouth line
  if (mood.mouth === 'tongue') {
    const T = F.tongue.map(Pj);
    const tg = spline([[T[0].x, T[0].y], [T[1].x, T[1].y, 1], [T[2].x, T[2].y, 1], [T[3].x, T[3].y]], true, 2);
    fillShape(c, tg, MIYA.tongue, { seed: sd + 731, amp: 0.6 * S, dx: REG.dx * 0.5 * S, dy: REG.dy * 0.5 * S });
    inkStroke(c, [[lerp(T[0].x, T[3].x, 0.5), lerp(T[0].y, T[3].y, 0.5) + 2 * S], [lerp(T[1].x, T[2].x, 0.5), lerp(T[1].y, T[2].y, 0.5) - 6 * S]], { seed: sd + 732, w: 1.8 * S, t0: 2 * S, t1: 4 * S, amp: 0.4 * S, heavy: 0, color: MIYA.tongueShade });
    inkLoop(c, tg, { seed: sd + 733, w: 2.6 * S, amp: 0.6 * S, t0: 3, t1: 6 });
  }
  // mouth: one half per side of the muzzle, drawn when that side faces the viewer
  for (const i of [0, 1].filter((i) => dirZ(F.mouthN[i]) > -6)) {
    const M = F.mouth[i].map(Pj);
    const pts = mood.mouth === 'closed' ? [M[0], M[1], M[2]] : [M[0], M[1], M[2], { x: M[3].x, y: M[3].y - 3 * S }];
    inkStroke(c, pts.map((q) => [q.x, q.y]), { seed: sd + 735 + i, w: 2.6 * S, t0: 4 * S, t1: 6 * S, amp: 0.5 * S, heavy: 0 });
  }
}

// happy wag: two ink ghost plumes + wag arcs
function wagGhosts(c, P, o) {
  const pr = projector(o);
  for (const [da, al] of [[-30, 0.26], [26, 0.16]]) {
    c.save(); c.globalAlpha = al;
    const pts = rig({ ...P, tail: { ...P.tail, a0: P.tail.a0 + da } }).tail.map(pr.P);
    inkStroke(c, pts.map((p) => [p.x, p.y]), { seed: 800 + da, w: 12 * pr.S, t0: 8 * pr.S, t1: 20 * pr.S, min: 0.3, amp: 1 * pr.S, heavy: 0 });
    c.restore();
  }
  const R = rig(P), root = pr.P(R.tail[0]), tip = pr.P(R.tail[4]);
  const rr = Math.hypot(tip.x - root.x, tip.y - root.y) * 1.2, a0 = Math.atan2(tip.y - root.y, tip.x - root.x);
  for (const k of [0, 1]) {
    const pts = []; for (let i = 0; i <= 10; i++) { const a = a0 - 0.55 + 1.1 * i / 10; pts.push([root.x + Math.cos(a) * (rr + k * 14 * pr.S), root.y + Math.sin(a) * (rr + k * 14 * pr.S)]); }
    inkStroke(c, pts, { seed: 820 + k + (o.v || 0) * 7, w: 3.2 * pr.S, t0: 12 * pr.S, t1: 12 * pr.S, min: 0.1, amp: 1 * pr.S, heavy: 0 });
  }
}

// itch: scratch ticks only (owner: no ghost circles or loose curl marks)
function scratchFX(c, R, Pj, S, sd) {
  const paw = Pj(R.legs.find((l) => l.key === 'HN').pts[3]);
  for (let k = 0; k < 3; k++) { // scratch ticks: three short strokes fanning off the paw
    const a = -2.3 + k * 0.5, r0 = 26 * S, r1 = 42 * S;
    inkStroke(c, [[paw.x + Math.cos(a) * r0, paw.y + Math.sin(a) * r0], [paw.x + Math.cos(a) * r1, paw.y + Math.sin(a) * r1]], { seed: sd + 910 + k, w: 3.2 * S, t0: 3 * S, t1: 5 * S, amp: 0.6 * S, heavy: 0 });
  }
}

// chase-the-tail spin: wrap arcs on the ground plane round her, back halves behind, front halves over; dust puffs
function spinArcs(c, Pj, S, sd, o, front) {
  const rings = [{ y: 8, r: 132, a0: 0.4, len: 4.2, w: 4.5 }, { y: 70, r: 116, a0: 2.1, len: 3.4, w: 3.6 }];
  rings.forEach((R, k) => {
    let run = [];
    const flush = () => { if (run.length > 3) inkStroke(c, run, { seed: sd + 950 + k * 3 + (front ? 1 : 0), w: R.w * S, t0: 26 * S, t1: 10 * S, min: 0.08, amp: 1 * S, heavy: 0 }); run = []; };
    for (let i = 0; i <= 40; i++) {
      const t = R.a0 + R.len * i / 40, q = Pj(v3(10 + Math.cos(t) * R.r, R.y, Math.sin(t) * R.r * 0.9));
      if ((Math.sin(t) > 0) === front) run.push([q.x, q.y]); else flush();
    }
    flush();
  });
  if (!front) return;
  for (const [x3, z3, side] of [[-110, 50, -1], [110, -40, 1]]) {
    const q = Pj(v3(x3, 4, z3));
    for (let k = 0; k < 3; k++) {
      const P2 = circlePts(q.x + side * k * 20 * S, q.y - k * 10 * S, (14 - 3 * k) * S, 16);
      fillShape(c, P2, PAL.hi, { seed: sd + 975 + k, amp: 1 * S });
      inkLoop(c, P2, { seed: sd + 970 + k + side * 5, w: 3 * S, amp: 1 * S });
    }
  }
}
