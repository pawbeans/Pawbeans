---
name: beans-motion
description: The BEANS (beans.sg) motion bible and production workflow. Read it FIRST for any BEANS video, reel, short, social clip, motion graphic, animation or explainer, and before /hyperframes, /remotion or any other video skill. House style is cel animation with line boil (mg-styles-15, prompt 05-cel-boil), rendered with mg-styles-15/harness/render.mjs and lib/audio. Sets the brand palette, the BEANS dog Miya (never redraw her), fonts, logo rules, brand voice and copy rules, sound, output spec, safe zones, the review loop, and the four approval gates. Never render a BEANS video without the owner's explicit approval.
---

# BEANS Motion Bible: Cel Animation / Frame-by-Frame & Line Boil

BEANS (beans.sg) is a Singapore brand of single-ingredient, novel-protein freeze-dried treats and targeted soft-chew
supplements, run by a team of two. It started with Miya, the founders' Goldendoodle, who was allergic to almost
everything. Every BEANS video is a hand-made-looking cel animation on cream paper, built in code and rendered frame by
frame. It must look like a premium editorial studio made it (Buck, Giant Ant): premium and warm, never cutesy, never
clinical. When this file and a generic skill disagree, this file wins.

## 0. Stack and where things live

| Role | Where | Notes |
|---|---|---|
| Style source | `mg-styles-15/` (gitignored; `scripts/setup-motion-stack.sh` re-clones it) | `prompts/05-cel-boil.md` is the full prompt structure for every film; `demos/05-cel-boil/` is the reference source; `rubric.md` is the review prompt. MIT licence. |
| Renderer (primary) | `mg-styles-15/harness/render.mjs`, called through `scripts/cel-render.sh` | A page that draws any time t (`window.renderAt(t)`), captured in headless Chromium, muxed with ffmpeg. `mg-styles-15/beans` is a symlink back to this repo, so our pages load as `/beans/...`. |
| Soundtrack | `mg-styles-15/lib/audio` (mgaudio) via each film's `audio.py` | Python venv: `mg-styles-15/.venv` (Python 3.12). |
| Cel engine | `cel/engine.js` (brush, boil, fills, hatch), `cel/shape.js` (smooth-union silhouettes), `cel/paper.js`, `cel/palette.js`, `cel/fonts.css` | Shared by every film. Change these, not per-film copies. Paper plates: `cel/tools/gen_paper.py` (brand cream). |
| Brand files | `assets/brand/logo/`, `assets/brand/fonts/` | Logo files are placed, never redrawn (§6). |
| Character | `characters/miya/` (Miya) + `references/miya/` (photos) | The one BEANS dog (§3). |
| Films | `films/<yyyy-mm-dd>-<slug>/` | `index.html`, `js/scene.js`, `cues.json`, `audio.py`, `CREDITS.md`, `PRODUCTION.md`, `out/`. |
| Swatch sheet | `cel/swatches/` | Re-render after any palette change: `scripts/cel-render.sh cel/swatches --stills 0`. |
| Fallback engines | HyperFrames (`/hyperframes`, `videos/`), Remotion (`/remotion-*`) | Only if the cel route cannot do something, and only after telling the owner why. The cel harness and HyperFrames stay primary. Remotion licence: BEANS (Paw Beans, 2 people) is a for-profit company with ≤3 employees, so Remotion's free licence covers commercial use; re-check if the team grows past 3. |

Render commands (from the repo root):
```bash
scripts/cel-render.sh films/<slug> --stills 0.4,1.5,3,6.8,9.5      # key-frame stills → films/<slug>/out/stills/
mg-styles-15/.venv/bin/python films/<slug>/audio.py                  # soundtrack → films/<slug>/out/audio.wav
scripts/cel-render.sh films/<slug> --workers 3                       # full render → films/<slug>/out/video.mp4  (Gate 4 only)
```

## 1. Style: signature features and key techniques

These are copied word for word from `mg-styles-15/prompts/05-cel-boil.md`. They define the style: every BEANS video
is judged against them. Do not delete or paraphrase them.

