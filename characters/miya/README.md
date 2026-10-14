# Miya, the BEANS dog

The founders' Goldendoodle and the reason BEANS exists. Every BEANS video that shows a dog imports `miya.js`;
nobody redraws her. Rules and usage: `.claude/skills/beans-motion/SKILL.md` §3.

- `miya.js`: the rig, the pose library (`stand`, `sit`, `lie`, `pawRaise`, `scratch`, `wag`, `spin`, and NEW 2026-10-13: `sleep`, `curl`; NEW 2026-10-14: `squat`, `lookDown`) and `drawMiya()`.
- `model-sheet/`: the reference sheet. Re-render after any change to `miya.js` and get it re-approved:
  `scripts/cel-render.sh characters/miya/model-sheet --stills 0`
- Built from the photos in `references/miya/`; colours (`MIYA` in `cel/palette.js`) sampled from them.
