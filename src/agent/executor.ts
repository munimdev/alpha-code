import * as path from "path";
import type Anthropic from "@anthropic-ai/sdk";
import { getClient, getModel } from "../client.js";
import { getFullSkillContent } from "../skills/parser.js";
import { toolDefinitions, executeTool } from "./tools.js";
import type { SkillMetadata } from "../skills/types.js";

type MessageParam = Anthropic.MessageParam;
type ContentBlockParam = Anthropic.ContentBlockParam;
type ToolUseBlock = { type: "tool_use"; id: string; name: string; input: unknown };

export interface ExecuteOptions {
    userPrompt: string;
    skill: SkillMetadata | null;
    initialMessages?: MessageParam[];
    onText?: (text: string) => void;
    onToolUse?: (toolName: string, input: Record<string, unknown>) => void;
    onToolResult?: (toolName: string, result: string) => void;
    onThinking?: (delta?: string) => void;
    onStreamingStart?: () => void;
}

export interface ExecuteResult {
    fullResponse: string;
    messages: MessageParam[];
}

const MAX_HISTORY_MESSAGES = 50;

export async function execute(options: ExecuteOptions): Promise<ExecuteResult> {
    const {
        userPrompt,
        skill,
        initialMessages = [],
        onText,
        onToolUse,
        onToolResult,
        onThinking,
        onStreamingStart,
    } = options;

    let systemPrompt = `You are Alpha Code, a coding agent CLI that uses Agent Skills. When users ask who you are, identify as Alpha Code (not Claude). You have access to tools that let you read files, write files, list directories, and run shell commands. Use these tools to help the user with their coding tasks.`;

    if (skill) {
        const skillContent = await getFullSkillContent(skill.path);
        const skillDir = path.dirname(skill.path);

        systemPrompt = `You are Alpha Code, a coding agent CLI that uses Agent Skills. When users ask who you are, identify as Alpha Code (not Claude). You have access to tools that let you read files, write files, list directories, and run shell commands.

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

    const recentHistory =
        initialMessages.length > MAX_HISTORY_MESSAGES
            ? initialMessages.slice(-MAX_HISTORY_MESSAGES)
            : initialMessages;

    const messages: MessageParam[] = [
        ...recentHistory,
        {
            role: "user",
            content: userPrompt,
        },
    ];

    let fullResponse = "";
    const maxIterations = 10;

    for (let i = 0; i < maxIterations; i++) {
        onThinking?.();

        const stream = getClient().messages.stream({
            model: getModel(),
            max_tokens: 4096,
            system: systemPrompt,
            tools: toolDefinitions,
            messages,
        });

        let firstText = true;

        stream.on("thinking", (delta: string) => {
            onThinking?.(delta);
        });

        stream.on("text", (delta: string) => {
            if (firstText) {
                firstText = false;
                onStreamingStart?.();
            }
            fullResponse += delta;
            onText?.(delta);
        });

        const finalMessage = await stream.finalMessage();

        const assistantContent: ContentBlockParam[] = [];
        const toolResults: ContentBlockParam[] = [];

        for (const block of finalMessage.content) {
            if (block.type === "text") {
                assistantContent.push({ type: "text", text: block.text });
            } else if (block.type === "tool_use") {
                const toolBlock = block as ToolUseBlock;
                onToolUse?.(toolBlock.name, toolBlock.input as Record<string, unknown>);

                assistantContent.push({
                    type: "tool_use",
                    id: toolBlock.id,
                    name: toolBlock.name,
                    input: toolBlock.input,
                });

                const result = await executeTool(
                    toolBlock.name,
                    toolBlock.input as Record<string, unknown>
                );

                onToolResult?.(toolBlock.name, result.output);

                toolResults.push({
                    type: "tool_result",
                    tool_use_id: toolBlock.id,
                    content: result.output,
                });
            }
        }

        const content =
            assistantContent.length > 0
                ? assistantContent
                : ([{ type: "text" as const, text: "." }] satisfies ContentBlockParam[]);

        messages.push({ role: "assistant", content });

        if (toolResults.length > 0) {
            messages.push({ role: "user", content: toolResults });
        }

        if (finalMessage.stop_reason === "end_turn") {
            break;
        }
    }

    return { fullResponse, messages };
}
