import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMRequest, LLMResponse, Provider } from './types';

export class GoogleProvider implements Provider {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_API_KEY environment variable is required for Google provider');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generate(req: LLMRequest): Promise<LLMResponse> {
        const start = Date.now();
        const model = this.genAI.getGenerativeModel({
            model: req.model,
            generationConfig: {
                temperature: req.temperature,
                maxOutputTokens: req.maxOutputTokens
            }
        });

        // Convert messages to history format if needed, but for simplicity
        // we assume the last message is the user prompt and previous are history.
        // Ideally, we'd map roles to Google's format.
        // "system" roles are supported in latest Gemini via system_instruction but
        // let's stick to simple chat.sendMessage or generateContent for now.

        // Simple implementation: concatenating context or using chat.
        // For robust chat:
        const history = req.messages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const lastMessage = req.messages[req.messages.length - 1];
        if (!lastMessage) {
            throw new Error('No messages provided');
        }

        try {
            const chat = model.startChat({
                history: history.length ? history : undefined,
            });

            const result = await chat.sendMessage(lastMessage.content);
            const response = await result.response;
            const text = response.text();

            const latencyMs = Date.now() - start;

            // Extract usage if available (requires newer version or specific model support)
            // Current stable SDK might not expose token usage directly in response object easily without beta API.
            // We'll leave usage undefined unless clearly available.
            let usage = undefined;
            const rawResponse = result.response as any;
            if (rawResponse.usageMetadata) {
                usage = {
                    inputTokens: rawResponse.usageMetadata.promptTokenCount,
                    outputTokens: rawResponse.usageMetadata.candidatesTokenCount,
                    totalTokens: rawResponse.usageMetadata.totalTokenCount
                };
            };

            return {
                outputText: text,
                usage,
                raw: response,
                meta: {
                    provider: 'google',
                    latencyMs
                }
            };

        } catch (error: any) {
            throw new Error(`Google Generation failed: ${error.message}`);
        }
    }
}
