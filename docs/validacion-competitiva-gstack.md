# Validacion competitiva frente a GStack

Fecha: 2026-06-07

## Resumen ejecutivo

PortalUP Stack Codex cumple bien la meta de adaptar el modelo de trabajo de GStack a Codex en forma de skills, routing, fixtures, validadores, instalador local y continuidad persistente.

No es equivalente completo a GStack todavia. GStack conserva ventaja en browser persistente, QA visual automatizado, pair-agent, seguridad avanzada del browser agent, memoria externa tipo GBrain y generacion automatica de documentacion desde codigo fuente.

PortalUP Stack Codex supera al enfoque original en especializacion empresarial PortalUP: FileNet, RPA, BPM, SQL, AWS backup, soporte de incidentes, propuestas comerciales y arquitectura de solucion. Tambien ahora tiene un protocolo explicito de Context Ops para ahorro de tokens, reciclaje de agentes y transferencia de conocimiento.

## Veredicto

| Area | Estado PortalUP Stack Codex | Comparacion |
| --- | --- | --- |
| Skills operativas | Fuerte: 26 skills instalables y validadas | Comparable en metodologia base, mas fuerte en dominios PortalUP, calidad profesional y UI/UX |
| Codex compatibility | Fuerte: `.agents/skills`, `agents/openai.yaml`, instalador local | Mejor alineado al runtime Codex |
| Orquestacion | Buena: routing, riesgo, autonomia, continuidad | Funcional sin requerir slash commands de Claude |
| QA y review | Buena en metodologia y templates | Inferior a GStack si se requiere browser real persistente |
| Produccion y release | Buena: ship, CSO, docs, careful | Comparable en checklist, inferior en automatizacion avanzada |
| Token savings | Mejorado: Context Ops auditable | Mas explicito que el MVP previo; requiere mas ejecucion real para medir ahorro |
| Memoria entre agentes | Media: continuidad local y handoffs | Inferior a GBrain/memoria externa automatizada |
| Seguridad avanzada | Media: CSO y careful | Inferior en prompt-injection/browser-agent defenses |
| Velocidad | Buena: validadores Node sin dependencias pesadas | Rapido como paquete de skills; inferior en browser automation |

## Que ya hace bien

- Instala skills en `C:\Users\Fabian\.codex\skills`.
- Valida estructura, fixtures, outputs reales, continuidad y CLI con `node scripts\doctor.js`.
- Permite pedir trabajo en lenguaje natural mediante `$portalup-orchestrator`.
- Mantiene continuidad con `outputs/sessions/`, `templates/continuity-summary.md` y `templates/agent-handoff.md`.
- Tiene dominios PortalUP que GStack no trae por defecto.
- Evita depender de Claude Code o comandos Claude-only.

## Brechas criticas

1. Browser persistente y QA visual.
   - Impacto: no puede igualar la experiencia de QA con navegador real, sesiones persistentes, cookies y comandos rapidos.
   - Recomendacion: fase 3 con un browser adapter para Codex o integracion controlada con Playwright.

2. Memoria externa automatizada.
   - Impacto: la continuidad existe, pero depende de que el agente escriba o actualice resumentes.
   - Recomendacion: crear `pstack memory` o `pstack session` para indexar, listar y recuperar summaries.

3. Generacion de docs desde registry.
   - Impacto: los `SKILL.md` se mantienen manualmente y podrian desincronizarse de scripts/templates.
   - Recomendacion: crear un generador liviano de skills o un validador de placeholders.

4. Evaluaciones de calidad con juez.
   - Impacto: se validan contratos, pero no calidad semantica automaticamente.
   - Recomendacion: agregar tier opcional `EVALS=1` con juez LLM o rubricas locales.

5. Seguridad browser-agent.
   - Impacto: hoy no existe surface browser-agent, pero si se agrega debe nacer con defensa de prompt injection.
   - Recomendacion: requerir threat model antes de cualquier browser/memoria externa.

## Mejoras aplicadas

- Se agrego `docs/context-ops-protocol.md`.
- Se fortalecio `docs/contexto-y-tokens.md` con ledger, triggers y score de eficiencia.
- Se fortalecio `.agents/skills/portalup-orchestrator/references/context-token-policy.md`.
- Se ampliaron `templates/continuity-summary.md` y `templates/agent-handoff.md`.
- Se agregaron comandos `pstack compact`, `pstack handoff` y `pstack continue`.
- Se ampliaron `validate-continuity.js` y `validate-cli.js` para exigir el nuevo contrato.
- Se agregaron `portalup-quality-gate` y `portalup-ui-modernization` para cubrir controles tipo Sonar, robustez, modernizacion visual y pushback profesional.

## Proxima ruta para ser mejor que GStack en Codex

| Prioridad | Mejora | Resultado esperado |
| --- | --- | --- |
| P0 | Medir Context Ops en tareas reales | Ahorro verificable de tokens y mejor handoff |
| P0 | Crear `pstack session list/show/new` | Reanudacion mas rapida sin leer carpetas manualmente |
| P1 | Agregar tier de evaluacion semantica | Calidad comparable entre versiones |
| P1 | Crear browser adapter Codex + Playwright | QA visual y soporte operativo real |
| P1 | Agregar security gate para browser/memory | Evitar fuga de secretos o prompt injection |
| P2 | Generador de skill docs | Menos drift entre skills, CLI y validators |

## Resultado de validacion

Comando ejecutado:

```powershell
node scripts\doctor.js
```

Resultado:

```text
PortalUP Stack Codex 0.3.0
Skills: 26
Fixtures: 22
All validations passed.
Doctor passed.
```
