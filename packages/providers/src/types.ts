export interface LLMMessage {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

export interface LLMRequest {
    model: string;
    messages: LLMMessage[];
    temperature?: number;
    maxOutputTokens?: number;
}

export interface LLMUsage {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
}

export interface LLMMeta {
    provider: string;
    latencyMs: number;
}

export interface LLMResponse {
    outputText: string;
    usage?: LLMUsage;
    raw?: any;
    meta: LLMMeta;
}

export interface Provider {
    generate(req: LLMRequest): Promise<LLMResponse>;
}
