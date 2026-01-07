import { Provider } from './types';
import { GoogleProvider } from './google';
import { AnthropicProvider } from './anthropic';
import { KimiProvider } from './kimi';
import { createLangChainProvider } from './langchain';

export type ProviderName = 'google' | 'openai' | 'anthropic' | 'kimi' | 'langchain-openai' | 'langchain-anthropic' | 'langchain-google';

export interface LangChainProviderOptions {
    enableLangSmith?: boolean;
    projectName?: string;
}

export function getProvider(name: ProviderName, options?: LangChainProviderOptions): Provider {
    switch (name) {
        case 'google':
            return new GoogleProvider();
        case 'anthropic':
            return new AnthropicProvider();
        case 'kimi':
            return new KimiProvider();
        case 'openai':
            // OpenAI uses LangChain provider with OpenAI backend
            return createLangChainProvider('openai', {
                enableLangSmith: options?.enableLangSmith ?? false,
                projectName: options?.projectName
            });
        case 'langchain-openai':
            return createLangChainProvider('openai', {
                enableLangSmith: options?.enableLangSmith ?? true,
                projectName: options?.projectName
            });
        case 'langchain-anthropic':
            return createLangChainProvider('anthropic', {
                enableLangSmith: options?.enableLangSmith ?? true,
                projectName: options?.projectName
            });
        case 'langchain-google':
            return createLangChainProvider('google', {
                enableLangSmith: options?.enableLangSmith ?? true,
                projectName: options?.projectName
            });
        default:
            throw new Error(`Unknown provider: ${name}`);
    }
}
