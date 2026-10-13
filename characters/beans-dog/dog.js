// BEANS dog: the one recurring BEANS character. Every BEANS video imports this module; nobody redraws the dog.
//
//   import { drawDog, POSES, pose } from '/beans/characters/beans-dog/dog.js';
//   drawDog(ctx, pose('sit', { face: { eyes: 'happy' } }), { x: 540, y: 1500, s: 1.6, view: 30, v: D.id % 4 });
//
// Design: a Singapore Special (the local mixed-breed street dog): medium, lean, short biscuit coat, cream
// muzzle / chest / socks / tail tip, upright triangular ears with the LEFT ear tip folded over, a sickle tail
// carried up, a navy BEANS collar with a small tag in the video's accent colour, and a bean-shaped nose.
//
// How it is drawn: a 3D rig (dog space: X forward, Y up, Z = the dog's right side) is posed, turned to the view
// angle and projected; each body mass (torso+neck, head, each leg, tail, ears) is a smooth union of round cones
// and circles traced into ONE outline (cel/shape.js), then filled off-register, given a cel shadow crescent and
// markings, and inked with tapered, boiling pen strokes (cel/engine.js). Pass `v` = the boil variant (0..3 on 2s,
// 0..2 on 3s) to re-ink the same drawing with slight variation every drawing.
import * as G from '../../cel/engine.js';
import { PAL, DOG } from '../../cel/palette.js';
import { field, primBounds, contours } from '../../cel/shape.js';

const { inkStroke, inkLoop, fillShape, fillPoly, polyPath, spline, circlePts, hs, lerp, clamp } = G;
const RAD = Math.PI / 180;
export const REG = { dx: -4, dy: 3 }; // colour-to-line registration offset (hand colouring), screen px at s = 1

// ------------------------------------------------------------------ 3D helpers
const v3 = (x, y, z = 0) => ({ x, y, z });
const add = (a, b) => v3(a.x + b.x, a.y + b.y, a.z + b.z);
function rotZ(p, a) { const c = Math.cos(a), s = Math.sin(a); return v3(p.x * c - p.y * s, p.x * s + p.y * c, p.z); }   // pitch (side plane)
function rotY(p, a) { const c = Math.cos(a), s = Math.sin(a); return v3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c); } // yaw
function rotX(p, a) { const c = Math.cos(a), s = Math.sin(a); return v3(p.x, p.y * c - p.z * s, p.y * s + p.z * c); } // roll

// ------------------------------------------------------------------ the rig (units: dog px, ground y = 0)
// Torso, in torso space: hip socket at the origin, x toward the chest. Standing withers ≈ 165, head top ≈ 245.
const TORSO = [
  { t: 'circle', c: v3(-4, 4), r: 35 },                                   // haunch
  { t: 'cone', a: v3(-10, 22), b: v3(104, 30), r1: 22, r2: 25, k: 20 },   // topline
  { t: 'cone', a: v3(10, 0), b: v3(80, -10), r1: 22, r2: 34, k: 24 },     // loin → brisket (tucked waist)
  { t: 'circle', c: v3(102, -8), r: 39, k: 22 },                          // chest
  { t: 'circle', c: v3(126, 2), r: 25, k: 16 },                           // forechest
  { t: 'circle', c: v3(110, 30), r: 25, k: 14 },                          // withers
];
const SHOULDER = v3(112, -6), NECK_BASE = v3(128, 30), TAIL_ROOT = v3(-34, 24);
// Head, in head space: pivot at the top of the neck, x along the muzzle.
const HEAD = [
  { t: 'circle', c: v3(6, 12), r: 30 },                                   // skull
  { t: 'circle', c: v3(20, 20), r: 21, k: 14 },                           // forehead / stop
  { t: 'circle', c: v3(20, -2), r: 22, k: 12 },                           // cheek + jaw
  { t: 'cone', a: v3(30, 4), b: v3(64, -4), r1: 19, r2: 12, k: 12 },      // muzzle (wedge)
  { t: 'circle', c: v3(56, -10), r: 10, k: 8 },                           // chin
];
const EYE = v3(35, 16, 14), NOSE = v3(68, -1, 0);
const EAR = { front: v3(18, 34, 6), back: v3(0, 31, 22), tip: v3(6, 74, 18) }; // turned ~45° forward so it reads in every view
// leg radii at the joints [attach, mid, low] + paw radius
const FRONT_R = [16, 9.5, 7.5, 9.5], HIND_R = [26, 11, 7.5, 9.5];
const LEG_Z = { F: 22, H: 21 };

