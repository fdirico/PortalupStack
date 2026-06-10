# Claude Code Adapter

## Estado

Validado como paquete de proyecto.

## Base oficial verificada

Claude Code descubre skills desde filesystem:

- Project Skills: `.claude/skills/`
- User Skills: `~/.claude/skills/`
- Cada skill vive en un directorio con `SKILL.md`.
- `SKILL.md` requiere frontmatter YAML con `name` y `description`.
- Claude carga metadata al inicio y el contenido completo solo cuando la skill se activa.

Fuentes verificadas:

- https://code.claude.com/docs/en/agent-sdk/skills
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview

## Objetivo

Traducir PortalUP Stack Core a una estructura operativa compatible con Claude Code:

```text
CLAUDE.md
.claude/
  skills/
    portalup-orchestrator/
      SKILL.md
      references/
    portalup-review/
      SKILL.md
      references/
```

## Formato de instalacion

Proyecto:

```text
<project>/.claude/skills/<skill>/SKILL.md
<project>/CLAUDE.md
```

Usuario:

```text
~/.claude/skills/<skill>/SKILL.md
```

## Convenciones PortalUP

- `portalup-orchestrator` sigue siendo el punto de entrada.
- Las skills conservan formato `SKILL.md`.
- Se excluyen archivos Codex-specific como `agents/openai.yaml`.
- `CLAUDE.md` contiene instrucciones de workspace para iniciar por el orquestador y usar continuidad.

## Pendientes

- Probar en una sesion real de Claude Code instalada.
- Crear fixture Codex -> Claude con handoff.
- Crear instalador directo para copiar a `.claude/skills`.
