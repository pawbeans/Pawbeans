---
name: beans-motion
description: The BEANS (beans.sg) motion bible and production workflow. Read it FIRST for any BEANS video, reel, short, social clip, motion graphic, animation or explainer, and before /hyperframes, /remotion or any other video skill. House style is cel animation with line boil (mg-styles-15, prompt 05-cel-boil), rendered with mg-styles-15/harness/render.mjs and lib/audio. Sets the palette, the BEANS dog character (never redraw it), type, tone, sound, output spec, safe zones, the review loop, and the four approval gates. Never render a BEANS video without the owner's explicit approval.
---

# BEANS Motion Bible: Cel Animation / Frame-by-Frame & Line Boil

BEANS (beans.sg) is a premium Singapore dog treats and supplements brand. Every BEANS video is a hand-made-looking
cel animation on warm paper, built in code and rendered frame by frame. It must look like a premium editorial studio
made it (Buck, Giant Ant), never like a kids' cartoon. When this file and a generic skill disagree, this file wins.

## 0. Stack and where things live

| Role | Where | Notes |
|---|---|---|
| Style source | `mg-styles-15/` (gitignored; `scripts/setup-motion-stack.sh` re-clones it) | `prompts/05-cel-boil.md` is the full prompt structure for every film; `demos/05-cel-boil/` is the reference source; `rubric.md` is the review prompt. MIT licence. |
| Renderer | `mg-styles-15/harness/render.mjs`, called through `scripts/cel-render.sh` | A page that draws any time t (`window.renderAt(t)`), captured in headless Chromium, muxed with ffmpeg. `mg-styles-15/beans` is a symlink back to this repo, so our pages load as `/beans/...`. |
| Soundtrack | `mg-styles-15/lib/audio` (mgaudio) via each film's `audio.py` | Python venv: `mg-styles-15/.venv` (Python 3.12). |
| Cel engine | `cel/engine.js` (brush, boil, fills, hatch), `cel/shape.js` (smooth-union silhouettes), `cel/paper.js`, `cel/palette.js`, `cel/fonts.css` | Shared by every film. Change these, not per-film copies. |
| Character | `characters/beans-dog/dog.js` + `model-sheet/` | The one BEANS dog (§3). |
| Films | `films/<yyyy-mm-dd>-<slug>/` | `index.html`, `js/scene.js`, `cues.json`, `audio.py`, `CREDITS.md`, `PRODUCTION.md`, `out/`. |
| Fallback engines | `/hyperframes`, `/remotion-*` skills, `videos/` | Only if the cel route cannot do something, and only after telling the owner why. Remotion needs a paid licence above 3 employees. |

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

Each video uses **ink + BEANS navy + cream paper + ONE warm accent**. Values live in `cel/palette.js`; every value
marked PLACEHOLDER waits for the owner's real hex codes. Never invent or "improve" a brand hex.

| Role | Token | Placeholder |
|---|---|---|
| Ink (all linework) | `PAL.ink` | `#1d1915` |
| BEANS navy (type, collar, end card) | `PAL.navy` | `#1b2a4a` PLACEHOLDER |
| Cream paper | `PAL.cream` | `#f4e9d0` PLACEHOLDER |
| Paper-white highlight | `PAL.hi` | `#fff7e6` |
| ONE accent per video | `ACCENTS[...]` | treats (earthy): Kangaroo, Venison, Rabbit, Ostrich, Turkey, Horse; supplements (pastels): Hip & Joint, Skin & Coat, Allergy & Itch, Digestive Probiotics, Calming, Multivitamin. All PLACEHOLDER. |

- The accent is the protein colour for a treats topic or the pastel for a supplement topic, and only one per video.
  A topic film with no product uses the accent closest to its subject; ask the owner if unclear.
- The dog's own colours (`DOG` in `cel/palette.js`: biscuit coat, coat shadow, cream markings, muted rose tongue)
  are a fixed character palette, the same in every video. Its collar is navy; its tag takes the video's accent.
