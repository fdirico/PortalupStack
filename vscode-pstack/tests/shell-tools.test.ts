import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runCommand } from "../src/tools/shell-tools";

const allow = async () => true;
const deny = async () => false;

describe("shell-tools", () => {
  it("happy path: returns stdout on success", async () => {
    const result = await runCommand("node --version", allow);
    assert.match(result, /v\d+\.\d+/);
  });

  it("failure path: denied returns denial message", async () => {
    const result = await runCommand("echo should-not-run", deny);
    assert.equal(result, "command denied by user");
  });

  it("edge case: command that exits with non-zero returns error output", async () => {
    const result = await runCommand('node -e "process.exit(42)"', allow);
    assert.match(result, /exit code 42|command failed/);
  });

  it("edge case: command stdout is trimmed", async () => {
    const result = await runCommand(String.raw`node -e "process.stdout.write('hello\n')"`, allow);
    assert.equal(result, "hello");
  });
});
