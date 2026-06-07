# GStack Investigate Method Adaptation

Source: GStack `investigate/SKILL.md`, MIT license.

## Iron Law

No fix without root-cause investigation first.

## Phases

1. Root-cause investigation: symptoms, code path, recent changes, reproduction, prior history.
2. Pattern analysis: race, null propagation, state corruption, integration failure, config drift, stale cache.
3. Hypothesis testing: prove or disprove before writing code.
4. Implementation: smallest root-cause fix, regression test, full verification.
5. Report: symptom, root cause, fix, evidence, regression test, related risks, status.

## Stop Conditions

- Three failed hypotheses: stop and escalate or instrument.
- Fix touches more than five files: ask before proceeding.
- Cannot reproduce or verify: mark concern instead of claiming success.

## PortalUP Additions

- For incidents, include client impact, affected tenant/project, operational workaround, and customer-safe message.
- For FileNet/RPA/SQL/AWS, route to domain-specific validation steps.

