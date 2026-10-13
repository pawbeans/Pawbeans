# BEANS · Inside Your Dog: Food Allergy · Production Brief

Oct 13, 2026 · @Yashwin

## Overview and specs

A 58-second vertical explainer that follows one food protein from a dog's mouth to an itchy, scratching dog, then shows why a never-eaten protein avoids the reaction. Everything below is software-agnostic: timecodes, copy, colours and motion beats you can rebuild in After Effects, Cavalry, Rive, Blender or anything else.

| Setting | Value |
| --- | --- |
| Resolution | 1080 x 1920 (9:16 vertical) |
| Frame rate | 30 fps |
| Duration | 58 s (55 s of story + 3 s end card) |
| Audio | Music bed + sound design; no voiceover |
| Platforms | Instagram Reels, TikTok, YouTube Shorts |
| Export | H.264, yuv420p, high quality (CRF 18 or \~15 Mbps), AAC 160 kbps |

The colours and font listed here are what the rendered video actually used, which were stand-ins. To make it on-brand, swap in the brand palette noted in the art direction section.

## Script

These 20 captions are the whole script and double as a voiceover read. Words in **bold** are highlighted in gold on screen. Times are in seconds.

| In | Out | Caption |
| --- | --- | --- |
| 0.2 | 2.3 | Your dog isn't itchy because of **fleas.** |
| 2.3 | 4.0 | It might be **dinner.** |
| 4.3 | 6.8 | Food gets broken down in the gut. |
| 6.8 | 11.0 | But sometimes, **protein** pieces slip through the gut wall **intact.** |
| 11.2 | 13.8 | The **immune system** spots them and makes a **mistake.** |
| 13.8 | 16.4 | It tags that protein as an **invader...** |
| 16.4 | 19.0 | ...and builds **antibodies** against it. |
| 19.3 | 22.2 | Those antibodies load onto **mast cells** in the skin and gut. |
| 22.2 | 26.0 | Nothing happens yet. Your dog **seems fine.** |
| 26.2 | 28.2 | Next meal. **Same protein.** |
| 28.2 | 30.8 | It **locks** onto the antibodies... |
| 30.8 | 35.0 | ...and the mast cells **burst,** releasing **histamine** and **itch signals.** |
| 35.2 | 37.4 | In the skin, those signals fire up the **nerves.** |
| 37.4 | 39.6 | The message races to the **brain...** |
| 39.6 | 43.0 | ...and the brain says one thing: **scratch.** |
| 43.2 | 45.6 | In the gut, the same reaction causes **inflammation.** |
| 45.6 | 48.0 | Food rushes through. Hello, **bad poops.** |
| 48.2 | 50.6 | The body only reacts to proteins it has **met before.** |
| 50.6 | 53.0 | So vets use a protein your dog has **never eaten.** |
| 53.0 | 55.0 | **No antibodies. No reaction.** |

End card copy: **BEANS** · Single-ingredient novel protein treats · beans.sg · small line: Suspect a food allergy? Talk to your vet.

## Art direction

The look is a soft-shaded flat vector cartoon: rounded characters with gradient shading and glowing light on a deep purple-navy background. Nothing is a flat fill.

**Shading recipe for every character and key object** (light comes from the top left throughout):

1. Soft outer glow in the object's own colour (additive / screen blend).
2. Drop shadow, offset down-right, dark navy at \~35% opacity.
3. Darker rim shape, \~5% larger than the body.
4. Body fill: radial gradient from the top left, light to mid to deep.
5. Inner shadow clipped to the body, darkening the bottom right.
6. Internal details clipped inside the body, each a small shaded sphere with a highlight.
7. White rim-light arc on the top left edge; a small specular highlight on glossy things.

**Scene layering, back to front:** background gradient, 2 to 3 large soft colour glows, faint drifting outlined blobs at \~5% opacity, small drifting particles at mixed sizes, background characters (blurred \~2.5 px and dimmed), main action, a few large soft foreground glows drifting faster, edge vignette (\~60% dark at corners).

