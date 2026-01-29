---
name: find-skills
description: Helps users discover and install agent skills when they ask "how do I do X", "find a skill for X", "is there a skill that can...", or want to extend capabilities. Use when the user is looking for functionality that might exist as an installable skill.
---

# Find Skills

This skill helps you discover and install skills from the open agent skills ecosystem.

## When to Use This Skill

Use this skill when the user:

- Asks "how do I do X" where X might be a common task with an existing skill
- Says "find a skill for X" or "is there a skill for X"
- Asks "can you do X" where X is a specialized capability
- Expresses interest in extending agent capabilities
- Wants to search for tools, templates, or workflows

## Skills CLI (npx skills)

The Skills CLI is the package manager for the open agent skills ecosystem.

**Key commands:**

- `npx skills find [query]` - Search for skills by keyword (run this to discover skills)
- `npx skills add <source>` - Install a skill from GitHub or other sources
- `npx skills check` - Check for skill updates
- `npx skills update` - Update all installed skills

**Browse skills at:** https://skills.sh/

## Alpha Code: Where Skills Live

This CLI (Alpha Code) uses the **.skills/** directory in the current project. Skills installed by `npx skills add` go to other agents (Cursor, Claude Code, etc.), not here.

**To add a skill to Alpha Code:**

1. Search for skills: run `npx skills find [query]` (e.g. `npx skills find changelog`)
2. Note the install path shown (e.g. vercel-labs/agent-skills@changelog-generator)
3. To use that skill here, copy the skill folder into this project's `.skills/` directory. The user can clone the repo and copy the skill subfolder, or you can suggest they run: `cp -r /path/to/repo/skills/skill-name .skills/`

Example: after finding a skill at vercel-labs/agent-skills, the user could clone and copy:
`git clone https://github.com/vercel-labs/agent-skills /tmp/agent-skills && cp -r /tmp/agent-skills/skills/skill-name .skills/`

## How to Help Users Find Skills

### Step 1: Understand What They Need

Identify the domain (e.g. React, testing, deployment) and specific task.

### Step 2: Search for Skills

Run: `npx skills find [query]`

Examples:

- "how do I make my React app faster?" → `npx skills find react performance`
- "find a skill for PR reviews" → `npx skills find pr review`
- "skill for changelog" → `npx skills find changelog`

### Step 3: Present Options

When you find relevant skills, tell the user:

1. The skill name and what it does
2. For Alpha Code: how to copy the skill into `.skills/` (see above)
3. Link to https://skills.sh/ for more

### Step 4: When No Skills Are Found

- Acknowledge no match was found
- Offer to help with the task directly
- Suggest creating their own skill: `npx skills init my-skill-name`

## Common Categories

| Category        | Example Queries                          |
| --------------- | ---------------------------------------- |
| Web Development | react, nextjs, typescript, css, tailwind |
| Testing         | testing, jest, playwright, e2e           |
| DevOps          | deploy, docker, kubernetes, ci-cd        |
| Documentation   | docs, readme, changelog, api-docs        |
| Code Quality    | review, lint, refactor, best-practices   |
| Design          | ui, ux, design-system, accessibility     |
