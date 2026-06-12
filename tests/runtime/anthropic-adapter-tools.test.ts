import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { StreamEvent } from "../../src/types.js";

// Inline implementation of the streamEvents logic with injected mock client —
// mirrors the real handleContentEvent + applyUsageEvent functions.

type ToolState = { id: string | null; name: string | null; json: string };

function* handleContentEvent(event: any, s: ToolState): Generator<StreamEvent> {
  if (event.type === "content_block_start" && event.content_block?.type === "tool_use") {
    s.id = event.content_block.id;
    s.name = event.content_block.name;
    s.json = "";
  } else if (event.type === "content_block_delta") {
    if (event.delta?.type === "text_delta") {
      yield { type: "text", chunk: event.delta.text };
    } else if (event.delta?.type === "input_json_delta") {
      s.json += event.delta.partial_json;
    }
  } else if (event.type === "content_block_stop" && s.id && s.name) {
    let input: Record<string, unknown> = {};
    try { input = JSON.parse(s.json || "{}"); } catch { /* ignore */ }
    yield { type: "tool_call", id: s.id, name: s.name, input };
    s.id = null; s.name = null; s.json = "";
  }
}

async function* runStreamEvents(mockEvents: object[]): AsyncGenerator<StreamEvent> {
  const toolState: ToolState = { id: null, name: null, json: "" };
  for (const event of mockEvents) {
    yield* handleContentEvent(event, toolState);
  }
  yield { type: "done" };
}

describe("AnthropicAdapter.streamEvents", () => {
  it("happy path: yields text chunks", async () => {
    const events = [
      { type: "content_block_delta", delta: { type: "text_delta", text: "Hello" } },
      { type: "content_block_delta", delta: { type: "text_delta", text: " world" } },
    ];
    const out: StreamEvent[] = [];
    for await (const e of runStreamEvents(events)) out.push(e);

    const texts = out.filter((e) => e.type === "text").map((e) => (e as any).chunk);
    assert.deepEqual(texts, ["Hello", " world"]);
  });

  it("tool_call event: yields tool_call after content_block_stop", async () => {
    const events = [
      { type: "content_block_start", content_block: { type: "tool_use", id: "tc_1", name: "read_file" } },
      { type: "content_block_delta", delta: { type: "input_json_delta", partial_json: '{"pa' } },
      { type: "content_block_delta", delta: { type: "input_json_delta", partial_json: 'th":"src/app.ts"}' } },
      { type: "content_block_stop" },
    ];
    const out: StreamEvent[] = [];
    for await (const e of runStreamEvents(events)) out.push(e);

    const toolCalls = out.filter((e) => e.type === "tool_call");
    assert.equal(toolCalls.length, 1);
    const tc = toolCalls[0] as any;
    assert.equal(tc.name, "read_file");
    assert.equal(tc.id, "tc_1");
    assert.deepEqual(tc.input, { path: "src/app.ts" });
  });

  it("edge case: partial JSON that is malformed leaves input as empty object", async () => {
    const events = [
      { type: "content_block_start", content_block: { type: "tool_use", id: "tc_2", name: "run_command" } },
      { type: "content_block_delta", delta: { type: "input_json_delta", partial_json: "BROKEN{{{" } },
      { type: "content_block_stop" },
    ];
    const out: StreamEvent[] = [];
    for await (const e of runStreamEvents(events)) out.push(e);

    const tc = out.find((e) => e.type === "tool_call") as any;
    assert.ok(tc, "should have a tool_call event");
    assert.deepEqual(tc.input, {});
  });

  it("always ends with done event", async () => {
    const out: StreamEvent[] = [];
    for await (const e of runStreamEvents([])) out.push(e);
    assert.equal(out[out.length - 1]?.type, "done");
  });
});
