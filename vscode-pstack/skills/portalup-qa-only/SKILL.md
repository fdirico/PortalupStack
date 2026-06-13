---
name: portalup-qa-only
description: Report-only QA workflow adapted from GStack qa-only for PortalUP web apps, integrations, operational flows, and acceptance testing. Use when asked to test, inspect, or report bugs without changing code.
---

# PortalUP QA Only

## Use

Use this skill when QA should produce findings and evidence but must not edit files, fix code, commit, or deploy.

Do not use it when the user explicitly wants bugs fixed; use `$portalup-qa` for fix-loop QA.

## Workflow

1. Define target, mode, roles, and scope.
2. Build a test plan before exploring.
3. Exercise positive, negative, edge, accessibility, performance, and regression paths.
4. Record evidence and health score.
5. Report findings by severity with reproduction steps.

## Output

```text
QA-only report

Scope

Mode: quick | full | regression

Health score

Findings
- [Severity] Title
  Repro:
  Expected:
  Actual:
  Evidence:

Acceptance status

Recommended next actions
```

## Checklist

- No code changes.
- No commits.
- Evidence is concrete.
- Findings include repro steps.
- Unknowns and assumptions are explicit.

