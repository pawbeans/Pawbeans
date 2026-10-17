---
name: beans-motion
description: The BEANS (beans.sg) motion bible and production workflow. Read it FIRST for any BEANS video, reel, short, social clip, motion graphic, animation or explainer, and before /hyperframes, /remotion or any other video skill. House style is cel animation with line boil (mg-styles-15, prompt 05-cel-boil), rendered with mg-styles-15/harness/render.mjs and lib/audio. Sets the brand palette, the BEANS dog Miya (never redraw her), fonts, logo rules, brand voice and copy rules, sound, output spec, safe zones, the review loop, the four approval gates, today's craft lessons and the daily series (Dog Decoded / Inside Your Dog). Never render a BEANS video without the owner's explicit approval; the daily routine has standing approval with an overnight veto (§14).
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
scripts/cel-render.sh films/<slug> --stills 0.5,1.5,2.5,...           # key-frame stills → films/<slug>/out/stills/ (~0.3 s each)
mg-styles-15/.venv/bin/python films/<slug>/audio.py                  # sound effects → films/<slug>/out/audio.wav (~1 min)
scripts/cel-render.sh films/<slug> --noaudio --workers 4 --out $PWD/films/<slug>/out/picture.mp4   # picture (~6 min for 58 s; Gate 4 only)
ffmpeg -i out/picture.mp4 -i out/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart out/<slug>-vN.mp4
ffmpeg -i out/<slug>-vN.mp4 -af ebur128=peak=true -f null -          # loudness + true peak on the MUXED file, not the WAV
ffmpeg -i out/<slug>-vN.mp4 -c:v libx264 -preset slow -b:v 3300k -maxrate 4000k -bufsize 8000k -pix_fmt yuv420p \
       -c:a aac -b:a 192k -movflags +faststart review/<slug>-vN.mp4   # viewing copy under the 30 MB upload limit
