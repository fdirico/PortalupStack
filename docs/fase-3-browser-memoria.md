# Fase 3 futura - Browser, QA visual y memoria externa

Esta fase queda fuera de `0.2.0`.

## Objetivo

Agregar capacidades avanzadas similares a las partes mas potentes de GStack, sin mezclarlo con el cierre del orquestador autonomo.

## Alcance candidato

- QA visual con navegador real.
- Browser automation controlado por agente.
- Browser handoff para login, MFA o bloqueos.
- Memoria externa tipo GBrain o equivalente.
- Sincronizacion de aprendizajes entre proyectos.
- Coordinacion multiagente remota.
- Evaluaciones automatizadas mas profundas.

## Requisitos previos

- Orquestador estable.
- Continuidad persistente local.
- Politicas de secretos y seguridad validadas.
- CLI `pstack` basica funcionando.
- Decidir si se integra GStack directo o se implementa una version PortalUP mas liviana.

## Riesgos

- Exceso de complejidad.
- Captura accidental de datos sensibles en sesiones de navegador.
- Dependencias externas pesadas.
- Mayor consumo de tokens y costo operativo.

## Criterio de inicio

Iniciar esta fase solo cuando `0.2.0` este estable en uso real con proyectos PortalUP.
