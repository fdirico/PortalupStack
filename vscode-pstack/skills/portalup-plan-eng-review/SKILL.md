---
name: portalup-plan-eng-review
description: Engineering plan review adapted from GStack plan-eng-review. Use for PortalUP implementation plans, architecture decisions, data flow, edge cases, test strategy, dependencies, parallelization, and delivery risk before coding.
---

# PortalUP Plan Eng Review

## Use

Use this skill before implementation when a plan needs engineering scrutiny.

Do not use it for post-implementation code review; use `$portalup-review`.

## Workflow

1. Read the plan and identify modules, contracts, data flow, dependencies, and risk.
2. Challenge scope, hidden complexity, and under-specified requirements before coding.
3. Check edge cases, migrations, permissions, tests, observability, and rollback.
4. Identify parallel work lanes and merge conflict risks.
5. Produce a go/no-go plan review.

## Output

```text
Engineering decision: proceed | revise | block

Architecture assessment

Data flow and contracts

Edge cases

Test strategy

Quality gates and controls

Parallelization opportunities

Risks and mitigations

Required plan changes
```

## Checklist

- Scope is implementable.
- Contracts are explicit.
- Tests map to risk.
- Static checks, lint/typecheck, and quality gates are identified.
- Missing context is requested when assumptions would reduce product quality.
- Migration and rollback are considered.
- Work can be split safely if useful.
