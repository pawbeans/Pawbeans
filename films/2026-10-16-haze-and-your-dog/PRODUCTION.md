# Inside Your Dog: What the haze does to your dog
Series: Inside Your Dog · accent Rabbit (`#9BA88D`, treats) · 70.5 s (voice-first, local Kokoro voice) · 1080×1920, 24 fps

- [x] Gate 1: idea picked by owner (2026-10-16, ~22:55 SGT, live in the pitch session after the cut-off: "something haze
      related that's trending right now"; replaces the cut-off auto-pick of ★1 "Where your dog scratches")
- [x] Gate 2: script: routine, standing approval (owner 2026-10-13), overnight veto
- [x] Gate 3: key frames: routine, standing approval (owner 2026-10-13), overnight veto. Boards `review/…-keyframes-{a,b,c,d}.png` sent 2026-10-16 night.
- [x] Gate 4: rendered → reviewed (rubric) → revised once → shown (2026-10-17 08:28 run, standing approval; no owner notes overnight)
  - Files (local, gitignored): `review/2026-10-16-haze-and-your-dog-v2.mp4` (viewing copy, 28.3 MB),
    `review/…-v2-soundtrack.wav`, `review/…-v2-voiceover.wav`; master `out/…-v2.mp4`.
  - Spec v2: 70.54 s (1693 frames), 1080×1920, 24 fps, AAC 48 kHz stereo, −14.0 LUFS, TP −2.7 dBTP (master and viewing
    copy), stems: voice −22.0 / music −34.0 (12 LU under) / foley −34.5 LUFS, no black frames, fonts loaded.
  - Review v1 (independent subagent, rubric step 1): style 7, concept 5, motion 6, design 6, finish 7, sound 4,
    technical 7, story 6.
  - Revision (critical + high, nothing the owner saw on the boards changed in content, order or copy):
    - C1 hero sync: audio.py keyed the slam to the old 33.1 s; now `HERO = FR(MK['shut'])`, the contact frame 1050.
      Impact, click, harp run and music resolve land on it (were 6 frames early).
    - C2 whooshes: mgaudio already puts a whoosh's peak on `at`; removed the extra −half-duration offset (were 5–7
      frames early and silent on the cut).
    - H1 pouch: lands at 44.80 (anim) so its 3-frame fall from off the top (two stretched in-betweens, squash) shows
      after the whip; the glow appears only on contact; thud moved with it.
    - H2 hero before/after: haze wisps now drift into the room over Miya and a hatched haze veil fills the room while
      the window is open, stepping away on 3s after the slam.
    - H3 safe zone: hero camera shifted left (centre x 620), burst radius 150 at the pane edge, impact frame centre 840.
    - H4 THE BIG ONE pill pops out once before the slam (no vanish / re-pop); KEEP THE HAZE OUT / AIRCON stickers re-stacked.
    - H5 caption: "The haze in Singapore just hit very unhealthy levels." is one two-line card (vo.py `cards(most=56)`,
      timeline merged by hand: the voice was not re-generated).
    - H6 airway: a nose tip at the tube entrance, tiny bits drawn as haze specks (r 11, outlined, 70 px streaks), labels 32 px.
    - H7 Miya never frozen: she turns to each WHO FEELS IT MOST card; breathes hard (breath dashes, chest on 2s) at the vet beat.
    - H8 cover: headline on two lines ("What the haze / does to your dog."), the city reads as haze from frame 0.
  - Still weak / not done (nice-to-have or needs the owner): no "why" for the at-risk groups, short walks or water (new
    VO lines); hero at 62 % of the runtime (playbook asks 70–85 %); "busy brain, tired dog" callout shares the frame
    with the caption; glow discs (bible says no glow); one card at 3.64 words/s (13.1 s); Whisper wasn't available, so
    captions = voice wasn't machine-checked this morning; Kokoro voice (no ElevenLabs key).

Hook formula: "Here's what X does to your dog." (as "What the haze does to your dog.", 7 words)
Why it should travel: it's the news this week in Singapore, every dog owner here is wondering the same thing, and the
tips are saveable.

Pending / unapproved inputs in use:
- Voice is the local Kokoro fallback (no ElevenLabs key this session). If the morning session has the key, re-run vo.py.
- "just hit very unhealthy levels" / PSI 200+ is date-sensitive: check NEA on the posting day.
- PM2.5 "deep into the lungs" is the human EPA finding applied to dogs (stated plainly, no number).

## Story (through-line)
The worst of the haze is tiny: big bits snag in the nose, the tiny ones slip deep into the lungs, so it shows up in
the eyes, the nose and the breathing. Then the signs (each acted by Miya), who feels it most, what helps, and the big
one saved for last: keep the haze out (the window slams shut, hero). The vet line, an indoor sniffing game, the Rabbit
pouch, the question.

