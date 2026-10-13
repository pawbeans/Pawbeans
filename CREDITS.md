# Credits and licences

Every BEANS film keeps its own `CREDITS.md`; start from this list and add anything new the film uses.

| Asset | Used for | Source | Licence |
|---|---|---|---|
| Cel engine (`cel/engine.js`, adapted) | brush, boil, fills, hatch | mg-styles-15, demos/05-cel-boil/js/engine.js, Vincentwei1021, https://github.com/Vincentwei1021/mg-styles-15 | MIT |
| Renderer `harness/render.mjs`, audio toolkit `lib/audio` (mgaudio) | frame capture, soundtrack | mg-styles-15 (same repo, used in place) | MIT |
| Instrument samples (VCSL) used by mgaudio | music | Versilian Community Sample Library, via mg-styles-15 | CC0 |
| Paper plates `cel/assets/paper_base.jpg`, `paper_tooth.png` | paper ground + tooth | built by `cel/tools/gen_paper.py` (adapted from mg-styles-15, MIT) from ambientCG Paper001, tinted to BEANS cream | CC0 |
| Dust plates `cel/assets/dust_ink_0*.png` | scanner dust | mg-styles-15 assets/textures/dust (procedural) | CC0 |
| Round-cone distance function (`cel/shape.js`) | silhouettes | after Inigo Quilez, iquilezles.org | MIT |
| Fraunces (headlines) | headlines, key lines | Google Fonts, `assets/brand/fonts/fraunces/OFL.txt` | OFL 1.1 |
| Oswald (labels, tags) | labels, stickers | Google Fonts, `assets/brand/fonts/oswald/OFL.txt` | OFL 1.1 |
| Inter (body) | captions, body | Google Fonts, `assets/brand/fonts/inter/OFL.txt` | OFL 1.1 |
| Caveat (handwritten callouts, stand-in) | callouts, model-sheet notes | Google Fonts, `assets/brand/fonts/caveat/OFL.txt` | OFL 1.1 |
| BEANS name, logo (`assets/brand/logo/`), brand colours | end card, palette | BEANS (beans.sg), owner-supplied | BEANS trademark, used by BEANS |
| Miya reference photos (`references/miya/`) | character design reference only, never shown | owner-supplied | BEANS, private |
| BEANS dog character, Miya (`characters/beans-dog/`) | every film | made for BEANS in this repo | BEANS |

## On-screen facts

Every fact or number shown on screen gets a row in the film's own `CREDITS.md`: the claim, the source (title, author or
publisher, year, URL) and where it appears (timecode). No source, no claim.
