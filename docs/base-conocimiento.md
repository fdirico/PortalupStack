# Base de conocimiento

## Que es PortalUP Stack Codex

PortalUP Stack Codex es una distribucion de skills para Codex que estandariza como PortalUP usa IA en trabajo tecnico y comercial.

La aplicacion no es un backend ni una UI tradicional. Es un paquete de conocimiento operativo que Codex puede cargar como skills para ejecutar tareas repetibles con formato, criterios de calidad y salida accionable.

## Como funciona

1. El usuario instala las skills en su entorno local de Codex.
2. El usuario invoca una skill con `$nombre-de-skill`.
3. Codex lee el `SKILL.md` correspondiente.
4. Codex ejecuta el flujo definido por la skill.
5. La salida se entrega con estructura estandar: diagnostico, hallazgos, riesgos, validaciones, acciones y decision.

## Skills disponibles en MVP

| Skill | Uso principal |
| --- | --- |
| `$portalup-review` | Revisar codigo, arquitectura, riesgos y pruebas |
| `$portalup-orchestrator` | Interpretar pedidos naturales, elegir especialistas y generar continuidad |
| `$portalup-qa` | Crear planes de prueba y criterios de aceptacion |
| `$portalup-qa-only` | Ejecutar QA report-only sin modificar codigo |
| `$portalup-quality-gate` | Validar calidad profesional tipo Sonar: arquitectura, codigo, mantenibilidad, tests, seguridad y robustez |
| `$portalup-ui-modernization` | Modernizar UI/UX, layout, menus, graficas, responsive y look and feel profesional |
| `$portalup-ship` | Preparar salida a produccion o release |
| `$portalup-cso` | Revisar seguridad, secretos, permisos e infraestructura |
| `$portalup-document-generate` | Crear documentacion tecnica, funcional, runbooks y release notes |
| `$portalup-document-release` | Actualizar documentacion asociada a una entrega |
| `$portalup-plan-eng-review` | Revisar planes desde arquitectura, datos, edge cases y tests |
| `$portalup-plan-ceo-review` | Revisar valor de producto, alcance y tradeoffs |
| `$portalup-autoplan` | Orquestar plan con perspectiva estrategia + ingenieria + QA + seguridad |
| `$portalup-investigate` | Investigar causa raiz antes de corregir |
| `$portalup-careful` | Evaluar acciones destructivas o riesgosas antes de ejecutarlas |
| `$portalup-arquitecto-experto` | Revisar decisiones de arquitectura, tradeoffs, roadmap tecnico y riesgos estrategicos |
| `$portalup-comercial-experto` | Calificar oportunidades, definir estrategia comercial, alcance, opciones y negociacion |
| `$portalup-marketing-experto` | Crear posicionamiento, mensajes, campanas, contenido y estrategia go-to-market |
| `$portalup-filenet-review` | Diagnosticar o revisar soluciones IBM FileNet |
| `$portalup-rpa-review` | Revisar bots, orquestadores, credenciales, colas y reintentos |
| `$portalup-bpm-review` | Revisar procesos BPM, colas, aprobaciones, SLAs e integraciones |
| `$portalup-sql-review` | Revisar SQL Server/PostgreSQL, rendimiento, backups y migraciones |
| `$portalup-aws-backup-review` | Revisar backups AWS/S3, IAM, cifrado, retencion y restore |
| `$portalup-propuesta-comercial` | Generar propuestas comerciales estructuradas |
| `$portalup-soporte-incidente` | Convertir incidentes en diagnostico y plan de accion |
| `$portalup-arquitectura-solucion` | Crear o revisar arquitectura de solucion PortalUP |

## Como usarlo

Ejemplo de review:

```text
Usa $portalup-review para revisar los cambios de este modulo FastAPI antes de subir PR.
```

Ejemplo orquestador:

```text
Tengo una funcionalidad con cambios de permisos y migracion. Quiero saber si esta lista para produccion.
```

El orquestador deberia detectar release readiness, seguridad y cautela, y derivar a `$portalup-ship`, `$portalup-cso`, `$portalup-careful` y `$portalup-document-release`.

Ejemplo FileNet:

```text
Usa $portalup-filenet-review. Tenemos error de classpath en WebSphere al cargar un plugin ICN.
```

Ejemplo propuesta:

```text
Usa $portalup-propuesta-comercial para una propuesta de soporte mensual FileNet con bolsa de horas.
```

Ejemplo experto:

```text
Necesito evaluar si esta oportunidad de soporte FileNet/RPA conviene y como deberiamos plantearla comercialmente.
```

El orquestador deberia derivar una solicitud asi hacia `$portalup-comercial-experto` y, si hay complejidad tecnica, hacia `$portalup-arquitecto-experto`.

## Criterios de calidad