```text
# Signature features and key techniques (the result is judged against these)
手绘逐帧或在矢量动画上叠加逐帧质感，标志性特征是 line boil——线条每隔几帧轻微抖动，仿佛画面在'呼吸'。Giant Ant、Buck 等工作室大量使用 cel 元素（烟、水花、速度线）点缀主动画，反数字精致感的核心手段。
视觉特征 线条持续微抖(boil), 一拍二/一拍三节奏, smear拖影帧, 手绘烟火水花点缀, 纸纹底
关键技法 打帧节奏：24fps 下'一拍二'（实际12fps）为主，快动作切'一拍一'，静止镜头'一拍三'
line boil 伪造法：AE 用 Turbulent Displace（数量2~5、大小50）+ 每 2 帧随机化 evolution + Posterize Time 12fps；真 boil 则画 3~4 张微差线稿循环
smear frame：快速位移的中间帧把物体拉长 150%~300% 只保留 1 帧
cel FX 点缀层：烟/水花/闪电用纯手绘逐帧叠在矢量主体上（Buck 式 hybrid）
整体叠纸纹（multiply 10~15%）统一手作气质
```

English reference translation (for reading only; the block above is the definitive version):
hand-drawn frame by frame, or frame-by-frame texture over vector animation. The signature is line boil: lines jitter
slightly every few frames so the picture seems to breathe. Studios such as Giant Ant and Buck use cel elements
(smoke, splashes, speed lines) to accent the main animation, the core device against digital slickness.
Visual traits: constant line boil, on-2s / on-3s timing, smear frames, hand-drawn fire / water FX accents, paper
ground. Key techniques: timing on 2s at 24 fps (effectively 12 fps) by default, on 1s for fast action, on 3s for
holds. Fake boil in AE with Turbulent Displace (amount 2–5, size 50) + evolution randomised every 2 frames + Posterize
Time 12 fps; real boil = 3–4 slightly different line drawings cycled. Smear frame: stretch the object 150–300 % on the
in-between of a fast move, for 1 frame only. Cel FX layer: smoke / splashes / lightning hand-drawn frame by frame
over the vector body (Buck-style hybrid). Paper texture over everything (multiply 10–15 %) unifies the hand-made feel.

How BEANS implements them (all deterministic, seeded):
- **Paper:** warm cream paper ground (`cel/paper.js drawPaper`), tooth plate multiplied over the whole frame so the deepest
  grain darkens 10–15 % (`drawTooth(..., amount = 0.13)`), shifting with every drawing like a new sheet, plus scanner dust.
- **Line boil:** ink linework is a variable-width brush (centreline + pressure → outline polygon) that is re-drawn with
  3–4 jitter variants: `v = drawing.id % 4` on 2s (`% 3` on 3s), passed as the seed to every `inkStroke` / `inkLoop`.
  Static things keep boiling; nothing on screen is ever perfectly still.
- **Off-register fills:** colour is filled from an independently boiled outline, offset a few px from the line
  (`REG`, about −4/+3 px) like hand colouring.
- **Timing (exposure sheet):** an explicit `SCHED` of `[fromFrame, toFrame, exposure]` per film. On 2s at 24 fps by
  default, on 1s for fast action (strikes, jumps, scratches, bursts), on 3s for holds (the end card).
- **Smear frames:** on a fast move, one in-between drawing stretched 150–300 % along the path (or 2–3 multiples),
  kept for 1 frame only.
- **Cel FX (hand-drawn, frame by frame):** smoke puffs that dissipate through holes, sparks (teardrops), star bursts,
  speed lines, dust puffs, impact frames. Reuse the patterns in `mg-styles-15/demos/05-cel-boil/js/scene.js`
  (`smokeGroup`, `drawSpark`, `drawTwinkle`, `drawStarburst`, `speedLinesRadial`, `impactFrame`); lift them into
  `cel/fx.js` the first time a film needs them, and every later film imports them from there.
