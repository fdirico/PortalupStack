---
name: portalup-orchestrator
description: Autonomous PortalUP task interpreter and specialist router. Use when the user describes a need in natural language and Codex must infer intent, domain, risk, stage, select PortalUP specialists, manage context, and produce continuity handoffs without requiring the user to name a skill.
---

# PortalUP Orchestrator

## Use

Use this skill when the user describes a goal, problem, change, opportunity, incident, proposal, architecture, release, or support need without naming a specific skill.

Also use it when multiple PortalUP specialists may be relevant and the user needs a consolidated plan instead of separate independent answers.

Do not use it to bypass safety. If the request involves destructive actions, production impact, credentials, migrations, force pushes, or secrets, route through `$portalup-careful` and stop before execution when confirmation is required.

## Workflow

1. Interpret the user request in plain language.
2. Classify intent, stage, domain, risk, autonomy level, and missing information.
3. Read `references/routing-summary.md` when routing is not obvious.
4. Read `references/context-token-policy.md` for medium/large tasks or when multiple specialists are needed.
5. Select the minimum necessary specialists.
6. Decide whether to answer directly, produce a plan, or hand off to specialists.
7. Produce a consolidated output with next actions and continuity summary.
8. For long, risky, or multi-specialist work, create or update a continuity file in `outputs/sessions/` using `templates/continuity-summary.md`.
9. Before handing work to another specialist, use `templates/agent-handoff.md` to compress context.
10. Avoid loading every skill or repeating context unnecessarily.

## Output

```text
Intent detected
- ...

Stage
- idea | plan | implementation | correction | incident | review | release | documentation | commercial | marketing

Domain
- general | FileNet | RPA | BPM | SQL | AWS | security | architecture | commercial | marketing

Risk
- low | medium | high | critical

Autonomy level
- assist | route | execute | ship

Specialists selected
- $portalup-...: reason

Execution plan
- ...

Context plan
- What to load:
- What to summarize:
- What to avoid:

Consolidated answer or next action
- ...

Continuity summary
- Objective:
- Facts:
- Decisions:
- Risks:
- Pending:
- Next agent instructions:

Persistent continuity
- Save needed: yes | no
- Suggested file: outputs/sessions/YYYY-MM-DD-short-topic.md
- Template: templates/continuity-summary.md
```

## Checklist

- The user does not need to know skill names.
- Routing is based on intent, domain, stage, and risk.
- The fewest useful specialists are selected.
- High-risk work routes through `$portalup-careful`.
- Unknowns are visible and not invented.
- Context is minimized before specialist handoff.
- Output includes continuity for future agents.
- Long or multi-specialist tasks produce a persistent continuity recommendation.
- Handoffs use `templates/agent-handoff.md`.
- Session summaries use `templates/continuity-summary.md` and live under `outputs/sessions/`.

## References

- `references/routing-summary.md`: condensed routing rules for specialist selection.
- `references/context-token-policy.md`: context, token, handoff, and continuity policy.
