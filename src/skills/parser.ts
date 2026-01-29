import * as fs from "fs/promises";
import matter from "gray-matter";
import type { SkillFrontmatter, SkillMetadata } from "./types.js";

export async function parseSkillFile(
    skillPath: string
): Promise<SkillMetadata | null> {
    try {
        const content = await fs.readFile(skillPath, "utf-8");
        const { data } = matter(content);

        const frontmatter = data as Partial<SkillFrontmatter>;

        if (!frontmatter.name || !frontmatter.description) {
            console.warn(
                `Skill at ${skillPath} missing required fields (name, description)`
            );
            return null;
        }

        return {
            name: frontmatter.name,
            description: frontmatter.description,
            path: skillPath,
        };
    } catch (error) {
        console.warn(`Failed to parse skill at ${skillPath}:`, error);
        return null;
    }
}

export async function getFullSkillContent(skillPath: string): Promise<string> {
    return fs.readFile(skillPath, "utf-8");
}
