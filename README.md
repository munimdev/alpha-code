# Alpha Code

A mini coding agent CLI that implements the [Agent Skills](https://agentskills.io) specification using Claude Sonnet.

## Features

- Discovers skills from a local `.skills/` directory
- Intelligently matches user prompts to relevant skills using Claude
- Executes tasks with tool support (read/write files, run shell commands)
- Compatible with community skills following the Agent Skills spec

## Setup

```bash
# Install dependencies
npm install

# Set your Anthropic API key
export ANTHROPIC_API_KEY=your_api_key_here
```

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
Discovered 3 skill(s):
  - changelog-generator: Generates user-facing changelogs from git commit history
  - code-explainer: Explains code snippets in simple, easy-to-understand terms
  - file-organizer: Suggests improvements to project file and folder organization

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
4. **No Skill Match**: "what's the weather today?" (should not match any skill)

## Using External Skills

This CLI is compatible with any skill following the [Agent Skills specification](https://agentskills.io/specification). To use external skills:

```bash
# Clone a community skills repo
git clone https://github.com/langbaseinc/agent-skills /tmp/agent-skills

# Copy skills you want to use
cp -r /tmp/agent-skills/skills/some-skill .skills/
```

Skills must have a `SKILL.md` file with:

- YAML frontmatter containing `name` and `description`
- Markdown body with instructions for the agent

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

1. **Discovery**: On startup, scans `.skills/` for directories containing `SKILL.md`
2. **Matching**: When user enters a prompt, Claude analyzes it against available skill descriptions
3. **Execution**: If a skill matches, its full content is injected into Claude's context
4. **Tools**: Claude can use tools (read_file, write_file, run_shell, list_directory) to complete tasks
