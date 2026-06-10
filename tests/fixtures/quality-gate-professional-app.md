# Fixture: quality gate professional app

Skill: `$portalup-quality-gate`

Prompt: "Tenemos una aplicacion normalita para un cliente grande. Quiero controles tipo Sonar, revision de arquitectura, codigo, seguridad, tests y plan de correccion robusto. No quiero maquillaje."

Salida esperada: debe fallar o condicionar el gate si no hay evidencia, pedir build/lint/typecheck/tests/security checks, revisar arquitectura, mantenibilidad, seguridad, observabilidad, performance y UX, separar sintomas de causa raiz, y exigir fixes permanentes con verificacion.
