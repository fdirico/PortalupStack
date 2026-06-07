# Actual output: orchestrator commercial marketing

Fixture: `tests/fixtures/orchestrator-commercial-marketing.md`
Skill: `$portalup-orchestrator`

Intent detected
- Shape a commercial offer and marketing message for a monthly FileNet/RPA support service.

Stage
- commercial + marketing

Domain
- FileNet, RPA, commercial, marketing

Risk
- medium

Autonomy level
- route

Specialists selected
- `$portalup-comercial-experto`: qualify offer structure, value hypothesis, scope, support model, options, and negotiation boundaries.
- `$portalup-marketing-experto`: define target audience, positioning, LinkedIn messaging, content pillars, and proof needed.
- `$portalup-propuesta-comercial`: use after commercial strategy is clear to draft a client-facing proposal.

Execution plan
- First define commercial strategy: support base, hours bucket, stabilization package, SLAs as assumptions, exclusions.
- Then define marketing positioning and LinkedIn content.
- Finally draft proposal if the user wants a formal document.

Context plan
- What to load: target clients, current FileNet/RPA pain, service capabilities, support hours, proof points, exclusions.
- What to summarize: value proposition and scope boundaries before marketing copy.
- What to avoid: exact prices, SLAs, metrics, client logos, or testimonials not provided.

Consolidated answer or next action
- Start with `$portalup-comercial-experto`, then `$portalup-marketing-experto`. Do not route to FileNet/RPA technical review unless technical scope is disputed.

Continuity summary
- Objective: create and communicate a monthly FileNet/RPA support offer.
- Facts: offer includes FileNet and RPA; LinkedIn communication is needed.
- Decisions: commercial strategy before marketing copy; proposal after scope clarity.
- Risks: vague SLA, unsupported claims, scope creep, generic messaging.
- Pending: audience, support model, proof points, pricing assumptions.
- Next agent instructions: protect scope and mark all unprovided commercial data as assumptions.

Evaluation
- Score: 90/100.
- Meets expected output: yes.
- Notes: Correctly avoids unnecessary domain review.
