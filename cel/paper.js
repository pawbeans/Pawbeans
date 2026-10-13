// BEANS cel paper: warm cream animation bond under everything, a tooth plate multiplied over everything
// (10–15 %, shifts with every drawing like a new sheet), and scanner dust that changes per drawing.
// Plates: cel/assets/ (built from ambientCG Paper001 + the mg-styles-15 dust plates, both CC0).
import { hs } from './engine.js';

const IMG = {};
const load = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });

export async function loadPaper(base = '/beans/cel/assets') {
  IMG.paper = await load(`${base}/paper_base.jpg`);
  IMG.tooth = await load(`${base}/paper_tooth.png`);
  IMG.dust = [];
  for (let k = 1; k <= 4; k++) IMG.dust.push(await load(`${base}/dust_ink_0${k}.png`));
  await Promise.all([IMG.paper.decode(), IMG.tooth.decode(), ...IMG.dust.map((d) => d.decode())]);
  return IMG;
}

// the paper ground; for a vertical frame the landscape plate is rotated so its tooth keeps its scale
export function drawPaper(c, W, H, cam = { x: 0, y: 0 }) {
  c.save();
  if (H > W) {
    c.translate(W / 2 + cam.x, H / 2 + cam.y); c.rotate(Math.PI / 2);
    const s = 1.045; c.drawImage(IMG.paper, -H * s / 2, -W * s / 2, H * s, W * s);
  } else {
    const s = 1.045; c.drawImage(IMG.paper, cam.x + (W - W * s) / 2, cam.y + (H - H * s) / 2, W * s, H * s);
  }
  c.restore();
}

// multiply pass of the tooth + dust specks; v = boil variant of the current drawing.
// amount = how dark the deepest paper grain gets (0.10–0.15 = the style's "paper multiply 10–15 %").
// The plate is near-white (mean 0.958, min 0.678), so alpha = amount / 0.322: at 0.13 the deepest grain darkens
// 13 %, the 95th-percentile grain ~6.5 %, the average ~1.7 % (measured).
export function drawTooth(c, W, H, v, dpr = 1, amount = 0.13) {
  const ox = Math.floor(hs(v, 51) * 470), oy = Math.floor(hs(v, 52) * 310);
  c.save();
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.globalCompositeOperation = 'multiply';
  c.globalAlpha = Math.min(1, amount / 0.322);
  const tw = IMG.tooth.width, th = IMG.tooth.height;
  for (let y = -oy; y < H; y += th) for (let x = -ox; x < W; x += tw) c.drawImage(IMG.tooth, x, y);
  c.globalCompositeOperation = 'source-over';
  c.globalAlpha = 0.2;
  const dm = IMG.dust[v % 4];
  c.translate(W / 2, H / 2); c.scale(v % 2 ? -1 : 1, v % 3 ? 1 : -1);
  if (H > W) c.rotate(Math.PI / 2);
  const dw = H > W ? H : W, dh = H > W ? W : H;
  c.drawImage(dm, -dw / 2, -dh / 2, dw, dh);
  c.restore();
}
