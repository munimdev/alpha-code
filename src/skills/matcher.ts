import { getClient } from "../client.js";
import type { SkillMetadata } from "./types.js";

export interface MatchResult {
    skill: SkillMetadata | null;
    reasoning: string;
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

    const availableSkillsXml = `<available_skills>
${skills
    .map(
        (s, i) =>
            `  <skill index="${i + 1}">
    <name>${s.name}</name>
    <description>${s.description}</description>
    <location>${s.path}</location>
  </skill>`
    )
    .join("\n")}
</available_skills>`;

    const response = await getClient().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
        messages: [
            {
                role: "user",
                content: `You are a skill matcher. Given a user request and a list of available skills (in XML), determine which skill (if any) should be used.

${availableSkillsXml}

User request: "${userPrompt}"

Respond with JSON only, no markdown:
{"skill_index": <number or null>, "reasoning": "<brief explanation>"}

Use the skill's index attribute. If no skill matches, use skill_index: null.`,
            },
        ],
    });

    const text =
        response.content[0].type === "text" ? response.content[0].text : "";
    return parseMatchResponse(text, skills);
}
