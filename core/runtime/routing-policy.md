# Routing Policy

## Objetivo

Definir una politica inicial para que PortalUP Stack seleccione especialistas sin exigir que el usuario nombre skills manualmente.

## Regla general

Toda tarea ambigua entra primero por `portalup-orchestrator`.

## Rutas iniciales

```text
codigo, bug, refactor, PR, diff
  -> portalup-review

produccion, release, deploy, go/no-go
  -> portalup-ship

seguridad, permisos, auth, secrets, vulnerabilidad
  -> portalup-cso

pruebas, QA, aceptacion, regresion
  -> portalup-qa

FileNet, Content Engine, Navigator, WebSphere
  -> portalup-filenet-review

RPA, UiPath, Rocketbot, bot, orquestador
  -> portalup-rpa-review

BPM, workflow, aprobaciones, SLA
  -> portalup-bpm-review

SQL, PostgreSQL, SQL Server, migracion, indices
  -> portalup-sql-review

AWS, backup, S3, IAM, restore
  -> portalup-aws-backup-review

propuesta, alcance, precio, cliente
  -> portalup-comercial-experto

marketing, posicionamiento, campana, landing
  -> portalup-marketing-experto

arquitectura, integracion, roadmap tecnico
  -> portalup-arquitecto-experto
```

## Riesgo alto

Si la tarea menciona produccion, base de datos, credenciales, eliminacion, migracion, deploy, rollback o cambios irreversibles, incluir `portalup-careful` y registrar control de riesgo.