- Extra colours are tints and shades of these, not new hues. Pencil blue (`PAL.pencil`) is only for construction
  lines and notes on model sheets and storyboards, never in a film.

## 3. The BEANS dog (one character, every video)

`characters/beans-dog/dog.js` is the only BEANS dog. **Every BEANS video that shows a dog imports it. Never redraw the
dog from scratch, never trace it, never substitute another dog.** If a shot needs a pose the library lacks, add a pose
to `POSES` in `dog.js` (and to the model sheet), show it to the owner, then use it.

- Design: a Singapore Special (local mixed-breed street dog). Medium and lean, short biscuit coat, cream
  muzzle / chest / socks / tail tip, upright triangular ears with the **left ear tip folded over**, sickle tail carried
  up, a **bean-shaped nose**, a navy BEANS collar with a small tag in the video's accent colour.
- Model sheet: `characters/beans-dog/model-sheet/` (render: `scripts/cel-render.sh characters/beans-dog/model-sheet --stills 0`).
  Turnaround: front, three-quarter, side. Poses: `stand`, `sit`, `lie`, `pawRaise`, `scratch`, `wag`, `spin`.
- Use:
  ```js
  import { drawDog, pose } from '/beans/characters/beans-dog/dog.js';
  // x, y = ground point under the dog; s = scale; view = yaw in degrees (0 side, 45 three-quarter, 90 front);
  // elev = camera looking down (deg); mirror = face left; v = boil variant of this drawing; accent = video accent
  drawDog(ctx, pose('scratch', { face: { eyes: 'squint' } }), { x: 540, y: 1460, s: 2.2, view: 15, v: bv(D), accent });
  ```
- Animate by interpolating pose parameters between keys on the exposure sheet (on 2s), with smear or multiple frames
  on fast moves (the scratch paw on 1s, the tail wag on 1s). Faces: `eyes` open / happy / squint / closed; `mouth`
  closed / smile / open; `brow` −1..1.
- Acting is understated and dignified: no rubber-hose limbs, no giant eyes, no gag expressions.

## 4. Typography

Restrained and editorial. Brand fonts are PENDING from the owner; until then `cel/fonts.css` maps placeholders (OFL):
`BEANS Display` = Instrument Serif (headlines, the one key line), `BEANS Text` = DM Sans (captions, labels),
`BEANS Pencil` = Caveat (model sheets and storyboard notes only). Swap the files, keep the family names.

- At most two type sizes on screen plus captions. Sentence case. No bouncy, outlined or cartoon lettering.
- A key line may be hand-lettered with the brush (inked stroke by stroke, boiling), like the reference film's title,
  as long as it stays calm and legible. Otherwise set type in `BEANS Display`, ink or navy on paper.
