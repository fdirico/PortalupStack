import type { ToolDefinition } from "../../dist/types.js";

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "read_file",
    description: "Read the full text content of a file in the workspace.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Absolute or workspace-relative path to the file." },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Write content to a file in the workspace. Creates parent directories if needed. Requires user confirmation.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Absolute or workspace-relative path to write." },
        content: { type: "string", description: "Full text content to write to the file." },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "list_directory",
    description: "List files and subdirectories in a workspace directory.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Absolute or workspace-relative path to the directory." },
      },
      required: ["path"],
    },
  },
  {
    name: "run_command",
    description: "Run a shell command in the workspace. Always requires explicit user confirmation before execution.",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string", description: "Shell command to execute." },
      },
      required: ["command"],
    },
  },
];
