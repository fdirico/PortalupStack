# PortalUP Stack VSCode Plugin — Guía Completa

> Versión 0.6.0 · 2026-06-11

---

## Contenido

1. [Qué es y por qué existe](#1-qué-es-y-por-qué-existe)
2. [Arquitectura](#2-arquitectura)
3. [Diseño de la interfaz](#3-diseño-de-la-interfaz)
4. [Funcionalidad detallada](#4-funcionalidad-detallada)
5. [Seguridad](#5-seguridad)
6. [Instalación paso a paso](#6-instalación-paso-a-paso)
7. [Configuración](#7-configuración)
8. [Uso práctico](#8-uso-práctico)
9. [Actualizar el plugin](#9-actualizar-el-plugin)
10. [Troubleshooting](#10-troubleshooting)
11. [Estructura de archivos](#11-estructura-de-archivos)

---

## 1. Qué es y por qué existe

El PortalUP Stack VSCode Plugin es una extensión nativa de Visual Studio Code que permite ejecutar el runtime de PortalUP Stack directamente desde el editor, **sin depender de Claude Code como host**.

### El problema que resuelve

Antes del plugin, el desarrollador tenía dos opciones:

| Escenario | Herramienta | Limitación |
|---|---|---|
| LLM con contexto del proyecto, acceso a archivos, herramientas | Claude Code CLI | Requiere Claude Pro + Claude Code activo |
| PortalUP Skills desde terminal | `pstack ask "..."` | El LLM responde texto puro, no puede leer ni editar archivos |

El plugin cierra ese gap: el LLM puede **leer archivos, escribir código y ejecutar comandos** del proyecto — todo dentro de VSCode, usando la API de Anthropic o OpenAI directamente.

### Qué NO es

- No reemplaza Claude Code para el desarrollo diario con Claude Pro.
- No requiere Claude Code instalado.
- No es un wrapper de Claude Code.
- No publica datos fuera del entorno local (excepto las llamadas a la API del LLM configurado).

---

## 2. Arquitectura

### Visión de capas

```
┌──────────────────────────────────────────────────────────┐
│                     VSCode Extension Host                 │
│                                                          │
│  ┌─────────────────┐   ┌────────────────────────────┐   │
│  │   ChatPanel      │   │      SessionTree           │   │
│  │  (WebviewPanel)  │   │    (TreeDataProvider)      │   │
│  └────────┬─────────┘   └──────────────┬─────────────┘   │
│           │ postMessage                │ list()           │
│  ┌────────▼─────────────────────────── ▼──────────────┐  │
│  │              RuntimeBridge                          │  │
│  │  - ask(input, onEvent, confirmFns)                  │  │
│  │  - resetSession()                                   │  │
│  └──────┬──────────────────────────────────────────────┘  │
│         │                                                  │
│  ┌──────▼──────────────────────────────────────────────┐  │
│  │              Tool Loop (max 10 turns)               │  │
│  │                                                     │  │
│  │  adapter.streamEvents(msgs, skill, tools)           │  │
│  │       ↓ StreamEvent: text | tool_call | done        │  │
│  │  executor(name, input)                              │  │
│  │       ↓ read_file | write_file | list_dir | run_cmd │  │
│  └──────┬──────────────────────────────────────────────┘  │
│         │                                                  │
└─────────┼──────────────────────────────────────────────── ┘
          │
┌─────────▼──────────────────────────────────────────────── ┐
│              PortalUP Stack Runtime (dist/)               │
│                                                           │
│  ┌─────────────────────┐   ┌──────────────────────────┐  │
│  │   AnthropicAdapter  │   │     OpenAIAdapter         │  │
│  │   streamEvents()    │   │     streamEvents()         │  │
│  └─────────────────────┘   └──────────────────────────┘  │
│                                                           │
│  SessionManager · StatsEngine · SkillLoader · HandoffGen  │
└───────────────────────────────────────────────────────────┘
```

### Módulos y responsabilidades

| Módulo | Archivo | Responsabilidad |
|---|---|---|
| Extension entry point | `src/extension.ts` | Activa comandos, vistas, panel; coordina lifecycle |
| Runtime bridge | `src/runtime-bridge.ts` | Orquesta adapter + tools + session + stats para VSCode |
| Tool loop | Dentro de `RuntimeBridge.ask()` | Multi-turno con max 10 turns; ejecuta tools; persiste sesión |
| Chat panel | `src/views/ChatPanel.ts` | WebviewPanel con streaming, indicadores de tool, confirmaciones |
| Session tree | `src/views/SessionTree.ts` | Sidebar agrupado por fecha/engine |
| Status bar | `src/views/StatusBar.ts` | Engine activo + tokens acumulados |
| File tools | `src/tools/file-tools.ts` | read_file, write_file, list_directory con workspace guard |
| Shell tools | `src/tools/shell-tools.ts` | run_command con confirmación injectable |
| Tool registry | `src/tools/index.ts` | JSON Schema de las 4 tools para el LLM |

### Flujo de una conversación completa

```
Usuario escribe en el chat
        │
        ▼
ChatPanel.handleMessage()
        │ vscode.postMessage → onDidReceiveMessage
        ▼
RuntimeBridge.ask(input, onEvent, confirmFns)
        │
        ├─ crea/continúa sesión en SessionManager
        │
        ▼
        LOOP (máx 10 turns):
        │
        ├─ adapter.streamEvents(msgs, skill, TOOL_DEFINITIONS)
        │       ├─ StreamEvent.text → onEvent → postMessage("chunk") → DOM
        │       └─ StreamEvent.tool_call → onEvent → postMessage("tool_indicator")
        │                                           │
        │                                           ▼
        │                               executor(name, input)
        │                                    ├─ read_file → retorna contenido
        │                                    ├─ write_file → confirmación VSCode → escribe
        │                                    ├─ list_directory → retorna listado
        │                                    └─ run_command → confirmación VSCode → ejecuta
        │
        ├─ Si no hay tool_calls → respuesta final → break
        └─ Si hay tool_calls → agrega results → siguiente turno
        │
        ▼
SessionManager.save() + StatsEngine.refresh()
StatusBar.update(engine, tokens)
onEvent({ type: "done" }) → postMessage("done") → send btn re-enabled
```

### Relación entre repositorios

```
D:\codex\gstack-codex\
├── src/                    ← Runtime TypeScript (compilado a dist/)
├── dist/                   ← JS compilado — el plugin importa de aquí en runtime
├── vscode-pstack/          ← Plugin VSCode
│   ├── src/                ← Fuente del plugin
│   ├── out/                ← Plugin compilado (lo que carga VSCode)
│   └── out/portalup-stack.vsix  ← Artefacto instalable
└── .agents/skills/         ← 27 skills (SKILL.md) — sin cambios
```

---

## 3. Diseño de la interfaz

### Componentes visuales

#### Activity Bar
- Ícono ⚡ (SVG inline) en la barra lateral izquierda
- Click abre el sidebar de PortalUP

#### Sidebar — Session Tree
- Árbol colapsable agrupado por fecha: `Today`, `Yesterday`, `YYYY-MM-DD`
- Cada sesión muestra: hora · nombre del skill
- Descripción: engine · tokens de entrada
- Botón refresh en el header del panel
- Context value `"session"` (extensible para menús contextuales futuros)

#### Chat Panel (WebviewPanel)
- Se abre en `ViewColumn.One` (área principal del editor)
- Retiene contexto cuando está oculto (`retainContextWhenHidden: true`)
- Layout: flexbox column — mensajes con scroll arriba, input fijo abajo

```
┌─────────────────────────────────────────────────────┐
│  [assistant] Hola, ¿en qué puedo ayudarte?          │
│                                                      │
│  📄 read_file(src/reports.ts)  ← tool indicator     │
│                                                      │
│  [assistant] El archivo tiene 340 líneas. La        │
│  función exportReport en línea 45 actualmente…      │
│                              [user] modifica el...  │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [ escribe tu pedido...                    ] [Send]  │
└─────────────────────────────────────────────────────┘
```

- Mensajes usuario: alineados derecha, fondo azul oscuro (var CSS de VSCode)
- Mensajes asistente: alineados izquierda, sin fondo (hereda del editor)
- Tool indicators: texto itálico color description, sin burbuja
- `Shift+Enter` = nueva línea; `Enter` = enviar
- Textarea auto-resize (min 36px, máx 140px)

#### Status Bar
- Posición: izquierda, prioridad 10
- Texto: `⚡ PortalUP [claude] 12,450 tok` (cuando hay tokens acumulados)
- Texto sin tokens: `⚡ PortalUP [claude]`
- Click: abre el chat panel
- Tooltip: "PortalUP Stack — click to open chat"
- Se resetea cuando el usuario limpia la sesión

### Tema visual
El plugin usa **exclusivamente variables CSS de VSCode**:

| Variable | Uso |
|---|---|
| `--vscode-editor-background` | Fondo del chat |
| `--vscode-editor-foreground` | Texto principal |
| `--vscode-input-background` | Fondo del textarea |
| `--vscode-button-background` | Botón Send |
| `--vscode-focusBorder` | Outline del textarea en foco |
| `--vscode-descriptionForeground` | Tool indicators |
| `--vscode-editorGroup-border` | Separador input/mensajes |

Funciona sin configuración adicional en temas claros y oscuros.

### Diálogos de confirmación
Se usan `vscode.window.showWarningMessage()` nativos de VSCode (modal: true):

**write_file:**
```
⚠ PortalUP wants to write to: src/reports/index.ts
[Approve]  [Cancel]
```

**run_command:**
```
⚠ PortalUP wants to run:

npm run build

Review the command carefully before allowing.
[Allow]  [Deny]
```

---

## 4. Funcionalidad detallada

### Tool use — las 4 herramientas

#### `read_file`
- Lee el contenido UTF-8 de un archivo del workspace
- Sin confirmación del usuario
- Rechaza paths fuera del workspace (ver Seguridad)
- En el chat: indicador `📄 read_file(src/app.ts)`

#### `write_file`
- Escribe contenido a un archivo del workspace
- Crea directorios padre si no existen (`fs.mkdirSync({ recursive: true })`)
- **Requiere confirmación** del usuario antes de escribir
- Si el usuario cancela → retorna `"write denied by user"` al LLM
- En el chat: indicador `✏️ write_file(src/reports/index.ts)`

#### `list_directory`
- Lista archivos y subdirectorios de una carpeta
- Formato: `archivo.ts\notro.ts\ncarpeta/`
- Sin confirmación del usuario

#### `run_command`
- Ejecuta comando en el shell del sistema
- **Requiere confirmación siempre** — sin excepción
- Timeout de 30 segundos
- Captura stdout y stderr
- Retorna stdout en éxito; `"command failed with exit code N: <detalle>"` en error
- Si el usuario deniega → retorna `"command denied by user"` al LLM
- En el chat: indicador `⚡ run_command(npm test)`

### Tool loop multi-turno

```
Turno 1: LLM recibe el pedido del usuario
         → puede responder con texto Y/O tool_calls

Si hay tool_calls:
  → plugin ejecuta cada tool (con confirmación si aplica)
  → resultado se agrega al historial de mensajes
  → se inicia turno 2 con el resultado disponible

Si NO hay tool_calls:
  → respuesta final — loop termina

Máximo 10 turnos. Si se alcanza: mensaje "[max tool turns reached — stopping]"
```

El historial de mensajes se mantiene en memoria durante toda la sesión del chat. Cuando el usuario cierra y reabre el panel, la sesión se resetea.

### Gestión de sesiones

- Cada vez que el usuario envía su **primer mensaje** en una nueva sesión, se crea una `Session` con:
  - `id`: UUID generado
  - `engine`: del config activo
  - `model`: del adapter
  - `startedAt`: timestamp ISO
  - `skillsUsed`: [skill por defecto cargado]
  - `messages`: historial completo

- Al terminar cada respuesta del LLM, la sesión se actualiza con:
  - Tokens de entrada y salida
  - Costo estimado en USD
  - Mensaje del asistente

- La sesión se guarda en `outputs/sessions/` como JSON.
- Las stats globales en `outputs/stats.md` se regeneran automáticamente.

### Persistencia entre mensajes

El `RuntimeBridge` mantiene el array `messages: Message[]` en memoria durante el lifecycle del panel. Esto significa que el LLM tiene contexto de toda la conversación dentro de la sesión activa — no solo del último mensaje.

---

## 5. Seguridad

### Workspace root guard

Toda operación de archivo valida que el path resuelto esté **dentro del workspace root**:

```typescript
function assertInWorkspace(filePath: string, wsRoot: string): void {
  const resolved = path.resolve(filePath);
  const root = path.resolve(wsRoot);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error(`Access denied: path is outside workspace: ${filePath}`);
  }
}
```

También bloquea acceso a:
- `outputs/sessions/` — datos históricos de sesiones
- `outputs/handoffs/` — handoffs cross-LLM

Cualquier intento del LLM de leer `../../.env`, `~/.ssh/`, etc. resulta en error que el LLM recibe como tool result.

### XSS en webview

Todo output del LLM se inserta via `textContent` (nunca `innerHTML`):

```javascript
assistantMsgEl.textContent = assistantText;
```

El webview tiene una CSP (Content Security Policy) estricta que bloquea scripts inline excepto los del nonce generado por la extensión en cada activación.

### Confirmación de comandos

`run_command` nunca ejecuta sin `showWarningMessage({ modal: true })` previo. El comando se muestra completo en el mensaje — sin truncar. El usuario puede denegar y el LLM recibe el mensaje de denegación y puede continuar sin él.

### API keys

- Solo desde variables de entorno (`process.env.ANTHROPIC_API_KEY` / `process.env.OPENAI_API_KEY`)
- Nunca pasan al webview
- Nunca aparecen en el historial de mensajes ni en las sesiones guardadas
- El scanner `scripts/validate-secrets.js` previene que keys se commiteen accidentalmente

---

## 6. Instalación paso a paso

### Prerrequisitos

- Node.js ≥ 18.0.0
- npm ≥ 9
- Visual Studio Code ≥ 1.85.0
- Repo `gstack-codex` disponible localmente
- API key de Anthropic (`sk-ant-...`) o OpenAI (`sk-proj-...`)

---

### Paso 1 — Instalar dependencias del runtime

```powershell
cd D:\codex\gstack-codex
npm install
```

---

### Paso 2 — Compilar el runtime

```powershell
npx tsc
```

Genera `dist/` con los archivos `.js` y `.d.ts` que el plugin necesita en runtime.
Verificá que no haya errores. Salida esperada: ninguna (compilación limpia).

---

### Paso 3 — Instalar dependencias del plugin

```powershell
cd D:\codex\gstack-codex\vscode-pstack
npm install
```

Instala `@types/vscode`, `@vscode/vsce`, y `typescript` locales al directorio del plugin.

---

### Paso 4 — Compilar el plugin

```powershell
npx tsc -p tsconfig.json
```

Genera `vscode-pstack/out/` con el JavaScript del plugin listo para VSCode.

---

### Paso 5 — Empaquetar como VSIX

```powershell
npx vsce package --no-dependencies --out out/portalup-stack.vsix
```

> `--no-dependencies` es necesario porque el plugin importa el runtime desde el directorio padre en runtime — no desde su propio `node_modules`.

Genera: `vscode-pstack/out/portalup-stack.vsix`

---

### Paso 6 — Instalar en VSCode

**Opción A — desde terminal (recomendada):**
```powershell
code --install-extension D:\codex\gstack-codex\vscode-pstack\out\portalup-stack.vsix
```

**Opción B — desde la UI de VSCode:**
1. `Ctrl+Shift+X` → abre el panel Extensions
2. Menú `···` (esquina superior derecha) → **Install from VSIX...**
3. Navegar a `vscode-pstack\out\portalup-stack.vsix` → Abrir
4. Hacer clic en **Reload Window** cuando VSCode lo solicite

---

### Paso 7 — Configurar la API key

La variable de entorno debe ser visible desde el proceso de VSCode.

**Opción A — Lanzar VSCode con la variable activa (por sesión):**
```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-api03-..."
code D:\codex\sidi-ai-dashboard
```

**Opción B — Variable de entorno del usuario (persistente, requiere reinicio):**
```powershell
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-api03-...", "User")
# Cerrar y volver a abrir VSCode completamente
```

Para OpenAI:
```powershell
$env:OPENAI_API_KEY = "sk-proj-..."
```

---

### Paso 8 — Verificar `portalup.config.json`

En el proyecto que vas a abrir con VSCode, debe existir el archivo de configuración:

```powershell
# Si no existe en tu proyecto:
cp D:\codex\gstack-codex\portalup.config.example.json D:\tu-proyecto\portalup.config.json
```

Contenido mínimo:
```json
{
  "activeEngine": "claude",
  "sessionDir": "outputs/sessions",
  "statsFile": "outputs/stats.md",
  "handoffDir": "outputs/handoffs"
}
```

Para usar OpenAI en lugar de Anthropic:
```json
{
  "activeEngine": "openai"
}
```

---

### Paso 9 — Usar el plugin

1. Abrí el proyecto en VSCode
2. El ícono ⚡ aparece en la barra de actividades (izquierda)
3. El chat panel se abre automáticamente al activar la extensión
4. Escribí tu pedido y presioná `Enter`

**Comandos disponibles** (`Ctrl+Shift+P`):
- `PortalUP: Open Chat` — abre el panel de chat
- `PortalUP: Clear Current Session` — resetea el historial de la sesión activa
- `PortalUP: Refresh Sessions` — actualiza el árbol de sesiones en el sidebar

---

## 7. Configuración

### Variables de entorno

| Variable | Motor | Obligatoria |
|---|---|---|
| `ANTHROPIC_API_KEY` | claude (Anthropic) | Si `activeEngine: "claude"` |
| `OPENAI_API_KEY` | openai (OpenAI) | Si `activeEngine: "openai"` |

### portalup.config.json

| Campo | Tipo | Default | Descripción |
|---|---|---|---|
| `activeEngine` | `"claude"` \| `"openai"` | `"claude"` | Motor LLM a usar |
| `sessionDir` | string | `"outputs/sessions"` | Directorio de sesiones relativo al proyecto |
| `statsFile` | string | `"outputs/stats.md"` | Archivo de estadísticas |
| `handoffDir` | string | `"outputs/handoffs"` | Directorio de handoffs cross-LLM |

### Modelos disponibles

| Engine | Modelo por defecto | Modelos alternativos |
|---|---|---|
| `claude` | `claude-sonnet-4-6` | `claude-opus-4-8`, `claude-haiku-4-5` |
| `openai` | `gpt-4o` | `gpt-4o-mini`, `gpt-4-turbo` |

---

## 8. Uso práctico

### Ejemplo 1 — Analizar un archivo y sugerir cambios

```
Revisá el archivo src/modules/reports/service.ts y
decime si hay algún problema con el manejo de errores.
```

El LLM usa `read_file` para leer el archivo, luego responde con su análisis.

### Ejemplo 2 — Modificar código

```
En src/components/ReportViewer.tsx, agregá un estado de carga
mientras se obtienen los datos del endpoint /api/reports.
```

El LLM puede:
1. Leer el archivo actual (`read_file`)
2. Proponer el archivo modificado
3. Pedir confirmación para escribirlo (`write_file` → diálogo)
4. Opcionalmente ejecutar `npm run build` para verificar que compila

### Ejemplo 3 — Explorar la estructura del proyecto

```
¿Qué módulos tiene la carpeta backend/app/modules/ y
cuál es el patrón general de cada uno?
```

El LLM usa `list_directory` para navegar la estructura y `read_file` para leer archivos de interés.

### Ejemplo 4 — Correr tests y corregir errores

```
Corré los tests del módulo de reportería y
arreglá cualquier test que esté fallando.
```

El LLM:
1. Pide permiso para ejecutar `python -m pytest backend/tests/test_reports.py` (o el comando que corresponda)
2. Lee los archivos con errores
3. Escribe las correcciones con confirmación previa

### Cambiar de motor LLM

Editá `portalup.config.json` en tu proyecto:
```json
{ "activeEngine": "openai" }
```

Luego en VSCode: `PortalUP: Clear Current Session` y la próxima consulta usará OpenAI.

---

## 9. Actualizar el plugin

Cuando actualizás el código de `gstack-codex` (nuevos skills, fixes al runtime, mejoras al plugin):

```powershell
# 1. Ir a la raíz del repo
cd D:\codex\gstack-codex

# 2. Recompilar el runtime
npx tsc

# 3. Recompilar el plugin
cd vscode-pstack
npx tsc -p tsconfig.json

# 4. Reempaquetar
npx vsce package --no-dependencies --out out/portalup-stack.vsix

# 5. Reinstalar (en PowerShell con VSCode en PATH)
code --install-extension out\portalup-stack.vsix

# 6. En VSCode: Ctrl+Shift+P → "Reload Window"
```

---

## 10. Troubleshooting

### El chat muestra "Engine does not support tool use"

**Causa:** El engine configurado en `portalup.config.json` no tiene implementado `streamEvents()`.

**Solución:** Verificar que `activeEngine` sea `"claude"` o `"openai"`. Estos son los únicos engines con tool use implementado en v0.6.0.

---

### El chat muestra "ANTHROPIC_API_KEY is not set"

**Causa:** La variable de entorno no está disponible en el proceso de VSCode.

**Solución:** Cerrá VSCode completamente. Abrí una nueva terminal PowerShell y ejecutá:
```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-..."
code D:\tu-proyecto
```

---

### El ícono ⚡ no aparece en la barra de actividades

**Causas posibles:**
1. El VSIX no se instaló correctamente
2. VSCode no se recargó después de la instalación

**Solución:** `Ctrl+Shift+X` → buscar "PortalUP" → verificar si aparece. Si aparece pero está deshabilitado, habilitarlo. Si no aparece, reinstalar el VSIX.

---

### Error al compilar el plugin: "Cannot find module '@types/vscode'"

**Causa:** `npm install` no se ejecutó en `vscode-pstack/`.

**Solución:**
```powershell
cd D:\codex\gstack-codex\vscode-pstack
npm install
```

---

### Error al compilar: "Cannot find module '../../dist/session.js'"

**Causa:** El runtime no está compilado.

**Solución:**
```powershell
cd D:\codex\gstack-codex
npx tsc
```

---

### El panel de chat abre pero no responde

**Causa probable:** La sesión de VSCode no tiene la variable de entorno de la API key.

**Diagnóstico:** Abrí la Output Channel de VSCode (`Ctrl+Shift+U`) y seleccioná "PortalUP Stack" en el dropdown. Los errores del extension host aparecen ahí.

---

### `vsce package` falla con "Missing publisher"

**Solución:** El campo `publisher` en `vscode-pstack/package.json` es requerido por vsce. Ya está seteado como `"portalup"` para uso local. Si falla, agregar `--skip-license` al comando:

```powershell
npx vsce package --no-dependencies --skip-license --out out/portalup-stack.vsix
```

---

## 11. Estructura de archivos

```
gstack-codex/
│
├── src/                          ← Runtime TypeScript
│   ├── types.ts                  ← Interfaces: Message, Session, EngineAdapter, StreamEvent, ToolDefinition
│   ├── orchestrator.ts           ← ask(), askWithTools(), switchEngine(), showStats()
│   ├── adapters/
│   │   ├── anthropic.ts          ← AnthropicAdapter con streamEvents()
│   │   ├── openai.ts             ← OpenAIAdapter con streamEvents()
│   │   └── index.ts              ← getAdapter(engine) factory
│   ├── session.ts                ← SessionManager — create/save/load/list/close
│   ├── stats.ts                  ← StatsEngine — genera outputs/stats.md
│   ├── handoff.ts                ← HandoffGenerator — handoff cross-LLM
│   └── skill-loader.ts           ← Carga lazy de SKILL.md desde registry
│
├── dist/                         ← Compilado (generado por tsc)
│   ├── *.js                      ← Importado por el plugin en runtime
│   └── *.d.ts                    ← Tipos para el plugin al compilar
│
├── vscode-pstack/                ← Plugin VSCode
│   ├── package.json              ← Manifest: contributes, commands, views
│   ├── tsconfig.json             ← Build del plugin (outDir: ./out)
│   ├── tsconfig.test.json        ← Para tests sin @types/vscode
│   │
│   ├── src/
│   │   ├── extension.ts          ← activate() — registra todo
│   │   ├── runtime-bridge.ts     ← Orquesta LLM + tools + sesión
│   │   ├── views/
│   │   │   ├── ChatPanel.ts      ← WebviewPanel con streaming
│   │   │   ├── SessionTree.ts    ← Sidebar de sesiones
│   │   │   └── StatusBar.ts      ← Engine + tokens en barra inferior
│   │   └── tools/
│   │       ├── index.ts          ← TOOL_DEFINITIONS (JSON Schema)
│   │       ├── file-tools.ts     ← readFile, writeFile, listDirectory
│   │       └── shell-tools.ts    ← runCommand con confirmFn injectable
│   │
│   ├── media/
│   │   ├── chat.html             ← Webview: UI del chat
│   │   └── icon.svg              ← Ícono ⚡ en activity bar
│   │
│   ├── tests/
│   │   ├── file-tools.test.ts    ← 10 tests (read, write, list + guards)
│   │   ├── shell-tools.test.ts   ← 4 tests (success, deny, fail, trim)
│   │   └── runtime-bridge.test.ts ← 3 tests (text, tool call, max turns)
│   │
│   └── out/                      ← Compilado (generado por tsc)
│       └── portalup-stack.vsix   ← Artefacto instalable
│
├── tests/runtime/                ← Tests del runtime (41 tests)
│   ├── anthropic-adapter.test.ts
│   ├── anthropic-adapter-tools.test.ts  ← Nuevo en v0.6.0
│   ├── openai-adapter.test.ts
│   ├── openai-adapter-tools.test.ts     ← Nuevo en v0.6.0
│   ├── ask-with-tools.test.ts           ← Nuevo en v0.6.0
│   ├── session.test.ts
│   ├── handoff.test.ts
│   ├── stats.test.ts
│   └── skill-loader.test.ts
│
├── docs/
│   ├── vscode-plugin-guide.md    ← Este documento
│   ├── vscode-plugin-spec.md     ← Especificación funcional
│   └── vscode-plugin-plan.md     ← Plan de implementación con gauntlet
│
├── outputs/
│   ├── sessions/                 ← Sesiones JSON (en .gitignore)
│   ├── handoffs/                 ← Handoffs cross-LLM (en .gitignore)
│   └── stats.md                  ← Estadísticas globales
│
├── .agents/skills/               ← 27 skills SKILL.md (sin cambios)
├── scripts/pstack.js             ← CLI pstack
├── portalup.config.example.json  ← Configuración de ejemplo
├── VERSION                       ← 0.6.0
└── CHANGELOG.md                  ← Historial de versiones
```

---

*Documento generado junto con la implementación de v0.6.0. Para el historial de decisiones de diseño ver `vscode-plugin-spec.md` y `vscode-plugin-plan.md`.*
