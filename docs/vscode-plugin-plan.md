# Plan: PortalUP Stack VSCode Plugin (v2)

## Context
- Spec: `docs/vscode-plugin-spec.md`
- Date: 2026-06-11
- Status: approved — ready for implementation

## CEO/Strategy findings

El plugin cierra el círculo de independencia de PortalUP Stack. Sin él, `pstack ask` es solo texto — el LLM no puede navegar ni modificar el proyecto. Con él, el desarrollador tiene una alternativa real a Claude Code dentro de VSCode.

MVP scope correcto y ajustado. Exclusiones justificadas: stats panel visual, Marketplace, multi-workspace.

Riesgo: `run_command` es poder real. Gate de confirmación obligatorio, no configurable.

## Design findings

**IA:**
- Activity bar → sidebar con dos vistas: "Chat" (WebviewPanel) y "Sessions" (TreeDataProvider)
- Status bar: ítem persistente abajo a la izquierda — click abre el chat
- Chat: flexbox column — mensajes arriba con scroll, input fijo al fondo
- Sesiones: grupos colapsables por fecha (Today / Yesterday / YYYY-MM-DD), ícono por engine

**Visual:**
- CSS variables VSCode (`--vscode-editor-background`, `--vscode-editor-foreground`) — dark/light automático
- Mensajes: usuario derecha, asistente izquierda (estilo Copilot Chat)
- Tool indicators: chips inline neutrales en el chat

**Confirmaciones:** via `vscode.window.showWarningMessage()` nativo (no modales en webview).

## Engineering findings

### Hallazgo crítico — interface change sin romper existente

`EngineAdapter.stream()` actual tiene 30 tests passing y el CLI lo usa. Solución: agregar `streamEvents?` como método **opcional** en la interfaz. Los adapters existentes no cambian. El plugin usa el nuevo método.

### Tipos nuevos en `src/types.ts`

```typescript
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema
}

export type StreamEvent =
  | { type: 'text'; chunk: string }
  | { type: 'tool_call'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'done' };

// En EngineAdapter — agregar:
streamEvents?(
  messages: Message[],
  skillContent: string,
  tools: ToolDefinition[],
  options?: CallOptions
): AsyncIterable<StreamEvent>;
```

### Tool loop — arquitectura multi-turno

```
askWithTools(root, input, tools, onEvent, options):
  messages = [user message]  // ApiMessage local (tipos ricos del SDK, no Message.content)
  maxTurns = 10

  while turns < maxTurns:
    textChunks = []
    toolCalls = []
    
    for await event in adapter.streamEvents(messages, skill, tools):
      type 'text'      → onEvent(event) + accumulate
      type 'tool_call' → onEvent(event) (muestra indicador) + accumulate
    
    if toolCalls.empty → done (respuesta final)
    
    for each toolCall:
      result = await executor(toolCall)  // puede mostrar dialog al usuario
    
    append assistant turn (con tool_use blocks) + tool_result messages
    turns++
  
  if maxTurns reached → onEvent({ type: 'text', chunk: '\n[max tool turns reached]' })
```

El loop usa `apiMessages` local con tipos ricos del SDK. `Message.content: string` del session manager no cambia.

### Confirmation injection (testabilidad)

```typescript
// tools/shell-tools.ts
export async function runCommand(
  cmd: string,
  confirm: (cmd: string) => Promise<boolean>  // injectable
): Promise<string>

// extension.ts → pasa vscode.window.showWarningMessage()
// tests → pasa mock que devuelve true/false
```

### Workspace root guard (obligatorio CSO)

```typescript
function assertInWorkspace(filePath: string, wsRoot: string): void {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(wsRoot))) {
    throw new Error(`Path outside workspace: ${filePath}`);
  }
}
// También excluir: outputs/sessions/, outputs/handoffs/
```

### Estructura de archivos

```
vscode-pstack/
├── package.json           ← manifest + contributes + build scripts
├── tsconfig.json          ← paths: { "@pstack/*": ["../src/*"] }
├── src/
│   ├── extension.ts       ← activate(), vistas, comandos
│   ├── runtime-bridge.ts  ← adapter + tools + session manager + onEvent dispatch
│   ├── views/
│   │   ├── ChatPanel.ts   ← WebviewPanel, postMessage streaming, HTML escaping
│   │   ├── SessionTree.ts ← TreeDataProvider agrupado por fecha
│   │   └── StatusBar.ts   ← StatusBarItem
│   └── tools/
│       ├── index.ts       ← ToolDefinition[] para el LLM
│       ├── file-tools.ts  ← read_file, write_file, list_directory + workspace guard
│       └── shell-tools.ts ← run_command + confirmation injection
├── media/
│   ├── chat.html          ← webview HTML con CSP estricto
│   └── icon.svg
└── tests/
    ├── file-tools.test.ts
    ├── shell-tools.test.ts
    └── runtime-bridge.test.ts
```

## Security findings

| Amenaza | Mitigación | Obligatorio |
|---|---|---|
| Path traversal en file tools | `assertInWorkspace()` en read_file y write_file | Sí |
| XSS en webview | `textContent` en lugar de `innerHTML` para output LLM | Sí |
| run_command privilege escalation | `showWarningMessage()` con comando completo sin truncar | Sí |
| API key exposure | Solo desde `process.env`, nunca al webview | Ya implementado |
| Bucle infinito en tool loop | Max 10 turns con mensaje de error | Sí |

