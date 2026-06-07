# ADR-002: Estructura de skills

## Estado

Aceptada para MVP.

## Decision

Cada skill vive en `.agents/skills/<skill-name>/` y contiene:

- `SKILL.md`
- `agents/openai.yaml`
- `references/` opcional

## Reglas

- `SKILL.md` debe tener frontmatter YAML con `name` y `description`.
- La description debe explicar uso y disparadores.
- El cuerpo debe incluir flujo, formato de salida, severidad/checklist y limites.

