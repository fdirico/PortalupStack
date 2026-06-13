"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeBridge = void 0;
const path = __importStar(require("node:path"));
const os = __importStar(require("node:os"));
const index_js_1 = require("../dist/adapters/index.js");
const session_js_1 = require("../dist/session.js");
const stats_js_1 = require("../dist/stats.js");
const skill_loader_js_1 = require("../dist/skill-loader.js");
const file_tools_js_1 = require("./tools/file-tools.js");
const shell_tools_js_1 = require("./tools/shell-tools.js");
const index_js_2 = require("./tools/index.js");
const fs = __importStar(require("node:fs"));
function inputStr(val) {
    return typeof val === "string" ? val : "";
}
class RuntimeBridge {
    constructor(wsRoot, statusBar) {
        this.wsRoot = wsRoot;
        this.statusBar = statusBar;
        this.messages = [];
        this.sessionInProgress = null;
        this.totalTokens = 0;
        const config = this.loadConfig();
        this.engine = config.activeEngine ?? "claude";
        const sessionDir = config.sessionDir ? path.join(wsRoot, config.sessionDir) : undefined;
        const statsFile = config.statsFile ? path.join(wsRoot, config.statsFile) : undefined;
        const auto = (config.autoApprove ?? {});
        this.autoApprove = {
            writeFile: auto.writeFile === true,
            runCommand: auto.runCommand === true,
        };
        this.sessions = new session_js_1.SessionManager(wsRoot, sessionDir);
        this.stats = new stats_js_1.StatsEngine(wsRoot, sessionDir, statsFile);
        this.skillLoader = new skill_loader_js_1.SkillLoader(wsRoot);
    }
    resetSession() {
        if (this.sessionInProgress) {
            const closed = this.sessions.close(this.sessionInProgress);
            this.sessions.save(closed);
        }
        this.messages = [];
        this.sessionInProgress = null;
        this.totalTokens = 0;
        this.statusBar.reset();
    }
    async ask(input, onEvent, confirmFns) {
        const adapter = (0, index_js_1.getAdapter)(this.engine);
        if (!adapter.streamEvents) {
            throw new Error(`Engine "${this.engine}" does not support tool use. Set a different engine in portalup.config.json.`);
        }
        const skillName = this.skillLoader.defaultSkill;
        const skillContent = this.skillLoader.load(skillName);
        const userMsg = { role: "user", content: input, timestamp: new Date().toISOString() };
        this.messages.push(userMsg);
        if (!this.sessionInProgress) {
            this.sessionInProgress = this.sessions.create(this.engine, adapter.model ?? this.engine, input.slice(0, 40));
            this.sessionInProgress = this.sessions.trackSkill(this.sessionInProgress, skillName);
        }
        this.sessionInProgress = this.sessions.addMessage(this.sessionInProgress, userMsg);
        const executor = this.buildExecutor(confirmFns);
        const workingMessages = [...this.messages];
        const maxTurns = 10;
        let turns = 0;
        let finalText = "";
        while (turns < maxTurns) {
            const textChunks = [];
            const toolCalls = [];
            for await (const event of adapter.streamEvents(workingMessages, skillContent, index_js_2.TOOL_DEFINITIONS)) {
                if (event.type === "text") {
                    textChunks.push(event.chunk);
                    onEvent(event);
                }
                else if (event.type === "tool_call") {
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
        const assistantMsg = {
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
    buildExecutor(confirmFns) {
        return async (name, input) => {
            try {
                switch (name) {
                    case "read_file":
                        return (0, file_tools_js_1.readFile)(inputStr(input["path"]), this.wsRoot);
                    case "write_file":
                        return (0, file_tools_js_1.writeFile)(inputStr(input["path"]), inputStr(input["content"]), this.wsRoot, confirmFns.confirmWrite);
                    case "list_directory":
                        return (0, file_tools_js_1.listDirectory)(inputStr(input["path"]), this.wsRoot);
                    case "run_command":
                        return (0, shell_tools_js_1.runCommand)(inputStr(input["command"]), confirmFns.confirmCommand);
                    default:
                        return `unknown tool: ${name}`;
                }
            }
            catch (err) {
                return `tool error: ${err.message}`;
            }
        };
    }
    loadConfig() {
        const globalConfig = this.loadGlobalConfig();
        const localConfig = this.loadLocalConfig();
        return { ...globalConfig, ...localConfig };
    }
    loadGlobalConfig() {
        const home = process.env["PORTALUP_HOME"] ?? path.join(os.homedir(), ".portalup");
        const globalPath = path.join(home, "config.json");
        if (!fs.existsSync(globalPath))
            return {};
        try {
            return JSON.parse(fs.readFileSync(globalPath, "utf8"));
        }
        catch {
            return {};
        }
    }
    loadLocalConfig() {
        const localPath = path.join(this.wsRoot, "portalup.config.json");
        const examplePath = path.join(this.wsRoot, "portalup.config.example.json");
        const configPath = fs.existsSync(localPath) ? localPath : examplePath;
        if (!fs.existsSync(configPath))
            return {};
        try {
            return JSON.parse(fs.readFileSync(configPath, "utf8"));
        }
        catch {
            return {};
        }
    }
}
exports.RuntimeBridge = RuntimeBridge;
