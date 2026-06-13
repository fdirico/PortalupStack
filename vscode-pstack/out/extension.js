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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const os = __importStar(require("node:os"));
const ChatPanel_js_1 = require("./views/ChatPanel.js");
const SessionTree_js_1 = require("./views/SessionTree.js");
const StatusBar_js_1 = require("./views/StatusBar.js");
function syncSkillsToClaude(extensionPath) {
    const skillsSrc = path.join(extensionPath, "skills");
    if (!fs.existsSync(skillsSrc))
        return;
    const skillsDst = path.join(os.homedir(), ".claude", "skills");
    fs.mkdirSync(skillsDst, { recursive: true });
    fs.cpSync(skillsSrc, skillsDst, { recursive: true, force: true });
}
function activate(context) {
    try {
        syncSkillsToClaude(context.extensionUri.fsPath);
    }
    catch (err) {
        console.warn("[PortalUP] Skills sync failed:", err);
    }
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
    const statusBar = new StatusBar_js_1.StatusBarController();
    const sessionTree = new SessionTree_js_1.SessionTreeProvider(workspaceRoot);
    let chatPanel;
    vscode.window.createTreeView("portalup.sessions", {
        treeDataProvider: sessionTree,
        showCollapseAll: true,
    });
    context.subscriptions.push(statusBar, vscode.commands.registerCommand("portalup.openChat", () => {
        if (chatPanel) {
            chatPanel.reveal();
        }
        else {
            chatPanel = new ChatPanel_js_1.ChatPanel(context.extensionUri, workspaceRoot, statusBar, () => {
                chatPanel = undefined;
                sessionTree.refresh();
            });
        }
    }), vscode.commands.registerCommand("portalup.clearSession", () => {
        chatPanel?.clearSession();
    }), vscode.commands.registerCommand("portalup.refreshSessions", () => {
        sessionTree.refresh();
    }));
    // Open chat automatically on first activation
    vscode.commands.executeCommand("portalup.openChat");
}
function deactivate() {
    // nothing to clean up — VSCode disposes subscriptions
}
