# GStack CSO Method Adaptation

Source: GStack `cso/SKILL.md`, MIT license.

## Audit Phases

1. Architecture mental model and stack detection.
2. Attack surface census.
3. Secrets archaeology.
4. Dependency and supply chain review.
5. CI/CD pipeline security.
6. Infrastructure shadow surface.
7. Webhook and integration audit.
8. LLM and AI security.
9. Skill/supply-chain audit.
10. OWASP Top 10.
11. STRIDE threat model.
12. Data classification.
13. False-positive filtering and active verification.
14. Findings report and remediation.

## Confidence Gate

Before emitting a finding, verify:

- The referenced file/field/function exists.
- The exploit path is plausible.
- The impact is stated.
- The mitigation is concrete.
- Confidence is calibrated.

## PortalUP Additions

- Check secrets in `.env`, screenshots, client docs, logs, and deployment scripts.
- Check tenant isolation and protected bootstrap/root users.
- Check database credentials and operational monitoring config encryption.
- Check AWS IAM, S3 encryption, retention, lifecycle, and restore permissions.

