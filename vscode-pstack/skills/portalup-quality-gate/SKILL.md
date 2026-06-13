---
name: portalup-quality-gate
description: Professional quality gate for PortalUP applications, codebases, pull requests, and releases. Use when asked for Sonar-like controls, maintainability review, static-analysis thinking, architecture/code quality validation, technical debt detection, or robust remediation planning.
---

# PortalUP Quality Gate

## Use

Use this skill to evaluate whether an application or change meets professional engineering standards. Focus on durable quality, root-cause fixes, maintainability, architecture, testing, security, performance, and operational readiness.

Do not use it as a generic summary. If code must be changed, pair with `$portalup-review`, `$portalup-plan-eng-review`, `$portalup-cso`, or a domain skill.

## Workflow

1. Define scope: repo, module, PR, branch, release, or described application.
2. Read `references/professional-quality-gate.md` for broad audits or client-grade delivery checks.
3. Identify evidence available: build, lint, typecheck, tests, static tools, dependency scan, logs, architecture docs, UI screenshots.
4. Run or recommend real validations; classify missing evidence as unknown, not passed.
5. Inspect quality dimensions: architecture, maintainability, complexity, duplication, contracts, validation, security, tests, observability, performance, UX risk, deployment.
6. Separate root causes from symptoms.
7. Produce a gate decision and remediation plan with verification steps.

## Output

```text
Quality gate: pass | pass with conditions | fail

Scope and evidence
- ...

Scorecard
| Area | Status | Evidence | Required action |

Findings
- [Severity] Area/file: issue, impact, root cause, permanent fix.

Required controls
- Build:
- Lint/static analysis:
- Typecheck:
- Tests:
- Security/dependencies:
- Performance:
- UX/accessibility:

Remediation plan
- ...

Verification
- ...
```

## Checklist

- Evidence is named; unknowns are not treated as green.
- Root cause and permanent fix are explicit.
- Quality controls are mapped to commands or concrete checks.
- Findings include impact and validation path.
- Cosmetic fixes are rejected when the underlying design is weak.
- Architecture, code, tests, security, UX, and operations are considered when relevant.

## References

- `references/professional-quality-gate.md`: quality dimensions, Sonar-like controls, and remediation standard.