# films over ~70 s: -b:v 2150k -maxrate 2800k -bufsize 5600k (88 s → 24.8 MB); always copy the master's audio (-c:a copy) so TP stays ≤ −2
```
Full-size stills are gitignored (`films/*/out/stills/`); commit the boards and the hero stills only (`git add -f`).
The master mp4 (~90 MB) stays local; the viewing copy and the SFX WAV go in `review/`.

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
- Brand orange is used sparingly in every video (owner: yes), like beans.sg: handwritten callouts and their arrows, a sticker tag, one emphasised
  word. It never fills large areas and never competes with the product accent.
- The paper ground is brand cream (`cel/assets/paper_base.jpg`, rebuilt to `#FFF7EA`); with grain on top it measures
  about `#FAF2E5`. Never a stark white frame.
- Pencil blue (`PAL.pencil`) is only for model sheets and storyboards, never in a film.

## 3. The BEANS dog: Miya (one character, every video)

**Miya** is the real BEANS dog and the reason BEANS exists: a **Goldendoodle with a cream / apricot curly coat**.
Reference photos live in `references/miya/` (only the white / cream dog is Miya; ignore the black-and-white dog in
shared photos).

- **Status: APPROVED by the owner (model sheet v3, 2026-10-13).** Module: `characters/miya/miya.js`; sheet:
  `characters/miya/model-sheet/` (render: `scripts/cel-render.sh characters/miya/model-sheet --stills 0`). Built in code
  from the five photos in `references/miya/`; no human illustrator for now. Colours: `MIYA` in `cel/palette.js`, sampled
  from the photos.
- Use:
  ```js
  import { drawMiya, pose } from '/beans/characters/miya/miya.js';
  // x, y = ground point under her; s = scale; view = yaw in degrees (0 side, 45 three-quarter, 90 front);
  // elev = camera looking down (deg); mirror = face left; v = boil variant of this drawing; accent = video accent (tag)
  drawMiya(ctx, pose('scratch'), { x: 540, y: 1460, s: 2.2, view: 15, v: bv(D), accent });
  ```
  Poses: `stand`, `sit`, `lie`, `pawRaise`, `scratch`, `wag`, `spin`, plus `sleep` and `curl` (NEW 2026-10-13, Dog Decoded: shown to the owner on the night boards). Faces: `eyes` open / happy / squint / closed;
  `mouth` closed / smile / tongue; `brow` −1..1. Ears swing with `ears.swing`.
- What to capture from the photos: a big, soft, rounded curly silhouette (no tapered limbs: plush, columnar legs with
  round "pom" paws), a round domed head with a fluffy top knot, long floppy ears that hang and blend into the
  cheeks, a short rounded muzzle with a beard, a black nose, dark round eyes half-hidden under fringe, a full curly
  tail, cream body with faint apricot warmth on the ears, around the eyes and on the muzzle, and a pink tongue when
  happy. Curls are suggested only by the scalloped, boiling outline: **no C-curl marks inside the fur** (owner note).
- Owner notes on v1 (applied in v2): smaller forehead, rounder face (not a tall oval), ears end at chin level, no curl
  marks, no leg tops showing inside the body (legs tuck under the body; a leg in front, like the scratching hind leg,
  has its top end left un-inked).
- Owner notes on v2 (applied in v3): a lean, well-proportioned Goldendoodle (not fat, not skinny); no ghost circles
  or loose curl marks in the scratching pose (scratch ticks only).
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

**Tone guardrail:** premium and warm, never cutesy, never clinical. Teach, don't sell: films may be product-forward
(owner: yes): BEANS pouches and chew tins can be drawn as hero objects, redrawn from the product shots on beans.sg in the
cel style. No prices, discount codes or "shop now" lines; the logo appears on the end card only.

**Owner exceptions on sourcing:** the pilot's line "It's not the dog. It's the protein." is the brand's own message
and needs no source (owner, 2026-10-13). Every other fact or number still needs one.
Dog Decoded (§14) uses light sourcing: popular dog-behaviour lore framed as "can mean" needs no citation (owner,
2026-10-13); health, medical and food-safety lines still need to be right.

**Sound: voiceover + background music + soft foley, by default (owner, 2026-10-14; this replaces "sound effects
only").** Films are written voice first (playbook §2.7): a warm, bright, playful female voiceover (ElevenLabs
"Jessica", `ELEVENLABS_API_KEY` in the environment, never committed) says the script, and the captions are exactly her
words. Under it: a new instrumental for each film in a similar vibe (playbook §5), sitting in the background 12 LU
under the voice, never overbearing, plus soft synced foley. Master **−14 LUFS, true peak ≤ −2 dBTP** (measured on the
muxed mp4: AAC adds about 0.5 dB; export the WAV at −2.5). Deliver the soundtrack WAV and the voiceover stem in
`review/`. Reference implementation: `films/2026-10-13-where-your-dog-sleeps/` (`vo.py`, `audio.py`). Foley palette that worked: paper
rustle for fur and scratching, soft pops for labels, soft impacts for hits, gentle squelch / gloop for gut moments,
whooshes for camera moves, harp notes (not celesta, not sine blips) for "ping" moments, one cinematic impact for the
hero beat. Every hit lands on its picture event (within one frame). Sampler note: mg-styles-15 ships only part of
the VCSL library; build instruments with the shipped files only (see `avail()` in the Inside Your Dog `audio.py`).

**Music** (a piano/guitar score generated with a lofi recipe was rejected on 2026-10-13: "doesn't suit the video at
all"; the hand-written ukulele + pizzicato + glockenspiel piece of 2026-10-14 was liked): warm, light, understated
acoustic music, written note by note per film: ukulele, nylon or steel guitar, pizzicato or upright bass, soft piano,
brushed percussion, a little glockenspiel, vibraphone or harp (`pluck.guitar`, `pluck.harp`, `samples.inst('piano'|'vibraphone'|'harp')`,
`drums.snare('brush')`); starting points `recipes.lofi(flavor='chill', keys='piano')` or
`recipes.ambient(flavor='piano')`, thinned out. Soft foley (paper, pen, paws on the floor, fur rustle, a breath)
synced to the cue sheet. **No zany cartoon SFX: no xylophone, no slide whistle, no boing, no cork pops, no squeaks.**

## 6. Logo

Files in `assets/brand/logo/` (owner-supplied 2026-10-13; this is the full set that exists):

| File | Use |
|---|---|
| `beans-wordmark-navy.png` (1545×415, transparent) | **the end-card logo**: BEANS wordmark, paw print inside the A |
| `beans-paw-b-icon-navy.png` (1343×1304, transparent) | standalone paw-B icon (small sign-offs, stickers) |
| `*-on-white-2000.webp`, `*-navy-500.png`, `*-navy-829.png`, `beans-logo-source.png` | the owner's originals, kept as sources |

- The transparent versions were made from the owner's 2000 px files by removing the white background only
  (alpha = how far each pixel is from white; colour unchanged, navy `#264070`). The paw inside the A shows the paper.
- Only navy-on-light versions exist. End cards are therefore cream paper + navy logo. **Never recolour the logo**
  to make a cream-on-navy version; if a navy end card is ever wanted, ask the owner for that file.
- **Never redraw, boil, trace, recolour, outline or restyle the logo.** Place the file clean and still on the end
  card (the paper and drawings around it may keep boiling). Logo on the end card only.

## 7. Reference style

- No reference reels: BEANS films are meant to become the reference (owner). Benchmark craft against the 05-cel-boil
  demo in `mg-styles-15` plus Buck's and Giant Ant's hand-drawn work.
- Match the beans.sg hero: cream background, navy, product-forward (pouches and chew tins drawn as hero objects),
  playful handwritten callouts with arrows, small tilted Oswald stickers. Premium and warm, never cutesy, never clinical.

## 8. Output spec (default)

- **1080×1920 vertical, 24 fps, 15–45 s as a guide (up to 120 s when the extra time is real information; owner 2026-10-16, raised from 90 s on 2026-10-17)**, H.264 MP4 with stereo AAC audio (48 kHz), voiceover + background music + foley at −14 LUFS,
  TP ≤ −2 dBTP on the muxed file (§5). Daily series lengths in §14. A brief may set a longer runtime (Inside Your Dog
  ran 58 s and was approved).
- Hook in the first 0.5 s: never open on more than 0.3 s of empty paper. One unmistakable hero moment at about
  60–75 % of the runtime. End on the BEANS logo end card (§6), held about 1 s while the drawing around it boils (on 3s). Exception: Dog
  Decoded (viral) films never mention BEANS: no logo, no product, no beans.sg; they end on a question card (§14).
- **Captions always on** for any voiceover or spoken idea: Inter on a card-cream caption card (hand-cut, boiling
  edge), max 2 lines, inside the safe zones. The card pops in opaque (scale 0.82 → 1.04 → 1) and only the words build
  in; back-to-back cards stay up instead of re-popping (`caption()` in the Inside Your Dog `cast.js`).
- **Reading pace:** at most about 3.5 words per second, and every card on screen for at least 1.5 s (the owner found
  4.2 words/s too quick). Emphasised words in `PAL.orangeShade`, not light orange (contrast).
- **Safe zones (1080×1920):** keep all text and key action inside x 60–940, y 220–1480 (platform UI covers the top
  220 px, the bottom 440 px and the right-hand buttons). Caption cards are centred at y 1440 (three-quarter height, owner 2026-10-13: higher cards covered the
  animation); a two-line card reaches about y 1533, accepted by the owner. Below y 1480 and right of
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
3. **Storyboard and key frames.** Build the film page and cue sheet, then render key frames **for the entire film**
   (owner's preference): one still per second at x.5 s plus every hero beat, laid out on boards grouped by section
   with timecodes (`review/<slug>-keyframes-{a,b,c,d}.png`, Oswald headings, hero frames marked in orange). Look at
   every board yourself before sending (stale pixels, overlaps, safe zones). Stills are not a render of the video.
   Stop: **the owner approves**, or gives notes and Gate 3 repeats.
4. **Render.** Only after explicit approval of the current key frames. Render audio and video, check the spec
   (duration, 1080×1920, 24 fps, −14 LUFS, TP ≤ −2 dBTP on the mp4, no black frames, no fallback fonts, nothing outside the safe
   zones), then run the **quality loop**:
   - **Review:** a separate reviewer (a subagent that did not make the film) judges the render with
     `mg-styles-15/rubric.md` step 1: contact sheet, filmstrips, full-res frames, spec checks, scores, and a fix list.
   - **Revise once:** apply the critical and high-impact fixes (rubric step 2), re-render and re-check.
   - Then show the owner the revised film, the review's scores, what changed and what's still weak.
   Any change after approval that alters what the owner approved goes back to Gate 3. Owner notes on a shown film
   (timing, caption position, sound) are applied directly and re-rendered as the next version (v3 and on).

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
- [ ] Voiceover = captions word for word; music in the background (12 LU under the voice); soft foley synced to picture; no xylophone or cartoon SFX
- [ ] `CREDITS.md` complete; deterministic page (no `Math.random`, no clocks)

## 13. Craft lessons (Inside Your Dog, 2026-10-13)

What the first full film taught us. The reviewer caught most of these on v1; build them in from the start.
- **Paint every pixel every frame.** `render()` starts with a full cream fill, and every shot's background covers the
  whole frame (a 60 px unpainted band in the gut wall let a previous frame's label show through).
- **Crossfades:** draw the outgoing shot at the real time, not frozen at the cut, and end its labels (fade done)
  by the cut. Freezing it left half-transparent "ghost" labels for the whole fade.
- **Smear frames are required:** one or two frames of the moving thing stretched along its path (about 2.4–3× long,
  0.6× wide) on every fast move: things flying in, flying away, rebounds. Add a one-frame squash on contact.
- **Fast motion goes on 1s** in `SCHED`, with speed capped at about 40 px per frame (on 2s, pellets jumped
  200–360 px per drawing and strobed).
- **Impact frames** (two frames, full-bleed flat colour + star) carry no captions, titles or labels.
- **Logo above the grain:** draw the logo again after `drawTooth` once it is fully in, so the paper grain never
  crawls over it.
- **Hero text needs time:** a big word like SCRATCH! stays fully readable for at least 1.2 s, and the caption that
  names it is on screen at the same time. Hide the section title while hero text owns the top of frame.
- **Wipes start where the eye is:** a circle wipe grows from the projected point (Miya's mouth), not the frame
  centre, and the next shot opens with an iris from the wipe colour (a hard cut from navy to peach was the biggest
  jump in v1).
- **Never two text blocks at once** (a callout card plus a caption): run them one after the other.
- **Labels sit clear of caption cards** (cards are centred at y 1440; keep labels above about y 1250).
- Owner preferences learned: bodily-function humour is fine when it is drawn with restraint (the poop stayed);
  claims in a brief the owner supplies were waived for sources (that film only); whole-film key frames before any
  render; sound effects only (superseded 2026-10-14: voiceover first, background music, foley; see §5).

## 14. Daily series (routine)

Every day a new film is made automatically. **21:46 SGT** a ranked list of ideas goes to the owner; they pick by
**22:30** (no reply: the top pick is built at 22:30); script and whole-film key frames follow; the owner can send
notes or "skip" until **05:30**; **08:28** render, review, one revision and delivery. Two alternating series:
- **Dog Decoded** (viral, educational, no BEANS mention at all): dog behaviour and dog science that hooks anyone with
  a dog. Series tag "DOG DECODED". No logo, no product, no beans.sg; ends on a question card. Miya is the star.
- **Inside Your Dog** (BEANS, educational): the body, food, allergies and wellbeing, pointing subtly to novel
  proteins or a supplement. Series tag "INSIDE YOUR DOG". Product may appear as a hero object near the end; logo
  end card as usual.

The playbook (formats, hooks, retention rules, sourcing, the idea bank, the log and the night / morning runbooks)
lives in `content/`: start at `content/PLAYBOOK.md`.

**Standing approval (owner, 2026-10-13):** routine films may be rendered in the morning without a separate "render"
from the owner. The owner picks the idea (or lets the top pick stand at the 22:30 cut-off) and sees the key-frame boards;
they can reply in that session until 05:30 with notes (applied before the render) or "skip" (no render). Everything else in this bible still applies,
including the review loop and the copy rules.
