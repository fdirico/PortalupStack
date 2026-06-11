# Spec: PortalUP Stack Runtime v1 + v2

## Context
- Requested by: Fabian Di Rico — PortalUP
- Date: 2026-06-11
- Status: confirmed

## Problem

`pstack.js` imprime un string de prompt y hace `process.exit()`. El usuario debe abrir Claude Code o Codex, pegar el prompt, y ejecutarlo manualmente. No hay llamadas a APIs, no hay persistencia, no hay estadísticas. PortalUP Stack es una colección de markdown que depende de otro host para funcionar.

`core/runtime/*.md` y `core/adapters/*/adapter.md` son contratos declarativos en markdown sin ninguna implementación JavaScript o TypeScript detrás. `engines.registry.json` y `skills.registry.json` son descriptivos, no ejecutables.

## Goal

`pstack ask "..."` llama la API del LLM elegido, retorna la respuesta en streaming, guarda la sesión localmente, y actualiza `outputs/stats.md`. El usuario puede cambiar de engine (Claude → OpenAI) con un comando (`pstack switch openai "..."`) y el runtime genera un handoff estructurado automáticamente. Todo ocurre sin abrir Claude Code ni Codex.

## Out of scope

- Cloud sync o almacenamiento remoto de sesiones
- Colaboración multi-usuario o multi-equipo
- Hosting propio de modelos (Ollama, llama.cpp, etc.)
- Plugin VSCode — diferido explícitamente a v2
- Marketplace de skills
- Fine-tuning o training de modelos
- Auto-load de `$skill` references en respuestas del LLM (v2)
- SQLite para persistencia (v2)

## Systems touched

- `scripts/pstack.js` — evoluciona de prompt-printer a entry point del runtime
- `src/` — nueva capa TypeScript (no existe aún)
- `core/registry/engines.registry.json` — extender con campos de runtime
- `portalup.config.example.json` — extender con `activeEngine`, `sessionDir`, `statsFile`, `handoffDir`
- `package.json` — crear (no existe)
- `tsconfig.json` — crear
- `outputs/sessions/` — ya existe en config, se popula con JSON de sesiones
- `outputs/stats.md` — nuevo, auto-generado por stats engine
- `outputs/handoffs/` — nuevo, generado en engine switch
- `.gitignore` — agregar `dist/`, `outputs/sessions/`, `node_modules/`
- `.agents/skills/*/SKILL.md` — sin cambios (27 skills existentes se mantienen intactos)

## MVP definition

CLI que ejecuta de verdad: `pstack ask "..."` llama la API de Claude o GPT-4, guarda la sesión en JSON local, y actualiza stats.md. `pstack switch openai "..."` genera handoff y continúa en nuevo engine. `pstack stats` muestra el estado actual. Sin UI, sin cloud, sin VSCode.

## Functional requirements

1. `pstack ask "<texto>"` llama la API del engine activo, retorna respuesta en streaming al terminal, guarda la sesión en `outputs/sessions/<engine>/<YYYY-MM-DD>-<slug>.json`.
2. `pstack ask "<texto>" --skill portalup-autoplan` inyecta el contenido del SKILL.md especificado como contexto de sistema antes de llamar la API.
3. Si no se especifica `--skill`, el runtime usa `portalup-orchestrator` por defecto (definido en `portalup.config.json`).
4. `pstack switch <engine> "<texto>"` genera un handoff en `outputs/handoffs/` usando `templates/agent-handoff.md`, cierra la sesión activa, abre sesión nueva en el engine destino inyectando el handoff como primer mensaje de contexto.
5. `pstack stats` lee todas las sesiones en `outputs/sessions/` y regenera `outputs/stats.md` con totales globales, por engine y por proyecto.
6. `pstack sessions` lista las últimas 20 sesiones con: ID, engine, fecha, duración, tokens totales, skills usados.
7. `pstack handoff` genera un handoff de la sesión activa sin cambiar de engine (para uso manual o para cerrar contexto).
8. Si `ANTHROPIC_API_KEY` o `OPENAI_API_KEY` no están definidas y el usuario intenta usar ese engine, el runtime muestra un error claro con instrucciones exactas para definir la variable.
9. Las sesiones se escriben con write atómico (`.tmp` + rename) para evitar corrupción por interrupciones.
10. `outputs/sessions/` y `outputs/handoffs/` se excluyen de git por defecto (`.gitignore` actualizado en el instalador).