// ------------------------------------------------------------------ poses (side-plane joints, dog facing +X)
// hip: torso pivot in the world; pitch: torso pitch (deg, + = chest up); neck: angle (deg from +X) + length;
// head: { pitch, yaw, roll } (deg); legs: joints after the shoulder / hip: [elbow|stifle, wrist|hock, paw];
// tail: { a0 (deg from +X at the root), curl (deg per segment) }.
export const POSES = {
  stand: {
    hip: [-60, 128], pitch: 3, neck: { a: 62, len: 62 }, head: { pitch: -8, yaw: 0, roll: 0 },
    legs: { FN: [[56, 80], [58, 26], [68, 7.5]], FF: [[48, 80], [46, 26], [55, 7.5]],
      HN: [[-36, 80], [-72, 40], [-64, 7.5]], HF: [[-46, 80], [-82, 40], [-76, 7.5]] },
    tail: { a0: 112, curl: -28 }, face: { eyes: 'open', mouth: 'closed', brow: 0 },
  },
  sit: {
    hip: [-44, 40], pitch: 45, neck: { a: 82, len: 58 }, head: { pitch: -4, yaw: 0, roll: 0 },
    legs: { FN: [[46, 70], [50, 24], [60, 7.5]], FF: [[38, 70], [40, 24], [49, 7.5]],
      HN: [[4, 34], [-44, 10], [-8, 7.5]], HF: [[-4, 34], [-52, 10], [-18, 7.5]] },
    tail: { a0: 186, curl: 14 }, face: { eyes: 'open', mouth: 'closed', brow: 0 },
  },
  lie: {
    hip: [-56, 36], pitch: 8, neck: { a: 72, len: 54 }, head: { pitch: -6, yaw: 0, roll: 0 },
    legs: { FN: [[62, 14], [104, 9], [122, 7.5]], FF: [[54, 16], [96, 10], [114, 8]],
      HN: [[-14, 22], [-66, 9], [-34, 7.5]], HF: [[-22, 20], [-74, 9], [-44, 7.5]] },
    tail: { a0: 194, curl: 8 }, face: { eyes: 'open', mouth: 'closed', brow: 0 },
  },
};
POSES.pawRaise = {
  ...POSES.sit, head: { pitch: 6, yaw: 16, roll: -6 },
  legs: { ...POSES.sit.legs, FN: [[66, 92], [92, 108], [104, 94]] },
  face: { eyes: 'open', mouth: 'smile', brow: 0.4 },
};
POSES.scratch = { // the hook pose: near hind leg up at the neck, head tipped into the scratch, eyes squeezed in relief
  ...POSES.sit, pitch: 40, neck: { a: 100, len: 50 }, head: { pitch: -10, yaw: 8, roll: 16 },
  legs: { ...POSES.sit.legs, HN: [[10, 78], [-20, 126], [2, 184]] },
  tail: { a0: 196, curl: 14 }, face: { eyes: 'squint', mouth: 'smile', brow: -0.5 }, scratch: true,
};
POSES.wag = {
  ...POSES.stand, head: { pitch: 2, yaw: 14, roll: 0 }, tail: { a0: 100, curl: -30 },
  face: { eyes: 'happy', mouth: 'open', brow: 0.6 }, wag: true,
};
POSES.spin = { // chasing its own tail: body curled into a C, head swung round to the tail, seen from a little above
  ...POSES.stand, bend: -62, pitch: 2, neck: { a: 52, len: 56 }, head: { pitch: -12, yaw: -62, roll: -6 },
  legs: { FN: [[66, 78], [86, 46], [96, 30]], FF: [[44, 80], [40, 26], [50, 7.5]],
    HN: [[-36, 80], [-70, 40], [-60, 7.5]], HF: [[-52, 80], [-96, 54], [-108, 30]] },
  tail: { a0: 40, curl: 30 }, face: { eyes: 'open', mouth: 'open', brow: 0.3 }, spin: true,
};

// pose('sit', overrides) → a pose object (deep-merged for head / face / tail / legs)
export function pose(name, o = {}) {
  const b = POSES[name];
  return { ...b, ...o, head: { ...b.head, ...(o.head || {}) }, face: { ...b.face, ...(o.face || {}) },
    tail: { ...b.tail, ...(o.tail || {}) }, legs: { ...b.legs, ...(o.legs || {}) } };
}

