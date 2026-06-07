# Fase 2 - Orquestador autonomo PortalUP

## Objetivo

Convertir PortalUP Stack Codex de una coleccion de skills invocadas manualmente a un sistema autonomo donde el usuario pueda hablar de forma natural y un orquestador decida:

- Que quiere lograr el usuario.
- Que especialistas deben intervenir.
- En que orden deben trabajar.
- Que contexto necesita cada especialista.
- Que contexto debe resumirse, reciclarse o descartarse para optimizar tokens.
- Como preservar continuidad para otro agente o una sesion futura.

Esta fase excluye por ahora QA visual, navegador controlado, browser handoff y automatizacion web avanzada.

## Concepto operativo

El nuevo flujo deseado es:

```text
Usuario humano
  -> portalup-orchestrator
  -> clasifica intencion, riesgo, dominio y etapa
  -> selecciona especialistas
  -> entrega contexto minimo necesario
  -> recibe respuestas
  -> sintetiza decision y proximas acciones
  -> guarda continuidad
```

El humano no deberia tener que recordar si debe usar `$portalup-filenet-review`, `$portalup-cso` o `$portalup-ship`. El orquestador debe inferirlo.

## Roles nuevos

| Rol | Responsabilidad |
| --- | --- |
| `portalup-orchestrator` | Interprete principal. Entiende al usuario, enruta tareas, decide secuencia y consolida resultados |
| `portalup-router` | Clasificador de intencion, dominio, riesgo y etapa de trabajo |
| `portalup-context-manager` | Resume historial, compacta contexto, define que se conserva y que se descarta |
| `portalup-memory-curator` | Mantiene bitacoras, decisiones, pendientes y aprendizajes reutilizables |
| `portalup-token-economist` | Define presupuesto de contexto y evita cargar skills/referencias innecesarias |
| `portalup-execution-coordinator` | Divide tareas grandes, controla handoffs y valida cierre |

En MVP avanzado, estos roles pueden estar en una sola skill `portalup-orchestrator`. En V1 pueden separarse si crece la complejidad.

## Checklist de trabajo

### 1. Definir taxonomia de intenciones

- [x] Crear matriz de intenciones del usuario.
- [x] Clasificar intenciones por etapa: idea, plan, implementacion, correccion, incidente, revision, QA, release, documentacion, propuesta.
- [x] Clasificar por dominio: general, FileNet, RPA, BPM, SQL, AWS, seguridad, arquitectura, comercial.
- [x] Clasificar por riesgo: bajo, medio, alto, critico.
- [x] Definir ejemplos de frases humanas y skill sugerida.
- [x] Documentar ambiguedades frecuentes y preguntas minimas permitidas.

### 2. Crear skill `portalup-orchestrator`

- [x] Crear `.agents/skills/portalup-orchestrator/SKILL.md`.
- [x] Crear `.agents/skills/portalup-orchestrator/agents/openai.yaml`.
- [x] Definir que esta skill puede ser invocada implicitamente.
- [x] Incluir workflow de interpretacion: entender, clasificar, planear, enrutar, sintetizar, guardar continuidad.
- [x] Definir salida estandar: intencion detectada, especialistas seleccionados, plan, resultado consolidado, proximos pasos.
- [x] Agregar checklist para evitar sobreruteo y exceso de contexto.

### 2.1. Especialistas expertos consultivos

- [x] Crear `portalup-arquitecto-experto`.
- [x] Crear `portalup-comercial-experto`.
- [x] Crear `portalup-marketing-experto`.
- [x] Crear fixtures para los tres expertos.
- [x] Crear salidas esperadas para los tres expertos.
- [x] Crear respuestas reales para los tres expertos.

### 3. Crear mapa de routing

- [x] Crear `docs/orquestador-routing.md`.
- [x] Mapear cada skill existente a disparadores naturales.
- [x] Definir reglas de combinacion de skills.
- [x] Definir reglas de precedencia.
- [x] Definir reglas de stop: cuando no invocar mas especialistas.
- [x] Definir fallback: que hacer si la intencion no encaja.

Ejemplos esperados:

| Si el usuario dice | El orquestador debe usar |
| --- | --- |
| "revisa este cambio antes de subirlo" | `$portalup-review` |
| "esta listo para produccion?" | `$portalup-ship`, posiblemente `$portalup-cso` |
| "tengo error en FileNet/WebSphere/ICN" | `$portalup-filenet-review`, posiblemente `$portalup-soporte-incidente` |
| "arma una propuesta para cliente" | `$portalup-propuesta-comercial` |
| "disena la solucion" | `$portalup-arquitectura-solucion`, posiblemente `$portalup-plan-eng-review` |
| "no se que esta pasando, investiguemos" | `$portalup-investigate`, luego especialista de dominio |

