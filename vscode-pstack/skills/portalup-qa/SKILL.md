---
name: portalup-qa
description: QA planning and acceptance coverage for PortalUP features, fixes, releases, user flows, integrations, and regression testing. Use when asked for test plans, positive/negative cases, edge cases, acceptance criteria, or validation strategy.
---

# PortalUP QA

## Use

Use this skill to design a practical QA plan. Focus on what must be verified, how to verify it, and what evidence proves success.

Do not use it as a code review replacement; use `$portalup-review` for implementation risk.

## Workflow

1. Capture feature scope and user roles.
2. If the task is a real QA pass or release gate, read `references/gstack-qa-method.md`.
3. Choose mode: quick, full, regression, or report-only.
4. Split tests by positive, negative, edge, visual, functional, UX, content, performance, console, accessibility, security, data, integration, and regression.
5. Define acceptance criteria and health score categories.
6. Add execution notes and required evidence.

## Output

```text
QA scope
- ...

Assumptions
- ...

Test cases
| ID | Type | Scenario | Steps | Expected result | Priority |

Regression focus
- ...

Acceptance criteria
- ...

Evidence required
- screenshots, logs, API responses, DB checks, etc.

Health score
| Category | Score | Evidence |
```

## Priority

- P0: blocks release or critical path.
- P1: high-value business or security path.
- P2: normal regression and usability.
- P3: optional polish or low-risk coverage.

## Checklist

- Include role/permission variations.
- Include invalid data and boundary values.
- Include browser/API/database evidence when relevant.
- Include rollback or post-release smoke checks.
- Avoid inventing requirements not provided; mark assumptions clearly.

## References

- `references/gstack-qa-method.md`: adapted GStack QA modes, taxonomy, report scoring, and PortalUP additions.
