# Actual output: FileNet classpath error

Fixture: `tests/fixtures/filenet-error-classpath.md`
Skill: `$portalup-filenet-review`

Probable cause
- The primary hypothesis is that the IBM Content Navigator plugin was deployed without a required JAR or with the dependency in the wrong WebSphere/ICN classloader scope.
- Secondary hypotheses: wrong plugin package version, classloader order conflict, stale deployment cache, or dependency present in development but not production.

Severity
- High. The issue affects a production document management desktop and blocks users from loading the workspace.

Evidence needed
- Exact `ClassNotFoundException` class name and full stack trace.
- WebSphere `SystemOut.log`, `SystemErr.log`, FFDC entries, and ICN application logs around deployment time.
- ICN plugin registration and desktop mapping.
- Plugin JAR/WAR contents and dependency list.
- WebSphere application classloader policy and shared library configuration.
- Previous working plugin package and recent deployment changes.

Validations
- Confirm whether the missing class exists inside the plugin package or required shared library.
- Compare production package checksum/content against the tested package.
- Check whether WebSphere shared library is attached to the ICN application or server scope.
- Validate classloader order if there are duplicate dependency versions.
- Restart/reload ICN plugin only after confirming deployment state and maintenance window.

Logs and commands to review
- WebSphere: `SystemOut.log`, `SystemErr.log`, FFDC directory.
- ICN admin/plugin status and plugin loading errors.
- Package inspection with `jar tf <plugin>.jar` or equivalent on the plugin artifact.
- Deployment manager sync status if ND topology is used.

Recommended solution
- Rebuild or redeploy the plugin package with the missing dependency included in the correct location, or attach the required library through the approved WebSphere shared library path.
- Use the same artifact promoted from test to production. Avoid manual hot-copy of individual JARs unless it is the documented operational standard.

Production risk and rollback
- Risk: repeated failed plugin loading can keep the ICN desktop unusable and may affect other desktops if dependency scope is global.
- Rollback: disable/unregister the plugin from the affected desktop or restore the previous plugin package and restart/reload under a controlled window.

Client message
- "Identificamos que el escritorio falla al cargar un componente del plugin por una dependencia Java no disponible en el ambiente de ejecucion. Estamos validando el paquete desplegado, la configuracion de classloader y el ultimo artefacto funcional para aplicar correccion o rollback controlado."

Evaluation
- Score: 88/100.
- Meets expected output: yes.
- Notes: Strong MVP output. V1 should add FileNet/ICN version-specific checks.
