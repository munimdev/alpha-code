import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface ToolResult {
    success: boolean;
    output: string;
}

export const toolDefinitions = [
    {
        name: "read_file",
        description: "Read the contents of a file at the specified path",
        input_schema: {
            type: "object" as const,
            properties: {
                path: {
                    type: "string",
                    description: "The path to the file to read",
                },
            },
            required: ["path"],
        },
    },
    {
        name: "write_file",
        description: "Write content to a file at the specified path",
        input_schema: {
            type: "object" as const,
            properties: {
                path: {
                    type: "string",
                    description: "The path to the file to write",
                },
                content: {
                    type: "string",
                    description: "The content to write to the file",
                },
            },
            required: ["path", "content"],
        },
    },
    {
        name: "run_shell",
        description: "Run a shell command and return the output",
        input_schema: {
            type: "object" as const,
            properties: {
                command: {
                    type: "string",
                    description: "The shell command to execute",
                },
            },
            required: ["command"],
        },
    },
    {
        name: "list_directory",
        description: "List the contents of a directory",
        input_schema: {
            type: "object" as const,
            properties: {
                path: {
                    type: "string",
                    description: "The path to the directory to list",
                },
            },
            required: ["path"],
        },
    },
];

export async function readFile(filePath: string): Promise<ToolResult> {
    try {
        const resolvedPath = path.resolve(filePath);
        const content = await fs.readFile(resolvedPath, "utf-8");
        return { success: true, output: content };
    } catch (error) {
        return {
            success: false,
            output: `Error reading file: ${(error as Error).message}`,
        };
    }
}

export async function writeFile(
    filePath: string,
    content: string
): Promise<ToolResult> {
    try {
        const resolvedPath = path.resolve(filePath);
        const dir = path.dirname(resolvedPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(resolvedPath, content, "utf-8");
        return { success: true, output: `File written to ${resolvedPath}` };
    } catch (error) {
        return {
            success: false,
            output: `Error writing file: ${(error as Error).message}`,
        };
    }
}

export async function runShell(command: string): Promise<ToolResult> {
    try {
        const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
        const output = stdout + (stderr ? `\nstderr: ${stderr}` : "");
        return { success: true, output: output || "Command completed" };
    } catch (error) {
        const err = error as Error & { stdout?: string; stderr?: string };
        return {
            success: false,
            output: `Error: ${err.message}\n${err.stdout || ""}${err.stderr || ""}`,
        };
    }
}

export async function listDirectory(dirPath: string): Promise<ToolResult> {
    try {
        const resolvedPath = path.resolve(dirPath);
        const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
        const list = entries
            .map((entry) => {
                const type = entry.isDirectory() ? "[dir]" : "[file]";
                return `${type} ${entry.name}`;
            })
            .join("\n");
        return { success: true, output: list || "Empty directory" };
    } catch (error) {
        return {
            success: false,
            output: `Error listing directory: ${(error as Error).message}`,
        };
    }
}

export async function executeTool(
    toolName: string,
    input: Record<string, unknown>
): Promise<ToolResult> {
    switch (toolName) {
        case "read_file":
            return readFile(input.path as string);
        case "write_file":
            return writeFile(input.path as string, input.content as string);
        case "run_shell":
            return runShell(input.command as string);
        case "list_directory":
            return listDirectory(input.path as string);
        default:
            return { success: false, output: `Unknown tool: ${toolName}` };
    }
}
