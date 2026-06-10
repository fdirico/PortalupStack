#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function parseArgs() {
  const options = {
    engine: null,
    outDir: "dist/host-assets",
    dryRun: true,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--engine") {
      options.engine = args[index + 1];
      index += 1;
    } else if (arg === "--out") {
      options.outDir = args[index + 1];
      index += 1;
    } else if (arg === "--write") {
      options.dryRun = false;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.engine) {
    const config = readJson("portalup.config.example.json");
    options.engine = config.engine;
  }

  return options;
}

function usage() {
  console.log(`generate-host-assets - PortalUP Stack host package generator

Usage:
  node scripts/generate-host-assets.js --engine codex --dry-run
  node scripts/generate-host-assets.js --engine codex --write
  node scripts/generate-host-assets.js --engine claude --write
  node scripts/generate-host-assets.js --engine cursor --out dist/host-assets --write

Options:
  --engine <name>   Engine id from core/registry/engines.registry.json.
  --out <path>      Output directory. Default: dist/host-assets.
  --dry-run         Print planned files without writing them. Default.
  --write           Write files into the output directory.
`);
}

function ensureDir(dirPath, dryRun, planned) {
  if (dryRun) {
    planned.add(dirPath);
    return;
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

function resetGeneratedTarget(targetRoot, options) {
  if (options.dryRun) return;

  const resolvedTarget = path.resolve(targetRoot);
  const resolvedOut = path.resolve(root, options.outDir);
  if (!resolvedTarget.startsWith(`${resolvedOut}${path.sep}`)) {
    throw new Error(`Refusing to clear unsafe target: ${resolvedTarget}`);
  }

  fs.rmSync(resolvedTarget, { recursive: true, force: true });
  fs.mkdirSync(resolvedTarget, { recursive: true });
}

function writeFile(relativeTarget, content, options, planned) {
  const fullTarget = path.join(root, options.outDir, options.engine, relativeTarget);
  if (options.dryRun) {
    planned.add(fullTarget);
    return;
  }
  fs.mkdirSync(path.dirname(fullTarget), { recursive: true });
  fs.writeFileSync(fullTarget, content);
}

function copyFile(relativeSource, relativeTarget, options, planned) {
  const fullSource = path.join(root, relativeSource);
  const fullTarget = path.join(root, options.outDir, options.engine, relativeTarget);
  if (!fs.existsSync(fullSource)) {
    throw new Error(`Missing source file: ${relativeSource}`);
  }
  if (options.dryRun) {
    planned.add(fullTarget);
    return;
  }
  fs.mkdirSync(path.dirname(fullTarget), { recursive: true });
  fs.copyFileSync(fullSource, fullTarget);
}

function copyDir(relativeSource, relativeTarget, options, planned) {
  const fullSource = path.join(root, relativeSource);
  if (!fs.existsSync(fullSource)) {
    throw new Error(`Missing source directory: ${relativeSource}`);
  }

  const entries = fs.readdirSync(fullSource, { withFileTypes: true });
  for (const entry of entries) {
    const source = path.join(relativeSource, entry.name);
    const target = path.join(relativeTarget, entry.name);
    if (entry.isDirectory()) {
      copyDir(source, target, options, planned);
    } else {
      copyFile(source, target, options, planned);
    }
  }
}

function copyDirFiltered(relativeSource, relativeTarget, options, planned, shouldSkip) {
  const fullSource = path.join(root, relativeSource);
  if (!fs.existsSync(fullSource)) {
    throw new Error(`Missing source directory: ${relativeSource}`);
  }

  const entries = fs.readdirSync(fullSource, { withFileTypes: true });
  for (const entry of entries) {
    const source = path.join(relativeSource, entry.name);
    const target = path.join(relativeTarget, entry.name);
    if (shouldSkip(source, entry)) continue;
    if (entry.isDirectory()) {
      copyDirFiltered(source, target, options, planned, shouldSkip);
    } else {
      copyFile(source, target, options, planned);
    }
  }
}

function skipCodexOnlyFiles(relativePath, entry) {
  const normalized = relativePath.replace(/\\/g, "/");
  if (entry.isDirectory() && normalized.endsWith("/agents")) return true;
  if (normalized.endsWith("/agents/openai.yaml")) return true;
  return false;
}

function engineOverview(engine, engineDefinition, skills) {
  return `# PortalUP Stack Host Package - ${engine}

## Engine

- Id: ${engine}
- Status: ${engineDefinition.status}
- Adapter: ${engineDefinition.adapter}

## Included Skills

${skills.map((skill) => `- ${skill}`).join("\n")}

## Notes

This package is generated from PortalUP Stack Core.
Codex is currently the operational baseline. Other engines may require host-specific validation before production use.
`;
}

function generateCodex(options, planned, skills) {
  copyDir(".agents/skills", "skills", options, planned);
  copyFile("AGENTS.md", "AGENTS.md", options, planned);
  copyFile("scripts/install-local.ps1", "scripts/install-local.ps1", options, planned);
  copyFile("scripts/install-local.sh", "scripts/install-local.sh", options, planned);
  copyFile("scripts/doctor.js", "scripts/doctor.js", options, planned);
  writeFile("README.md", engineOverview("codex", getEngine("codex"), skills), options, planned);
}

function generateClaude(options, planned, skills) {
  copyDirFiltered(".agents/skills", ".claude/skills", options, planned, skipCodexOnlyFiles);
  const claudeInstructions = `# CLAUDE.md

Use PortalUP Stack as the operating method for this workspace.

Primary entry point:

\`\`\`text
Use portalup-orchestrator to interpret the user's request, select specialists, manage context, and create continuity handoffs.
\`\`\`

Skills are packaged under \`.claude/skills/\` as Claude Code project Skills.

Continuity templates:

- \`templates/agent-handoff.md\`
- \`templates/continuity-summary.md\`

Use \`portalup-orchestrator\` first for broad or ambiguous tasks.
`;
  writeFile("CLAUDE.md", claudeInstructions, options, planned);
  copyFile("templates/agent-handoff.md", "templates/agent-handoff.md", options, planned);
  copyFile("templates/continuity-summary.md", "templates/continuity-summary.md", options, planned);
  writeFile("README.md", engineOverview("claude", getEngine("claude"), skills), options, planned);
}

function generateCursor(options, planned, skills) {
  copyDirFiltered(".agents/skills", "skills", options, planned, skipCodexOnlyFiles);
  const cursorRules = `# PortalUP Stack Cursor Rules

Use PortalUP Stack as the working method for this repository.

- Start broad requests with portalup-orchestrator.
- Use specialist skills from the generated \`skills/\` directory.
- Preserve continuity using PortalUP handoff templates.
- Apply risk gates before destructive, production, migration, credential, auth or data changes.

This is a generated prompt/rules package. Native Cursor rule behavior must be validated per workspace.
`;
  writeFile(".cursor/rules/portalup-stack.mdc", cursorRules, options, planned);
  copyFile("templates/agent-handoff.md", "templates/agent-handoff.md", options, planned);
  copyFile("templates/continuity-summary.md", "templates/continuity-summary.md", options, planned);
  writeFile("README.md", engineOverview("cursor", getEngine("cursor"), skills), options, planned);
}

function getEngine(engine) {
  const registry = readJson("core/registry/engines.registry.json");
  return registry.engines[engine];
}

function main() {
  const options = parseArgs();
  const engines = readJson("core/registry/engines.registry.json");
  const skillRegistry = readJson("core/registry/skills.registry.json");
  const engineDefinition = engines.engines[options.engine];

  if (!engineDefinition) {
    throw new Error(`Unknown engine: ${options.engine}`);
  }

  const skills = skillRegistry.skills;
  const planned = new Set();
  const targetRoot = path.join(root, options.outDir, options.engine);
  resetGeneratedTarget(targetRoot, options);
  ensureDir(targetRoot, options.dryRun, planned);

  if (options.engine === "codex") {
    generateCodex(options, planned, skills);
  } else if (options.engine === "claude") {
    generateClaude(options, planned, skills);
  } else if (options.engine === "cursor") {
    generateCursor(options, planned, skills);
  } else {
    throw new Error(`No generator implemented for engine: ${options.engine}`);
  }

  if (options.dryRun) {
    console.log(`Dry run for engine "${options.engine}". Planned targets:`);
    for (const item of [...planned].sort()) console.log(`- ${path.relative(root, item)}`);
    return;
  }

  console.log(`Generated PortalUP Stack host assets for "${options.engine}" at ${path.relative(root, targetRoot)}.`);
}

try {
  main();
} catch (error) {
  console.error(`Host asset generation failed: ${error.message}`);
  process.exit(1);
}