Una respuesta buena debe:

- Ser accionable.
- Priorizar por severidad.
- Separar hechos, supuestos e hipotesis.
- Incluir validaciones.
- Incluir riesgos y rollback si aplica.
- Evitar inventar datos no entregados por el usuario.
- Proponer siguientes pasos concretos.

## Evaluacion y pruebas

El MVP incluye fixtures en `tests/fixtures` y respuestas minimas aceptables en `tests/expected-output`.

Para validar estructura:

```powershell
node scripts\validate-skills.js
node scripts\validate-fixtures.js
node scripts\validate-actual-outputs.js
node scripts\validate-continuity.js
node scripts\validate-cli.js
node scripts\validate-runtime.js
node scripts\validate-all.js
node scripts\doctor.js
```

La evaluacion real de calidad esta guardada en `tests/actual-output` y resumida en `docs/evaluacion-resultados.md`.

## Continuidad entre agentes

Para tareas largas o con varios especialistas, el orquestador debe crear un resumen persistente en `outputs/sessions/` usando `templates/continuity-summary.md`.

Esto permite que otro agente retome con:

- objetivo
- hechos confirmados
- decisiones
- riesgos
- pendientes
- instrucciones para continuar

El handoff entre especialistas usa `templates/agent-handoff.md`.

## CLI `pstack`

`pstack` no ejecuta Codex por si solo. Genera prompts listos para usar con PortalUP Stack.

Ejemplo:

```powershell
.\scripts\pstack.ps1 ask "Quiero revisar si esta funcionalidad esta lista para produccion"
```

Comandos disponibles:

- `ask`
- `route`
- `review`
- `ship`
- `proposal`
- `marketing`
- `architect`
- `quality`
- `modernize`
- `compact`
- `handoff`
- `continue`

## Optimizacion de tokens y reciclaje

PortalUP Stack Codex usa `docs/context-ops-protocol.md` como contrato operativo para ahorrar tokens. En tareas medianas o grandes, el orquestador debe declarar que conserva, que resume, que descarta y que deja bajo demanda.

Los comandos `pstack compact`, `pstack handoff` y `pstack continue` ayudan a reciclar agentes y transferir conocimiento entre sesiones sin cargar todo el historial.

## Runtime Multi-LLM

PortalUP Stack esta evolucionando para separar el metodo PortalUP del motor LLM activo.

La idea base es:

```text
PortalUP Stack Core + adaptador activo = experiencia PortalUP en Codex, Claude Code u otro host
```

La Etapa 1 crea el contrato declarativo:

- `portalup.config.example.json`
- `core/registry/skills.registry.json`
- `core/registry/engines.registry.json`
- `core/adapters/codex/adapter.md`
- `core/adapters/claude/adapter.md`
- `core/runtime/engine-contract.md`
- `docs/arquitectura-multi-llm.md`
- `docs/roadmap-multi-llm.md`
- `docs/checklist-multi-llm.md`
- `docs/host-assets-generator.md`
- `docs/claude-code-adapter.md`
- `docs/continuidad-codex-claude.md`

Por ahora Codex sigue siendo el host operativo principal. Claude Code ya tiene paquete de proyecto validado documentalmente con `.claude/skills`, pendiente de prueba real en Claude Code.

Para generar paquetes por engine:

```powershell
node scripts\generate-host-assets.js --engine codex --dry-run
node scripts\generate-host-assets.js --engine codex --write
node scripts\generate-host-assets.js --engine claude --write
node scripts\generate-host-assets.js --engine cursor --write
```

Los paquetes se generan en `dist/host-assets/<engine>` y no se instalan automaticamente.

Para instalar PortalUP Stack en un proyecto Claude Code:

```powershell
.\scripts\install-claude-project.ps1 "D:\ruta\de\tu-proyecto" -DryRun
.\scripts\install-claude-project.ps1 "D:\ruta\de\tu-proyecto" -Force
```

## Estandar profesional

PortalUP Stack Codex no debe ser complaciente con pedidos incompletos que produzcan aplicaciones mediocres. Para trabajo de clientes grandes, debe aplicar `docs/professional-delivery-standard.md`, pedir contexto cuando haga falta, cuestionar enfoques debiles y usar `$portalup-quality-gate` y `$portalup-ui-modernization` cuando el resultado dependa de calidad tecnica o experiencia de usuario.

## Relacion con GStack

La base metodologica proviene del discovery real de GStack:

- `review`, `qa`, `qa-only`, `ship`, `cso`, `document-*`, `plan-*`, `autoplan`, `investigate` y `careful`.
- GStack ya soporta Codex via `hosts/codex.ts`.
- PortalUP Stack agrega dominio empresarial PortalUP: FileNet, RPA, SQL, AWS, soporte y propuestas.
