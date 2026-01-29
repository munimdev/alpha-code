import * as readline from "readline";
import chalk from "chalk";

export async function startRepl(skillsDir: string): Promise<void> {
    console.log(chalk.cyan("\nAlpha Code Agent"));
    console.log(chalk.gray(`Skills directory: ${skillsDir}`));
    console.log(chalk.gray('Type "exit" or press Ctrl+C to quit.\n'));

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

            // TODO: Milestone 2 - Discover skills
            // TODO: Milestone 3 - Match skills to user input
            // TODO: Milestone 4 - Execute with Claude

            console.log(
                chalk.yellow(
                    "\nAgent: [Not yet implemented - will respond in Milestone 4]\n"
                )
            );

            prompt();
        });
    };

    prompt();
}
