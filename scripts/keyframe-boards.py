"""Whole-film key-frame boards for a BEANS film (the owner's Gate 3 format).

Reads films/<slug>/boards.json:
  {"title": "DOG DECODED · WHERE YOUR DOG SLEEPS",
   "duration": 30,
   "sections": [["HOOK", 0, 3], ["1 · THE BED", 3, 9], ...],     # name, start s, end s (cover 0..duration)
   "hero": [1.2, 14.6, 22.05],                                      # hero beats (marked in orange)
   "boards": [[0, 1], [2, 3], [4, 5]]}                              # section indices per board (optional)

  python scripts/keyframe-boards.py films/<slug> --times     # print the still times: every second at x.5 + hero beats
  scripts/cel-render.sh films/<slug> --stills $(python scripts/keyframe-boards.py films/<slug> --times)
  python scripts/keyframe-boards.py films/<slug>             # → films/<slug>/review/<slug>-keyframes-{a,b,...}.png

Run with mg-styles-15/.venv/bin/python (needs Pillow).
"""
import glob, json, math, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INK, NAVY, CREAM, ORANGE = (29, 25, 21), (38, 65, 112), (255, 247, 234), (254, 122, 60)


def times(cfg):
    ts = {round(i + 0.5, 2) for i in range(int(math.ceil(cfg['duration'])))}
    ts |= {round(float(h), 2) for h in cfg.get('hero', [])}
    return sorted(t for t in ts if t < cfg['duration'])


def font(sub, size):
    from PIL import ImageFont
    fs = sorted(glob.glob(f'{ROOT}/assets/brand/fonts/{sub}/*.ttf'), key=len)
    return ImageFont.truetype(fs[0], size)


def boards(film, cfg):
    from PIL import Image, ImageDraw
    slug = os.path.basename(os.path.normpath(film))
    stills, out = os.path.join(film, 'out', 'stills'), os.path.join(film, 'review')
    os.makedirs(out, exist_ok=True)
    fT, fS, fL = font('oswald', 64), font('oswald', 34), font('inter', 26)
    secs = cfg['sections']
    groups = cfg.get('boards') or [list(range(i, min(i + 2, len(secs)))) for i in range(0, len(secs), 2)]
    have = {}
    for p in glob.glob(os.path.join(stills, 't*.png')):
        try: have[round(float(os.path.basename(p)[1:-4]), 2)] = p
        except ValueError: pass
    hero = {round(float(h), 2) for h in cfg.get('hero', [])}
    want = set(times(cfg))
    have = {t: p for t, p in have.items() if t in want}   # ignore stray check stills
    TW, TH, COLS, GAP, LAB, M = 300, 533, 6, 24, 44, 48
    paths = []
    for bi, grp in enumerate(groups):
        rows = [(secs[i][0], secs[i][1], secs[i][2], [t for t in sorted(have) if secs[i][1] <= t < secs[i][2]]) for i in grp]
        h = M + 100 + sum(56 + math.ceil(max(1, len(ts)) / COLS) * (TH + LAB + GAP) for *_, ts in rows)
        W = M * 2 + COLS * TW + (COLS - 1) * GAP
        im = Image.new('RGB', (W, h + M), CREAM); d = ImageDraw.Draw(im)
        lo, hi = min(r[1] for r in rows), max(r[2] for r in rows)
        d.text((M, M), f"{cfg['title']}   key frames {lo:g}–{hi:g} s  ({chr(65 + bi)}/{len(groups)})", font=fT, fill=NAVY)
        y = M + 100
        for name, a, b, ts in rows:
            d.text((M, y), f'{name}   {a:g}–{b:g} s', font=fS, fill=INK); y += 56
            for i, t in enumerate(ts):
                x, yy = M + (i % COLS) * (TW + GAP), y + (i // COLS) * (TH + LAB + GAP)
                im.paste(Image.open(have[t]).convert('RGB').resize((TW, TH), Image.LANCZOS), (x, yy))
                d.rectangle([x - 1, yy - 1, x + TW, yy + TH], outline=INK, width=2)
                d.text((x, yy + TH + 8), f'{t:05.2f} s' + ('  ★ hero' if t in hero else ''), font=fL, fill=ORANGE if t in hero else INK)
            y += math.ceil(max(1, len(ts)) / COLS) * (TH + LAB + GAP)
        p = os.path.join(out, f'{slug}-keyframes-{chr(97 + bi)}.png')
        im.save(p, optimize=True); paths.append(p)
    return paths


if __name__ == '__main__':
    film = sys.argv[1]
    cfg = json.load(open(os.path.join(film, 'boards.json')))
    if '--times' in sys.argv:
        print(','.join(f'{t:g}' for t in times(cfg)))
    else:
        for p in boards(film, cfg):
            print(p)
