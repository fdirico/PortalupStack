#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const command = process.argv[2] || "help";
const text = process.argv.slice(3).join(" ").trim();
const root = path.resolve(__dirname, "..");

const prompts = {
  ask: "Use $portalup-orchestrator to interpret this request, choose specialists, plan context, and produce a continuity-aware answer.",
  route: "Use $portalup-orchestrator to classify intent, domain, risk, autonomy level, and selected specialists.",
  review: "Use $portalup-review to review this change. Add $portalup-cso if auth, roles, secrets, data, or permissions are involved.",
  ship: "Use $portalup-ship to check production readiness. Add $portalup-cso, $portalup-careful, and $portalup-document-release when needed.",
  proposal: "Use $portalup-comercial-experto to shape the opportunity, then $portalup-propuesta-comercial for the client-facing proposal.",
  marketing: "Use $portalup-marketing-experto to define audience, positioning, messaging, channels, and proof needed.",
  architect: "Use $portalup-arquitecto-experto to evaluate architecture tradeoffs, risks, roadmap, and validation plan.",
  quality: "Use $portalup-quality-gate to evaluate this application with professional Sonar-like controls, architecture/code quality checks, robust remediation, and validation evidence.",
  modernize: "Use $portalup-ui-modernization to modernize this application or screen. Ask for missing UX context when needed and produce a professional responsive UI plan.",
  compact: "Use $portalup-orchestrator to compact this long context using docs/context-ops-protocol.md. Produce keep/summarize/drop/load-on-demand notes and a continuity summary.",
  handoff: "Use $portalup-orchestrator to create an Agent Handoff Summary using templates/agent-handoff.md. Include objective, facts, hypotheses, evidence, decisions, risks, pending work, and token notes.",
  continue: "Use $portalup-orchestrator to resume from this continuity reference. Load only the cited summary and direct evidence needed for the next action.",
};

function usage() {
  console.log(`pstack - PortalUP Stack Codex prompt helper

Usage:
  node scripts/pstack.js ask "natural language request"
  node scripts/pstack.js route "natural language request"
  node scripts/pstack.js review "change description"
  node scripts/pstack.js ship "release description"
  node scripts/pstack.js proposal "commercial opportunity"
  node scripts/pstack.js marketing "offer or campaign"
  node scripts/pstack.js architect "architecture decision"
  node scripts/pstack.js quality "application or codebase to validate"
  node scripts/pstack.js modernize "screen or app to modernize"
  node scripts/pstack.js compact "long task context"
  node scripts/pstack.js handoff "handoff context"
  node scripts/pstack.js continue "outputs/sessions/YYYY-MM-DD-topic.md"
  node scripts/pstack.js engine
  node scripts/pstack.js runtime
  node scripts/pstack.js package codex
  node scripts/pstack.js install-claude "D:\\ruta\\de\\tu-proyecto"

Output:
  A PortalUP Stack prompt, runtime summary, or host package command.
`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readConfig() {
  const localConfig = path.join(root, "portalup.config.json");
  if (fs.existsSync(localConfig)) {
    return {
      source: "portalup.config.json",
      config: JSON.parse(fs.readFileSync(localConfig, "utf8")),
    };
  }

  return {
    source: "portalup.config.example.json",
    config: readJson("portalup.config.example.json"),
  };
}

function printEngine() {
  const { source, config } = readConfig();
  const engines = readJson("core/registry/engines.registry.json");
  const engine = engines.engines[config.engine];
  console.log(`PortalUP Stack active engine: ${config.engine}
Status: ${engine ? engine.status : "unknown"}
Adapter: ${engine ? engine.adapter : "unknown"}
Default skill: ${config.defaultSkill}
Config source: ${source}`);
}

function printRuntime() {
  const { source, config } = readConfig();
  const skills = readJson("core/registry/skills.registry.json");
  const engines = readJson("core/registry/engines.registry.json");
  console.log(`PortalUP Stack Runtime

Version: ${config.version}
Engine: ${config.engine}
Mode: ${config.mode}
Default skill: ${config.defaultSkill}
Context policy: ${config.contextPolicy}
Skills: ${skills.skills.length}
Engines: ${Object.keys(engines.engines).join(", ")}
Handoff output: ${config.handoff.sessionOutputDir}
Config source: ${source}`);
}

function printPackageCommand() {
  const engine = text || "codex";
  console.log(`Generate PortalUP Stack host assets for ${engine}:

Dry run:
node scripts/generate-host-assets.js --engine ${engine} --dry-run

Write package:
node scripts/generate-host-assets.js --engine ${engine} --write`);
}

function printInstallClaudeCommand() {
  const target = text || "D:\\ruta\\de\\tu-proyecto";
  console.log(`Install PortalUP Stack into a Claude Code project:

Dry run:
.\\scripts\\install-claude-project.ps1 "${target}" -DryRun

Install:
.\\scripts\\install-claude-project.ps1 "${target}" -Force

After install:
cd "${target}"
claude`);
}

if (command === "help" || command === "--help" || command === "-h") {
  usage();
  process.exit(0);
}

if (command === "engine") {
  printEngine();
  process.exit(0);
}

if (command === "runtime") {
  printRuntime();
  process.exit(0);
}

if (command === "package") {
  printPackageCommand();
  process.exit(0);
}

if (command === "install-claude") {
  printInstallClaudeCommand();
  process.exit(0);
}

if (!prompts[command]) {
  console.error(`Unknown pstack command: ${command}`);
  usage();
  process.exit(1);
}

const request = text || "<describe your task here>";
console.log(`${prompts[command]}

Request:
${request}`);
