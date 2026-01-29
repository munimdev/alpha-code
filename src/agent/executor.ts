import { getClient } from "../client.js";
import { getFullSkillContent } from "../skills/parser.js";
import type { SkillMetadata } from "../skills/types.js";

export interface ExecuteOptions {
    userPrompt: string;
    skill: SkillMetadata | null;
    onText?: (text: string) => void;
}

export async function execute(options: ExecuteOptions): Promise<string> {
    const { userPrompt, skill, onText } = options;

    let systemPrompt = "You are a helpful coding assistant.";

    if (skill) {
        const skillContent = await getFullSkillContent(skill.path);
        systemPrompt = `You are a helpful coding assistant.

The following skill has been activated to help with this request:

<skill name="${skill.name}">
${skillContent}
</skill>

Follow the skill's instructions to help the user.`;
    }

    const stream = getClient().messages.stream({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
            {
                role: "user",
                content: userPrompt,
            },
        ],
    });

    let fullResponse = "";

    for await (const event of stream) {
        if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
        ) {
            const text = event.delta.text;
            fullResponse += text;
            if (onText) {
                onText(text);
            }
        }
    }

    return fullResponse;
}
