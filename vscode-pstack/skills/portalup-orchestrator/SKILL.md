---
name: portalup-orchestrator
description: Autonomous PortalUP task interpreter and specialist router. Use when the user describes a need in natural language and Codex must infer intent, domain, risk, stage, select PortalUP specialists, manage context, and produce continuity handoffs without requiring the user to name a skill.
---

# PortalUP Orchestrator

## Use

Use this skill when the user describes a goal, problem, change, opportunity, incident, proposal, architecture, release, or support need without naming a specific skill.

Also use it when multiple PortalUP specialists may be relevant and the user needs a consolidated plan instead of separate independent answers.

Do not use it to bypass safety. If the request involves destructive actions, production impact, credentials, migrations, force pushes, or secrets, route through `$portalup-careful` and stop before execution when confirmation is required.

## Project Management Commands

These commands are recognized in natural language. The Orchestrator handles them directly before routing to any specialist.

### `crear proyecto [nombre]`

Creates a new project at `~/.portalup/projects/[nombre]/`:
- `project.md` — living document (use `templates/project-living-doc.md`)
- `sessions/` — directory for session continuity files

The project name is normalized to lowercase with hyphens (e.g., "Mi Proyecto AA1" → `mi-proyecto-aa1`).

### `continuar proyecto [nombre]`

1. Reads `~/.portalup/projects/[nombre]/project.md`.
2. Injects the full content as context under `## Active Project` before processing the user's request.
3. Determines the next session number: reads `sessions/` directory, counts existing files, assigns `YYYYMMDD-N`.
4. Announces: "Retomando proyecto [nombre] — sesión [YYYYMMDD-N]."

### `actualizar proyecto` (or triggered automatically — see rule below)

Updates `~/.portalup/projects/[nombre]/project.md` incrementally:
- Adds new decisions to `## Decisions`.
- Adds new facts to `## Facts`.
- Updates `## Current State` to reflect current understanding.
- Does NOT append a full session transcript — only distilled knowledge.

### `ver proyectos`

Lists all directories under `~/.portalup/projects/` with their name and last-modified date of `project.md`.

---

## Automatic project.md Update Rule

**This rule is mandatory whenever an active project is loaded.**

After every response that contains any of the following, immediately update `project.md`:
- A confirmed architectural or design decision.
- A fact discovered by reading code, logs, or external data.
- A constraint that changes what is possible.
- A risk that was previously unknown.
- A direction change (something previously planned is now deferred or cancelled).

A "response" qualifies if the user reads it and does not contradict it. Silence = implicit confirmation.

Do NOT update project.md for:
- Exploratory ideas that were not confirmed.
- Step-by-step implementation instructions (those belong in session files).
- Outputs the user rejected.

---

## Session Numbering

Sessions within a project are numbered as `YYYYMMDD-N` where N starts at 1 each day.
- Example: first session on 2026-06-12 → `20260612-1`; second → `20260612-2`.
- Session continuity files live at: `~/.portalup/projects/[nombre]/sessions/20260612-1.md`
- Use `templates/continuity-summary.md` for session file content.

When a user returns to an old session (e.g., "recordé algo de la sesión 2"):
- Do NOT re-open that session file as current.
- Load `project.md` (current state) + the specific session file mentioned (for that piece of context).
- Continue in the current session number.

---

## Workflow

1. Check if the user is issuing a project management command (`crear proyecto`, `continuar proyecto`, `actualizar proyecto`, `ver proyectos`). If yes, execute it before routing.
2. If a project is active (loaded via `continuar proyecto`), inject `project.md` content as context.
3. Interpret the user request in plain language.
4. Classify intent, stage, domain, risk, autonomy level, and missing information.
5. Read `references/routing-summary.md` when routing is not obvious.
6. Read `references/context-token-policy.md` for medium/large tasks or when multiple specialists are needed.
7. Select the minimum necessary specialists; always include `$portalup-ui-modernization` when any screen, component, menu, or layout is touched — this is not optional; include `$portalup-quality-gate` for client-grade readiness.
8. Decide whether to answer directly, produce a plan, or hand off to specialists.
9. Produce a consolidated output with next actions and continuity summary.
10. Apply the automatic project.md update rule if a project is active.
11. For long, risky, or multi-specialist work, create or update a session continuity file using `templates/continuity-summary.md`.
12. Before handing work to another specialist, use `templates/agent-handoff.md` to compress context.
13. Avoid loading every skill or repeating context unnecessarily.

---

## Output

```text
[Project: nombre | Session: YYYYMMDD-N]   ← only if a project is active

Intent detected
- ...

Stage
- idea | plan | implementation | correction | incident | review | release | documentation | commercial | marketing

Domain
- general | FileNet | RPA | BPM | SQL | AWS | security | architecture | quality | UI/UX | commercial | marketing

Risk
- low | medium | high | critical

Autonomy level
- assist | route | execute | ship

Specialists selected
- $portalup-...: reason

Execution plan
- ...

Context plan
- What to load:
- What to summarize:
- What to avoid:

Consolidated answer or next action
- ...

Continuity summary
- Objective:
- Facts:
- Decisions:
- Risks:
- Pending:
- Next agent instructions:

Persistent continuity
- Save needed: yes | no
- Session file: ~/.portalup/projects/[nombre]/sessions/YYYYMMDD-N.md
- Template: templates/continuity-summary.md

Project update
- project.md update needed: yes | no
- Fields to update: Decisions | Facts | Current State | Risks
```

---

## Checklist

- The user does not need to know skill names.
- Routing is based on intent, domain, stage, and risk.
- The fewest useful specialists are selected.
- High-risk work routes through `$portalup-careful`.
- Unknowns are visible and not invented.
- Under-specified professional work is challenged or clarified before implementation.
- New features, new modules, new screens, or vague requests always route through `$portalup-spec` FIRST, before `$portalup-autoplan`. Implementation never starts without a confirmed spec saved to `docs/<topic>-spec.md`.
- Any task touching a screen, component, menu, or layout always routes through `$portalup-ui-modernization`.
- New modules and multi-file features always use `$portalup-autoplan` and produce a `docs/<topic>-plan.md`.
- New modules must include tests — if the implementation plan has no test strategy, flag it as a blocker before coding starts.
- RBAC: before creating a new permission, state why an existing one cannot be reused.
- Export features: state the CSV/data injection protection approach.
- Context is minimized before specialist handoff.
- Output includes continuity for future agents.
- Long or multi-specialist tasks produce a persistent continuity recommendation.
- Handoffs use `templates/agent-handoff.md`.
- Session files use `templates/continuity-summary.md` and live under `~/.portalup/projects/[nombre]/sessions/`.
- If a project is active: apply automatic project.md update rule after every response.
- When returning to a prior session: load project.md + specific session file; do not reopen old session as current.

---

## References

- `references/routing-summary.md`: condensed routing rules for specialist selection.
- `references/context-token-policy.md`: context, token, handoff, and continuity policy.
- `templates/project-living-doc.md`: template for project.md living documents.
- `templates/continuity-summary.md`: template for session continuity files.
- `templates/agent-handoff.md`: template for cross-specialist handoffs.
