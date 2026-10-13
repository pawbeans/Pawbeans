// BEANS cel shapes: build organic silhouettes as a smooth union of round cones and circles (2D signed distance
// fields), then trace the outline with marching squares. One rig gives a clean, single, inkable outline from any
// view, so a character never looks like stacked basic shapes. Pure functions only (deterministic).

// ---------------------------------------------------------------- 2D SDF primitives (negative = inside)
export function sdCircle(px, py, c) { return Math.hypot(px - c.x, py - c.y) - c.r; }

// Round cone (uneven capsule) from a (radius r1) to b (radius r2). After Inigo Quilez (MIT).
export function sdRoundCone(px, py, a, b, r1, r2) {
  const bax = b.x - a.x, bay = b.y - a.y;
  const l2 = bax * bax + bay * bay;
  if (l2 < 1e-6) return Math.hypot(px - a.x, py - a.y) - Math.max(r1, r2);
  const rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
  const pax = px - a.x, pay = py - a.y;
  const y = pax * bax + pay * bay, z = y - l2;
  const qx = pax * l2 - bax * y, qy = pay * l2 - bay * y;
  const x2 = qx * qx + qy * qy, y2 = y * y * l2, z2 = z * z * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(z) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
  if (Math.sign(y) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
  if (a2 <= 0) return Math.hypot(px - a.x, py - a.y) - Math.max(r1, r2); // one end swallows the other
  return (Math.sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}

// Rotated ellipse (approximate distance, good enough for blending).
export function sdEllipse(px, py, e) {
  const c = Math.cos(-(e.rot || 0)), s = Math.sin(-(e.rot || 0));
  const dx = px - e.x, dy = py - e.y;
  const u = (dx * c - dy * s) / e.rx, v = (dx * s + dy * c) / e.ry;
  return (Math.hypot(u, v) - 1) * Math.min(e.rx, e.ry);
}

// Polygon (convex or concave), exact distance. P = [[x,y],...]
export function sdPoly(px, py, P) {
  let d = Infinity, inside = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [ax, ay] = P[j], [bx, by] = P[i];
    const ex = bx - ax, ey = by - ay, wx = px - ax, wy = py - ay;
    const t = Math.max(0, Math.min(1, (wx * ex + wy * ey) / (ex * ex + ey * ey || 1)));
    d = Math.min(d, Math.hypot(wx - ex * t, wy - ey * t));
    if ((ay > py) !== (by > py) && px < ax + ((py - ay) * (bx - ax)) / (by - ay)) inside = !inside;
  }
  return inside ? -d : d;
}

// polynomial smooth min (k = blend radius in px)
export function smin(a, b, k) {
  if (k <= 0) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

// prims: [{t:'cone', a, b, r1, r2} | {t:'circle', x, y, r} | {t:'ellipse', ...} | {t:'poly', P} ], each with optional
// k (blend into what came before) and sub:true (carve away instead of add)
export function field(prims) {
  return (x, y) => {
    let d = Infinity;
    for (const p of prims) {
      let v;
      if (p.t === 'cone') v = sdRoundCone(x, y, p.a, p.b, p.r1, p.r2);
      else if (p.t === 'circle') v = sdCircle(x, y, p);
      else if (p.t === 'ellipse') v = sdEllipse(x, y, p);
      else v = sdPoly(x, y, p.P);
      if (p.sub) d = Math.max(d, -v);
      else d = d === Infinity ? v : smin(d, v, p.k ?? 10);
    }
    return d;
  };
}

// bounding box of prims (+ margin)
export function primBounds(prims, m = 12) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x, y, r) => { x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r); x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r); };
  for (const p of prims) {
    if (p.sub) continue;
    if (p.t === 'cone') { add(p.a.x, p.a.y, p.r1); add(p.b.x, p.b.y, p.r2); }
    else if (p.t === 'circle') add(p.x, p.y, p.r);
    else if (p.t === 'ellipse') add(p.x, p.y, Math.max(p.rx, p.ry));
    else for (const [x, y] of p.P) add(x, y, 0);
  }
  return { x0: x0 - m, y0: y0 - m, x1: x1 + m, y1: y1 + m };
}

