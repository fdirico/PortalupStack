# Changelog

## 0.6.0 - 2026-06-11

PortalUP Stack VSCode Plugin (v2): extensión nativa con tool use completo — el LLM puede leer, escribir y ejecutar comandos del proyecto directamente desde VSCode, sin depender de Claude Code.

**Runtime src/ (extensiones):**
- `src/types.ts`: agregados `ToolDefinition`, `StreamEvent`, `streamEvents?` en `EngineAdapter`.
- `src/adapters/anthropic.ts`: nuevo `streamEvents()` con manejo de `tool_use` blocks en streaming (helpers `handleContentEvent` + `applyUsageEvent`).
- `src/adapters/openai.ts`: nuevo `streamEvents()` con acumulación de `tool_calls` por índice entre chunks.
- `src/orchestrator.ts`: nuevo `askWithTools()` con loop multi-turno (máximo 10 turns), manejo de tool results, persistencia de sesión y actualización de stats.

**Plugin VSCode (`vscode-pstack/`):**
- `src/extension.ts`: punto de entrada, registra comandos y vistas, activa chat panel automáticamente.
- `src/runtime-bridge.ts`: orquesta adapter + tools + session manager para contexto VSCode. Mantiene historial de mensajes entre turnos.
- `src/views/ChatPanel.ts`: WebviewPanel con streaming token a token, indicadores de tool use, confirmaciones nativas VSCode para write_file y run_command.
- `src/views/SessionTree.ts`: TreeDataProvider agrupado por fecha (Today/Yesterday/YYYY-MM-DD).
- `src/views/StatusBar.ts`: ítem persistente con engine activo y tokens acumulados de la sesión.
- `src/tools/file-tools.ts`: `read_file`, `write_file`, `list_directory` con workspace root guard + bloqueo de `outputs/sessions/` y `outputs/handoffs/`.
- `src/tools/shell-tools.ts`: `run_command` con `confirmFn` injectable para testabilidad.
- `src/tools/index.ts`: `TOOL_DEFINITIONS` con JSON Schema para los 4 tools.
- `media/chat.html`: webview con HTML escaping (textContent, no innerHTML), CSP estricto, auto-resize del textarea.

**Tests: 58 tests — 58 pass — 0 fail.**
- 41 tests existentes sin cambios.
- 11 tests nuevos en `tests/runtime/`: `anthropic-adapter-tools`, `openai-adapter-tools`, `ask-with-tools`.
- 17 tests nuevos en `vscode-pstack/tests/`: `file-tools` (10), `shell-tools` (4), `runtime-bridge` (3).

**Seguridad:**
- Workspace root guard obligatoria en todos los file tools: rechaza paths fuera del workspace y paths en `outputs/sessions/`.
- HTML escaping en webview: `textContent` en lugar de `innerHTML` para todo output del LLM.
- Max 10 turns en tool loop: protección de bucle infinito.
- `run_command` requiere confirmación explícita del usuario antes de cada ejecución.

## 0.5.0 - 2026-06-11

PortalUP Stack pasa de ser un generador de prompts a un runtime ejecutable independiente.

**Runtime TypeScript (nuevo):**
- `src/types.ts`: interfaces Message, Session, TokenUsage, EngineAdapter.
- `src/adapters/anthropic.ts`: streaming real vía Anthropic SDK, token tracking, estimador de costo.
- `src/adapters/openai.ts`: streaming real vía OpenAI SDK, misma interfaz.
- `src/adapters/index.ts`: factory `getAdapter(engine)`.
- `src/skill-loader.ts`: carga lazy de SKILL.md por nombre desde registry, cache, degradación silenciosa.
- `src/session.ts`: create/save-atomic(.tmp→rename)/load/list/close de sesiones JSON locales.
- `src/handoff.ts`: genera handoff markdown cross-LLM desde `templates/agent-handoff.md`, trunca contexto largo.
- `src/stats.ts`: agrega sesiones → `outputs/stats.md` con totales globales, por engine y por proyecto.
- `src/orchestrator.ts`: conecta adapters + session + handoff + stats; expone `ask`, `switchEngine`, `showStats`, `listSessions`, `generateHandoff`.

**CLI actualizado (`scripts/pstack.js`):**
- `pstack ask "<request>"` ejecuta contra la API real (antes: imprimía prompt).
- `pstack ask "<request>" --skill <name>` inyecta el skill específico como contexto.
- `pstack switch <engine> "<context>"` genera handoff y continúa en el engine destino.
- `pstack stats` regenera `outputs/stats.md` y muestra resumen.
- `pstack sessions` lista las últimas 20 sesiones con tokens y costo.
- `pstack handoff` genera handoff de la sesión más reciente.
- Comandos prompt-only (review, ship, architect, quality, modernize, compact, continue) mantienen compatibilidad.
- Comandos info (engine, runtime, package, install-claude) actualizados para reflejar runtime real.

