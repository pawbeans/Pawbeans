// BEANS cel palette. Brand values come from the owner (beans.sg brand inputs, 2026-10-13).
// DERIVED values were computed here, not supplied:
//   - light navy = navy #264170 tinted 25 % toward white
//   - every *Shade = its colour with brightness (HSV value) × 0.75, same hue and saturation.
//     (HSL lightness × 0.75 was tried first and rejected: it turns the pastels garish, e.g. Skin & Coat → #EC608A.)
// DERIVED shadows are on hold until the owner approves the swatch sheet (cel/swatches/).
// Rule (.claude/skills/beans-motion/SKILL.md): ink + BEANS navy + cream paper + ONE warm accent per video.

export const PAL = {
  ink: '#1d1915',        // warm ink black for all linework (not a brand colour; pure line)
  navy: '#264170',       // BEANS navy, primary, the constant
  navyDeep: '#1B2F52',   // deep navy: shadows, depth
  navyLight: '#5C7094',  // DERIVED: navy tinted 25 % toward white
  cream: '#FFF7EA',      // cream paper base (never stark white)
  hi: '#FFFDF7',         // card surface / highlight cream: glints, caption cards, smoke fill
  orange: '#FE7A3C',     // brand orange: CTA / accent (handwritten callouts, stickers)
  orangeShade: '#BE5C2D',// DERIVED
  pencil: '#5a7bb5',     // blue col-erase pencil: model-sheet and storyboard notes only, never in a film
  shade: 'rgba(29,25,21,0.16)', // ink wash for cel shadow shapes
};

// ONE accent per video: the protein colour for treats or the pastel for supplements.
export const ACCENTS = {
  // treats: earthy
  rabbit: { c: '#9BA88D', shade: '#747E6A' },     // shade DERIVED
  kangaroo: { c: '#B24E2B', shade: '#853A20' },   // shade DERIVED
  venison: { c: '#6B2A2A', shade: '#502020' },    // shade DERIVED
  turkey: { c: '#C2603E', shade: '#92482F' },     // shade DERIVED
  ostrich: { c: '#8B8A54', shade: '#68683F' },    // shade DERIVED
  horse: { c: '#1F3D2E', shade: '#172E22' },      // shade DERIVED
  // crocodile (#1F5C55) is discontinued: never use
  // supplements: functional pastels
  'digestive-probiotics': { c: '#BFD8AE', shade: '#8FA282', name: 'sage' },     // shade DERIVED
  'skin-coat': { c: '#F8C3D3', shade: '#BA929E', name: 'blossom' },             // shade DERIVED
  multivitamin: { c: '#FAE588', shade: '#BBAC66', name: 'sunny' },              // shade DERIVED
  'allergy-itch': { c: '#BED3F0', shade: '#8E9EB4', name: 'sky' },              // shade DERIVED
  calming: { c: '#D4BAE9', shade: '#9F8BAF', name: 'lilac' },                   // shade DERIVED
  'hip-joint': { c: '#FDDBB4', shade: '#BEA487', name: 'peach' },               // shade DERIVED
};

// The dog's own colours, fixed in every video. PENDING: the dog is being redesigned as Miya (cream / apricot
// Goldendoodle) from the owner's photos in references/miya; these are the old v1 values until then.
export const DOG = {
  coat: '#c69a6b',
  coatShade: '#9c6d43',
  mark: '#f6ead3',
  markShade: '#e2cfae',
  tongue: '#c9645a',
  nose: '#1d1915',
};
