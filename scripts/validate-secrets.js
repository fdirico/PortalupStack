#!/usr/bin/env node

/**
 * Detects hardcoded API key patterns in tracked files.
 * Fails if any tracked file contains a real API key.
 */

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

// Patterns that match real API keys (not example placeholders)
const KEY_PATTERNS = [
  /sk-ant-api[0-9A-Za-z_-]{20,}/,   // Anthropic key
  /sk-proj-[0-9A-Za-z_-]{20,}/,     // OpenAI project key
  /sk-[0-9A-Za-z]{32,}/,            // OpenAI legacy key
];

const SAFE_PREFIXES = [
  "sk-ant-...", "sk-...", "YOUR_KEY", "your-key", "<key>",
];

function isSafePlaceholder(line) {
  return SAFE_PREFIXES.some((p) => line.includes(p));
}

// Get tracked files from git
const gitResult = spawnSync("git", ["ls-files"], { cwd: root, encoding: "utf8" });
if (gitResult.status !== 0) {
  console.error("validate-secrets: could not list git tracked files.");
  process.exit(1);
}

const trackedFiles = gitResult.stdout.trim().split("\n").filter(Boolean);
const errors = [];

for (const relPath of trackedFiles) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content;
  try {
    content = fs.readFileSync(fullPath, "utf8");
  } catch {
    continue; // binary file — skip
  }

  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isSafePlaceholder(line)) continue;
    for (const pattern of KEY_PATTERNS) {
      if (pattern.test(line)) {
        errors.push(`${relPath}:${i + 1} — possible API key detected`);
        break;
      }
    }
  }
}

if (errors.length > 0) {
  console.error("validate-secrets FAILED — hardcoded API keys detected:");
  for (const e of errors) console.error(`  ${e}`);
  console.error("\nUse environment variables instead. Never commit API keys.");
  process.exit(1);
}

console.log("validate-secrets passed — no hardcoded API keys detected.");