**Palette as rendered:**

| Use | Colours |
| --- | --- |
| Background gradient (top to bottom) | #1E1650, #1A1B4B, #0B1030 |
| Background glows | magenta 200,70,150 · blue 70,90,220 · violet 120,60,200 |
| Caption box | #080A22 at 86% |
| Highlight text and scene titles | #F2B441 |
| Cream text and labels | #F5EBDD; label pill gradient #FFFDF8 to #EFE2D0 |
| Alarm red | #FF5A5F; deep #E0404A |
| Gut interior | #FBB49A to #E2687A, bubbles #FFE6DA |
| Gut wall villi | #FFE9DE to #F3A2A8, rim #C45A7C |
| Tissue below the gut wall | #2B1A58 to #141544 |
| Skin | top #FBCB90 to #E39A55, dermis #C96A5E to #6E2E4C |

**Type:** Poppins Bold for captions (54 px), scene titles (46 px), labels (30 to 44 px) and the end card wordmark (212 px, 16 px letter spacing). Captions build word by word, each word fading and rising 10 px over 0.14 s, staggered 0.07 s.

**Safe zones (1080 x 1920):** keep text and key action between y 180 and y 1540. Main subject centred around y 820. Captions centred at y 1410. Nothing important in the right 120 px below y 900.

**On-brand swap:** background navy #264170 deepening to #1B2F52; cream #FFF7EA for text; Energy Orange #FBA75F replaces the gold highlight; Nunito 900 for captions and titles, Inter for labels; the real BEANS wordmark on the end card. Kangaroo, venison and rabbit chips take their protein accents #B24E2B, #6B2A2A, #9BA88D.

## Cast

Eight recurring characters and objects. Build each once as a reusable rig, with its face states as swappable layers. The trigger protein must look identical in every scene so viewers can track it.

| Character | Design | Colours | States |
| --- | --- | --- | --- |
| Dog | Sitting puppy, slightly oversized head, floppy dark ears, cream muzzle and chest, darker eye patch, terracotta collar with a gold tag, curled tail | Fur #F9C680 / #E89B45 / #C0702E; ears #A05A2A to #6B3416; cream #FFF0D8 / #EFCB9C; nose and eyes #2B1A2E; collar #B44A26 / #E0703F | Scratch (hind paw raised to ear, squinting X-eye, wavy mouth, motion arcs, sparkles), Sit (open eye, mouth opens to eat), Happy (closed smiling eye, tongue out, fast tail wag) |
| Trigger protein | Rounded-corner triangle gem with a darker facet on the lower half and a white highlight; orange glow behind it | #FFC078 to #F0783A to #C2441F; edge #A8371A | Floating with slow rotation; glows brighter when it locks on |
| Never-met protein | Glossy sphere with a highlight and green glow | #E0FACC to #5FA858 | Floats, bounces off, drifts away |
| Mast cell | Pink wobbling blob (radius \~230 px hero, \~100 px background), packed with purple and gold granules, ringed by 10 antibodies (6 on small cells) | #FFF3F9 / #F7C2DF / #DC92C3; rim #B2609A; heats to coral #F8A096 / #E45D70 | Asleep (closed curved eyes, small smile), Shocked (wide eyes, raised brows, O mouth), Dizzy after burst (spiral eyes, wavy mouth, mostly empty), Happy (in the fix) |
| Antibody | Y shape: stem plus two arms with rounded cupped tips, drop shadow and highlight | Cream #FBF3E6 with rim #D9C7B0; triggered: #FFA25E with rim #E0562B and an orange glow | Docked and gently swaying; leans in and turns orange when the protein locks |
| Guard immune cell | Sky-blue blob with 8 wobbling tapered arms ending in rounded tips | #EBFBFF / #84D6F4 / #3F97D8; rim #2A6CB0 | Curious (open eyes looking at protein), Alarmed (shocked face, red tint, red ! badge) |
| B cell | Violet blob, no arms | #F5ECFF / #BB9EF4 / #7F5CD8; rim #5A3EAE | Open eyes, then Happy while pumping out antibodies |
| Brain | Pink two-lobed brain with grooves, a short stem, and a face on its front | #FFE6EE / #F7A9C0 / #DB7093; grooves #C95F84; lit: warm #FFF6D8 | Asleep, Awake, Shocked; lights up with gold rays |

