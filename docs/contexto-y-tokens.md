# Contexto y tokens

Este documento define como PortalUP Stack Codex debe optimizar contexto cuando use un orquestador autonomo.

## Principio

El mejor uso de tokens no es cargar todo. Es entregar a cada especialista el contexto minimo suficiente para decidir bien.

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

Al cerrar una tarea larga, guardar:

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

## Reglas anti-desperdicio

- No repetir la misma evidencia a cada especialista si puede resumirse.
- No pedir un review completo si solo hace falta validar un riesgo puntual.
- No pasar conversaciones largas cuando bastan decisiones y archivos.
- No usar una skill de dominio si el problema es generico.
- No invocar seguridad como rutina si no hay superficie sensible, salvo antes de release.
