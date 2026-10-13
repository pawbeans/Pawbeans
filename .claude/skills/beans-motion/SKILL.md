---
name: beans-motion
description: The BEANS (beans.sg) motion bible and production workflow. Read it FIRST for any BEANS video, reel, short, social clip, motion graphic, animation or explainer, and before /hyperframes or any other video skill. Sets brand colours, type, the locked illustration style, the /assets library, the six motion primitives, pacing and safe zones, tone, and the four approval gates. Never render a BEANS video without the owner's explicit approval at Gate 3.
---

# BEANS Motion Bible

BEANS (beans.sg) is a premium Singapore brand of dog treats and supplements.
Videos are 9:16 (1080×1920, 30fps) social explainers, and each one should look
like an expensive motion designer made it. Every video follows this file. When
this file and a generic skill (HyperFrames, OpenMontage, Remotion) disagree,
this file wins on brand, style, pacing and approvals. The generic skill wins
on technical mechanics.

## 0. Stack and where things live

| Role | Tool | Notes |
|---|---|---|
| Main engine | **HyperFrames** (`/hyperframes`, `npx hyperframes`) | HTML + GSAP, Apache 2.0, free at any company size. Every BEANS video renders here. |
| Production helpers | **OpenMontage** (`OpenMontage/`, gitignored) | Research, TTS voiceover, music search/generation, image generation through its tool registry. Always set `render_runtime: hyperframes`, never Remotion. Run inside its venv: `source OpenMontage/.venv/bin/activate`. |
| Fallback engine | **Remotion** (`/remotion-*`) | Only when HyperFrames cannot do it. **Licence gate:** free only for orgs with ≤3 employees. Confirm BEANS's headcount or a Company Licence before using it. |
| Brand tokens | `assets/brand/frame.md` | Copy into each video project as `frame.md`. |
| Motion primitives | `assets/motion/beans-motion.js` | `window.BEANS.*`; the only motion vocabulary. |
| Asset library | `assets/` + `assets/manifest.json` | Reuse before you create (§4). |
| Videos | `videos/<yyyy-mm-dd>-<slug>/` | One HyperFrames project per video. |

New video project:
```bash
cd videos && npx hyperframes init <yyyy-mm-dd>-<slug> --non-interactive
cd <yyyy-mm-dd>-<slug> && ln -s ../../assets assets && cp assets/brand/frame.md frame.md
```
Then load scripts in this order: GSAP 3.14.2 → (if scenes change)
`@hyperframes/shader-transitions@0.8.151` → `assets/motion/beans-motion.js`.
`videos/primitives-demo/` is a working reference for all six primitives.

## 1. Brand colour

Tokens live in `assets/brand/frame.md`. Values marked **PLACEHOLDER** are
pending from the owner. Never invent or "improve" a hex, and never ship a final
render that still uses a PLACEHOLDER value.

- **Navy is the constant.** Every frame has navy as its ground. Light comes
  from the lit navy (`navy-lift`) and the deepest shadow and vignette from
  `navy-deep`. Type sits in cream on navy.
