import { describe, it, expect } from "vitest";
import * as path from "path";
import { parseSkillFile, getFullSkillContent } from "../../src/skills/parser.js";

const FIXTURES_DIR = path.join(process.cwd(), "tests", "fixtures", "skills");

describe("parseSkillFile", () => {
    it("should parse a valid SKILL.md file", async () => {
        const skillPath = path.join(FIXTURES_DIR, "valid-skill", "SKILL.md");
        const result = await parseSkillFile(skillPath);

        expect(result).not.toBeNull();
        expect(result?.name).toBe("test-skill");
        expect(result?.description).toBe("A test skill for unit testing");
        expect(result?.path).toBe(skillPath);
    });

    it("should return null for SKILL.md missing required fields", async () => {
        const skillPath = path.join(FIXTURES_DIR, "invalid-skill", "SKILL.md");
        const result = await parseSkillFile(skillPath);

        expect(result).toBeNull();
    });

    it("should return null for non-existent file", async () => {
        const result = await parseSkillFile("/non/existent/path/SKILL.md");

        expect(result).toBeNull();
    });
});

describe("getFullSkillContent", () => {
    it("should return full file content", async () => {
        const skillPath = path.join(FIXTURES_DIR, "valid-skill", "SKILL.md");
        const content = await getFullSkillContent(skillPath);

        expect(content).toContain("name: test-skill");
        expect(content).toContain("# Test Skill");
        expect(content).toContain("This is the body content.");
    });
});
