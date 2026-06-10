# Claude Code Adapter

## Estado

Validado como paquete de proyecto para Etapa 3.

## Fuentes oficiales verificadas

- Claude Code SDK Skills: https://code.claude.com/docs/en/agent-sdk/skills
- Anthropic Agent Skills overview: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- Claude Code setup: https://code.claude.com/docs/en/getting-started

## Hallazgos aplicables

- Claude Code usa skills de filesystem.
- Las Project Skills viven en `.claude/skills/`.
- Las User Skills viven en `~/.claude/skills/`.
- Cada skill debe ser un directorio con `SKILL.md`.
- `SKILL.md` requiere frontmatter YAML con `name` y `description`.
- Claude descubre metadata al inicio y carga el contenido completo cuando la skill se activa.
- Las skills de Claude Code son separadas de claude.ai y Claude API; no sincronizan automaticamente entre superficies.

## Salida PortalUP Stack

El generador produce:

```text
dist/host-assets/claude/
  CLAUDE.md
  .claude/
    skills/
      portalup-orchestrator/
        SKILL.md
        references/
      portalup-review/
        SKILL.md
        references/
      ...
  templates/
    agent-handoff.md
    continuity-summary.md
```

## Uso esperado

1. Generar paquete:

```powershell
node scripts\generate-host-assets.js --engine claude --write
```

2. Instalar en un proyecto:

```powershell
.\scripts\install-claude-project.ps1 "D:\ruta\de\tu-proyecto" -DryRun
.\scripts\install-claude-project.ps1 "D:\ruta\de\tu-proyecto" -Force
```

3. Abrir Claude Code en ese proyecto:

```powershell
claude
```

4. Pedir:

```text
Usa portalup-orchestrator. Necesito continuar esta tarea con el metodo PortalUP Stack.
```

## Limitaciones

- Aun no se ejecutaron pruebas reales dentro de Claude Code en esta maquina.
- El instalador de proyecto no instala en `~/.claude/skills`.
- Existe fixture de continuidad Codex -> Claude; falta prueba real con Claude Code.
- Falta crear instalador directo para copiar el paquete al proyecto objetivo.
