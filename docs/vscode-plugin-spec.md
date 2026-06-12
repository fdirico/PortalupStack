# Spec: PortalUP Stack VSCode Plugin (v2)

## Context
- Requested by: Fabian Di Rico (fdirico@portalup.com.co)
- Date: 2026-06-10
- Status: confirmed

## Problem
Para usar skills y LLM con acceso a archivos del proyecto el desarrollador necesita tener Claude Code abierto como host. El CLI `pstack ask` existe pero el LLM no puede leer ni editar archivos durante la ejecución. No hay forma de operar PortalUP Stack de manera completamente independiente dentro de VSCode.

## Goal
El desarrollador abre el panel de PortalUP en VSCode, escribe un pedido en lenguaje natural, y el LLM lee archivos, escribe código, y corre comandos del proyecto — sin abrir Claude Code. La sesión queda guardada en `outputs/sessions/` y las stats actualizadas automáticamente.

## Out of scope
- Publicación en VS Code Marketplace (v1 es install local via VSIX)
- Multi-usuario o sync en la nube
- Soporte de Cursor, JetBrains, Neovim (solo VSCode v1)
- Replicar 100% de features de Claude Code (MCP, hooks, memory persistente entre proyectos)
- Stats panel visual (diferido — `outputs/stats.md` legible directamente)
- Config UI para API keys (se configuran via env vars, igual que CLI)

## Systems touched
- `src/types.ts` — extender con `ToolCall`, `ToolResult`, `StreamEvent`
- `src/adapters/anthropic.ts` — manejar `tool_use` content blocks en streaming
- `src/adapters/openai.ts` — manejar `tool_calls` en streaming
- `src/orchestrator.ts` — nueva función `askWithTools()` con callback por evento
- `vscode-pstack/` (nuevo) — extensión VSCode nativa TypeScript
- `package.json` — agregar `@types/vscode` y script de build de extensión

## MVP definition
Chat panel funcional con streaming + tool use + confirmación para comandos destructivos + sesión guardada automáticamente. Session tree en sidebar. Status bar con engine + tokens. Todo dentro de VSCode, cero dependencia de Claude Code.

## Functional requirements
1. El usuario puede abrir un panel de chat desde la barra de actividades de VSCode.
2. El usuario escribe un mensaje y el LLM responde con streaming visible token a token.
3. El LLM puede llamar las tools: `read_file`, `write_file`, `list_directory`, `run_command`.
4. Las tool calls `read_file` y `list_directory` se ejecutan automáticamente sin confirmación.
5. Las tool calls `write_file` muestran el contenido propuesto antes de escribir y piden confirmación.
6. Las tool calls `run_command` muestran el comando y piden confirmación explícita del usuario en VSCode UI antes de ejecutar.
7. El panel muestra indicadores inline de qué tool se está ejecutando ("Leyendo src/reports.ts...").
8. Al terminar cada respuesta, la sesión se guarda en `outputs/sessions/` y las stats se actualizan.
9. El sidebar muestra el árbol de sesiones agrupadas por fecha y engine; click carga el resumen de la sesión.
10. La status bar muestra el engine activo y los tokens acumulados de la sesión actual.
11. Si no hay API key en el environment, el panel muestra un mensaje de error claro con instrucciones.
12. El plugin soporta cambiar de engine (`pstack switch`) desde un command palette command.

## Data model
Sin tablas nuevas. Reutiliza el schema `Session` de `src/types.ts` ya definido. Archivos JSON en `outputs/sessions/`. Sin migraciones.

**Cambio en `src/types.ts`:**
```typescript
export type StreamEvent =
  | { type: 'text'; chunk: string }
  | { type: 'tool_call'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; id: string; content: string }
  | { type: 'done' };
```

## API contract
Sin HTTP API. Comunicación interna:
- **Extension host ↔ Webview**: `postMessage` / `onDidReceiveMessage` (VSCode API)
- **Extension host ↔ LLM**: adapters existentes en `src/` extendidos con tool use
- **Extension host ↔ Filesystem**: Node.js `fs` (disponible en extension host)