// ------------------------------------------------------------------ build the posed 3D rig
function rig(P) {
  const hip = v3(P.hip[0], P.hip[1]);
  // optional body bend (deg): the rear half swings round a vertical axis at mid-body, toward the dog's right
  const bx = hip.x + 52, Bd = (P.bend || 0) * RAD;
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
  // tail: 4 segments from the root
  const tail = [T(TAIL_ROOT)];
  let a = P.tail.a0;
  for (const L of [26, 24, 20, 16]) { const p = tail[tail.length - 1]; tail.push(add(p, v3(Math.cos(a * RAD) * L, Math.sin(a * RAD) * L, P.bend ? L * 0.9 * Math.sign(-P.bend) : 0))); a += P.tail.curl; }
  const ears = [1, -1].map((side) => {
    const m = (p) => H(v3(p.x, p.y, p.z * side));
    return { side, front: m(EAR.front), back: m(EAR.back), tip: m(EAR.tip), folded: side < 0 };
  });
  const face = {
    eyes: [1, -1].map((side) => ({ side, c: H(v3(EYE.x, EYE.y, EYE.z * side)), n: sub3(H(v3(EYE.x + 6, EYE.y, EYE.z * side * 1.5)), H(v3(EYE.x, EYE.y, EYE.z * side))) })),
    nose: H(NOSE), noseN: sub3(H(v3(NOSE.x + 10, NOSE.y, 0)), H(NOSE)),
    mouth: [1, -1].map((sd) => [H(v3(66, -12, 0)), H(v3(54, -16, 5 * sd)), H(v3(40, -13, 10 * sd)), H(v3(33, -7, 12 * sd))]),
    mouthN: [1, -1].map((sd) => sub3(H(v3(40, -13, 22 * sd)), H(v3(40, -13, 0)))),
    jaw: [H(v3(64, -13)), H(v3(50, -26)), H(v3(34, -16))], jawZ: (sd) => [H(v3(64, -13, 0)), H(v3(50, -26, 5 * sd)), H(v3(34, -16, 10 * sd))],
    brow: [1, -1].map((side) => [H(v3(28, 26, 12 * side)), H(v3(40, 25, 14 * side))]),
    headC: H(v3(10, 10)), up: sub3(H(v3(0, 10)), H(v3(0, 0))),
    collar: [lerp3(neckBase, pivot, 0.5), neckBase, pivot],
  };
  return { torso, neckBase, pivot, head, legs, tail, ears, face };
}
function sub3(a, b) { return v3(a.x - b.x, a.y - b.y, a.z - b.z); }
function lerp3(a, b, t) { return v3(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t)); }

// ------------------------------------------------------------------ view projection
// view: yaw in degrees (0 = side, dog facing right; 90 = facing the viewer; 45 = three-quarter)
function projector(o) {
  const th = (o.view || 0) * RAD, c = Math.cos(th), s = Math.sin(th), S = o.s || 1, m = o.mirror ? -1 : 1;
  const e = (o.elev || 0) * RAD, ce = Math.cos(e), se = Math.sin(e); // camera looking down by elev degrees
  const P = (p) => { const d = p.x * s + p.z * c; return { x: o.x + m * (p.x * c - p.z * s) * S, y: o.y - (p.y * ce - d * se) * S, d: d * ce + p.y * se }; };
  const dirZ = (n) => (n.x * s + n.z * c) * ce + n.y * se; // how much a direction faces the viewer
  return { P, S, dirZ, m };
}
const prim2 = (q, P, S) => q.t === 'circle'
  ? (() => { const c = P(q.c); return { t: 'circle', x: c.x, y: c.y, r: q.r * S, k: (q.k ?? 10) * S }; })()
  : { t: 'cone', a: P(q.a), b: P(q.b), r1: q.r1 * S, r2: q.r2 * S, k: (q.k ?? 10) * S };

function outlineOf(prims, cell) {
  const L = contours(field(prims), primBounds(prims, 8), cell);
  return L[0] || null;
}

// ------------------------------------------------------------------ cel painting of one mass
function paintMass(c, loop, o) {
  const { seed, S, fill = DOG.coat, shade = DOG.coatShade, marks = [], w = 5, light = [-1, -1.2] } = o;
  if (!loop) return;
  const rdx = REG.dx * S, rdy = REG.dy * S;
  fillShape(c, loop, fill, { seed: seed + 1, amp: 1.6 * S, dx: rdx, dy: rdy });
  c.save();
  c.beginPath(); polyPath(c, loop); c.clip();
  // cel shadow crescent: the shape minus itself pushed toward the light
  const sh = 9 * S;
  c.beginPath(); c.rect(-1e4, -1e4, 2e4, 2e4); polyPath(c, loop.map(([x, y]) => [x + light[0] * sh, y + light[1] * sh]));
  c.fillStyle = shade; c.fill('evenodd');
  for (const mk of marks) mk(c);
  if (o.hatch) { // hand hatching inside the shadow crescent only
    c.beginPath(); c.rect(-1e4, -1e4, 2e4, 2e4); polyPath(c, loop.map(([x, y]) => [x + light[0] * sh * 1.6, y + light[1] * sh * 1.6])); c.clip('evenodd');
    c.globalAlpha = 0.5;
    G.hatch(c, loop, { seed: seed + 7, gap: 6.5 * S, ang: -0.85, w: 1.5 * S, amp: 0.6 * S });
    c.globalAlpha = 1;
  }
  c.restore();
  inkLoop(c, loop, { seed: seed + 3, w: w * S, amp: 1.6 * S, splits: 2, heavy: 0.45, t0: 8, t1: 16 });
}

