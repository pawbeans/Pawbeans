#!/usr/bin/env bash
# Rebuild the BEANS motion stack in a fresh environment.
# Skills (HyperFrames, Remotion, beans-motion) are committed under .claude/skills/.
# Needs: Node >= 22, Python >= 3.10, FFmpeg.
set -euo pipefail
cd "$(dirname "$0")/.."

# HyperFrames: headless Chrome for local rendering
npx -y hyperframes@latest browser ensure
npx -y hyperframes@latest doctor || true

# OpenMontage (production pipeline, AGPL-3.0, kept out of this repo)
if [ ! -d OpenMontage ]; then
  git clone https://github.com/calesthio/OpenMontage.git
fi
(cd OpenMontage && make setup)
echo "Add API keys to OpenMontage/.env (never commit it). Activate with: source OpenMontage/.venv/bin/activate"
