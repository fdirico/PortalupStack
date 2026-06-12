import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { StreamEvent } from "../../src/types.js";

// Inline mirror of the streamEvents accumulation logic for OpenAI.

type OAIToolAcc = { id: string; name: string; args: string };

function accumulateToolCall(acc: Map<number, OAIToolAcc>, tc: any): void {
  const entry = acc.get(tc.index);
  if (entry) {
    entry.args += tc.function?.arguments ?? "";
  } else {
    acc.set(tc.index, { id: tc.id ?? "", name: tc.function?.name ?? "", args: tc.function?.arguments ?? "" });
  }
}

function* flushToolCalls(acc: Map<number, OAIToolAcc>): Generator<StreamEvent> {
  for (const [, tc] of acc) {
    let input: Record<string, unknown> = {};
    try { input = JSON.parse(tc.args || "{}"); } catch { /* ignore */ }
    yield { type: "tool_call", id: tc.id, name: tc.name, input };
  }
}

async function* runStreamEvents(chunks: any[]): AsyncGenerator<StreamEvent> {
  const toolAcc = new Map<number, OAIToolAcc>();
  for (const chunk of chunks) {
    const delta = chunk.choices?.[0]?.delta;
    if (delta?.content) yield { type: "text", chunk: delta.content };
    for (const tc of delta?.tool_calls ?? []) {
      accumulateToolCall(toolAcc, tc);
    }
  }
  yield* flushToolCalls(toolAcc);
  yield { type: "done" };
}

describe("OpenAIAdapter.streamEvents", () => {
  it("happy path: yields text chunks from delta.content", async () => {
    const chunks = [
      { choices: [{ delta: { content: "Hello" } }] },
      { choices: [{ delta: { content: " world" } }] },
    ];
    const out: StreamEvent[] = [];
    for await (const e of runStreamEvents(chunks)) out.push(e);

    const texts = out.filter((e) => e.type === "text").map((e) => (e as any).chunk);
    assert.deepEqual(texts, ["Hello", " world"]);
  });

  it("tool_call: accumulates across chunks and yields at end", async () => {
    const chunks = [
      { choices: [{ delta: { tool_calls: [{ index: 0, id: "call_abc", type: "function", function: { name: "read_file", arguments: '{"pa' } }] } }] },
      { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: 'th":"foo.ts"}' } }] } }] },
    ];
    const out: StreamEvent[] = [];
    for await (const e of runStreamEvents(chunks)) out.push(e);

    const toolCalls = out.filter((e) => e.type === "tool_call");
    assert.equal(toolCalls.length, 1);
    const tc = toolCalls[0] as any;
    assert.equal(tc.name, "read_file");
    assert.deepEqual(tc.input, { path: "foo.ts" });
  });

  it("multiple parallel tool calls accumulate by index", async () => {
    const chunks = [
      {
        choices: [{
          delta: {
            tool_calls: [
              { index: 0, id: "c1", type: "function", function: { name: "read_file", arguments: '{"path":"a.ts"}' } },
              { index: 1, id: "c2", type: "function", function: { name: "list_directory", arguments: '{"path":"."}' } },
            ],
          },
        }],
      },
    ];
    const out: StreamEvent[] = [];
    for await (const e of runStreamEvents(chunks)) out.push(e);

    const toolCalls = out.filter((e) => e.type === "tool_call");
    assert.equal(toolCalls.length, 2);
  });

  it("always ends with done event", async () => {
    const out: StreamEvent[] = [];
    for await (const e of runStreamEvents([])) out.push(e);
    assert.equal(out[out.length - 1]?.type, "done");
  });
});
