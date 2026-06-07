# Fixture: orchestrator production ready

Usa `$portalup-orchestrator`.

Contexto: "Terminamos una funcionalidad y quiero saber si esta lista para produccion. Hay cambios de permisos, variables de entorno y un script de migracion."

Salida esperada: detectar release readiness con riesgo alto, seleccionar `$portalup-ship`, `$portalup-cso`, `$portalup-careful` si migracion/destructivo aplica y `$portalup-document-release`, plan de validacion, rollback y continuidad.
