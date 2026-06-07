---
name: portalup-ship
description: Release readiness and shipping checklist for PortalUP deployments, PRs, hotfixes, migrations, and production changes. Use when preparing to merge, deploy, publish release notes, verify rollback, or assess go/no-go.
---

# PortalUP Ship

## Use

Use this skill before a release, deploy, hotfix, or merge that changes production behavior.

Do not use it for early brainstorming; use planning or review first.

## Workflow

1. Confirm scope and target environment.
2. For any real release or PR, read `references/gstack-ship-method.md`.
3. Run release gates: pre-flight, tests, prompt/eval impact, review readiness, documentation, changelog/PR body, verification, rollback.
4. Triage test failures by ownership: in-branch, pre-existing, flaky, or environment.
5. Identify release blockers.
6. Draft release notes and go/no-go decision.

## Output

```text
Go/no-go: go | go with caveats | no-go

Release scope
- ...

Readiness checklist
| Area | Status | Notes |

Blockers
- ...

Environment variables and secrets
- ...

Migration and data notes
- ...

Rollback plan
- ...

Release notes
- ...
```

## Status

- Ready: verified and no action required.
- Needs work: action required but not blocking if accepted.
- Blocked: must fix before release.
- Unknown: missing evidence.

## Checklist

- Tests passed or gaps are documented.
- Test failures are classified by ownership.
- Required env vars are listed.
- Migrations and seeds are accounted for.
- Rollback path is possible.
- Monitoring and smoke checks are defined.
- Release notes are clear for technical and business stakeholders.

## References

- `references/gstack-ship-method.md`: adapted GStack ship gates, test triage, PR/release documentation, and PortalUP release additions.
