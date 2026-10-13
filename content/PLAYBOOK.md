# BEANS daily films: playbook

One new vertical film every day, made by two routines (`content/routines/`). This file says **what** to make and
**how to make it hook**. The motion bible (`.claude/skills/beans-motion/SKILL.md`) says how it must look and sound;
when they disagree, the bible wins on craft and brand, this file wins on content strategy.

## 1. The two series (alternate every day)

| | **Dog Decoded** (viral) | **Inside Your Dog** (BEANS) |
|---|---|---|
| Job | Reach. Hook anyone with a dog, earn follows, shares and saves. | Teach something real about the body, food or wellbeing that makes BEANS the obvious answer, without selling. |
| BEANS mention | **None.** No logo, no product, no beans.sg, no "novel protein" talk. Miya is the only brand signal. | Subtle. The insight leads; a product appears as a hero object only near the end; logo end card. |
| Topics | Behaviour, body language, senses, dog science, myths, "what it means when…" | Allergies, itch, gut, poops, skin and coat, joints, calm, nutrition, label reading, novel proteins |
| Length | **20–35 s** | **30–45 s** (up to 60 s for a deep explainer) |
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
7. **Captions carry the whole story** (there is no voiceover; the owner adds music). Max about 3.5 words per second,
   every card at least 1.5 s, cards centred at y 1440.
8. **Make it personal:** "your dog", "you", never "dogs in general" in the hook.
9. **Shareable truth:** one line a viewer would send to a friend ("They literally evolved eyebrows for you.").
10. **No bait we can't pay off.** If the hook promises a meaning, the film delivers it.

## 3. Hook formulas (pick one per film, rotate them)

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

- Every fact or number on screen needs a reputable source (peer-reviewed paper, a vet school, AKC, RSPCA, ASPCA,
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
- Sound: soft synced foley only (bible §5). No music.

## 6. Delivery (what the owner gets)

- **Night (about 21:45 SGT):** the concept (title, hook, beats, why it should travel), the script with sources, and
  whole-film key-frame boards, sent as files in the night session with a push notification. The owner may reply in
  that session before about 05:30 with notes or "skip".
- **Morning (about 05:50 SGT):** the rendered film (viewing copy under 30 MB), the SFX-only WAV, the reviewer's scores
  and what changed in the one revision, plus a suggested post caption with 3–5 hashtags.

## 7. Measuring and learning

After posting, the owner can drop numbers into `LOG.md` (views, average watch %, shares, saves). The night run reads
the log and leans towards what worked: hook formulas, topics and lengths with the best average watch %.
