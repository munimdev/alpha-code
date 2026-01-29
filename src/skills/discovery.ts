import * as fs from "fs/promises";
import * as path from "path";
import { parseSkillFile } from "./parser.js";
import type { SkillMetadata } from "./types.js";

export async function discoverSkills(
    skillsDir: string
): Promise<SkillMetadata[]> {
    const skills: SkillMetadata[] = [];

    try {
        const entries = await fs.readdir(skillsDir, { withFileTypes: true });

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;

            const skillMdPath = path.join(
                skillsDir,
                entry.name,
                "SKILL.md"
            );

            try {
                await fs.access(skillMdPath);
                const metadata = await parseSkillFile(skillMdPath);
                if (metadata) {
                    skills.push(metadata);
                }
            } catch {
                // SKILL.md doesn't exist in this directory, skip
            }
        }
    } catch (error) {
        // Skills directory doesn't exist or isn't readable
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            console.warn(`Error reading skills directory: ${error}`);
        }
    }

    return skills;
}
