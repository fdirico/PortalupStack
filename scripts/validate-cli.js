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
}

if (errors.length) {
  console.error("CLI validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("CLI validation passed.");
