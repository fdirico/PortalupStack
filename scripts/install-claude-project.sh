#!/usr/bin/env bash
set -euo pipefail

PROJECT_PATH="${1:-}"
DRY_RUN=""
FORCE=""

for arg in "${@:2}"; do
  case "$arg" in
    --dry-run) DRY_RUN="1" ;;
    --force) FORCE="1" ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$PROJECT_PATH" ]]; then
  echo "Usage: ./scripts/install-claude-project.sh /path/to/project [--dry-run] [--force]" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$PROJECT_PATH" && pwd)"
GENERATED_ROOT="$REPO_ROOT/dist/host-assets/claude"

if [[ "$PROJECT_ROOT" == "$REPO_ROOT" ]]; then
  echo "Refusing to install Claude project assets into the PortalUP Stack repository root." >&2
  exit 1
fi

echo "[portalup-stack] Generating Claude host assets..."
node "$REPO_ROOT/scripts/generate-host-assets.js" --engine claude --write

copy_item() {
  local source="$1"
  local target="$2"
  if [[ ! -e "$source" ]]; then
    echo "Missing generated source: $source" >&2
    exit 1
  fi
  if [[ "$DRY_RUN" == "1" ]]; then
    if [[ -e "$target" ]]; then
      echo "[portalup-stack] Would overwrite existing $target"
    else
      echo "[portalup-stack] Would copy $source -> $target"
    fi
    return
  fi
  if [[ -e "$target" && "$FORCE" != "1" ]]; then
    echo "Target already exists: $target. Re-run with --force to overwrite." >&2
    exit 1
  fi
  if [[ -e "$target" && "$FORCE" == "1" ]]; then
    rm -rf "$target"
  fi
  cp -R "$source" "$target"
  echo "[portalup-stack] Copied $(basename "$target")"
}

copy_item "$GENERATED_ROOT/CLAUDE.md" "$PROJECT_ROOT/CLAUDE.md"
copy_item "$GENERATED_ROOT/.claude" "$PROJECT_ROOT/.claude"
copy_item "$GENERATED_ROOT/templates" "$PROJECT_ROOT/templates"

echo "[portalup-stack] Claude project assets installed at $PROJECT_ROOT"
echo "[portalup-stack] Next: open Claude Code in that project and ask: Usa portalup-orchestrator. Necesito revisar esta aplicacion."
