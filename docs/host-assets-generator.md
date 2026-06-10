# Host Assets Generator

`scripts/generate-host-assets.js` genera paquetes por engine desde PortalUP Stack Core.

No instala archivos en el usuario ni en un proyecto cliente. Escribe en `dist/host-assets/<engine>` cuando se usa `--write`.

## Comandos

Dry-run:

```powershell
node scripts\generate-host-assets.js --engine codex --dry-run
node scripts\generate-host-assets.js --engine claude --dry-run
node scripts\generate-host-assets.js --engine cursor --dry-run
```

Generar paquete:

```powershell
node scripts\generate-host-assets.js --engine codex --write
node scripts\generate-host-assets.js --engine claude --write
node scripts\generate-host-assets.js --engine cursor --write
```

Cambiar salida:

```powershell
node scripts\generate-host-assets.js --engine codex --out dist\custom-assets --write
```

## Salidas

```text
dist/host-assets/
  codex/
    AGENTS.md
    README.md
    scripts/
    skills/
  claude/
    CLAUDE.md
    README.md
    .claude/
      skills/
    templates/
  cursor/
    .cursor/rules/portalup-stack.mdc
    README.md
    skills/
    templates/
```

## Estado por engine

| Engine | Estado | Salida |
| --- | --- | --- |
| Codex | Operativo baseline | Paquete de skills e instrucciones Codex |
| Claude | Paquete de proyecto validado | `.claude/skills` + `CLAUDE.md`; requiere prueba real en Claude Code |
| Cursor | Paquete inicial | Prompt bundle + regla workspace inicial; requiere validar formato nativo exacto |

## Reglas de seguridad

- Por defecto el generador corre en `--dry-run`.
- `--write` solo escribe dentro de `dist/host-assets` salvo que el usuario defina `--out`.
- No copia archivos a `%USERPROFILE%`, `.codex`, `.claude` ni `.cursor` de un proyecto real.
- Los paquetes generados son artefactos de distribucion/prueba.

## Relacion con `pstack`

`pstack` no ejecuta el generador directamente. Muestra el comando recomendado:

```powershell
node scripts\pstack.js package codex
node scripts\pstack.js package claude
node scripts\pstack.js package cursor
node scripts\pstack.js install-claude "D:\ruta\de\tu-proyecto"
```
