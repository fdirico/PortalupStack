# AGENTS.md

## Project

PortalUP Stack Codex adapts the useful GStack methodology to Codex skills and adds PortalUP-specific delivery workflows.

## Current Goal

Build MVP `v0.1.0`:

- Codex-compatible skill structure under `.agents/skills`.
- Core skills: review, QA, ship, CSO, document generation.
- GStack-aligned workflow skills: QA-only, plan eng review, plan CEO review, document release, autoplan, investigate, careful.
- PortalUP skills: FileNet, RPA, SQL, commercial proposal, incident support.
- Local installers and validators.
- Tracking documentation and knowledge base.

## Working Rules

- Keep skills concise and action-oriented.
- Do not add Claude-only commands or mandatory Claude references.
- Prefer Codex invocation with `$portalup-skill-name`.
- Treat `vendor/gstack` as read-only upstream reference and do not commit it.
- Document every meaningful change in `docs/seguimiento-agentes.md`.
- Keep user-facing usage guidance in `docs/base-conocimiento.md`.
- Validate skills with `node scripts/validate-skills.js` before handoff.
- Follow `docs/professional-delivery-standard.md` for client-grade architecture, code, QA, security, UI, and delivery work.
- Challenge under-specified or weak requests instead of implementing guesses that would produce mediocre software.
- Prefer durable root-cause fixes over cosmetic patches or warning suppression.

## Commands

```powershell
node scripts\validate-skills.js
.\scripts\install-local.ps1
```

```bash
node scripts/validate-skills.js
./scripts/install-local.sh
```

## Definition of Done for a Skill

- Has valid `SKILL.md` frontmatter with `name` and `description`.
- States when to use and when not to use it.
- Defines workflow, output format, severity or scoring criteria, and checklist.
- Avoids Claude-only assumptions.
- Has at least one realistic fixture or example.
- Passes `scripts/validate-skills.js`.
