# Context and token policy

## Principle

Deliver the minimum sufficient context to each specialist.

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

## Anti-waste rules

- Do not load every skill.
- Do not repeat long history when a summary is enough.
- Do not call a domain expert for generic work.
- Do not call security unless the surface is sensitive or release-bound.
- Do not continue routing if the next specialist would only restate the same answer.
