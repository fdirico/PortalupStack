# Fixture: orchestrator FileNet incident

Usa `$portalup-orchestrator`.

Contexto: "El escritorio documental no carga despues de desplegar un plugin nuevo. Los usuarios de produccion no pueden trabajar y en WebSphere aparece ClassNotFoundException."

Salida esperada: detectar incidente productivo FileNet/ICN/WebSphere, riesgo alto/critico, seleccionar `$portalup-soporte-incidente`, `$portalup-filenet-review` y posiblemente `$portalup-investigate`, plan de contencion, evidencia minima y continuidad.
