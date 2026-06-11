import { AnthropicAdapter } from "./anthropic.js";
import { OpenAIAdapter } from "./openai.js";
import type { EngineAdapter } from "../types.js";

export type SupportedEngine = "claude" | "openai";

export function getAdapter(engine: string, apiKey?: string, model?: string): EngineAdapter {
  switch (engine) {
    case "claude":
      return new AnthropicAdapter(apiKey, model);
    case "openai":
      return new OpenAIAdapter(apiKey, model);
    default:
      throw new Error(
        `Engine "${engine}" is not supported by the runtime.\n` +
          `Supported engines: claude, openai\n` +
          `For Codex or Cursor, use them directly — they run skills natively.`
      );
  }
}

export { AnthropicAdapter } from "./anthropic.js";
export { OpenAIAdapter } from "./openai.js";
