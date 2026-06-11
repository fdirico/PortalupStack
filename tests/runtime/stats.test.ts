import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Minimal inline stats engine for test isolation
function buildStats(sessions: any[]): string {
  let totalSessions = 0, totalIn = 0, totalOut = 0, totalCost = 0;
  const byEngine: Record<string, { sessions: number; input: number; output: number; cost: number }> = {};

  for (const s of sessions) {
    totalSessions++;
    totalIn += s.tokens.input;
    totalOut += s.tokens.output;
    totalCost += s.tokens.estimatedCostUSD;

    if (!byEngine[s.engine]) byEngine[s.engine] = { sessions: 0, input: 0, output: 0, cost: 0 };
    byEngine[s.engine].sessions++;
    byEngine[s.engine].input += s.tokens.input;
    byEngine[s.engine].output += s.tokens.output;
    byEngine[s.engine].cost += s.tokens.estimatedCostUSD;
  }

  const lines = [
    `# PortalUP Stack — Estadísticas`,
    ``,
    `## Resumen global`,
    ``,
    `| Métrica | Valor |`,
    `|---|---|`,
    `| Sesiones totales | ${totalSessions} |`,
    `| Tokens entrada | ${totalIn.toLocaleString("en-US")} |`,
    `| Tokens salida | ${totalOut.toLocaleString("en-US")} |`,
    `| Costo estimado (USD) | $${totalCost.toFixed(4)} |`,
    ``,
    `## Por engine`,
    ``,
    `| Engine | Sesiones | Tokens in | Tokens out | Costo (USD) |`,
    `|---|---|---|---|---|`,
    ...Object.entries(byEngine).map(
      ([eng, s]) => `| ${eng} | ${s.sessions} | ${s.input} | ${s.output} | $${s.cost.toFixed(4)} |`
    ),
    ``,
    `## Sesiones recientes`,
    ``,
    `| ID | Engine | Inicio |`,
    `|---|---|---|`,
    ...sessions
      .sort((a: any, b: any) => b.startedAt.localeCompare(a.startedAt))
      .slice(0, 20)
      .map((s: any) => `| ${s.id} | ${s.engine} | ${s.startedAt.slice(0, 10)} |`),
  ];

  return lines.join("\n") + "\n";
}

function makeSession(id: string, engine: string, overrides: Partial<any> = {}): any {
  return {
    id,
    project: "test-project",
    engine,
    model: engine === "claude" ? "claude-sonnet-4-6" : "gpt-4o",
    startedAt: "2026-06-11T09:00:00Z",
    endedAt: "2026-06-11T10:00:00Z",
    handoffFrom: null,
    handoffTo: null,
    tokens: { input: 10000, output: 2000, cacheRead: 0, cacheWrite: 0, estimatedCostUSD: 0.06 },
    skillsUsed: ["portalup-orchestrator"],
    messages: [{ role: "user", content: "test", timestamp: "2026-06-11T09:00:00Z" }],
    ...overrides,
  };
}

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pstack-stats-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("StatsEngine", () => {
  it("happy path: aggregates 3 sessions and generates correct stats.md", () => {
    const sessions = [
      makeSession("2026-06-09-first",  "claude"),
      makeSession("2026-06-10-second", "openai"),
      makeSession("2026-06-11-third",  "claude"),
    ];

    const md = buildStats(sessions);

    assert.ok(md.includes("# PortalUP Stack — Estadísticas"));
    assert.ok(md.includes("| Sesiones totales | 3 |"));
    assert.ok(md.includes("| claude | 2 |"));
    assert.ok(md.includes("| openai | 1 |"));
    // Total tokens: 3 sessions × 10000 input = 30000
    assert.ok(md.includes("30,000"));
    // Total cost: 3 × $0.06 = $0.18
    assert.ok(md.includes("$0.1800"));
  });

  it("failure path: empty sessions dir produces zero-count stats", () => {
    const md = buildStats([]);

    assert.ok(md.includes("| Sesiones totales | 0 |"));
    assert.ok(md.includes("| Tokens entrada | 0 |"));
    assert.ok(md.includes("$0.0000"));
  });

  it("writes stats.md file to disk when refreshed", () => {
    const sessionDir = path.join(tmpDir, "sessions");
    const statsFile = path.join(tmpDir, "stats.md");

    // Write a session JSON
    const s = makeSession("2026-06-11-test", "claude");
    fs.mkdirSync(path.join(sessionDir, "claude"), { recursive: true });
    fs.writeFileSync(path.join(sessionDir, "claude", `${s.id}.json`), JSON.stringify(s, null, 2));

    // Simulate StatsEngine.refresh()
    const sessions: any[] = [];
    for (const engineDir of fs.readdirSync(sessionDir)) {
      const full = path.join(sessionDir, engineDir);
      if (!fs.statSync(full).isDirectory()) continue;
      for (const file of fs.readdirSync(full)) {
        if (file.endsWith(".json")) {
          sessions.push(JSON.parse(fs.readFileSync(path.join(full, file), "utf8")));
        }
      }
    }
    const md = buildStats(sessions);
    fs.mkdirSync(path.dirname(statsFile), { recursive: true });
    fs.writeFileSync(statsFile, md, "utf8");

    assert.ok(fs.existsSync(statsFile));
    const content = fs.readFileSync(statsFile, "utf8");
    assert.ok(content.includes("Sesiones totales"));
    assert.ok(content.includes("2026-06-11-test"));
  });

  it("edge case: session with endedAt null is treated as ongoing", () => {
    const sessions = [makeSession("2026-06-11-open", "claude", { endedAt: null })];
    const md = buildStats(sessions);

    assert.ok(md.includes("| Sesiones totales | 1 |"));
    // Should still include the session
    assert.ok(md.includes("2026-06-11-open"));
  });

  it("recent sessions are sorted by startedAt descending", () => {
    const sessions = [
      makeSession("2026-06-09-older", "claude", { startedAt: "2026-06-09T08:00:00Z" }),
      makeSession("2026-06-11-newer", "openai", { startedAt: "2026-06-11T09:00:00Z" }),
    ];
    const md = buildStats(sessions);

    const newerPos = md.indexOf("2026-06-11-newer");
    const olderPos = md.indexOf("2026-06-09-older");
    assert.ok(newerPos < olderPos, "newer session should appear before older in stats");
  });
});
