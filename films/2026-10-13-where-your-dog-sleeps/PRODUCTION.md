# Dog Decoded: Where your dog sleeps says a lot

Series: Dog Decoded (no BEANS mention: no logo, product or URL). Idea D1, owner's pick ★1 with **six spots** (2026-10-13, 22:00).
Hook formula: "Where your dog [sleeps] says a lot about you." Length 32.5 s, 1080×1920, 24 fps. Mood accent: lilac (Calming pastel, no product meaning).

- [x] Gate 1: idea picked by owner (2026-10-13, ★1 D1, six spots)
- [x] Gate 2: script: approved by owner ("approved", 2026-10-13 night, this version)
- [x] Gate 3: key frames for the whole film (39 stills) → `review/2026-10-13-where-your-dog-sleeps-keyframes-{a,b,c}.png`: approved by owner ("approved", 2026-10-13 night, this version)
- [x] Gate 4: rendered → reviewed (rubric) → revised once → shown (v2, 2026-10-14 morning run)
  - v1 spec: 32.5 s, 780 frames, 1080×1920, 24 fps, H.264 + AAC 48 kHz, −16.1 LUFS, −2.0 dBTP (mp4), no black frames, all fonts loaded (Fraunces, Inter, Oswald; no fallbacks).
  - v1 rubric scores (separate reviewer): style 7 · concept 6 · motion 5 · design 6 · finish 7 · sound 6 · technical 7. No critical issues.
  - Revision 1 (v2), all six high fixes: H1 safe zones (series pill y 252, spot pill y 330, caption cards narrower and centred at x 500, question card x 90–910 at 72 px, hero shot framed so the standing Miya clears the right-hand buttons); H2 hero head pop: no straight mask edge (the duvet is redrawn over her body), the flap scales with her, pivot on her chin; H3 no ghost text: captions, pills, headline and question card pop out opaque on 1s, the headline clears before the first caption, the cover holds about 0.6 s before the loop; H4 bigger hero: push-in from the crouch (1.15 → 1.55), deeper crouch, a 1-frame stretch as she springs, a 2-frame impact frame on the duvet flop (frames 592–593, no text), more overshoot on the head pop with a puff and twinkles; H5 caption retimes at 4.2–7.9 and 20.15–23.9 (≤ 3.5 words/s, copy unchanged); H6 the 6.2 thump now lands on an ear twitch, a 1-frame settle squash and a puff. Sound sync: smile harp 18.2, dive whoosh 24.40, head-pop 25.21, loop pop 31.92.
  - Not done: N1 (zzz over the navy window), N3 (second knock has no picture), N5 (punch-in at 4.0 without smear), N6 (whip direction variety), N7 (overhead spot 5 reads abstractly), N8 (curly quotes), N9 (empty floor), and the two approved-content notes N10 (6/6 pill names the answer before the dive) and N11 ("They see themselves as your protector." / "Your scent comforts them" stated as fact): owner's call.
  - v2 spec: 32.5 s, 780 frames, 1080×1920, 24 fps, −16.1 LUFS, −2.1 dBTP (master and viewing copy), no black frames. Master `out/where-your-dog-sleeps-v2.mp4` (61 MB, gitignored); viewing copy `review/where-your-dog-sleeps-v2.mp4` (13 MB, audio stream copied from the master so TP stays ≤ −2); stem `review/where-your-dog-sleeps-sfx-only.wav`.

Pending / unapproved inputs in use: Miya's NEW poses `sleep` (chin on paws) and `curl` (donut), added to `characters/miya/miya.js`
and the model sheet (`review/miya-model-sheet-new-poses.png`); no existing pose changed. "Back against you" and "under the
covers" are staged with `sleep` (seen from above / with the duvet over her body), not separate poses. The pitch's closing
"stretch" is drawn as a yawn on the curl pose.

## Beat table

| Time | Picture | Caption / text | Exposure | Cel FX | Foley |
|---|---|---|---|---|---|
| 0–2.2 | Cover: Miya curled (donut) on a lilac duvet, night window | Headline: "Where your dog sleeps / says *a lot.*" | 2s | boil, paper | fur rustle |
| 2.2–4.0 | Headline lifts away | "Six spots. The best is **last.**" | 2s | | pop |
| 4.0–8.0 | 1/6 ON YOUR BED: punch-in (on 1s), slow push, zzz, tail thump 6.1 | "It can mean you're **family.**" / "Puppies pile up for **warmth and safety.**" | 1s → 2s | zzz | swish, pop, soft thump |
| 8.0–12.0 | whip pan → 2/6 FOOT OF THE BED: you under the duvet, Miya lying at the foot, head up; 10.0 turns to the room, orange look line | "Close to you..." / "...but **watching the room.**" | whip 1s, 2s | speed lines, smear | whoosh, harp |
| 12.0–16.0 | whip → 3/6 BY THE DOOR: Miya on the mat; 13.8 two knocks, ears up | "Often a dog on **guard duty.**" / "They see themselves as your **protector.**" | 2s | sound ticks, twinkle | two wood knocks |
| 16.0–20.0 | whip → 4/6 ON YOUR CLOTHES: asleep on your lilac sweater on the sofa; scent wisps rise to her nose; 18.0 smile | "Your **scent** comforts them..." / "...especially when **you're out.**" | 2s | scent wisps | paper slides, harp |
| 20.0–24.0 | whip → 5/6 BACK AGAINST YOU: from above, Miya shuffles back against your back (21.6, on 1s), squash | "It can mean **"I've got your back."**" / "It's a sign of **deep trust.**" | 2s, 1s | contact puffs, twinkles | rustle, soft impact, harp |
| 24.0–28.8 | whip → 6/6 TUCKED AGAINST YOU (hero, 75–88 %): crouch, dive (smear frame 24.58), duvet flop + starburst (24.67), hump travels, head pops out at your legs (25.2), push-in to her face | "And the sweetest spot..." / "Against you? You're their **safe place.**" | 1s → 2s | smear, starburst, puffs, zzz | swish, soft impact, crumple, harp roll |
| 28.8–32.5 | whip → back to the cover framing; question card; 31.2 yawn; headline returns so frame 779 = frame 0 (loop) | "Where does *yours* sleep? Tell us below." | 3s hold, 2s | | slide, pop, rustle |

Why it should travel: everyone with a dog knows exactly where theirs sleeps, so it begs a comment and a share to the bed partner.

## Sources (also in CREDITS.md)

Dog Decoded light sourcing (owner, 2026-10-13): popular behaviour lore, every line framed as "can mean" / "often". General
references checked: Petplan UK, "Dog sleeping positions"; Newsweek (2022) quoting the AKC on curling up for warmth. No health,
medical or food-safety claims in the film.
