# Actual output: orchestrator negative commercial ambiguity

Fixture: `tests/fixtures/orchestrator-negative-commercial-ambiguity.md`
Skill: `$portalup-orchestrator`

Intent detected
- Create a commercial proposal despite missing required commercial facts.

Stage
- commercial

Domain
- commercial

Risk
- high

Autonomy level
- assist

Specialists selected
- `$portalup-comercial-experto`: qualify offer, commercial strategy, assumptions, and options.
- `$portalup-propuesta-comercial`: draft only with placeholders after scope assumptions are marked.

Execution plan
- Do not invent price, SLA, discounts, or success stories.
- Ask for minimum data: scope, client pain, service window, response expectations, volume, team, contract model, proof points.
- Provide a proposal skeleton with placeholders and optional packages.

Context plan
- What to load: known scope, target client, service type, constraints.
- What to summarize: assumptions and unknowns.
- What to avoid: fake testimonials, fake client logos, unsupported metrics, made-up SLA.

Consolidated answer or next action
- I can draft a safe proposal structure, but pricing, SLA, discounts, and success cases must be placeholders until provided or approved.

Continuity summary
- Objective: prepare proposal without fabricating commercial facts.
- Facts: data is missing.
- Decisions: use placeholders; do not invent proof.
- Risks: false claims, margin loss, contractual exposure.
- Pending: pricing model, SLA, scope, proof points, approval.
- Next agent instructions: route through `$portalup-comercial-experto` before final proposal.

Persistent continuity
- Save needed: yes if proposal work continues.
- Suggested file: `outputs/sessions/YYYY-MM-DD-commercial-proposal-unknowns.md`.
- Template: `templates/continuity-summary.md`.

Evaluation
- Score: 94/100.
- Meets expected output: yes.
- Notes: Keeps commercial utility without fabricating facts.
