import fs from "fs";
import path from "path";
import readline from "readline";
import { getAdapter } from "./adapters/index.js";
import { SessionManager } from "./session.js";
import { HandoffGenerator } from "./handoff.js";
import { StatsEngine } from "./stats.js";
import { SkillLoader } from "./skill-loader.js";
import type { Session, Message, ToolDefinition, StreamEvent } from "./types.js";

function loadConfig(root: string): Record<string, any> {
  const localPath = path.join(root, "portalup.config.json");
  const examplePath = path.join(root, "portalup.config.example.json");
  const configPath = fs.existsSync(localPath) ? localPath : examplePath;
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function printHeader(engine: string, sessionId: string): void {
  process.stdout.write(`\n[${engine} · ${sessionId}]\n`);
}

function printTokenSummary(session: Session): void {
  const t = session.tokens;
  process.stdout.write(
    `\n─── tokens: in ${t.input.toLocaleString("en-US")} · out ${t.output.toLocaleString("en-US")} · cost $${t.estimatedCostUSD.toFixed(4)} ───\n`
  );
}

async function streamToTerminal(
  adapter: ReturnType<typeof getAdapter>,
  messages: Message[],
  skillContent: string,
  options?: { model?: string }
): Promise<string> {
  let full = "";
  for await (const chunk of adapter.stream(messages, skillContent, options)) {
    process.stdout.write(chunk);
    full += chunk;
  }
  process.stdout.write("\n");
  return full;
}

export interface AskOptions {
  skill?: string;
  model?: string;
  hint?: string;
}

export async function ask(root: string, input: string, options: AskOptions = {}): Promise<void> {
  const config = loadConfig(root);
  const engine = config.activeEngine ?? "claude";
  const sessionDir = config.sessionDir ? path.join(root, config.sessionDir) : undefined;
  const handoffDir = config.handoffDir ? path.join(root, config.handoffDir) : undefined;
  const statsFile = config.statsFile ? path.join(root, config.statsFile) : undefined;

  const adapter = getAdapter(engine);
  const sessions = new SessionManager(root, sessionDir);
  const stats = new StatsEngine(root, sessionDir, statsFile);
  const skillLoader = new SkillLoader(root);

  const skillName = options.skill ?? skillLoader.defaultSkill;
  const skillContent = skillLoader.load(skillName);

  let session = sessions.create(engine, (adapter as any).model ?? engine, options.hint ?? input.slice(0, 40));
  session = sessions.trackSkill(session, skillName);

  const userMessage: Message = {
    role: "user",
    content: input,
    timestamp: new Date().toISOString(),
  };
  session = sessions.addMessage(session, userMessage);

  printHeader(engine, session.id);

  const responseText = await streamToTerminal(adapter, session.messages, skillContent, { model: options.model });

  const usage = adapter.lastUsage();
  session = sessions.addUsage(session, usage);

  const assistantMessage: Message = {
    role: "assistant",
    content: responseText,
    timestamp: new Date().toISOString(),
    tokens: { input: usage.input, output: usage.output },
  };
  session = sessions.addMessage(session, assistantMessage);
  session = sessions.close(session);

  sessions.save(session);
  printTokenSummary(session);

  stats.refresh();
}

export interface AskWithToolsOptions extends AskOptions {
  maxToolTurns?: number;
}

export type ToolExecutor = (name: string, input: Record<string, unknown>) => Promise<string>;

export async function askWithTools(
  root: string,
  input: string,
  tools: ToolDefinition[],
  onEvent: (event: StreamEvent) => void,
  executor: ToolExecutor,
  options: AskWithToolsOptions = {}
): Promise<void> {
  const config = loadConfig(root);
  const engine = config.activeEngine ?? "claude";
  const sessionDir = config.sessionDir ? path.join(root, config.sessionDir) : undefined;
  const statsFile = config.statsFile ? path.join(root, config.statsFile) : undefined;

  const adapter = getAdapter(engine);
  if (!adapter.streamEvents) {
    throw new Error(`Engine "${engine}" does not support tool use (streamEvents not implemented).`);
  }

  const sessions = new SessionManager(root, sessionDir);
  const stats = new StatsEngine(root, sessionDir, statsFile);
  const skillLoader = new SkillLoader(root);

  const skillName = options.skill ?? skillLoader.defaultSkill;
  const skillContent = skillLoader.load(skillName);

  let session = sessions.create(engine, (adapter as any).model ?? engine, options.hint ?? input.slice(0, 40));
  session = sessions.trackSkill(session, skillName);

  const userMessage: Message = { role: "user", content: input, timestamp: new Date().toISOString() };
  session = sessions.addMessage(session, userMessage);

  // Local multi-turn message array — uses plain string content (tool results inlined as text)
  // so we never need to change the Message.content: string schema.
  const turnMessages: Message[] = [...session.messages];
  const maxTurns = options.maxToolTurns ?? 10;
  let turns = 0;
  let finalText = "";

  while (turns < maxTurns) {
    const textChunks: string[] = [];
    const toolCalls: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];

    for await (const event of adapter.streamEvents!(turnMessages, skillContent, tools, { model: options.model })) {
      if (event.type === "text") {
        textChunks.push(event.chunk);
        onEvent(event);
      } else if (event.type === "tool_call") {
        onEvent(event);
        toolCalls.push({ id: event.id, name: event.name, input: event.input });
      }
    }

    if (toolCalls.length === 0) {
      finalText = textChunks.join("");
      break;
    }

    // Append assistant turn (text + tool calls summarised as text for session storage)
    const assistantSummary = [
      textChunks.join(""),
      ...toolCalls.map((tc) => `[tool_call:${tc.name}]`),
    ].filter(Boolean).join("\n");

    turnMessages.push({ role: "assistant", content: assistantSummary, timestamp: new Date().toISOString() });

    // Execute each tool and append results
    for (const tc of toolCalls) {
      const result = await executor(tc.name, tc.input);
      turnMessages.push({ role: "user", content: `[tool_result:${tc.name}] ${result}`, timestamp: new Date().toISOString() });
    }

    turns++;
  }

  if (turns >= maxTurns) {
    const limitMsg = "[max tool turns reached — stopping]";
    onEvent({ type: "text", chunk: limitMsg });
    finalText += limitMsg;
  }

  const usage = adapter.lastUsage();
  session = sessions.addUsage(session, usage);
  session = sessions.addMessage(session, {
    role: "assistant",
    content: finalText,
    timestamp: new Date().toISOString(),
    tokens: { input: usage.input, output: usage.output },
  });
  session = sessions.close(session);
  sessions.save(session);
  stats.refresh();
}

