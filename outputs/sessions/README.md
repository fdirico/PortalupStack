# Session continuity outputs

Use this folder for persistent handoff files created by `$portalup-orchestrator` or by an agent closing a long task.

Recommended file name:

```text
YYYY-MM-DD-short-topic.md
```

Each session file should include:

- `# Continuity Summary`
- `## Status`
- `## Completed`
- `## Validated`
- `## Remaining`
- `## Risks`
- `## Decisions`
- `## Files Or Evidence`
- `## Next Agent Instructions`
- `## Token Budget`

These files are meant for continuity and token reduction. They should not contain secrets, private credentials, API keys, raw customer data, or unredacted production dumps.
