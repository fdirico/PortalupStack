import fs from "fs";
import path from "path";
import type { Session } from "./types.js";

const MAX_CONTEXT_CHARS = 8000; // keep recent messages within this budget

function truncateMessages(session: Session): string {
  if (session.messages.length === 0) return "(no messages)";

  const lines: string[] = [];
  let budget = MAX_CONTEXT_CHARS;

  // Walk messages from most recent backwards, include as many as fit
  const included: string[] = [];
  for (let i = session.messages.length - 1; i >= 0; i--) {
    const m = session.messages[i];
    const entry = `**${m.role.toUpperCase()}** (${m.timestamp})\n${m.content}`;
    if (budget - entry.length < 0) {
      included.unshift(`_(${i + 1} earlier messages omitted to fit context)_`);
      break;
    }
    included.unshift(entry);
    budget -= entry.length;
  }

  return included.join("\n\n---\n\n");
}

function formatDuration(startedAt: string, endedAt: string | null): string {
  if (!endedAt) return "ongoing";
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

function formatTokens(session: Session): string {
  const t = session.tokens;
  const lines = [
    `- Input: ${t.input.toLocaleString()} tokens`,
    `- Output: ${t.output.toLocaleString()} tokens`,
  ];
  if (t.cacheRead > 0) lines.push(`- Cache read: ${t.cacheRead.toLocaleString()} tokens`);
  if (t.cacheWrite > 0) lines.push(`- Cache write: ${t.cacheWrite.toLocaleString()} tokens`);
  lines.push(`- Estimated cost: $${t.estimatedCostUSD.toFixed(4)} USD`);
  return lines.join("\n");
}

export interface HandoffOptions {
  targetEngine?: string;
  pendingWork?: string;
  openRisks?: string;
  decisions?: string;
}

export class HandoffGenerator {
  private templatePath: string;
  private handoffDir: string;

  constructor(root: string, handoffDir?: string) {
    this.templatePath = path.join(root, "templates/agent-handoff.md");
    this.handoffDir = handoffDir ?? path.join(root, "outputs/handoffs");
  }

  generate(session: Session, options: HandoffOptions = {}): string {
    const duration = formatDuration(session.startedAt, session.endedAt);
    const engineLine = options.targetEngine
      ? `${session.engine} → ${options.targetEngine}`
      : session.engine;

    const recentContext = truncateMessages(session);

    const doc = [
      `# Agent Handoff Summary`,
      ``,
      `> Generated: ${new Date().toISOString()}`,
      `> Engine: ${engineLine}`,
      `> Project: ${session.project}`,
      `> Session: ${session.id} (${duration})`,
      `> Skills used: ${session.skillsUsed.join(", ") || "none"}`,
      ``,
      `## Objective`,
      ``,
      session.messages.find((m) => m.role === "user")?.content.slice(0, 300) ?? "(not captured)",
      ``,
      `## Facts Confirmed`,
      ``,
      `- Engine origin: ${session.engine}`,
      `- Model: ${session.model}`,
      `- Session started: ${session.startedAt}`,
      `- Messages exchanged: ${session.messages.length}`,
      `- Skills active: ${session.skillsUsed.join(", ") || "none"}`,
      ``,
      `## Hypotheses`,
      ``,
      `- (Carry forward any open hypotheses from the session above)`,
      ``,
      `## Relevant Evidence`,
      ``,
      `### Recent conversation context`,
      ``,
      recentContext,
      ``,
      `## Decisions Made`,
      ``,
      options.decisions ?? `- (Review conversation context above for decisions taken)`,
      ``,
      `## Open Risks`,
      ``,
      options.openRisks ?? `- (Review conversation context above for open risks)`,
      ``,
      `## Pending Work For Next Specialist`,
      ``,
      options.pendingWork ?? `- Continue from the last assistant message above`,
      ``,
      `## Token Notes`,
      ``,
      formatTokens(session),
      `- Context to keep: last assistant response + pending work`,
      `- Context to summarize: earlier conversation turns`,
      `- Context to drop: environment setup, debug output`,
      `- References to load only if needed: cited file paths above`,
      `- Recycling trigger: context > 70%`,
    ].join("\n");

    return doc;
  }

  save(session: Session, options: HandoffOptions = {}): string {
    fs.mkdirSync(this.handoffDir, { recursive: true });

    const target = options.targetEngine ?? "unknown";
    const filename = `${new Date().toISOString().slice(0, 10)}-${session.engine}-to-${target}-${session.id}.md`;
    const filePath = path.join(this.handoffDir, filename);

    const content = this.generate(session, options);
    fs.writeFileSync(filePath, content, "utf8");

    return filePath;
  }
}
