---
# BEANS frame.md: brand tokens for every BEANS video.
# HyperFrames reads this file (frontmatter = normative). Each video project
# copies it to its own root as `frame.md`.
#
# FALLBACK ONLY (HyperFrames). Brand truth: cel/palette.js and .claude/skills/beans-motion/SKILL.md.
name: BEANS
canvas: { width: 1080, height: 1920, fps: 30 }

colors:
  # Constant across every video
  navy:        "#264170"   # BEANS navy
  navy-deep:   "#1B2F52"   # deep navy
  navy-lift:   "#5C7094"   # DERIVED light navy
  cream:       "#FFF7EA"   # cream
  white:       "#FFFFFF"   # captions only

  # Treats: earthy, one per protein (accent + shadow tone each)
  protein:
    kangaroo:  { accent: "#B24E2B", shadow: "#853A20" }   # shadow DERIVED
    venison:   { accent: "#6B2A2A", shadow: "#502020" }   # shadow DERIVED
    rabbit:    { accent: "#9BA88D", shadow: "#747E6A" }   # shadow DERIVED
    ostrich:   { accent: "#8B8A54", shadow: "#68683F" }   # shadow DERIVED
    turkey:    { accent: "#C2603E", shadow: "#92482F" }   # shadow DERIVED
    horse:     { accent: "#1F3D2E", shadow: "#172E22" }   # shadow DERIVED

  # Supplements: functional pastels, one per formula
  supplement:
    hip-joint:            { accent: "#FDDBB4", shadow: "#BEA487" }   # shadow DERIVED
    skin-coat:            { accent: "#F8C3D3", shadow: "#BA929E" }   # shadow DERIVED
    allergy-itch:         { accent: "#BED3F0", shadow: "#8E9EB4" }   # shadow DERIVED
    digestive-probiotics: { accent: "#BFD8AE", shadow: "#8FA282" }   # shadow DERIVED
    calming:              { accent: "#D4BAE9", shadow: "#9F8BAF" }   # shadow DERIVED
    multivitamin:         { accent: "#FAE588", shadow: "#BBAC66" }   # shadow DERIVED

typography:
  display: { family: "Fraunces", file: "fonts/fraunces/Fraunces-VF.ttf", weight: 600 }
  text:    { family: "Inter",    file: "fonts/inter/Inter-VF.ttf",    weight: 500 }
  label:   { family: "Oswald",   file: "fonts/oswald/Oswald-VF.ttf",  weight: 600 }
  scale:   # px on the 1080-wide canvas; line-height; tracking
    stat:     { size: 220, lh: 1.0,  track: "-0.04em", font: display }
    display:  { size: 132, lh: 1.05, track: "-0.03em", font: display }
    h1:       { size: 96,  lh: 1.08, track: "-0.02em", font: display }
    h2:       { size: 72,  lh: 1.12, track: "-0.01em", font: display }
    caption:  { size: 52,  lh: 1.25, track: "0",       font: text, weight: 700 }
    body:     { size: 44,  lh: 1.3,  track: "0",       font: text }
    label:    { size: 36,  lh: 1.2,  track: "0.16em",  font: text, case: upper }
    source:   { size: 28,  lh: 1.3,  track: "0.02em",  font: text }   # citations only

spacing:
  safe:            { top: 220, bottom: 440, left: 60, right: 140 }   # content box x 60–940, y 220–1480
  caption-band:    { top: 1220, bottom: 1440, left: 90, right: 230 }
  grid:            8
---

# BEANS: frame spec

Brand truth lives in the frontmatter above. Composition rules, illustration
style and motion are in `.claude/skills/beans-motion/SKILL.md`. Read that before
building anything.

- Navy is always the ground. A product colour is an accent on navy and never
  replaces it as the background.
- One video uses one product colour family at most: one protein or one
  supplement. Topic-only videos with no product use navy + cream only.
- Shader-transition compositions cannot use CSS `var()`, so write these hex
  values literally in those files.
