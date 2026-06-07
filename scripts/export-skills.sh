#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT_DIR="${1:-$REPO_ROOT/dist}"

node "$REPO_ROOT/scripts/validate-skills.js"
node "$REPO_ROOT/scripts/validate-fixtures.js"
node "$REPO_ROOT/scripts/validate-actual-outputs.js"

mkdir -p "$OUT_DIR"
tar -czf "$OUT_DIR/portalup-stack-codex-skills.tar.gz" -C "$REPO_ROOT" .agents templates docs README.md AGENTS.md
echo "Exported $OUT_DIR/portalup-stack-codex-skills.tar.gz"
