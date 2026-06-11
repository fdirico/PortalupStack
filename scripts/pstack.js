#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const command = process.argv[2] || "help";
const args = process.argv.slice(3);
const text = args.filter((a) => !a.startsWith("--")).join(" ").trim();
const root = path.resolve(__dirname, "..");

// --- info commands (no runtime needed) ----------------------------------

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readConfig() {
  const localConfig = path.join(root, "portalup.config.json");
  if (fs.existsSync(localConfig)) {
    return { source: "portalup.config.json", config: JSON.parse(fs.readFileSync(localConfig, "utf8")) };
  }
  return { source: "portalup.config.example.json", config: readJson("portalup.config.example.json") };
}

function printEngine() {
  const { source, config } = readConfig();
  const engines = readJson("core/registry/engines.registry.json");
  const active = config.activeEngine ?? config.engine ?? "unknown";
  const e = engines.engines[active];
  console.log(`PortalUP Stack active engine: ${active}
Status: ${e ? e.status : "unknown"}
Adapter: ${e ? (e.adapter ?? "runtime") : "unknown"}
Default skill: ${config.defaultSkill}
Config source: ${source}`);
}

function printRuntime() {
  const { source, config } = readConfig();
  const skills = readJson("core/registry/skills.registry.json");
  const engines = readJson("core/registry/engines.registry.json");
  const distExists = fs.existsSync(path.join(root, "dist/orchestrator.js"));
  console.log(`PortalUP Stack Runtime

Version: ${config.version}
Active engine: ${config.activeEngine ?? config.engine}
Mode: ${config.mode}
Default skill: ${config.defaultSkill}
Context policy: ${config.contextPolicy}
Skills: ${skills.skills.length}
Engines: ${Object.keys(engines.engines).join(", ")}
Session dir: ${config.sessionDir ?? "outputs/sessions"}
Stats file: ${config.statsFile ?? "outputs/stats.md"}
Runtime built: ${distExists ? "yes (dist/orchestrator.js)" : "no — run: npm run build"}
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
  const target = text || String.raw`D:\ruta\de\tu-proyecto`;
  const ps1 = String.raw`.\scripts\install-claude-project.ps1`;
  console.log(
    `Install PortalUP Stack into a Claude Code project:\n\n` +
    `Dry run:\n${ps1} "${target}" -DryRun\n\n` +
    `Install:\n${ps1} "${target}" -Force\n\n` +
    `After install:\ncd "${target}"\nclaude`
  );
}

function usage() {
  console.log(`pstack - PortalUP Stack runtime

Execution commands (call LLM API + save session):
  pstack ask "<request>"              Ask the active engine with the default skill
  pstack ask "<request>" --skill <s>  Ask with a specific skill
  pstack switch <engine> "<context>"  Switch engine with automatic handoff
  pstack stats                        Refresh and show outputs/stats.md
  pstack sessions                     List recent sessions
  pstack handoff ["<context>"]        Generate handoff for the most recent session

Prompt-only commands (no API call, for use in Claude Code / Codex):
  pstack review "<change>"
  pstack ship "<release>"
  pstack architect "<decision>"
  pstack quality "<app>"
  pstack modernize "<screen>"
  pstack compact "<context>"
  pstack continue "<session-file>"

Info commands:
  pstack engine       Show active engine info
  pstack runtime      Show runtime status
  pstack package <e>  Show how to generate host assets for engine
  pstack install-claude "<path>"  Show how to install into a Claude project
`);
}

// --- prompt-only commands (backwards compatible) ------------------------

const promptOnlyCommands = {
  route:    "Use $portalup-orchestrator to classify intent, domain, risk, autonomy level, and selected specialists.",
  review:   "Use $portalup-review to review this change. Add $portalup-cso if auth, roles, secrets, data, or permissions are involved.",
  ship:     "Use $portalup-ship to check production readiness. Add $portalup-cso, $portalup-careful, and $portalup-document-release when needed.",
  proposal: "Use $portalup-comercial-experto to shape the opportunity, then $portalup-propuesta-comercial for the client-facing proposal.",
  marketing:"Use $portalup-marketing-experto to define audience, positioning, messaging, channels, and proof needed.",
  architect:"Use $portalup-arquitecto-experto to evaluate architecture tradeoffs, risks, roadmap, and validation plan.",
  quality:  "Use $portalup-quality-gate to evaluate this application with professional Sonar-like controls, architecture/code quality checks, robust remediation, and validation evidence.",
  modernize:"Use $portalup-ui-modernization to modernize this application or screen. Ask for missing UX context when needed and produce a professional responsive UI plan.",
  compact:  "Use $portalup-orchestrator to compact this long context using docs/context-ops-protocol.md. Produce keep/summarize/drop/load-on-demand notes and a continuity summary.",
  continue: "Use $portalup-orchestrator to resume from this continuity reference. Load only the cited summary and direct evidence needed for the next action.",
};

// --- info commands ------------------------------------------------------

if (command === "help" || command === "--help" || command === "-h") { usage(); process.exit(0); }
if (command === "engine")        { printEngine(); process.exit(0); }
if (command === "runtime")       { printRuntime(); process.exit(0); }
if (command === "package")       { printPackageCommand(); process.exit(0); }
if (command === "install-claude"){ printInstallClaudeCommand(); process.exit(0); }

// --- prompt-only fallback (no build needed) -----------------------------

if (promptOnlyCommands[command]) {
  const request = text || "<describe your task here>";
  console.log(`${promptOnlyCommands[command]}\n\nRequest:\n${request}`);
  process.exit(0);
}

// --- execution commands (require built runtime) -------------------------

const distOrchestrator = path.join(root, "dist/orchestrator.js");
if (!fs.existsSync(distOrchestrator)) {
  console.error(
    `[pstack] Runtime not built. Run:\n  npm run build\n\nThen retry: pstack ${command} "${text}"`
  );
  process.exit(1);
}

const { ask, switchEngine, showStats, listSessions, generateHandoff } = require(distOrchestrator);

async function main() {
  try {
    switch (command) {
      case "ask": {
        if (!text) { console.error("[pstack] Usage: pstack ask \"<your request>\""); process.exit(1); }
        const skillFlag = args.indexOf("--skill");
        const skill = skillFlag === -1 ? undefined : args[skillFlag + 1];
        await ask(root, text, { skill });
        break;
      }
      case "switch": {
        const engine = args[0];
        const context = args.slice(1).filter((a) => !a.startsWith("--")).join(" ").trim();
        if (!engine) { console.error("[pstack] Usage: pstack switch <engine> \"<context>\""); process.exit(1); }
        await switchEngine(root, engine, context);
        break;
      }
      case "stats":
        await showStats(root);
        break;
      case "sessions":
        await listSessions(root);
        break;
      case "handoff":
        await generateHandoff(root, text || undefined);
        break;
      default:
        console.error(`[pstack] Unknown command: ${command}`);
        usage();
        process.exit(1);
    }
  } catch (err) {
    console.error(`[pstack] Error: ${err.message}`);
    if (process.env["PSTACK_DEBUG"]) console.error(err.stack);
    process.exit(1);
  }
}

main();
