# Inside Your Dog: Food Allergy

Source brief: `BRIEF.md` (owner, 2026-10-13). Adapted to the BEANS cel house style (`.claude/skills/beans-motion`).

- [x] Gate 1: idea set by the owner (production brief)
- [x] Gate 2: script = the brief's 20 captions, used word for word (British spelling, no em dashes)
- [x] Gate 3: key frames for the whole film (66 stills, every second + 8 hero beats) → boards `review/inside-your-dog-keyframes-{a,b,c,d}.png`. Approved by owner ("render", 2026-10-13): no sources needed for the on-screen claims, keep the poop.
- [x] Gate 4: rendered → reviewed (rubric) → revised once → shown (v2, 2026-10-13)
  - v1 rubric scores (separate review): style 6 · concept 6 · motion 5 · design 6 · finish 6 · sound 6 · technical 5. Failed true peak (−0.7 dBTP), caption safe zone, smear-frame check; ghost labels in crossfades.
  - Revision 1 (v2): all critical and high fixes, plus N2 (contrast), N4, N5, N6, N7, N8. Not done: N1 (two fast captions), N3 (brain halo blend).
  - v2 spec: 58.000 s, 1392 frames, 1080×1920, 24 fps, H.264 + AAC 48 kHz, −14.0 LUFS, −1.9 dBTP (master mp4). Master `out/inside-your-dog-v2.mp4` (93 MB, gitignored); viewing copy `review/inside-your-dog-v2.mp4` (24 MB).
  - Owner notes on v2: music removed (owner adds their own), sound effects kept; captions moved down to three-quarter height; the two fix-section captions given more time. Brain glow left as is.
  - v3: SFX only, −16.1 LUFS, −1.9 dBTP; master `out/inside-your-dog-v3.mp4`; viewing copy `review/inside-your-dog-v3.mp4`; stem `review/inside-your-dog-sfx-only.wav`.

Spec: 58.0 s, 1080×1920, 24 fps (brief said 30; house rule is 24), H.264 + AAC 48 kHz, −14 LUFS, TP ≤ −1 dBTP.
Character: Miya (`characters/miya`, approved v3). Logo: `assets/brand/logo/beans-wordmark-navy.png`, placed clean, never boiled.

## Shot list (brief timings kept)

| Time | Section | Picture | Hero beat |
|---|---|---|---|
| 0–4 | Hook (cream paper) | Miya scratches; FLEAS? struck through in orange; she turns to dinner; ×12 push into her mouth; navy circle wipe | 1.4 strike-through, 3.7 wipe |
| 4–11 | 1 · The Gut | Gut lumen (peach) over villi; food drops in, breaks down; two proteins squeeze through the wall intact; pan down 600 px into the tissue | 9.5 INTACT PROTEIN |
| 11–19 | 2 · The Mistake | Guard cell (sky) gets curious, then alarmed; INVADER lock-on; B cell (lilac) pumps out IgE antibodies | 13.9 alarm |
| 19–26 | 3 · The Trap Is Set | Antibodies dock on a sleepy mast cell (blossom); "This is why allergies seem to come out of nowhere." | |
| 26–35 | 4 · The Reaction | Same protein returns, locks on; cell heats to orange; impact frames; burst of histamine + IL-31 granules | 29.45 lock, 31.05 burst |
| 35–43 | 5 · The Itch | Skin cross-section, nerve fires, brain lights up, SCRATCH!; back to Miya with EARS / BELLY / PAWS callouts | 38.9 SCRATCH! |
| 43–48 | 6 · The Gut, Again | Inflamed S-tube gut, food rushes through, poop character | 46.6 poop |
| 48–55 | 7 · The Fix | MET BEFORE = REACTS; a never-met protein bounces off; KANGAROO / VENISON / RABBIT pills | 51.75 bounce |
| 55–58 | End card | Miya wags; BEANS wordmark; "Single-ingredient novel protein treats"; beans.sg; "Suspect a food allergy? Talk to your vet." | |

## Adaptations from the brief (owner to confirm)

- Brief's purple soft-vector look → BEANS cel style: ink line boil, cream paper outside the body, navy inside.
- Brief's Nunito / Energy Orange `#FBA75F` → the owner's later brand inputs: Fraunces / Oswald / Inter, orange `#FE7A3C`.
- Alarm red → brand orange.
- Cast colours use several approved pastels (sky, lilac, blossom, sage). This bends the "one accent per video" rule; needs the owner's OK.
- Gut pan is 600 px, not 900 (fits the vertical frame).
- Length 58 s is over the house 15–45 s default; kept because the brief sets it.

## Open flags

- Sources: owner waived them for this film (2026-10-13).
- Poop character and "Hello, bad poops.": owner says keep.
- Sound: `audio.py` (nylon guitar, warm pad, a few piano notes, soft foley; D major → B minor for the reaction → D).

## v4 (owner, 2026-10-15): voiceover
- Owner asked for a v4 with the ElevenLabs voice, reading in line with the captions.
- `vo.py`: 22 takes by "Jessica" (eleven_multilingual_v2), one per caption line plus the end-card line ("Suspect a
  food allergy? Talk to your vet.", voice only). Every take checked by speech recognition against the script (all
  matched, two needed a second take). Captions are exactly the spoken words and build word by word on her onsets.
- Script changes for speaking: "...and builds" → "And builds", "...and the brain says one thing: scratch." →
  "And the brain says one thing. Scratch.", the callout "This is why allergies seem to come out of nowhere." is now
  a spoken caption (the callout card is gone: one text block at a time).
- The picture is re-timed around the voice (`js/timeline.js`, generated): 58 s → 68 s. Key moments land on their
  words (strike-through on "fleas", lock on "locks", burst on "burst", poop on "poops", bounce on "never"); the dive
  into the mouth, the impact frames and the crossfades keep real speed.
- Sound: voice −22 LUFS, new instrumental (G major, 88 bpm, fingerpicked ukulele, pizzicato, kalimba; a rest before
  the burst, a resolve on the end card) 12 LU under it, foley as v3. Master −14 LUFS.
- Check: the final mix transcribed again; all 156 caption words found within 0.4 s of the spoken word.
