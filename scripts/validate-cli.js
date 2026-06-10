#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const errors = [];

function fail(message) {
  errors.push(message);
}

for (const file of ["scripts/pstack.js", "scripts/pstack.ps1", "scripts/pstack.sh", "scripts/export-skills.ps1"]) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing ${file}.`);
}

const cli = path.join(root, "scripts", "pstack.js");
if (fs.existsSync(cli)) {
  const content = fs.readFileSync(cli, "utf8");
  for (const token of [
    "$portalup-orchestrator",
    "$portalup-review",
    "$portalup-ship",
    "$portalup-propuesta-comercial",
    "$portalup-marketing-experto",
    "$portalup-arquitecto-experto",
    "$portalup-quality-gate",
    "$portalup-ui-modernization",
    "quality",
    "modernize",
    "compact",
    "handoff",
    "continue",
    "engine",
    "runtime",
    "package",
    "install-claude",
    "generate-host-assets.js",
  ]) {
    if (!content.includes(token)) fail(`pstack.js must mention ${token}.`);
  }

  const result = spawnSync(process.execPath, [cli, "ask", "test"], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    fail("pstack ask command failed.");
  } else if (!result.stdout.includes("$portalup-orchestrator")) {
    fail("pstack ask output must route through $portalup-orchestrator.");
  }

  const compact = spawnSync(process.execPath, [cli, "compact", "test"], {
    cwd: root,
    encoding: "utf8",
  });
  if (compact.status !== 0) {
    fail("pstack compact command failed.");
  } else if (!compact.stdout.includes("docs/context-ops-protocol.md")) {
    fail("pstack compact output must mention docs/context-ops-protocol.md.");
  }

  const engine = spawnSync(process.execPath, [cli, "engine"], {
    cwd: root,
    encoding: "utf8",
  });
  if (engine.status !== 0) {
    fail("pstack engine command failed.");
  } else if (!engine.stdout.includes("PortalUP Stack active engine")) {
    fail("pstack engine output must show active engine.");
  }

  const runtime = spawnSync(process.execPath, [cli, "runtime"], {
    cwd: root,
    encoding: "utf8",
  });
  if (runtime.status !== 0) {
    fail("pstack runtime command failed.");
  } else if (!runtime.stdout.includes("PortalUP Stack Runtime")) {
    fail("pstack runtime output must show runtime summary.");
  }

  const installClaude = spawnSync(process.execPath, [cli, "install-claude", "D:\\tmp\\demo"], {
    cwd: root,
    encoding: "utf8",
  });
  if (installClaude.status !== 0) {
    fail("pstack install-claude command failed.");
  } else if (!installClaude.stdout.includes("install-claude-project.ps1")) {
    fail("pstack install-claude output must show installer command.");
  }
}

if (errors.length) {
  console.error("CLI validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("CLI validation passed.");
