#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const skillsDir = path.join(root, ".agents", "skills");
const namePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message) {
  errors.push(message);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const parts = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (parts) data[parts[1]] = parts[2].trim();
  }
  return data;
}

const errors = [];

if (!fs.existsSync(skillsDir)) {
  fail(`Missing skills directory: ${skillsDir}`);
} else {
  const skills = fs.readdirSync(skillsDir).filter((name) => {
    return fs.statSync(path.join(skillsDir, name)).isDirectory();
  });

  if (skills.length === 0) fail("No skills found.");

  for (const skill of skills) {
    const skillPath = path.join(skillsDir, skill);
    const skillFile = path.join(skillPath, "SKILL.md");
    const openaiFile = path.join(skillPath, "agents", "openai.yaml");

    if (!namePattern.test(skill)) fail(`${skill}: invalid folder name.`);
    if (!fs.existsSync(skillFile)) {
      fail(`${skill}: missing SKILL.md.`);
      continue;
    }

    const content = read(skillFile);
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter) {
      fail(`${skill}: missing YAML frontmatter.`);
      continue;
    }

    if (frontmatter.name !== skill) fail(`${skill}: frontmatter name must match folder name.`);
    if (!frontmatter.description || frontmatter.description.length < 80) {
      fail(`${skill}: description must be specific and at least 80 characters.`);
    }
    if (/\bClaude\b|CLAUDE\.md|\.claude\//.test(content)) {
      fail(`${skill}: contains Claude-specific references.`);
    }

    const requiredSections = ["## Use", "## Workflow", "## Output", "## Checklist"];
    for (const section of requiredSections) {
      if (!content.includes(section)) fail(`${skill}: missing section ${section}.`);
    }

    if (!fs.existsSync(openaiFile)) {
      fail(`${skill}: missing agents/openai.yaml.`);
    } else {
      const openai = read(openaiFile);
      if (!openai.includes("display_name:")) fail(`${skill}: openai.yaml missing display_name.`);
      if (!openai.includes("short_description:")) fail(`${skill}: openai.yaml missing short_description.`);
      if (!openai.includes(`$${skill}`)) fail(`${skill}: openai.yaml default_prompt must mention $${skill}.`);
    }
  }
}

if (errors.length) {
  console.error("Skill validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Skill validation passed.");

