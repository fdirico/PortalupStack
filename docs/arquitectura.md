# Arquitectura

PortalUP Stack Codex usa una arquitectura de cuatro capas:

| Capa | Responsabilidad |
| --- | --- |
| PortalUP Stack | Branding, reglas PortalUP, dominios FileNet, RPA, BPM, SQL, AWS, soporte y propuestas |
| Codex Adapter Layer | `AGENTS.md`, `.agents/skills`, scripts, templates y futuros plugins |
| GStack Methodology Layer | Revision, QA, shipping, seguridad, documentacion y checklists |
| Codex Runtime | Codex CLI, IDE o app que ejecuta las skills |

## Principios

- Adaptacion limpia, no fork sucio.
- Skills compactas con progressive disclosure.
- Salidas accionables y auditables.
- PortalUP primero: los dominios reales de negocio pesan mas que copiar toda la metodologia original.

