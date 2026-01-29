import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getApiKey(): string | undefined {
    return (
        process.env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_KEY
    );
}

export function getClient(): Anthropic {
    if (!client) {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error(
                "ANTHROPIC_API_KEY or ANTHROPIC_KEY environment variable is not set"
            );
        }
        client = new Anthropic({ apiKey });
    }
    return client;
}