// ------------------------------------------------------------------ the dog
// o: { x, y (ground point under the dog, screen px), s (scale), view (deg), mirror, v (boil variant), accent,
//      seed (per-shot seed so two dogs on screen boil differently), ghost (pencil-only multiples, internal) }
export function drawDog(c, P, o = {}) {
  const R = rig(P);
  const pr = projector(o);
  const { P: Pj, S, dirZ } = pr;
  const v = o.v ?? 0, sd = (o.seed ?? 1000) + v * 97;
  const cell = Math.max(1.6, 2.6 * S);
  const W = o.w ?? 4.4;
  const items = [];
  // ground shadow (hatched, under everything)
  const g0 = Pj(v3(0, 0, 0));
  if (o.shadow !== false) {
    const xs = [...R.legs.map((l) => Pj(l.pts[3]).x), Pj(R.torso[0].c).x, Pj(R.torso[3].c).x];
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const rx = (x1 - x0) / 2 + 26 * S, cx = (x0 + x1) / 2 + 10 * S;
    G.hatch(c, circlePts(cx, o.y + 2 * S, 14 * S, 48, rx), { seed: sd + 5, gap: 9 * S, ang: -0.95, w: 2.2 * S, amp: 0.9 * S });
  }
  // legs
  for (const L of R.legs) {
    const pts = L.pts.map(Pj);
    const prims = [];
    for (let i = 0; i < 3; i++) prims.push({ t: 'cone', a: pts[i], b: pts[i + 1], r1: L.R[i] * S, r2: L.R[Math.min(i + 1, 2)] * S, k: 6 * S });
    const paw = pts[3];
    const fwd = Pj(add(L.pts[3], v3(10, 0, 0)));
    prims.push({ t: 'cone', a: { x: paw.x, y: paw.y - 2 * S }, b: { x: lerp(paw.x, fwd.x, 1), y: fwd.y - 1 * S }, r1: L.R[3] * S, r2: L.R[3] * 0.85 * S, k: 6 * S });
    const depth = (pts[0].d + pts[2].d) / 2;
    items.push({ depth, draw: () => {
      const loop = outlineOf(prims, cell);
      const far = !L.near;
      paintMass(c, loop, { seed: sd + 100 + (L.front ? 0 : 10) + (L.near ? 0 : 20), S, w: W * (far ? 0.9 : 1),
        fill: far ? DOG.coatShade : DOG.coat, shade: far ? shadeOf(DOG.coatShade) : DOG.coatShade, hatch: !far,
        marks: [(cc) => fillShape(cc, circlePts(paw.x + 2 * S, paw.y - 4 * S, 17 * S, 26, 22 * S), far ? DOG.markShade : DOG.mark, { seed: sd + 130, amp: 1.2 * S })] });
      // toe ticks on near paws
      if (!far) for (const k of [0.35, 0.7]) {
        const tx = lerp(paw.x, fwd.x, k) + 4 * S, ty = paw.y + 6 * S;
        inkStroke(c, [[tx, ty - 9 * S], [tx + 1 * S, ty]], { seed: sd + 140 + k * 10, w: 2.4 * S, t0: 3 * S, t1: 3 * S, amp: 0.7 * S, heavy: 0 });
      }
    } });
  }
  // tail
  {
    const pts = R.tail.map(Pj);
    const r = [9, 8, 6.5, 4.5, 2.5];
    const prims = [];
    for (let i = 0; i < 4; i++) prims.push({ t: 'cone', a: pts[i], b: pts[i + 1], r1: r[i] * S, r2: r[i + 1] * S, k: 5 * S });
    const depth = pts[0].d - 4;
    items.push({ depth, draw: () => {
      if (P.wag && !o.ghost) wagGhosts(c, P, o);
      const loop = outlineOf(prims, cell);
      paintMass(c, loop, { seed: sd + 200, S, w: W * 0.9,
        marks: [(cc) => fillShape(cc, circlePts(pts[4].x, pts[4].y, 16 * S, 20), DOG.mark, { seed: sd + 205, amp: 1 * S })] });
      if (P.spin && !o.ghost) { // smear: dry-brush streaks behind the whipping tail
        for (let k = 0; k < 4; k++) {
          const a = pts[2 + (k % 2)], b = pts[4];
          inkStroke(c, [[a.x - (14 + 7 * k) * S, a.y + (k * 7 - 6) * S], [b.x - (34 + 12 * k) * S, b.y + (k * 5) * S]], { seed: sd + 210 + k, w: 3 * S, t0: 30 * S, t1: 6 * S, min: 0.05, amp: 1 * S, heavy: 0 });
        }
      }
    } });
  }
  // torso + neck (+ collar)
  {
    const prims = R.torso.map((q) => prim2(q, Pj, S));
    prims.push({ t: 'cone', a: Pj(R.neckBase), b: Pj(R.pivot), r1: 25 * S, r2: 19 * S, k: 16 * S });
    const chest = Pj(R.torso[4].c), haunch = Pj(R.torso[0].c);
    const depth = Pj(R.torso[3].c).d * 0.5 + haunch.d * 0.5;
    items.push({ depth, draw: () => {
      const loop = outlineOf(prims, cell);
      const nb = Pj(R.neckBase), pv = Pj(R.pivot);
      paintMass(c, loop, { seed: sd + 300, S, w: W, hatch: true,
        marks: [(cc) => { // cream chest blaze running up the throat
          const P2 = [[chest.x - 4 * S, chest.y + 26 * S], [lerp(nb.x, pv.x, 0.4) + 6 * S, lerp(nb.y, pv.y, 0.4)], [lerp(nb.x, pv.x, 0.9) + 8 * S, lerp(nb.y, pv.y, 0.9)]];
          const Q = []; P2.forEach(([x, y], i) => Q.push({ t: 'circle', x, y, r: [24, 14, 12][i] * S, k: 22 * S }));
          const bl = outlineOf(Q.map((q) => ({ ...q })), cell * 1.4);
          if (bl) fillShape(cc, bl, DOG.mark, { seed: sd + 310, amp: 1.4 * S });
        }] });
      // fur ticks: chest ruff + thigh crease
      inkStroke(c, [[chest.x + 6 * S, chest.y + 4 * S], [chest.x + 1 * S, chest.y + 14 * S], [chest.x + 7 * S, chest.y + 22 * S]], { seed: sd + 320, w: 2.6 * S, t0: 4 * S, t1: 6 * S, amp: 0.8 * S, heavy: 0 });
      collar(c, R, Pj, S, sd, o);
    } });
  }
  // ears (behind or in front of the head by depth)
  const headC = Pj(R.face.headC);
  for (const E of R.ears) {
    const f = Pj(E.front), b = Pj(E.back), t = Pj(E.tip);
    const depth = (f.d + b.d + t.d) / 3;
    items.push({ depth: depth > headC.d + 6 * S ? headC.d + 1 : headC.d - 1, draw: () => drawEar(c, E, f, b, t, S, sd, W) });
  }
  // head
  {
    const prims = R.head.map((q) => prim2(q, Pj, S));
    items.push({ depth: headC.d, draw: () => {
      const loop = outlineOf(prims, cell);
      const mz = R.head[3];
      paintMass(c, loop, { seed: sd + 400, S, w: W, hatch: true,
        marks: [(cc) => { // cream muzzle + chin
          const a = Pj(add(mz.a, v3(2, -6))), b = Pj(mz.b), ch = Pj(R.head[4].c);
          const ml = outlineOf([{ t: 'cone', a, b, r1: 16 * S, r2: 13 * S, k: 6 * S }, { t: 'circle', x: ch.x, y: ch.y, r: 12 * S, k: 8 * S }], cell);
          if (ml) fillShape(cc, ml, DOG.mark, { seed: sd + 410, amp: 1.2 * S });
        }] });
      drawFace(c, R, P, Pj, dirZ, S, sd, W);
    } });
  }
  if (P.spin && !o.ghost) spinArcs(c, Pj, S, sd, o, false);
  items.sort((a, b) => a.depth - b.depth);
  for (const it of items) it.draw();
  if (P.scratch && !o.ghost) scratchFX(c, R, Pj, S, sd, o);
  if (P.spin && !o.ghost) spinArcs(c, Pj, S, sd, o, true);
  return { rig: R, project: Pj };
}
function shadeOf(hex) { // a step darker
  const n = parseInt(hex.slice(1), 16), k = 0.84;
  return `rgb(${Math.round((n >> 16) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`;
}

