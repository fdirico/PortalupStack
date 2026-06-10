# Contexto y tokens

Este documento define como PortalUP Stack Codex debe optimizar contexto cuando use un orquestador autonomo.

## Principio

El mejor uso de tokens no es cargar todo. Es entregar a cada especialista el contexto minimo suficiente para decidir bien.

## Protocolo operativo

El contrato detallado vive en `docs/context-ops-protocol.md`. Ese protocolo convierte la politica de contexto en reglas verificables: clases de presupuesto, disparadores de reciclaje, ledger de contexto, reglas de handoff y score de eficiencia.

## Presupuesto por tarea

| Tamano | Uso | Contexto permitido |
| --- | --- | --- |
| Pequeno | Pregunta puntual, propuesta corta, review de un cambio chico | Prompt del usuario + 1 skill + archivos directos |
| Medio | Incidente, plan tecnico, revision de modulo | Prompt + resumen + 1-3 skills + evidencia relevante |
| Grande | Implementacion, release, arquitectura multi-dominio | Resumen estructurado + especialistas secuenciales + handoffs |

## Politica de carga

- Cargar primero el orquestador.
- Cargar solo la skill especializada necesaria.
- Cargar referencias largas solo si la skill lo indica o si el riesgo es alto.
- No cargar todos los historiales si existe resumen.
- No mezclar dominios salvo que el usuario o el riesgo lo exija.

## Handoff entre especialistas

Formato obligatorio:

```text
Agent Handoff Summary

Objetivo
- ...

Hechos confirmados
- ...

Hipotesis
- ...

Archivos o evidencia relevante
- ...

Decisiones tomadas
- ...

Riesgos abiertos
- ...

Pendientes para el siguiente especialista
- ...
```

## Resumen de continuidad

Al cerrar una tarea larga, guardar en `outputs/sessions/YYYY-MM-DD-tema-corto.md`:

```text
Continuity Summary

Estado
- ...

Que se hizo
- ...

Que se valido
- ...

Que falta
- ...

Riesgos
- ...

Instrucciones para el proximo agente
- ...
```

## Reciclaje de agentes

Un agente debe compactar o transferir contexto cuando:

- La tarea cambio de etapa.
- Hay mas de un dominio especializado.
- Se acumularon muchas decisiones.
- Se tocaron varios archivos.
- El resumen ya puede reemplazar el historial conversacional.

En esta arquitectura, un agente esta "cargado" cuando la conversacion contiene demasiadas decisiones, evidencia o cambios de etapa para que el siguiente paso pueda hacerse con precision sin compactar. No significa que el modelo falle; significa que el costo de seguir cargando historial supera el valor de resumir.

Umbral recomendado:

- Mas de una etapa de trabajo completada.
- Mas de tres especialistas involucrados.
- Mas de cinco decisiones relevantes.
- Evidencia tecnica mezclada con conversacion comercial.
- Riesgos abiertos que deben sobrevivir a otra sesion.

Disparadores operativos obligatorios:

- Cambio de especialista.
- Cambio de etapa.
- Mas de cinco decisiones relevantes.
- Mas de tres especialistas candidatos.
- La siguiente accion puede ejecutarse desde resumen + referencias.

## Reglas anti-desperdicio

- No repetir la misma evidencia a cada especialista si puede resumirse.
- No pedir un review completo si solo hace falta validar un riesgo puntual.
- No pasar conversaciones largas cuando bastan decisiones y archivos.
- No usar una skill de dominio si el problema es generico.
- No invocar seguridad como rutina si no hay superficie sensible, salvo antes de release.

## Ledger de contexto

Cada handoff o resumen de continuidad debe declarar:

- Keep: hechos, decisiones, archivos, comandos, riesgos y criterios de aceptacion.
- Summarize: historial conversacional, racional repetido y exploraciones descartadas.
- Drop: saludos, duplicados, ramas irrelevantes e hipotesis obsoletas.
- Load on demand: docs largas, referencias vendor, playbooks de dominio y logs crudos.

## Score de eficiencia

Una ejecucion eficiente debe alcanzar 80/100:

| Dimension | Puntos |
| --- | ---: |
| Especialistas minimos utiles | 20 |
| Ledger keep/summarize/drop/load-on-demand claro | 20 |
| Handoff antes de cambiar especialista o etapa | 20 |
| Continuidad recomendada o actualizada cuando aplica | 20 |
| Secretos y datos sensibles excluidos | 10 |
| Validaciones o evidencia registradas | 10 |

## Validacion

```powershell
node scripts\validate-continuity.js
```
