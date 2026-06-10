#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const errors = [];

function fail(message) {
  errors.push(message);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function requireFile(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing ${file}.`);
    return "";
  }
  return read(fullPath);
}

function requireSections(file, sections) {
  const content = requireFile(file);
  for (const section of sections) {
    if (!content.includes(section)) fail(`${file}: missing section ${section}.`);
  }
}

requireSections("templates/continuity-summary.md", [
  "# Continuity Summary",
  "## Status",
  "## Completed",
  "## Validated",
  "## Remaining",
  "## Risks",
  "## Decisions",
  "## Files Or Evidence",
  "## Next Agent Instructions",
  "## Token Budget",
  "Load on demand",
  "Recycling trigger",
  "Efficiency score",
]);

requireSections("templates/agent-handoff.md", [
  "# Agent Handoff Summary",
  "## Objective",
  "## Facts Confirmed",
  "## Hypotheses",
  "## Relevant Evidence",
  "## Decisions Made",
  "## Open Risks",
  "## Pending Work For Next Specialist",
  "## Token Notes",
  "Context to summarize",
  "Recycling trigger",
]);

requireSections("docs/context-ops-protocol.md", [
  "# Context Ops Protocol",
  "## Token Budget Classes",
  "## Recycling Triggers",
  "## Context Ledger",
  "## Efficiency Score",
]);

requireSections("outputs/sessions/README.md", [
  "# Session continuity outputs",
  "YYYY-MM-DD-short-topic.md",
  "Next Agent Instructions",
]);

requireSections("outputs/sessions/example-orchestrator-session.md", [
  "# Continuity Summary",
  "## Status",
  "## Completed",
  "## Validated",
  "## Remaining",
  "## Risks",
  "## Decisions",
  "## Files Or Evidence",
  "## Next Agent Instructions",
  "## Token Budget",
]);

const orchestrator = requireFile(".agents/skills/portalup-orchestrator/SKILL.md");
if (!orchestrator.includes("outputs/sessions")) {
  fail("portalup-orchestrator must mention outputs/sessions for persistent continuity.");
}
if (!orchestrator.includes("templates/continuity-summary.md")) {
  fail("portalup-orchestrator must mention templates/continuity-summary.md.");
}
if (!orchestrator.includes("templates/agent-handoff.md")) {
  fail("portalup-orchestrator must mention templates/agent-handoff.md.");
}
if (!orchestrator.includes("references/context-token-policy.md")) {
  fail("portalup-orchestrator must mention references/context-token-policy.md.");
}

const tokenPolicy = requireFile(".agents/skills/portalup-orchestrator/references/context-token-policy.md");
for (const token of ["Context ledger", "Recycling triggers", "Efficiency score"]) {
  if (!tokenPolicy.includes(token)) fail(`context-token-policy.md must mention ${token}.`);
}

if (errors.length) {
  console.error("Continuity validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Continuity validation passed.");
