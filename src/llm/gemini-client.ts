import { GoogleGenAI } from "@google/genai";
import config from "../config.js";

const client = new GoogleGenAI({ apiKey: config.geminiApiKey });

export async function askGemini(prompt: string, systemPrompt?: string): Promise<string> {
    const response = await client.models.generateContent({
        model: config.geminiModel,
        contents: prompt,
        config: systemPrompt ? { systemInstruction: systemPrompt } : undefined,
    });
    
    if (!response.text) {
        throw new Error("Gemini no retorno texto en la respuesta.");
    }
    return response.text;
}

export async function streamGemini(prompt: string, systemPrompt?: string): Promise<string> {
    const responseStream = await client.models.generateContentStream({
        model: config.geminiModel,
        contents: prompt,
        config: systemPrompt ? { systemInstruction: systemPrompt } : undefined,
    });

    let fullresponse = "";
    for await (const chunk of responseStream) {
        if (chunk.text) {
            process.stdout.write(chunk.text);
            fullresponse += chunk.text;
        }
    }
    process.stdout.write("\n");
    return fullresponse;
}

export { client };
