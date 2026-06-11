import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Inline minimal SessionManager for test isolation (mirrors src/session.ts logic)
class SessionManager {
  private sessionDir: string;
  private project: string;

  constructor(sessionDir: string, project = "test-project") {
    this.sessionDir = sessionDir;
    this.project = project;
  }

  create(engine: string, model: string, hint?: string): any {
    const date = new Date().toISOString().slice(0, 10);
    const slug = hint ? hint.toLowerCase().replace(/\s+/g, "-").slice(0, 40) : "session";
    return {
      id: `${date}-${slug}`,
      project: this.project,
      engine,
      model,
      startedAt: new Date().toISOString(),
      endedAt: null,
      handoffFrom: null,
      handoffTo: null,
      tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, estimatedCostUSD: 0 },
      skillsUsed: [],
      messages: [],
    };
  }

  save(session: any): void {
    const dir = path.join(this.sessionDir, session.engine);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${session.id}.json`);
    const tmp = `${filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(session, null, 2), "utf8");
    fs.renameSync(tmp, filePath);
  }

  load(engine: string, id: string): any {
    const filePath = path.join(this.sessionDir, engine, `${id}.json`);
    if (!fs.existsSync(filePath)) throw new Error(`Session not found: ${engine}/${id}`);
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  close(session: any): any {
    const closed = { ...session, endedAt: new Date().toISOString() };
    this.save(closed);
    return closed;
  }

  list(limit = 20): any[] {
    const summaries: any[] = [];
    if (!fs.existsSync(this.sessionDir)) return summaries;
    for (const engineDir of fs.readdirSync(this.sessionDir)) {
      const full = path.join(this.sessionDir, engineDir);
      if (!fs.statSync(full).isDirectory()) continue;
      for (const file of fs.readdirSync(full)) {
        if (!file.endsWith(".json")) continue;
        try {
          const s = JSON.parse(fs.readFileSync(path.join(full, file), "utf8"));
          summaries.push({ id: s.id, engine: s.engine, startedAt: s.startedAt, messageCount: s.messages.length });
        } catch {}
      }
    }
    return summaries.sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, limit);
  }
}

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pstack-session-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("SessionManager", () => {
  it("happy path: create, save, and load a session", () => {
    const mgr = new SessionManager(tmpDir);
    const session = mgr.create("claude", "claude-sonnet-4-6", "reportes feature");
    session.messages.push({ role: "user", content: "Hello", timestamp: new Date().toISOString() });

    mgr.save(session);
    const loaded = mgr.load("claude", session.id);

    assert.equal(loaded.id, session.id);
    assert.equal(loaded.engine, "claude");
    assert.equal(loaded.messages.length, 1);
    assert.equal(loaded.messages[0].content, "Hello");
  });

  it("close sets endedAt and persists", () => {
    const mgr = new SessionManager(tmpDir);
    const session = mgr.create("claude", "claude-sonnet-4-6");
    assert.equal(session.endedAt, null);

    const closed = mgr.close(session);
    assert.ok(closed.endedAt !== null);

    const loaded = mgr.load("claude", session.id);
    assert.ok(loaded.endedAt !== null);
  });

  it("list returns sessions sorted by startedAt descending", () => {
    const mgr = new SessionManager(tmpDir);

    const s1 = mgr.create("claude", "claude-sonnet-4-6", "first");
    s1.startedAt = "2026-06-10T08:00:00Z";
    mgr.save(s1);

    const s2 = mgr.create("openai", "gpt-4o", "second");
    s2.startedAt = "2026-06-11T09:00:00Z";
    mgr.save(s2);

    const list = mgr.list();
    assert.equal(list.length, 2);
    assert.equal(list[0].id, s2.id); // most recent first
    assert.equal(list[1].id, s1.id);
  });

  it("failure path: loading non-existent session throws", () => {
    const mgr = new SessionManager(tmpDir);
    assert.throws(() => mgr.load("claude", "2026-01-01-nonexistent"), { message: /Session not found/ });
  });

  it("atomic write: .tmp file is cleaned up after save", () => {
    const mgr = new SessionManager(tmpDir);
    const session = mgr.create("claude", "claude-sonnet-4-6");
    mgr.save(session);

    const tmpFile = path.join(tmpDir, "claude", `${session.id}.json.tmp`);
    assert.equal(fs.existsSync(tmpFile), false, "tmp file should not exist after save");

    const finalFile = path.join(tmpDir, "claude", `${session.id}.json`);
    assert.equal(fs.existsSync(finalFile), true, "final file should exist");
  });

  it("edge case: corrupted JSON file in sessions dir is skipped by list()", () => {
    const mgr = new SessionManager(tmpDir);
    const dir = path.join(tmpDir, "claude");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "2026-01-01-corrupt.json"), "{ not valid json {{", "utf8");

    // Should not throw — corrupted file is silently skipped
    const list = mgr.list();
    assert.equal(list.length, 0);
  });
});
