import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import type { StreamEvent } from "../../../src/types.js";
import type { StatusBarController } from "./StatusBar.js";
import { RuntimeBridge } from "../runtime-bridge.js";

export class ChatPanel implements vscode.Disposable {
  private panel: vscode.WebviewPanel;
  private bridge: RuntimeBridge;
  private disposables: vscode.Disposable[] = [];

  constructor(
    extensionUri: vscode.Uri,
    private wsRoot: string,
    private statusBar: StatusBarController,
    private onDispose: () => void
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

    this.bridge = new RuntimeBridge(wsRoot, statusBar);
    this.panel.webview.html = this.buildHtml(extensionUri);

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
      confirmWrite: async (filePath: string, content: string): Promise<boolean> => {
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
