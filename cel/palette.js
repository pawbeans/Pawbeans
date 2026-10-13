// BEANS cel palette. Brand values come from the owner (beans.sg brand inputs, 2026-10-13).
// DERIVED values were computed here, not supplied:
//   - light navy = navy #264170 tinted 25 % toward white
//   - every *Shade = its colour with brightness (HSV value) × 0.75, same hue and saturation.
//     (HSL lightness × 0.75 was tried first and rejected: it turns the pastels garish, e.g. Skin & Coat → #EC608A.)
// DERIVED values approved by the owner on the swatch sheet (cel/swatches/), 2026-10-13.
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

// Miya's own colours, sampled from the owner's photos (references/miya) and tuned to read on cream paper.
// Fixed in every video so the character never changes.
export const MIYA = {
  coat: '#F3E4CB',        // cream coat (a step warmer and darker than the paper so she separates from it)
  coatShade: '#DCC4A0',   // coat in shadow: cel crescents, far legs
  coatDeep: '#C9AE87',    // far-side legs / deepest curl shadow
  apricot: '#EBCB9F',     // ears, the warmth on her face
  apricotShade: '#CFA77A',
  patch: '#D8AC7C',       // apricot patches round the eyes
  beard: '#FAEFDC',       // beard / muzzle, a touch lighter than the coat
  nose: '#2A1F1B',
  tongue: '#DB7480',
  tongueShade: '#B85662',
};
