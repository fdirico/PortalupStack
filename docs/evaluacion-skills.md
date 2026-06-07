# Evaluacion de skills

## Rubrica MVP

| Criterio | Peso |
| --- | --- |
| Identifica causa o objetivo probable | 20 |
| Da pasos accionables | 20 |
| Evita inventar datos | 15 |
| Ordena por severidad | 15 |
| Incluye riesgos | 10 |
| Incluye validaciones | 10 |
| Formato claro | 10 |

## Umbrales

- MVP minimo: 75/100.
- Objetivo V1: 85/100.
- Produccion: 90/100.

## Proceso

1. Ejecutar una skill contra un fixture.
2. Evaluar manualmente con la rubrica.
3. Registrar score en `docs/seguimiento-agentes.md`.
4. Ajustar `SKILL.md` si el score es menor a 75.

## Validacion de fixtures

Antes de evaluar respuestas reales, validar que cada caso de prueba este completo:

```powershell
node scripts\validate-fixtures.js
```

El script comprueba:

- Cada `tests/fixtures/*.md` tiene un `tests/expected-output/*.md` con el mismo nombre.
- Cada fixture menciona al menos una skill `$portalup-*`.
- Cada skill mencionada existe en `.agents/skills`.
- Cada salida esperada define una respuesta minima aceptable y un score target.

Los resultados iniciales estan en `docs/evaluacion-resultados.md`.
