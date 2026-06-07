# Release candidata v0.1.0

Estado: candidata MVP, con prueba real de respuestas contra fixtures completada.

## Alcance incluido

- Adaptador limpio para Codex con `AGENTS.md` y `.agents/skills`.
- 20 skills PortalUP Stack Codex.
- Referencias metodologicas adaptadas desde GStack para review, QA, ship, CSO, documentacion, investigate y careful.
- Skills PortalUP diferenciales: FileNet, RPA, BPM, SQL, AWS Backup, propuesta comercial, soporte incidente y arquitectura de solucion.
- Instaladores locales para Windows y Linux/macOS.
- Templates, ejemplos, fixtures, salidas esperadas y rubrica.

## Validaciones ejecutadas

```powershell
node scripts\validate-skills.js
node scripts\validate-fixtures.js
node scripts\validate-actual-outputs.js
```

Resultado:

- `Skill validation passed.`
- `Fixture validation passed. Checked 8 fixture(s).`
- `Actual output validation passed. Checked 8 actual output file(s).`

## Skills incluidas

- `$portalup-review`
- `$portalup-qa`
- `$portalup-qa-only`
- `$portalup-ship`
- `$portalup-cso`
- `$portalup-document-generate`
- `$portalup-document-release`
- `$portalup-plan-eng-review`
- `$portalup-plan-ceo-review`
- `$portalup-autoplan`
- `$portalup-investigate`
- `$portalup-careful`
- `$portalup-filenet-review`
- `$portalup-rpa-review`
- `$portalup-bpm-review`
- `$portalup-sql-review`
- `$portalup-aws-backup-review`
- `$portalup-propuesta-comercial`
- `$portalup-soporte-incidente`
- `$portalup-arquitectura-solucion`

## Resultados de evaluacion

- 8 fixtures ejecutados con respuestas reales en `tests/actual-output`.
- Todos los fixtures alcanzan el minimo MVP de 75/100.
- Scores registrados en `docs/evaluacion-resultados.md`.

## Brechas conocidas

- CLI `pstack` queda fuera del MVP y pasa a fase opcional.
- Empaquetado como plugin Codex queda fuera del MVP y pasa a fase posterior.
- Algunas skills de dominio necesitan referencias mas profundas para V1, especialmente FileNet, SQL, BPM y AWS.

## Criterio para marcar release final

- Crear commit/tag de release cuando el usuario lo indique.
