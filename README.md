# Alpha Code

A mini coding agent CLI that implements the [Agent Skills](https://agentskills.io) specification using Claude Sonnet.

## Features

- Discovers skills from a local `.skills/` directory
- Intelligently matches user prompts to relevant skills using Claude
- Injects skills using the [spec-recommended XML format](https://agentskills.io/integrate-skills)
- Supports skill references, scripts, and assets (agent can read/run from the skill directory)
- Executes tasks with tool support (read/write files, run shell commands)
- Compatible with community skills following the [Agent Skills specification](https://agentskills.io/specification)

## Setup

```bash
# Install dependencies
npm install

# Set your Anthropic API key (either in .env or export)
# Option 1: Create .env in project root
echo "ANTHROPIC_API_KEY=your_api_key_here" > .env

# Option 2: Export in shell
export ANTHROPIC_API_KEY=your_api_key_here
```

The CLI loads `.env` automatically and accepts either `ANTHROPIC_API_KEY` or `ANTHROPIC_KEY`.

## Usage

```bash
# Start the interactive chat
npm run chat
```

## Demo

```
$ npm run chat

Alpha Code Agent
Skills directory: .skills
Discovered 4 skill(s):
  - changelog-generator: Generates user-facing changelogs from git commit history
  - code-explainer: Explains code snippets in simple, easy-to-understand terms
  - file-organizer: Suggests improvements to project file and folder organization
  - find-skills: Helps discover and install agent skills from the open ecosystem

Type "exit" or press Ctrl+C to quit.

You: generate a changelog for the last 5 commits

[Matched skill: changelog-generator]
Reasoning: User wants to generate a changelog from git commits

Agent: [Uses git log tool, generates formatted changelog...]
```

## Example Prompts to Test

1. **Changelog Generator**: "generate a changelog for the last 10 commits"
2. **Code Explainer**: "explain the code in src/skills/matcher.ts"
3. **File Organizer**: "analyze the project structure and suggest improvements"
4. **Find Skills**: "find a skill for React testing" or "is there a skill for changelogs?"
5. **No Skill Match**: "what's the weather today?" (should not match any skill)

## Using External Skills

This CLI is compatible with any skill following the [Agent Skills specification](https://agentskills.io/specification), including community skills from [github.com/langbaseinc/agent-skills](https://github.com/langbaseinc/agent-skills). Skills can include optional `references/`, `scripts/`, and `assets/` directories; the agent is given the skill path so it can load those via `read_file` or `run_shell`.

**Adding community skills to Alpha Code**

Alpha Code uses the `.skills/` directory in your project. The ecosystem CLIs (`npx skills add`, [npx add-skill](https://add-skill.org/)) install to other agents (Cursor, Claude Code, Codex, OpenCode), not here. To use a community skill with Alpha Code:

```bash
# Search for skills (any agent)
npx skills find changelog

# Clone a repo and copy the skill into .skills/
git clone https://github.com/vercel-labs/agent-skills /tmp/agent-skills
cp -r /tmp/agent-skills/skills/find-skills .skills/
```

Or use the built-in **find-skills** skill: ask "find a skill for X" and follow the instructions (copy the skill folder into `.skills/`).

Skills must have a `SKILL.md` with YAML frontmatter (`name`, `description`) and a Markdown body; see [what are skills](https://agentskills.io/what-are-skills) and the [spec](https://agentskills.io/specification).

## Project Structure

```
alpha-code/
├── src/
│   ├── index.ts          # CLI entry point
│   ├── repl.ts           # Interactive chat loop
│   ├── client.ts         # Shared Anthropic client
│   ├── skills/
│   │   ├── discovery.ts  # Scan .skills/ directory
│   │   ├── parser.ts     # Parse SKILL.md frontmatter
│   │   ├── matcher.ts    # Match prompts to skills using Claude
│   │   └── types.ts      # TypeScript interfaces
│   └── agent/
│       ├── executor.ts   # Execute with Claude + tools
│       └── tools.ts      # File/shell tools
├── tests/                # Unit tests
└── .skills/              # Example skills
```

## Running Tests

```bash
npm test
```

## How It Works

1. **Discovery**: On startup, scans `.skills/` for directories containing `SKILL.md` and parses frontmatter only ([progressive disclosure](https://agentskills.io/what-are-skills)).
2. **Matching**: User prompt is matched against skills using Claude; available skills are presented in the [recommended XML format](https://agentskills.io/integrate-skills) (`<available_skills>`).
3. **Activation**: The matched skill's full `SKILL.md` is loaded and injected as XML (`<skill>`, `<instructions>`, `<location>`). The skill directory path is provided so the agent can load `references/`, run `scripts/`, or use `assets/`.
4. **Execution**: Claude follows the skill instructions and can use tools (read_file, write_file, run_shell, list_directory) to complete tasks.
