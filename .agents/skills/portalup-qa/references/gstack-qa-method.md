# GStack QA Method Adaptation

Source: GStack `qa/` and `qa-only/`, MIT license.

## Modes

- Quick: critical/high issues only.
- Full: broad functional, UX, visual, performance, accessibility, console, and auth coverage.
- Regression: compare against a baseline and report fixed/new/delta.
- QA-only: report without changing code.
- QA: report, fix, re-test, and document evidence.

## Issue Taxonomy

- Visual/UI: layout, z-index, clipped text, broken images, theme problems.
- Functional: broken links, dead controls, validation, redirects, persistence, race conditions.
- UX: confusing navigation, missing loading, poor error messages, missing confirmations.
- Content: typos, stale text, placeholders, truncated text, wrong labels.
- Performance: slow loads, jank, layout shift, excessive requests, heavy assets.
- Console/errors: JS exceptions, failed requests, CORS, CSP, mixed content.
- Accessibility: labels, keyboard nav, focus traps, ARIA, contrast, screen reader reachability.

## Health Score

Score 0-100 across:

- Console
- Links
- Visual
- Functional
- UX
- Performance
- Accessibility

## PortalUP Additions

- Include role and permission variants.
- Include tenant/client/project context.
- For operational modules, verify runtime side effects and monitoring data.
- For FileNet/RPA/SQL/AWS flows, include domain validation evidence.

