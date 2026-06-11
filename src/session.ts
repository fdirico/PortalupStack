import fs from "fs";
import path from "path";
import type { Session, SessionSummary, Message, TokenUsage } from "./types.js";

const EMPTY_USAGE: TokenUsage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, estimatedCostUSD: 0 };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

function generateId(hint?: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const slug = hint ? slugify(hint) : Math.random().toString(36).slice(2, 8);
  return `${date}-${slug}`;
}

function detectProject(root: string): string {
  try {
    const pkg = path.join(root, "package.json");
    if (fs.existsSync(pkg)) {
      const p = JSON.parse(fs.readFileSync(pkg, "utf8"));
      if (p.name) return p.name;
    }
  } catch {}
  return path.basename(root);
}

export class SessionManager {
  private sessionDir: string;
  private project: string;

  constructor(root: string, sessionDir?: string) {
    this.sessionDir = sessionDir ?? path.join(root, "outputs/sessions");
    this.project = detectProject(root);
  }

  create(engine: string, model: string, hint?: string, handoffFrom?: string): Session {
    return {
      id: generateId(hint),
      project: this.project,
      engine,
      model,
      startedAt: new Date().toISOString(),
      endedAt: null,
      handoffFrom: handoffFrom ?? null,
      handoffTo: null,
      tokens: { ...EMPTY_USAGE },
      skillsUsed: [],
      messages: [],
    };
  }

  save(session: Session): void {
    const dir = path.join(this.sessionDir, session.engine);
    fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${session.id}.json`);
    const tmpPath = `${filePath}.tmp`;

    const data = JSON.stringify(session, null, 2);
    fs.writeFileSync(tmpPath, data, "utf8");
    fs.renameSync(tmpPath, filePath);
  }

  load(engine: string, id: string): Session {
    const filePath = path.join(this.sessionDir, engine, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Session not found: ${engine}/${id}`);
    }
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as Session;
  }

  close(session: Session): Session {
    const closed = { ...session, endedAt: new Date().toISOString() };
    this.save(closed);
    return closed;
  }

  addMessage(session: Session, message: Message): Session {
    return { ...session, messages: [...session.messages, message] };
  }

  addUsage(session: Session, usage: TokenUsage): Session {
    const t = session.tokens;
    const updated: TokenUsage = {
      input: t.input + usage.input,
      output: t.output + usage.output,
      cacheRead: t.cacheRead + usage.cacheRead,
      cacheWrite: t.cacheWrite + usage.cacheWrite,
      estimatedCostUSD: t.estimatedCostUSD + usage.estimatedCostUSD,
    };
    return { ...session, tokens: updated };
  }

  trackSkill(session: Session, skillName: string): Session {
    if (session.skillsUsed.includes(skillName)) return session;
    return { ...session, skillsUsed: [...session.skillsUsed, skillName] };
  }

  list(limit = 20): SessionSummary[] {
    const summaries: SessionSummary[] = [];

    if (!fs.existsSync(this.sessionDir)) return summaries;

    for (const engineDir of fs.readdirSync(this.sessionDir)) {
      const full = path.join(this.sessionDir, engineDir);
      if (!fs.statSync(full).isDirectory()) continue;

      for (const file of fs.readdirSync(full)) {
        if (!file.endsWith(".json")) continue;
        try {
          const raw = fs.readFileSync(path.join(full, file), "utf8");
          const s = JSON.parse(raw) as Session;
          summaries.push({
            id: s.id,
            project: s.project,
            engine: s.engine,
            model: s.model,
            startedAt: s.startedAt,
            endedAt: s.endedAt,
            tokens: s.tokens,
            skillsUsed: s.skillsUsed,
            messageCount: s.messages.length,
          });
        } catch {
          // Skip corrupted files silently in list — they'll surface on load
        }
      }
    }

    return summaries
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .slice(0, limit);
  }
}
