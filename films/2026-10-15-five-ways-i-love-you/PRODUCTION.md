# Dog Decoded: 5 ways your dog says "I love you"

Series: Dog Decoded (no BEANS mention: no logo, product or URL). Idea D30, **auto-picked ★1 at the 22:30 cut-off** (no reply in the pitch session, 2026-10-15).
Hook formula: "4 signs your dog [trusts you…]" (numbered countdown, best saved for last). Length **43.67 s** (voice first, ElevenLabs Jessica), 1080×1920, 24 fps. Mood accent: blossom (Skin & Coat pastel, no product meaning).
Why it should travel: warm, every owner counts along, and "puppy eyes, evolved for you" is the line people send to a friend.

- [x] Gate 1: idea: auto-picked ★1 at the cut-off (2026-10-15 22:30)
- [x] Gate 2: script: routine: standing approval (owner 2026-10-13), overnight veto
- [x] Gate 3: key frames (re-timed to the ElevenLabs voice) → `review/2026-10-15-five-ways-i-love-you-keyframes-{a,b,c}.png`: routine: standing approval (owner 2026-10-13), overnight veto
- [x] Gate 4: rendered → reviewed (rubric) → revised once → shown (v2, 2026-10-15 night: the owner asked "render now" in the build session, so the 08:28 run has nothing to render for this film)
  - v1 spec: 43.67 s, 1048 frames, 1080×1920, 24 fps, H.264 + AAC 48 kHz, −14.0 LUFS, −2.6 dBTP (mp4), voice −22.0 / music −34.0 LUFS (stems, 12 LU), no black frames.
  - v1 rubric scores (separate reviewer): style 7 · concept 6 · motion 6 · design 7 · finish 6 · sound 7 · technical 8. No critical issues.
  - Revision 1 (v2), all seven high fixes, no content/copy/order change: lean puffs, twinkle and pressure ticks moved off her face to the paws and trousers; one smear frame on the trot (film frame, stretched back along her path, the sock inside the stretch; v1 strobed); the hero smear on the first film frame of the lift; a bigger brow lift (cap 1.6), orange lift ticks over the inner brows, punch-in to 1.45, the callout arrow on the brow; hearts moved clear of the payoff line; the sock falls from her mouth to the floor and she settles into the sit with a 2-drawing squash; the door swings open 70 px and stays open with a light wedge on the floor, her ears go up, a head tilt and bob on "everywhere". Nice-to-haves also done: tease head tilt + brow flick on "face" and a closer push; whooshes, the sock flop and the hero swish placed in film time so they peak on their frames; loop hearts already drifting on frame 0; shins moved clear of the right-hand UI.
  - Not done: the width snap when back-to-back cards change size (cast.js), "Wolves mostly don't." 1.42 s card, and the two board changes the reviewer suggested ("#5" instead of "5/5"; a bathroom sign): owner's call.
  - v2 spec: 43.67 s, 1048 frames, 1080×1920, 24 fps, −14.0 LUFS, −2.5 dBTP (master and viewing copy), no black frames. Master `out/five-ways-i-love-you-v2.mp4` (gitignored); viewing copy `review/five-ways-i-love-you-v2.mp4` (18 MB), `review/five-ways-i-love-you-v2-soundtrack.wav`, `review/five-ways-i-love-you-v2-stem-voiceover.wav` (sent, gitignored).

