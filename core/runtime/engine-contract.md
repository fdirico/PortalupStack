# Engine Contract

## Objetivo

Definir el contrato minimo que debe cumplir cualquier engine para operar con PortalUP Stack.

## Entrada requerida

Todo engine debe recibir:

- Objetivo del usuario.
- Ruta o descripcion del proyecto objetivo.
- Engine configurado.
- Skill principal.
- Skills recomendados.
- Politica de contexto.
- Politica de riesgo.
- Resumen de continuidad, si existe.
- Formato de salida esperado.

## Salida requerida

Todo engine debe devolver:

- Interpretacion del objetivo.
- Especialistas usados o recomendados.
- Acciones realizadas.
- Archivos modificados, si aplica.
- Validaciones ejecutadas.
- Riesgos abiertos.
- Siguiente paso recomendado.
- Resumen de continuidad actualizado.

## Capacidades declarables

Cada engine debe declarar si soporta:

- Lectura de archivos.
- Escritura de archivos.
- Ejecucion de comandos.
- Uso de herramientas externas.
- Navegacion web.
- Skills nativos.
- Memoria persistente.
- Handoff entre sesiones.

## Reglas

- El Core no debe asumir capacidades no declaradas por el engine.
- Si el engine no soporta una capacidad, el adapter debe degradar el flujo y documentarlo.
- El handoff debe mantenerse en formato PortalUP aunque el engine tenga su propio formato interno.
