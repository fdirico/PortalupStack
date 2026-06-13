import * as path from "node:path";
import * as os from "node:os";
import type { StreamEvent, Message, Session } from "../dist/types.js";
import { getAdapter } from "../dist/adapters/index.js";
import { SessionManager } from "../dist/session.js";
import { StatsEngine } from "../dist/stats.js";
import { SkillLoader } from "../dist/skill-loader.js";
import { readFile, writeFile, listDirectory } from "./tools/file-tools.js";
import { runCommand } from "./tools/shell-tools.js";
import { TOOL_DEFINITIONS } from "./tools/index.js";
import type { StatusBarController } from "./views/StatusBar.js";
import * as fs from "node:fs";

interface ConfirmFns {
  confirmWrite: (filePath: string, content: string) => Promise<boolean>;
  confirmCommand: (command: string) => Promise<boolean>;
}

function inputStr(val: unknown): string {
  return typeof val === "string" ? val : "";
}

export interface AutoApproveConfig {
  writeFile: boolean;
  runCommand: boolean;
}

export class RuntimeBridge {
  private messages: Message[] = [];
  private sessionInProgress: Session | null = null;
  private readonly sessions: SessionManager;
  private readonly stats: StatsEngine;
  private readonly skillLoader: SkillLoader;
  private readonly engine: string;
  private totalTokens = 0;
  readonly autoApprove: AutoApproveConfig;

  constructor(private readonly wsRoot: string, private readonly statusBar: StatusBarController) {
    const config = this.loadConfig();
    this.engine = config.activeEngine ?? "claude";
    const sessionDir = config.sessionDir ? path.join(wsRoot, config.sessionDir) : undefined;
    const statsFile = config.statsFile ? path.join(wsRoot, config.statsFile) : undefined;

    const auto = (config.autoApprove ?? {}) as Partial<AutoApproveConfig>;
    this.autoApprove = {
      writeFile: auto.writeFile === true,
      runCommand: auto.runCommand === true,
    };

    this.sessions = new SessionManager(wsRoot, sessionDir);
    this.stats = new StatsEngine(wsRoot, sessionDir, statsFile);
    this.skillLoader = new SkillLoader(wsRoot);
  }

  resetSession(): void {
    if (this.sessionInProgress) {
      const closed = this.sessions.close(this.sessionInProgress);
      this.sessions.save(closed);
    }
    this.messages = [];
    this.sessionInProgress = null;
    this.totalTokens = 0;
    this.statusBar.reset();
  }

  async ask(
    input: string,
    onEvent: (event: StreamEvent) => void,
    confirmFns: ConfirmFns
  ): Promise<void> {
    const adapter = getAdapter(this.engine);
    if (!adapter.streamEvents) {
      throw new Error(`Engine "${this.engine}" does not support tool use. Set a different engine in portalup.config.json.`);
    }

    const skillName = this.skillLoader.defaultSkill;
    const skillContent = this.skillLoader.load(skillName);

    const userMsg: Message = { role: "user", content: input, timestamp: new Date().toISOString() };
    this.messages.push(userMsg);

    if (!this.sessionInProgress) {
      this.sessionInProgress = this.sessions.create(this.engine, (adapter as any).model ?? this.engine, input.slice(0, 40));
      this.sessionInProgress = this.sessions.trackSkill(this.sessionInProgress, skillName);
    }
    this.sessionInProgress = this.sessions.addMessage(this.sessionInProgress, userMsg);

    const executor = this.buildExecutor(confirmFns);

    const workingMessages = [...this.messages];
    const maxTurns = 10;
    let turns = 0;
    let finalText = "";

    while (turns < maxTurns) {
      const textChunks: string[] = [];
      const toolCalls: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];

      for await (const event of adapter.streamEvents!(workingMessages, skillContent, TOOL_DEFINITIONS)) {
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

      const assistantSummary = [textChunks.join(""), ...toolCalls.map((tc) => `[tool_call:${tc.name}]`)]
        .filter(Boolean).join("\n");
      workingMessages.push({ role: "assistant", content: assistantSummary, timestamp: new Date().toISOString() });

      for (const tc of toolCalls) {
        const result = await executor(tc.name, tc.input);
        workingMessages.push({ role: "user", content: `[tool_result:${tc.name}] ${result}`, timestamp: new Date().toISOString() });
      }

      turns++;
    }

    if (turns >= maxTurns) {
      const limitMsg = "\n[max tool turns reached — stopping]";
      onEvent({ type: "text", chunk: limitMsg });
      finalText += limitMsg;
    }

    const usage = adapter.lastUsage();
    this.totalTokens += usage.input + usage.output;
    this.statusBar.update(this.engine, this.totalTokens);

    const assistantMsg: Message = {
      role: "assistant",
      content: finalText,
      timestamp: new Date().toISOString(),
      tokens: { input: usage.input, output: usage.output },
    };
    this.messages.push(assistantMsg);

    if (this.sessionInProgress) {
      this.sessionInProgress = this.sessions.addUsage(this.sessionInProgress, usage);
      this.sessionInProgress = this.sessions.addMessage(this.sessionInProgress, assistantMsg);
    }

    onEvent({ type: "done" });
    this.stats.refresh();
  }

  private buildExecutor(confirmFns: ConfirmFns) {
    return async (name: string, input: Record<string, unknown>): Promise<string> => {
      try {
        switch (name) {
          case "read_file":
            return readFile(inputStr(input["path"]), this.wsRoot);
          case "write_file":
            return writeFile(inputStr(input["path"]), inputStr(input["content"]), this.wsRoot, confirmFns.confirmWrite);
          case "list_directory":
            return listDirectory(inputStr(input["path"]), this.wsRoot);
          case "run_command":
            return runCommand(inputStr(input["command"]), confirmFns.confirmCommand);
          default:
            return `unknown tool: ${name}`;
        }
      } catch (err: any) {
        return `tool error: ${err.message}`;
      }
    };
  }

  private loadConfig(): Record<string, any> {
    const globalConfig = this.loadGlobalConfig();
    const localConfig = this.loadLocalConfig();
    return { ...globalConfig, ...localConfig };
  }

  private loadGlobalConfig(): Record<string, any> {
    const home = process.env["PORTALUP_HOME"] ?? path.join(os.homedir(), ".portalup");
    const globalPath = path.join(home, "config.json");
    if (!fs.existsSync(globalPath)) return {};
    try {
      return JSON.parse(fs.readFileSync(globalPath, "utf8"));
    } catch {
      return {};
    }
  }

  private loadLocalConfig(): Record<string, any> {
    const localPath = path.join(this.wsRoot, "portalup.config.json");
    const examplePath = path.join(this.wsRoot, "portalup.config.example.json");
    const configPath = fs.existsSync(localPath) ? localPath : examplePath;
    if (!fs.existsSync(configPath)) return {};
    try {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch {
      return {};
    }
  }
}
