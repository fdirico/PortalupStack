import Anthropic from "@anthropic-ai/sdk";
import type { EngineAdapter, Message, TokenUsage, CallOptions } from "../types.js";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = 8096;

// Pricing per million tokens (as of 2026-06)
const PRICING = {
  "claude-sonnet-4-6": { input: 3.0, output: 15.0, cacheRead: 0.3, cacheWrite: 3.75 },
  "claude-opus-4-8":   { input: 15.0, output: 75.0, cacheRead: 1.5, cacheWrite: 18.75 },
  "claude-haiku-4-5":  { input: 0.8, output: 4.0, cacheRead: 0.08, cacheWrite: 1.0 },
};

function estimateCost(model: string, usage: Omit<TokenUsage, "estimatedCostUSD">): number {
  const key = model as keyof typeof PRICING;
  const p = PRICING[key] ?? PRICING["claude-sonnet-4-6"];
  return (
    (usage.input * p.input +
      usage.output * p.output +
      usage.cacheRead * p.cacheRead +
      usage.cacheWrite * p.cacheWrite) /
    1_000_000
  );
}

function toAnthropicMessages(messages: Message[]): Anthropic.MessageParam[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

export class AnthropicAdapter implements EngineAdapter {
  readonly name = "claude";

  private client: Anthropic;
  private model: string;
  private usage: TokenUsage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, estimatedCostUSD: 0 };

  constructor(apiKey?: string, model?: string) {
    const key = apiKey ?? process.env["ANTHROPIC_API_KEY"];
    if (!key) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set.\n" +
          "Export it before running pstack:\n" +
          "  export ANTHROPIC_API_KEY=sk-ant-..."
      );
    }
    this.client = new Anthropic({ apiKey: key });
    this.model = model ?? DEFAULT_MODEL;
  }

  async *stream(messages: Message[], skillContent: string, options?: CallOptions): AsyncIterable<string> {
    const model = options?.model ?? this.model;
    const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;

    const systemPrompt = skillContent.trim()
      ? skillContent
      : "You are a helpful AI assistant for software development.";

    const apiMessages = toAnthropicMessages(messages);

    this.usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, estimatedCostUSD: 0 };

    const stream = this.client.messages.stream({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: apiMessages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
      if (event.type === "message_delta" && event.usage) {
        this.usage.output = event.usage.output_tokens;
      }
      if (event.type === "message_start" && event.message.usage) {
        this.usage.input = event.message.usage.input_tokens;
        this.usage.cacheRead = (event.message.usage as any).cache_read_input_tokens ?? 0;
        this.usage.cacheWrite = (event.message.usage as any).cache_creation_input_tokens ?? 0;
      }
    }

    this.usage.estimatedCostUSD = estimateCost(model, this.usage);
  }

  lastUsage(): TokenUsage {
    return { ...this.usage };
  }
}
