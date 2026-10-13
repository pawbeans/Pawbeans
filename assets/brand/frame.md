---
# BEANS frame.md: brand tokens for every BEANS video.
# HyperFrames reads this file (frontmatter = normative). Each video project
# copies it to its own root as `frame.md`.
#
# ⚠ Every hex marked PLACEHOLDER is a stand-in so drafts can render.
#   Owner must supply real values. Do not ship a final render while any
#   PLACEHOLDER remains in a token the video uses.
name: BEANS
canvas: { width: 1080, height: 1920, fps: 30 }

colors:
  # Constant across every video
  navy:        "#0F1B33"   # PLACEHOLDER: brand navy (backgrounds, type on light)
  navy-deep:   "#08101F"   # PLACEHOLDER: vignette / deepest shadow
  navy-lift:   "#23365E"   # PLACEHOLDER: lit side of navy grounds
  cream:       "#F6EFE6"   # PLACEHOLDER: primary type on navy
  white:       "#FFFFFF"   # captions only

  # Treats: earthy, one per protein (accent + shadow tone each)
  protein:
    kangaroo:  { accent: "#A4553A", shadow: "#5E2A1C" }   # PLACEHOLDER
    venison:   { accent: "#7A4B35", shadow: "#3F2418" }   # PLACEHOLDER
    rabbit:    { accent: "#B89A78", shadow: "#6B5640" }   # PLACEHOLDER
    ostrich:   { accent: "#C27A4E", shadow: "#6E3F22" }   # PLACEHOLDER
    turkey:    { accent: "#C9A066", shadow: "#7A5A2E" }   # PLACEHOLDER
    horse:     { accent: "#8C6A4F", shadow: "#4A3626" }   # PLACEHOLDER

  # Supplements: functional pastels, one per formula
  supplement:
    hip-joint:            { accent: "#9CC5E8", shadow: "#4F7FA8" }   # PLACEHOLDER
    skin-coat:            { accent: "#F2C6B4", shadow: "#B07A66" }   # PLACEHOLDER
    allergy-itch:         { accent: "#B9E2C8", shadow: "#5E9C78" }   # PLACEHOLDER
    digestive-probiotics: { accent: "#F4E3A1", shadow: "#B39A4A" }   # PLACEHOLDER
    calming:              { accent: "#CDBDEB", shadow: "#7A68A8" }   # PLACEHOLDER
    multivitamin:         { accent: "#F7C59F", shadow: "#B5784A" }   # PLACEHOLDER

typography:
  display: { family: "BEANS Display", file: "fonts/PLACEHOLDER-display.woff2", weight: 800 }  # PLACEHOLDER: owner to supply
  text:    { family: "BEANS Text",    file: "fonts/PLACEHOLDER-text.woff2",    weight: 500 }  # PLACEHOLDER: owner to supply
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