- **Shading:** flat cel fills, one cel shadow shape on the lower right (light from the top left), hand hatching in the
  shadow, hatched contact shadows on the ground. No gradients, no soft airbrush, no glow.


## 2. Palette

Each video uses **ink + BEANS navy + cream paper + ONE product accent**, with brand orange as a small constant for
handwritten callouts. Values live in `cel/palette.js` and on the swatch sheet (`cel/swatches/`). Never invent or
"improve" a brand hex. **DERIVED** = computed here, not supplied by the owner.

Core:

| Role | Token | Hex |
|---|---|---|
| Navy (primary, the constant) | `PAL.navy` | `#264170` |
| Deep navy (shadows, depth) | `PAL.navyDeep` | `#1B2F52` |
| Light navy | `PAL.navyLight` | `#5C7094` DERIVED (navy tinted 25 % toward white) |
| Cream (paper base, never stark white) | `PAL.cream` | `#FFF7EA` |
| Card surface / highlight cream | `PAL.hi` | `#FFFDF7` |
| Brand orange (CTA / accent) | `PAL.orange` | `#FE7A3C` (shadow `#BE5C2D` DERIVED) |
| Ink (linework only) | `PAL.ink` | `#1d1915` (warm ink black; not a brand colour) |

Treat protein accents (earthy), `ACCENTS[...]`, shadow DERIVED:
Rabbit `#9BA88D` (`#747E6A`) · Kangaroo `#B24E2B` (`#853A20`) · Venison `#6B2A2A` (`#502020`) ·
Turkey `#C2603E` (`#92482F`) · Ostrich `#8B8A54` (`#68683F`) · Horse `#1F3D2E` (`#172E22`).
**Crocodile is discontinued: never use it or its colour.**

Supplement accents (functional pastels), shadow DERIVED:
Digestive Probiotics sage `#BFD8AE` (`#8FA282`) · Skin & Coat blossom `#F8C3D3` (`#BA929E`) ·
Multivitamins sunny `#FAE588` (`#BBAC66`) · Allergy & Itch sky `#BED3F0` (`#8E9EB4`) ·
Calming lilac `#D4BAE9` (`#9F8BAF`) · Hip & Joint peach `#FDDBB4` (`#BEA487`).

- **Derived shadows** = the accent with brightness (HSV value) × 0.75, same hue and saturation. **Approved by the
  owner on the swatch sheet (2026-10-13).** (HSL lightness × 0.75 was tried
  first and rejected: it turned the pastels garish, e.g. Skin & Coat → `#EC608A`.)
- One product accent per video: the protein for a treats topic, the pastel for a supplement topic. A topic with no
  product uses navy + cream + orange only; ask the owner if unclear.
- Brand orange is used sparingly, like beans.sg: handwritten callouts and their arrows, a sticker tag, one emphasised
  word. It never fills large areas and never competes with the product accent.
- The paper ground is brand cream (`cel/assets/paper_base.jpg`, rebuilt to `#FFF7EA`); with grain on top it measures
  about `#FAF2E5`. Never a stark white frame.
- Pencil blue (`PAL.pencil`) is only for model sheets and storyboards, never in a film.

## 3. The BEANS dog: Miya (one character, every video)

**Miya** is the real BEANS dog and the reason BEANS exists: a **Goldendoodle with a cream / apricot curly coat**.
Reference photos live in `references/miya/` (only the white / cream dog is Miya; ignore the black-and-white dog in
shared photos).

- **Status: model sheet v2 drawn (owner notes on v1 applied), awaiting the owner's approval.** Module: `characters/miya/miya.js`; sheet:
  `characters/miya/model-sheet/` (render: `scripts/cel-render.sh characters/miya/model-sheet --stills 0`). Built in code
  from the five photos in `references/miya/`; no human illustrator for now. Colours: `MIYA` in `cel/palette.js`, sampled
  from the photos. Until approved, do not use her in a film.
