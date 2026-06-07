# Fixture: orchestrator continuity handoff

Usa `$portalup-orchestrator`.

Contexto: "Estamos a mitad de una tarea larga: investigamos un incidente SQL, encontramos posible problema de crecimiento y backup sin restore probado. Quiero que otro agente continue sin leer toda la conversacion."

Salida esperada: detectar necesidad de continuidad, seleccionar `$portalup-investigate` y `$portalup-sql-review` si sigue la investigacion, producir resumen de handoff, recomendar archivo en `outputs/sessions/`, indicar que contexto conservar/descartar y advertir no guardar secretos.
