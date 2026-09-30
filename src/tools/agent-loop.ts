import Anthropic from "@anthropic-ai/sdk";
import type { ToolDefinition } from "../types.js";
import { TOOL_DEFINITIONS } from "./definitions.js";
import { client } from "../llm/anthropic-client.js";
import config from "../config.js";

const MAX_ITERATIONS = 10;

export async function runWhithTools(
    prompt: string,
    systemPrompt?: string,
    tools?: ToolDefinition[]
): Promise<string> {
    const messages: Anthropic.Messages.MessageParam[] =
    [
        {role: "user", content: prompt}
    ];
    const sdkTools = (tools ?? TOOL_DEFINITIONS) as Anthropic.Messages.Tool[];

    for(let iteration=0; iteration <MAX_ITERATIONS; iteration ++ ){
        console.log(`\nPensando...(iteration ${iteration + 1})`)

        const response = await client.messages.create({
      model: config.anthropicModel,
      max_tokens: 4096,
      ...(systemPrompt && { system: systemPrompt }),
      tools: sdkTools,
      messages,
    });
    }
}