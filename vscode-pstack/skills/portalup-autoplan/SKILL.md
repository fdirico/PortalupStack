---
name: portalup-autoplan
description: Multi-perspective planning workflow adapted from GStack autoplan. Use for PortalUP initiatives that need strategy, design, engineering, QA, security, delivery tasks, and approval gates before implementation.
---

# PortalUP Autoplan

## Use

Use this skill for larger initiatives where one review perspective is not enough.

Do not use it for small fixes or one-file changes.

Triggers: new module, new screen, new integration, architectural change, multi-file feature, any work touching both backend and frontend.

## Auto-decision principles

When making decisions without user input, apply these 6 principles in order:

1. **User value first** — choose the option that delivers more value to the end user.
2. **Production safety** — prefer the path that is safer to deploy and easier to roll back.
3. **Reuse over creation** — reuse existing permissions, components, and patterns before creating new ones.
4. **Tests are non-negotiable** — every new module ships with at least one happy-path and one failure-path test.
5. **Simplest correct solution** — reject over-engineering; 3 similar lines beat a premature abstraction.
6. **Escalate true blockers only** — surface only decisions where two options are genuinely equivalent or a real constraint is missing. Do not ask about implementation details resolvable from the codebase.

## Workflow

1. Capture request, context, constraints, and restore point.
2. **CEO/strategy review** with `$portalup-plan-ceo-review`: value, scope, business risk, deferred scope.
3. **Design review** with `$portalup-ui-modernization` (mandatory when any screen/component is touched): IA, visual system, layout, responsive behavior, component changes.
4. **Engineering review** with `$portalup-plan-eng-review`: data model, API contract, migrations, edge cases, parallelization, test strategy.
5. **Security review** with `$portalup-cso` when the feature involves auth, permissions, credentials, or external data.
6. Apply auto-decision principles to all non-blocking questions. Only surface decisions where two options are genuinely equivalent or a real constraint is missing.
7. Produce a **plan document** saved as `docs/<topic>-plan.md` with full decision audit trail.
8. Present a single approval gate with only the true blockers.

## Mandatory deliverables (non-negotiable)

- `docs/<topic>-plan.md` — plan document with decisions, findings, and implementation tasks.
- Test strategy section in the plan — at minimum: what to test, happy path + failure path + one edge case per new endpoint or service function.
- RBAC note — explicit statement of whether existing permissions are reused or a new one is created (and why).
- CSV/export security note — if the feature exports data, state the injection-protection approach.

## Output

```text
Autoplan status: approved | revise | blocked

Plan summary

CEO/Strategy findings

Design findings
- IA and layout decisions
- Visual system choices
- Component changes proposed

Engineering findings
- Data model and schema
- API contract
- Migration plan (or: no migration needed, reuses X)
- Test strategy (mandatory: happy path + failure path per endpoint)

Security findings (if applicable)

Decision audit trail
- [auto] Principle applied: decision made.
- [gate] Requires user input: options, recommendation.

Implementation tasks (ordered)

Deferred work (explicit, with reason)
```

## Checklist

- Design perspective ran for every task touching a screen or component.
- One decision per question; auto-decisions cite the principle used.
- Bigger scope is justified by value.
- Engineering plan is actionable.
- Tests are specified (not "recommended" — required for new modules).
- RBAC reuse evaluated before creating new permissions.
- Export/CSV security addressed if feature touches data export.
- Risks have owners or mitigations.
- Plan document saved to `docs/<topic>-plan.md`.
- Deferred work is explicit.

