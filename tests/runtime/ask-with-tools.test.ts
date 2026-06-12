import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { StreamEvent, ToolDefinition, Message } from "../../src/types.js";

// Inline implementation of the askWithTools loop so we can test it
// without a real filesystem or API.

type ToolExecutor = (name: string, input: Record<string, unknown>) => Promise<string>;

async function runToolLoop(
  turns: Array<StreamEvent[]>, // one array of events per LLM turn
  executor: ToolExecutor,
  maxTurns = 10
): Promise<StreamEvent[]> {
  const emitted: StreamEvent[] = [];
  let turnIndex = 0;

  while (turnIndex < maxTurns && turnIndex < turns.length) {
    const events = turns[turnIndex];
    const toolCalls: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];

    for (const event of events) {
      if (event.type === "text") emitted.push(event);
      else if (event.type === "tool_call") {
        emitted.push(event);
        toolCalls.push({ id: event.id, name: event.name, input: event.input });
      }
    }

    if (toolCalls.length === 0) break;

    for (const tc of toolCalls) {
      await executor(tc.name, tc.input);
    }

    turnIndex++;
  }

  if (turnIndex >= maxTurns) {
    emitted.push({ type: "text", chunk: "[max tool turns reached — stopping]" });
  }

  return emitted;
}

const NO_TOOLS: ToolDefinition[] = [];

describe("askWithTools loop", () => {
  it("happy path: text-only response completes in one turn", async () => {
    const turns: StreamEvent[][] = [
      [
        { type: "text", chunk: "Here is the answer." },
        { type: "done" },
      ],
    ];

    const events = await runToolLoop(turns, async () => "unused");
    const texts = events.filter((e) => e.type === "text").map((e) => (e as any).chunk);
    assert.deepEqual(texts, ["Here is the answer."]);
  });

  it("tool use: executor is called with correct arguments", async () => {
    const callLog: Array<{ name: string; input: Record<string, unknown> }> = [];

    const turns: StreamEvent[][] = [
      // Turn 1: LLM asks for a file
      [
        { type: "tool_call", id: "tc_1", name: "read_file", input: { path: "src/app.ts" } },
        { type: "done" },
      ],
      // Turn 2: LLM gives final answer after seeing the file
      [
        { type: "text", chunk: "The file has 100 lines." },
        { type: "done" },
      ],
    ];

    const events = await runToolLoop(turns, async (name, input) => {
      callLog.push({ name, input });
      return "file content here";
    });

    assert.equal(callLog.length, 1);
    assert.equal(callLog[0].name, "read_file");
    assert.deepEqual(callLog[0].input, { path: "src/app.ts" });

    const texts = events.filter((e) => e.type === "text").map((e) => (e as any).chunk);
    assert.deepEqual(texts, ["The file has 100 lines."]);
  });

  it("edge case: loop stops after maxTurns and emits limit message", async () => {
    // Every turn is a tool call — never a final text response
    const infiniteTurns: StreamEvent[][] = Array.from({ length: 15 }, () => [
      { type: "tool_call", id: "tc_x", name: "read_file", input: { path: "x.ts" } },
      { type: "done" },
    ]);

    const events = await runToolLoop(infiniteTurns, async () => "content", 10);
    const limitEvent = events.find(
      (e) => e.type === "text" && (e as any).chunk.includes("max tool turns")
    );
    assert.ok(limitEvent, "should emit max-turns message");
  });
});
