# Inside Your Dog: The poop chart

Series: Inside Your Dog (BEANS: product near the end, logo end card). Idea B6, **auto-picked ★1 at the 22:30 SGT
cut-off** (no reply to the 2026-10-14 pitch). Accent: Digestive Probiotics sage `#BFD8AE`; brand orange for stickers,
rings and the hook word. Hook formula: "Your dog's X is talking to you." (a "you've been reading your dog wrong" cousin).
Length **54.25 s** in v2 (49.5 s at the boards; voice slowed for reading time, local Kokoro voice; see flags), 1080×1920, 24 fps.

- [x] Gate 1: routine: standing approval (owner 2026-10-13), overnight veto. Auto-picked ★1 at the cut-off.
- [x] Gate 2: routine: standing approval (owner 2026-10-13), overnight veto. Script below.
- [x] Gate 3: routine: standing approval (owner 2026-10-13), overnight veto. Key frames for the whole film (59 stills)
      → `review/2026-10-14-the-poop-chart-keyframes-{a,b,c,d}.png`; new poses → `review/miya-model-sheet-new-poses.png`.
- [x] Gate 4: rendered → reviewed (rubric) → revised once → shown (2026-10-15 08:28 SGT run, delivered v2)
  - v1 spec: 49.54 s, 1080×1920, 24 fps, H.264 + AAC 48 kHz, −14.0 LUFS, −2.3 dBTP (mp4), VO −22.0 / music −34.0 LUFS
    (12 LU under), no black frames, all fonts loaded (Fraunces, Inter, Oswald, Caveat; no fallbacks).
  - Review (separate subagent, `mg-styles-15/rubric.md`) of v1: style 7, concept/wow 6, motion craft 5, design/type 7,
    finish 7, sound sync 6, technical 6. Critical: 12 of 21 caption cards under 1.5 s and 8 over 3.5 words/s; the time
    warp broke one-frame moves (the hero 2 showed 1 of its 3 falling frames, smear frames held 2 frames, the tin fell
    during the whip). High: tail strobe every frame (`f % 2`), ghost dissolve to the end card, 2-frame empty caption
    card at every back-to-back change, "ahem." outside the safe zone with its arrow reading as a stick in Miya's mouth,
    the bag hand parked half off frame, static holds (tin, question, river).
  - v2 changes (one revision): voice re-made slower (Kokoro speed 0.95 → 0.88, gaps 0.3 → 0.4 s, section tails 0.45 →
    0.8 s; "A seven is a puddle." as its own take) so every card is on screen ≥ 1.5 s; cards stay up to the next card
    or the cut and swap 0.04 s before the first word; every one-frame event keyed to the film frame (`FF()` / `D.fn`):
    ruler smear, hand smear and grab twinkle, pellets, the hero drop (3 falling frames + contact + 2 impact frames)
    and the tin drop; hero keep-speed window widened in `vo.py`; tail wag on the drawing (`D.id % 2`); the end-card
    dissolve replaced by a hard-edged paper wipe on 1s (5 frames); "ahem." moved above the bush, arrow to the bush;
    the hand lifts up and left (cuff ≤ x 900); camera pushes on the tin (dz 0.12), question (0.08) and river (+8 %);
    the series pill turns cream on navy. Copy, order and content unchanged from the boards.
  - v2 spec: 54.25 s (1302 frames), 1080×1920, 24 fps, −14.0 LUFS, −2.7 dBTP (mp4 and viewing copy), VO −22.0 / music
    −34.0 / foley −34.2 LUFS, no black frames. Transitions checked frame by frame (hero, tin, end wipe, caption swaps).
  - Files (not committed): `review/2026-10-14-the-poop-chart-v2.mp4` (viewing copy, 22.9 MB),
    `review/2026-10-14-the-poop-chart-v2-soundtrack.wav`, `review/2026-10-14-the-poop-chart-v2-voiceover.wav`.
  - Still weak: the Kokoro voice is flat (no ElevenLabs key again); two cards still read a little fast ("A three holds
    its shape when you pick it up." ≈ 4.1 w/s, "Soft for more than a day, or any blood?" ≈ 3.7 w/s); the hero sits at
    ≈ 52 %; the bag hand's sleeve still runs off the right edge (cuff inside); 54 s is over the 45 s series target.
    Not done (nice-to-have): tube bend spikes, a faint arc at the log residue, pellet size, sticker pop-out specks,
    foley pre-roll on the squelch and tin, the soft sage glow, the iris freezing the outgoing shot.
  - Needs the owner: move the hero later (shorter inside section); "poop" vs British "poo"; the Purina chart calls 5
    "piles" (script says "Five and four look like logs"); ElevenLabs voice; more action at the tin moment.

Pending / unapproved inputs in use: NEW Miya poses `squat` and `lookDown` (model sheet, awaiting the owner's OK);
voice is the local Kokoro fallback (no `ELEVENLABS_API_KEY` in the build session); poop colour = the Venison accent
used as an object colour (as in the approved Inside Your Dog poop), highlight `#8A4A3E` DERIVED.
Sources (also in CREDITS.md): Purina faecal score chart (Ohio State VMC copy); VCA Animal Hospitals "Diarrhea in
Dogs"; PDSA "Diarrhoea in dogs".

## Why it should travel
Every owner looks at it every day and nobody explains it; the comment question ("what number was this morning's?") is
easy and a little funny.

## Voiceover (= captions, word for word)
1. Your dog's poop is **talking** to you. *(the cover headline)*
2. Vets score it from one to seven. Only one is **the goal.**
3. A seven is a puddle. A six is a pile with no shape. **Too soft.**
4. Five and four look like logs, but they **fall apart** when you pick them up.
5. A one is hard, dry little pellets. **Too dry.**
6. A three holds its shape when you pick it up. That's **close.**
7. And a two is the one. **Firm, in segments,** and easy to pick up.
8. What moves the number? Switching food too fast, a new treat, or **stress.**
9. Soft for more than a day, or any blood? **Call your vet.**
10. Our Digestive Probiotics support a happy gut. **Firmer poops, happier walks.**
11. So, what number was this morning's? *(the question card)*

## Beat table (film seconds, from `out/timeline.json`)

| Time | Picture | Text | Exposure | Cel FX | Foley |
|---|---|---|---|---|---|
| 0–3.0 | COVER: Miya mid-squat behind a sage bush, tail up; she glances at camera (1.0) | Headline "Your dog's poop is *talking* to you."; Caveat "ahem." + arrow | 2s | boil | rustle, pop as headline leaves |
| 3.0–7.1 | Miya sits; the 1–7 ruler slides up (smear frame), numbers stamp in on "one…seven"; head tilt on "goal" | pill SCORE 1 TO 7; captions | 1s for slide + stamps | smear, stamp squash | paper slide, 7 soft clicks |
| 7.1–12.4 | Miya looks down; a puddle lands on "seven", a pile on "six"; ears drop, tail down | rings on 7, 6; sticker TOO SOFT | 1s on splats | splat ticks, squash | squelch, gloop, pop |
| 12.4–17.3 | Miya sits; a soft log lands on "five"; a bag hand swishes in (smear), grabs on "fall", lifts; half stays behind, drips | rings on 5, 4 | 1s for the hand | smear, twinkle on grab, drips | swish, crumple, squelch, drips |
| 17.3–21.1 | Miya squats behind the bush, straining (strain ticks); six dry pellets pop out one by one on 1s | ring on 1; sticker TOO DRY | 1s for pellets | stretch mid-flight, squash on landing | wooden ticks |
| 21.1–25.1 | Miya stands; a smooth log lands on "three"; an orange star OUTLINE pops on "close" | star outline on 3; sticker CLOSE | 2s | splat | gloop, harp A5 |
| 25.1–30.1 | HERO (≈52 %): the segmented 2 drops on "two" (2.6× smear), contact squash, 2 impact frames (sage, cream star), starburst, sage glow, Miya's happy wag, twinkles | filled star + sage disc on 2; sticker THE GOAL | 1s | smear, impact frames, starburst, camera shake + punch | whoosh, soft impact, harp G–B–D–G |
| 30.1–38.8 | Navy iris from Miya into the body: the gut as a river, calm, then rushing on "switching" (white water, streaks) | pill WHAT MOVES IT; stickers FOOD SWITCHED FAST / A NEW TREAT / STRESS on their words, then SOFT FOR OVER A DAY / BLOOD / CALL YOUR VET | 1s iris, then 2s | speed streaks | whoosh, gloop, pops |
| 38.8–44.8 | Cream paper, sage glow; the Digestive Probiotics tin drops in (stretch frame, squash, dust puffs); Miya wags; twinkles on "Firmer" | captions only | 1s on the drop | smear, squash, puffs | swish, soft impact, harp |
| 44.8–47.6 | Miya paw-raise beside the ruler (2 starred) | question card "So, what number was *this morning's*?" | 2s | | paper slide |
| 47.6–49.5 | Dissolve to the end card: Miya wags, BEANS wordmark (placed clean, above the grain), "Digestive Probiotics soft chews", beans.sg | | 3s hold | | paper slide |

Retention notes: hook 7 words, readable at frame 0 (Miya + headline); something changes every 1.5–2.5 s (labels and
samples land on their words); numbered levels with a visible ruler; the goal saved for last after 3 ("close").
The hero lands at ≈52 % (not the playbook's 70–85 %): the inside-the-body section, product and question follow it.
Owner's call if the hero should move later (e.g. cut the inside section shorter).

## Sound
`vo.py` (voice first; this run: local Kokoro, af_heart 60 % + af_bella 40 %, speed 0.95) → `audio.py`: new
instrumental (nylon guitar fingerpick, pizzicato, vibraphone motif; G major ≈ 92 bpm; resolves on the 2), music 12 LU
under the voice, soft foley. Test mix: −14.1 LUFS, −2.6 dBTP (WAV). If the morning run has `ELEVENLABS_API_KEY`, re-run
`vo.py` first (Jessica): the timeline, captions and audio re-time themselves; re-render key stills to check.
