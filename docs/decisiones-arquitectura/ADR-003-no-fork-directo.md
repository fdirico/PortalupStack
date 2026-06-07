# ADR-003: No hacer fork directo

## Estado

Aceptada para MVP.

## Contexto

Copiar GStack completo aumentaria dependencias, deuda de portabilidad y referencias Claude-only.

## Decision

Hacer un fork conceptual: adoptar patrones de valor y reimplementarlos en Codex con identidad PortalUP.

## Consecuencias

- Se preserva independencia tecnica.
- Se deben documentar atribuciones si se incorpora contenido upstream.
- La capa PortalUP puede evolucionar sin quedar limitada por GStack.

