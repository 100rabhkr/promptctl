export interface TraceEvent {
    ts: number;
    runId: string;
    provider: string;
    model: string;
    promptId?: string;
    testId?: string;
    latencyMs: number;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    costUsd?: number;
    estimatedTokens?: number;
    score?: number;
    ok: boolean;
    error?: string;
}
