# The BEANS dog

The one recurring BEANS character. Every BEANS video imports `dog.js`; nobody redraws the dog. Rules and usage live in
`.claude/skills/beans-motion/SKILL.md` §3.

- `dog.js`: the rig, the pose library (`stand`, `sit`, `lie`, `pawRaise`, `scratch`, `wag`, `spin`) and `drawDog()`.
- `model-sheet/`: the approved reference. Re-render after any change to `dog.js` and get it re-approved:
  `scripts/cel-render.sh characters/beans-dog/model-sheet --stills 0`

Design: Singapore Special; biscuit coat, cream muzzle / chest / socks / tail tip; upright ears, left ear tip folded;
bean-shaped nose; sickle tail; navy collar with a tag in the video's accent colour. Colours in `cel/palette.js` (`DOG`).
