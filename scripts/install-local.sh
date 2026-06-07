#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE="$REPO_ROOT/.agents/skills"
DESTINATION="${1:-${CODEX_HOME:-$HOME/.codex}/skills}"

if [ ! -d "$SOURCE" ]; then
  echo "Skills source not found: $SOURCE" >&2
  exit 1
fi

mkdir -p "$DESTINATION"

node "$REPO_ROOT/scripts/validate-skills.js"
node "$REPO_ROOT/scripts/validate-fixtures.js"
node "$REPO_ROOT/scripts/validate-actual-outputs.js"
node "$REPO_ROOT/scripts/validate-continuity.js"
node "$REPO_ROOT/scripts/validate-cli.js"

for skill_path in "$SOURCE"/*; do
  [ -d "$skill_path" ] || continue
  skill_name="$(basename "$skill_path")"
  rm -rf "$DESTINATION/$skill_name"
  cp -R "$skill_path" "$DESTINATION/$skill_name"
  echo "Installed $skill_name -> $DESTINATION/$skill_name"
done

echo "PortalUP Stack Codex skills installed in $DESTINATION"
node "$REPO_ROOT/scripts/doctor.js"
