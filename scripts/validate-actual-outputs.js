#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const fixturesDir = path.join(root, "tests", "fixtures");
const actualDir = path.join(root, "tests", "actual-output");
const errors = [];

function fail(message) {
  errors.push(message);
}

function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => name.endsWith(".md")).sort();
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

if (!fs.existsSync(fixturesDir)) fail(`Missing fixtures directory: ${fixturesDir}`);
if (!fs.existsSync(actualDir)) fail(`Missing actual output directory: ${actualDir}`);

const fixtureFiles = listMarkdownFiles(fixturesDir);
const actualFiles = new Set(listMarkdownFiles(actualDir));

if (fixtureFiles.length === 0) fail("No fixture files found.");

for (const fixtureFile of fixtureFiles) {
  const actualPath = path.join(actualDir, fixtureFile);

  if (!actualFiles.has(fixtureFile)) {
    fail(`${fixtureFile}: missing matching tests/actual-output/${fixtureFile}.`);
    continue;
  }

  const content = read(actualPath);
  if (!content.includes("Evaluation")) {
    fail(`${fixtureFile}: actual output must include an Evaluation section.`);
  }
  if (!/Score:\s*\d+\/100\./.test(content)) {
    fail(`${fixtureFile}: actual output must include "Score: NN/100.".`);
  }
  if (!/Meets expected output:\s*(yes|no)\./i.test(content)) {
    fail(`${fixtureFile}: actual output must state whether it meets expected output.`);
  }
}

for (const actualFile of actualFiles) {
  if (!fixtureFiles.includes(actualFile)) {
    fail(`${actualFile}: actual output has no matching fixture.`);
  }
}

if (errors.length) {
  console.error("Actual output validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Actual output validation passed.");
console.log(`Checked ${fixtureFiles.length} actual output file(s).`);
