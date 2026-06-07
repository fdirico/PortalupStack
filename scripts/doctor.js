#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const versionPath = path.join(root, "VERSION");
const version = fs.existsSync(versionPath) ? fs.readFileSync(versionPath, "utf8").trim() : "unknown";
const skillsDir = path.join(root, ".agents", "skills");
const fixturesDir = path.join(root, "tests", "fixtures");
const skills = fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir).filter((name) => fs.statSync(path.join(skillsDir, name)).isDirectory()) : [];
const fixtures = fs.existsSync(fixturesDir) ? fs.readdirSync(fixturesDir).filter((name) => name.endsWith(".md")) : [];

console.log(`PortalUP Stack Codex ${version}`);
console.log(`Skills: ${skills.length}`);
console.log(`Fixtures: ${fixtures.length}`);

const result = spawnSync(process.execPath, [path.join(root, "scripts", "validate-all.js")], {
  cwd: root,
  encoding: "utf8",
  stdio: "inherit",
});

if (result.status !== 0) process.exit(result.status || 1);
console.log("Doctor passed.");