function drawEar(c, E, f, b, t, S, sd, W) {
  // ear: front edge slightly convex, back edge straighter, rounded tip
  const mid = (p, q, k, bulge) => { const mx = lerp(p.x, q.x, k), my = lerp(p.y, q.y, k), nx = q.y - p.y, ny = p.x - q.x, l = Math.hypot(nx, ny) || 1; return [mx + nx / l * bulge, my + ny / l * bulge]; };
  let P;
  if (E.folded) { // left ear: the outline stops at the fold line; the tip hangs forward as a separate flap below
    const k = 0.56;
    P = [[f.x, f.y], mid(f, t, 0.3, -4 * S), [lerp(f.x, t.x, k), lerp(f.y, t.y, k), 1], [lerp(b.x, t.x, k), lerp(b.y, t.y, k), 1], mid(t, b, 0.7, -2 * S), [b.x, b.y]];
  } else P = [[f.x, f.y], mid(f, t, 0.5, -5 * S), [t.x, t.y, 1], mid(t, b, 0.5, -3 * S), [b.x, b.y]];
  const loop = spline(P, true, 3);
  const seed = sd + 500 + (E.side > 0 ? 0 : 20);
  fillShape(c, loop, DOG.coat, { seed: seed + 1, amp: 1.2 * S, dx: REG.dx * S, dy: REG.dy * S });
  // inner ear
  const ci = [lerp(f.x, b.x, 0.5), lerp(f.y, b.y, 0.5)];
  const inner = spline([[lerp(ci[0], f.x, 0.55), lerp(ci[1], f.y, 0.55) - 3 * S], [lerp(ci[0], t.x, E.folded ? 0.5 : 0.78), lerp(ci[1], t.y, E.folded ? 0.5 : 0.78), 1], [lerp(ci[0], b.x, 0.5), lerp(ci[1], b.y, 0.5) - 3 * S]], true, 3);
  fillShape(c, inner, DOG.markShade, { seed: seed + 2, amp: 1 * S });
  if (E.folded) { // the left ear's tip folds forward: a small flap with its own line
    const k = 0.56, fx = lerp(f.x, t.x, k), fy = lerp(f.y, t.y, k), bx = lerp(b.x, t.x, k), by = lerp(b.y, t.y, k);
    const dx = t.x - (fx + bx) / 2, dy = t.y - (fy + by) / 2;
    const flapTip = [(fx + bx) / 2 + dx * 0.25 + (f.x - b.x) * 0.45, (fy + by) / 2 - dy * 0.85 + 8 * S];
    // cut the tip back to the fold line, then draw the flap hanging forward
    const flap = spline([[fx, fy], [flapTip[0], flapTip[1], 1], [bx, by]], true, 3);
    inkLoop(c, loop, { seed: seed + 3, w: W * 0.9 * S, amp: 1.2 * S, splits: 1, heavy: 0.4, t0: 6, t1: 12 });
    fillShape(c, flap, shadeOf(DOG.coat), { seed: seed + 4, amp: 1 * S, dx: REG.dx * 0.6 * S, dy: REG.dy * 0.6 * S });
    inkLoop(c, flap, { seed: seed + 5, w: W * 0.8 * S, amp: 1 * S, heavy: 0.3, t0: 4, t1: 8 });
    return;
  }
  inkLoop(c, loop, { seed: seed + 3, w: W * 0.9 * S, amp: 1.2 * S, splits: 1, heavy: 0.4, t0: 6, t1: 12 });
}

