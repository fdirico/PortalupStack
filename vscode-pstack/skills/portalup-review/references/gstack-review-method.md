# GStack Review Method Adaptation

Source: GStack `review/checklist.md` and `review/specialists/*`, MIT license.

## Core Pattern

Run review in two passes:

1. Critical pass: data safety, race conditions, trust boundaries, shell injection, enum/value completeness.
2. Informational pass: async/sync mistakes, field/schema drift, prompt drift, completeness gaps, time windows, type coercion, frontend inefficiencies, CI/CD distribution risk.

## Specialist Lanes

Use these lanes when the change is broad or risky:

- Security: auth/authz, IDOR, token expiry, SSRF, path traversal, XSS escape hatches, weak crypto, secrets exposure, unsafe deserialization.
- Testing: missing negative tests, boundary cases, isolation violations, flaky patterns, security enforcement tests, uncovered new public methods.
- Performance: N+1, large bundles, repeated O(n*m) work, unnecessary network calls.
- Data migration: irreversible changes, backfill risk, locks, rollback gaps.
- API contract: changed response shape, enum drift, backward compatibility.
- Red team: adversarial attempt to break the implemented behavior.

## Fix-First Policy

Auto-fix only mechanical, low-dispute issues. Ask before changes that affect security, user-visible behavior, race conditions, large fixes, enum semantics, or functionality removal.

## PortalUP Additions

- Always check tenant/client/project boundaries.
- Always check credential masking and field encryption in operational configs.
- For monitoring/runtime changes, check job duplication, queue state, retry behavior, and idempotency.
- For FileNet/RPA/SQL/AWS work, route to the domain skill if the diff includes domain behavior.

