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
- `$portalup-qa`
- `$portalup-qa-only`
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

Current release: `v0.1.0`.

Current workstream: autonomous orchestration and expert advisory skills.
