#!/usr/bin/env node

const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const validators = [
  "validate-skills.js",
  "validate-fixtures.js",
  "validate-actual-outputs.js",
  "validate-continuity.js",
  "validate-cli.js",
  "validate-runtime.js",
  "validate-secrets.js",
];

for (const validator of validators) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", validator)], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log("All validations passed.");
