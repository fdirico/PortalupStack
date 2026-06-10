# Routing del orquestador PortalUP

Este documento define como `portalup-orchestrator` debe interpretar lenguaje natural y seleccionar especialistas.

## Regla principal

El usuario no necesita nombrar skills. El orquestador debe inferir intencion, dominio, riesgo y etapa. Solo debe preguntar si falta informacion que cambia la decision.

## Etapas de trabajo

| Etapa detectada | Senales del usuario | Skills candidatas |
| --- | --- | --- |
| Idea o alcance | "quiero hacer", "se me ocurre", "como lo planteamos" | `$portalup-autoplan`, `$portalup-plan-ceo-review`, `$portalup-arquitecto-experto` |
| Plan tecnico | "disena", "arquitectura", "como implemento" | `$portalup-arquitecto-experto`, `$portalup-plan-eng-review`, `$portalup-arquitectura-solucion`, `$portalup-cso` |
| Implementacion | "haz", "implementa", "corrige", "ajusta" | `$portalup-plan-eng-review`, `$portalup-investigate`, `$portalup-review`, `$portalup-quality-gate`, skill de dominio |
| Revision | "revisa", "antes de subir", "esta bien?", "tipo sonar" | `$portalup-review`, `$portalup-quality-gate`, `$portalup-cso`, `$portalup-qa` |
| Modernizacion UI | "moderno", "look and feel", "responsive", "dashboard", "menu", "3D", "graficas", "sliders" | `$portalup-ui-modernization`, `$portalup-qa`, `$portalup-quality-gate` |
| Incidente | "fallo", "error", "produccion", "usuarios afectados" | `$portalup-soporte-incidente`, `$portalup-investigate`, skill de dominio |
| Release | "produccion", "deploy", "listo para salir" | `$portalup-ship`, `$portalup-cso`, `$portalup-document-release` |
| Documentacion | "documenta", "manual", "runbook" | `$portalup-document-generate`, `$portalup-document-release` |
| Comercial | "propuesta", "cliente", "alcance comercial", "negociacion", "oportunidad" | `$portalup-comercial-experto`, `$portalup-propuesta-comercial`, `$portalup-arquitectura-solucion` |
| Marketing | "posicionamiento", "campana", "mensaje", "landing", "go to market", "contenido" | `$portalup-marketing-experto`, `$portalup-comercial-experto` |

## Dominios

| Dominio | Senales | Skill principal |
| --- | --- | --- |
| FileNet | FileNet, ICN, WebSphere, CE, PE, JACE, CEWS, plugin, object store | `$portalup-filenet-review` |
| RPA | bot, robot, orquestador, UiPath, Rocketbot, cola, credential asset | `$portalup-rpa-review` |
| BPM | flujo, proceso, aprobacion, tarea, cola BPM, SLA, escalamiento | `$portalup-bpm-review` |
| SQL | SQL Server, PostgreSQL, Express, indice, backup, query, migracion DB | `$portalup-sql-review` |
| AWS Backup | S3, IAM, KMS, backup, restore, retention, lifecycle | `$portalup-aws-backup-review` |
| Seguridad | secretos, permisos, auth, roles, IAM, datos sensibles | `$portalup-cso` |
| Arquitectura | solucion, componentes, integracion, fases, operacion, tradeoff, modernizacion | `$portalup-arquitecto-experto` |
| Calidad profesional | Sonar, code smells, deuda tecnica, calidad, mantenibilidad, robustez | `$portalup-quality-gate` |
| UI/UX | look and feel, responsive, menu, dashboard, botones, graficas, 3D, sliders | `$portalup-ui-modernization` |
| Comercial | oportunidad, comprador, presupuesto, valor, alcance, SLA, negociacion | `$portalup-comercial-experto` |
| Marketing | ICP, audiencia, posicionamiento, mensaje, campana, contenido, canales | `$portalup-marketing-experto` |

## Reglas de combinacion

- Incidente + dominio: usar `$portalup-soporte-incidente` + skill de dominio.
- Produccion + cambio tecnico: usar `$portalup-ship` + `$portalup-cso`.
- Cambio de codigo sensible: usar `$portalup-review` + `$portalup-cso`.
- App profesional o cliente grande: usar `$portalup-plan-eng-review` + `$portalup-quality-gate`; sumar `$portalup-ui-modernization` si hay frontend.
- Controles tipo Sonar: usar `$portalup-quality-gate`; sumar `$portalup-review` para fixes de codigo.
- Modernizacion visual: usar `$portalup-ui-modernization`; sumar `$portalup-qa` para validacion responsive/UX.
- Problema sin causa clara: usar `$portalup-investigate` antes de proponer fix.
- Arquitectura estrategica: usar `$portalup-arquitecto-experto` antes de `$portalup-arquitectura-solucion`.
- Propuesta tecnica/comercial: usar `$portalup-comercial-experto` + `$portalup-propuesta-comercial`; sumar `$portalup-arquitecto-experto` si hay complejidad tecnica.
- Marketing o posicionamiento: usar `$portalup-marketing-experto`; sumar `$portalup-comercial-experto` si la salida debe convertirse en oferta o propuesta.
- Documentacion posterior a release: usar `$portalup-document-release`.

## Reglas de precedencia

1. Seguridad y datos sensibles prevalecen sobre velocidad.
2. Produccion e incidentes prevalecen sobre mejoras.
3. Investigacion prevalece sobre correccion cuando no hay causa clara.
4. Dominio especializado prevalece sobre skill generica.
5. Si hay ambiguedad de alcance comercial, no inventar precio ni SLA.
6. Calidad profesional prevalece sobre velocidad cuando se construye para clientes grandes.
7. Si el usuario pide estrategia, usar experto consultivo antes de generador de entregable.

## Reglas de stop

El orquestador debe detener routing adicional cuando:

- La respuesta ya puede ser accionable con una sola skill.
- La siguiente skill solo agregaria texto repetido.
- Falta informacion critica que no se puede inferir.
- Hay riesgo destructivo o productivo que requiere cautela.
- Falta informacion clave de UX/arquitectura y una suposicion produciria software mediocre.

## Fallback y ambiguedad

Si la intencion no encaja:

- Usar `$portalup-orchestrator` en modo `assist`.
- Hacer maximo 3 preguntas minimas.
- No invocar especialistas hasta distinguir etapa, dominio y riesgo.
- Si el usuario pide "hazlo rapido" pero hay riesgo alto, priorizar `$portalup-careful`.

Preguntas minimas permitidas:

- Cual es el objetivo final?
- En que ambiente ocurre: local, pruebas o produccion?
- Que dominio aplica: codigo, FileNet, RPA, SQL, BPM, AWS, comercial o marketing?
- Hay datos sensibles, usuarios afectados, migraciones o permisos involucrados?

## Cuando detenerse

El orquestador debe detener ejecucion y pedir confirmacion cuando:

- Hay borrado, force push, migracion irreversible o cambio productivo.
- Se intenta guardar secretos o credenciales.
- Se pide inventar precios, SLA, testimonios o resultados no confirmados.
- Falta evidencia para diagnosticar causa raiz.

## Salida minima del routing

```text
Intencion detectada
- ...

Dominio detectado
- ...

Riesgo
- Bajo | Medio | Alto | Critico

Especialistas seleccionados
- $portalup-...

Por que
- ...

Plan de ejecucion
- ...

Contexto minimo necesario
- ...
```
