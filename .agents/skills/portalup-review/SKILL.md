---
name: portalup-review
description: Code, architecture, security, test, deployment, and maintainability review for PortalUP work. Use when asked to review code, a pull request, a module, a diff, an implementation plan, or technical changes before merge or release.
---

# PortalUP Review

## Use

Use this skill to perform a senior engineering review. Prioritize defects, regressions, security risks, missing tests, deployment risks, and maintainability concerns.

Do not use it for generic writing, commercial proposals, or incident triage unless code review is the central task.

## Workflow

1. Identify scope: files, diff, module, branch, or described change.
2. If the review is broad, risky, or PR-like, read `references/gstack-review-method.md`.
3. Run the critical pass first: data safety, race conditions, trust boundaries, shell injection, enum/value completeness.
4. Run the informational pass: async/sync mixing, schema drift, prompt drift, completeness, time windows, type coercion, frontend and CI/CD risks.
5. Dispatch specialist thinking when relevant: security, testing, performance, data migration, API contract, red team.
6. Apply fix-first policy: separate mechanical fixes from decisions that require user input.
7. Produce a decision.

## Severity

- Critical: production outage, data corruption, auth bypass, exposed secrets, unsafe destructive action.
- High: likely functional regression, missing guard on sensitive flow, migration risk, broken public contract.
- Medium: edge-case defect, incomplete validation, weak test coverage, unclear operational behavior.
- Low: readability, naming, minor maintainability, documentation improvement.

## Output

```text
Decision: approve | approve with changes | reject

Executive summary
- ...

Findings
- [Severity] File/path or area: issue, impact, recommended fix.

Tests recommended
- ...

Deployment and rollback risks
- ...

Open questions
- ...
```

## Checklist

- Behavior matches requirements.
- Auth/authz and tenant boundaries are respected.
- Object-level authorization and direct object references are checked.
- Secrets are not logged, committed, or returned.
- SQL and shell execution use safe parameterization.
- New enums/statuses/types are traced through all consumers.
- LLM output is validated before persistence, fetches, or mailers.
- Errors are handled with useful telemetry.
- Migrations are reversible or have rollback notes.
- Tests cover happy path, failure path, and edge cases.
- Release risk is explicit.

## References

- `references/gstack-review-method.md`: adapted GStack review checklist and specialist lanes.
