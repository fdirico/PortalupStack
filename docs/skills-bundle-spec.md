# Spec: Skills Bundle — Sincronización automática de skills al instalar el plugin

## Context
- Requested by: Fabian Di Rico (fdirico@portalup.com.co)
- Date: 2026-06-12
- Status: confirmed

## Problem
Los skills PortalUP no están empaquetados en el VSIX. Al instalar el plugin en una máquina nueva, el usuario debe copiar manualmente los skills a `~/.claude/skills/` para que Claude Code los reconozca. Tampoco hay mecanismo de actualización: cuando el desarrollador modifica un skill en `gstack-codex` y publica nueva versión, los usuarios no reciben el cambio automáticamente.

Verificado en código: `vscode-pstack/` no tiene carpeta `skills/`. El `package` script solo corre `copy-runtime` antes de `vsce package`. No existe `.vscodeignore`.

## Goal
Instalar el VSIX en una máquina limpia → abrir cualquier proyecto en Claude Code → `/portalup-orchestrator` y los 27 skills PortalUP disponibles sin ningún paso manual. Al instalar una versión nueva del plugin, los skills se actualizan automáticamente.

## Out of scope
- UI para gestión de skills dentro del plugin
- Detección de personalizaciones del usuario antes de sobreescribir
- Diff/merge entre versión instalada y versión del usuario
- Marketplace de skills
- Sincronización bidireccional (usuario → gstack-codex)

## Systems touched
- `d:\codex\gstack-codex\vscode-pstack\src\extension.ts` — agregar `syncSkillsToClaude()` en `activate()`
- `d:\codex\gstack-codex\vscode-pstack\package.json` — agregar script `copy-skills` y actualizarlo en `package`
- `d:\codex\gstack-codex\.agents\skills\` — source de skills (SOLO LECTURA, nunca modificar)
- `~/.claude/skills/` — destino final en la máquina del usuario

## MVP definition
1. Build: `copy-skills` copia `gstack-codex/.agents/skills/` → `vscode-pstack/skills/`
2. Package: VSIX incluye la carpeta `skills/`
3. Activate: al iniciar el plugin, copia `[extensionPath]/skills/` → `~/.claude/skills/`
4. Resultado: máquina limpia + instalar VSIX = skills disponibles en Claude Code

## Functional requirements
1. El script `copy-skills` copia todos los subdirectorios de `.agents/skills/` a `vscode-pstack/skills/` de forma recursiva.
2. El script `package` ejecuta `copy-skills` antes de `vsce package`.
3. `activate()` llama `syncSkillsToClaude(context.extensionUri.fsPath)` como primera operación.
4. `syncSkillsToClaude()` copia `[extensionPath]/skills/` → `~/.claude/skills/` con `cpSync({ recursive: true, force: true })`.
5. Si `~/.claude/skills/` no existe, se crea con `mkdirSync({ recursive: true })`.
6. Si la copia falla (permisos, disco lleno), el plugin registra el error en la consola de VSCode y continúa activándose — no crashea.
7. La sincronización ocurre en cada activación, garantizando que updates del plugin se reflejen en la próxima apertura de VSCode.
8. Los skills PortalUP en `~/.claude/skills/` son sobreescritos en cada activación (MVP — sin detección de personalizaciones).

## Data model
No hay base de datos. Archivos involucrados:

```
gstack-codex/
└── .agents/skills/portalup-*/   ← source (desarrollo, NO tocar)

gstack-codex/vscode-pstack/
└── skills/portalup-*/           ← bundle (generado por copy-skills, antes de vsce package)

~/.vscode/extensions/portalup.portalup-stack-X.X.X/
└── skills/portalup-*/           ← instalado por VSCode

~/.claude/skills/portalup-*/     ← destino final (Claude Code los lee acá)
```

## API contract
No hay HTTP API. Una función TypeScript nueva:

```typescript
function syncSkillsToClaude(extensionPath: string): void
// Lee: [extensionPath]/skills/
// Escribe: os.homedir()/.claude/skills/
// Throws: nunca — errores se loggean y no propagan
```

## Permissions
No aplica — sin sistema de autenticación.

## UI/UX requirements
- Sin pantallas nuevas.
- Si la sincronización falla: `console.warn('[PortalUP] Skills sync failed: ...')` visible en Output panel de VSCode.
- Sin notificaciones al usuario en caso exitoso (operación silenciosa).

## Test strategy
Patrón existente: `vscode-pstack/tests/*.test.ts` con `node:test` y `ts-node/register`.

Archivo nuevo: `vscode-pstack/tests/skills-sync.test.ts`

**Happy path:**
- `syncSkillsToClaude(extensionPath)` con `skills/portalup-orchestrator/SKILL.md` presente → archivo copiado a destino correcto
- Destino no existe antes de sync → directorio creado automáticamente
- Segunda ejecución (update) → archivos sobreescritos sin error

**Failure path:**
- `skills/` vacío o inexistente en extensionPath → no crash, warning loggeado
- Error de escritura (mock) → no crash, warning loggeado, resto de activate() continúa

**Edge case:**
- Skills parcialmente copiados (interrupción simulada) → segunda activación completa la copia

## Export/output security
No aplica.

## Failure modes and rollback
- `syncSkillsToClaude` falla → plugin sigue funcionando; skills de Claude Code quedan en el estado anterior
- Skills corruptos en el bundle → el usuario puede reinstalar la versión anterior del VSIX
- Rollback: reinstalar versión anterior del VSIX restaura los skills previos en la próxima activación
- `~/.claude/skills/portalup-*` sobreescritos con personalizaciones del usuario → en MVP se pierde (documentado como limitación conocida; Phase 2 agrega detección)

## Open questions
Ninguna.
