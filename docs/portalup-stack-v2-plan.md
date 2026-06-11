# Plan: PortalUP Stack Runtime v1 + v2

## Autoplan status: `approved`

- Spec confirmado: `docs/portalup-stack-v2-spec.md`
- Gauntlet: CEO ✓ · Design ✓ · Eng ✓ · CSO ✓
- Gates bloqueantes: ninguno
- Fecha del plan: 2026-06-11

---

## Plan Summary

Construir la capa de runtime real sobre los contratos que ya existen en el repo.
El cambio principal: `pstack` pasa de imprimir strings a ejecutar llamadas LLM, persistir sesiones, y gestionar handoffs cross-engine.

**v1 (CLI ejecutable):** ~10 días de implementación
**v2 (VSCode plugin):** ~15 días adicionales, diferido post-validación de v1

---

## CEO/Strategy Findings

- **Valor principal:** independencia de proveedor + trazabilidad de costos por cliente/proyecto
- **Riesgo principal resuelto:** scope creep → v1 = CLI solamente; v2 = plugin VSCode diferido
- **Deferred consciente:** cloud sync, colaboración multi-usuario, marketplace, model hosting
- **Decisión:** v1 en producción antes de iniciar v2. No negociable.

---

## Design Findings

**CLI UX (v1):**
- Streaming visible en tiempo real — nunca esperar en silencio
- Header de sesión antes de cada respuesta: `[claude · 2026-06-11-reportes]`
- Errores con instrucciones exactas: `ANTHROPIC_API_KEY no está definida. Ejecutá: export ANTHROPIC_API_KEY=...`
- Session IDs legibles: `YYYY-MM-DD-<slug>` (no UUIDs)
- Stats.md: markdown puro, legible en terminal, exportable, versionable si el usuario quiere

**VSCode plugin UX (v2, diferido):**
- Sidebar: árbol de sesiones por proyecto/fecha
- Status bar: engine activo + tokens sesión actual
- Chat panel: webview tipo Copilot Chat
- Stats panel: stats.md renderizado
- Comparte `src/` runtime con CLI — TypeScript monorepo sin overhead

---

## Engineering Findings

### Nueva estructura de archivos

```
portalup-stack/
├── src/                            ← NUEVO (TypeScript)
│   ├── types.ts                    ← interfaces: Message, Session, TokenUsage, EngineAdapter
│   ├── orchestrator.ts             ← entry point runtime
│   ├── skill-loader.ts             ← carga SKILL.md lazy por nombre
│   ├── session.ts                  ← create/save-atomic/load/list/close
│   ├── handoff.ts                  ← genera MD desde templates/agent-handoff.md
│   ├── stats.ts                    ← agrega sesiones → outputs/stats.md
│   └── adapters/
│       ├── index.ts                ← factory: getAdapter(engine)
│       ├── anthropic.ts            ← Anthropic SDK, streaming, token tracking
│       └── openai.ts               ← OpenAI SDK, misma interfaz
├── dist/                           ← compilado, gitignored
├── tests/
│   └── runtime/                    ← tests por módulo (node:test)
├── package.json                    ← NUEVO
├── tsconfig.json                   ← NUEVO
├── scripts/
│   └── pstack.js                   ← evoluciona: llama dist/orchestrator.js
```

