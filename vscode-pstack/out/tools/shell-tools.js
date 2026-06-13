"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = runCommand;
const node_child_process_1 = require("node:child_process");
async function runCommand(command, confirmFn) {
    const allowed = await confirmFn(command);
    if (!allowed)
        return "command denied by user";
    try {
        const output = (0, node_child_process_1.execSync)(command, { encoding: "utf8", timeout: 30000 });
        return output.trim();
    }
    catch (err) {
        const code = err.status ?? err.code ?? "unknown";
        const stderr = err.stderr?.toString().trim() ?? "";
        const stdout = err.stdout?.toString().trim() ?? "";
        const detail = stderr || stdout || err.message;
        return `command failed with exit code ${code}: ${detail}`;
    }
}