- Use:
  ```js
  import { drawMiya, pose } from '/beans/characters/miya/miya.js';
  // x, y = ground point under her; s = scale; view = yaw in degrees (0 side, 45 three-quarter, 90 front);
  // elev = camera looking down (deg); mirror = face left; v = boil variant of this drawing; accent = video accent (tag)
  drawMiya(ctx, pose('scratch'), { x: 540, y: 1460, s: 2.2, view: 15, v: bv(D), accent });
  ```
  Poses: `stand`, `sit`, `lie`, `pawRaise`, `scratch`, `wag`, `spin`. Faces: `eyes` open / happy / squint / closed;
  `mouth` closed / smile / tongue; `brow` −1..1. Ears swing with `ears.swing`.
- What to capture from the photos: a big, soft, rounded curly silhouette (no tapered limbs: plush, columnar legs with
  round "pom" paws), a round domed head with a fluffy top knot, long floppy ears that hang and blend into the
  cheeks, a short rounded muzzle with a beard, a black nose, dark round eyes half-hidden under fringe, a full curly
  tail, cream body with faint apricot warmth on the ears, around the eyes and on the muzzle, and a pink tongue when
  happy. Curls are suggested only by the scalloped, boiling outline: **no C-curl marks inside the fur** (owner note).
- Owner notes on v1 (applied in v2): smaller forehead, rounder face (not a tall oval), ears end at chin level, no curl
  marks, no leg tops showing inside the body (legs tuck under the body; a leg in front, like the scratching hind leg,
  has its top end left un-inked).
- Once approved: **every BEANS video that shows a dog imports this module. Never redraw Miya from scratch, never
  trace, never substitute another dog.** A new pose is added to the module and the model sheet, shown to the owner,
  then used.
- Model sheet contents: front, three-quarter and side views; poses sit, stand, lie down, paw raise, spin, scratching,
  happy tail wag.
- Acting is understated and dignified: no rubber-hose limbs, no giant eyes, no gag expressions.

## 4. Typography

The current beans.sg type (the old Nunito / Inter rule is outdated). Files in `assets/brand/fonts/`, all OFL,
declared in `cel/fonts.css`:

| Use | Font | How |
|---|---|---|
| Headlines, the one key line | **Fraunces** | Navy, sentence case, tight leading. One emphasised word may be Fraunces italic in brand orange, as on the beans.sg hero ("Nothing *hidden.*"). |
| Labels, tags, stickers, nav-style text | **Oswald** | Uppercase, tracked about 0.1 em. Tags sit on small, slightly tilted pill stickers (orange, sage or sunny fill, navy text), like the site's "1 INGREDIENT" / "FREEZE-DRIED" stickers. |
| Body, captions | **Inter** | Navy or ink on a card-cream caption card. |
| Handwritten callouts | Caveat (stand-in) | Short notes with a hand-drawn arrow, navy or orange, like "Miya loves Venison". The site's callout font is unconfirmed; swap if the owner names it. |

- At most two type sizes on screen plus captions. No bouncy, outlined or cartoon lettering.
- A key line may also be hand-lettered with the brush (inked stroke by stroke, boiling), as long as it stays calm.
- All on-screen text is in **English** (an override of the repo prompt's Chinese-text rule).

## 5. Brand voice, copy rules and tone

Read the live copy at beans.sg before writing a script (it renders with JavaScript: load it in headless Chromium).
What the site sounds like (2026-10-13):
- Plain, confident, short. "Nothing added. Nothing hidden." "Real meat. No nonsense. That's the whole idea."
  "Six proteins. One ingredient each." "Every active, on the label."
- Wry, warm benefit lines: "Firmer poops, happier walks." "Less drama at the door." "Less scratching, more napping."
  "For dogs who refuse to slow down." "Good food should just be Tuesday."
- Honest and transparent: full ingredient lists, nothing hidden behind a blend, dosed to actually work.
- Built for sensitive dogs; novel proteins explained simply: "Their immune system has never met these."
- Miya is the origin and the test: "Would we give it to Miya, every day, without thinking twice?"
- Proudly Singapore: Singapore Specials, sausage dogs, fussy dogs, sensitive dogs.

**Copy rules (all on-screen text, captions and voiceover):**
- British spelling (colour, flavour, favourite, licence).
- Short sentences.
- **No em dashes.** Use a full stop, comma or colon.
- **Never say "pet parents", "pawrents" or "cheap".**
- **No invented health claims.** Every fact or number shown on screen needs a source, listed in the film's
  `CREDITS.md` (and in the script). Supplement benefits use the brand's own careful phrasing ("helps", "supports",
  "less scratching") and never claim to cure or treat.

