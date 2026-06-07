---
name: portalup-document-release
description: Release documentation workflow adapted from GStack document-release. Use after shipping or before release to update changelog, README, guides, runbooks, API docs, operational notes, and user-facing documentation.
---

# PortalUP Document Release

## Use

Use this skill when a release or shipped change needs documentation updates.

Do not use it for first-draft documentation unrelated to a release; use `$portalup-document-generate`.

## Workflow

1. Identify shipped changes and affected audiences.
2. Read `references/gstack-document-release-method.md`.
3. Map blast radius across README, guides, runbooks, API docs, changelog, release notes, TODOs, and version files.
4. Build coverage map across reference/how-to/tutorial/explanation.
5. Update clear factual items; ask before narrative rewrites or version bumps.
6. Check cross-document consistency.
7. Produce a documentation release summary.

## Output

```text
Documentation release status: complete | needs edits | blocked

Changed behavior

Docs to update

Applied/proposed changes

Consistency checks

Release notes snippet

Open questions
```

## Checklist

- Changelog reflects the actual change.
- Operational docs cover setup, validation, and rollback.
- User-facing docs avoid internal jargon.
- Docs do not expose secrets.
- Unknowns are marked for review.

## References

- `references/gstack-document-release-method.md`: adapted GStack release documentation audit.