function collar(c, R, Pj, S, sd, o) {
  const [m, nb, pv] = R.face.collar.map(Pj);
  // band across the neck, perpendicular to it
  const dx = pv.x - nb.x, dy = pv.y - nb.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const hw = 24 * S;
  const A = [m.x + nx * hw, m.y + ny * hw], B = [m.x - nx * hw, m.y - ny * hw];
  const mid = [m.x + dx / l * 4 * S, m.y + dy / l * 4 * S];
  inkStroke(c, [A, mid, B], { seed: sd + 600, w: 13 * S, t0: 2 * S, t1: 2 * S, min: 0.85, jit: 0.1, amp: 0.8 * S, heavy: 0, color: PAL.ink });
  inkStroke(c, [A, mid, B], { seed: sd + 601, w: 8 * S, t0: 2 * S, t1: 2 * S, min: 0.85, jit: 0.1, amp: 0.8 * S, heavy: 0, color: PAL.navy });
  // tag hangs from the lowest point of the band
  const low = A[1] > B[1] ? A : B;
  const tx = lerp(low[0], mid[0], 0.35), ty = Math.max(low[1], mid[1]) + 11 * S;
  const tag = circlePts(tx, ty, 7.5 * S, 18);
  fillShape(c, tag, o.accent || '#c9a066', { seed: sd + 602, amp: 0.8 * S, dx: REG.dx * 0.5 * S, dy: REG.dy * 0.5 * S });
  inkLoop(c, tag, { seed: sd + 603, w: 2.6 * S, amp: 0.8 * S, t0: 3, t1: 6 });
}

