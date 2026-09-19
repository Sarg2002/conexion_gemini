export type Role = "user" | "assistant";
export interface Message {
    role: Role;
    content: string;
}

export interface ToolDefinition {
    name: string;
    description: string;
    input_schema:
    {
        typ: "object"
        properties: Record<string, unknown>
        required?: string[];
    }
}

export interface ToolResult {
    toolName: string;
    toolUseId: string;
    result: string;
    isError: boolean;
}

export interface Chunk {
    id: string;
    content: string;
    metadata:
    {
        source: string;
        heading: string;
        position: number;
        charCount: number;
    }
}

export interface RetrievedChunk extends Chunk {
    score: number;
}

export interface SearchResult {
    chunk: Chunk;
    score: number;
}

export type ModelProvider = "anthropic" | "openai" | "gemini";
export interface AppConfig {
    provider: ModelProvider;
    anthropicApiKey: string;
    openaiApiKey: string;
    geminiApiKey: string;
    anthropicModel: string;
    openaiModel: string;
    geminiModel: string;
    openaiEmbeddingModel: string;
    docsPath: string;
    dbPath: string;
    ragTopk: number;
}

export interface AgentResponse {
    test: string;
    toolsUsed: string[];
    inputTokens: number;
    outputTokens: number;
}