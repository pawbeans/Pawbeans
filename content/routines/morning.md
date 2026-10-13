# Morning run: render, review, revise once, deliver (08:28 SGT)

You are a fresh cloud session. Last night's run left a film with whole-film key frames on the branch, under the
owner's standing approval (bible §14). Work end to end without asking questions.

## 0. Repo and setup
1. `git fetch origin claude/beans-motion-setup-9gt91i && git checkout -B claude/beans-motion-setup-9gt91i origin/claude/beans-motion-setup-9gt91i`
2. `BEANS_MINIMAL=1 scripts/setup-motion-stack.sh`
3. Read `.claude/skills/beans-motion/SKILL.md` and `content/PLAYBOOK.md` in full.

## 1. Find the film
- The pitch date is yesterday in Singapore (`TZ=Asia/Singapore date -d yesterday +%F`). Read
  `content/pitches/<pitch date>.md` and the matching top row of `content/LOG.md`: the film to render has status
  `key frames sent`. The owner's note cut-off was 05:30.
- Status `skipped`, or none found: tell the owner in one line (nothing rendered, why), and stop.
- Read its `PRODUCTION.md`, including any owner notes applied overnight. Render exactly that version.

## 2. Render v1
- `mg-styles-15/.venv/bin/python films/<slug>/audio.py`
- `scripts/cel-render.sh films/<slug> --noaudio --workers 4 --out $PWD/films/<slug>/out/picture.mp4`
- Mux and measure exactly as in the bible's render commands (§0). Spec: duration as scripted, 1080×1920, 24 fps,
  −16 LUFS ±1, TP ≤ −2 dBTP on the mp4, no black frames, no fallback fonts.

## 3. Review (separate reviewer) and revise once
- Spawn a subagent that did not make the film. Give it the mp4 path, the film folder, `content/PLAYBOOK.md`,
  `.claude/skills/beans-motion/SKILL.md` and `mg-styles-15/rubric.md`; ask for rubric scores and a prioritised fix
  list (critical / high / nice-to-have, timecodes, the code to change), focusing on motion problems stills can't
  show (pops, crossfade ghosts, flicker, reading time, safe zones, sync), retention (does the hook land in 1.5 s, does
  something change every 2 s, is the payoff clear) and copy rules. It must not edit files; it writes its review to
  the scratchpad and returns a summary.
- Apply every critical and high fix that doesn't change what the owner saw on the boards (content, order, copy).
  Re-render, re-measure, and check the transitions frame by frame. One revision only.

## 4. Deliver
- Viewing copy under 30 MB and the SFX-only WAV in `films/<slug>/review/` (commands in bible §0). These files are
  not committed (gitignored): send them.
- Send the owner: the film, the WAV, then a short message: title · the reviewer's scores · what changed in the
  revision · anything still weak · a suggested post caption (two short lines in the brand voice, British spelling,
  no em dashes) and 3–5 hashtags. Dog Decoded captions never mention BEANS.
- Update `PRODUCTION.md` (Gate 4: files, spec numbers, scores, changes) and the `LOG.md` row (status `delivered v2`,
  final length). Commit and push (rebase on conflict, own commits only). Attribution lines as configured.
- If anything failed (render crash, spec miss you couldn't fix), still send what you have and say plainly what failed.