### 4. Disenar control de autonomia

- [x] Definir niveles de autonomia: `assist`, `route`, `execute`, `ship`.
- [x] Definir acciones que siempre requieren cautela: borrados, force push, cambios productivos, secretos, migraciones, credenciales.
- [x] Integrar reglas de `$portalup-careful`.
- [x] Documentar cuando el orquestador debe detenerse.

### 5. Gestion de contexto y tokens

- [x] Crear `docs/contexto-y-tokens.md`.
- [x] Definir presupuesto por tarea: pequeno, medio, grande.
- [x] Definir que contexto cargar por defecto y que dejar bajo demanda.
- [x] Definir formato de resumen de continuidad.
- [x] Definir politica de contexto minimo suficiente.
- [x] Crear plantilla para handoff entre especialistas.
- [x] Crear plantilla para cierre de sesion.

Reglas base:

- No cargar todas las skills por defecto.
- No copiar historiales largos si un resumen sirve.
- Mantener hechos, decisiones, archivos tocados, riesgos y pendientes.
- Separar contexto confirmado de hipotesis.
- Antes de pasar a otro especialista, entregar solo lo que necesita.

### 6. Reciclaje de agentes y continuidad

- [x] Definir que significa "agente cargado" o "agente fatigado" en esta arquitectura.
- [x] Definir umbral de compactacion: tarea larga, muchos archivos, varias decisiones, cambio de etapa.
- [x] Crear formato `Agent Handoff Summary`.
- [x] Crear formato `Decision Log`.
- [x] Crear formato `Open Risks`.
- [x] Crear formato `Next Agent Instructions`.
- [x] Guardar continuidad en `outputs/sessions/`.

### 7. Evidencia y auditoria

- [x] Registrar cada decision de routing.
- [x] Registrar por que se eligio una skill.
- [x] Registrar que contexto se entrego al especialista.
- [x] Registrar salida consolidada.
- [x] Registrar validaciones ejecutadas.
- [x] Crear fixtures para probar routing.

### 8. Testing de orquestador

- [x] Crear `tests/fixtures/orchestrator-*`.
- [x] Crear `tests/expected-output/orchestrator-*`.
- [x] Crear `tests/actual-output/orchestrator-*` despues de ejecutar pruebas.
- [x] Extender suite de validacion con continuidad y CLI.
- [x] Evaluar si el orquestador elige bien la skill.
- [x] Evaluar si evita cargar contexto innecesario.
- [x] Evaluar si sintetiza correctamente.

Casos minimos:

- [x] Usuario pide "revisa este cambio" sin nombrar skill.
- [x] Usuario describe incidente FileNet sin nombrar FileNet como skill.
- [x] Usuario pide "esta listo para produccion?".
- [x] Usuario pide propuesta comercial ambigua.
- [x] Usuario pide arquitectura con componentes mixtos FileNet/RPA/SQL.
- [x] Usuario pide investigar un bug sin saber causa mediante continuidad/incidente.

### 9. CLI opcional `pstack`

- [x] Decidir si `pstack` se implementa en esta fase o queda posterior.
- [x] Si se implementa, crear comandos: `pstack ask`, `pstack route`, `pstack review`, `pstack ship`, `pstack proposal`.
- [x] `pstack ask` debe activar el orquestador, no una skill fija.

### 10. Criterios de aceptacion

- [x] El usuario puede escribir una necesidad en lenguaje natural sin nombrar skill.
- [x] El orquestador selecciona una o mas skills apropiadas.
- [x] El orquestador explica brevemente por que eligio esas skills.
- [x] El orquestador evita invocar especialistas innecesarios.
- [x] El orquestador produce un plan claro y accionable.
- [x] El orquestador genera resumen de continuidad.
- [x] El orquestador conserva decisiones, riesgos, archivos y pendientes.
- [x] El orquestador pasa validadores existentes.
- [x] El orquestador tiene fixtures y respuestas reales con score minimo 75/100.

## Definicion de exito

La fase queda lista cuando PortalUP Stack Codex pueda funcionar como un "dealer" autonomo:

```text
Humano: Tengo que corregir una app que falla al actualizar usuarios y quiero dejarla lista para produccion.

Orquestador:
- Detecta intencion: correccion + review + release readiness.
- Usa: portalup-investigate, portalup-review, portalup-cso, portalup-ship.
- Resume contexto.
- Prioriza riesgos.
- Propone plan.
- Ejecuta o guia pasos.
- Deja handoff para continuidad.
```

## Fuera de alcance por ahora

- Navegador controlado por IA.
- QA visual automatizado.
- Browser handoff.
- Sidebar agent.
- GBrain o memoria externa persistente.
- Coordinacion multiagente remota.

Estas capacidades pueden convertirse en Fase 3.
