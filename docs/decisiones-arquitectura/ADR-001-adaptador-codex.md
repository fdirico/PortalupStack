# ADR-001: Adaptador Codex

## Estado

Aceptada para MVP.

## Contexto

GStack contiene metodologia util, pero parte de su ergonomia esta asociada a Claude Code. PortalUP necesita una distribucion compatible con Codex.

## Decision

Crear una capa de adaptacion Codex basada en:

- `AGENTS.md`
- `.agents/skills`
- scripts de instalacion y validacion
- templates y fixtures

## Consecuencias

- Las skills se invocan como `$portalup-*`.
- Los slash commands quedan fuera del MVP.
- La portabilidad futura hacia otros agentes queda abierta.

