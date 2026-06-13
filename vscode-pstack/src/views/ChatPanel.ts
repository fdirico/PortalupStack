import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import type { StreamEvent } from "../../dist/types.js";
import type { StatusBarController } from "./StatusBar.js";
import { RuntimeBridge } from "../runtime-bridge.js";

export class ChatPanel implements vscode.Disposable {
  private readonly panel: vscode.WebviewPanel;
  private readonly bridge!: RuntimeBridge;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(
    extensionUri: vscode.Uri,
    private readonly wsRoot: string,
    private readonly statusBar: StatusBarController,
    private readonly onDispose: () => void
  ) {
    this.panel = vscode.window.createWebviewPanel(
      "portalup.chat",
      "PortalUP Chat",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media")],
      }
    );

    try {
      this.bridge = new RuntimeBridge(wsRoot, statusBar);
    } catch (err: any) {
      this.panel.webview.html = `<html><body style="background:#1e1e1e;color:#f44;padding:20px;font-family:monospace;white-space:pre-wrap;">RuntimeBridge init failed:\n${err?.message}\n\n${err?.stack}</body></html>`;
      return;
    }
    try {
      this.panel.webview.html = this.buildHtml(extensionUri);
    } catch (err: any) {
      this.panel.webview.html = `<html><body style="background:#1e1e1e;color:#f44;padding:20px;font-family:monospace;white-space:pre-wrap;">buildHtml failed:\n${err?.message}\n\n${err?.stack}</body></html>`;
      return;
    }

    this.panel.webview.onDidReceiveMessage(
      (msg) => this.handleMessage(msg),
      undefined,
      this.disposables
    );

    this.panel.onDidDispose(() => this.dispose(), undefined, this.disposables);
  }

  reveal(): void {
    this.panel.reveal();
  }

  clearSession(): void {
    this.bridge.resetSession();
    this.post({ type: "done" });
  }

  private async handleMessage(msg: { type: string; text?: string }): Promise<void> {
    if (msg.type !== "user_message" || !msg.text) return;

    try {
      await this.bridge.ask(msg.text, (event: StreamEvent) => {
        if (event.type === "text") {
          this.post({ type: "chunk", chunk: event.chunk });
        } else if (event.type === "tool_call") {
          const label = `${toolIcon(event.name)} ${event.name}(${summariseInput(event.input)})`;
          this.post({ type: "tool_indicator", text: label });
        } else if (event.type === "done") {
          this.post({ type: "done" });
        }
      }, this.buildConfirmFns());
    } catch (err: any) {
      this.post({ type: "error", text: `Error: ${err.message}` });
    }
  }

  private buildConfirmFns() {
    return {
      confirmWrite: async (filePath: string, _content: string): Promise<boolean> => {
        if (this.bridge.autoApprove.writeFile) return true;
        const rel = path.relative(this.wsRoot, filePath);
        const choice = await vscode.window.showWarningMessage(
          `PortalUP wants to write to: ${rel}`,
          { modal: true },
          "Approve",
          "Cancel"
        );
        return choice === "Approve";
      },
      confirmCommand: async (command: string): Promise<boolean> => {
        if (this.bridge.autoApprove.runCommand) return true;
        const choice = await vscode.window.showWarningMessage(
          `PortalUP wants to run:\n\n${command}`,
          { modal: true, detail: "Review the command carefully before allowing." },
          "Allow",
          "Deny"
        );
        return choice === "Allow";
      },
    };
  }

  private post(msg: object): void {
    this.panel.webview.postMessage(msg);
  }

  private buildHtml(extensionUri: vscode.Uri): string {
    const templatePath = path.join(extensionUri.fsPath, "media", "chat.html");
    const nonce = crypto.randomBytes(16).toString("hex");
    return fs.readFileSync(templatePath, "utf8").replace(/\{\{NONCE\}\}/g, nonce);
  }

  dispose(): void {
    this.onDispose();
    this.disposables.forEach((d) => d.dispose());
    this.panel.dispose();
  }
}

function toolIcon(name: string): string {
  const icons: Record<string, string> = {
    read_file: "📄",
    write_file: "✏️",
    list_directory: "📁",
    run_command: "⚡",
  };
  return icons[name] ?? "🔧";
}

function summariseInput(input: Record<string, unknown>): string {
  const first = Object.values(input)[0];
  if (typeof first === "string") return first.length > 50 ? first.slice(0, 47) + "..." : first;
  return JSON.stringify(input).slice(0, 60);
}
