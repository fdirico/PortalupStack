# Fixture: code review FastAPI

Usa `$portalup-review`.

Contexto: se agrego un endpoint FastAPI que permite actualizar usuarios. El endpoint recibe `user_id`, `email`, `roles` y `is_active`. Aun no hay pruebas automatizadas y la autorizacion fue copiada de otro modulo.

Salida esperada: hallazgos por severidad, riesgos de autorizacion, pruebas recomendadas y decision.

