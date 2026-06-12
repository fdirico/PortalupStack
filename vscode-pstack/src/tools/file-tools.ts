import * as fs from "node:fs";
import * as path from "node:path";

function assertInWorkspace(filePath: string, wsRoot: string): void {
  const resolved = path.resolve(filePath);
  const root = path.resolve(wsRoot);
  // Also block access to session/handoff outputs
  const blocked = [
    path.join(root, "outputs", "sessions"),
    path.join(root, "outputs", "handoffs"),
  ];
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error(`Access denied: path is outside workspace: ${filePath}`);
  }
  for (const b of blocked) {
    if (resolved.startsWith(b)) {
      throw new Error(`Access denied: path is in a protected directory: ${filePath}`);
    }
  }
}

export function readFile(filePath: string, wsRoot: string): string {
  assertInWorkspace(filePath, wsRoot);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

export function writeFile(
  filePath: string,
  content: string,
  wsRoot: string,
  confirmFn: (filePath: string, content: string) => Promise<boolean>
): Promise<string> {
  assertInWorkspace(filePath, wsRoot);
  return confirmFn(filePath, content).then((confirmed) => {
    if (!confirmed) return "write denied by user";
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content, "utf8");
    return `wrote ${filePath}`;
  });
}

export function listDirectory(dirPath: string, wsRoot: string): string {
  assertInWorkspace(dirPath, wsRoot);
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries.map((e) => (e.isDirectory() ? `${e.name}/` : e.name)).join("\n");
}
