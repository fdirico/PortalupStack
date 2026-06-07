# Continuity Summary

## Status

- Example session for validating PortalUP Stack continuity format.

## Completed

- Orchestrator classified a production-readiness request.
- Selected `$portalup-ship`, `$portalup-cso`, `$portalup-careful`, and `$portalup-document-release`.

## Validated

- Required sections exist for handoff continuity.

## Remaining

- Replace this example with real session files when closing long tasks.

## Risks

- Do not store secrets or raw production data in continuity files.

## Decisions

- Use session summaries instead of long chat history when transferring work.

## Files Or Evidence

- `templates/continuity-summary.md`
- `templates/agent-handoff.md`

## Next Agent Instructions

- Load this file before resuming only if it is relevant to the active task.
- Prefer concise facts over full conversation history.

## Token Budget

- Task size: small
- Keep: objective, decisions, risks, pending work.
- Summarize: prior conversation.
- Drop: unrelated implementation details.
