import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { ChatPanel } from "./views/ChatPanel.js";
import { SessionTreeProvider } from "./views/SessionTree.js";
import { StatusBarController } from "./views/StatusBar.js";

function syncSkillsToClaude(extensionPath: string): void {
  const skillsSrc = path.join(extensionPath, "skills");
  if (!fs.existsSync(skillsSrc)) return;

  const skillsDst = path.join(os.homedir(), ".claude", "skills");
  fs.mkdirSync(skillsDst, { recursive: true });
  fs.cpSync(skillsSrc, skillsDst, { recursive: true, force: true });
}

export function activate(context: vscode.ExtensionContext): void {
  try {
    syncSkillsToClaude(context.extensionUri.fsPath);
  } catch (err) {
    console.warn("[PortalUP] Skills sync failed:", err);
  }

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();

  const statusBar = new StatusBarController();
  const sessionTree = new SessionTreeProvider(workspaceRoot);
  let chatPanel: ChatPanel | undefined;

  vscode.window.createTreeView("portalup.sessions", {
    treeDataProvider: sessionTree,
    showCollapseAll: true,
  });

  context.subscriptions.push(
    statusBar,

    vscode.commands.registerCommand("portalup.openChat", () => {
      if (chatPanel) {
        chatPanel.reveal();
      } else {
        chatPanel = new ChatPanel(context.extensionUri, workspaceRoot, statusBar, () => {
          chatPanel = undefined;
          sessionTree.refresh();
        });
      }
    }),

    vscode.commands.registerCommand("portalup.clearSession", () => {
      chatPanel?.clearSession();
    }),

    vscode.commands.registerCommand("portalup.refreshSessions", () => {
      sessionTree.refresh();
    })
  );

  // Open chat automatically on first activation
  vscode.commands.executeCommand("portalup.openChat");
}

export function deactivate(): void {
  // nothing to clean up — VSCode disposes subscriptions
}
