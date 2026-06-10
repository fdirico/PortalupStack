---
name: portalup-spec
description: Spec-driven development for PortalUP. Converts a vague request into a precise executable specification through 5 phases before any planning or coding begins. Produces docs/<topic>-spec.md consumed by portalup-autoplan.
---

# PortalUP Spec

## Use

Turn vague intent into a precise, executable specification before planning or coding begins.

This is spec-driven development: the spec is the contract. Planning and implementation happen only after the spec is confirmed. This prevents building the right solution to the wrong problem.

Use for new modules, new screens, integrations, or any feature where the "what" is not yet locked.

Do not use for single-file bug fixes, config changes, or tasks where the scope is already fully locked.

Do NOT produce a spec after the first message. Always start with Phase 1. Do NOT propose implementation during this skill.

## Workflow

Five phases in order. No skipping.

### Phase 1 — Understand the Why

Ask until all five are answered:
1. **Who** is affected? (user role, automated system, internal team)
2. **What** is the current behavior? (verified, not assumed)
3. **What** should the behavior be instead?
4. **Why now?** (blocking work, costing money, correctness bug, business requirement)
5. **How will we know it is done?** (observable, measurable — not vibes)

Do not proceed until all five are locked.

### Phase 2 — Scope and Boundaries

Ask until all five are answered:
1. **What is explicitly out of scope?** Lock early — prevents creep.
2. **What existing systems does this touch?** (tables, endpoints, services, components)
3. **Are there ordering constraints?** (must A happen before B?)
4. **What is the smallest version that delivers the value?** Always find the MVP cut.
5. **What are the failure modes?** (what breaks if shipped wrong, rollback options)

Do not proceed until scope is locked.

### Phase 3 — Technical Interrogation

**HARD RULE: read code before asking.** Before any Phase 3 question, read at least one piece of evidence from the codebase. Find the relevant file, table, component, or endpoint — do not ask "what file should I look at?" first.

- If a concrete file or symbol is mentioned: read it, cite `path:line`.
- If domain-level request: read the relevant module directory and any existing `docs/<topic>.md`. State what you found before asking.
- If greenfield: say so explicitly after searching.

Ask about each applicable category:
- **Data model** — tables, columns, migrations, indexes; existing tables to reuse
- **API** — endpoints, request/response shape, auth, backwards compatibility
- **Permissions (RBAC)** — existing permissions to reuse vs new ones; always prefer reuse
- **UI/UX** — screens, components, navigation, empty/error/loading states, responsive rules
- **Testing** — how to test at each layer; existing test patterns in the project
- **Export/data output** — format, injection risks, size limits

Do not ask questions answerable by reading the code.

### Phase 4 — Draft Review

Present the full draft spec. Ask: "Does this accurately capture what you want? What did I get wrong?"

Iterate until the user explicitly confirms. Do not move to Phase 5 on silence.

### Phase 5 — Produce the Spec Document

Save the confirmed spec as `docs/<topic>-spec.md`. This document feeds into `$portalup-autoplan`.

## Output

```markdown
# Spec: <feature title>

## Context
- Date: <YYYY-MM-DD>
- Status: confirmed

## Problem
<What is happening now and why it is a problem. Verified, not assumed.>

## Goal
<What must be true when done. Observable and measurable.>

## Out of scope
<Explicit list.>

## Systems touched
<Tables, endpoints, services, components — with file paths where known.>

## MVP definition
<Smallest version that delivers the core value.>

## Functional requirements
1. <Each requirement is verifiable — passes or fails.>

## Data model
<New tables/columns. Existing tables reused. Migrations required: yes/no.>

## API contract
<New endpoints: method, path, request, response, auth.>

## Permissions
<Existing permissions reused: list. New permission: name + justification.>

## UI/UX requirements
<Screens, components, navigation, empty/error/loading states, responsive rules.>

## Test strategy
<Mandatory: happy path + failure path + one edge case per endpoint or function.>

## Export/output security
<Injection protection approach, or "no export output".>

## Failure modes and rollback
<What breaks if shipped wrong. How to roll back.>

## Open questions
<Unresolved items. Must be empty before portalup-autoplan runs.>
```

## Checklist

- Phase 1 completed: all five "why" questions answered without hand-waving.
- Phase 2 completed: scope locked, out-of-scope explicit, failure modes named.
- Phase 3 completed: at least one codebase file read before asking technical questions.
- Draft confirmed by user before Phase 5.
- `docs/<topic>-spec.md` saved and ready for `$portalup-autoplan`.
- Permissions: existing RBAC checked before proposing new ones.
- Tests: strategy section is mandatory — "to be determined" is not acceptable.
- Open questions section is empty or all items resolved.
- Implementation has NOT started — spec only.
