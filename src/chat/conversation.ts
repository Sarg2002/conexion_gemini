import config from "../config.js";
import { client as anthropicClient } from "../llm/anthropic-client.js";
import { client as geminiClient } from "../llm/gemini-client.js";
import { Message } from "../type.js";

const CHARACTERS_PER_TOKEN = 4;
export class Conversation {
    private messages: Message[] = [];
    private systemPrompt: string;
    private totalInputTokens: number = 0;
    private totalOutputTokens: number = 0;

    constructor(systemPrompt: string = "") {
        this.systemPrompt = systemPrompt;
    }
    addUserMessage(text: string): void {
        this.messages.push({ role: "user", content: text });
    }

    addAssistantMessage(text: string): void {
        this.messages.push({ role: "assistant", content: text });
    }

    async send(): Promise<string> {
        if (config.provider === "gemini") {
            const formattedMessages = this.messages.map(m => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }]
            }));
            
            const response = await geminiClient.models.generateContent({
                model: config.geminiModel,
                contents: formattedMessages,
                config: this.systemPrompt ? { systemInstruction: this.systemPrompt } : undefined,
            });
            
            const inputTokens = response.usageMetadata?.promptTokenCount || 0;
            const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
            this.addUsage(inputTokens, outputTokens);
            
            if (!response.text) {
                throw new Error("Gemini no retorno texto en la respuesta.");
            }
            const responseText = response.text;
            this.addAssistantMessage(responseText);
            return responseText;
        } else {
            const response = await anthropicClient.messages.create({
                model: config.anthropicModel,
                max_tokens: 1024,
                ...(this.systemPrompt && { system: this.systemPrompt }),
                messages: this.messages,
            });
            this.addUsage(response.usage.input_tokens, response.usage.output_tokens); 
            const textBlock = response.content.find((block) => block.type === "text");
            if (!textBlock || textBlock.type !== "text") {
                throw new Error("Claude no retorno un bloque de texto en la respuesta.");
            }
            const responseText = textBlock.text;
            this.addAssistantMessage(responseText);
            return responseText;
        }
    }
    addUsage(input_tokens: number, output_tokens: number)
    {
        this.totalInputTokens += input_tokens;
        this.totalOutputTokens += output_tokens;
    }
    clear():void{
        this.messages = [];
        this.totalInputTokens = 0;
        this.totalOutputTokens = 0;
        console.log("Conversación reiniciada.");
    }


    getTurnCount(): number {
        return Math.floor(this.messages.length / 2);
    }

    estimateCurrentTokens(): number {
        const totalChars = this.messages.reduce((sum, msg) => sum + msg.content.length, 0);
        return Math.floor(totalChars / CHARACTERS_PER_TOKEN);
    }

    getStats(): { inputTokens: number; outputTokens: number; totalTokens: number; turns: number } {
        return {
            inputTokens: this.totalInputTokens,
            outputTokens: this.totalOutputTokens,
            totalTokens: this.totalInputTokens + this.totalOutputTokens,
            turns: this.getTurnCount()
        };
    }

    getHistory(): Message[]{
        return [...this.messages];
    }
}