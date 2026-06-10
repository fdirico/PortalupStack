# Context Policy

## Objetivo

Reducir perdida de continuidad y consumo innecesario de tokens al cambiar de agente, sesion o engine.

## Politica base

Usar `compact-and-handoff`.

## Reglas

- No repetir documentacion completa si existe un resumen operativo vigente.
- Registrar decisiones tomadas y no solo resultados finales.
- Separar hechos verificados de supuestos.
- Mantener una lista corta de archivos relevantes.
- Registrar comandos ejecutados y resultado esencial.
- Crear handoff antes de cambiar de engine o cerrar una fase.

## Umbrales operativos

```text
Contexto bajo:
  Continuar normalmente.

Contexto medio:
  Compactar hallazgos y mantener solo archivos activos.

Contexto alto:
  Crear handoff, cerrar subtarea y reiniciar con resumen.

Cambio de engine:
  Generar continuidad obligatoria.
```