function drawFace(c, R, P, Pj, dirZ, S, sd, W) {
  const F = R.face, mood = P.face;
  // eyes
  for (const e of F.eyes) {
    const facing = dirZ(e.n) / (Math.hypot(e.n.x, e.n.y, e.n.z) || 1);
    if (facing < -0.25) continue;
    const p = Pj(e.c), sq = clamp(0.35 + 0.65 * (facing + 0.25) / 1.25, 0.35, 1);
    const rx = 6.2 * S * sq, ry = 5.4 * S;
    const seed = sd + 700 + (e.side > 0 ? 0 : 10);
    if (mood.eyes === 'happy') {
      inkStroke(c, [[p.x - rx * 1.3, p.y + 1.5 * S], [p.x, p.y - ry * 0.9], [p.x + rx * 1.3, p.y + 1.5 * S]], { seed, w: 3.6 * S, t0: 3 * S, t1: 3 * S, amp: 0.6 * S, heavy: 0 });
    } else if (mood.eyes === 'closed' || mood.eyes === 'squint') {
      const k = mood.eyes === 'squint' ? -1 : 1;
      inkStroke(c, [[p.x - rx * 1.3, p.y], [p.x, p.y + k * ry * 0.5], [p.x + rx * 1.3, p.y - 1 * S]], { seed, w: 3.6 * S, t0: 3 * S, t1: 3 * S, amp: 0.6 * S, heavy: 0 });
      if (mood.eyes === 'squint') inkStroke(c, [[p.x - rx * 0.9, p.y + 4 * S], [p.x + rx * 1.1, p.y + 3 * S]], { seed: seed + 1, w: 2 * S, t0: 2 * S, t1: 2 * S, amp: 0.5 * S, heavy: 0 });
    } else {
      // almond: pointed at both corners, slight upward tilt at the back
      const E = [[-rx * 1.25, 0.6 * S, 1], [-rx * 0.4, -ry], [rx * 0.6, -ry * 0.85], [rx * 1.25, -0.8 * S, 1], [rx * 0.4, ry * 0.85], [-rx * 0.5, ry * 0.8]];
      const loop = spline(E.map(([x, y, k]) => [p.x + x, p.y + y, k]), true, 2);
      fillShape(c, loop, PAL.ink, { seed, amp: 0.5 * S });
      c.fillStyle = PAL.hi; c.beginPath(); c.arc(p.x - rx * 0.25, p.y - ry * 0.35, 1.9 * S, 0, 7); c.fill();
    }
    // brow tick
    const [b0, b1] = F.brow[e.side > 0 ? 0 : 1].map(Pj);
    const lift = (mood.brow || 0) * 3 * S;
    if (facing > -0.1) inkStroke(c, [[b0.x, b0.y - lift * 0.4], [b1.x, b1.y - lift]], { seed: seed + 5, w: 2.4 * S, t0: 3 * S, t1: 4 * S, amp: 0.5 * S, heavy: 0 });
  }
  // nose: a little bean
  const nf = dirZ(F.noseN) / 10;
  if (nf > -0.6) {
    const n = Pj(F.nose), rx = 8.5 * S * (0.65 + 0.35 * Math.abs(nf)), ry = 6.2 * S;
    const B = [[-rx, 0], [-rx * 0.7, -ry, ], [0, -ry * 0.8], [rx * 0.7, -ry], [rx, 0], [rx * 0.6, ry * 0.9], [0, ry * 0.55], [-rx * 0.6, ry * 0.9]];
    const loop = spline(B.map(([x, y]) => [n.x + x, n.y + y]), true, 2);
    fillShape(c, loop, DOG.nose, { seed: sd + 720, amp: 0.5 * S });
    c.fillStyle = PAL.hi; c.beginPath(); c.arc(n.x - rx * 0.35, n.y - ry * 0.45, 1.8 * S, 0, 7); c.fill();
  }
  // mouth: one half per side of the muzzle, drawn when that side faces the viewer
  if (nf < -0.8) return;
  const halves = [0, 1].filter((i) => dirZ(F.mouthN[i]) > -6);
  for (const i of halves) {
    const sdz = i === 0 ? 1 : -1, M = F.mouth[i].map(Pj);
    if (mood.mouth === 'open') {
      const J = F.jawZ(sdz).map(Pj);
      const shape = spline([[M[0].x, M[0].y], [J[0].x, J[0].y], [J[1].x, J[1].y], [J[2].x, J[2].y], [M[2].x, M[2].y], [M[1].x, M[1].y]], true, 2);
      fillShape(c, shape, PAL.ink, { seed: sd + 730 + i, amp: 0.6 * S });
      const tg = circlePts(lerp(J[0].x, J[1].x, 0.55), lerp(J[0].y, J[1].y, 0.55) - 1 * S, 7 * S, 16, 9 * S);
      c.save(); c.beginPath(); polyPath(c, shape); c.clip();
      fillShape(c, tg, DOG.tongue, { seed: sd + 731, amp: 0.6 * S });
      c.restore();
    } else {
      const pts = mood.mouth === 'smile' ? [M[0], M[1], M[2], { x: M[3].x, y: M[3].y - 3 * S }] : [M[0], M[1], M[2]];
      inkStroke(c, pts.map((q) => [q.x, q.y]), { seed: sd + 735 + i, w: 2.6 * S, t0: 4 * S, t1: 6 * S, amp: 0.5 * S, heavy: 0 });
    }
  }
}

