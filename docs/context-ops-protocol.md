# Context Ops Protocol

## Objective

Context Ops makes token savings operational instead of aspirational. Every long or multi-specialist task must leave enough compact evidence for another agent to continue without reading the full conversation.

## Operating Model

Use this loop:

1. Route the request with `$portalup-orchestrator`.
2. Classify task size, risk, domain, stage, and autonomy level.
3. Load only the minimum specialist context needed for the next decision.
4. Write a handoff before changing specialist, stage, or risk level.
5. Write a continuity summary before pausing, shipping, or transferring ownership.
6. Validate that summaries do not contain secrets, raw dumps, or unnecessary personal data.

## Token Budget Classes

| Class | Typical task | Specialist limit | Context shape | Continuity required |
| --- | --- | --- | --- | --- |
| S | Direct question, narrow review, simple proposal | 1 | User request + direct evidence | No, unless risk is high |
| M | Incident, feature review, QA plan, release check | 1-3 | Structured summary + focused evidence | Yes when another agent may continue |
| L | Multi-domain architecture, production incident, release hardening | Staged, not parallel by default | Handoffs + decision log + evidence list | Yes |
| XL | Program-level work, repeated sessions, multiple applications | Staged with explicit checkpoints | Continuity file as source of truth | Yes, update after each stage |

## Recycling Triggers

Recycle the active agent context when any trigger appears:

- Stage changed from planning to implementation, QA, release, or support.
- More than three specialists would be useful.
- More than five decisions or assumptions are now relevant.
- Evidence spans code, logs, infrastructure, and commercial context.
- The next step can be done from a summary plus file references.
- A different agent, session, or human must continue the work.

## Context Ledger

Every handoff or continuity summary must include:

- Keep: facts, decisions, files, commands, risks, acceptance criteria.
- Summarize: conversation history, repeated rationale, exploratory dead ends.
- Drop: greetings, duplicated evidence, irrelevant branches, stale hypotheses.
- Load on demand: long docs, vendor references, domain playbooks, raw logs.

## Handoff Rules

- One handoff per specialist transition.
- The recipient gets objective, confirmed facts, hypotheses, relevant evidence, decisions, risks, and pending work.
- Do not hand off raw secrets, full `.env` values, production dumps, private customer data, or long transcripts.
- If the next specialist only restates the same answer, stop routing and consolidate.

## Efficiency Score

Use this score during reviews of PortalUP Stack behavior:

| Dimension | Points |
| --- | ---: |
| Minimum useful specialists selected | 20 |
| Clear keep/summarize/drop/load-on-demand ledger | 20 |
| Handoff created before specialist or stage switch | 20 |
| Continuity file recommended or updated when needed | 20 |
| Secrets and sensitive data excluded | 10 |
| Validation commands or evidence recorded | 10 |

Passing score: 80/100.

## Commands

Use `pstack` to generate Codex-ready prompts:

```powershell
.\scripts\pstack.ps1 compact "long task context to summarize"
.\scripts\pstack.ps1 handoff "handoff from orchestrator to SQL specialist"
.\scripts\pstack.ps1 continue "outputs/sessions/2026-06-07-topic.md"
```

Validate the protocol:

```powershell
node scripts\validate-continuity.js
```
