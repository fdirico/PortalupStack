# Plan: Sistema de Gestión de Proyectos — PortalUP Stack

## Status: approved
## Date: 2026-06-12
## Spec: docs/project-manager-spec.md

---

## Plan summary

Nuevo módulo `src/project-manager.ts` que implementa las 4 operaciones del MVP (crear, cargar, escribir, listar proyectos) y la numeración de sesiones. El módulo es standalone, sin acoplamiento al `SessionManager` existente. La lógica de "qué actualizar en project.md" vive en el Orchestrator skill (ya escrito), no en TypeScript.

---

## CEO/Strategy findings

- ROI alto: elimina el cold-start por pérdida de contexto entre sesiones.
- Scope lean y correcto. Riesgo de scope creep mínimo.
- Sin exposición externa, sin cambios de auth, sin migraciones.

## Design findings

- No hay pantallas ni componentes tocados en el MVP. Skip válido.
- UX: header `[Project: nombre | Session: YYYYMMDD-N]` en respuestas del Orchestrator (ya definido en SKILL.md).

## Engineering findings

**Data model (filesystem):**
```
$PORTALUP_HOME/                    ← env var, default: os.homedir()/.portalup
├── config.json                    ← { "projectsDir": "$PORTALUP_HOME/projects" }
└── projects/
    └── [nombre]/
        ├── project.md             ← documento vivo
        └── sessions/
            ├── 20260612-1.md
            └── 20260612-2.md
```

**Path resolution:**
- `PORTALUP_HOME` env var → fallback `os.homedir()/.portalup`
- En esta máquina: setear `PORTALUP_HOME=D:\codex\.portalup`

**API contract (no HTTP — funciones TypeScript):**
```typescript
ProjectManager.create(name, templateContent): void
ProjectManager.exists(name): boolean
ProjectManager.load(name): string          // throws si no existe
ProjectManager.write(name, content): void
ProjectManager.getNextSessionId(name): string   // retorna YYYYMMDD-N
ProjectManager.createSessionFile(name, sessionId, content): void
ProjectManager.list(): ProjectInfo[]
```

**Migration plan:** No requerida. `outputs/sessions/` existente no se toca.

**Test strategy:**
- Archivo: `tests/project-manager.test.ts`
- Framework: `node:test` con `ts-node/register`
- Aislamiento: `PORTALUP_HOME` → tmpdir único por test run
- Happy path: create → load → write → list
- Failure path: load proyecto inexistente → error descriptivo; nombre vacío → error
- Edge cases: nombre con espacios normaliza a kebab-case; segunda creación del mismo proyecto

## Security findings

- Path traversal mitigado por `slugify` (elimina `/`, `\`, `.`)
- Guard adicional: `if (!slug) throw Error("Nombre de proyecto inválido")` antes de crear directorio
- Sin exposición de datos externos, sin auth, sin credenciales

---

## Decision audit trail

- [auto P5] PORTALUP_HOME env var + fallback os.homedir()/.portalup. Sin búsqueda de paths arbitrarios.
- [auto P3] Lógica de "qué actualizar" vive en Orchestrator SKILL.md (ya escrito). TypeScript solo lee y escribe.
- [auto P5] ProjectManager standalone, sin acoplamiento a SessionManager ni RuntimeBridge.
- [auto CSO] Guard `if (!slug) throw` después de slugify para inputs vacíos o solo-símbolos.
- [auto P4] Tests usan PORTALUP_HOME → tmpdir para aislamiento total sin efectos sobre el sistema real.

---

## Implementation tasks (ordered)

### Tarea 1 — Crear D:\codex\.portalup\config.json
- Archivo global de configuración
- Contenido: `{ "projectsDir": "D:\\codex\\.portalup\\projects" }`
- Nota: requiere que `PORTALUP_HOME=D:\codex\.portalup` esté seteado en el sistema

### Tarea 2 — Actualizar portalup.config.example.json
- Agregar campo `"projectsDir": ""` con comentario explicativo

### Tarea 3 — Crear src/project-manager.ts
- Módulo TypeScript con clase `ProjectManager`
- Funciones: create, exists, load, write, getNextSessionId, createSessionFile, list
- Helpers: slugify, resolvePortalupHome, readGlobalConfig
- Guard de seguridad en slugify

### Tarea 4 — Crear tests/project-manager.test.ts
- Happy path: crear, cargar, actualizar, listar
- Failure path: proyecto inexistente, nombre inválido
- Edge cases: kebab-case normalization, segunda creación

### Tarea 5 — Verificar compilación TypeScript
- `npx tsc --noEmit` desde d:\codex\gstack-codex
- Sin errores en tipos

---

## Deferred work (explicit)

- **Plugin: sesiones JSON en project folder** — `RuntimeBridge.loadConfig()` necesita leer `PORTALUP_HOME/config.json` además del config de workspace. Deferred porque el MVP entrega el valor central sin tocar el Plugin.
- **UI en Plugin para gestión de proyectos** — lista, crear desde sidebar. Deferred hasta que los comandos de texto estén validados en uso real.
- **Migración de outputs/sessions/** — baja prioridad; sesiones históricas no tienen project.md asociado.
- **Eliminación de proyectos** — comando `eliminar proyecto`. Deferred por bajo uso esperado y riesgo de pérdida de datos.

---

## RBAC note
No aplica. Sin sistema de autenticación de usuarios.

## Export/CSV security note
No aplica. Sin exportación de datos.
