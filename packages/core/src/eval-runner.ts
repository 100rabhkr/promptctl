import { loadPrompt } from './prompt-loader';
import { loadTests } from './test-loader';
import { evaluateAssertion } from './assertions';
import { getProvider, ProviderName, LLMRequest, LLMMessage } from '@promptctl/providers';
import { createRun, appendEvent, computeCostUsd, TraceEvent } from '@promptctl/trace';

export interface EvalResult {
    runId: string;
    runFilePath: string;
    totalTests: number;
    passed: number;
    failed: number;
    meanScore: number;
    totalCostUsd: number;
    totalLatencyMs: number;
    totalTokens: {
        input: number;
        output: number;
        total: number;
    };
    results: TestResult[];
}

export interface TestResult {
    testId: string;
    pass: boolean;
    score: number;
    reason?: string;
    outputText: string;
    latencyMs: number;
    costUsd?: number;
    tokens?: {
        input: number;
        output: number;
        total: number;
    };
}

export interface RunEvalOptions {
    promptPath: string;
    testsPath: string;
    providerName: ProviderName;
    modelOverride?: string;
}

function renderPrompt(promptBody: string, input: any): { system: string; user: string } {
    let system = promptBody;

    // Replace {{key}} placeholders if input is an object
    if (typeof input === 'object' && input !== null) {
        for (const [key, value] of Object.entries(input)) {
            // Simple global replacement
            // Using split/join for simple replacement without regex escaping issues
            system = system.split(`{{${key}}}`).join(String(value));
        }
    } else {
        // If input is a string, maybe replace {{input}}? 
        // The spec didn't strictly say, but good for robustness.
        system = system.split(`{{input}}`).join(String(input));
    }

    const user = `INPUT:\n${JSON.stringify(input, null, 2)}`;

    return { system, user };
}

export async function runEval(options: RunEvalOptions): Promise<EvalResult> {
    const prompt = await loadPrompt(options.promptPath);
    const tests = await loadTests(options.testsPath);
    const provider = getProvider(options.providerName);

    const model = options.modelOverride || prompt.model || 'google-gemini-1.5-flash'; // Fallback default

    const { runId, filePath: runFilePath } = createRun();

    const results: TestResult[] = [];
    let totalScore = 0;
    let totalLatencyMs = 0;
    let totalCostUsd = 0;
    let tokens = { input: 0, output: 0, total: 0 };

    console.log(`Starting eval run ${runId} with ${tests.length} tests...`);
    console.log(`Prompt: ${options.promptPath}`);
    console.log(`Model: ${model}`);

    for (const test of tests) {
        const { system, user } = renderPrompt(prompt.body, test.input);

        const messages: LLMMessage[] = [
            { role: 'system', content: system },
            { role: 'user', content: user }
        ];

        const req: LLMRequest = {
            model,
            messages,
            temperature: prompt.temperature,
            maxOutputTokens: prompt.maxOutputTokens,
        };

        let response;
        let errorStr: string | undefined;

        try {
            response = await provider.generate(req);
        } catch (e: any) {
            errorStr = e.message;
            // Synthesize a failed response
            response = {
                outputText: '',
                meta: { provider: options.providerName, latencyMs: 0 },
                usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
            };
        }

        // Evaluate assertions
        let testPassed = true;
        let testScore = 0; // Default if no assertions? Or 1 if no assertions fail?
        // User requirement: "Evaluate assertion and compute score... score should be 1 if pass else 0"
        // If multiple assertions, how to aggregate?
        // "score" typically is 0-1.
        // Let's perform all assertions. Pass if ALL pass.
        // Score = average of assertion scores? Or all-or-nothing?
        // Let's do: Pass if all pass. Score = 1 if all pass, 0 otherwise. 
        // Wait, let's look at `evaluateAssertion` return. It returns a score.
        // If there are assertions, we calculate metrics.

        let failureReason: string | undefined;

        if (errorStr) {
            testPassed = false;
            testScore = 0;
            failureReason = `Provider error: ${errorStr}`;
        } else if (test.assert && test.assert.length > 0) {
            let passedCount = 0;
            for (const assertion of test.assert) {
                const res = evaluateAssertion(response.outputText, assertion);
                if (!res.pass) {
                    testPassed = false;
                    failureReason = failureReason ? `${failureReason}; ${res.reason}` : res.reason;
                } else {
                    passedCount++;
                }
            }
            // If any failed, score is 0? Or partial?
            // requirement: "score should be 1 if pass else 0" (singular assertion context)
            // For the test case, typically 0 or 1 is easier.
            testScore = testPassed ? 1 : 0;
        } else {
            // If no assertions, default to pass/1 for successful generation? 
            // Usually "eval" implies checking something.
            // But let's assume pass if no error.
            testPassed = true;
            testScore = 1;
        }

        // Calc stats
        const tCost = computeCostUsd(
            options.providerName,
            model,
            response.usage?.inputTokens || 0,
            response.usage?.outputTokens || 0
        ) || 0;

        totalCostUsd += tCost;
        totalLatencyMs += response.meta.latencyMs;
        tokens.input += response.usage?.inputTokens || 0;
        tokens.output += response.usage?.outputTokens || 0;
        tokens.total += response.usage?.totalTokens || 0;
        totalScore += testScore;

        const testRes: TestResult = {
            testId: test.id,
            pass: testPassed,
            score: testScore,
            reason: failureReason,
            outputText: response.outputText,
            latencyMs: response.meta.latencyMs,
            costUsd: tCost,
            tokens: response.usage ? {
                input: response.usage.inputTokens || 0,
                output: response.usage.outputTokens || 0,
                total: response.usage.totalTokens || 0
            } : undefined
        };

        results.push(testRes);

        // Trace event
        const traceEvent: TraceEvent = {
            ts: Date.now(),
            runId,
            provider: options.providerName,
            model,
            promptId: prompt.name || options.promptPath,
            testId: test.id,
            latencyMs: response.meta.latencyMs,
            inputTokens: response.usage?.inputTokens,
            outputTokens: response.usage?.outputTokens,
            totalTokens: response.usage?.totalTokens,
            costUsd: tCost,
            score: testScore,
            ok: testPassed,
            error: errorStr || failureReason
        };

        appendEvent(runFilePath, traceEvent);
    }

    return {
        runId,
        runFilePath,
        totalTests: tests.length,
        passed: results.filter(r => r.pass).length,
        failed: results.filter(r => !r.pass).length,
        meanScore: results.length > 0 ? totalScore / results.length : 0,
        totalCostUsd,
        totalLatencyMs,
        totalTokens: tokens,
        results
    };
}
