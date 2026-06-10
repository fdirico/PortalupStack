# PortalUP Stack Core Runtime

El Core Runtime define la parte portable de PortalUP Stack. No ejecuta por si mismo el razonamiento del LLM; define el contrato, politicas y registros que permiten que distintos motores de codigo trabajen con la misma metodologia.

## Responsabilidades

- Mantener contrato comun para engines.
- Definir routing de intenciones hacia skills.
- Definir politicas de contexto, compactacion y continuidad.
- Declarar capacidades esperadas de cada engine.
- Evitar que PortalUP Stack quede acoplado a un unico host.

## No responsabilidades

- No reemplaza a Codex, Claude Code ni otros LLMs.
- No garantiza que todos los engines tengan las mismas capacidades.
- No ejecuta cambios de codigo sin un engine o host que pueda operar sobre el repositorio.

## Archivos base

- `engine-contract.md`: contrato minimo que debe cumplir cada engine.
- `routing-policy.md`: reglas iniciales para seleccionar especialistas.
- `context-policy.md`: politica de contexto, tokens y compactacion.
- `handoff-policy.md`: formato esperado para transferencia entre agentes o engines.
