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
exports.ChatPanel = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const crypto = __importStar(require("node:crypto"));
const runtime_bridge_js_1 = require("../runtime-bridge.js");
class ChatPanel {
    constructor(extensionUri, wsRoot, statusBar, onDispose) {
        this.wsRoot = wsRoot;
        this.statusBar = statusBar;
        this.onDispose = onDispose;
        this.disposables = [];
        this.panel = vscode.window.createWebviewPanel("portalup.chat", "PortalUP Chat", vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media")],
        });
        try {
            this.bridge = new runtime_bridge_js_1.RuntimeBridge(wsRoot, statusBar);
        }
        catch (err) {
            this.panel.webview.html = `<html><body style="background:#1e1e1e;color:#f44;padding:20px;font-family:monospace;white-space:pre-wrap;">RuntimeBridge init failed:\n${err?.message}\n\n${err?.stack}</body></html>`;
            return;
        }
        try {
            this.panel.webview.html = this.buildHtml(extensionUri);
        }
        catch (err) {
            this.panel.webview.html = `<html><body style="background:#1e1e1e;color:#f44;padding:20px;font-family:monospace;white-space:pre-wrap;">buildHtml failed:\n${err?.message}\n\n${err?.stack}</body></html>`;
            return;
        }
        this.panel.webview.onDidReceiveMessage((msg) => this.handleMessage(msg), undefined, this.disposables);
        this.panel.onDidDispose(() => this.dispose(), undefined, this.disposables);
    }
    reveal() {
        this.panel.reveal();
    }
    clearSession() {
        this.bridge.resetSession();
        this.post({ type: "done" });
    }
    async handleMessage(msg) {
        if (msg.type !== "user_message" || !msg.text)
            return;
        try {
            await this.bridge.ask(msg.text, (event) => {
                if (event.type === "text") {
                    this.post({ type: "chunk", chunk: event.chunk });
                }
                else if (event.type === "tool_call") {
                    const label = `${toolIcon(event.name)} ${event.name}(${summariseInput(event.input)})`;
                    this.post({ type: "tool_indicator", text: label });
                }
                else if (event.type === "done") {
                    this.post({ type: "done" });
                }
            }, this.buildConfirmFns());
        }
        catch (err) {
            this.post({ type: "error", text: `Error: ${err.message}` });
        }
    }
    buildConfirmFns() {
        return {
            confirmWrite: async (filePath, _content) => {
                if (this.bridge.autoApprove.writeFile)
                    return true;
                const rel = path.relative(this.wsRoot, filePath);
                const choice = await vscode.window.showWarningMessage(`PortalUP wants to write to: ${rel}`, { modal: true }, "Approve", "Cancel");
                return choice === "Approve";
            },
            confirmCommand: async (command) => {
                if (this.bridge.autoApprove.runCommand)
                    return true;
                const choice = await vscode.window.showWarningMessage(`PortalUP wants to run:\n\n${command}`, { modal: true, detail: "Review the command carefully before allowing." }, "Allow", "Deny");
                return choice === "Allow";
            },
        };
    }
    post(msg) {
        this.panel.webview.postMessage(msg);
    }
    buildHtml(extensionUri) {
        const templatePath = path.join(extensionUri.fsPath, "media", "chat.html");
        const nonce = crypto.randomBytes(16).toString("hex");
        return fs.readFileSync(templatePath, "utf8").replace(/\{\{NONCE\}\}/g, nonce);
    }
    dispose() {
        this.onDispose();
        this.disposables.forEach((d) => d.dispose());
        this.panel.dispose();
    }
}
exports.ChatPanel = ChatPanel;
function toolIcon(name) {
    const icons = {
        read_file: "📄",
        write_file: "✏️",
        list_directory: "📁",
        run_command: "⚡",
    };
    return icons[name] ?? "🔧";
}
function summariseInput(input) {
    const first = Object.values(input)[0];
    if (typeof first === "string")
        return first.length > 50 ? first.slice(0, 47) + "..." : first;
    return JSON.stringify(input).slice(0, 60);
}
