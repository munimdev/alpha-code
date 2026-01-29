import * as readline from "readline";
import chalk from "chalk";
import { discoverSkills } from "./skills/discovery.js";
import { matchSkill } from "./skills/matcher.js";
import { execute } from "./agent/executor.js";

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
                const matchResult = await matchSkill(trimmed, skills);

                if (matchResult.skill) {
                    console.log(
                        chalk.blue(`\n[Matched skill: ${matchResult.skill.name}]`)
                    );
                    console.log(chalk.gray(`Reasoning: ${matchResult.reasoning}\n`));
                } else {
                    console.log(chalk.gray(`\n[No skill matched]\n`));
                }

                process.stdout.write(chalk.cyan("Agent: "));

                await execute({
                    userPrompt: trimmed,
                    skill: matchResult.skill,
                    onText: (text) => {
                        process.stdout.write(text);
                    },
                    onToolUse: (toolName, toolInput) => {
                        console.log(
                            chalk.magenta(`\n[Using tool: ${toolName}]`)
                        );
                        console.log(chalk.gray(JSON.stringify(toolInput, null, 2)));
                    },
                    onToolResult: (toolName, result) => {
                        const truncated =
                            result.length > 500
                                ? result.slice(0, 500) + "...(truncated)"
                                : result;
                        console.log(chalk.gray(`[${toolName} result]: ${truncated}\n`));
                        process.stdout.write(chalk.cyan("Agent: "));
                    },
                });

                console.log("\n");
            } catch (error) {
                console.error(chalk.red(`\nError: ${(error as Error).message}\n`));
            }

            prompt();
        });
    };

    prompt();
}
