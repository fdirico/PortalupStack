import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";
import type { SessionSummary } from "../../../src/types.js";
import { SessionManager } from "../../../src/session.js";

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
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeNode | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private manager: SessionManager;

  constructor(private wsRoot: string) {
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
      const label = date === today ? "Today" : date === yesterday ? "Yesterday" : date;
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