## Data model

No hay base de datos. Persistencia en JSON files.

**Sesión** (`outputs/sessions/<engine>/<id>.json`):
```json
{
  "id": "2026-06-11-reportes",
  "project": "sidi-ai-dashboard",
  "engine": "claude",
  "model": "claude-sonnet-4-6",
  "startedAt": "2026-06-11T09:00:00Z",
  "endedAt": null,
  "handoffFrom": null,
  "handoffTo": null,
  "tokens": {
    "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0, "estimatedCostUSD": 0
  },
  "skillsUsed": [],
  "messages": [
    { "role": "user", "content": "...", "timestamp": "..." },
    { "role": "assistant", "content": "...", "timestamp": "...", "tokens": { "input": 12000, "output": 800 } }
  ]
}
```

**Stats** (`outputs/stats.md`): markdown auto-generado con tablas por engine y por proyecto.

## API contract

No hay endpoints HTTP. El contrato es la interfaz TypeScript interna:

```typescript
interface EngineAdapter {
  readonly name: string;
  stream(messages: Message[], skillContent: string): AsyncIterable<string>;
  lastUsage(): TokenUsage;
}
```

Engines soportados en v1: `claude` (Anthropic SDK), `openai` (OpenAI SDK).

## Permissions

No hay RBAC. Herramienta de desarrollo local. No aplica.

## UI/UX requirements

CLI solamente en v1. Experiencia de terminal:

- Streaming visible en tiempo real: tokens impresos a medida que llegan
- Header de sesión: `[claude · 2026-06-11-reportes]` antes de la respuesta
- Progreso de tokens en tiempo real durante streaming (actualizado por línea)
- Errores en stderr, respuesta en stdout (separación para pipes)
- `pstack sessions` usa formato tabular alineado
- `pstack stats` imprime la ruta del archivo actualizado + resumen de 3 líneas

**v2 VSCode plugin (diferido):**
- Sidebar con árbol de sesiones por proyecto/fecha
- Status bar: engine activo + tokens sesión actual
- Chat webview tipo Copilot Chat
- Stats panel con stats.md renderizado
- Comparte `src/` runtime con el CLI (TypeScript monorepo simple)

## Test strategy

Framework: `node:test` (built-in Node.js 18+, cero dependencias adicionales).

| Test | Happy path | Failure path | Edge case |
|---|---|---|---|
| `anthropic-adapter.test.ts` | stream completo con tokens | auth error (401) | rate limit (429) con retry |
| `openai-adapter.test.ts` | stream completo con tokens | auth error | context overflow (400) |
| `skill-loader.test.ts` | carga SKILL.md por nombre | skill no existe en registry | SKILL.md file missing en disco |
| `session.test.ts` | create/save/load/list | write failure (disco lleno) | archivo corrupto al cargar |
| `handoff.test.ts` | genera MD desde template + sesión | sesión sin mensajes | cambio claude → openai preserva contexto clave |
| `stats.test.ts` | agrega 3 sesiones, formato correcto | directorio sessions vacío | sesión con endedAt null |

## Export/output security

`outputs/stats.md` contiene solo métricas numéricas agregadas. Seguro para compartir.

`outputs/sessions/` puede contener código de proyectos, contexto de negocio, y potencialmente credenciales si el usuario las incluyó en mensajes. Por defecto va en `.gitignore`. El instalador agrega esta entrada automáticamente.

`outputs/handoffs/` contiene resúmenes de trabajo — puede tener contexto sensible. También en `.gitignore`.

API keys: solo via env vars (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`). El validator de la herramienta detecta patrones de key en archivos rastreados y falla el build.

## Failure modes and rollback

| Falla | Impacto | Mitigación |
|---|---|---|
| API key ausente | Error inmediato, no ejecuta | Mensaje claro con instrucciones |
| LLM API caída | Error tras timeout | Muestra error, sesión parcial guardada con error en metadata |
| Write interrumpido | Sesión corrupta | Write atómico: `.tmp` + rename |
| SKILL.md faltante | Skill no carga | Warning + continuar sin skill (graceful degradation) |
| Context overflow | API retorna 400 | Detectar, mostrar warning, sugerir `pstack compact` |

Rollback de la herramienta: `git checkout` al commit anterior. Las sesiones JSON son independientes del código.

## Open questions

Ninguna. Spec confirmado para implementación.
