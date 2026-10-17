# BEANS daily films: playbook

One new vertical film every day, made by three routines (`content/routines/`). This file says **what** to make and
**how to make it hook**. The motion bible (`.claude/skills/beans-motion/SKILL.md`) says how it must look and sound;
when they disagree, the bible wins on craft and brand, this file wins on content strategy.

## 1. The two series (alternate every day)

| | **Dog Decoded** (viral) | **Inside Your Dog** (BEANS) |
|---|---|---|
| Job | Reach. Hook anyone with a dog, earn follows, shares and saves. | Teach something real about the body, food or wellbeing that makes BEANS the obvious answer, without selling. |
| BEANS mention | **None.** No logo, no product, no beans.sg, no "novel protein" talk. Miya is the only brand signal. | Subtle. The insight leads; a product appears as a hero object only near the end; logo end card. |
| Topics | Behaviour, body language, senses, dog science, myths, "what it means when…" | Allergies, itch, gut, poops, skin and coat, joints, calm, nutrition, label reading, novel proteins |
| Length | **20–35 s** (a guide) | **30–45 s** (a guide; up to **90 s** for a deep explainer, owner 2026-10-16) |
| Series tag (top pill) | `DOG DECODED` | `INSIDE YOUR DOG` |
| Ending | Question card that invites comments ("Where does yours sleep? Tell us below."), then a 0.5 s visual loop back to the opening pose | Payoff line, product moment, logo end card held about 1 s |
| Palette | ink + navy + cream + orange callouts; one accent from the supplement pastels used as a mood colour (no product meaning) | ink + navy + cream + **the product's accent** + sparing orange |

Rotation rule: the next film is the series that was **not** made last (see `LOG.md`). A skipped night does not break
the rotation. Seasonal pins in `IDEAS.md` override the rotation for that date only.

## 2. Retention rules (both series)

The algorithm rewards watch time and rewatches. Every film is built backwards from these:

1. **The first frame is the cover.** It already shows Miya mid-action plus the hook text, readable as a thumbnail.
   Never open on empty paper or a slow fade.
2. **Hook in under 1.5 s, in seven words or fewer**, big (Fraunces, navy, one orange italic word). Use a hook formula
   (§3). The hook opens a loop the film only closes at the end.
3. **Something changes every 1.5–2.5 s**: a new pose, a camera push, a label pop, a cut. No shot holds still for
   more than 3 s without a reason.
4. **Numbered structures beat essays.** "4 spots, 4 meanings" with a visible counter (1/4, 2/4…). Save the best or most
   surprising item for last and tease it ("the last one is the sweetest").
5. **Pay off at 70–85 % of the runtime**, the hero beat (smear, impact frames, a big reveal).
6. **End on a loop or a question.** Dog Decoded: question card, then the last frame matches the first so the replay
   is seamless. Inside Your Dog: one-line payoff, then the logo.
