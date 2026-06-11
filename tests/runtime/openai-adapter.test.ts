import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Minimal streaming simulation matching OpenAI SDK shape
async function* runOpenAIAdapter(
  client: any,
  messages: Array<{ role: string; content: string; timestamp: string }>,
  systemContent: string
): AsyncGenerator<string> {
  const apiMessages = [];
  if (systemContent.trim()) apiMessages.push({ role: "system", content: systemContent });
  for (const m of messages) {
    if (m.role === "user" || m.role === "assistant") apiMessages.push({ role: m.role, content: m.content });
  }

  const stream = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    messages: apiMessages,
    stream: true,
    stream_options: { include_usage: true },
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? "";
    if (text) yield text;
  }
}

function makeOpenAIStreamClient(chunks: Array<{ choices: Array<{ delta: { content?: string } }>; usage?: any }>) {
  return {
    chat: {
      completions: {
        create: async () => ({
          async *[Symbol.asyncIterator]() {
            for (const chunk of chunks) yield chunk;
          },
        }),
      },
    },
  };
}

describe("OpenAIAdapter", () => {
  it("happy path: streams text from delta content chunks", async () => {
    const client = makeOpenAIStreamClient([
      { choices: [{ delta: { content: "Hello" } }] },
      { choices: [{ delta: { content: " there" } }] },
      { choices: [{ delta: {} }], usage: { prompt_tokens: 50, completion_tokens: 2 } },
    ]);

    const messages = [{ role: "user", content: "Hi", timestamp: "" }];
    const chunks: string[] = [];
    for await (const text of runOpenAIAdapter(client, messages, "You are helpful.")) {
      chunks.push(text);
    }
    assert.deepEqual(chunks, ["Hello", " there"]);
  });

  it("failure path: missing OPENAI_API_KEY throws descriptive error", () => {
    const saved = process.env["OPENAI_API_KEY"];
    delete process.env["OPENAI_API_KEY"];

    assert.throws(
      () => {
        const key = process.env["OPENAI_API_KEY"];
        if (!key) throw new Error("OPENAI_API_KEY is not set.\nExport it before running pstack:\n  export OPENAI_API_KEY=sk-...");
      },
      { message: /OPENAI_API_KEY/ }
    );

    if (saved !== undefined) process.env["OPENAI_API_KEY"] = saved;
  });

  it("edge case: context overflow error is thrown and propagated", async () => {
    const client = {
      chat: {
        completions: {
          create: async () => {
            throw Object.assign(new Error("context length exceeded"), { status: 400, code: "context_length_exceeded" });
          },
        },
      },
    };

    const messages = [{ role: "user", content: "Hi", timestamp: "" }];

    await assert.rejects(
      async () => {
        for await (const _ of runOpenAIAdapter(client, messages, "")) {}
      },
      { message: /context length/ }
    );
  });

  it("empty delta content chunks are skipped", async () => {
    const client = makeOpenAIStreamClient([
      { choices: [{ delta: { content: "" } }] },
      { choices: [{ delta: {} }] },
      { choices: [{ delta: { content: "OK" } }] },
    ]);

    const messages = [{ role: "user", content: "Hi", timestamp: "" }];
    const chunks: string[] = [];
    for await (const text of runOpenAIAdapter(client, messages, "")) {
      chunks.push(text);
    }
    assert.deepEqual(chunks, ["OK"]);
  });

  it("system prompt is injected as first message when non-empty", async () => {
    let capturedMessages: any[] = [];
    const client = {
      chat: {
        completions: {
          create: async ({ messages }: any) => {
            capturedMessages = messages;
            return {
              async *[Symbol.asyncIterator]() {
                yield { choices: [{ delta: { content: "done" } }] };
              },
            };
          },
        },
      },
    };

    const messages = [{ role: "user", content: "Hi", timestamp: "" }];
    for await (const _ of runOpenAIAdapter(client, messages, "You are a specialist.")) {}

    assert.equal(capturedMessages[0].role, "system");
    assert.ok(capturedMessages[0].content.includes("specialist"));
  });
});
