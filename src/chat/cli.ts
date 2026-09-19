import * as readline from 'readline';
import {Conversation} from './conversation.js';
import {DOCUMENTATION_ASSISTANT_PROMPT} from '../llm/prompts.js';
import {config} from '../config.js';
import { client as anthropicClient } from '../llm/anthropic-client.js';
import { client as geminiClient } from '../llm/gemini-client.js';


export async function startCLI(): Promise<void> 
{
    const rl = readline.createInterface(
            {
            input: process.stdin,
            output: process.stdout,
            }
    )
    const conversation = new Conversation(DOCUMENTATION_ASSISTANT_PROMPT);
    console.log("╔════════════════════════════════════════╗");
    console.log("║          DevAssistant v0.1             ║");
    console.log("║    Asistente de Documentación IA       ║");
    console.log("╚════════════════════════════════════════╝");
    console.log("");
    console.log("💬 Escribe tu pregunta y presiona Enter.");
    console.log("   Comandos: /clear, /stats, /exit");
    console.log("");
    const promptUser = ():void =>
    {
        rl.question("Tú: ",  async (input) =>{
            const userInput = input.trim();
            if(!userInput)
            {
                promptUser();
                return;
            }
            
            if (userInput === "/stats") {
                const stats = conversation.getStats();
                console.log(`\n📊 Estadísticas de la conversación:`);
                console.log(`   • Turnos: ${stats.turns}`);
                console.log(`   • Tokens de entrada acumulados: ${stats.inputTokens}`);
                console.log(`   • Tokens de salida acumulados: ${stats.outputTokens}`);
                console.log(`   • Tokens estimados en contexto actual: ${conversation.estimateCurrentTokens}\n`);
                promptUser();
                return;
            }
            if(userInput === "/exit" || userInput === "/salida"){
                const stats = conversation.getStats();
                console.log(`Resumen: ${stats.turns} turnos`+
                            `${stats.inputTokens} tokens de entrada`+
                            `${stats.outputTokens} tokens de salida`
                );
                rl.close();
                return;
            }
            if (userInput === "/clear" || userInput === "/limpiar") {
                conversation.clear();
                promptUser();
                return;
            }   
            try {
                conversation.addUserMessage(userInput);
                const botName = config.provider === "gemini" ? "Gemini" : "Claude";
                process.stdout.write(`${botName}: `);
                
                const record = conversation.getHistory();
                let fullMessage = "";
                
                if (config.provider === "gemini") {
                    const formattedMessages = record.map(m => ({
                        role: m.role === "assistant" ? "model" : "user",
                        parts: [{ text: m.content }]
                    }));
                    
                    const responseStream = await geminiClient.models.generateContentStream({
                        model: config.geminiModel,
                        contents: formattedMessages,
                        config: { systemInstruction: DOCUMENTATION_ASSISTANT_PROMPT }
                    });
                    
                    for await (const chunk of responseStream) {
                        if (chunk.text) {
                            process.stdout.write(chunk.text);
                            fullMessage += chunk.text;
                        }
                    }
                    
                    conversation.addUsage(0, 0); // Stream en Gemini a veces requiere iterar uso
                    process.stdout.write("\n\n");
                    conversation.addAssistantMessage(fullMessage);
                    promptUser();
                } else {
                    const stream = anthropicClient.messages.stream({
                        model: config.anthropicModel,
                        max_tokens: 1024,
                        system: DOCUMENTATION_ASSISTANT_PROMPT,
                        messages: record,
                    });
                    
                    stream.on("text",(chunk)=>{
                        process.stdout.write(chunk)
                        fullMessage += chunk;
                    });
                    
                    const finalMessage = await stream.finalMessage();
                    conversation.addUsage(finalMessage.usage.input_tokens, finalMessage.usage.output_tokens);
                    process.stdout.write("\n\n");
                    conversation.addAssistantMessage(fullMessage);
                    promptUser();
                }
            } catch(error) {
                const err = error as Error;
                console.error(`Error: ${err.message}`);
                promptUser();
            }    
        });
    };
    promptUser();
}