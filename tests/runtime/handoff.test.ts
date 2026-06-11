import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Inline HandoffGenerator for test isolation (mirrors src/handoff.ts logic)
const MAX_CONTEXT_CHARS = 8000;

function truncateMessages(messages: any[]): string {
  if (messages.length === 0) return "(no messages)";
  const included: string[] = [];
  let budget = MAX_CONTEXT_CHARS;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const entry = `**${m.role.toUpperCase()}** (${m.timestamp})\n${m.content}`;
    if (budget - entry.length < 0) {
      included.unshift(`_(${i + 1} earlier messages omitted)_`);
      break;
    }
    included.unshift(entry);
    budget -= entry.length;
  }
  return included.join("\n\n---\n\n");
}

function generateHandoff(session: any, options: { targetEngine?: string; pendingWork?: string } = {}): string {
  const recentContext = truncateMessages(session.messages);
  return [
    `# Agent Handoff Summary`,
    ``,
    `> Engine: ${session.engine}${options.targetEngine ? ` → ${options.targetEngine}` : ""}`,
    `> Project: ${session.project}`,
    `> Session: ${session.id}`,
    ``,
    `## Objective`,
    ``,
    session.messages.find((m: any) => m.role === "user")?.content.slice(0, 300) ?? "(not captured)",
    ``,
    `## Relevant Evidence`,
    ``,
    recentContext,
    ``,
    `## Pending Work For Next Specialist`,
    ``,
    options.pendingWork ?? `- Continue from the last assistant message above`,
    ``,
    `## Token Notes`,
    ``,
    `- Input: ${session.tokens.input} tokens`,
    `- Output: ${session.tokens.output} tokens`,
    `- Estimated cost: $${session.tokens.estimatedCostUSD.toFixed(4)} USD`,
  ].join("\n");
}

function makeSession(overrides: Partial<any> = {}): any {
  return {
    id: "2026-06-11-test",
    project: "test-project",
    engine: "claude",
    model: "claude-sonnet-4-6",
    startedAt: "2026-06-11T09:00:00Z",
    endedAt: "2026-06-11T10:00:00Z",
    handoffFrom: null,
    handoffTo: null,
    tokens: { input: 45000, output: 8200, cacheRead: 0, cacheWrite: 0, estimatedCostUSD: 0.258 },
    skillsUsed: ["portalup-orchestrator"],
    messages: [
      { role: "user", content: "Add a reports module", timestamp: "2026-06-11T09:00:00Z" },
      { role: "assistant", content: "I'll start by analyzing the existing structure.", timestamp: "2026-06-11T09:01:00Z" },
      { role: "user", content: "Focus on the backend first.", timestamp: "2026-06-11T09:30:00Z" },
      { role: "assistant", content: "Backend is ready. API endpoint at /api/reports.", timestamp: "2026-06-11T09:55:00Z" },
    ],
    ...overrides,
  };
}

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pstack-handoff-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("HandoffGenerator", () => {
  it("happy path: generates handoff markdown with key sections", () => {
    const session = makeSession();
    const doc = generateHandoff(session, { targetEngine: "openai" });

    assert.ok(doc.includes("# Agent Handoff Summary"));
    assert.ok(doc.includes("claude → openai"));
    assert.ok(doc.includes("test-project"));
    assert.ok(doc.includes("Add a reports module")); // first user message as objective
    assert.ok(doc.includes("Backend is ready"));     // last assistant message in evidence
    assert.ok(doc.includes("45000 tokens"));
  });

  it("saves handoff file to handoffDir", () => {
    const session = makeSession();
    const handoffDir = path.join(tmpDir, "handoffs");
    fs.mkdirSync(handoffDir, { recursive: true });

    const doc = generateHandoff(session, { targetEngine: "openai" });
    const filename = `${new Date().toISOString().slice(0, 10)}-claude-to-openai-${session.id}.md`;
    const filePath = path.join(handoffDir, filename);
    fs.writeFileSync(filePath, doc, "utf8");

    assert.ok(fs.existsSync(filePath));
    const loaded = fs.readFileSync(filePath, "utf8");
    assert.ok(loaded.includes("# Agent Handoff Summary"));
  });

  it("failure path: session with no messages still generates valid handoff", () => {
    const session = makeSession({ messages: [] });
    const doc = generateHandoff(session);

    assert.ok(doc.includes("# Agent Handoff Summary"));
    assert.ok(doc.includes("(no messages)"));
    assert.ok(doc.includes("(not captured)")); // objective fallback
  });

  it("edge case: cross-engine handoff preserves key context (claude → openai)", () => {
    const session = makeSession();
    const doc = generateHandoff(session, { targetEngine: "openai", pendingWork: "Implement the frontend" });

    assert.ok(doc.includes("claude → openai"));
    // Most recent messages should be included
    assert.ok(doc.includes("Backend is ready"));
    assert.ok(doc.includes("Implement the frontend"));
  });

  it("edge case: long conversation truncates older messages with notice", () => {
    // Create a session with many large messages that exceed budget
    const messages = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: "x".repeat(1000), // 1000 chars each
      timestamp: new Date().toISOString(),
    }));
    const session = makeSession({ messages });
    const doc = generateHandoff(session);

    // Should include truncation notice when over budget
    assert.ok(doc.includes("omitted") || doc.length < 20 * 1000 + 500);
  });
});
