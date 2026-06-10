# Checklist Multi-LLM

## Estado general

Fase iniciada: PortalUP Stack Core Runtime Multi-LLM.

Objetivo: separar la metodologia PortalUP Stack del motor de IA utilizado, permitiendo continuidad entre Codex, Claude Code, Cursor u otros engines mediante adaptadores.

## Etapa 1 - Core portable y contrato de runtime

- [x] Crear documento de arquitectura Multi-LLM.
- [x] Crear roadmap de ejecucion Multi-LLM.
- [x] Crear configuracion ejemplo `portalup.config.example.json`.
- [x] Crear estructura base `core/runtime`.
- [x] Crear contrato minimo de engine.
- [x] Crear politica inicial de routing.
- [x] Crear politica inicial de contexto y tokens.
- [x] Crear politica inicial de handoff.
- [x] Crear registro inicial de engines.
- [x] Crear registro inicial de skills.
- [x] Crear adapter Codex baseline.
- [x] Crear placeholders de adapters Claude y Cursor.
- [x] Crear validador automatico del runtime.
- [x] Conectar runtime con `scripts/pstack.js`.
- [ ] Generar release notes de la fase.

## Etapa 2 - Generador de assets por host

- [x] Crear `scripts/generate-host-assets.js`.
- [x] Implementar `--dry-run` por defecto.
- [x] Implementar `--write`.
- [x] Generar paquete Codex en `dist/host-assets/codex`.
- [x] Generar paquete Claude en `dist/host-assets/claude`.
- [x] Generar paquete Cursor en `dist/host-assets/cursor`.
- [x] Agregar `pstack engine`.
- [x] Agregar `pstack runtime`.
- [x] Agregar `pstack package <engine>`.
- [x] Validar dry-run de Codex, Claude y Cursor desde `validate-runtime`.
- [x] Crear guia `docs/host-assets-generator.md`.
- [x] Confirmar formato operativo actual de Claude Code con documentacion oficial.
- [x] Convertir paquete Claude inicial a estructura nativa de proyecto `.claude/skills`.
- [x] Crear documentacion `docs/claude-code-adapter.md`.
- [x] Crear instalador directo para copiar a proyecto objetivo.
- [x] Crear fixture de continuidad Codex -> Claude.
- [x] Crear documentacion `docs/continuidad-codex-claude.md`.
- [x] Agregar lectura de `portalup.config.json` real desde `pstack`.
- [ ] Probar instalador en proyecto real con Claude Code.

## Etapa 3 - CLI de runtime

- [x] Crear comando para mostrar engine activo.
- [ ] Crear comando para cambiar engine configurado.
- [ ] Crear comando para generar paquete de handoff.
- [ ] Crear comando para validar config.
- [ ] Crear comando para listar capacidades por engine.

## Decisiones tomadas

- PortalUP Stack Core no reemplaza al LLM.
- El Core define metodologia, contrato, politicas y continuidad.
- Cada LLM de codigo se integra mediante un adapter.
- Codex queda como adapter baseline.
- Claude Code queda validado como paquete de proyecto usando `.claude/skills`.
- Cursor sigue como paquete inicial pendiente de validacion nativa.

## Pendientes criticos

- Definir si `portalup.config.json` sera generado por instalador o copiado manualmente por usuario.
- Definir si hace falta instalacion global en `~/.claude/skills` ademas de instalacion por proyecto.
- Definir politica de memoria por proyecto objetivo.
- Definir validadores para consistencia entre registry, adapters y skills instalados.
