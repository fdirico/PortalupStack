# PortalUP Stack Core

PortalUP Stack Core is the host-independent contract for PortalUP Stack.

It does not replace Codex, Claude Code, Cursor, or any other LLM coding assistant. It defines the shared operating model that those engines can execute through adapters.

## Contents

- `runtime/`: operating policies for engine contract, routing, context and handoff.
- `registry/skills.registry.json`: canonical skill inventory independent from a specific host.
- `registry/engines.registry.json`: supported and planned engines.
- `adapters/codex/`: Codex host adapter contract.
- `adapters/claude/`: Claude Code host adapter contract placeholder.
- `adapters/cursor/`: Cursor host adapter contract placeholder.

## Contract

```text
portalup.config.example.json
  -> selects engine
  -> points to engine adapters
  -> defines continuity and context policy

registry/skills.registry.json
  -> defines canonical PortalUP skills
  -> lists skills available to every host

registry/engines.registry.json
  -> defines engines and capability baseline

adapters/<engine>/adapter.md
  -> defines host name
  -> defines supported status
  -> defines install paths
  -> defines prompt invocation style
  -> defines limitations
```

## Stage 1 Scope

This stage is declarative. It creates the contract and validation base.

Generation, installation and runtime switching are planned for later stages.
