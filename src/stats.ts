import fs from "fs";
import path from "path";
import type { Session, TokenUsage } from "./types.js";

interface EngineStats {
  sessions: number;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  estimatedCostUSD: number;
}

interface ProjectStats {
  sessions: number;
  estimatedCostUSD: number;
}

function emptyEngineStats(): EngineStats {
  return { sessions: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, estimatedCostUSD: 0 };
}

function addTokens(acc: EngineStats, t: TokenUsage): void {
  acc.sessions++;
  acc.input += t.input;
  acc.output += t.output;
  acc.cacheRead += t.cacheRead;
  acc.cacheWrite += t.cacheWrite;
  acc.estimatedCostUSD += t.estimatedCostUSD;
}

function formatNum(n: number): string {
  return n.toLocaleString("en-US");
}

function durationLabel(startedAt: string, endedAt: string | null): string {
  if (!endedAt) return "ongoing";
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

function loadSessions(sessionDir: string): Session[] {
  const sessions: Session[] = [];
  if (!fs.existsSync(sessionDir)) return sessions;

  for (const engineDir of fs.readdirSync(sessionDir)) {
    const full = path.join(sessionDir, engineDir);
    if (!fs.statSync(full).isDirectory()) continue;
    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = fs.readFileSync(path.join(full, file), "utf8");
        sessions.push(JSON.parse(raw) as Session);
      } catch {
        // skip corrupted files
      }
    }
  }
  return sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

function buildMarkdown(sessions: Session[], updatedAt: string): string {
  const global: EngineStats = emptyEngineStats();
  const byEngine: Record<string, EngineStats> = {};
  const byProject: Record<string, ProjectStats> = {};

  for (const s of sessions) {
    addTokens(global, s.tokens);

    if (!byEngine[s.engine]) byEngine[s.engine] = emptyEngineStats();
    addTokens(byEngine[s.engine], s.tokens);

    if (!byProject[s.project]) byProject[s.project] = { sessions: 0, estimatedCostUSD: 0 };
    byProject[s.project].sessions++;
    byProject[s.project].estimatedCostUSD += s.tokens.estimatedCostUSD;
  }

  const lines: string[] = [
    `# PortalUP Stack — Estadísticas`,
    ``,
    `_Actualizado: ${updatedAt}_`,
    ``,
    `## Resumen global`,
    ``,
    `| Métrica | Valor |`,
    `|---|---|`,
    `| Sesiones totales | ${formatNum(global.sessions)} |`,
    `| Tokens entrada | ${formatNum(global.input)} |`,
    `| Tokens salida | ${formatNum(global.output)} |`,
    ...(global.cacheRead > 0 ? [`| Cache read | ${formatNum(global.cacheRead)} |`] : []),
    ...(global.cacheWrite > 0 ? [`| Cache write | ${formatNum(global.cacheWrite)} |`] : []),
    `| Costo estimado (USD) | $${global.estimatedCostUSD.toFixed(4)} |`,
    ``,
    `## Por engine`,
    ``,
    `| Engine | Sesiones | Tokens in | Tokens out | Costo (USD) |`,
    `|---|---|---|---|---|`,
    ...Object.entries(byEngine).map(
      ([eng, s]) =>
        `| ${eng} | ${formatNum(s.sessions)} | ${formatNum(s.input)} | ${formatNum(s.output)} | $${s.estimatedCostUSD.toFixed(4)} |`
    ),
    ``,
    `## Por proyecto`,
    ``,
    `| Proyecto | Sesiones | Costo (USD) |`,
    `|---|---|---|`,
    ...Object.entries(byProject).map(
      ([proj, s]) => `| ${proj} | ${formatNum(s.sessions)} | $${s.estimatedCostUSD.toFixed(4)} |`
    ),
    ``,
    `## Sesiones recientes`,
    ``,
    `| ID | Engine | Modelo | Inicio | Duración | Tokens in | Tokens out | Costo | Skills |`,
    `|---|---|---|---|---|---|---|---|---|`,
    ...sessions.slice(0, 20).map((s) => {
      const dur = durationLabel(s.startedAt, s.endedAt);
      const skills = s.skillsUsed.length > 0 ? s.skillsUsed.join(", ") : "—";
      return `| ${s.id} | ${s.engine} | ${s.model} | ${s.startedAt.slice(0, 16).replace("T", " ")} | ${dur} | ${formatNum(s.tokens.input)} | ${formatNum(s.tokens.output)} | $${s.tokens.estimatedCostUSD.toFixed(4)} | ${skills} |`;
    }),
  ];

  return lines.join("\n") + "\n";
}

export class StatsEngine {
  private sessionDir: string;
  private statsFile: string;

  constructor(root: string, sessionDir?: string, statsFile?: string) {
    this.sessionDir = sessionDir ?? path.join(root, "outputs/sessions");
    this.statsFile = statsFile ?? path.join(root, "outputs/stats.md");
  }

  refresh(): string {
    const sessions = loadSessions(this.sessionDir);
    const updatedAt = new Date().toISOString().slice(0, 16).replace("T", " ");
    const markdown = buildMarkdown(sessions, updatedAt);

    fs.mkdirSync(path.dirname(this.statsFile), { recursive: true });
    fs.writeFileSync(this.statsFile, markdown, "utf8");

    return this.statsFile;
  }

  summary(): string {
    if (!fs.existsSync(this.statsFile)) {
      return "(sin estadísticas — ejecutá `pstack stats` para generar)";
    }
    // Return first 20 lines as quick summary
    const lines = fs.readFileSync(this.statsFile, "utf8").split("\n");
    return lines.slice(0, 20).join("\n");
  }
}