**Infraestructura:**
- `package.json` con deps: `@anthropic-ai/sdk`, `openai`, `typescript`, `@types/node`, `ts-node`.
- `tsconfig.json`: target ES2020, module CommonJS, outDir dist/.
- `core/registry/engines.registry.json`: campos runtime por engine (authEnvVar, defaultModel, maxContextTokens).
- `portalup.config.example.json`: campos activeEngine, sessionDir, statsFile, handoffDir.
- `outputs/sessions/` y `outputs/handoffs/` agregados a `.gitignore`.
- `scripts/validate-secrets.js`: detecta patrones de API key en archivos rastreados, bloquea build si encuentra alguno.
- `scripts/validate-all.js`: agrega validate-secrets a la suite.
- `scripts/install-claude-project.ps1` y `.sh`: ejecutan `npm install` y `tsc` antes de instalar.
- `docs/portalup-stack-v2-spec.md` y `docs/portalup-stack-v2-plan.md`: spec y plan confirmados.

**Tests: 25 tests — 25 pass — 0 fail** (node:test, sin dependencias extra).

## 0.4.0 - 2026-06-10

- Added `portalup-spec` for spec-driven development: 5-phase interrogation (Why → Scope → Technical → Draft → Document) that locks the "what" before planning or coding. Produces `docs/<topic>-spec.md` consumed by `portalup-autoplan`. Written in model-agnostic markdown — works with any LLM coding assistant.
- Upgraded `portalup-autoplan`: full multi-perspective gauntlet (CEO → Design → Eng → CSO); 6 explicit auto-decision principles; mandatory plan document `docs/<topic>-plan.md`; design review now always runs for tasks touching screens/components; test strategy and RBAC/CSV-security analysis are non-negotiable deliverables.
- Upgraded `portalup-orchestrator`: new features always route through `portalup-spec` before `portalup-autoplan`; `portalup-ui-modernization` now mandatory (not optional) for any task touching a screen or component; tests required before coding starts.
- Upgraded `portalup-review`: zero tests in a new module is now HIGH severity (was advisory); missing CSV injection protection is HIGH; new RBAC permission without reuse justification is HIGH; UI/design quality check added to checklist.
- Upgraded `portalup-ship`: zero tests in a new module is Blocked (no exceptions); missing CSV injection protection is Blocked; RBAC reuse preference explicit in checklist.
- Development workflow updated: `portalup-spec → portalup-autoplan → implement → portalup-review → portalup-ship`.
- Based on evidence from A/B evaluation: same feature built with GStack vs PortalUP Stack; GStack produced tests, plan doc, and CSV security; improvements close the gap while preserving PortalUP domain specialization.

## 0.3.0 - 2026-06-07

- Added `portalup-quality-gate` for professional Sonar-like quality controls, architecture/code quality validation, robust remediation, and evidence-based gate decisions.
- Added `portalup-ui-modernization` for modern client-grade UI/UX, responsive layouts, compact controls, visual polish, and design-context pushback.
- Added `docs/professional-delivery-standard.md` as the transversal quality bar for client-grade applications.
- Updated orchestrator routing so professional app development uses quality gates and UI modernization when relevant.
- Updated review and engineering plan skills to reject cosmetic fixes, require root-cause thinking, and identify static quality controls.
- Added `pstack quality` and `pstack modernize`.
- Added quality/UI fixtures and actual outputs; validation suite now covers 26 skills and 22 fixtures.

## 0.1.0 - 2026-06-07

- Created repository structure for PortalUP Stack Codex.
- Added Codex-compatible skill MVP.
- Added tracking and knowledge documentation.
- Added local install and validation scripts.
- Added initial templates and fixtures.
- Cloned and inventoried real GStack source as ignored `vendor/gstack`.
- Added missing roadmap skills aligned to GStack: QA-only, plan reviews, document release, autoplan, investigate, and careful.
- Added GStack-adapted methodology references for review, QA, ship, CSO, investigate, careful, and documentation.
- Added fixture expected outputs, fixture validator, and MVP evaluation results.
- Added PortalUP-specific BPM, AWS backup, and solution architecture skills.
- Added v0.1.0 release candidate notes.
- Added actual Codex fixture outputs and validation for evidence files.

## 0.2.0 - 2026-06-07

- Planned autonomous orchestrator phase.
- Added expert advisory skills for architecture, commercial strategy, and marketing strategy.
- Added `portalup-orchestrator` for natural-language routing, specialist selection, context planning, and continuity summaries.
- Added persistent continuity templates, `outputs/sessions`, and continuity validation.
- Added `pstack` prompt helper CLI, doctor, validation suite, negative safety fixtures, and v0.2.0 release notes.
