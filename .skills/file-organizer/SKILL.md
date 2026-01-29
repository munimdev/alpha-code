---
name: file-organizer
description: Suggests improvements to project file and folder organization
---

# File Organizer

Analyze project structure and suggest organizational improvements.

## When to Use

Use this skill when the user asks to:
- Organize files
- Improve project structure
- Review folder layout
- Clean up the codebase

## Instructions

1. Use `list_directory` to explore the project structure
2. Identify common patterns and anti-patterns:
   - Files in wrong locations
   - Missing index/barrel files
   - Inconsistent naming conventions
   - Deeply nested structures
   - Mixed concerns in same folder
3. Suggest improvements based on best practices

## Analysis Steps

1. **Map the structure**: List all directories and key files
2. **Identify patterns**: What conventions are already in use?
3. **Find issues**: What could be improved?
4. **Suggest changes**: Provide specific, actionable recommendations

## Common Recommendations

- Group related files together
- Use consistent naming (kebab-case, camelCase, etc.)
- Separate concerns (components, utils, types, etc.)
- Add index files for cleaner imports
- Keep nesting shallow (max 3-4 levels)

## Output Format

```markdown
## Current Structure Analysis

[Overview of current organization]

## Issues Found

1. [Issue description]
2. [Issue description]

## Recommendations

1. [Specific recommendation]
   - Move X to Y
   - Rename A to B

## Suggested Structure

[Show improved structure]
```
