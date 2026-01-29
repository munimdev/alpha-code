import Anthropic from "@anthropic-ai/sdk";
import type { SkillMetadata } from "./types.js";

export interface MatchResult {
    skill: SkillMetadata | null;
    reasoning: string;
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
    if (!client) {
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error(
                "ANTHROPIC_API_KEY environment variable is not set"
            );
        }
        client = new Anthropic();
    }
    return client;
}

export function parseMatchResponse(
    text: string,
    skills: SkillMetadata[]
): MatchResult {
    try {
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

    const response = await getClient().messages.create({
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

    const text =
        response.content[0].type === "text" ? response.content[0].text : "";
    return parseMatchResponse(text, skills);
}