- All on-screen text is in **English** (an override of the repo prompt's Chinese-text rule): correct, natural,
  Singapore/UK spelling (colour, flavour), no typos.

## 5. Tone and sound

- Premium, editorial dog education. Calm, warm, confident and curious. **Not childish**: no gags, no squeaky voices,
  no slapstick.
- Teach, don't sell: the content is relevant to BEANS (proteins, allergies, joints, skin, gut, calm) but there are no
  prices, offers or product pitches. **Logo end card only.**
- Claims are accurate; numbers carry a source in the script; no cure / treat claims ("supports", "may help").
- Music: warm, understated acoustic: nylon or steel guitar, upright bass, soft piano, brushed percussion, a little
  vibraphone or harp at most (`pluck.guitar`, `pluck.harp`, `samples.inst('piano'|'vibraphone'|'harp')`, `drums.snare('brush')`).
  Recipe starting points: `recipes.lofi(flavor='chill', keys='piano')` or `recipes.ambient(flavor='piano')`, then thin it out.
- Sound design: soft foley (paper, pen, cloth, paws on floor, fur rustle, a breath), synced to the cue sheet.
  **No zany cartoon SFX: no xylophone, no slide whistle, no boing, no cork pops, no squeaks.** Hero moments get weight
  from a soft impact, a swell and a breath of silence, not from noise.
- Master: −14 LUFS integrated, true peak ≤ −1 dBTP, stereo AAC 48 kHz (mgaudio `export` does this).

## 6. Output spec (default)

- **1080×1920 vertical, 24 fps, 15–45 s**, H.264 MP4 with stereo AAC audio (48 kHz), −14 LUFS, TP ≤ −1 dBTP.
  (The pilot and tests may be shorter, as briefed.)
- Hook in the first 0.5 s: never open on more than 0.3 s of empty paper. One unmistakable hero moment at about
  60–75 % of the runtime. End on the BEANS logo end card, held about 1 s with the line work boiling (on 3s).
- The BEANS logo appears only on the end card, using the real logo SVG once the owner supplies it (until then a
  clearly labelled placeholder wordmark). BEANS is the real brand: use its real name and logo (an override of the repo
  prompt's "invent brand names" rule). No other real brands or trademarks.
- **Captions always on** for any voiceover or spoken idea, in `BEANS Text`, ink on a cream paper card (hand-cut,
  boiling edge), max 2 lines, inside the safe zones.
- **Safe zones (1080×1920):** keep all text and key action inside x 60–940, y 220–1480 (platform UI covers the top
  220 px, the bottom 440 px and the right-hand buttons). Captions sit in y 1220–1440. Below y 1480 and right of
  x 940: paper, texture and background drawing only.

## 7. Rules (from the repo prompt, with BEANS overrides)

- **Deterministic frames:** every frame is a pure function of t. Seeded randomness only (`hs`, `mulberry32`); physics
  and particles precomputed or closed-form; no clocks, no CSS transitions, no `Math.random()`.
- **Licensed assets only:** CC0 / public domain / OFL / Apache / free for commercial use. Every film keeps a
  `CREDITS.md` listing each asset, source and licence (start from the repo-level `CREDITS.md`).
- **Overrides:** all on-screen text is English; BEANS is our real brand, so use the real name and logo.
- Everything else in `prompts/05-cel-boil.md` applies: the Output checks, How to work (treatment → key frames → motion
  → sound → final), the craft checklist, and the honest self-score.

## 8. Prompt structure for every film

Use `mg-styles-15/prompts/05-cel-boil.md` as the complete prompt structure. For each film, rewrite only:
- **Output** → §6 above (1080×1920, 24 fps, the agreed length).
- **Creative seed** → the approved script (story, beats, copy, palette = ink + navy + cream + the one accent, sound =
  §5).
Keep **Style**, **Signature features**, **How to work**, **Rules** (with §7's overrides), **Craft checklist** and
**Before you deliver** exactly as they are.

## 9. Workflow and approval gates

Every new video goes through four gates, in order. **Never render without the owner's explicit approval.** Track
the gates in `films/<slug>/PRODUCTION.md`.

1. **Pitch.** Pitch 3–5 ideas: title, the 0.5 s hook, the one insight, why a dog owner cares, the accent colour,
   dog poses needed (and any new ones), length. Stop: **the owner picks one.**
2. **Script.** A detailed script with a strong hook: a beat table (time, picture, on-screen text / captions,
   exposure on 1s/2s/3s, cel FX, sound), sources for any claim. Stop: **the owner refines and approves it.**
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
Placeholders in use: …
Sources: …
```

## 10. Pre-render checklist

- [ ] Gate 3 approval recorded for this exact version
- [ ] Every signature feature in §1 is visible: boil on everything, on-2s/1s/3s exposure sheet, ≥1 smear frame,
      hand-drawn cel FX, paper multiply 10–15 %
- [ ] The dog is `characters/beans-dog/dog.js`, unchanged in design
- [ ] Palette = ink + navy + cream + one accent; no PLACEHOLDER brand hex left in a final render (unless the owner
      accepted it)
- [ ] English copy proofread; captions on and inside the safe zones
- [ ] Logo on the end card only; no selling
- [ ] Acoustic music + soft foley; no xylophone or cartoon SFX
- [ ] `CREDITS.md` complete; deterministic page (no `Math.random`, no clocks)
