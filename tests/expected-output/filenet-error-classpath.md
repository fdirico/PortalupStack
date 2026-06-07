# Expected output: FileNet classpath error

Skill: `$portalup-filenet-review`

Minimum acceptable response:

- Probable cause identifies ICN/WebSphere plugin classpath or missing dependency as primary hypothesis.
- Severity is High or Critical because production document management users are affected.
- Evidence needed includes WebSphere logs, ICN plugin registration, deployed JAR/WAR contents, classloader policy, recent deployment changes, and affected desktop/plugin.
- Validation steps include checking plugin libraries, WebSphere classloader order, application restart/deploy status, and comparing previous working deployment.
- Recommended solution includes adding/packaging the missing dependency in the correct location or rebuilding the plugin package.
- Rollback includes disabling/removing the plugin or restoring previous plugin version.
- Client message is safe, factual, and does not blame without evidence.

Score target: 85/100.

