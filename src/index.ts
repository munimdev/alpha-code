#!/usr/bin/env node

import { Command } from "commander";
import { startRepl } from "./repl.js";

const program = new Command();

program
    .name("alpha")
    .description("A mini coding agent CLI that uses Agent Skills")
    .version("1.0.0");

program
    .command("chat")
    .description("Start an interactive chat session with the agent")
    .option("-d, --skills-dir <path>", "Path to skills directory", ".skills")
    .action(async (options) => {
        await startRepl(options.skillsDir);
    });

program.parse();
