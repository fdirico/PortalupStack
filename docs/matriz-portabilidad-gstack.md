# Matriz de portabilidad GStack

Fuente real revisada: `vendor/gstack` desde `https://github.com/garrytan/gstack.git`, commit `476b0ec59741fd69e4151ebee363a432d2b5c497`, version `1.56.1.0`, licencia MIT.

| Elemento GStack | Valor PortalUP | Compatible Codex | Accion MVP | Estado |
| --- | --- | --- | --- | --- |
| `/review` | Alto | Si; GStack ya tiene host Codex | Adaptar metodologia, checklist y especialistas como `$portalup-review` | MVP creado |
| `/qa` | Alto | Si; requiere resolver browser tooling o modo manual | Adaptar modos quick/full/regression y health score como `$portalup-qa` | MVP creado |
| `/qa-only` | Alto | Si | Crear `$portalup-qa-only` | MVP creado |
| `/ship` | Alto | Si; simplificar gates para PortalUP | Adaptar readiness, tests, changelog, PR, rollback como `$portalup-ship` | MVP creado |
| `/cso` | Alto | Si | Adaptar fases OWASP/STRIDE/supply chain como `$portalup-cso` | MVP creado |
| `/document-generate` | Alto | Si | Adaptar Diataxis/runbook/manuales como `$portalup-document-generate` | MVP creado |
| `/document-release` | Alto | Si | Crear skill separada y enlazar con ship | MVP creado |
| `/plan-eng-review` | Alto | Si | Crear `$portalup-plan-eng-review` | MVP creado |
| `/plan-ceo-review` | Medio/Alto | Si | Crear `$portalup-plan-ceo-review` para propuestas/producto | MVP creado |
| `/autoplan` | Medio | Parcial; complejo | Crear orquestador MVP textual | MVP creado |
| `/investigate` | Alto | Si | Crear `$portalup-investigate` e integrarlo conceptualmente en soporte | MVP creado |
| `/careful` | Alto | Si | Incorporar guardrails destructivos en AGENTS/skills | MVP creado |
| `/freeze`, `/guard`, `/unfreeze` | Medio | Si | Evaluar como safety layer | Pendiente |
| `/browse` | Medio | Parcial; requiere binario/daemon `$B` | Excluir MVP funcional, documentar como dependencia futura | Excluido MVP |
| `/open-gstack-browser` | Bajo/Medio | Parcial | Excluir MVP | Excluido MVP |
| `/pair-agent` | Medio | Parcial | Fase avanzada | Pendiente |
| `/codex` | Bajo para Codex host | No aplica igual; GStack lo omite en host Codex | No portar como skill PortalUP inicial | Excluido MVP |
| `/ios-*` | Bajo para PortalUP actual | Parcial | Excluir salvo necesidad iOS futura | Excluido MVP |

## Hallazgo clave

GStack ya define `hosts/codex.ts`, con generacion de `openai.yaml`, limite de description de 1024 caracteres, path rewrites desde `.claude` a `.agents`, y supresion de resolvers que no aplican a Codex. PortalUP Stack debe aprovechar ese descubrimiento en vez de inventar el adaptador desde cero.
