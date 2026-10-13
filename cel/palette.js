// BEANS cel palette. Every value marked PLACEHOLDER waits for the owner's real hex codes.
// Rule (.claude/skills/beans-motion/SKILL.md): ink + BEANS navy + cream paper + ONE warm accent per video.

export const PAL = {
  ink: '#1d1915',    // warm ink black for all linework
  navy: '#1b2a4a',   // PLACEHOLDER: BEANS navy (type, collar, end card)
  cream: '#f4e9d0',  // PLACEHOLDER: cream paper ground
  hi: '#fff7e6',     // paper-white highlight (tint of cream): glints, smoke fill
  pencil: '#5a7bb5', // blue col-erase pencil: construction lines, model-sheet notes
  shade: 'rgba(29,25,21,0.16)', // ink wash for cel shadow shapes
};

// The BEANS dog's own colours. They stay fixed in every video so the character never changes.
export const DOG = {
  coat: '#c69a6b',      // PLACEHOLDER: biscuit tan coat
  coatShade: '#9c6d43', // PLACEHOLDER: coat in shadow (far legs, shadow crescents)
  mark: '#f6ead3',      // cream markings: muzzle, chest, socks, tail tip
  markShade: '#e2cfae',
  tongue: '#c9645a',    // muted rose
  nose: '#1d1915',
};

// ONE accent per video: the protein colour for treats or the pastel for supplements.
export const ACCENTS = {
  // treats: earthy
  kangaroo: '#a4553a',  // PLACEHOLDER
  venison: '#7a4b35',   // PLACEHOLDER
  rabbit: '#b89a78',    // PLACEHOLDER
  ostrich: '#c27a4e',   // PLACEHOLDER
  turkey: '#c9a066',    // PLACEHOLDER
  horse: '#8c6a4f',     // PLACEHOLDER
  // supplements: functional pastels
  'hip-joint': '#9cc5e8',            // PLACEHOLDER
  'skin-coat': '#f2c6b4',            // PLACEHOLDER
  'allergy-itch': '#b9e2c8',         // PLACEHOLDER
  'digestive-probiotics': '#f4e3a1', // PLACEHOLDER
  calming: '#cdbdeb',                // PLACEHOLDER
  multivitamin: '#f7c59f',           // PLACEHOLDER
};