## Decision audit trail

- `[auto]` `streamEvents?` opcional — preserva 30 tests y CLI. Principio 2 (producción safety).
- `[auto]` Tool loop usa `apiMessages` local — cero impacto en session manager. Principio 5 (simplest correct).
- `[auto]` Confirmaciones con `vscode.window.showWarningMessage()` — más simple que modal webview. Principio 5.
- `[auto]` `confirm` injectable en shell-tools — testeable sin VSCode. Principio 4 (tests non-negotiable).
- `[auto]` Stats panel diferido — `outputs/stats.md` visible en VSCode directamente. Principio 1 (user value).
- `[auto]` Path aliases `@pstack/*` — reutiliza tipos de src/ sin duplicar. Principio 3 (reuse).
- `[gate]` Workspace root guard: obligatorio antes de ship. CSO.
- `[gate]` HTML escaping con `textContent`: obligatorio antes de ship. CSO.
- `[gate]` Max 10 turns: obligatorio. Protección bucle infinito.

## Test strategy

| Test file | Happy path | Failure path | Edge case |
|---|---|---|---|
| `file-tools.test.ts` | read_file devuelve contenido correcto | read_file fuera del workspace lanza error | write_file crea directorios padre |
| `shell-tools.test.ts` | runCommand devuelve stdout en success | runCommand denegado devuelve mensaje denegación | Comando con exit code ≠ 0 devuelve error output |
| `runtime-bridge.test.ts` | askWithTools completa con texto | Adapter sin streamEvents lanza error claro | Loop se detiene en turno 10 con mensaje error |
| `anthropic-adapter-tools.test.ts` | streamEvents emite text chunks | tool_use block emite tool_call event | Input JSON parcial se acumula hasta content_block_stop |
| `openai-adapter-tools.test.ts` | streamEvents emite text chunks | tool_calls en delta emite tool_call event | - |

**RBAC:** Sin RBAC nuevo. La extensión opera con permisos del proceso VSCode (usuario del editor).

**Export/CSV security:** No aplica — el plugin no exporta datos a sistemas externos.

## Implementation tasks

### Fase 0 — Tipos (15 min)
- [ ] `src/types.ts`: agregar `ToolDefinition`, `StreamEvent`, `streamEvents?` en `EngineAdapter`

### Fase 1 — Adapters con tool use (45 min)
- [ ] `src/adapters/anthropic.ts`: implementar `streamEvents()` con manejo de `tool_use` blocks
- [ ] `src/adapters/openai.ts`: implementar `streamEvents()` con manejo de `tool_calls` en streaming

### Fase 2 — Orchestrator (30 min)
- [ ] `src/orchestrator.ts`: agregar `askWithTools()` con loop multi-turno y max 10 turns

### Fase 3 — Tests src/ (30 min)
- [ ] `tests/runtime/anthropic-adapter-tools.test.ts`
- [ ] `tests/runtime/openai-adapter-tools.test.ts`
- [ ] `tests/runtime/ask-with-tools.test.ts`

### Fase 4 — Scaffold extensión (20 min)
- [ ] `vscode-pstack/package.json`
- [ ] `vscode-pstack/tsconfig.json`
- [ ] `vscode-pstack/src/extension.ts`
- [ ] `vscode-pstack/media/chat.html`
- [ ] `vscode-pstack/media/icon.svg`

### Fase 5 — Tools module (30 min)
- [ ] `vscode-pstack/src/tools/file-tools.ts`
- [ ] `vscode-pstack/src/tools/shell-tools.ts`
- [ ] `vscode-pstack/src/tools/index.ts`

### Fase 6 — Views (60 min)
- [ ] `vscode-pstack/src/views/StatusBar.ts`
- [ ] `vscode-pstack/src/views/SessionTree.ts`
- [ ] `vscode-pstack/src/views/ChatPanel.ts`

### Fase 7 — Runtime bridge (30 min)
- [ ] `vscode-pstack/src/runtime-bridge.ts`

### Fase 8 — Tests plugin (30 min)
- [ ] `vscode-pstack/tests/file-tools.test.ts`
- [ ] `vscode-pstack/tests/shell-tools.test.ts`
- [ ] `vscode-pstack/tests/runtime-bridge.test.ts`

### Fase 9 — Build y cierre (20 min)
- [ ] Scripts compile/watch/package en `vscode-pstack/package.json`
- [ ] Manual test checklist del spec
- [ ] CHANGELOG.md y VERSION → 0.6.0
- [ ] Commit y push

## Deferred work

| Item | Razón |
|---|---|
| Stats panel visual | `outputs/stats.md` readable en VSCode directamente |
| `pstack switch` desde Command Palette | Requiere UX adicional para contexto del switch |
| Publicación Marketplace | Herramienta interna v1 — VSIX local suficiente |
| Multi-workspace | Single workspace cubre el caso de uso del developer |
| Soporte Cursor / JetBrains | Out of scope declarado |
