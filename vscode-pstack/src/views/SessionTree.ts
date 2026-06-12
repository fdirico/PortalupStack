import * as vscode from "vscode";
import type { SessionSummary } from "../../../src/types.js";
import { SessionManager } from "../../../dist/session.js";

export class SessionNode extends vscode.TreeItem {
  constructor(
    public readonly summary: SessionSummary,
    label: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = `${summary.engine} · ${summary.tokens.input.toLocaleString("en-US")} in`;
    this.tooltip = `${summary.id}\n${summary.startedAt}`;
    this.contextValue = "session";
  }
}

export class DateGroupNode extends vscode.TreeItem {
  constructor(label: string, public readonly sessions: SessionSummary[]) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
    this.contextValue = "dateGroup";
  }
}

type TreeNode = DateGroupNode | SessionNode;

export class SessionTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<TreeNode | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private readonly manager: SessionManager;

  constructor(private readonly wsRoot: string) {
    this.manager = new SessionManager(wsRoot);
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeNode): TreeNode[] {
    if (element instanceof DateGroupNode) {
      return element.sessions.map((s) => {
        const time = s.startedAt.slice(11, 16);
        const label = `${time} · ${s.skillsUsed[0] ?? "chat"}`;
        return new SessionNode(s, label);
      });
    }

    // Root — group by date
    const summaries = this.manager.list(50);
    const byDate = new Map<string, SessionSummary[]>();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    for (const s of summaries) {
      const date = s.startedAt.slice(0, 10);
      let label: string;
      if (date === today) { label = "Today"; }
      else if (date === yesterday) { label = "Yesterday"; }
      else { label = date; }
      const existing = byDate.get(label);
      if (existing) {
        existing.push(s);
      } else {
        byDate.set(label, [s]);
      }
    }

    return Array.from(byDate.entries()).map(([label, sessions]) => new DateGroupNode(label, sessions));
  }
}