7. **Voice first (owner, 2026-10-14).** Write the script as a voiceover: what a warm, playful person would say to a
   friend, so the film makes sense with your eyes shut. Name each item out loud ("First, on your bed. That usually
   means you're family."), never fragments that lean on an on-screen label ("It can mean you're family."). The captions
   are exactly the spoken words, cut into cards by sentence and built word by word as they are said; labels and
   counters stay as visual extras. The voice sets the length: re-time the picture around it (see
   `films/2026-10-13-where-your-dog-sleeps/vo.py`: one take per section, key moments landing on their words) rather
   than squeezing the voice. Voice: ElevenLabs "Jessica" (needs `ELEVENLABS_API_KEY` in the environment), with
   music made for each film, sitting quietly in the background (owner, 2026-10-14: not the same instrumental every
   time, a similar vibe; never overbearing, just there and pleasing to hear), and soft synced foley. Cards centred at y 1440.
8. **Make it personal:** "your dog", "you", never "dogs in general" in the hook.
9. **Shareable truth:** one line a viewer would send to a friend ("They literally evolved eyebrows for you.").
10. **No bait we can't pay off.** If the hook promises a meaning, the film delivers it.
11. **Tell a story, explain every item (owner, 2026-10-16, on the poop chart).** A list of labels ("Number 1. Too
    dry.") reads as monotonous and teaches nothing. Every film needs:
    - **A promise in the hook**, not a statement: "Here's what your dog's poop actually means." beats "Your dog's poop
      is talking to you."
    - **One through-line** that explains every item, so it plays as a story with a reveal (the poop chart: it is all
      about water and time in the gut; too fast is soft, too slow is dry, just right is the goal).
    - **For every item: what it looks like, what it means, why it happens and what usually causes it**, in plain
      words. If two items are grouped, say how they differ ("A four is a soggy log. A five comes out in piles.").
    - Answer the questions a viewer would ask next ("Is it bad? Why? What causes it?"). If a script line only names
      or labels something, it is not finished.
    Depth beats brevity: lengths are guides, not rules (owner, 2026-10-16). Any film may run up to **90 s** when the
    extra time is real information, not padding.
12. **It must work with your eyes shut: one continuous story, not points after points (owner, 2026-10-17, on the
    haze film).** Listen to the voice alone, no picture, no captions: it should tell the whole story the way a friend
    would. So:
    - **Bridge every section.** Each one starts by saying why we're moving on ("So that's where it shows up…",
      "Some dogs feel it more than others…", "So outside…", "And at home…"). Never jump straight into the next list.
    - **Say what a list is before you list it.** "Here's how it affects your dog" comes before the signs; the signs
      are never just read out.
    - **Give the reason with the advice** ("Running makes them breathe harder, and pull in more haze."), in the same
      breath, not on a label.
    - **Stickers and labels repeat the voice; they never carry information the voice doesn't say.**
    - **The product comes in as the natural answer to the last point** (less exercise → small treats → no new foods
      this week → single-ingredient keeps it simple), never as a pitch. Inside Your Dog may name "single-ingredient
      treats" and the brand line; it doesn't list our proteins or sell.
    - Read the whole script aloud as one paragraph before building. If a line only makes sense with the picture, rewrite it.

## 3. Hook formulas (pick one per film, rotate them)

- **"Here's what your dog's X actually means."** (owner's preferred style of promise, 2026-10-16)
- **"If your dog does X, this is what it means."**
- **"Your dog isn't X. It's Y."** (the approved Inside Your Dog opener: "Your dog isn't itchy because of fleas.")
- **"Stop doing X."** / **"Never give your dog X."** (safety topics)
- **"You've been reading your dog wrong."**
- **"Where your dog [sleeps / sits / lies] says a lot about you."**
- **"Dogs can do X. Yours does it every day."** (hidden superpower)
- **"Myth: X. Truth: Y."** (myth-busting)
- **"4 signs your dog [trusts you / is stressed / is bored]."**
- **"The real reason your dog X."**

## 4. Facts, claims and tone

- **Dog Decoded: light sourcing (owner, 2026-10-13).** Popular dog-behaviour lore is fine when framed as "can mean" /
  "often"; no deep verification needed. Still no health or medical claims, and anything about food safety or
  toxicity must be right (check it).
- **Inside Your Dog:** every fact or number on screen needs a reputable source (peer-reviewed paper, a vet school, AKC, RSPCA, ASPCA,
  WSAVA, BSAVA, Merck Veterinary Manual) listed in the film's `CREDITS.md` and in `PRODUCTION.md`. Find and read it
  before writing the line (web search). If a claim can't be sourced, cut it or pick another idea.
- "What it means" topics (sleeping spots, leaning, tail wags) are interpretations: write them as "can mean",
  "often", "many behaviourists read it as", never as diagnosis.
- **No invented health claims.** Supplements "help" and "support"; nothing cures or treats. No medical advice beyond
  "talk to your vet".
- Copy rules: British spelling, short sentences, no em dashes, never "pet parents", "pawrents" or "cheap".
- Tone: warm, wry, premium. Never cutesy, never clinical. Bodily-function humour is fine if drawn with restraint.
- Safety topics (toxic foods, heat) are welcome in Dog Decoded: they are shared widely. Keep them calm, not scary.

## 5. Visual grammar for the series

- **Miya is the star of every film.** Use `characters/miya/miya.js` only. If an idea needs a pose she doesn't have
  (sleeping curled, belly-up, leaning, head tilt, play bow), add it to the module and the model sheet, show the new
  pose on the night's boards, and flag it in the night summary. Never redraw her. Ideas that need many other dogs
  are drawn as simple silhouettes or skipped.
- Inside-the-body scenes reuse the Inside Your Dog cast (`films/2026-10-13-inside-your-dog-food-allergy/js/cast.js`):
  cells, gut, brain, labels, caption cards. That film is the reference implementation: copy its structure
  (exposure sheet, captions, labels, crossfades, smear helpers, end card).
- A recurring look per series builds recognition: Dog Decoded opens on Miya on cream paper with the hook in Fraunces;
  Inside Your Dog dives "inside" to navy.
- Sound (owner, 2026-10-14): **voiceover + background music + soft foley** (bible §5).
  - Voice on top: warm, bright, playful, conversational (ElevenLabs "Jessica").
  - Music: a **new instrumental for each film**, written in that film's `audio.py`, in the same family as the first one
    (`films/2026-10-13-where-your-dog-sleeps/audio.py`: ukulele, pizzicato, glockenspiel, D major, ≈ 92–95 bpm, landing
    a short happy resolve on the hero beat). Vary the key, tempo, chords, melody and lead instrument from film to film
    (ukulele, nylon guitar, soft piano, harp, light vibraphone or glockenspiel, pizzicato or upright bass, brushed
    percussion at most) so it never sounds like the same track, but keep the vibe: gentle, warm, light, a little
    playful, pleasing on loop.
  - Background, never overbearing: music sits 12 LU under the voice (a quarter of its volume; `level` on the music
    group), sparse arrangement, nothing busy under the words, no drops or big builds; it may swell a touch on the
    hero beat and rest where the voice rests.
  - Master −14 LUFS, true peak ≤ −2 dBTP on the muxed mp4.

## 6. Delivery (what the owner gets)

- **21:46 SGT, pitch:** a ranked list of 3–5 ideas for the night's series (`routines/pitch.md`). The owner replies
  with a number before **22:30**; no reply means the top pick.
- **On the pick, or at the 22:30 cut-off:** the script with sources and whole-film key-frame boards (`routines/build.md`), sent
  in that session. The owner may reply with notes or "skip" until **05:30**.
- **08:28 SGT, render:** the rendered film (viewing copy under 30 MB), the soundtrack WAV and the voiceover stem, the reviewer's scores
  and what changed in the one revision, plus a suggested post caption with 3–5 hashtags.

## 7. Measuring and learning

After posting, the owner can drop numbers into `LOG.md` (views, average watch %, shares, saves). The night run reads
the log and leans towards what worked: hook formulas, topics and lengths with the best average watch %.
