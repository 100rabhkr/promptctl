import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { Client } from 'langsmith';
import { LangChainTracer } from 'langchain/callbacks';
import { LLMRequest, LLMResponse, Provider } from './types';

export type LangChainModelType = 'openai' | 'anthropic' | 'google';

export interface LangChainConfig {
    modelType: LangChainModelType;
    enableLangSmith?: boolean;
    langSmithProjectName?: string;
}

export class LangChainProvider implements Provider {
    private config: LangChainConfig;
    private langSmithClient?: Client;
    private tracer?: LangChainTracer;

    constructor(config: LangChainConfig) {
        this.config = config;

        // Initialize LangSmith if enabled
        if (config.enableLangSmith) {
            const langSmithApiKey = process.env.LANGSMITH_API_KEY;
            if (!langSmithApiKey) {
                console.warn('LANGSMITH_API_KEY not set. LangSmith tracing disabled.');
            } else {
                this.langSmithClient = new Client({
                    apiKey: langSmithApiKey,
                    apiUrl: process.env.LANGSMITH_ENDPOINT || 'https://api.smith.langchain.com'
                });
                this.tracer = new LangChainTracer({
                    projectName: config.langSmithProjectName || 'promptctl-evals',
                    client: this.langSmithClient as any
                });
            }
        }
    }

    private createModel(req: LLMRequest) {
        const commonConfig = {
            temperature: req.temperature,
            maxTokens: req.maxOutputTokens
        };

        switch (this.config.modelType) {
            case 'openai':
                const openaiKey = process.env.OPENAI_API_KEY;
                if (!openaiKey) {
                    throw new Error('OPENAI_API_KEY required for LangChain OpenAI provider');
                }
                return new ChatOpenAI({
                    modelName: req.model,
                    openAIApiKey: openaiKey,
                    ...commonConfig
                });

            case 'anthropic':
                const anthropicKey = process.env.ANTHROPIC_API_KEY;
                if (!anthropicKey) {
                    throw new Error('ANTHROPIC_API_KEY required for LangChain Anthropic provider');
                }
                return new ChatAnthropic({
                    modelName: req.model,
                    anthropicApiKey: anthropicKey,
                    ...commonConfig
                });

            case 'google':
                const googleKey = process.env.GOOGLE_API_KEY;
                if (!googleKey) {
                    throw new Error('GOOGLE_API_KEY required for LangChain Google provider');
                }
                return new ChatGoogleGenerativeAI({
                    modelName: req.model,
                    apiKey: googleKey,
                    ...commonConfig
                });

            default:
                throw new Error(`Unknown LangChain model type: ${this.config.modelType}`);
        }
    }

    private convertMessages(messages: LLMRequest['messages']): BaseMessage[] {
        return messages.map(m => {
            switch (m.role) {
                case 'system':
                    return new SystemMessage(m.content);
                case 'user':
                    return new HumanMessage(m.content);
                case 'assistant':
                    return new AIMessage(m.content);
                default:
                    return new HumanMessage(m.content);
            }
        });
    }

    async generate(req: LLMRequest): Promise<LLMResponse> {
        const start = Date.now();
        const model = this.createModel(req);
        const messages = this.convertMessages(req.messages);

        try {
            const callbacks = this.tracer ? [this.tracer] : undefined;
            const response = await model.invoke(messages, { callbacks });

            const latencyMs = Date.now() - start;
            const outputText = typeof response.content === 'string'
                ? response.content
                : JSON.stringify(response.content);

            // Extract usage metadata if available
            const usageMetadata = (response as any).usage_metadata || (response as any).response_metadata?.usage;
            let usage = undefined;
            if (usageMetadata) {
                usage = {
                    inputTokens: usageMetadata.input_tokens || usageMetadata.prompt_tokens,
                    outputTokens: usageMetadata.output_tokens || usageMetadata.completion_tokens,
                    totalTokens: usageMetadata.total_tokens
                };
            }

            return {
                outputText,
                usage,
                raw: response,
                meta: {
                    provider: `langchain-${this.config.modelType}`,
                    latencyMs
                }
            };
        } catch (error: any) {
            throw new Error(`LangChain generation failed: ${error.message}`);
        }
    }

    // Helper to get LangSmith client for custom evaluations
    getLangSmithClient(): Client | undefined {
        return this.langSmithClient;
    }
}

// Factory function for easier instantiation
export function createLangChainProvider(
    modelType: LangChainModelType,
    options?: { enableLangSmith?: boolean; projectName?: string }
): LangChainProvider {
    return new LangChainProvider({
        modelType,
        enableLangSmith: options?.enableLangSmith ?? true,
        langSmithProjectName: options?.projectName
    });
}
