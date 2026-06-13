---
name: portalup-cso
description: Security review for PortalUP code, infrastructure, logs, secrets, authentication, authorization, SQL injection, dependencies, and deployment posture. Use when asked for CSO/security review or risk assessment.
---

# PortalUP CSO

## Use

Use this skill for security-first review. Treat exposed credentials, unsafe permissions, missing authz, and sensitive logs as primary concerns.

Do not use it for generic QA unless security is the main question.

## Workflow

1. Identify assets, actors, trust boundaries, and data sensitivity.
2. For broad audits, read `references/gstack-cso-method.md`.
3. Build architecture mental model and attack surface.
4. Check secrets, dependencies, CI/CD, infrastructure, webhooks, integrations, LLM/AI surfaces, OWASP, STRIDE, and data classification.
5. Actively verify findings before emitting them.
6. Rank risks by exploitability, confidence, and impact.
7. Recommend mitigations and validation.

## Output

```text
Security decision: acceptable | acceptable with mitigations | unacceptable

Threat summary
- ...

Findings
- [Severity] Area: risk, impact, evidence, mitigation.

Validation steps
- ...

Residual risk
- ...
```

## Severity

- Critical: active exploit path, credential leak, auth bypass, production data exposure.
- High: likely privilege escalation, tenant leak, SQL injection, unsafe public endpoint.
- Medium: weak validation, excessive permissions, dependency concern.
- Low: hardening, logging, documentation, defense-in-depth.

## Checklist

- No secrets in repo, logs, URLs, screenshots, or docs.
- Authenticated endpoints enforce permissions.
- Tenant/object boundaries are explicit.
- SQL uses parameters or safe query builders.
- Sensitive data is masked.
- Infrastructure has least privilege and rollback path.
- Findings cite evidence and confidence.

## References

- `references/gstack-cso-method.md`: adapted GStack CSO audit phases and verification gate.
