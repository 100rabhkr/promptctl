import Anthropic from '@anthropic-ai/sdk';
import { LLMRequest, LLMResponse, Provider } from './types';

export class AnthropicProvider implements Provider {
    private client: Anthropic;

    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable is required for Anthropic provider');
        }
        this.client = new Anthropic({ apiKey });
    }

    async generate(req: LLMRequest): Promise<LLMResponse> {
        const start = Date.now();

        // Extract system message
        const systemMessage = req.messages.find(m => m.role === 'system');
        const nonSystemMessages = req.messages.filter(m => m.role !== 'system');

        // Convert messages to Anthropic format
        const messages = nonSystemMessages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
        }));

        try {
            const response = await this.client.messages.create({
                model: req.model,
                max_tokens: req.maxOutputTokens || 4096,
                temperature: req.temperature,
                system: systemMessage?.content,
                messages
            });

            const latencyMs = Date.now() - start;

            // Extract text from response
            const outputText = response.content
                .filter(block => block.type === 'text')
                .map(block => (block as { type: 'text'; text: string }).text)
                .join('');

            return {
                outputText,
                usage: {
                    inputTokens: response.usage.input_tokens,
                    outputTokens: response.usage.output_tokens,
                    totalTokens: response.usage.input_tokens + response.usage.output_tokens
                },
                raw: response,
                meta: {
                    provider: 'anthropic',
                    latencyMs
                }
            };
        } catch (error: any) {
            throw new Error(`Anthropic generation failed: ${error.message}`);
        }
    }
}
