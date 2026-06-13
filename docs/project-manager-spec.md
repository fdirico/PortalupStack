# Spec: Sistema de Gestión de Proyectos — PortalUP Stack

## Context
- Requested by: Fabian Di Rico (fdirico@portalup.com.co)
- Date: 2026-06-12
- Status: confirmed

## Problem
Cada sesión empieza en frío. `session.project` se deriva del `package.json`, no de un proyecto nombrado por el usuario. Las sesiones viven en `outputs/sessions/[engine]/[id].json` relativo al workspace, sin estado compartido entre sesiones ni plataformas. Al abrir una nueva conversación en cualquier plataforma, el usuario re-explica el contexto desde cero.

## Goal
Luego de `continuar proyecto [nombre]`, el Orchestrator inyecta el estado actual del proyecto y el agente trabaja sin re-explicación. Funciona desde Claude Code CLI, PortalUP Plugin (VSCode), y cualquier plataforma futura.

## Out of scope
- UI en el Plugin para gestión de proyectos (solo comandos de texto en MVP)
- Migración de `outputs/sessions/` existente al nuevo path
- Proyectos compartidos / multi-usuario
- Comando `eliminar proyecto`
- Git tracking automático de `project.md`
- Plugin guardando sesiones JSON en project folder (segunda fase separada)

## Systems touched
- `d:\codex\gstack-codex\.agents\skills\portalup-orchestrator\SKILL.md` — ya modificado
- `d:\codex\gstack-codex\templates\project-living-doc.md` — ya creado
- `d:\codex\gstack-codex\portalup.config.example.json` — agregar campo `projectsDir`
- `D:\codex\.portalup\config.json` — nuevo archivo global (a crear en implementación)
- `d:\codex\gstack-codex\src\session.ts` — sin cambios de código; ya acepta `sessionDir` custom

## MVP definition
1. `crear proyecto [nombre]` → crea `D:\codex\.portalup\projects\[nombre]\project.md` + `sessions\`
2. `continuar proyecto [nombre]` → inyecta `project.md` como contexto, asigna sesión `YYYYMMDD-N`
3. `actualizar proyecto` (manual + automático) → actualiza `project.md` con decisiones confirmadas
4. `ver proyectos` → lista proyectos en `D:\codex\.portalup\projects\`

## Functional requirements
1. `crear proyecto sidi-reporteria` crea `D:\codex\.portalup\projects\sidi-reporteria\project.md` usando el template `templates/project-living-doc.md`, con nombre, fecha y estado `active`.
2. `crear proyecto sidi-reporteria` cuando el proyecto ya existe muestra confirmación antes de sobreescribir.
3. `continuar proyecto [nombre]` lee `project.md`, inyecta su contenido completo como contexto activo, y anuncia `[Project: nombre | Session: YYYYMMDD-N]`.
4. `continuar proyecto xyz` cuando xyz no existe pregunta "¿Querés crearlo?" sin crash.
5. `actualizar proyecto` escribe solo decisiones, hechos y riesgos destilados en `project.md`. Sin transcripciones ni pasos de implementación.
6. La regla automática de actualización se ejecuta después de toda respuesta que contenga una decisión o descubrimiento confirmado, sin intervención del usuario.
7. `ver proyectos` lista todos los directorios en `D:\codex\.portalup\projects\` con nombre y fecha de última modificación de `project.md`.
8. Volver a una sesión anterior (ej: "recordé algo de la sesión 2") no reabre esa sesión como activa; carga `project.md` + el archivo específico como referencia adicional; continúa en la sesión activa actual.

## Data model
No hay base de datos. Estructura de archivos:

```
D:\codex\.portalup\
├── config.json                     ← { "projectsDir": "D:\\codex\\.portalup\\projects" }
└── projects\
    └── [nombre]\
        ├── project.md              ← documento vivo (template: project-living-doc.md)
        └── sessions\
            ├── 20260612-1.md       ← continuity-summary.md
            └── 20260612-2.md
```

Sin migración requerida. Las sesiones existentes en `outputs/sessions/` no se tocan.

## API contract
No hay HTTP API. Interfaz exclusivamente por comandos en lenguaje natural reconocidos por el Orchestrator skill.

## Permissions
No aplica — herramienta de desarrollo sin sistema de autenticación de usuarios.

## UI/UX requirements
- Sin pantallas nuevas en el Plugin para el MVP.
- El Orchestrator muestra el header `[Project: nombre | Session: YYYYMMDD-N]` al inicio de cada respuesta cuando hay un proyecto activo.
- Mensajes de error claros con propuesta de acción concreta ("Proyecto no encontrado. ¿Querés crearlo?").

## Test strategy
No existen tests del runtime PortalUP Stack hoy — todos los tests del repo son de `vendor/gstack/browse/`. Se establece el patrón con un nuevo archivo: `tests/project-manager.test.ts`

**Happy path:**
- `crear proyecto foo` → directorio `[projectsDir]/foo/` y `project.md` creados con contenido del template
- `continuar proyecto foo` → retorna contenido de `project.md` correctamente
- `actualizar proyecto` → `project.md` modificado solo en secciones Decisions/Facts; resto intacto

**Failure path:**
- `continuar proyecto noexiste` → mensaje "no encontrado" sin crash ni excepción no manejada
- `project.md` corrupto o vacío → error descriptivo, no stack trace

**Edge cases:**
- Nombre con espacios: `crear proyecto Mi Proyecto AA1` → normalizado a `mi-proyecto-aa1`
- Segunda llamada a `crear proyecto foo` → pide confirmación antes de sobreescribir

## Export/output security
No aplica — no hay exportación de datos.

## Failure modes and rollback
- `project.md` no existe al llamar `continuar` → mensaje claro, ofrece crear sin crash
- `D:\codex\.portalup\` no existe → `crear proyecto` lo crea con `mkdirSync({ recursive: true })`
- `project.md` crece >3000 tokens → Orchestrator advierte y sugiere purgar secciones obsoletas
- Escrituras simultáneas de dos sesiones en `project.md` → last-write-wins; riesgo bajo (usuario único)
- Rollback: `project.md` es texto plano, editable manualmente o restaurable desde git si el usuario lo commitea

## Open questions
Ninguna. Todas las preguntas de Phase 1 y Phase 2 resueltas antes de producir este documento.
