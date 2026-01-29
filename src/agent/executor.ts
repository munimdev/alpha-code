import * as path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { getClient } from "../client.js";
import { getFullSkillContent } from "../skills/parser.js";
import { toolDefinitions, executeTool } from "./tools.js";
import type { SkillMetadata } from "../skills/types.js";

export interface ExecuteOptions {
    userPrompt: string;
    skill: SkillMetadata | null;
    onText?: (text: string) => void;
    onToolUse?: (toolName: string, input: Record<string, unknown>) => void;
    onToolResult?: (toolName: string, result: string) => void;
}

type MessageParam = Anthropic.MessageParam;
type ContentBlockParam = Anthropic.ContentBlockParam;

export async function execute(options: ExecuteOptions): Promise<string> {
    const { userPrompt, skill, onText, onToolUse, onToolResult } = options;

    let systemPrompt = `You are a helpful coding assistant. You have access to tools that let you read files, write files, list directories, and run shell commands. Use these tools to help the user with their coding tasks.`;

    if (skill) {
        const skillContent = await getFullSkillContent(skill.path);
        const skillDir = path.dirname(skill.path);

        systemPrompt = `You are a helpful coding assistant. You have access to tools that let you read files, write files, list directories, and run shell commands.

The following skill has been activated. Its instructions are in the XML block below. The skill directory is at: ${skillDir}
You can load reference files (references/), run scripts (scripts/), or use assets (assets/) by passing paths relative to that directory to read_file or run_shell (e.g. read_file "${skillDir}/references/REFERENCE.md", or run_shell with cd to that directory).

<skill>
  <name>${skill.name}</name>
  <description>Activated for this request</description>
  <location>${skill.path}</location>
  <instructions>
${skillContent}
  </instructions>
</skill>

Follow the skill's instructions to help the user. Use tools as needed.`;
    }

    const messages: MessageParam[] = [
        {
            role: "user",
            content: userPrompt,
        },
    ];

    let fullResponse = "";
    const maxIterations = 10;

    for (let i = 0; i < maxIterations; i++) {
        const response = await getClient().messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            system: systemPrompt,
            tools: toolDefinitions,
            messages,
        });

        const assistantContent: ContentBlockParam[] = [];
        const toolResults: ContentBlockParam[] = [];

        for (const block of response.content) {
            if (block.type === "text") {
                fullResponse += block.text;
                if (onText) {
                    onText(block.text);
                }
                assistantContent.push({ type: "text", text: block.text });
            } else if (block.type === "tool_use") {
                if (onToolUse) {
                    onToolUse(
                        block.name,
                        block.input as Record<string, unknown>
                    );
                }

                assistantContent.push({
                    type: "tool_use",
                    id: block.id,
                    name: block.name,
                    input: block.input,
                });

                const result = await executeTool(
                    block.name,
                    block.input as Record<string, unknown>
                );

                if (onToolResult) {
                    onToolResult(block.name, result.output);
                }

                toolResults.push({
                    type: "tool_result",
                    tool_use_id: block.id,
                    content: result.output,
                });
            }
        }

        messages.push({ role: "assistant", content: assistantContent });

        if (toolResults.length > 0) {
            messages.push({ role: "user", content: toolResults });
        }

        if (response.stop_reason === "end_turn") {
            break;
        }
    }

    return fullResponse;
}
