# Checklist de ejecucion

Este checklist controla el avance real del proyecto PortalUP Stack Codex.

## Estado general

- [x] Crear repositorio base conectado a Git.
- [x] Crear andamio inicial de documentacion, skills, scripts, templates y fixtures.
- [x] Validar que el andamio inicial pasa `node scripts/validate-skills.js`.
- [x] Revisar el repositorio real de GStack.
- [x] Inventariar roles, prompts, comandos, checklists, QA, review, shipping y documentacion de GStack.
- [x] Revisar licencia, atribuciones y restricciones de reutilizacion.
- [x] Crear matriz real de portabilidad GStack -> Codex.
- [x] Reemplazar o ajustar el andamio actual con contenido realmente adaptado desde GStack.
- [x] Crear referencias compactas con metodologia real de GStack para review, QA, ship, CSO, investigate, careful y documentacion.
- [x] Validar contrato estructural de cada skill con `node scripts/validate-skills.js`.
- [x] Crear salidas esperadas y validador de fixtures.
- [x] Validar fixtures con `node scripts/validate-fixtures.js`.
- [x] Ejecutar cada skill contra fixtures con respuestas reales de Codex.
- [x] Validar evidencia con `node scripts/validate-actual-outputs.js`.
- [x] Actualizar base de conocimiento con comportamiento MVP.
- [x] Preparar nota de release candidata `v0.1.0`.
- [x] Aprobar y etiquetar release MVP `v0.1.0`.
- [x] Fase 2 avanzada: disenar orquestador autonomo e interprete de intencion.
- [x] Cerrar version `0.2.0` con continuidad, CLI, fixtures negativos y pruebas generales.

## Fase 1 - Discovery real de GStack

- [x] Clonar o descargar `https://github.com/garrytan/gstack.git`.
- [x] Registrar commit/revision analizada.
- [x] Identificar estructura principal del repo.
- [x] Inventariar archivos de instrucciones de agente.
- [x] Inventariar slash commands o equivalentes.
- [x] Inventariar skills/prompts reutilizables.
- [x] Inventariar scripts/hooks/workflows.
- [x] Identificar dependencias Claude-only.
- [x] Revisar licencia y aviso de atribucion.
- [x] Completar `docs/matriz-portabilidad-gstack.md` con datos reales.

## Fase 2 - Adaptador Codex

- [x] Mapear `CLAUDE.md` o equivalentes hacia `AGENTS.md`.
- [x] Mapear `.claude/skills` o equivalentes hacia `.agents/skills`.
- [x] Mapear slash commands hacia skills `$portalup-*`.
- [x] Identificar scripts wrapper necesarios.
- [x] Actualizar ADRs con hallazgos reales.

## Fase 3 - Skills MVP

- [x] Ajustar `portalup-review` con base en GStack real.
- [x] Ajustar `portalup-qa` con base en GStack real.
- [x] Agregar `portalup-qa-only` con base en GStack real.
- [x] Ajustar `portalup-ship` con base en GStack real.
- [x] Ajustar `portalup-cso` con base en GStack real.
- [x] Ajustar `portalup-document-generate` con base en GStack real.
- [x] Agregar `portalup-document-release` con base en GStack real.
- [x] Agregar `portalup-plan-eng-review` con base en GStack real.
- [x] Agregar `portalup-plan-ceo-review` con base en GStack real.
- [x] Agregar `portalup-autoplan` con base en GStack real.
- [x] Agregar `portalup-investigate` con base en GStack real.
- [x] Agregar `portalup-careful` con base en GStack real.
- [x] Ajustar capa PortalUP sin perder identidad propia.

## Fase 4 - Skills PortalUP diferenciales

- [x] Crear `portalup-filenet-review`.
- [x] Crear `portalup-rpa-review`.
- [x] Crear `portalup-bpm-review`.
- [x] Crear `portalup-sql-review`.
- [x] Crear `portalup-aws-backup-review`.
- [x] Crear `portalup-propuesta-comercial`.
- [x] Crear `portalup-soporte-incidente`.
- [x] Crear `portalup-arquitectura-solucion`.
- [x] Crear `portalup-quality-gate` para controles profesionales tipo Sonar.
- [x] Crear `portalup-ui-modernization` para modernizacion visual y UX profesional.

## Fase 5 - Orquestador autonomo sin browse

- [x] Crear taxonomia de intenciones humanas.
- [x] Crear skill `portalup-orchestrator`.
- [x] Crear mapa de routing de intencion a skills.
- [x] Crear experto arquitecto `portalup-arquitecto-experto`.
- [x] Crear experto comercial `portalup-comercial-experto`.
- [x] Crear experto marketing `portalup-marketing-experto`.
- [x] Conectar expertos al routing del orquestador.
- [x] Definir niveles de autonomia.
- [x] Definir reglas de control de riesgo y cautela.
- [x] Crear politica de contexto minimo y presupuesto de tokens.
- [x] Crear formato de handoff entre especialistas.
- [x] Crear mecanismo de continuidad de sesion.
- [x] Crear protocolo auditable de Context Ops para ahorro de tokens y reciclaje de agentes.
- [x] Crear informe de validacion competitiva frente a GStack.
- [x] Crear validador de continuidad persistente.
- [x] Crear fixtures de routing y orquestacion.
- [x] Validar que el usuario pueda pedir tareas sin nombrar skills.
- [x] Excluir QA visual/browser de esta fase.
- [x] Crear CLI helper `pstack`.
- [x] Crear doctor y validacion general.
- [x] Crear fixtures negativos de secretos, acciones destructivas y ambiguedad comercial.

