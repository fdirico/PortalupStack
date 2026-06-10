# Codex Adapter

## Estado

Baseline actual.

## Objetivo

Traducir PortalUP Stack Core al formato operativo de Codex.

## Formato de instalacion

```text
%USERPROFILE%\.codex\skills\portalup-*
```

## Convenciones

- Skills invocables como `$portalup-orchestrator`.
- Instrucciones de repo mediante `AGENTS.md`.
- Uso de `scripts/install-local.ps1` para instalacion local.
- Uso de `scripts/doctor.js` para validacion.

## Flujo recomendado

```text
1. Instalar skills con scripts/install-local.ps1.
2. Abrir Codex en el proyecto objetivo.
3. Invocar $portalup-orchestrator al inicio de la sesion.
4. Ejecutar trabajo.
5. Generar handoff si se cierra fase o se cambia de engine.
```

## Capacidades actuales

- Lectura de archivos: si.
- Escritura de archivos: si.
- Ejecucion de comandos: si.
- Skills nativos: si.
- Handoff: si, mediante templates y outputs/sessions.