Nueva función en `src/orchestrator.ts`:
```typescript
export async function askWithTools(
  root: string,
  input: string,
  tools: ToolDefinition[],
  onEvent: (event: StreamEvent) => void,
  options?: AskOptions
): Promise<void>
```

## Permissions
Sin RBAC nuevo. La extensión opera con los permisos del proceso VSCode (mismos que el usuario que abrió el editor). La única "permission gate" es la confirmación de usuario en VSCode UI para `write_file` y `run_command`.

## UI/UX requirements

### Chat Panel (WebviewPanel)
- Input bar fija al fondo, historial de mensajes arriba con scroll
- Mensajes del LLM streameados token a token
- Indicador inline: "Leyendo `src/reports.ts`..." / "Ejecutando `npm test`..."
- Confirmación de `write_file`: diff inline en el panel, botones Aprobar / Cancelar
- Confirmación de `run_command`: dialog modal con el comando, botones Permitir / Denegar
- Estado vacío: instrucciones + comando para configurar API key
- Estado de carga: spinner hasta primer token

### Session Tree (TreeDataProvider)
- Sidebar panel "PortalUP Sessions"
- Agrupado por fecha (Today, Yesterday, YYYY-MM-DD)
- Click en sesión: abre panel de resumen de esa sesión (read-only)
- Ícono diferente por engine (anthropic / openai)

### Status Bar
- Ítem permanente: `[claude] 12,450 tokens` (o el engine activo)
- Click abre el chat panel
- Actualizado después de cada respuesta

## Test strategy

**Unit (node:test — sin deps extras):**
- `vscode-pstack/tests/file-tools.test.ts`: read happy path, read file-not-found, write atomico (no deja archivo parcial si falla), list directory vacío
- `vscode-pstack/tests/shell-tools.test.ts`: command exitoso retorna stdout, command falla retorna stderr + exit code, timeout kill process
- `vscode-pstack/tests/runtime-bridge.test.ts`: tool call loop completa con mock adapter (LLM pide read_file → executor responde → LLM continúa), sesión guardada correctamente al terminar, stats.md actualizado

**Manual obligatorio antes de ship:**
1. Activar extensión → status bar aparece
2. Enviar mensaje → streaming visible
3. LLM llama read_file → indicador "Leyendo..." aparece → respuesta correcta
4. LLM llama write_file → dialog de confirmación aparece → archivo escrito
5. LLM llama run_command → dialog de confirmación aparece → se puede denegar sin crash
6. Sesión aparece en sidebar después de terminar
7. Sin API key → mensaje de error en panel, no crash

## Export/output security
No hay export de datos del plugin hacia sistemas externos. Los archivos escritos via `write_file` quedan en el filesystem del usuario. Sin riesgo de injection en contexto del plugin. El contenido de `run_command` no escapa al LLM — el resultado se incluye en el contexto como tool result (texto plano, no ejecutado nuevamente).

## Failure modes and rollback
| Modo de falla | Comportamiento esperado | Rollback |
|---|---|---|
| API key ausente | Mensaje de error en chat panel con instrucciones | N/A |
| Tool `read_file` falla (archivo no existe) | Error mostrado inline, LLM informado para continuar | N/A |
| Tool `run_command` denegada por usuario | LLM recibe "command denied by user", sigue sin el resultado | N/A |
| Extensión no activa / crash | VSCode notificación estándar, resto del IDE no afectado | Deshabilitar extensión en Extensions panel |
| Sesión no se guarda (disco lleno) | Log de error en Output Channel de la extensión, sesión en memoria | N/A |
| Build fallido | `pnpm run compile` muestra error, VSIX anterior sigue instalada | Reinstalar VSIX anterior |

## Open questions
Ninguna. Spec completo para pasar a autoplan.
