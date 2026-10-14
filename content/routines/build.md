# Build run: script and whole-film key frames (after the owner's pick, or at the 22:30 SGT cut-off)

Two ways in:
- **The pitch session**, after the owner replied with a pick before 22:30 (`pitch.md` §4). Skip §1's "pick" step:
  the idea is the one they chose (or their own idea).
- **The 22:30 cut-off run**, a fresh cloud session. Read `content/pitches/<pitch date>.md`, where the pitch date is
  **today** in Singapore (`TZ=Asia/Singapore date +%F`). Status `pitched` (no reply): set
  `Status: auto-picked 1 at cut-off`, commit and push at once, then build idea ★1. Any other status (the owner
  chose and that session is building, or it's done), or no pitch file: stop without messaging anyone.

Nobody is watching live; the owner reads your result on their phone and may reply in this session. Work end to end
without asking questions; where a decision is the owner's, make the safe choice and flag it in your summary.

## 0. Repo and setup
1. Work only on branch `claude/beans-motion-setup-9gt91i`:
   `git fetch origin claude/beans-motion-setup-9gt91i && git checkout -B claude/beans-motion-setup-9gt91i origin/claude/beans-motion-setup-9gt91i`
2. `BEANS_MINIMAL=1 scripts/setup-motion-stack.sh` (a few minutes on a fresh container).
3. Read, in full: `.claude/skills/beans-motion/SKILL.md`, `content/PLAYBOOK.md`, `content/IDEAS.md`, `content/LOG.md`.
   Then study the reference film `films/2026-10-13-inside-your-dog-food-allergy/` (`PRODUCTION.md`, `js/scene.js`,
   `js/cast.js`, `audio.py`, `boards.json`): reuse its structure and helpers.

## 1. The film
- Name it by the **pitch date**: `films/<pitch date>-<slug>/`. If it already exists with key frames sent, this is a
  re-run: re-send the summary and boards, then stop.
- Series and idea: from the pitch file (the owner's pick, or ★1 at the cut-off). Set the pitch file's status to
  `building`, and to `key frames sent` at the end.

## 2. Research and script
- Find and read a reputable source for every fact (web search; papers, vet schools, AKC, RSPCA, ASPCA, WSAVA, Merck).
  If a claim can't be sourced, cut it. If web access fails, keep to the sources named in `IDEAS.md`, mark them
  "unverified" in `CREDITS.md`, and flag it at the top of your summary.
- Write `films/<today>-<slug>/PRODUCTION.md` with: title, series, hook formula, the beat table (time, picture,
  captions, exposure 1s/2s/3s, cel FX, foley), why it should travel (one line), sources, and gates:
  Gate 1–3 "routine: standing approval (owner 2026-10-13), overnight veto"; Gate 4 open.
- Write the voiceover first (playbook §2.7): spoken, natural sentences that name each item; the captions are those
  exact words. Then copy rules (bible §5) and the playbook's retention rules (hook ≤ 1.5 s and ≤ 7 words, change every
  1.5–2.5 s, numbered structure where it fits, payoff at 70–85 %, loop or question ending).
- Dog Decoded: no BEANS mention anywhere (no logo, product, URL). Inside Your Dog: product near the end, logo end card.

## 3. Build
- `films/<today>-<slug>/`: `index.html`, `js/scene.js`, `js/cast.js` (copy only the helpers you need), `audio.py`
  (sound effects only, −16 LUFS, TP −2 dBTP, `avail()` samplers), `boards.json`, `CREDITS.md`, `PRODUCTION.md`.
- Follow the bible's §13 craft lessons from the start (paint every pixel, smear frames, fast moves on 1s, no overlays
  on impact frames, logo above the grain, labels clear of captions, captions centred at y 1440).
- Miya: import `characters/miya/miya.js`. A missing pose is added to the module and the model sheet without changing
  any existing pose; render the model sheet still and include it with the boards, flagged as NEW POSE.

## 4. Key frames (whole film)
- `scripts/cel-render.sh films/<slug> --stills $(mg-styles-15/.venv/bin/python scripts/keyframe-boards.py films/<slug> --times)`
- `mg-styles-15/.venv/bin/python scripts/keyframe-boards.py films/<slug>` → `films/<slug>/review/<slug>-keyframes-*.png`
- Look at every board yourself (Read the PNGs). Fix overlaps, stale pixels, safe-zone breaks, unreadable text,
  off-model Miya; re-render. At most two fix passes.

## 5. Save and send
- Commit the film folder, boards and hero stills (`git add -f films/<slug>/out/stills/<hero>.png`; other stills stay
  ignored), the `IDEAS.md` / `LOG.md` updates (new top row: date, series, idea, folder, status `key frames sent`,
  hook formula, length). Push (`git fetch` + `git rebase origin/claude/beans-motion-setup-9gt91i` on conflict; your own
  local commits only). End commit messages with the attribution lines your session is configured with.
- Send the boards (and any new-pose sheet) to the owner as files, then a short summary:
  series · title · the hook line · the beats in one line each · why it should travel · sources · flags
  (new pose, unverified sources, anything unusual; say if it was auto-picked at the cut-off) · "Reply here with
  notes or 'skip' before 5:30 am. Otherwise it renders at 8:28 am."

## 6. If the owner replies (until 05:30 SGT)
- Notes: apply them, re-render the affected stills and boards, send them again, record the notes in `PRODUCTION.md`,
  commit and push before 05:30 SGT. After 05:30, tell them the render has started and their notes go into the next
  version if they reply to the morning session.
- "skip": set the film's status to `skipped` in `PRODUCTION.md` and `LOG.md`, push, confirm in one line.
- Never render the video from this session; the morning run does it.
