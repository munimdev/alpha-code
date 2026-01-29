import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import {
    readFile,
    writeFile,
    listDirectory,
    runShell,
    executeTool,
} from "../../src/agent/tools.js";

const TEST_DIR = path.join(process.cwd(), "tests", "fixtures", "tools");

describe("tools", () => {
    beforeAll(async () => {
        await fs.mkdir(TEST_DIR, { recursive: true });
        await fs.writeFile(path.join(TEST_DIR, "test.txt"), "Hello, World!");
        await fs.mkdir(path.join(TEST_DIR, "subdir"), { recursive: true });
    });

    afterAll(async () => {
        await fs.rm(TEST_DIR, { recursive: true, force: true });
    });

    describe("readFile", () => {
        it("should read file contents", async () => {
            const result = await readFile(path.join(TEST_DIR, "test.txt"));

            expect(result.success).toBe(true);
            expect(result.output).toBe("Hello, World!");
        });

        it("should return error for non-existent file", async () => {
            const result = await readFile(path.join(TEST_DIR, "nonexistent.txt"));

            expect(result.success).toBe(false);
            expect(result.output).toContain("Error reading file");
        });
    });

    describe("writeFile", () => {
        it("should write file contents", async () => {
            const filePath = path.join(TEST_DIR, "output.txt");
            const result = await writeFile(filePath, "Test content");

            expect(result.success).toBe(true);

            const content = await fs.readFile(filePath, "utf-8");
            expect(content).toBe("Test content");
        });

        it("should create parent directories", async () => {
            const filePath = path.join(TEST_DIR, "nested", "dir", "file.txt");
            const result = await writeFile(filePath, "Nested content");

            expect(result.success).toBe(true);

            const content = await fs.readFile(filePath, "utf-8");
            expect(content).toBe("Nested content");
        });
    });

    describe("listDirectory", () => {
        it("should list directory contents", async () => {
            const result = await listDirectory(TEST_DIR);

            expect(result.success).toBe(true);
            expect(result.output).toContain("test.txt");
            expect(result.output).toContain("[file]");
            expect(result.output).toContain("[dir]");
        });

        it("should return error for non-existent directory", async () => {
            const result = await listDirectory(
                path.join(TEST_DIR, "nonexistent")
            );

            expect(result.success).toBe(false);
            expect(result.output).toContain("Error listing directory");
        });
    });

    describe("runShell", () => {
        it("should run shell command", async () => {
            const result = await runShell("echo hello");

            expect(result.success).toBe(true);
            expect(result.output.trim()).toBe("hello");
        });

        it("should handle failed commands", async () => {
            const result = await runShell("nonexistentcommand123");

            expect(result.success).toBe(false);
            expect(result.output).toContain("Error");
        });
    });

    describe("executeTool", () => {
        it("should dispatch to correct tool", async () => {
            const result = await executeTool("read_file", {
                path: path.join(TEST_DIR, "test.txt"),
            });

            expect(result.success).toBe(true);
            expect(result.output).toBe("Hello, World!");
        });

        it("should return error for unknown tool", async () => {
            const result = await executeTool("unknown_tool", {});

            expect(result.success).toBe(false);
            expect(result.output).toContain("Unknown tool");
        });
    });
});