### Dependencias (mínimas)

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "openai": "^4.77.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "@types/node": "^22.0.0"
  }
}
```

Sin bundler, sin framework, sin ORM. `fs` de Node.js para persistencia.

### Interfaz unificada de adapters

```typescript
interface EngineAdapter {
  readonly name: string;
  stream(messages: Message[], skillContent: string): AsyncIterable<string>;
  lastUsage(): TokenUsage;
}
```

### Extensión engines.registry.json

```json
"claude": {
  "authEnvVar": "ANTHROPIC_API_KEY",
  "defaultModel": "claude-sonnet-4-6",
  "maxContextTokens": 200000,
  "sdkPackage": "@anthropic-ai/sdk"
},
"openai": {
  "authEnvVar": "OPENAI_API_KEY",
  "defaultModel": "gpt-4o",
  "maxContextTokens": 128000,
  "sdkPackage": "openai"
}
```

### Test Strategy (obligatoria)

Framework: `node:test` (built-in, cero deps extra)

| Archivo | Happy path | Failure path | Edge case |
|---|---|---|---|
| `anthropic-adapter.test.ts` | stream completo con tokens | auth error 401 | rate limit 429 |
| `openai-adapter.test.ts` | stream completo con tokens | auth error | context overflow 400 |
| `skill-loader.test.ts` | carga SKILL.md por nombre | skill no en registry | archivo faltante en disco |
| `session.test.ts` | create/save/load/list | write failure | JSON corrupto |
| `handoff.test.ts` | genera MD desde template | sesión sin mensajes | handoff cross-engine |
| `stats.test.ts` | agrega 3 sesiones, formato correcto | sessions/ vacío | sesión abierta (endedAt null) |

### Migration plan

No hay base de datos. La única "migración" es extender `portalup.config.json` con campos nuevos que tienen defaults. Backwards compatible.

---

## Security Findings

- **API keys:** solo env vars. El validator detecta patrones de key en archivos rastreados y bloquea build.
- **`outputs/sessions/` y `outputs/handoffs/`:** gitignored por default. Pueden contener código y contexto de clientes.
- **`dist/` y `node_modules/`:** gitignored.
- **Debug mode:** `PSTACK_DEBUG=1` loguea a archivo, nunca a stdout.
- **Write atómico:** `.json.tmp` + rename para evitar corrupción por interrupción.
- **`npm audit`:** agregado a CI como gate.
- **RBAC:** no aplica (herramienta local de desarrollo).

---

## Decision Audit Trail

| # | Decisión | Tipo | Principio aplicado |
|---|---|---|---|
| 1 | TypeScript desde v1 | auto | Principio 2 (tipos en compile time para SDK responses) + Principio 4 (tests requieren mocks tipados) |
| 2 | JSON files para sesiones v1 | auto | Principio 5 (solución más simple; SQLite agrega complejidad sin beneficio real en v1) |
| 3 | Handoff estructurado vs conversión raw de mensajes | auto | Principio 2 (conversión directa tiene pérdida garantizada por diferencias de formato) |
| 4 | SKILL.md files sin cambios | auto | Principio 3 (reutilizar lo que existe y funciona) |
| 5 | `node:test` como framework | auto | Principio 5 (zero deps, Node 18+ built-in) |
| 6 | `outputs/sessions/` en `.gitignore` | auto | Principio 2 (datos de cliente no deben ir a git por default) |
| 7 | Stats como markdown puro | auto | Principio 1 (legible sin UI, exportable, versionable) |
| 8 | v2 VSCode plugin diferido | gate resuelto | Usuario confirmó: v1 primero |
| 9 | LLMs v1: Anthropic + OpenAI | gate resuelto | Usuario eligió Opción B |
| 10 | Stats para cliente/reporte | gate resuelto | Usuario eligió Opción B |

---

## Implementation Tasks (ordenadas)

### Fase 0 — TypeScript setup + registry (1 día)
- [ ] Crear `package.json` con dependencias
- [ ] Crear `tsconfig.json` (target ES2020, module CommonJS, outDir dist/)
- [ ] Crear estructura `src/` con archivos placeholder
- [ ] Agregar `dist/`, `outputs/sessions/`, `outputs/handoffs/`, `node_modules/` a `.gitignore`
- [ ] Extender `core/registry/engines.registry.json` con campos de runtime
- [ ] Extender `portalup.config.example.json` con `activeEngine`, `sessionDir`, `statsFile`, `handoffDir`

### Fase 1 — Anthropic adapter + skill loader (2 días)
- [ ] Implementar `src/types.ts`
- [ ] Implementar `src/adapters/anthropic.ts` (streaming, token tracking, error handling)
- [ ] Implementar `src/skill-loader.ts` (lazy load SKILL.md por nombre desde registry)
- [ ] Tests: `tests/runtime/anthropic-adapter.test.ts`
- [ ] Tests: `tests/runtime/skill-loader.test.ts`

### Fase 2 — OpenAI adapter (1 día)
- [ ] Implementar `src/adapters/openai.ts` (misma interfaz que Anthropic adapter)
- [ ] Implementar `src/adapters/index.ts` (factory `getAdapter(engine)`)
- [ ] Tests: `tests/runtime/openai-adapter.test.ts`

### Fase 3 — Session manager + handoff (2 días)
- [ ] Implementar `src/session.ts` (create, save-atomic, load, list, close)
- [ ] Implementar `src/handoff.ts` (genera MD desde `templates/agent-handoff.md` + sesión)
- [ ] Tests: `tests/runtime/session.test.ts`
- [ ] Tests: `tests/runtime/handoff.test.ts`

### Fase 4 — Stats engine (1 día)
- [ ] Implementar `src/stats.ts` (agrega sesiones JSON → outputs/stats.md)
- [ ] Definir formato stats.md: resumen global, por engine, por proyecto, sesiones recientes
- [ ] Tests: `tests/runtime/stats.test.ts`

### Fase 5 — Orquestador + CLI real (2 días)
- [ ] Implementar `src/orchestrator.ts` (conecta adapters + session + handoff + stats)
- [ ] Refactorizar `scripts/pstack.js` → llama `dist/orchestrator.js`
- [ ] Implementar comandos CLI reales: `ask`, `switch`, `stats`, `sessions`, `handoff`
- [ ] Mantener comandos existentes: `engine`, `runtime`, `package`, `install-claude`
- [ ] Test de integración: `ask` end-to-end → sesión guardada → stats actualizado

### Fase 6 — Hardening + release v0.5.0 (1 día)
- [ ] Actualizar `validate-all.js` para validar estructura `src/` y `dist/`
- [ ] Agregar validator: detectar patrones de API key en archivos rastreados
- [ ] Actualizar `install-claude-project.ps1`/`.sh` para ejecutar `npm install && npx tsc` al instalar
- [ ] Actualizar `scripts/doctor.js` para verificar env vars y build
- [ ] `CHANGELOG.md`: entrada v0.5.0
- [ ] `VERSION`: 0.4.0 → 0.5.0
- [ ] `README.md`: sección de uso del CLI real
- [ ] Commit + push a `fdirico/PortalupStack`

---

## Deferred Work (explícito)

| Ítem | Razón del diferimiento |
|---|---|
| VSCode plugin (`vscode-pstack/`) | Runtime de v1 debe estar validado en uso real primero. Estima 2-3 semanas adicionales post-v1. |
| SQLite para stats históricas | Beneficio real solo cuando hay cientos de sesiones. JSON es suficiente para v1. |
| Auto-load de `$skill` references en respuestas | Requiere streaming + tool call support. Complejidad de v2. |
| Soporte Gemini / Cursor / otros engines | Después de que la interfaz de adapter esté probada con Anthropic + OpenAI. |
| Monorepo CLI + VSCode plugin | Después de que exista el plugin (v2). |

---

## Restore Point

Estado del repo al inicio de este plan: `commit 9522650` (v0.4.0 — spec-driven development + gauntlet).
Rama: `main`. Remote: `https://github.com/fdirico/PortalupStack.git`.

En caso de necesitar abortar: `git reset --hard 9522650`.
