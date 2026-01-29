---
name: changelog-generator
description: Generates user-facing changelogs from git commit history
---

# Changelog Generator

Generate clean, user-facing changelogs from git commit history.

## When to Use

Use this skill when the user asks to:
- Generate a changelog
- Summarize recent commits
- Create release notes
- Document what changed

## Instructions

1. First, run `git log --oneline -n 20` to see recent commits
2. Analyze the commits and categorize them:
   - **Added**: New features
   - **Changed**: Updates to existing features
   - **Fixed**: Bug fixes
   - **Removed**: Removed features
3. Write a clean, user-friendly changelog in markdown format
4. If the user specifies a version number, include it in the header
5. Focus on what matters to users, not implementation details

## Output Format

```markdown
# Changelog

## [Version] - YYYY-MM-DD

### Added
- Feature description

### Changed
- Change description

### Fixed
- Fix description
```

## Example

User: "Generate a changelog for the last 10 commits"

1. Run: `git log --oneline -n 10`
2. Categorize and summarize
3. Output formatted changelog