- **Treats get earthy protein colours:** Kangaroo, Venison, Rabbit, Ostrich,
  Turkey, Horse. Each has an `accent` (lit side, highlights, accent bar) and a
  `shadow` (core shadow of that protein's hero object).
- **Supplements get functional pastels:** Hip & Joint, Skin & Coat, Allergy &
  Itch, Digestive Probiotics, Calming, Multivitamin. Same accent/shadow pair.
- One product family per video at most. Topic-only videos with no product use
  navy, cream and neutral illustration colours.
- Colour ratio per frame: roughly 70% navy family, 20% illustration
  midtones, 10% accent. The accent marks what matters, such as the stat, the
  key word or the active organ.
- Captions are always white on a navy scrim (§7) and never use a product
  colour.

## 2. Typography

The brand fonts are **PENDING from the owner** (display + text). Until they
arrive, drafts use `ui-sans-serif, system-ui` and say so on the storyboard.
When the fonts arrive, put the `.woff2` files in `assets/brand/fonts/`,
declare them with `@font-face` (HyperFrames lint requires it) and update
`typography` in `frame.md`.

Pairing: a heavy display face for headlines and stats, and a highly legible
text face for captions, labels and body. Only these two families.

Fixed type scale at 1080 wide. Never use sizes between steps.

| Token | px | Line-height | Tracking | Use |
|---|---|---|---|---|
| stat | 220 | 1.0 | −0.04em | the single number of a data beat |
| display | 132 | 1.05 | −0.03em | hook headline, max 3 lines |
| h1 | 96 | 1.08 | −0.02em | beat headline |
| h2 | 72 | 1.12 | −0.01em | sub-point |
| caption | 52, weight 700 | 1.25 | 0 | spoken-word captions |
| body | 44 | 1.3 | 0 | rare, max 12 words on screen |
| label | 36 uppercase | 1.2 | 0.16em | kickers, organ / cell labels |
| source | 28 | 1.3 | 0.02em | citations only |

Nothing below 36px except citations. Use at most two type sizes per frame,
plus captions. Stats use `font-variant-numeric: tabular-nums`. Use no
`<br>`; control wrapping with width.

## 3. Illustration style: "BEANS Lumen" (locked)

There is one style for every asset: the dog character, organs, joints, skin,
immune cells, microbes and protein hero objects. It sits in the spirit of
premium science explainers such as Kurzgesagt: rich, layered and lit, with real
depth. It is not flat clip-art and never built from stacked basic shapes.

**Light.** There is one key light from the top left (about 45°), warm cream.
The shadow side picks up a cool navy rim light from the bottom right. Every
object therefore has a warm lit side, a navy-tinted core shadow, and a thin
bright rim on the shadow edge.

**Form: five layers minimum per object:**
1. Base silhouette: organic, slightly irregular contours (no perfect circles
   or rectangles), with the midtone colour.
2. Form shadow: a soft gradient core shadow following the volume, with a
   multiply tint from the navy family.
3. Highlight: a lit plane plus a small specular hotspot on wet or glossy
   things such as eyes, noses, cell membranes and meat.
4. Rim light: a 2–6px bright edge on the shadow side.
5. Texture: fine grain or paper texture at 6–10% plus surface detail
   (fur strands, muscle fibre, cell-membrane speckle, bone porosity).
Plus ambient occlusion where objects touch, and a soft, offset contact shadow.
Outlines are never black; use self-colour darker lines only where needed.

**Depth.** Every scene is built on four planes:
far background (blurred 8–14px, desaturated, shifted toward navy), midground,
subject, and an out-of-focus foreground element (blurred 4–8px, the darkest
values). Atmospheric perspective means things get bluer and lower-contrast
with distance. These planes are what the parallax primitive moves.

**Shapes and proportion.** Friendly but credible. The dog is appealing, never
babyish. Anatomy is simplified but correct, and a vet should recognise every
organ, joint and cell type.

**The dog hero (`assets/characters/dog-hero/`).** One recurring character.
Name and breed are TBD by the owner; the default is a medium, breed-neutral
dog in BEANS-friendly colouring. It is delivered as a rigged, layered SVG with
named groups (`head`, `jaw`, `earL`, `earR`, `eyes`, `body`, `tail`, `legFL`,
`legFR`, `legBL`, `legBR`) and documented pivot points. It also needs a
turnaround (front, ¾, side), 6 expressions and 6 poses. Never redraw it
inside a video.

**How assets are made.** In order of preference:
1. Library first. Reuse or re-pose an approved asset.
2. AI generation with the style lock. Use OpenMontage image tools (needs an
   image-gen key) with the locked style prompt and the approved style frames
   in `assets/style-frames/` as references. Remove the background, split into
   layers, and vectorise where possible (Recraft vector output preferred).
3. Hand-authored layered SVG, with the five layers above built from SVG
   gradients and filters (`feTurbulence` grain, `feGaussianBlur` AO). Good for
   cells, microbes and simple organs.
4. Human illustrator for the dog-hero master and style frames, which is
   recommended for the first set.

**Style-lock prompt** (prefix to every image generation and keep verbatim):
> BEANS Lumen style: premium editorial science illustration, rich layered
> vector-painterly rendering, warm cream key light from top-left, cool navy
> rim light on shadow side, soft gradient form shadows, subtle specular
> highlights, fine grain texture, deep navy (#0F1B33) atmosphere, depth of
> field with blurred foreground and background, appealing but anatomically
> credible, no outlines, no flat clip-art, no text, isolated subject.
Update the hex when the real navy arrives.

**Style QA, where any "no" means reject:** Is there a key light and a rim
light? Are there at least 5 layers? Is there a texture? Does it look
consistent next to `assets/style-frames/`? Does it read at 1080×1920 on a
phone? Is it free of black outlines and flat fills?

## 4. Asset library (`assets/`)

```
assets/
  manifest.json          # registry of every asset: id, path, status, layers, used-in
  brand/                 # frame.md, logo/ (SVG), fonts/
  style-frames/          # approved BEANS Lumen reference frames (the style source of truth)
  characters/dog-hero/   # parts/ (rig), poses/, expressions/, turnaround/
  anatomy/               # joints/, skin-coat/, gut/, brain-nerves/, heart/, organs-misc/
  microbio/              # immune-cells/, probiotics/, allergens/, pathogens/
  proteins/              # kangaroo/ venison/ rabbit/ ostrich/ turkey/ horse/ (hero objects, raw + treat form)
  supplements/           # hip-joint/ skin-coat/ allergy-itch/ digestive-probiotics/ calming/ multivitamin/ (ingredient & mechanism props)
  environments/          # reusable backgrounds per depth plane
  textures/              # grain, paper, noise overlays
  icons/                 # small UI glyphs in Lumen style
  audio/sfx/, audio/music/  # licensed sound only, with licence file alongside
  motion/beans-motion.js # the six primitives
  _inbox/                # unapproved incoming assets, never referenced by a video
```

Rules:
- Search `assets/manifest.json` before creating anything. A video never draws
  a one-off asset inside its own folder.
- New assets go to `_inbox/`, get Style QA (§3) and owner approval, then move
  to their folder and receive a manifest entry with status `approved`.
- Name files `kebab-case--variant.svg|png`, e.g. `hip-joint--healthy.svg` or
  `macrophage--engulf-pose.svg`. Layered assets are SVGs with named `<g id>`
  groups, or folders of same-size PNG layers named `NN-layer.png`.
- Every asset in a video is referenced through the `assets/` symlink.

## 5. Tone and content

- This is a premium dog-education brand. Lead with one surprising, true
  insight about dogs' bodies, diet or behaviour, then explain why it matters.
- Content stays relevant to what BEANS sells (single-protein treats,
  novel proteins, joints, skin, allergies, gut, calm, nutrition) but it
  **teaches, it does not sell.** There are no prices, discount codes, "shop
  now" lines or product shots mid-video.
- **Logo end card only.** Branding appears once, on the final 1.5–2s card:
  logo on navy and `beans.sg`. Nothing else in the video carries the logo.
- Claims must be accurate. Every number on screen has a source line (28px
  `source` style, bottom of the content box) and a source entry in the
  script. No medical claims about curing or treating; say "supports" or "may
  help", and suggest seeing a vet when it is relevant.
- Voice is calm, warm, confident and clear, with no hype words, no exclamation
  spam and no emoji on screen. Use Singapore/UK spelling (colour, flavour).

## 6. Motion primitives

Every video is built from these six, through `assets/motion/beans-motion.js`.
Do not hand-roll an alternative. Timing changes happen here and in the JS
file together, never per video.

| # | Primitive | Call | Timing and easing |
|---|---|---|---|
| P1 | **Camera push-in** | `BEANS.pushIn(tl, sel, {at, duration})` | Drift: scale 1.00→1.08 over the beat (2–3s), `sine.inOut`. Hook "punch": `{punch:true}` 1.00→1.14 in 0.6s, `expo.out`. Apply to the scene's background/world group, never to text. |
| P2 | **Multi-layer parallax** | `BEANS.parallax(tl, [{el, depth}], {at, duration, travel:90, axis})` | Depth multipliers: far 0.2, mid 0.5, subject 1.0, foreground 1.6. Subject travel 90px per 3s, `sine.inOut`, opposite drift across planes. Runs in every illustrated scene. |
| P3 | **Shader wipe** | `HyperShader.init({bgColor:"#0F1B33", scenes, transitions:[BEANS.wipe(t)]})` | One brand transition: `cross-warp-morph`, 0.6s, for every scene change. Hard cuts are allowed only on a music hit, max 2 per video. Follow the shader-compatible CSS rules: literal hex, no `var()`, `.scene` divs with explicit `background-color`. |
| P4 | **Kinetic headline reveal** | `BEANS.headline(tl, sel, {at, stagger:0.08, accent})` / `headlineOut` | Each word rises from a line mask: `yPercent` 115→0, 0.6s `expo.out`, 0.08s stagger. Accent bar wipes in at +0.3s, 0.45s `power3.out`. Exit: up and out, 0.35s `power2.in`, 0.04s stagger. Markup: `.bm-headline > .bm-line > .bm-word`. |
| P5 | **Data counter** | `BEANS.counter(tl, sel, {at, to, duration:1.2, decimals, thousands})` | Fade-up 0.4s `power3.out`, then a 1.2s roll with `power2.out`. The unit pops in with `back.out(1.7)` as the number lands. Hold the final number at least 1.0s. Markup: `.bm-stat > .bm-num + .bm-unit`. |
| P6 | **Character idle loop** | `BEANS.idle(tl, {body, head, tail, eyes, earL, earR}, {at, duration})` | Breath scaleY 1→1.015 every 2.4s; head sway ±1.5°; tail wag ±12° at 0.36s; one ear flick at +1.1s; blink (0.06s close/open) every 3.2s. All `sine.inOut`, finite repeats. The dog is never fully static on screen. |

Global easing: entrances use `expo.out`, exits `power2.in`, ambient motion
`sine.inOut`, and small settles `power3.out`. Never use linear, except for
blinks. Never use bounce or elastic on anything but the unit pop.

## 7. Pacing, captions and safe zones

- **Hook (0–2s):** the first frame is already moving and already shows the
  subject. There are no logos, no titles fading in from black and no
  "Did you know". The hook is a bold visual plus a ≤7-word display headline
  or a stat, with P1 punch.
- **A new visual beat every 1.5–3s.** A beat is a new primitive firing, a new
  object entering, a camera change or a scene wipe. Nothing sits static for
  more than 3s.
- **Length:** 20–45s by default (max 60s). End card 1.5–2s.
- **Captions are always on,** word-synced to the voiceover (or on-screen text
  for music-only videos). Use the `caption` style, white, 2 lines max and about
  6 words per line, on a soft navy scrim (`rgba(15,27,51,0.72)`, 20px
  radius, 18px/28px padding). The active word gets the video's accent colour.
  Captions live in the caption band.
- **Safe zones (1080×1920):** platform UI covers the top 220px, the bottom
  440px and the right-side buttons.
  - Content box: x 60–940, y 220–1480. All text and key subject matter go here.
  - Caption band: y 1220–1440, x 90–850.
  - Below y 1480 and right of x 940: background art only.
  - Run `npx hyperframes check`. It must pass with 0 errors, and text must not
    be occluded by illustration.
- **Sound:** voiceover at about −14 LUFS integrated, music ducked under it,
  subtle SFX on primitive hits (whoosh on the wipe, tick on the counter).
  All audio must be licensed, with the licence noted in `assets/audio/`.

## 8. Workflow and approval gates

Every new video goes through four gates in order. **Never skip a gate. Never
render without explicit owner approval at Gate 3.** Track the gates in
`videos/<slug>/PRODUCTION.md`.

**Gate 1 — Pitch.** Pitch 3–5 ideas. For each, give the title, the 0–2s hook
(visual + line), the one insight, why it matters to a dog owner, which product
family's colour it uses (or none), the assets it reuses and the new ones it
needs, and a length. Then stop: **the owner picks one.**

**Gate 2 — Script.** Write a detailed script as a beat table with columns for
time, voiceover line, on-screen text, visual, primitive(s), assets and source.
The hook must land in under 2s, with a beat every 1.5–3s, and it ends with the
logo end card. List every source. Then stop: **the owner refines and approves
it.** Iterate until they say it's approved.

**Gate 3 — Storyboard and timeline.** Build the composition with placeholder or
library assets, run `npx hyperframes check` until it passes, then show:
- a contact sheet (`npx hyperframes snapshot --at <every beat midpoint>`
  makes `snapshots/contact-sheet.jpg`);
- the timeline (`npx hyperframes timeline`) as a beat-by-beat table;
- the Studio preview link (`npx hyperframes preview --background`) where it
  can be reached;
- a list of any PLACEHOLDER tokens or assets still in use.
Then stop: **the owner approves or gives notes.** Notes send you back through
Gate 3.

**Gate 4 — Render.** This happens only after the owner explicitly approves
Gate 3 in writing for the current version. Render with
`npx hyperframes render --quality delivery --output renders/<slug>-v<N>.mp4`.
Verify with `ffprobe` (1080×1920, 30fps, expected duration), spot-check
frames, and deliver. Any change after approval means re-approval before
re-rendering. Draft or "quick" renders also need approval.

`PRODUCTION.md` template:
```
# <title>
- [ ] Gate 1: idea picked by owner (date, which idea)
- [ ] Gate 2: script approved by owner (date, version)
- [ ] Gate 3: storyboard + timeline approved by owner (date, version)
- [ ] Gate 4: rendered (file, ffprobe summary)
Placeholders in use: …
Sources: …
```

## 9. Pre-render checklist

- [ ] Gate 3 approval recorded for this exact version
- [ ] No PLACEHOLDER colours or fonts (or the owner explicitly accepted them for this render)
- [ ] All assets come from `assets/` with manifest status `approved`
- [ ] Hook within 2s; no static stretch over 3s
- [ ] Captions on, in the band, scrimmed; content inside the content box
- [ ] Only the six primitives; one wipe shader
- [ ] Logo only on the end card; no hard-sell lines
- [ ] Every number sourced; no cure/treat claims
- [ ] `npx hyperframes check` passes with 0 errors
