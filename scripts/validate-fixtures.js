#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const fixturesDir = path.join(root, "tests", "fixtures");
const expectedDir = path.join(root, "tests", "expected-output");
const skillsDir = path.join(root, ".agents", "skills");
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
if (!fs.existsSync(expectedDir)) fail(`Missing expected output directory: ${expectedDir}`);
if (!fs.existsSync(skillsDir)) fail(`Missing skills directory: ${skillsDir}`);

const skills = fs.existsSync(skillsDir)
  ? new Set(fs.readdirSync(skillsDir).filter((name) => {
      return fs.statSync(path.join(skillsDir, name)).isDirectory();
    }))
  : new Set();

const fixtureFiles = listMarkdownFiles(fixturesDir);
const expectedFiles = new Set(listMarkdownFiles(expectedDir));

if (fixtureFiles.length === 0) fail("No fixture files found.");

for (const fixtureFile of fixtureFiles) {
  const fixturePath = path.join(fixturesDir, fixtureFile);
  const expectedPath = path.join(expectedDir, fixtureFile);
  const content = read(fixturePath);
  const mentionedSkills = [...content.matchAll(/\$([a-z0-9]+(?:-[a-z0-9]+)*)/g)].map((match) => match[1]);

  if (!expectedFiles.has(fixtureFile)) {
    fail(`${fixtureFile}: missing matching tests/expected-output/${fixtureFile}.`);
  }

  if (mentionedSkills.length === 0) {
    fail(`${fixtureFile}: fixture must mention at least one $portalup-* skill.`);
  }

  for (const skill of mentionedSkills) {
    if (!skill.startsWith("portalup-")) {
      fail(`${fixtureFile}: skill $${skill} must use the portalup namespace.`);
    }
    if (!skills.has(skill)) {
      fail(`${fixtureFile}: referenced skill $${skill} does not exist.`);
    }
  }

  if (!/Salida esperada:/i.test(content)) {
    fail(`${fixtureFile}: missing "Salida esperada" section.`);
  }

  if (fs.existsSync(expectedPath)) {
    const expected = read(expectedPath);
    if (!expected.includes("Minimum acceptable response:")) {
      fail(`${fixtureFile}: expected output must include "Minimum acceptable response:".`);
    }
    if (!/Score target:\s*\d+\/100\./.test(expected)) {
      fail(`${fixtureFile}: expected output must include "Score target: NN/100.".`);
    }
  }
}

for (const expectedFile of expectedFiles) {
  if (!fixtureFiles.includes(expectedFile)) {
    fail(`${expectedFile}: expected output has no matching fixture.`);
  }
}

if (errors.length) {
  console.error("Fixture validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Fixture validation passed.");
console.log(`Checked ${fixtureFiles.length} fixture(s).`);
