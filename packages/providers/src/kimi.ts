import OpenAI from 'openai';
import { LLMRequest, LLMResponse, Provider } from './types';

// Kimi-K2 uses OpenAI-compatible API
export class KimiProvider implements Provider {
    private client: OpenAI;

    constructor() {
        const apiKey = process.env.KIMI_API_KEY;
        if (!apiKey) {
            throw new Error('KIMI_API_KEY environment variable is required for Kimi provider');
        }
        this.client = new OpenAI({
            apiKey,
            baseURL: 'https://api.moonshot.ai/v1'
        });
    }

    async generate(req: LLMRequest): Promise<LLMResponse> {
        const start = Date.now();

        // Convert messages to OpenAI format
        const messages = req.messages.map(m => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content
        }));

        try {
            const response = await this.client.chat.completions.create({
                model: req.model,
                messages,
                temperature: req.temperature,
                max_tokens: req.maxOutputTokens
            });

            const latencyMs = Date.now() - start;
            const choice = response.choices[0];
            const outputText = choice?.message?.content || '';

            return {
                outputText,
                usage: response.usage ? {
                    inputTokens: response.usage.prompt_tokens,
                    outputTokens: response.usage.completion_tokens,
                    totalTokens: response.usage.total_tokens
                } : undefined,
                raw: response,
                meta: {
                    provider: 'kimi',
                    latencyMs
                }
            };
        } catch (error: any) {
            throw new Error(`Kimi generation failed: ${error.message}`);
        }
    }
}
