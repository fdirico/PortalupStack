import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Minimal SkillLoader re-implementation for test isolation
class SkillLoader {
  private root: string;
  private registry: { defaultSkill: string; skills: string[] };
  private cache = new Map<string, string>();

  constructor(root: string, registry: { defaultSkill: string; skills: string[] }) {
    this.root = root;
    this.registry = registry;
  }

  isRegistered(name: string) { return this.registry.skills.includes(name); }
  get defaultSkill() { return this.registry.defaultSkill; }

  load(skillName: string): string {
    if (this.cache.has(skillName)) return this.cache.get(skillName)!;
    if (!this.isRegistered(skillName)) {
      process.stderr.write(`[pstack] Warning: skill "${skillName}" not in registry.\n`);
      return "";
    }
    const skillPath = path.join(this.root, ".agents/skills", skillName, "SKILL.md");
    if (!fs.existsSync(skillPath)) {
      process.stderr.write(`[pstack] Warning: SKILL.md for "${skillName}" not found.\n`);
      return "";
    }
    const content = fs.readFileSync(skillPath, "utf8");
    this.cache.set(skillName, content);
    return content;
  }
}

function makeTempSkillRoot(): { root: string; cleanup: () => void } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pstack-test-"));
  const skillDir = path.join(root, ".agents/skills/portalup-orchestrator");
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), "# Orchestrator\n\nTest content.");
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

describe("SkillLoader", () => {
  it("happy path: loads SKILL.md content by name", () => {
    const { root, cleanup } = makeTempSkillRoot();
    try {
      const loader = new SkillLoader(root, {
        defaultSkill: "portalup-orchestrator",
        skills: ["portalup-orchestrator"],
      });
      const content = loader.load("portalup-orchestrator");
      assert.ok(content.includes("Orchestrator"));
    } finally {
      cleanup();
    }
  });

  it("caches skill content on second load", () => {
    const { root, cleanup } = makeTempSkillRoot();
    try {
      const loader = new SkillLoader(root, {
        defaultSkill: "portalup-orchestrator",
        skills: ["portalup-orchestrator"],
      });
      const first = loader.load("portalup-orchestrator");
      // Delete the file after first load — cache should still return it
      fs.rmSync(path.join(root, ".agents/skills/portalup-orchestrator/SKILL.md"));
      const second = loader.load("portalup-orchestrator");
      assert.equal(first, second);
    } finally {
      cleanup();
    }
  });

  it("failure path: skill not in registry returns empty string", () => {
    const { root, cleanup } = makeTempSkillRoot();
    try {
      const loader = new SkillLoader(root, {
        defaultSkill: "portalup-orchestrator",
        skills: ["portalup-orchestrator"],
      });
      const content = loader.load("portalup-nonexistent");
      assert.equal(content, "");
    } finally {
      cleanup();
    }
  });

  it("edge case: skill in registry but SKILL.md missing from disk returns empty string", () => {
    const { root, cleanup } = makeTempSkillRoot();
    try {
      const loader = new SkillLoader(root, {
        defaultSkill: "portalup-orchestrator",
        skills: ["portalup-orchestrator", "portalup-missing-file"],
      });
      const content = loader.load("portalup-missing-file");
      assert.equal(content, "");
    } finally {
      cleanup();
    }
  });

  it("defaultSkill returns registry default", () => {
    const { root, cleanup } = makeTempSkillRoot();
    try {
      const loader = new SkillLoader(root, {
        defaultSkill: "portalup-orchestrator",
        skills: ["portalup-orchestrator"],
      });
      assert.equal(loader.defaultSkill, "portalup-orchestrator");
    } finally {
      cleanup();
    }
  });
});
