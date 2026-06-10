# Roadmap PortalUP Stack Multi-LLM

## Vision

PortalUP Stack debe evolucionar de una distribucion de skills para Codex a un sistema portable de orquestacion, continuidad y especializacion que pueda operar sobre distintos LLMs de codigo.

## Etapa 1 - Core portable y contrato de runtime

Objetivo: definir la base comun que no depende de Codex.

Entregables:

- Documento de arquitectura Multi-LLM.
- Configuracion ejemplo `portalup.config.example.json`.
- Contrato de engine.
- Registro inicial de engines.
- Registro inicial de skills.
- Politicas iniciales de routing, contexto y handoff.
- Adapter Codex documentado como referencia.

Criterio de cierre:

- Un agente puede entender como PortalUP Stack decide, enruta y conserva continuidad sin depender de instrucciones exclusivas de Codex.

## Etapa 2 - Generador de assets por host

Objetivo: generar paquetes de PortalUP Stack para cada engine desde el Core.

Entregables:

- Script `scripts/generate-host-assets.js`.
- Modo `--dry-run`.
- Modo `--write`.
- Paquete Codex en `dist/host-assets/codex`.
- Paquete Claude inicial en `dist/host-assets/claude`.
- Paquete Cursor inicial en `dist/host-assets/cursor`.
- Comandos `pstack engine`, `pstack runtime` y `pstack package`.
- Guia de generador de assets.

Criterio de cierre:

- Un agente puede generar assets por engine sin tocar instalaciones reales ni proyectos cliente.

## Etapa 3 - Adapter Claude Code validado

Objetivo: convertir el paquete Claude inicial en una salida validada para uso real.

Entregables:

- Confirmacion del formato operativo actual de Claude Code.
- Mapeo de skills PortalUP a `.claude/skills`.
- Guia de uso Claude.
- Fixture de continuidad Codex -> Claude.
- Instalador de proyecto Claude.
- Validacion documental del cambio de engine.

Criterio de cierre:

- Una sesion iniciada en Codex puede ser continuada en Claude Code usando handoff de PortalUP Stack.

Estado actual:

- Formato oficial verificado.
- Generador actualizado a `.claude/skills`.
- Instalador de proyecto y fixture Codex -> Claude creados.
- Pendiente prueba real en Claude Code.

## Etapa 4 - CLI de runtime

Objetivo: convertir configuracion y adapters en una herramienta ejecutable.

Entregables:

- Comando `pstack engine`.
- Comando `pstack handoff`.
- Comando `pstack package`.
- Validadores de configuracion.
- Seleccion de engine desde `portalup.config.json`.

Criterio de cierre:

- El usuario puede cambiar el engine configurado y generar instrucciones adaptadas al host elegido.

## Etapa 5 - Gestion avanzada de contexto y tokens

Objetivo: optimizar continuidad y costos.

Entregables:

- Politica de compactacion por umbrales.
- Resumen operativo por sesion.
- Registro de especialistas usados.
- Rotacion de agentes por carga contextual.
- Handoff incremental.

Criterio de cierre:

- El sistema puede reducir contexto repetido y preparar continuidad para otro agente o engine.

## Etapa 6 - Memoria portable por proyecto

Objetivo: conservar conocimiento operacional por aplicacion objetivo.

Entregables:

- Directorio de memoria por proyecto.
- Indice de decisiones.
- Registro de incidentes, releases y arquitectura.
- Politica de retencion.
- Integracion con el orquestador.

Criterio de cierre:

- PortalUP Stack puede recordar decisiones relevantes sin depender de una conversacion especifica.

## Etapa 7 - Validacion multi-engine

Objetivo: probar la portabilidad con casos reales.

Entregables:

- Fixtures Codex.
- Fixtures Claude.
- Comparacion de resultados.
- Matriz de capacidades por engine.
- Recomendaciones por tipo de trabajo.

Criterio de cierre:

- Existe evidencia de que la metodologia PortalUP se mantiene estable aunque cambie el motor.

## Plan de trabajo inmediato

1. Validar formato oficial actual de Claude Code.
2. Definir instalador nativo Claude o paquete de workspace.
3. Crear fixture Codex -> Claude.
4. Agregar comando `pstack config`.
5. Agregar lectura de `portalup.config.json` real si existe.
