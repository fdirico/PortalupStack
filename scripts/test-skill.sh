#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: scripts/test-skill.sh <skill-name>" >&2
  exit 1
fi

SKILL="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

test -f "$REPO_ROOT/.agents/skills/$SKILL/SKILL.md"
node "$REPO_ROOT/scripts/validate-skills.js"
node "$REPO_ROOT/scripts/validate-fixtures.js"
node "$REPO_ROOT/scripts/validate-actual-outputs.js"
echo "Fixture suggestions:"
find "$REPO_ROOT/tests/fixtures" -type f -name "*.md" | sort
