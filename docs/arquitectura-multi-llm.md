# Arquitectura Multi-LLM de PortalUP Stack

## Objetivo

Convertir PortalUP Stack en una capa de trabajo independiente del motor de IA, capaz de operar con Codex, Claude Code u otros LLMs de codigo mediante adaptadores. El Core mantiene metodologia, skills, memoria, continuidad y reglas de orquestacion; el motor activo aporta razonamiento, edicion de codigo y ejecucion segun sus capacidades.

## Principio de diseno

PortalUP Stack no intenta reemplazar al LLM. Define el contrato operativo que cualquier LLM debe seguir.

```text
Usuario
  |
  v
PortalUP Stack Core
  |
  +-- Intencion y routing
  +-- Registro de skills
  +-- Politicas de riesgo
  +-- Politicas de contexto y tokens
  +-- Memoria y continuidad
  +-- Templates de handoff
  |
  v
Engine Adapter
  |
  +-- Codex Adapter
  +-- Claude Code Adapter
  +-- Cursor Adapter
  +-- Gemini CLI Adapter
  |
  v
LLM de codigo activo
  |
  v
Aplicacion objetivo / repositorio cliente
```

## Estructura propuesta

```text
gstack-codex/
  portalup.config.example.json
  core/
    runtime/
      README.md
      engine-contract.md
      routing-policy.md
      context-policy.md
      handoff-policy.md
    registry/
      skills.registry.json
      engines.registry.json
    adapters/
      codex/
        adapter.md
        install-targets.json
      claude/
        adapter.md
        install-targets.json
      cursor/
        adapter.md
        install-targets.json
  .agents/
    skills/
      portalup-orchestrator/
      portalup-review/
      portalup-cso/
      ...
  templates/
    agent-handoff.md
    continuity-summary.md
  outputs/
    sessions/
  dist/
    host-assets/
      codex/
      claude/
        CLAUDE.md
        .claude/
          skills/
      cursor/
```

## Componentes

### PortalUP Stack Core

Responsable de conservar la metodologia portable:

- Interpretacion de intencion a nivel de proceso.
- Seleccion de especialistas.
- Reglas de riesgo y escalamiento.
- Politicas de compactacion de contexto.
- Formatos de continuidad entre sesiones.
- Contrato minimo que debe cumplir cada adaptador.

### Engine Adapter

Responsable de traducir el Core al formato del motor activo:

- Codex: skills en `.codex/skills`, referencias `$portalup-*`, instrucciones `AGENTS.md`.
- Claude Code: estructura equivalente en `.claude`, comandos o instrucciones del host.
- Cursor: reglas/instrucciones del workspace y prompts empaquetados.
- Otros motores: adapter especifico con capacidades declaradas.

### Engine activo

Responsable de ejecutar:

- Lectura del repositorio objetivo.
- Razonamiento sobre codigo, arquitectura o negocio.
- Edicion de archivos cuando el host lo permita.
- Comandos de validacion.
- Reporte final y handoff.

### Host Assets Generator

Responsable de producir paquetes por engine desde el Core:

- Codex: copia skills, `AGENTS.md` y scripts base hacia `dist/host-assets/codex`.
- Claude: genera paquete de proyecto con `CLAUDE.md`, `.claude/skills` y templates hacia `dist/host-assets/claude`.
- Cursor: genera regla workspace inicial, skills y templates hacia `dist/host-assets/cursor`.

El generador no instala directamente en el usuario ni en proyectos cliente. La instalacion nativa por engine queda para etapas posteriores.

## Flujo de ejecucion

```text
1. El usuario abre una conversacion en el proyecto objetivo.
2. El usuario invoca PortalUP Stack o usa el orquestador instalado.
3. El Core carga configuracion, memoria y registro de skills.
4. El Core determina intencion, dominio, riesgo y etapa.
5. El Adapter prepara el prompt/instrucciones para el engine activo.
6. El LLM ejecuta el trabajo.
7. El resultado se devuelve en formato PortalUP.
8. Se actualiza continuidad para que otro engine pueda continuar.
```

## Contrato minimo entre Core y LLM

Todo engine debe poder recibir o reconstruir:

- Objetivo del usuario.
- Estado actual del trabajo.
- Skills sugeridos.
- Politicas de riesgo.
- Politicas de contexto.
- Archivos o areas relevantes.
- Checklist pendiente.
- Formato de salida esperado.
- Resumen de continuidad.

## Portabilidad realista

La portabilidad no sera identica al 100% porque cada herramienta tiene capacidades distintas. El objetivo es que la continuidad, la metodologia y la decision de especialistas sean estables aunque cambie el LLM.

Ejemplo:

```json
{
  "engine": "codex",
  "mode": "autonomous",
  "defaultSkill": "portalup-orchestrator",
  "contextPolicy": "compact-and-handoff"
}
```

Cambio de motor:

```json
{
  "engine": "claude",
  "mode": "autonomous",
  "defaultSkill": "portalup-orchestrator",
  "contextPolicy": "compact-and-handoff"
}
```

## Decisiones abiertas

- Probar el paquete Claude en una sesion real de Claude Code antes de marcarlo como operativo completo.
- Definir formato universal de skill.
- Definir si se versionan sesiones por proyecto, por usuario o por workspace.
- Definir politica de memoria local versus memoria externa.