**Tone guardrail:** premium and warm, never cutesy, never clinical. Teach, don't sell: films can be product-forward
in look (the beans.sg hero shows pouches and chew tins next to Miya), but there are no prices, discount codes or
"shop now" lines, and the logo appears on the end card only.

**Sound:** warm, understated acoustic music: nylon or steel guitar, upright bass, soft piano, brushed percussion, a
little vibraphone or harp at most (`pluck.guitar`, `pluck.harp`, `samples.inst('piano'|'vibraphone'|'harp')`,
`drums.snare('brush')`); starting points `recipes.lofi(flavor='chill', keys='piano')` or
`recipes.ambient(flavor='piano')`, thinned out. Soft foley (paper, pen, paws on the floor, fur rustle, a breath)
synced to the cue sheet. **No zany cartoon SFX: no xylophone, no slide whistle, no boing, no cork pops, no squeaks.**
Master −14 LUFS integrated, true peak ≤ −1 dBTP.

## 6. Logo

- Files: `assets/brand/logo/`. Versions: (a) the BEANS wordmark with a paw print inside the A, (b) the standalone
  paw-B icon; each in navy on cream and cream on navy.
- Currently on file: `beans-logo-source.png` (navy wordmark, transparent, 424×154 px, from the owner's link). It is
  too small to place sharply at end-card size; use it for drafts only. Final renders need the owner's vector (SVG)
  or high-resolution files for all four versions.
- **Never redraw, boil, trace, recolour, outline or restyle the logo.** Place the supplied file clean and still on
  the end card (the paper and drawings around it may keep boiling). Navy-on-cream on a cream end card; cream-on-navy
  on a navy end card.
- Logo on the end card only.

## 7. Reference style

- No reference reels yet. Benchmark against the 05-cel-boil demo in `mg-styles-15` plus Buck's and Giant Ant's
  hand-drawn work.
- Match the beans.sg hero: cream background, navy, product-forward (pouches and chew tins drawn as hero objects),
  playful handwritten callouts with arrows, small tilted Oswald stickers. Premium and warm, never cutesy, never clinical.

## 8. Output spec (default)

- **1080×1920 vertical, 24 fps, 15–45 s**, H.264 MP4 with stereo AAC audio (48 kHz), −14 LUFS, TP ≤ −1 dBTP.
  (The pilot and tests may be shorter, as briefed.)
- Hook in the first 0.5 s: never open on more than 0.3 s of empty paper. One unmistakable hero moment at about
  60–75 % of the runtime. End on the BEANS logo end card (§6), held about 1 s while the drawing around it boils (on 3s).
- **Captions always on** for any voiceover or spoken idea: Inter on a card-cream caption card (hand-cut, boiling
  edge), max 2 lines, inside the safe zones.
- **Safe zones (1080×1920):** keep all text and key action inside x 60–940, y 220–1480 (platform UI covers the top
  220 px, the bottom 440 px and the right-hand buttons). Captions sit in y 1220–1440. Below y 1480 and right of
  x 940: paper, texture and background drawing only.

## 9. Rules (from the repo prompt, with BEANS overrides)

- **Deterministic frames:** every frame is a pure function of t. Seeded randomness only (`hs`, `mulberry32`); physics
  and particles precomputed or closed-form; no clocks, no CSS transitions, no `Math.random()`.
- **Licensed assets only:** CC0 / public domain / OFL / Apache / free for commercial use. Every film keeps a
  `CREDITS.md` listing each asset, source and licence, **and the source of every fact shown on screen** (start from the
  repo-level `CREDITS.md`).
- **Overrides:** all on-screen text is English; BEANS is our real brand, so use the real name and the real logo
  (placed, never redrawn). No other real brands or trademarks.
- Everything else in `prompts/05-cel-boil.md` applies: the Output checks, How to work (treatment → key frames → motion
  → sound → final), the craft checklist, and the honest self-score.

## 10. Prompt structure for every film

Use `mg-styles-15/prompts/05-cel-boil.md` as the complete prompt structure. For each film, rewrite only:
- **Output** → §8 above (1080×1920, 24 fps, the agreed length).
- **Creative seed** → the approved script (story, beats, copy per §5, palette = ink + navy + cream + one accent +
  orange callouts, sound per §5).
Keep **Style**, **Signature features**, **How to work**, **Rules** (with §9's overrides), **Craft checklist** and
**Before you deliver** exactly as they are.

## 11. Workflow and approval gates

Every new video goes through four gates, in order. **Never render without the owner's explicit approval.** Track
the gates in `films/<slug>/PRODUCTION.md`.

1. **Pitch.** Pitch 3–5 ideas: title, the 0.5 s hook, the one insight, why a dog owner cares, the accent colour,
   Miya poses needed (and any new ones), length. Stop: **the owner picks one.**
2. **Script.** A detailed script with a strong hook, written to §5: a beat table (time, picture, on-screen text /
   captions, exposure on 1s/2s/3s, cel FX, sound), a source for every fact. Stop: **the owner refines and approves it.**
3. **Storyboard and key frames.** Build the film page and cue sheet, then render **6–10 key-frame stills** with
   `--stills` (plus a contact sheet). Show them with a beat-by-beat timeline. Stills are not a render of the video.
   Stop: **the owner approves**, or gives notes and Gate 3 repeats.
4. **Render.** Only after explicit approval of the current key frames. Render audio and video, check the spec
   (duration, 1080×1920, 24 fps, −14 LUFS, TP ≤ −1 dBTP, no black frames, no fallback fonts, nothing outside the safe
   zones), then run the **quality loop**:
   - **Review:** a separate reviewer (a subagent that did not make the film) judges the render with
     `mg-styles-15/rubric.md` step 1: contact sheet, filmstrips, full-res frames, spec checks, scores, and a fix list.
   - **Revise once:** apply the critical and high-impact fixes (rubric step 2), re-render and re-check.
   - Then show the owner the revised film, the review's scores, what changed and what's still weak.
   Any change after approval that alters what the owner approved goes back to Gate 3.

`PRODUCTION.md` template:
```
# <title>
- [ ] Gate 1: idea picked by owner (date, which idea)
- [ ] Gate 2: script approved by owner (date, version)
- [ ] Gate 3: key frames + timeline approved by owner (date, version)
- [ ] Gate 4: rendered → reviewed (rubric) → revised once → shown (files, spec numbers, scores)
Pending / unapproved inputs in use: …
Sources (also in CREDITS.md): …
```

## 12. Pre-render checklist

- [ ] Gate 3 approval recorded for this exact version
- [ ] Every signature feature in §1 is visible: boil on everything, on-2s/1s/3s exposure sheet, ≥1 smear frame,
      hand-drawn cel FX, paper multiply 10–15 %
- [ ] The dog is the approved Miya module, unchanged in design
- [ ] Palette = ink + navy + cream + one accent (+ sparing orange); no Crocodile colour
- [ ] Copy: British spelling, short sentences, no em dashes, no "pet parents" / "pawrents" / "cheap", proofread
- [ ] Every on-screen fact sourced in `CREDITS.md`; no invented health claims
- [ ] Captions on and inside the safe zones
- [ ] Logo: the supplied file, placed clean, end card only, never boiled or restyled
- [ ] Acoustic music + soft foley; no xylophone or cartoon SFX
- [ ] `CREDITS.md` complete; deterministic page (no `Math.random`, no clocks)
