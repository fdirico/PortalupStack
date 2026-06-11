import fs from "fs";
import path from "path";
import type { SkillRegistry } from "./types.js";

export class SkillLoader {
  private root: string;
  private registry: SkillRegistry;
  private cache: Map<string, string> = new Map();

  constructor(root: string) {
    this.root = root;
    const registryPath = path.join(root, "core/registry/skills.registry.json");
    this.registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as SkillRegistry;
  }

  get defaultSkill(): string {
    return this.registry.defaultSkill;
  }

  isRegistered(skillName: string): boolean {
    return this.registry.skills.includes(skillName);
  }

  load(skillName: string): string {
    if (this.cache.has(skillName)) {
      return this.cache.get(skillName)!;
    }

    if (!this.isRegistered(skillName)) {
      process.stderr.write(
        `[pstack] Warning: skill "${skillName}" is not in the registry. Continuing without it.\n`
      );
      return "";
    }

    // Try both .agents/skills and dist/host-assets/claude/.claude/skills
    const candidates = [
      path.join(this.root, ".agents/skills", skillName, "SKILL.md"),
      path.join(this.root, "dist/host-assets/claude/.claude/skills", skillName, "SKILL.md"),
    ];

    for (const skillPath of candidates) {
      if (fs.existsSync(skillPath)) {
        const content = fs.readFileSync(skillPath, "utf8");
        this.cache.set(skillName, content);
        return content;
      }
    }

    process.stderr.write(
      `[pstack] Warning: SKILL.md for "${skillName}" not found on disk. Continuing without it.\n`
    );
    return "";
  }

  listRegistered(): string[] {
    return [...this.registry.skills];
  }
}