## Fase 6 - Futura browser y memoria externa

- [ ] QA visual con navegador real.
- [ ] Browser automation.
- [ ] Memoria externa tipo GBrain.
- [ ] Coordinacion multiagente remota.
- [ ] Plugin Codex distribuible.

## Fase 7 - Runtime Multi-LLM independiente del host

- [x] Crear arquitectura Multi-LLM con diagrama Markdown.
- [x] Crear roadmap de ejecucion Multi-LLM.
- [x] Crear plan de trabajo por etapas.
- [x] Crear `portalup.config.example.json`.
- [x] Crear registro canonico `core/registry/skills.registry.json`.
- [x] Crear registro de motores `core/registry/engines.registry.json`.
- [x] Crear adaptador descriptivo `core/adapters/codex/adapter.md`.
- [x] Crear adaptador descriptivo `core/adapters/claude/adapter.md`.
- [x] Crear placeholder `core/adapters/cursor/adapter.md`.
- [x] Crear contratos y politicas `core/runtime`.
- [x] Crear `core/README.md`.
- [x] Crear `scripts/validate-runtime.js`.
- [x] Ejecutar `node scripts\validate-runtime.js`.
- [x] Integrar runtime en `scripts/validate-all.js`.
- [x] Actualizar documentacion de uso y seguimiento.
- [x] Crear generador de assets por host.
- [x] Generar paquetes Codex, Claude y Cursor en `dist/host-assets`.
- [x] Agregar comandos `pstack engine`, `pstack runtime` y `pstack package`.
- [x] Leer `portalup.config.json` real desde CLI.
- [ ] Permitir cambiar engine configurado desde `pstack`.
- [x] Crear fixture de continuidad Codex -> Claude.
- [ ] Validar continuidad entre motores con prueba real.

## Registro rapido

| Fecha | Avance | Estado |
| --- | --- | --- |
| 2026-06-07 | Andamio inicial creado desde roadmap, sin revisar GStack real | Provisional |
| 2026-06-07 | Usuario confirmo URL de GStack y se reorienta a discovery real | En curso |
| 2026-06-07 | GStack clonado, version/licencia/skills/host Codex inventariados | Fase 1 primera pasada completa |
| 2026-06-07 | Skills iniciales faltantes del roadmap agregadas y alineadas a GStack real | Fase 3 primera pasada completa |
| 2026-06-07 | Primer corte de 17 skills validado con `node scripts/validate-skills.js` | Validacion estructural OK |
| 2026-06-07 | Referencias metodologicas GStack agregadas a skills core/transversales | Pendiente validar fixtures |
| 2026-06-07 | Primer corte de 6 fixtures enlazado a salidas esperadas y validado con `node scripts/validate-fixtures.js` | Validacion de contrato OK |
| 2026-06-07 | Skills BPM, AWS Backup y Arquitectura agregadas; suite sube a 20 skills y 8 fixtures | Validacion de contrato OK |
| 2026-06-07 | Nota de release candidata `docs/release-v0.1.0.md` creada | Pendiente corrida real de fixtures |
| 2026-06-07 | 8 respuestas reales guardadas en `tests/actual-output` y validadas | Todos los fixtures aprueban MVP |
| 2026-06-07 | Release MVP etiquetado como `v0.1.0` | Tag local creado |
| 2026-06-07 | `main` y tag `v0.1.0` publicados en `origin` | Publicado |
| 2026-06-07 | Checklist de Fase 2 avanzada creado en `docs/fase-2-orquestador-autonomo.md` | Pendiente implementar |
| 2026-06-07 | Expertos arquitecto, comercial y marketing agregados como skills y conectados al routing | Validado: 23 skills / 11 fixtures |
| 2026-06-07 | `portalup-orchestrator` agregado con 5 fixtures de routing natural | Pendiente completar continuidad persistente |
| 2026-06-07 | Continuidad persistente agregada con `outputs/sessions`, plantillas y validador | Pendiente pruebas generales finales |
| 2026-06-07 | Version `0.2.0` cerrada con CLI, doctor, validadores generales y fixtures negativos | Pendiente commit/tag |
| 2026-06-08 | Etapa 1 Multi-LLM iniciada con Core declarativo, config ejemplo, adaptadores Codex/Claude y validador runtime | En validacion |
| 2026-06-08 | Etapa 2 Multi-LLM avanzada con generador de assets por host y comandos runtime en `pstack` | En validacion |
| 2026-06-08 | Etapa 3 Multi-LLM iniciada con adapter Claude validado contra `.claude/skills` y paquete actualizado | En validacion |
| 2026-06-09 | Instalador Claude por proyecto, lectura de config real y fixture Codex -> Claude agregados | En validacion |
# Actualizacion Multi-LLM

- [x] Iniciada fase PortalUP Stack Core Runtime Multi-LLM.
- [x] Creado diseno arquitectonico en `docs/arquitectura-multi-llm.md`.
- [x] Creado roadmap de ejecucion en `docs/roadmap-multi-llm.md`.
- [x] Creado checklist especifico en `docs/checklist-multi-llm.md`.
- [x] Ejecutada Etapa 1 base: configuracion, contrato de engine, politicas, registros y adapters iniciales.
- [ ] Pendiente siguiente bloque: validador automatico de runtime e integracion con `scripts/pstack.js`.
