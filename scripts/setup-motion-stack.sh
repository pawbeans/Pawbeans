#!/usr/bin/env bash
# Rebuild the BEANS motion stack in a fresh environment (Node >= 22.12, Python 3.11/3.12, FFmpeg, Chromium).
# House route: mg-styles-15 cel/line-boil harness + lib/audio. Fallbacks: HyperFrames, Remotion, OpenMontage.
set -euo pipefail
cd "$(dirname "$0")/.."

# 1. mg-styles-15 (MIT): renderer, audio toolkit, style prompts. Kept out of git (2 GB with its films).
# BEANS_MINIMAL=1 (the daily routine): shallow clone without the 420 MB videos/ folder, and skip the fallbacks below.
if [ ! -d mg-styles-15 ]; then
  if [ "${BEANS_MINIMAL:-0}" = 1 ]; then
    git clone --depth 1 --filter=blob:none --no-checkout https://github.com/Vincentwei1021/mg-styles-15.git mg-styles-15
    (cd mg-styles-15 && git sparse-checkout set --no-cone '/*' '!/videos/' && git checkout)
  else
    git clone https://github.com/Vincentwei1021/mg-styles-15.git mg-styles-15
  fi
fi
(cd mg-styles-15 && npm install)
PY=$(command -v python3.12 || command -v python3.11)
[ -d mg-styles-15/.venv ] || "$PY" -m venv mg-styles-15/.venv
mg-styles-15/.venv/bin/pip install -q -r mg-styles-15/requirements.txt "rembg[cpu]==2.0.78"
ln -sfn .. mg-styles-15/beans   # serve this repo inside the harness root as /beans/...
# fonts the reference demo needs (OFL; raw.githubusercontent.com is reachable, github.com/raw is not)
R=https://raw.githubusercontent.com
F=mg-styles-15/assets/fonts; mkdir -p $F/latin/caveat $F/cjk/longcang $F/cjk/lxgwmarkergothic
[ -f $F/latin/caveat/Caveat-VF.ttf ] || curl -sSf -o $F/latin/caveat/Caveat-VF.ttf "$R/google/fonts/main/ofl/caveat/Caveat%5Bwght%5D.ttf"
[ -f $F/cjk/longcang/LongCang-Regular.ttf ] || curl -sSf -o $F/cjk/longcang/LongCang-Regular.ttf "$R/google/fonts/main/ofl/longcang/LongCang-Regular.ttf"
[ -f $F/cjk/lxgwmarkergothic/LXGWMarkerGothic-Regular.ttf ] || curl -sSf -o $F/cjk/lxgwmarkergothic/LXGWMarkerGothic-Regular.ttf "$R/lxgw/LxgwMarkerGothic/main/fonts/ttf/LXGWMarkerGothic-Regular.ttf"

if [ "${BEANS_MINIMAL:-0}" = 1 ]; then echo "Done (minimal). Render with scripts/cel-render.sh."; exit 0; fi
# 2. Fallback: HyperFrames headless Chrome
npx -y hyperframes@latest browser ensure || true

# 3. Fallback: OpenMontage (AGPL-3.0), kept out of git
[ -d OpenMontage ] || git clone https://github.com/calesthio/OpenMontage.git
(cd OpenMontage && make setup) || echo "OpenMontage setup failed (fallback only)"
echo "Done. Render with scripts/cel-render.sh (see .claude/skills/beans-motion/SKILL.md)."
