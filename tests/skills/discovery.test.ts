import { describe, it, expect } from "vitest";
import * as path from "path";
import { discoverSkills } from "../../src/skills/discovery.js";

const FIXTURES_DIR = path.join(process.cwd(), "tests", "fixtures", "discovery");

describe("discoverSkills", () => {
    it("should discover all valid skills in directory", async () => {
        const skills = await discoverSkills(FIXTURES_DIR);

        expect(skills).toHaveLength(2);

        const names = skills.map((s) => s.name).sort();
        expect(names).toEqual(["skill-one", "skill-two"]);
    });

    it("should return skill metadata with correct properties", async () => {
        const skills = await discoverSkills(FIXTURES_DIR);
        const skillOne = skills.find((s) => s.name === "skill-one");

        expect(skillOne).toBeDefined();
        expect(skillOne?.description).toBe("First test skill");
        expect(skillOne?.path).toContain("skill-one");
        expect(skillOne?.path).toContain("SKILL.md");
    });

    it("should return empty array for non-existent directory", async () => {
        const skills = await discoverSkills("/non/existent/directory");

        expect(skills).toEqual([]);
    });

    it("should return empty array for empty directory", async () => {
        const emptyDir = path.join(FIXTURES_DIR, "empty");
        const skills = await discoverSkills(emptyDir);

        expect(skills).toEqual([]);
    });

    it("should ignore directories without SKILL.md", async () => {
        const skills = await discoverSkills(FIXTURES_DIR);
        const notASkill = skills.find((s) => s.name === "not-a-skill");

        expect(notASkill).toBeUndefined();
    });
});
