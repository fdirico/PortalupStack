import * as vscode from "vscode";

export class StatusBarController implements vscode.Disposable {
  private item: vscode.StatusBarItem;
  private engine = "claude";
  private tokens = 0;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);
    this.item.command = "portalup.openChat";
    this.item.tooltip = "PortalUP Stack — click to open chat";
    this.render();
    this.item.show();
  }

  update(engine: string, totalTokens: number): void {
    this.engine = engine;
    this.tokens = totalTokens;
    this.render();
  }

  reset(): void {
    this.tokens = 0;
    this.render();
  }

  private render(): void {
    const tok = this.tokens > 0 ? ` ${this.tokens.toLocaleString("en-US")} tok` : "";
    this.item.text = `$(zap) PortalUP [${this.engine}]${tok}`;
  }

  dispose(): void {
    this.item.dispose();
  }
}
