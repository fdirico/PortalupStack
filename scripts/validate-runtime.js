#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const requiredFiles = [
  "portalup.config.example.json",
  "docs/arquitectura-multi-llm.md",
  "docs/roadmap-multi-llm.md",
  "docs/checklist-multi-llm.md",
  "docs/host-assets-generator.md",
  "docs/claude-code-adapter.md",
  "docs/continuidad-codex-claude.md",
  "core/runtime/README.md",
  "core/runtime/engine-contract.md",
  "core/runtime/routing-policy.md",
  "core/runtime/context-policy.md",
  "core/runtime/handoff-policy.md",
  "core/registry/engines.registry.json",
  "core/registry/skills.registry.json",
  "core/adapters/codex/adapter.md",
  "core/adapters/codex/install-targets.json",
  "core/adapters/claude/adapter.md",
  "core/adapters/claude/install-targets.json",
  "core/adapters/cursor/adapter.md",
  "core/adapters/cursor/install-targets.json",
  "scripts/generate-host-assets.js",
  "scripts/install-claude-project.ps1",
  "scripts/install-claude-project.sh",
];

const jsonFiles = [
  "portalup.config.example.json",
  "core/registry/engines.registry.json",
  "core/registry/skills.registry.json",
  "core/adapters/codex/install-targets.json",
  "core/adapters/claude/install-targets.json",
  "core/adapters/cursor/install-targets.json",
];

const errors = [];

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    errors.push(`Missing required file: ${file}`);
  }
}

for (const file of jsonFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    continue;
  }

  try {
    JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    errors.push(`Invalid JSON in ${file}: ${error.message}`);
  }
}

const generator = path.join(root, "scripts", "generate-host-assets.js");
if (fs.existsSync(generator)) {
  const { spawnSync } = require("child_process");
  for (const engine of ["codex", "claude", "cursor"]) {
    const result = spawnSync(process.execPath, [generator, "--engine", engine, "--dry-run"], {
      cwd: root,
      encoding: "utf8",
    });
    if (result.status !== 0) {
      errors.push(`generate-host-assets dry-run failed for ${engine}.`);
    } else if (!result.stdout.includes(`Dry run for engine "${engine}"`)) {
      errors.push(`generate-host-assets dry-run output missing engine ${engine}.`);
    }
  }

  const claudeDryRun = spawnSync(process.execPath, [generator, "--engine", "claude", "--dry-run"], {
    cwd: root,
    encoding: "utf8",
  });
  if (!claudeDryRun.stdout.includes(".claude")) {
    errors.push("Claude host assets must target .claude/skills.");
  }
}

const { spawnSync } = require("child_process");
const installClaude = path.join(root, "scripts", "install-claude-project.ps1");
if (fs.existsSync(installClaude)) {
  const tempProject = path.join(root, "dist", "validation", "claude-project");
  fs.mkdirSync(tempProject, { recursive: true });
  const result = spawnSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", installClaude, tempProject, "-DryRun"], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    errors.push("install-claude-project.ps1 dry-run failed.");
  } else if (!result.stdout.includes("Would copy")) {
    errors.push("install-claude-project.ps1 dry-run must report planned copies.");
  }
}

if (errors.length > 0) {
  console.error("PortalUP runtime validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("PortalUP runtime validation passed.");