Pending / unapproved inputs in use: four NEW Miya poses (lean, carry, lookBack, face.lift brow raise), `review/miya-model-sheet-new-poses.png`. Voice: **ElevenLabs Jessica** (Multilingual v2), re-voiced 2026-10-15 night at the owner's request with the owner's key (kept outside the repo, never committed). All 14 takes match the script word for word; hook said at speed 0.88 ("like" 0.92); "five2" uses take seed +2 (a clear pause in "a hug, dog style"; the first take ran it together as "hugged dog"). Sync check: every line's voice onset is within 20 ms of its first caption word (voice-stem energy), each caption word builds one frame before it is spoken, and Whisper on the final mix hears the script word for word. One card is just under 1.5 s ("Wolves mostly don't.", 1.42 s, 3 words).
Sources (also in CREDITS.md): Kaminski et al. 2019, PNAS 116(29):14677, "Evolution of facial muscle anatomy in dogs" (https://pmc.ncbi.nlm.nih.gov/articles/PMC6642381/): the inner-brow raiser (LAOM) uniformly present in dogs, scant/irregular in wolves; selection by humans is the authors' hypothesis, so the film says "scientists think". Everything else: behaviour lore (Dog Decoded light sourcing).

## Voiceover (= captions, word for word)
Your dog says I love you. Like this. / Number five: they lean on you. / All of their weight. That's a hug, dog style. /
Number four: they follow you everywhere. / Yes, even there. / Number three: they bring you their favourite thing. /
Or your sock. Same energy. / Number two: on walks, they look back to check you're still there. /
And number one? It's written all over their face. / Number one: the puppy eyes. / Dogs have a tiny muscle that lifts
their eyebrows. Wolves mostly don't. / Scientists think it evolved for you. / How many does yours do? Tell us below.

Changes from the pitch text: "Four/Three/Two:" → "Number four/three/two:" (Kokoro's "Four" was heard as "before"); the
tease "They evolved it just for you" → "It's written all over their face" and the payoff "They literally evolved
eyebrows for you" → "Scientists think it evolved for you" / on screen "Puppy eyes, evolved for you." (the evolution
part is the authors' hypothesis, small samples, and a later study reportedly found the muscle in coyotes).

## Beat table (film seconds; exposure on 2s unless noted)
| Time | Picture | Text | Exposure / FX | Foley |
|---|---|---|---|---|
| 0–3.55 | Cover: Miya sits on a blossom rug looking up at you, hearts drift | Headline "Your dog says / I *love* you." pops out on "Like"; card "Like this." | whip out on 1s | rustle, pop |
| 3.55–9.65 | 5/5 THE LEAN: your shins; she tips her whole weight into them (on 1s, squash, puffs, twinkle, orange pressure ticks); punch-in on "hug" | pill + captions | lean and punch on 1s | fur rustle, soft thud, harp |
| 9.65–14.88 | 4/5 THE ESCORT: she sits outside a closed door with light under it; on "even" the door creaks open a crack, her ears flick up | pill + captions | creak on 1s, creak ticks | wooden creak |
| 14.88–20.94 | 3/5 THE GIFT: she trots in (on 1s, smear frame, speed lines) with a blossom-striped sock, drops it at your feet (bounce, squash, puffs), sits, tongue out; twinkle on "sock" | pill + captions | trot + drop on 1s | paws, cloth flop, harp |
| 20.94–25.78 | 2/5 THE CHECK-IN: walking on the lead past two trees; on "look" she turns her head back over her shoulder to you; hearts | pill + captions | look on 1s | steps, harp |
| 25.78–29.87 | Tease: she sits facing you, slow push-in | captions | | |
| 29.87–40.19 | 1/5 PUPPY EYES (hero, 70 %): blossom ground; on "puppy" the inner brows lift, eyes widen with a second glint: 1 smear frame (head stretched), punch-in, shake, speed lines, twinkle burst; "the brow muscle" callout with arrow; brows lift again on "eyebrows"; payoff "Puppy eyes, evolved *for you.*" replaces the pill | pill, callout, payoff + captions | lift on 1s | soft cinematic impact, harp run, music resolves (F) |
| 40.19–44.25 | Question card "How many does *yours* do? / Tell us below." over the cover; she settles back into the cover pose and the headline returns (seamless loop) | question card, headline | question on 3s | paper slide, pop |

Music: new instrumental in F major (soft piano broken chords, pizzicato bass, harp motif), ~90 bpm, resolving on the brow lift; 12 LU under the voice. Mix with the ElevenLabs voice: −14.0 LUFS, −2.7 dBTP (WAV). Previews: `review/*-soundtrack-preview.m4a`, `review/*-voiceover-preview.m4a`.

Notes: 2026-10-15 night, owner: "make sure vo is good and reads in line with captions" (ElevenLabs key supplied for this session). Applied as above; key frames re-rendered to the new 43.67 s timing.
