import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { StreamEvent, ToolDefinition, Message } from "../dist/types.js";

// Test the tool loop logic directly (inline mirror of RuntimeBridge.ask loop)
// so we don't need a real filesystem, VSCode API, or Anthropic/OpenAI key.

type ToolExecutor = (name: string, input: Record<string, unknown>) => Promise<string>;

async function runBridgeLoop(
  adapterTurns: StreamEvent[][],
  executor: ToolExecutor,
  maxTurns = 10
): Promise<{ events: StreamEvent[]; turnCount: number }> {
  const emitted: StreamEvent[] = [];
  const workingMessages: Message[] = [
    { role: "user", content: "initial request", timestamp: new Date().toISOString() },
  ];

  let turns = 0;
  let turnIndex = 0;
  let finalText = "";

  while (turns < maxTurns && turnIndex < adapterTurns.length) {
    const adapterEvents = adapterTurns[turnIndex];
    const textChunks: string[] = [];
    const toolCalls: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];

    for (const event of adapterEvents) {
      if (event.type === "text") { textChunks.push(event.chunk); emitted.push(event); }
      else if (event.type === "tool_call") { emitted.push(event); toolCalls.push({ id: event.id, name: event.name, input: event.input }); }
    }

    if (toolCalls.length === 0) {
      finalText = textChunks.join("");
      break;
    }

    const summary = [textChunks.join(""), ...toolCalls.map((tc) => `[tool_call:${tc.name}]`)].filter(Boolean).join("\n");
    workingMessages.push({ role: "assistant", content: summary, timestamp: new Date().toISOString() });

    for (const tc of toolCalls) {
      const result = await executor(tc.name, tc.input);
      workingMessages.push({ role: "user", content: `[tool_result:${tc.name}] ${result}`, timestamp: new Date().toISOString() });
    }

    turns++;
    turnIndex++;
  }

  if (turns >= maxTurns) {
    emitted.push({ type: "text", chunk: "[max tool turns reached — stopping]" });
  }

  emitted.push({ type: "done" });
  return { events: emitted, turnCount: turns };
}

describe("runtime-bridge tool loop", () => {
  it("happy path: text-only response, executor not called", async () => {
    let executorCalled = false;
    const { events, turnCount } = await runBridgeLoop(
      [[{ type: "text", chunk: "Hello from LLM" }, { type: "done" }]],
      async () => { executorCalled = true; return ""; }
    );

    assert.ok(!executorCalled, "executor should not be called for text-only response");
    assert.equal(turnCount, 0);
    const texts = events.filter((e) => e.type === "text").map((e) => (e as any).chunk);
    assert.ok(texts.includes("Hello from LLM"));
    assert.equal(events[events.length - 1].type, "done");
  });

  it("tool use: executor called with correct name and input", async () => {
    const calls: Array<{ name: string; input: Record<string, unknown> }> = [];

    const adapterTurns: StreamEvent[][] = [
      [{ type: "tool_call", id: "tc1", name: "read_file", input: { path: "src/app.ts" } }],
      [{ type: "text", chunk: "File has 50 lines." }, { type: "done" }],
    ];

    await runBridgeLoop(adapterTurns, async (name, input) => {
      calls.push({ name, input });
      return "const x = 1;";
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "read_file");
    assert.deepEqual(calls[0].input, { path: "src/app.ts" });
  });

  it("edge case: loop stops at maxTurns and appends limit message", async () => {
    const infiniteTurns: StreamEvent[][] = Array.from({ length: 15 }, () => [
      { type: "tool_call", id: "tc", name: "read_file", input: { path: "x.ts" } },
    ]);

    const { events } = await runBridgeLoop(infiniteTurns, async () => "content", 10);
    const limitEvent = events.find((e) => e.type === "text" && (e as any).chunk.includes("max tool turns"));
    assert.ok(limitEvent, "should emit max-turns message");
  });
});
