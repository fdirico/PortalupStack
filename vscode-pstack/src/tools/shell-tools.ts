import { execSync } from "node:child_process";

export async function runCommand(
  command: string,
  confirmFn: (command: string) => Promise<boolean>
): Promise<string> {
  const allowed = await confirmFn(command);
  if (!allowed) return "command denied by user";

  try {
    const output = execSync(command, { encoding: "utf8", timeout: 30_000 });
    return output.trim();
  } catch (err: any) {
    const code = err.status ?? err.code ?? "unknown";
    const stderr = err.stderr?.toString().trim() ?? "";
    const stdout = err.stdout?.toString().trim() ?? "";
    const detail = stderr || stdout || err.message;
    return `command failed with exit code ${code}: ${detail}`;
  }
}
