import fs from "fs";
import path from "path";
import os from "os";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

function resolvePortalupHome(): string {
  return process.env["PORTALUP_HOME"] ?? path.join(os.homedir(), ".portalup");
}

function readGlobalConfig(home: string): { projectsDir: string } {
  const configPath = path.join(home, "config.json");
  if (fs.existsSync(configPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (raw.projectsDir) return { projectsDir: raw.projectsDir as string };
    } catch {
      // Fall through to default
    }
  }
  return { projectsDir: path.join(home, "projects") };
}

export interface ProjectInfo {
  name: string;
  lastModified: Date;
}

export class ProjectManager {
  private readonly projectsDir: string;

  constructor() {
    const home = resolvePortalupHome();
    const config = readGlobalConfig(home);
    this.projectsDir = config.projectsDir;
  }

  private resolveSlug(name: string): string {
    const slug = slugify(name);
    if (!slug) throw new Error(`Nombre de proyecto inválido: "${name}"`);
    return slug;
  }

  projectPath(name: string): string {
    return path.join(this.projectsDir, this.resolveSlug(name));
  }

  exists(name: string): boolean {
    try {
      return fs.existsSync(path.join(this.projectPath(name), "project.md"));
    } catch {
      return false;
    }
  }

  create(name: string, templateContent: string): void {
    const slug = this.resolveSlug(name);
    const dir = path.join(this.projectsDir, slug);
    const sessionsDir = path.join(dir, "sessions");

    fs.mkdirSync(sessionsDir, { recursive: true });

    const today = new Date().toISOString().slice(0, 10);
    const content = templateContent
      .replace(/\[nombre\]/g, slug)
      .replace(/YYYY-MM-DD/, today);

    fs.writeFileSync(path.join(dir, "project.md"), content, "utf8");
  }

  load(name: string): string {
    const docPath = path.join(this.projectPath(name), "project.md");
    if (!fs.existsSync(docPath)) {
      throw new Error(
        `Proyecto "${this.resolveSlug(name)}" no encontrado en ${this.projectsDir}`
      );
    }
    return fs.readFileSync(docPath, "utf8");
  }

  write(name: string, content: string): void {
    const docPath = path.join(this.projectPath(name), "project.md");
    fs.writeFileSync(docPath, content, "utf8");
  }

  getNextSessionId(name: string): string {
    const sessionsDir = path.join(this.projectPath(name), "sessions");
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    if (!fs.existsSync(sessionsDir)) return `${today}-1`;

    const count = fs
      .readdirSync(sessionsDir)
      .filter((f) => f.startsWith(today) && f.endsWith(".md")).length;

    return `${today}-${count + 1}`;
  }

  createSessionFile(name: string, sessionId: string, content: string): void {
    const sessionsDir = path.join(this.projectPath(name), "sessions");
    fs.mkdirSync(sessionsDir, { recursive: true });
    fs.writeFileSync(path.join(sessionsDir, `${sessionId}.md`), content, "utf8");
  }

  list(): ProjectInfo[] {
    if (!fs.existsSync(this.projectsDir)) return [];

    return fs
      .readdirSync(this.projectsDir)
      .filter((entry) => {
        const docPath = path.join(this.projectsDir, entry, "project.md");
        return fs.existsSync(docPath);
      })
      .map((entry) => {
        const docPath = path.join(this.projectsDir, entry, "project.md");
        return { name: entry, lastModified: fs.statSync(docPath).mtime };
      })
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }
}
