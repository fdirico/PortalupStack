import * as vscode from "vscode";
import { ChatPanel } from "./views/ChatPanel.js";
import { SessionTreeProvider } from "./views/SessionTree.js";
import { StatusBarController } from "./views/StatusBar.js";

export function activate(context: vscode.ExtensionContext): void {
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
