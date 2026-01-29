import { describe, it, expect } from "vitest";
import { parseMatchResponse } from "../../src/skills/matcher.js";
import type { SkillMetadata } from "../../src/skills/types.js";

const testSkills: SkillMetadata[] = [
    {
        name: "changelog-generator",
        description: "Generates changelogs from git commits",
        path: "/path/to/changelog-generator/SKILL.md",
    },
    {
        name: "code-explainer",
        description: "Explains code in simple terms",
        path: "/path/to/code-explainer/SKILL.md",
    },
];

describe("parseMatchResponse", () => {
    it("should match first skill when skill_index is 1", () => {
        const response = JSON.stringify({
            skill_index: 1,
            reasoning: "User wants to generate a changelog",
        });

        const result = parseMatchResponse(response, testSkills);

        expect(result.skill).not.toBeNull();
        expect(result.skill?.name).toBe("changelog-generator");
        expect(result.reasoning).toBe("User wants to generate a changelog");
    });

    it("should match second skill when skill_index is 2", () => {
        const response = JSON.stringify({
            skill_index: 2,
            reasoning: "User wants code explanation",
        });

        const result = parseMatchResponse(response, testSkills);

        expect(result.skill?.name).toBe("code-explainer");
    });

    it("should return null when skill_index is null", () => {
        const response = JSON.stringify({
            skill_index: null,
            reasoning: "Request is about weather, no matching skill",
        });

        const result = parseMatchResponse(response, testSkills);

        expect(result.skill).toBeNull();
        expect(result.reasoning).toBe(
            "Request is about weather, no matching skill"
        );
    });

    it("should handle invalid JSON response", () => {
        const result = parseMatchResponse("This is not valid JSON", testSkills);

        expect(result.skill).toBeNull();
        expect(result.reasoning).toBe("Failed to parse match response");
    });

    it("should handle out of range skill index (too high)", () => {
        const response = JSON.stringify({
            skill_index: 99,
            reasoning: "Invalid index",
        });

        const result = parseMatchResponse(response, testSkills);

        expect(result.skill).toBeNull();
    });

    it("should handle zero skill index", () => {
        const response = JSON.stringify({
            skill_index: 0,
            reasoning: "Zero index",
        });

        const result = parseMatchResponse(response, testSkills);

        expect(result.skill).toBeNull();
    });

    it("should handle negative skill index", () => {
        const response = JSON.stringify({
            skill_index: -1,
            reasoning: "Negative index",
        });

        const result = parseMatchResponse(response, testSkills);

        expect(result.skill).toBeNull();
    });

    it("should handle empty skills array", () => {
        const response = JSON.stringify({
            skill_index: 1,
            reasoning: "Some reasoning",
        });

        const result = parseMatchResponse(response, []);

        expect(result.skill).toBeNull();
    });
});
