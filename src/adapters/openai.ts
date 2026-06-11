import OpenAI from "openai";
import type { EngineAdapter, Message, TokenUsage, CallOptions } from "../types.js";

const DEFAULT_MODEL = "gpt-4o";
const DEFAULT_MAX_TOKENS = 4096;

// Pricing per million tokens (as of 2026-06)
const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o":       { input: 2.5,  output: 10.0 },
  "gpt-4o-mini":  { input: 0.15, output: 0.6 },
  "gpt-4-turbo":  { input: 10.0, output: 30.0 },
};

function estimateCost(model: string, input: number, output: number): number {
  const p = PRICING[model] ?? PRICING["gpt-4o"];
  return (input * p.input + output * p.output) / 1_000_000;
}

function toOpenAIMessages(
  messages: Message[],
  systemPrompt: string
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const result: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (systemPrompt.trim()) {
    result.push({ role: "system", content: systemPrompt });
  }
  for (const m of messages) {
    if (m.role === "user" || m.role === "assistant") {
      result.push({ role: m.role, content: m.content });
    }
  }
  return result;
}

export class OpenAIAdapter implements EngineAdapter {
  readonly name = "openai";

  private client: OpenAI;
  private model: string;
  private usage: TokenUsage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, estimatedCostUSD: 0 };

  constructor(apiKey?: string, model?: string) {
    const key = apiKey ?? process.env["OPENAI_API_KEY"];
    if (!key) {
      throw new Error(
        "OPENAI_API_KEY is not set.\n" +
          "Export it before running pstack:\n" +
          "  export OPENAI_API_KEY=sk-..."
      );
    }
    this.client = new OpenAI({ apiKey: key });
    this.model = model ?? DEFAULT_MODEL;
  }

  async *stream(messages: Message[], skillContent: string, options?: CallOptions): AsyncIterable<string> {
    const model = options?.model ?? this.model;
    const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;

    this.usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, estimatedCostUSD: 0 };

    const apiMessages = toOpenAIMessages(messages, skillContent);

    const stream = await this.client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: apiMessages,
      stream: true,
      stream_options: { include_usage: true },
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? "";
      if (text) yield text;

      if (chunk.usage) {
        this.usage.input = chunk.usage.prompt_tokens ?? 0;
        this.usage.output = chunk.usage.completion_tokens ?? 0;
      }
    }

    this.usage.estimatedCostUSD = estimateCost(model, this.usage.input, this.usage.output);
  }

  lastUsage(): TokenUsage {
    return { ...this.usage };
  }
}
