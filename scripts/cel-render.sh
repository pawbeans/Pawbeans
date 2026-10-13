#!/usr/bin/env bash
# Render a BEANS cel page with the mg-styles-15 harness.
#   scripts/cel-render.sh films/<slug> [--stills 0.5,2,4] [other render.mjs options]
#   scripts/cel-render.sh characters/miya/model-sheet --stills 0 --scale 1.5
# The harness serves mg-styles-15/ as its web root; mg-styles-15/beans is a symlink back to this repo,
# so our pages load as /beans/... and the shared engine's node_modules / fonts resolve.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$1"; shift
[ -e "$ROOT/mg-styles-15/beans" ] || ln -sfn .. "$ROOT/mg-styles-15/beans"
CHROME="${MG_CHROME:-$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome 2>/dev/null | head -1)}"
cd "$ROOT/mg-styles-15"
MG_CHROME="$CHROME" MG_GPU_ARGS="${MG_GPU_ARGS:---no-sandbox}" node harness/render.mjs "beans/$TARGET" "$@"
