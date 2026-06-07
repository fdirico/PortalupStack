---
name: portalup-filenet-review
description: IBM FileNet, Content Navigator, WebSphere, Content Engine, Process Engine, Case Manager, JACE, CEWS, plugins, queues, security, and production incident review. Use for FileNet architecture, troubleshooting, logs, integrations, or change assessment.
---

# PortalUP FileNet Review

## Use

Use this skill for FileNet incidents, architecture reviews, upgrade planning, integration issues, and production risk assessments.

Do not use it for generic Java review unless FileNet/WebSphere/ICN context is central.

## Workflow

1. Classify component: CE, PE, ICN, WebSphere, Case Manager, plugin, integration, storage, security.
2. Capture environment: versions, topology, recent changes, impact, logs, timestamps.
3. Form hypotheses and order by probability/severity.
4. Provide validations, commands/logs to review, remediation, and rollback.

## Output

```text
Probable cause
- ...

Severity
- Critical | High | Medium | Low

Evidence needed
- ...

Validations
- ...

Logs and commands to review
- ...

Recommended solution
- ...

Production risk and rollback
- ...

Client message
- ...
```

## Checklist

- WebSphere JVM, classpath, libraries, datasources, and deployment status.
- ICN plugin registration, desktop mapping, and plugin logs.
- CE/PE connectivity, object store, queues, workflows, and security roles.
- JACE/CEWS endpoint, credentials, SSL, and network.
- Recent deployments, patches, restarts, or certificate changes.