## Beat table (film seconds, from js/timeline.js)
| Time | Picture | Voice = captions | Exposure / FX | Foley |
|---|---|---|---|---|
| 0–3.0 | Cover: Miya sits at a window onto a hazy city (tower blocks fading, smoke puffs drifting); hook in Fraunces, "haze" orange italic | "What the haze does to your dog." (headline, no card) | on 2s, boil | paper rustle |
| 3.0–7.5 | Same shot, the haze thickens, slow push; she turns to you on "very"; PSI 200+ and VERY UNHEALTHY stickers | "The haze in Singapore just hit very unhealthy levels." | on 2s | pops |
| 7.5–17.6 | Iris from her nose into navy: the airway and two lungs (Rabbit). Big puffs snag in the nose hairs; on "tiny" the specks rush down the windpipe (on 1s, smeared streaks) and scatter into the lungs, which ring orange; labels BIG BITS / TINY BITS / PM2.5, then EYES · NOSE · BREATHING | "The worst of it is tiny. They slip right past the nose, deep into the lungs. So the haze shows up in their eyes, their nose and their breathing." | iris on 1s; specks on 1s | whoosh, airy rush, harp on "lungs", pops |
| 17.6–28.5 | Iris out. Miya acts each sign: a tear, a sneeze puff, cough ticks, fast breaths, then lying by her untouched bowl (z); sign stickers stack on the right | "Watch for watery eyes, sneezing, or a runny nose. Coughing or gagging. Fast or noisy breathing. Or a dog who's tired and off their food." | on 2s, cel FX | pops, breath puff |
| 28.5–35.2 | Whip. FLAT-FACED BREEDS · OLDER DOGS · HEART OR LUNG PROBLEMS · FEEL IT MOST | "Flat-faced breeds, older dogs, and dogs with heart or lung problems feel it most." | whip on 1s | whoosh, pops |
| 35.2–41.1 | Whip. The lead on its hook (SHORT TOILET TRIPS), a water bowl and a drop (WATER BOWL FULL); Miya wags | "So keep walks short. Just a quick toilet trip. And keep the water bowl full." | on 2s | pops, drip |
| 41.1–47.6 | **Hero.** The window is open, haze wisps drift into the room, Miya lies squinting. On "Shut" the pane slams (2 frames on 1s, the first smeared 2.4×), two impact frames (Rabbit, navy), starburst, shake; the wisps break up through holes and vanish; the aircon starts (air lines); Miya up and wagging; KEEP THE HAZE OUT | "Most of all, keep the haze out. Shut the windows, and run the aircon or a purifier." | on 1s around the slam | swish, soft cinematic impact + wood click, harp run, music resolves, air hum |
| 47.6–51.4 | Whip. Miya lying, panting; STRUGGLING TO BREATHE? then CALL YOUR VET | "Struggling to breathe? Call your vet straight away." | on 2s | pops |
| 51.4–59.1 | Whip. Tiny treat bits pop up round the flat (floor, shelf, cushion); Miya sniffs her way along, sniff ticks; SNIFFING GAMES; "busy brain, tired dog" callout | "Stuck inside all day? Hide tiny bits of treat around the flat. Sniffing games keep their brain busy." | on 2s | paws, pops |
| 59.1–65.8 | Whip. The Rabbit pouch drops in (stretched frame, squash, dust puffs), five tiny pieces pop out beside it; 1 INGREDIENT; Miya wags | "Our single-ingredient treats break into tiny pieces. Nothing added, nothing hidden." | pouch on 1s | soft thud, harp |
| 65.8–68.5 | Whip. Question card; Miya paw raise by three treat bits | "What's your dog's favourite indoor game?" (card, no caption) | on 2s | paper slide |
| 68.5–70.5 | Paper wipe to the end card: Miya wags, BEANS wordmark (placed clean, above the grain), "Single-ingredient freeze-dried treats", beans.sg | – | on 3s | paper slide, ring-out |

## Sources
See `CREDITS.md` (NEA readings via news; US EPA PM basics; AVMA wildfire smoke and animals; RSPCA NSW / Sydney vets; AKC scent work).

## Night notes
- 2026-10-16 ~23:05 SGT: built in the pitch session after the owner asked for a haze film live. Boards checked:
  fixes applied to the airway framing (nose was off-frame under the section pill), the lung highlight (was a muddy
  orange wash, now an orange ring), the slam starburst position (now where the pane lands) and Miya's crop in the hero.
