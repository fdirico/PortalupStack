# Resultados de evaluacion MVP

Este documento registra la evaluacion de fixtures del MVP. Las respuestas reales generadas por Codex estan guardadas en `tests/actual-output`.

## Validaciones automaticas

| Comando | Resultado | Alcance |
| --- | --- | --- |
| `node scripts\validate-skills.js` | OK | Valida estructura, frontmatter, secciones minimas y metadata `openai.yaml` de 23 skills |
| `node scripts\validate-fixtures.js` | OK | Valida 11 fixtures, salidas esperadas asociadas y referencias a skills reales |
| `node scripts\validate-actual-outputs.js` | OK | Valida 11 respuestas reales, score y cumplimiento contra salida esperada |

## Resultados reales

| Fixture | Skill(s) | Score real | Target | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- |
| `code-review-fastapi.md` | `$portalup-review` | 87/100 | 85/100 | Aprobado MVP | `tests/actual-output/code-review-fastapi.md` |
| `filenet-error-classpath.md` | `$portalup-filenet-review` | 88/100 | 85/100 | Aprobado MVP | `tests/actual-output/filenet-error-classpath.md` |
| `sql-express-upgrade.md` | `$portalup-sql-review` | 87/100 | 85/100 | Aprobado MVP | `tests/actual-output/sql-express-upgrade.md` |
| `rpa-credential-error.md` | `$portalup-rpa-review` | 85/100 | 80/100 | Aprobado MVP | `tests/actual-output/rpa-credential-error.md` |
| `aws-backup-s3.md` | `$portalup-aws-backup-review`, `$portalup-cso`, `$portalup-ship` | 89/100 | 85/100 | Aprobado MVP | `tests/actual-output/aws-backup-s3.md` |
| `propuesta-soporte-filenet.md` | `$portalup-propuesta-comercial` | 86/100 | 80/100 | Aprobado MVP | `tests/actual-output/propuesta-soporte-filenet.md` |
| `bpm-process-review.md` | `$portalup-bpm-review` | 84/100 | 80/100 | Aprobado MVP | `tests/actual-output/bpm-process-review.md` |
| `arquitectura-solucion-filenet-rpa.md` | `$portalup-arquitectura-solucion` | 87/100 | 80/100 | Aprobado MVP | `tests/actual-output/arquitectura-solucion-filenet-rpa.md` |
| `experto-arquitecto-modernizacion.md` | `$portalup-arquitecto-experto` | 90/100 | 85/100 | Aprobado Fase 2 | `tests/actual-output/experto-arquitecto-modernizacion.md` |
| `experto-comercial-soporte.md` | `$portalup-comercial-experto` | 90/100 | 85/100 | Aprobado Fase 2 | `tests/actual-output/experto-comercial-soporte.md` |
| `experto-marketing-aws-backup.md` | `$portalup-marketing-experto` | 90/100 | 85/100 | Aprobado Fase 2 | `tests/actual-output/experto-marketing-aws-backup.md` |

## Criterio de cierre MVP

Para marcar una skill como lista en `v0.1.0`, debe cumplir:

- Pasar `node scripts\validate-skills.js`.
- Tener al menos un fixture real o una razon documentada si no aplica.
- Tener salida esperada en `tests/expected-output`.
- Tener respuesta real en `tests/actual-output`.
- Alcanzar minimo 75/100 en evaluacion manual.
- No inventar datos sensibles, precios, licencias o configuraciones no provistas.

## Pendiente

- Agregar fixtures negativos para acciones destructivas, secretos, rollback y ambiguedad de alcance.
- Agregar referencias mas profundas para FileNet, SQL, BPM y AWS en V1.
- Preparar commit/tag `v0.1.0` cuando el usuario lo indique.