// ---------------------------------------------------------------- marching squares → closed loops
// Returns the loops of the zero level set, longest first. cell = grid size in px.
export function contours(f, b, cell = 3) {
  const nx = Math.ceil((b.x1 - b.x0) / cell) + 1, ny = Math.ceil((b.y1 - b.y0) / cell) + 1;
  const v = new Float64Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    let d = f(b.x0 + i * cell, b.y0 + j * cell);
    if (i === 0 || j === 0 || i === nx - 1 || j === ny - 1) d = Math.max(d, 1e-3); // close loops at the border
    v[j * nx + i] = d;
  }
  const P = (i, j) => [b.x0 + i * cell, b.y0 + j * cell];
  const lerpPt = (i0, j0, i1, j1) => {
    const a = v[j0 * nx + i0], c = v[j1 * nx + i1], t = a / (a - c);
    const [x0, y0] = P(i0, j0), [x1, y1] = P(i1, j1);
    return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
  };
  // edge ids: horizontal (i,j)->(i+1,j) = 2*(j*nx+i), vertical (i,j)->(i,j+1) = 2*(j*nx+i)+1
  const pts = new Map(), next = new Map();
  const pt = (id) => {
    if (!pts.has(id)) {
      const k = id >> 1, i = k % nx, j = (k - i) / nx;
      pts.set(id, id & 1 ? lerpPt(i, j, i, j + 1) : lerpPt(i, j, i + 1, j));
    }
    return id;
  };
  const seg = (a, b) => { next.set(pt(a), pt(b)); };
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = v[j * nx + i], bb = v[j * nx + i + 1], c = v[(j + 1) * nx + i + 1], d = v[(j + 1) * nx + i];
    const code = (a < 0 ? 8 : 0) | (bb < 0 ? 4 : 0) | (c < 0 ? 2 : 0) | (d < 0 ? 1 : 0);
    if (code === 0 || code === 15) continue;
    const T = 2 * (j * nx + i), R = 2 * (j * nx + i + 1) + 1, B = 2 * ((j + 1) * nx + i), L = 2 * (j * nx + i) + 1;
    // oriented so the inside is on the right of travel (consistent winding)
    switch (code) {
      case 1: seg(L, B); break;
      case 2: seg(B, R); break;
      case 3: seg(L, R); break;
      case 4: seg(R, T); break;
      case 5: { const m = (a + bb + c + d) / 4; if (m < 0) { seg(L, T); seg(R, B); } else { seg(L, B); seg(R, T); } break; }
      case 6: seg(B, T); break;
      case 7: seg(L, T); break;
      case 8: seg(T, L); break;
      case 9: seg(T, B); break;
      case 10: { const m = (a + bb + c + d) / 4; if (m < 0) { seg(T, R); seg(B, L); } else { seg(T, L); seg(B, R); } break; }
      case 11: seg(T, R); break;
      case 12: seg(R, L); break;
      case 13: seg(R, B); break;
      case 14: seg(B, L); break;
    }
  }
  const loops = [], seen = new Set();
  for (const start of next.keys()) {
    if (seen.has(start)) continue;
    const loop = [];
    let id = start, guard = 0;
    while (id !== undefined && !seen.has(id) && guard++ < 1e6) { seen.add(id); loop.push(pts.get(id)); id = next.get(id); }
    if (loop.length > 4) loops.push(loop);
  }
  loops.sort((p, q) => q.length - p.length);
  return loops;
}

// convenience: the main outline of a set of prims
export function silhouette(prims, cell = 3) {
  const L = contours(field(prims), primBounds(prims), cell);
  return L;
}
