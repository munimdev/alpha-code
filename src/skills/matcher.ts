import Anthropic from "@anthropic-ai/sdk";
import type { SkillMetadata } from "./types.js";

const client = new Anthropic();

export interface MatchResult {
    skill: SkillMetadata | null;
    reasoning: string;
}

export async function matchSkill(
    userPrompt: string,
    skills: SkillMetadata[]
): Promise<MatchResult> {
    if (skills.length === 0) {
        return { skill: null, reasoning: "No skills available" };
    }

    const skillList = skills
        .map((s, i) => `${i + 1}. ${s.name}: ${s.description}`)
        .join("\n");

    const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
        messages: [
            {
                role: "user",
                content: `You are a skill matcher. Given a user request and a list of available skills, determine which skill (if any) should be used.

Available skills:
${skillList}

User request: "${userPrompt}"

Respond with JSON only, no markdown:
{"skill_index": <number or null>, "reasoning": "<brief explanation>"}

If no skill matches, use skill_index: null.`,
            },
        ],
    });

    try {
        const text =
            response.content[0].type === "text" ? response.content[0].text : "";
        const parsed = JSON.parse(text) as {
            skill_index: number | null;
            reasoning: string;
        };

        if (
            parsed.skill_index !== null &&
            parsed.skill_index >= 1 &&
            parsed.skill_index <= skills.length
        ) {
            return {
                skill: skills[parsed.skill_index - 1],
                reasoning: parsed.reasoning,
            };
        }

        return { skill: null, reasoning: parsed.reasoning };
    } catch {
        return { skill: null, reasoning: "Failed to parse match response" };
    }
}
