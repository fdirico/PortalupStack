export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  tokens?: { input?: number; output?: number };
}

export interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  estimatedCostUSD: number;
}

export interface Session {
  id: string;
  project: string;
  engine: string;
  model: string;
  startedAt: string;
  endedAt: string | null;
  handoffFrom: string | null;
  handoffTo: string | null;
  tokens: TokenUsage;
  skillsUsed: string[];
  messages: Message[];
}

export interface SessionSummary {
  id: string;
  project: string;
  engine: string;
  model: string;
  startedAt: string;
  endedAt: string | null;
  tokens: TokenUsage;
  skillsUsed: string[];
  messageCount: number;
}

export interface CallOptions {
  skill?: string;
  model?: string;
  maxTokens?: number;
}

export interface EngineAdapter {
  readonly name: string;
  stream(messages: Message[], skillContent: string, options?: CallOptions): AsyncIterable<string>;
  lastUsage(): TokenUsage;
}

export interface EngineRegistry {
  version: string;
  engines: Record<string, EngineRegistryEntry>;
}

export interface EngineRegistryEntry {
  status: string;
  adapter?: string;
  runtime?: {
    authEnvVar: string;
    defaultModel: string;
    maxContextTokens: number;
    sdkPackage: string;
    supportsStreaming: boolean;
    supportsCaching: boolean;
  };
}

export interface SkillRegistry {
  version: string;
  defaultSkill: string;
  skills: string[];
}
