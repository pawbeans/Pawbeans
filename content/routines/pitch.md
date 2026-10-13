# Pitch run: recommend ideas for the owner to choose (21:46 SGT)

You are a fresh cloud session. The owner reads your list on their phone and may reply in this session.

Timeline (Singapore time):
- **21:46** this run sends a ranked list of ideas. **Midnight is the cut-off** for the owner's pick.
- Owner replies with a pick before midnight → you (this session) build the film and its key frames right away
  (`content/routines/build.md`). Owner can then reply with notes on the boards until **05:30**.
- No reply by midnight → the 00:00 run builds the top-ranked option (`build.md`).
- **08:28** the morning run renders whatever has key frames (`morning.md`).

## 0. Repo and setup
1. Work only on branch `claude/beans-motion-setup-9gt91i`:
   `git fetch origin claude/beans-motion-setup-9gt91i && git checkout -B claude/beans-motion-setup-9gt91i origin/claude/beans-motion-setup-9gt91i`
2. Read in full: `.claude/skills/beans-motion/SKILL.md`, `content/PLAYBOOK.md`, `content/IDEAS.md`, `content/LOG.md`.
   (Set up the render stack only if the owner picks: `BEANS_MINIMAL=1 scripts/setup-motion-stack.sh`.)

## 1. Choose tonight's series
- The pitch date is today's date in Singapore: `TZ=Asia/Singapore date +%F`.
- A seasonal pin for the pitch date (or the next 2 days, if not yet made) wins; otherwise the series that is **not**
  in the top row of `LOG.md`. (2026-10-13, the first night: **Dog Decoded**.)
- If `content/pitches/<pitch date>.md` already exists, this is a re-run: re-send that list and stop.

## 2. Recommend 3–5 ideas
- From the unmade ideas of that series in `IDEAS.md`, plus at most one new idea of your own if it is stronger (add it
  to `IDEAS.md`). Rank them by hook strength, how well they suit Miya and the cel style, sourcing confidence, and
  what has worked in `LOG.md`.
- Inside Your Dog: quick-check the key fact of each with a web search. Dog Decoded: no checking needed at pitch time.
- Write `content/pitches/<pitch date>.md`:
  ```
  # Pitch <pitch date> · <series>
  Status: pitched            (pitched → chosen <n> by owner | auto-picked 1 at cut-off → building → key frames sent)
  1. <title> · <length>
     Hook: "<first line>"  ·  Format: <countdown / levels / timeline / split screen / myth vs truth>
     What it covers: each beat in one line (what Miya does + what the caption says), in order, best saved for last
     Ending: <question card / loop>  ·  Why it travels: <one line>  ·  New poses: <…>
  2. ...
  ```
- **Give real detail** (owner, 2026-10-13): not a full script, but enough that the owner can see the whole video in
  their head: every beat, the ending and the comment bait. One-liners were not enough.
- **Dog Decoded: light sourcing.** No deep verification at pitch time; well-known dog-behaviour lore framed as "can
  mean" is fine. Inside Your Dog keeps proper sources.
- Favour the "says something about you and your dog" vein (sleeping spots, greetings, love signs, begging, a day in
  their life): relatable, comment-bait endings. The owner found science-trivia pitches less appealing.
- Commit and push it (rebase on conflict, own commits only; attribution lines as configured).

## 3. Send
Send the owner one message: the series, then the numbered list in the detailed format above (mark your
recommendation ★), and: "Reply with a number (or your own idea) before midnight.
No reply by 12:00 am and I'll go with ★1. After you see the key frames you can send notes until 5:30 am; the film
renders at 8:28 am."

## 4. When the owner replies
- First `git pull` and read the pitch file's status. If it is no longer `pitched` (the midnight run already took
  over), tell the owner the cut-off has passed and that the 00:00 session is building ★1; they can reply in that
  session with notes until 05:30. Stop.
- Otherwise set `Status: chosen <n> by owner (<time>)`, commit and push immediately (this claims the film), then
  follow `content/routines/build.md` from step 0 to the end for that idea. You are now the build session: owner notes
  on the boards until 05:30 are handled here (build.md §6).
- A question or a request for different ideas: answer, send a fresh list if asked, and keep the same cut-off.
