---
name: code-explainer
description: Explains code snippets in simple, easy-to-understand terms
---

# Code Explainer

Explain code in simple terms that anyone can understand.

## When to Use

Use this skill when the user asks to:
- Explain code
- Understand what code does
- Break down a function or file
- Learn how something works

## Instructions

1. If the user provides a file path, use `read_file` to get the contents
2. Break down the code into logical sections
3. Explain each section in plain English
4. Avoid jargon - use simple analogies when helpful
5. Highlight:
   - What the code does (purpose)
   - How it works (mechanism)
   - Why it matters (context)

## Explanation Structure

1. **Overview**: One sentence summary of what the code does
2. **Step-by-step**: Walk through the logic
3. **Key concepts**: Explain any important patterns or techniques
4. **Summary**: Recap the main points

## Guidelines

- Use analogies to explain complex concepts
- Point out common patterns (loops, conditionals, etc.)
- Mention potential edge cases or gotchas
- Keep explanations concise but complete

## Example

User: "Explain the code in src/utils.ts"

1. Read the file with `read_file`
2. Provide overview
3. Explain each function/section
4. Summarize key takeaways
