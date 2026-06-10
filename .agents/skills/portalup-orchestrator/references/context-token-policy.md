# Context and token policy

## Principle

Deliver the minimum sufficient context to each specialist.

## Operating contract

For medium, large, or multi-specialist tasks, use `docs/context-ops-protocol.md` as the canonical operating contract. It defines budget classes, recycling triggers, the context ledger, handoff rules, and the efficiency score.

## Task sizes

- Small: user request + one skill + direct evidence.
- Medium: structured summary + one to three specialists + relevant files/logs.
- Large: staged specialists + handoff summaries + decision log.

## Handoff format

```text
Agent Handoff Summary

Objective
- ...

Facts confirmed
- ...

Hypotheses
- ...

Relevant evidence
- ...

Decisions made
- ...

Open risks
- ...

Pending work for next specialist
- ...
```

## Continuity format

```text
Continuity Summary

Status
- ...

Completed
- ...

Validated
- ...

Remaining
- ...

Risks
- ...

Next agent instructions
- ...
```

Persistent summaries should be saved under:

```text
outputs/sessions/YYYY-MM-DD-short-topic.md
```

Use:

```text
templates/continuity-summary.md
```

## Anti-waste rules

- Do not load every skill.
- Do not repeat long history when a summary is enough.
- Do not call a domain expert for generic work.
- Do not call security unless the surface is sensitive or release-bound.
- Do not continue routing if the next specialist would only restate the same answer.
- Do not store secrets, credentials, raw production dumps, or unnecessary personal data in session summaries.

## Context ledger

Every handoff or continuity summary must state:

- Keep: facts, decisions, files, commands, risks, acceptance criteria.
- Summarize: conversation history, repeated rationale, and discarded exploration.
- Drop: duplicated evidence, stale hypotheses, greetings, irrelevant branches.
- Load on demand: long docs, vendor references, domain playbooks, raw logs.

## Recycling triggers

Compact or transfer context when:

- Stage changes.
- Specialist changes.
- More than three specialists are candidates.
- More than five decisions are relevant.
- The next action can be performed from a summary plus references.

## Efficiency score

Use 80/100 as the passing threshold:

- 20 minimum useful specialists.
- 20 clear keep/summarize/drop/load-on-demand ledger.
- 20 handoff before specialist or stage switch.
- 20 continuity recommended or updated when needed.
- 10 secrets and sensitive data excluded.
- 10 validations or evidence recorded.
