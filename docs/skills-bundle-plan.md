# Plan: Skills Bundle — Sincronización automática de skills al activar el plugin

## Status: approved
## Date: 2026-06-12
## Spec: docs/skills-bundle-spec.md

---

## Plan summary

Tres cambios pequeños: (1) script `copy-skills` en package.json que copia `.agents/skills/` al bundle antes de empaquetar, (2) función `syncSkillsToClaude()` en extension.ts que copia los skills del bundle instalado a `~/.claude/skills/` en cada activación, (3) tests para la función de sync. Resultado: instalar el VSIX = skills disponibles en Claude Code sin pasos manuales.

---

## CEO/Strategy findings
- Elimina el único paso manual que impide que el plugin sea usable en una máquina nueva.
- Esfuerzo mínimo (~40 líneas), riesgo cero (aditivo, no destructivo).
- Si sync falla, el plugin sigue funcionando — degradación segura.

## Design findings
Sin pantallas ni componentes. Skip válido.

## Engineering findings

**Data model (filesystem):**
```
gstack-codex/.agents/skills/portalup-*/    ← source (SOLO LECTURA)
                │
                │  npm run copy-skills (build time)
                ▼
vscode-pstack/skills/portalup-*/            ← bundle (generado, no commitear)
                │
                │  vsce package
                ▼
~/.vscode/extensions/portalup.portalup-stack-X.X.X/skills/portalup-*/  ← instalado
                │
                │  syncSkillsToClaude() en activate() (runtime)
                ▼
~/.claude/skills/portalup-*/                ← destino final (Claude Code lo lee)
```

**API contract (función TypeScript):**
```typescript
function syncSkillsToClaude(extensionPath: string): void
// Guard: si extensionPath/skills/ no existe → return (build sin copy-skills)
// Crea ~/.claude/skills/ si no existe
// cpSync(src, dst, { recursive: true, force: true })
// Errores: capturados con try/catch, loggeados como console.warn, no propagados
```

**Migration plan:** No requerida. `~/.claude/skills/` ya existe con skills copiados manualmente — serán sobreescritos con los del bundle (contenido idéntico).

**Test strategy:**
- Archivo: `vscode-pstack/tests/skills-sync.test.ts`
- Framework: `node:test` con `ts-node/register` (patrón del repo)
- Aislamiento: tmpdir único por test run para `extensionPath` y destino
- Happy path: sync con skills presentes → archivos en destino correcto; segunda sync → sobreescribe sin error; dest no existe → se crea automáticamente
- Failure path: `skills/` ausente en extensionPath → return silencioso sin crash; error de escritura simulado → warn loggeado, no throw
- Edge case: subdirectorios anidados copiados correctamente (SKILL.md dentro de carpeta del skill)

## Security findings
Sin hallazgos. Escritura solo en home directory del usuario. Source es bundle del VSIX, sin downloads externos. Sin ejecución de contenido.

---

## Decision audit trail
- [auto P3] `copy-skills` reutiliza el patrón `cpSync` de `copy-runtime`. Cero nueva infraestructura.
- [auto P5] `syncSkillsToClaude` es función standalone en extension.ts. No una clase, no un módulo separado.
- [auto P2] Llamada antes de registrar comandos en `activate()`. Fallo no interrumpe activación.
- [auto P5] Guard si `skills/` no existe → return silencioso. Protege builds parciales.
- [auto P4] Tests usan tmpdir propio. Sin mocks de `fs`. Igual al patrón de `project-manager.test.ts`.

---

## Implementation tasks (ordered)

### Tarea 1 — Agregar `copy-skills` y actualizar `package` en vscode-pstack/package.json
```json
"copy-skills": "node -e \"require('fs').cpSync('../.agents/skills', './skills', {recursive: true, force: true})\"",
"package": "npm run copy-skills && npm run copy-runtime && vsce package --allow-missing-repository --out out/portalup-stack.vsix"
```

### Tarea 2 — Agregar `syncSkillsToClaude()` en vscode-pstack/src/extension.ts y llamarla en `activate()`

### Tarea 3 — Crear vscode-pstack/tests/skills-sync.test.ts

### Tarea 4 — Ejecutar `npm run copy-skills` para generar vscode-pstack/skills/ localmente

### Tarea 5 — Compilar, empaquetar e instalar
```powershell
cd D:\codex\gstack-codex; npx tsc
cd vscode-pstack; Remove-Item -Recurse -Force out, dist
npm run compile; npm run package
code --install-extension out\portalup-stack.vsix
```

### Tarea 6 — Verificar que skills aparecen en `~/.vscode/extensions/portalup.portalup-stack-X.X.X/skills/`

---

## Deferred work (explicit)

- **Detección de personalizaciones del usuario**: antes de sobreescribir, comparar hash del archivo instalado vs hash conocido de la versión anterior. Si el usuario modificó el skill, no sobreescribir. Deferred — complejidad alta para MVP.
- **`copy-skills` en script `compile`**: para tener skills disponibles en modo debug (F5). Deferred — no bloquea el objetivo principal.
- **Notificación al usuario en activación**: "PortalUP: X skills sincronizados a Claude Code." Deferred — nice-to-have.

---

## RBAC note
No aplica.

## Export/CSV security note
No aplica.
