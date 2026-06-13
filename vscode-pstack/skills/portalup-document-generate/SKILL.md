---
name: portalup-document-generate
description: Generate PortalUP technical documentation, functional documentation, runbooks, installation guides, operation manuals, release notes, and handoff docs. Use when asked to document how something works or how to operate it.
---

# PortalUP Document Generate

## Use

Use this skill to create documentation that another engineer, operator, consultant, or customer can use.

Do not use it to invent missing implementation details; mark unknowns and assumptions.

## Workflow

1. Identify audience: engineer, operator, customer, executive, support.
2. Read `references/gstack-document-method.md` for Diataxis and research-first guidance.
3. Identify document type: tutorial, how-to, reference, explanation, runbook, release note, or handoff.
4. Research the target before writing: structure, implementation, tests, config, dependencies, edge cases.
5. Separate facts, assumptions, steps, risks, and references.
6. Produce a document with clear sections and maintenance notes.

## Output

```text
Document type:
Audience:
Status: draft | validated | requires review

Summary

Scope

Prerequisites

Procedure or architecture

Validation

Troubleshooting

Risks and limitations

Change log
```

## Checklist

- Include prerequisites.
- Include exact commands only when known.
- Include validation and rollback where relevant.
- Avoid unexplained acronyms for customer-facing docs.
- Add owner and last-updated when requested.

## References

- `references/gstack-document-method.md`: adapted GStack Diataxis documentation workflow.
