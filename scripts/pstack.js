#!/usr/bin/env node

const command = process.argv[2] || "help";
const text = process.argv.slice(3).join(" ").trim();

const prompts = {
  ask: "Use $portalup-orchestrator to interpret this request, choose specialists, plan context, and produce a continuity-aware answer.",
  route: "Use $portalup-orchestrator to classify intent, domain, risk, autonomy level, and selected specialists.",
  review: "Use $portalup-review to review this change. Add $portalup-cso if auth, roles, secrets, data, or permissions are involved.",
  ship: "Use $portalup-ship to check production readiness. Add $portalup-cso, $portalup-careful, and $portalup-document-release when needed.",
  proposal: "Use $portalup-comercial-experto to shape the opportunity, then $portalup-propuesta-comercial for the client-facing proposal.",
  marketing: "Use $portalup-marketing-experto to define audience, positioning, messaging, channels, and proof needed.",
  architect: "Use $portalup-arquitecto-experto to evaluate architecture tradeoffs, risks, roadmap, and validation plan.",
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

Output:
  A Codex-ready prompt using PortalUP Stack skills.
`);
}

if (command === "help" || command === "--help" || command === "-h") {
  usage();
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
