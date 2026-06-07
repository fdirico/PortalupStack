# Guia de contribucion

## Agregar una skill

1. Crear carpeta `.agents/skills/<nombre>/`.
2. Agregar `SKILL.md` con frontmatter `name` y `description`.
3. Agregar `agents/openai.yaml`.
4. Agregar fixture en `tests/fixtures/`.
5. Agregar salida esperada en `tests/expected-output/` con el mismo nombre del fixture.
6. Ejecutar `node scripts/validate-skills.js`.
7. Ejecutar `node scripts/validate-fixtures.js`.
8. Agregar respuesta real en `tests/actual-output/`.
9. Ejecutar `node scripts/validate-actual-outputs.js`.
10. Documentar el cambio en `docs/seguimiento-agentes.md`.

## Reglas

- Usar nombres en minusculas con guiones.
- No depender de Claude Code.
- Mantener `SKILL.md` corto y operativo.
- Incluir formato de salida y checklist.
- No marcar una skill como lista si no tiene fixture o justificacion documentada.
