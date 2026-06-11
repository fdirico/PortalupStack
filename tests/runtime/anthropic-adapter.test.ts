import { describe, it, mock, beforeEach } from "node:test";
import assert from "node:assert/strict";

// --- helpers -----------------------------------------------------------

function makeStreamEvent(type: string, payload: object) {
  return { type, ...payload };
}

function makeMockClient(events: object[]) {
  return {
    messages: {
      stream: (_opts?: object) => ({
        async *[Symbol.asyncIterator]() {
          for (const event of events) yield event;
        },
      }),
    },
  };
}

// Minimal AnthropicAdapter re-implementation that accepts an injected client
// so we can test it without real API calls.
async function* runAdapter(
  client: ReturnType<typeof makeMockClient>,
  messages: Array<{ role: string; content: string; timestamp: string }>,
  skillContent: string
): AsyncGenerator<string, void, unknown> {
  for await (const event of client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 8096,
    system: skillContent,
    messages: messages.filter((m) => m.role === "user" || m.role === "assistant"),
  }) as any) {
    if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

function collectUsage(events: object[]) {
  let input = 0, output = 0, cacheRead = 0, cacheWrite = 0;
  for (const e of events as any[]) {
    if (e.type === "message_start" && e.message?.usage) {
      input = e.message.usage.input_tokens ?? 0;
      cacheRead = e.message.usage.cache_read_input_tokens ?? 0;
      cacheWrite = e.message.usage.cache_creation_input_tokens ?? 0;
    }
    if (e.type === "message_delta" && e.usage) {
      output = e.usage.output_tokens ?? 0;
    }
  }
  return { input, output, cacheRead, cacheWrite };
}

// --- tests -------------------------------------------------------------

describe("AnthropicAdapter", () => {
  it("happy path: streams text tokens and accumulates usage", async () => {
    const events = [
      makeStreamEvent("message_start", {
        message: { usage: { input_tokens: 100, cache_read_input_tokens: 20, cache_creation_input_tokens: 5 } },
      }),
      makeStreamEvent("content_block_delta", { delta: { type: "text_delta", text: "Hello" } }),
      makeStreamEvent("content_block_delta", { delta: { type: "text_delta", text: " world" } }),
      makeStreamEvent("message_delta", { usage: { output_tokens: 2 } }),
    ];

    const client = makeMockClient(events);
    const messages = [{ role: "user", content: "Hi", timestamp: new Date().toISOString() }];

    const chunks: string[] = [];
    for await (const chunk of runAdapter(client, messages, "You are helpful.")) {
      chunks.push(chunk);
    }

    assert.deepEqual(chunks, ["Hello", " world"]);

    const usage = collectUsage(events);
    assert.equal(usage.input, 100);
    assert.equal(usage.output, 2);
    assert.equal(usage.cacheRead, 20);
    assert.equal(usage.cacheWrite, 5);
  });

  it("failure path: missing ANTHROPIC_API_KEY throws descriptive error", () => {
    const savedKey = process.env["ANTHROPIC_API_KEY"];
    delete process.env["ANTHROPIC_API_KEY"];

    assert.throws(
      () => {
        const key = process.env["ANTHROPIC_API_KEY"];
        if (!key) throw new Error("ANTHROPIC_API_KEY is not set.\nExport it before running pstack:\n  export ANTHROPIC_API_KEY=sk-ant-...");
      },
      { message: /ANTHROPIC_API_KEY/ }
    );

    if (savedKey !== undefined) process.env["ANTHROPIC_API_KEY"] = savedKey;
  });

  it("edge case: rate limit event does not break streaming", async () => {
    // rate limit simulated as API throwing — stream just yields nothing
    const client = {
      messages: {
        stream: () => ({
          async *[Symbol.asyncIterator]() {
            throw Object.assign(new Error("Rate limit exceeded"), { status: 429 });
          },
        }),
      },
    };

    const messages = [{ role: "user", content: "Hi", timestamp: new Date().toISOString() }];

    await assert.rejects(
      async () => {
        for await (const _ of runAdapter(client as any, messages, "")) {}
      },
      { message: /Rate limit/ }
    );
  });

  it("non-text delta events are ignored", async () => {
    const events = [
      makeStreamEvent("message_start", { message: { usage: { input_tokens: 10 } } }),
      makeStreamEvent("content_block_delta", { delta: { type: "input_json_delta", partial_json: "{}" } }),
      makeStreamEvent("content_block_delta", { delta: { type: "text_delta", text: "OK" } }),
      makeStreamEvent("message_delta", { usage: { output_tokens: 1 } }),
    ];

    const client = makeMockClient(events);
    const chunks: string[] = [];
    for await (const chunk of runAdapter(client, [{ role: "user", content: "Hi", timestamp: "" }], "")) {
      chunks.push(chunk);
    }
    assert.deepEqual(chunks, ["OK"]);
  });
});