// happy wag: two pencil-ink ghost tails + wag arcs
function wagGhosts(c, P, o) {
  for (const [da, al] of [[-30, 0.28], [26, 0.18]]) {
    c.save(); c.globalAlpha = al;
    const R = rig({ ...P, tail: { ...P.tail, a0: P.tail.a0 + da } });
    const pr = projector(o); const pts = R.tail.map(pr.P);
    inkStroke(c, pts.map((p) => [p.x, p.y]), { seed: 800 + da, w: 7 * pr.S, t0: 6 * pr.S, t1: 18 * pr.S, min: 0.2, amp: 1 * pr.S, heavy: 0 });
    c.restore();
  }
  const R = rig(P), pr = projector(o), root = pr.P(R.tail[0]), tip = pr.P(R.tail[4]);
  const rr = Math.hypot(tip.x - root.x, tip.y - root.y) * 1.12, a0 = Math.atan2(tip.y - root.y, tip.x - root.x);
  for (const k of [0, 1]) {
    const pts = []; for (let i = 0; i <= 10; i++) { const a = a0 - 0.55 + 1.1 * i / 10; pts.push([root.x + Math.cos(a) * (rr + k * 14 * pr.S), root.y + Math.sin(a) * (rr + k * 14 * pr.S)]); }
    inkStroke(c, pts, { seed: 820 + k + (o.v || 0) * 7, w: 3.2 * pr.S, t0: 12 * pr.S, t1: 12 * pr.S, min: 0.1, amp: 1 * pr.S, heavy: 0 });
  }
}

// itch: paw multiples (pencil ghosts), scratch ticks, flying fur flecks
function scratchFX(c, R, Pj, S, sd, o) {
  const L = R.legs.find((l) => l.key === 'HN');
  const paw = Pj(L.pts[3]);
  c.save(); c.globalAlpha = 0.3;
  for (const [dx, dy] of [[-12, 10], [10, -9]]) inkLoop(c, circlePts(paw.x + dx * S, paw.y + dy * S, 11 * S, 18, 14 * S), { seed: sd + 900 + dx, w: 3 * S, amp: 0.8 * S });
  c.restore();
  for (let k = 0; k < 3; k++) {
    const a = -2.2 + k * 0.5, r0 = 26 * S, r1 = 40 * S;
    inkStroke(c, [[paw.x + Math.cos(a) * r0, paw.y + Math.sin(a) * r0], [paw.x + Math.cos(a) * r1, paw.y + Math.sin(a) * r1]], { seed: sd + 910 + k, w: 3.2 * S, t0: 3 * S, t1: 5 * S, amp: 0.6 * S, heavy: 0 });
  }
  for (let k = 0; k < 4; k++) { // fur flecks: tiny tapered commas in coat colour with ink
    const x = paw.x + (24 + 16 * k) * S * (k % 2 ? 1 : -0.6), y = paw.y - (18 + 14 * k) * S;
    const P2 = [[x, y], [x + 6 * S, y - 3 * S], [x + 9 * S, y + 2 * S]];
    inkStroke(c, P2, { seed: sd + 920 + k, w: 3 * S, t0: 2 * S, t1: 6 * S, amp: 0.5 * S, heavy: 0, color: DOG.coatShade });
  }
}

// chase-the-tail spin: wrap arcs on the ground plane round the dog, back halves behind it, front halves over it,
// plus dust puffs kicked up where the paws dig in
function spinArcs(c, Pj, S, sd, o, front) {
  const rings = [{ y: 6, r: 124, a0: 0.4, len: 4.2, w: 4.5 }, { y: 64, r: 108, a0: 2.1, len: 3.4, w: 3.6 }];
  rings.forEach((R, k) => {
    let run = [];
    const flush = () => { if (run.length > 3) inkStroke(c, run, { seed: sd + 950 + k * 3 + (front ? 1 : 0), w: R.w * S, t0: 26 * S, t1: 10 * S, min: 0.08, amp: 1 * S, heavy: 0 }); run = []; };
    for (let i = 0; i <= 40; i++) {
      const t = R.a0 + R.len * i / 40, p3 = v3(10 + Math.cos(t) * R.r, R.y, Math.sin(t) * R.r * 0.9);
      const q = Pj(p3);
      if ((Math.sin(t) > 0) === front) run.push([q.x, q.y]); else flush();
    }
    flush();
  });
  if (!front) return;
  for (const [x3, z3, side] of [[-100, 50, -1], [100, -40, 1]]) {
    const q = Pj(v3(x3, 4, z3));
    for (let k = 0; k < 3; k++) {
      const P2 = circlePts(q.x + side * k * 20 * S, q.y - k * 10 * S, (14 - 3 * k) * S, 16);
      fillShape(c, P2, PAL.hi, { seed: sd + 975 + k, amp: 1 * S });
      inkLoop(c, P2, { seed: sd + 970 + k + side * 5, w: 3 * S, amp: 1 * S });
    }
  }
}