export async function switchEngine(root: string, targetEngine: string, context: string): Promise<void> {
  const config = loadConfig(root);
  const currentEngine = config.activeEngine ?? "claude";
  const sessionDir = config.sessionDir ? path.join(root, config.sessionDir) : undefined;
  const handoffDir = config.handoffDir ? path.join(root, config.handoffDir) : undefined;

  const sessions = new SessionManager(root, sessionDir);
  const handoffGen = new HandoffGenerator(root, handoffDir);

  // Find the most recent session for the current engine
  const recent = sessions.list(1).find((s) => s.engine === currentEngine);
  if (!recent) {
    process.stderr.write(
      `[pstack] No recent session found for engine "${currentEngine}". Starting fresh in ${targetEngine}.\n`
    );
    await ask(root, context, { hint: `switch-to-${targetEngine}` });
    return;
  }

  const fullSession = sessions.load(currentEngine, recent.id);
  process.stdout.write(`[pstack] Generating handoff from ${currentEngine} → ${targetEngine}...\n`);

  const handoffPath = handoffGen.save(fullSession, {
    targetEngine,
    pendingWork: context,
  });
  process.stdout.write(`[pstack] Handoff saved: ${handoffPath}\n`);

  // Update config to switch engine
  const configPath = path.join(root, "portalup.config.json");
  const updatedConfig = { ...config, activeEngine: targetEngine };
  fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), "utf8");
  process.stdout.write(`[pstack] Active engine switched to: ${targetEngine}\n`);

  // Start a new session with the handoff as context
  const handoffContent = fs.readFileSync(handoffPath, "utf8");
  const combinedInput = `${handoffContent}\n\n---\n\nContinuing: ${context}`;

  await ask(root, combinedInput, { hint: `from-${currentEngine}` });
}

export async function showStats(root: string): Promise<void> {
  const config = loadConfig(root);
  const sessionDir = config.sessionDir ? path.join(root, config.sessionDir) : undefined;
  const statsFile = config.statsFile ? path.join(root, config.statsFile) : undefined;

  const stats = new StatsEngine(root, sessionDir, statsFile);
  const filePath = stats.refresh();
  process.stdout.write(`Stats updated: ${filePath}\n\n`);
  process.stdout.write(stats.summary() + "\n");
}

export async function listSessions(root: string): Promise<void> {
  const config = loadConfig(root);
  const sessionDir = config.sessionDir ? path.join(root, config.sessionDir) : undefined;
  const sessions = new SessionManager(root, sessionDir);

  const list = sessions.list(20);
  if (list.length === 0) {
    process.stdout.write("No sessions found.\n");
    return;
  }

  const header = `${"ID".padEnd(42)} ${"Engine".padEnd(8)} ${"Date".padEnd(10)} ${"Msgs".padEnd(5)} ${"Tokens in".padEnd(12)} ${"Cost".padEnd(10)}`;
  process.stdout.write(header + "\n");
  process.stdout.write("─".repeat(header.length) + "\n");

  for (const s of list) {
    const date = s.startedAt.slice(0, 10);
    const tokIn = s.tokens.input.toLocaleString("en-US");
    const cost = `$${s.tokens.estimatedCostUSD.toFixed(4)}`;
    const row =
      s.id.slice(0, 42).padEnd(42) + " " +
      s.engine.padEnd(8) + " " +
      date.padEnd(10) + " " +
      String(s.messageCount).padEnd(5) + " " +
      tokIn.padEnd(12) + " " +
      cost.padEnd(10);
    process.stdout.write(row + "\n");
  }
}

export async function generateHandoff(root: string, context?: string): Promise<void> {
  const config = loadConfig(root);
  const engine = config.activeEngine ?? "claude";
  const sessionDir = config.sessionDir ? path.join(root, config.sessionDir) : undefined;
  const handoffDir = config.handoffDir ? path.join(root, config.handoffDir) : undefined;

  const sessions = new SessionManager(root, sessionDir);
  const handoffGen = new HandoffGenerator(root, handoffDir);

  const recent = sessions.list(1)[0];
  if (!recent) {
    process.stderr.write("[pstack] No sessions found to generate handoff from.\n");
    return;
  }

  const fullSession = sessions.load(recent.engine, recent.id);
  const filePath = handoffGen.save(fullSession, { pendingWork: context });
  process.stdout.write(`Handoff saved: ${filePath}\n`);
}
