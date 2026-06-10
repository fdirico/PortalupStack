# PortalUP Stack Codex

PortalUP Stack Codex is a Codex-compatible agent skill distribution inspired by the GStack working model and specialized for PortalUP delivery work: code review, QA, shipping, security, FileNet, RPA, SQL, incident support, commercial proposals, and solution architecture.

This repository is not a direct clone of GStack. It is a clean Codex adapter with PortalUP-specific workflows.

## MVP Contents

- `AGENTS.md`: operating instructions for AI agents working in this repo.
- `.agents/skills/`: Codex skills for the PortalUP Stack MVP.
- `docs/seguimiento-agentes.md`: continuity log and execution tracker.
- `docs/base-conocimiento.md`: product knowledge base and user guide.
- `scripts/validate-skills.js`: local skill contract validator.
- `scripts/validate-fixtures.js`: fixture and expected-output validator.
- `scripts/install-local.ps1` and `scripts/install-local.sh`: local skill installers.
- `templates/`: reusable output templates.
- `tests/fixtures/`: realistic test prompts for skill evaluation.
- `tests/expected-output/`: minimum acceptable answers for fixture review.
- `docs/context-ops-protocol.md`: operational token-saving, agent recycling, and handoff protocol.
- `docs/validacion-competitiva-gstack.md`: competitive validation against the original GStack model.
- `portalup.config.example.json`: example configuration for the future Multi-LLM runtime.
- `core/`: host-independent skill registry and adapter contracts.
- `scripts/generate-host-assets.js`: host package generator for Codex, Claude and Cursor assets.

## Quick Start

Validate the skill structure:

```powershell
node scripts\validate-skills.js
```

Validate fixtures and expected outputs:

```powershell
node scripts\validate-fixtures.js
```

Validate real fixture run evidence:

```powershell
node scripts\validate-actual-outputs.js
```

Validate continuity and handoff templates:

```powershell
node scripts\validate-continuity.js
```

Validate Multi-LLM runtime contract:

```powershell
node scripts\validate-runtime.js
```

Run all validations:

```powershell
node scripts\validate-all.js
node scripts\doctor.js
```

Use the prompt helper CLI:

```powershell
.\scripts\pstack.ps1 ask "Tengo un incidente FileNet en produccion y necesito continuidad para otro agente."
.\scripts\pstack.ps1 compact "Resumen largo que debe reciclarse."
.\scripts\pstack.ps1 handoff "Pasar de orquestador a especialista SQL."
.\scripts\pstack.ps1 continue "outputs/sessions/2026-06-07-tema.md"
node scripts\pstack.js engine
node scripts\pstack.js runtime
node scripts\pstack.js package codex
```

Generate host assets:

```powershell
node scripts\generate-host-assets.js --engine codex --dry-run
node scripts\generate-host-assets.js --engine codex --write
node scripts\generate-host-assets.js --engine claude --write
node scripts\generate-host-assets.js --engine cursor --write
```

Claude Code package output uses project Skills under:

```text
dist/host-assets/claude/.claude/skills
```

Install into a Claude Code project:

```powershell
.\scripts\install-claude-project.ps1 "D:\ruta\de\tu-proyecto" -DryRun
.\scripts\install-claude-project.ps1 "D:\ruta\de\tu-proyecto" -Force
```

Install locally on Windows:

```powershell
.\scripts\install-local.ps1
```

Install locally on Linux/macOS:

```bash
./scripts/install-local.sh
```

After installation, invoke skills in Codex with names such as:

- `$portalup-review`
- `$portalup-orchestrator`
- `$portalup-qa`
- `$portalup-qa-only`
- `$portalup-quality-gate`
- `$portalup-ui-modernization`
- `$portalup-ship`
- `$portalup-plan-eng-review`
- `$portalup-plan-ceo-review`
- `$portalup-arquitecto-experto`
- `$portalup-comercial-experto`
- `$portalup-marketing-experto`
- `$portalup-filenet-review`
- `$portalup-bpm-review`
- `$portalup-aws-backup-review`
- `$portalup-arquitectura-solucion`
- `$portalup-propuesta-comercial`

## GStack Source

This project now tracks GStack as a local, ignored discovery source under `vendor/gstack`.

- Source repo: `https://github.com/garrytan/gstack.git`
- Analyzed commit: `476b0ec59741fd69e4151ebee363a432d2b5c497`
- License: MIT

## Version

Current release: `v0.2.0`.

Current workstream: Multi-LLM runtime foundation and preparation for host adapters beyond Codex.
