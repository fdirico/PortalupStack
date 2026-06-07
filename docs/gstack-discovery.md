# Discovery real de GStack

## Fuente revisada

- Repositorio: `https://github.com/garrytan/gstack.git`
- Carpeta local de referencia: `vendor/gstack`
- Commit analizado: `476b0ec59741fd69e4151ebee363a432d2b5c497`
- Version declarada: `1.56.1.0`
- Licencia: MIT, copyright Garry Tan 2026

## Hallazgos principales

1. GStack ya soporta Codex como host.
2. El host Codex esta definido en `vendor/gstack/hosts/codex.ts`.
3. Para Codex, GStack instala skills bajo `.codex/skills/gstack` o `.agents/skills/gstack`, genera `agents/openai.yaml` y elimina/suprime resolvers incompatibles.
4. El repo usa Bun y TypeScript para generar skills desde templates.
5. Los `SKILL.md` generados no deben editarse directamente; GStack edita templates y regenera.
6. El material reutilizable para PortalUP no es solo conceptual: hay flujos maduros de review, QA, ship, CSO, documentacion, plan reviews, safety y browser automation.

## Skills reales detectadas

### P0/P1 relevantes para PortalUP Stack Codex

| GStack skill | Uso | Portabilidad |
| --- | --- | --- |
| `review` | Revision pre-landing con diff, checklist, scope drift, especialistas y adversarial review | Alta |
| `qa` | QA con browser, modos quick/full/regression, health score, fix loop | Alta, requiere adaptar browser tooling |
| `qa-only` | QA report-only sin cambios de codigo | Alta |
| `ship` | Release workflow con tests, review, changelog, version, PR y gates | Alta, requiere simplificar |
| `cso` | Security audit con OWASP, STRIDE, supply chain, CI/CD, LLM security | Alta |
| `document-generate` | Generacion de docs tipo Diataxis desde codigo | Alta |
| `document-release` | Actualizar docs al cierre de release | Alta |
| `plan-eng-review` | Revision tecnica de planes | Alta |
| `plan-ceo-review` | Revision estrategica de producto | Media/Alta |
| `autoplan` | Orquestacion CEO -> design -> eng -> DX | Media, complejo |
| `investigate` | Debugging por fases antes de implementar | Alta |
| `careful` | Guardrail para comandos destructivos | Alta |
| `freeze` / `guard` / `unfreeze` | Limites de edicion y proteccion operacional | Media |

### Skills fuera de MVP o dependientes de tooling pesado

| GStack skill | Motivo |
| --- | --- |
| `browse` | Requiere binario/browser daemon y comandos `$B` |
| `open-gstack-browser` | Requiere extension/browser visible |
| `pair-agent` | Integracion remota y tunnel |
| `ios-qa`, `ios-fix`, `ios-design-review`, `ios-clean`, `ios-sync` | Dominio iOS especifico |
| `benchmark`, `benchmark-models` | Evaluacion avanzada, util en fase posterior |
| `make-pdf` | Utilidad separada, no central MVP |

## Estructura relevante

- `AGENTS.md`: resumen de skills, comandos de build y convenciones.
- `README.md`: instalacion, soporte de hosts, quick start y filosofia.
- `hosts/codex.ts`: reglas concretas de adaptacion para Codex.
- `review/`: skill, checklist, especialistas y formato de TODOs.
- `qa/`: skill, template de reporte y taxonomia.
- `ship/sections/`: gates reutilizables para tests, coverage, PR body, changelog y plan completion.
- `cso/`: auditoria por fases y acknowledgements.
- `scripts/gen-skill-docs.ts`: generador de skills desde templates.

## Implicacion arquitectonica para PortalUP

La estrategia cambia:

- Antes: crear skills PortalUP desde cero inspiradas en el roadmap.
- Ahora: reutilizar GStack como fuente metodologica real, especialmente templates/checklists de `review`, `qa`, `ship`, `cso` y `document-*`.
- PortalUP Stack debe ser una distribucion adaptada, no una reescritura vacia.
- La capa PortalUP debe agregar dominio FileNet, RPA, BPM, SQL, AWS y comercial sobre la metodologia real de GStack.

## Pendientes del discovery

- Leer con mas detalle `review/checklist.md`.
- Leer especialistas de `review/specialists/`.
- Leer secciones de `ship/sections/`.
- Extraer rubrica concreta de `qa` y `qa-only`.
- Identificar que partes se pueden copiar/adaptar cumpliendo MIT.
- Definir si usamos el generador GStack o mantenemos skills PortalUP manuales.