**Particles:** histamine = purple shaded spheres #EBC6FF to #9440DB; itch signal (IL-31) = gold shaded spheres #FFEFB8 to #EE9A12. Both glow softly.

**Poop character:** three stacked rounded brown blobs (#B98652 to #6E4526) with a swirl tip, two wide eyes and a small smile, green stink lines.

## Overlays

Three text layers sit above every scene; build them once as templates.

- **Series tag:** pill "INSIDE YOUR DOG", 28 px, cream on dark navy at 78%, centred at y 214. Fades in 0.2 to 0.6 s, out at 54.6 to 55 s.
- **Scene title:** gold 46 px pill below the tag at y 279. Fades in over 0.35 s while sliding up 14 px; fades out over the last 0.25 s.
- **Caption:** dark box (#080A22 at 86%, 30 px corner radius), max text width 880 px, line height 74 px, centred at y 1410. Box fades in and rises 26 px over 0.16 s; words build in one by one; whole caption fades out over its last 0.1 s.
- **Labels:** pill chips that pop in with an overshoot ease (scale 0 to 1, \~0.35 s), soft drop shadow, top sheen, and a coloured sphere when they name a particle.

| Scene title | In | Out |
| --- | --- | --- |
| 1 · THE GUT | 4.0 | 11.0 |
| 2 · THE MISTAKE | 11.0 | 19.0 |
| 3 · THE TRAP IS SET | 19.0 | 26.0 |
| 4 · THE REACTION | 26.0 | 35.0 |
| 5 · THE ITCH | 35.0 | 43.0 |
| 6 · THE GUT, AGAIN | 43.0 | 48.0 |
| 7 · THE FIX | 48.0 | 55.0 |

The hook (0 to 4 s) has no scene title.

## Shot list

Eight shots. Shots 2 and 3 are one continuous world joined by a camera pan, and so are shots 4 and 5. Times are seconds from the start of the video.

### Shot 1 · Hook (0 to 4)

Deep purple background with a warm orange glow behind the dog.

- 0.0 to 2.4: dog centred (feet at y \~1180, \~1.15x scale) in the Scratch pose, hind paw rubbing its ear at \~6 strokes per second, motion arcs and small sparkles.
- 0.7 to 1.0: "FLEAS?" label pops in at upper right (x 850, y 560).
- 1.2 to 1.65: red X strikes through it, two diagonal strokes drawn on one after the other. Label fades by 2.5.
- 2.5 to 2.9: dog switches to Sit and opens its mouth.
- 2.5 to 3.25: trigger protein arcs in from off-screen upper right (arcing up \~260 px) into the mouth.
- 3.2 to 4.0: camera zooms into the mouth to 12x (ease in), while a dark maroon circle (#3A1230) grows from the mouth to fill the frame from 3.45 to 4.0.

### Shot 2 · The gut (4 to 11)

Inside the intestine: coral-pink space with soft drifting bubbles above a wall of rounded, gently swaying villi (pill shapes \~120 px wide). Below the wall is the dark violet tissue. Two dark gaps in the wall, at x 380 and x 700.

- 4.0 to 5.4: camera descends from high in the gut down to the wall (ease in-out), from the maroon wipe.
- 4.3 to 6.4: five food chunks drop in, staggered 0.12 s. Each chunk is a protein gem wrapped in four tan crumb spheres.
- 5.7 to 7.1: crumbs shrink away, exposing the gems.
- 6.7 to 7.7: three gems break into small orange fragments that fade out.
- 7.2 to 8.1: the two intact gems move to the gaps, which glow gold.
- 8.1 to 9.4: they squeeze through, squashing to \~40% width at the midpoint.
- 9.4 to 10.5: they emerge into the tissue, pulsing a gold ring. "INTACT PROTEIN" label at 9.5 to 10.7.
- 10.5 to 11.7: camera pans down \~900 px into the tissue, carrying into shot 3.

### Shot 3 · The mistake (11 to 19)

- 11.3 to 12.5: blue guard cell slides in from the left with arms waving, curious face looking at the left protein.
- 12.6 to 13.5: it drifts \~50 px closer.
- 13.8: alarm. Face snaps to Shocked with a squash-hop, body tints red, a red "!" badge pops above it, a dashed red ring locks onto the protein (shrinking from 170 to 86 px while rotating), red sonar rings pulse out from the protein until 16.4.
- 14.3: "INVADER" label (red pill, white text) pops beside it.
- 15.2 to 16.0: red tint fades back to blue.
- 15.6 to 16.0: violet B cell pops in at lower right (x 770, y 1990). "B CELL" label at 16.0.
- 16.4 to 19.0: B cell pumps (rhythmic squash-stretch every 0.17 s) with a happy face, firing 17 antibodies one every 0.17 s. Each arcs left then sweeps down off-screen while tumbling.
- 17.1: "IgE ANTIBODIES" label at left.

### Shot 4 · The trap is set (19 to 26)

Push transition into a calm purple scene. Hero mast cell at the centre (x 540, y 820, radius 230); two smaller, blurred mast cells at upper right (x 905, y 455) and lower left (x 165, y 1120). All three are asleep.

- 19.7 to 23.5: antibodies fly down from above and dock onto the hero one by one, staggered 0.24 s, each easing in and rotating to point outward. Background cells receive theirs from 20.6, staggered 0.25 s.
- 20.4 to 25.8: "MAST CELL" label at upper left.
- 22.4 to 26.0: "z" letters float up and fade beside the hero.
- 23.1 to 25.8: a cream callout card slides up at right (x 330 to 1010, y 1145): "This is why allergies seem / to come out of nowhere."

### Shot 5 · The reaction (26 to 35)

The peak of the video.

- 26.35 to 27.7: three trigger proteins fly in and hover above each cell's top antibodies, bobbing, with ghost trails.
- 28.4 to 29.4: the hero's protein descends; its top two antibodies lean inward to meet it.
- 29.4: lock. White starburst flash at the contact point (10 rays plus a ring), the two antibodies turn orange and glow, the hero's eyes snap open to Shocked with a squash-hop.
- 29.4 to 30.7: tension. The hero heats from pink to coral-red, swells to 111%, granules jitter faster, the cell trembles (shake building to \~6 px), the camera pushes in to 109%.
- 29.9 and 30.3: the two background cells lock the same way, smaller.
- 30.7 to 31.0: anticipation. The hero contracts to 84%, widening slightly.
- 31.0: burst. Full-frame white flash fading over 0.2 s; two cream shockwave rings; \~78 granules explode outward with motion trails and glow, slowing and drifting down; 12 membrane arc fragments fly off and spin; antibodies fly off and fade; the protein shoots up and away; camera punches to 96.5% then settles to 100% with heavy shake (\~42 px decaying over 1.1 s).
- 31.0 to 32.0: the hero springs back in a damped bounce, deflated and mostly empty, face Dizzy.
- 31.4 and 31.8: background cells burst the same way, smaller.
- 32.3: "HISTAMINE" label (purple dot) at upper left. 32.9: "IL-31 · THE ITCH SIGNAL" label (gold dot) at lower right.
- 33 to 35: granules keep drifting and glowing.

### Shot 6 · The itch (35 to 43)

**Part A, nerve to brain (35 to 39.6).** Skin cross-section across the lower frame (top edge y \~1150, gently wavy), with three lavender nerve endings branching below it. A wavy nerve line rises from the skin to the brain stem. Brain at x 540, y 655, asleep.

- 35.0 to 36.3: gold IL-31 spheres rain down onto the skin, staggered 0.07 s. Where they land, red hotspots glow and pulse.
- 35.3 to 37.0: "IL-31" label. 35.5: "SKIN" label. 36.2: "NERVE" label.
- Gold pulses travel up the nerve (0.8 s each) and hit the brain at 37.2, 37.9 and 38.6. Each hit makes the brain pop 7%.
- After the first hit the brain wakes (open eyes). On the third it goes Shocked and lights up: warm glow plus 14 gold rays flickering around it.
- 38.8: "SCRATCH!" pops above the brain with an overshoot, tilted -3°, orange gradient fill with a thick dark navy outline.

**Part B, the dog (39.6 to 43).** Dog in the Scratch pose, slightly smaller, red glow behind it.

- 40.1: "EARS" (red pill) at left, with a pulsing red ring on the ear and a leader line.
- 40.7: "PAWS" at right.
- 41.3: "BELLY" at right.

### Shot 7 · The gut, again (43 to 48)

Background tinted maroon. A thick S-shaped intestine tube fills the frame (three runs connected by U-bends, exiting at the bottom right), with tan food pellets drifting slowly along it.

- 43.4 to 45.0: the tube inflames, shifting from pink to red, throbbing in thickness (\~9 px), with a pulsing red outer glow.
- 44.3: "INFLAMED" label at upper left.
- 45.6 to 48.0: pellets speed up sharply with brown motion streaks.
- 46.5: a poop character pops out of the exit (x 830, y 1215) with an overshoot, jiggling, green stink lines rising.

### Shot 8 · The fix (48 to 55)

Hero mast cell back at the centre, calm and refilled, asleep.

- 48.5 to 50.5: a ghost of the orange protein blinks above the docking point. "MET BEFORE = REACTS" label (orange) above it.
- 50.6 to 51.7: the green never-met protein flies in from upper right to the docking point. "NEVER MET" label follows it from 51.0.
- 51.7: it bounces off. A soft cream ripple ring spreads from the contact point; the protein drifts to the upper right (x 800, y 440) and keeps gently floating. A soft green glow rises behind the cell.
- 52.0: cell's face turns Happy.
- 53.1, 53.35, 53.6: "KANGAROO", "VENISON", "RABBIT" chips pop in left to right at y 1200, each in its protein's earthy colour with cream text.

### End card (55 to 58)

Warm orange glow on the purple background. Elements rise 40 px and fade in, staggered 0.22 s.

- 55.2: dog in the Happy pose (tail wagging fast, tongue out), centred above.
- 55.42: BEANS wordmark, 212 px, cream gradient with a soft drop shadow.
- 55.64: "Single-ingredient novel protein treats", 43 px.
- 56.0: "beans.sg" in a gold pill, 52 px.
- 56.1: "Suspect a food allergy? Talk to your vet.", 32 px at 80% opacity.

## Transitions

No hard cuts; every scene change is a camera move or a short crossfade, all eased in-out.

| At | From | To | Type | Duration |
| --- | --- | --- | --- | --- |
| 3.2 | Hook | Gut | Zoom into the mouth + maroon circle wipe | 0.8 s |
| 10.5 | Gut | The mistake | Camera pans down \~900 px, same world | 1.2 s |
| 19.0 | The mistake | The trap | Push: old scene slides up out of frame as the new one rises from below | 0.9 s |
| 26.0 | The trap | The reaction | None, continuous shot | none |
| 35.0 | The reaction | Nerve to brain | Crossfade | 0.45 s |
| 39.6 | Nerve to brain | Scratching dog | Crossfade | 0.3 s |
| 43.0 | Scratching dog | Gut, again | Crossfade | 0.4 s |
| 48.0 | Gut, again | The fix | Crossfade | 0.4 s |
| 55.0 | The fix | End card | Crossfade | 0.45 s |

## Sound design

The bed is a soft synth pad that changes chord with the mood; effects sit on top, timed to the picture. Any royalty-free library covers these.

**Pad chords:**

| From | To | Chord | Mood |
| --- | --- | --- | --- |
| 0 | 26 | A minor (A2, E3, A3) | Curious |
| 26 | 35.5 | Ab with added Eb (unsettled) | Tension |
| 35 | 48 | G minor-ish (G2, D3, G3) | Uneasy |
| 48 | 58 | A major add 9 | Resolved, warm |

**Effect cues:**

| Time (s) | Sound |
| --- | --- |
| 0.1 to 2.4 | Rapid soft scratching ticks, \~12 per second |
| 2.5 | Rising chirp as the protein flies in |
| 3.25 | Low gulp pop |
| 3.3, 10.5, 18.8, 34.9, 39.5, 42.9, 47.9, 54.9 | Whooshes on camera moves and transitions |
| 6.7 | Five small pops as the gems break |
| 8.3 | Two squeezy rising chirps as proteins slip through |
| 13.8 | Three short square-wave alarm beeps |
| 16.5 to 19 | Rapid pop each time an antibody fires |
| 20.6 to 23 | Soft clicking pop for each antibody docking |
| 29.4 | Bright bell hit on the lock |
| 29.4 to 31.0 | Rising low riser with rumble, building |
| 29.9, 30.3 | Smaller bell hits for the background locks |
| 31.0 | Big boom: noise burst plus a falling sub tone |
| 31.1 to 32.7 | Glittery sparkle pops for scattering granules |
| 31.4, 31.8 | Smaller booms for the background bursts |
| 36.4, 37.1, 37.8 | Rising zaps up the nerve |
| 37.2, 37.9, 38.6 | Bell hits as pulses reach the brain (last one higher) |
| 38.85 | Punchy pop for SCRATCH! |
| 40.1, 40.7, 41.3 | Pops for each label |
| 45.6 to 48 | Gurgling rush |
| 46.5 | Comic wobbly squelch for the poop |
| 51.7 | Soft bounce boing |
| 53.1, 53.35, 53.6 | Rising three-note bells for the protein chips |
| 55.3 to 56 | Warm four-note rising chime for the end card |
| 56.8 to 58 | Fade out |

## Animation rules and export

These rules are what make it feel alive; apply them to every layer.

- **Easing on everything.** Ease-out cubic for arrivals, ease-in-out for camera moves, overshoot (back ease) for pop-ins. Nothing moves linearly.
- **Idle life.** Cell outlines wobble continuously (a few percent, slow noise), characters breathe \~1%, particles drift, villi sway. Nothing is ever fully still.
- **Anticipation.** Before the burst the cell contracts; before landing, characters squash.
- **Squash and stretch** on every pop, hop, squeeze and impact.
- **Follow-through.** Antibodies and arms sway after their body moves; the burst cell springs back in a damped bounce (about 3 oscillations over 1 s).
- **Stagger.** Groups enter 0.07 to 0.3 s apart, never all at once.
- **Depth.** Background characters blurred \~2.5 px and dimmed; the camera drifts subtly during holds.

**Before export, check:**

- [ ] Frame 1 already has the dog moving and the hook caption appearing
- [ ] Captions never cover a face or a label
- [ ] Everything important sits inside y 180 to 1540
- [ ] The trigger protein looks identical in every scene
- [ ] The burst at 31 s is clearly the biggest moment
- [ ] End card has the wordmark, beans.sg and the vet line
- [ ] Export H.264 1080 x 1920, 30 fps, AAC audio, fast-start enabled
