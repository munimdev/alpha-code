import * as readline from "readline";
import chalk from "chalk";
import { discoverSkills } from "./skills/discovery.js";
import { matchSkill } from "./skills/matcher.js";
import { execute, type ExecuteResult } from "./agent/executor.js";

const FLUSH_INTERVAL_MS = 16;

function createBufferedStdout(): { write: (chunk: string) => void; flush: () => void } {
    let buffer = "";
    let timer: ReturnType<typeof setTimeout> | null = null;

    const flush = (): void => {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
        if (buffer.length > 0) {
            process.stdout.write(buffer);
            buffer = "";
        }
    };

    const write = (chunk: string): void => {
        buffer += chunk;
        if (timer === null) {
            timer = setTimeout(flush, FLUSH_INTERVAL_MS);
        }
    };

    return { write, flush };
}

function clearStatusLine(): void {
    process.stdout.write("\r\x1b[K\n");
}

export async function startRepl(skillsDir: string): Promise<void> {
    console.log(chalk.cyan("\nAlpha Code Agent"));
    console.log(chalk.gray(`Skills directory: ${skillsDir}`));

    const skills = await discoverSkills(skillsDir);

    if (skills.length === 0) {
        console.log(chalk.yellow("No skills found."));
    } else {
        console.log(chalk.green(`Discovered ${skills.length} skill(s):`));
        for (const skill of skills) {
            console.log(chalk.gray(`  - ${skill.name}: ${skill.description}`));
        }
    }

    console.log(chalk.gray('\nType "exit" or press Ctrl+C to quit.\n'));

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    let conversationHistory: ExecuteResult["messages"] = [];

    const prompt = (): void => {
        rl.question(chalk.green("You: "), async (input) => {
            const trimmed = input.trim();

            if (trimmed.toLowerCase() === "exit") {
                console.log(chalk.gray("\nGoodbye!"));
                rl.close();
                return;
            }

            if (!trimmed) {
                prompt();
                return;
            }

            try {
                process.stdout.write(chalk.gray("Matching skills..."));
                const matchResult = await matchSkill(trimmed, skills);
                clearStatusLine();

                if (matchResult.skill) {
                    console.log(
                        chalk.blue(`[Matched skill: ${matchResult.skill.name}]`)
                    );
                    console.log(chalk.gray(`Reasoning: ${matchResult.reasoning}\n`));
                } else {
                    console.log(chalk.gray(`[No skill matched]\n`));
                }

                const streamOut = createBufferedStdout();
                let thinkingShown = false;

                const result = await execute({
                    userPrompt: trimmed,
                    skill: matchResult.skill,
                    initialMessages: conversationHistory,
                    onThinking: () => {
                        if (!thinkingShown) {
                            thinkingShown = true;
                            process.stdout.write(chalk.gray("Thinking..."));
                        }
                    },
                    onStreamingStart: () => {
                        clearStatusLine();
                        process.stdout.write(chalk.cyan("Agent: "));
                    },
                    onText: (text) => {
                        streamOut.write(text);
                    },
                    onToolUse: (toolName, toolInput) => {
                        clearStatusLine();
                        const arg =
                            toolInput.path ?? toolInput.command ?? JSON.stringify(toolInput);
                        console.log(chalk.magenta(`[Tool: ${toolName}]`) + chalk.gray(` ${String(arg).slice(0, 80)}${String(arg).length > 80 ? "..." : ""}`));
                    },
                    onToolResult: (toolName, result) => {
                        const truncated =
                            result.length > 200
                                ? result.slice(0, 200) + "..."
                                : result;
                        console.log(chalk.gray(`  -> ${truncated.replace(/\n/g, " ")}\n`));
                        process.stdout.write(chalk.cyan("Agent: "));
                    },
                });

                streamOut.flush();
                console.log("\n");

                conversationHistory = result.messages;
            } catch (error) {
                clearStatusLine();
                console.error(chalk.red(`\nError: ${(error as Error).message}\n`));
            }

            prompt();
        });
    };

    prompt();
}
