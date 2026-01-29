import * as readline from "readline";
import chalk from "chalk";
import { discoverSkills } from "./skills/discovery.js";
import { matchSkill } from "./skills/matcher.js";

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

            const matchResult = await matchSkill(trimmed, skills);

            if (matchResult.skill) {
                console.log(
                    chalk.blue(`\n[Matched skill: ${matchResult.skill.name}]`)
                );
                console.log(chalk.gray(`Reasoning: ${matchResult.reasoning}`));
            } else {
                console.log(chalk.gray(`\n[No skill matched: ${matchResult.reasoning}]`));
            }

            // TODO: Milestone 4 - Execute with Claude

            console.log(
                chalk.yellow(
                    "Agent: [Execution not yet implemented - will respond in Milestone 4]\n"
                )
            );

            prompt();
        });
    };

    prompt();
}
