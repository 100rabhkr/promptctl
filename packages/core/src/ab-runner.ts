import { runEval, EvalResult, RunEvalOptions } from './eval-runner';

export interface ABResult {
    runIdA: string;
    runIdB: string;
    comparison: {
        meanDelta: number; // Mean(B) - Mean(A)
        winRate: number; // Fraction of tests where B > A
        confidenceInterval: [number, number]; // 95% CI for mean delta
    };
    statsA: EvalResult;
    statsB: EvalResult;
}

export interface RunABOptions {
    promptAPath: string;
    promptBPath: string;
    testsPath: string;
    providerName: RunEvalOptions['providerName'];
    modelOverride?: string;
    bootstrapIterations?: number;
}

function bootstrapCI(deltas: number[], iterations: number = 500): [number, number] {
    const means: number[] = [];
    const n = deltas.length;

    if (n === 0) return [0, 0];

    for (let i = 0; i < iterations; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            const idx = Math.floor(Math.random() * n);
            sum += deltas[idx];
        }
        means.push(sum / n);
    }

    means.sort((a, b) => a - b);
    const lower = means[Math.floor(0.025 * iterations)];
    const upper = means[Math.ceil(0.975 * iterations)];

    return [lower, upper];
}

export async function runAB(options: RunABOptions): Promise<ABResult> {
    console.log('Running Eval A...');
    const statsA = await runEval({
        promptPath: options.promptAPath,
        testsPath: options.testsPath,
        providerName: options.providerName,
        modelOverride: options.modelOverride
    });

    console.log('Running Eval B...');
    const statsB = await runEval({
        promptPath: options.promptBPath,
        testsPath: options.testsPath,
        providerName: options.providerName,
        modelOverride: options.modelOverride
    });

    // Align results by Test ID to ensure paired comparison
    // Assuming runEval returns results in the same order as tests loader, but strict mapping is safer.
    const mapA = new Map(statsA.results.map(r => [r.testId, r]));
    const mapB = new Map(statsB.results.map(r => [r.testId, r]));

    const deltas: number[] = [];
    let wins = 0;
    let ties = 0;
    let totalPaired = 0;

    for (const testId of mapA.keys()) {
        if (mapB.has(testId)) {
            const resA = mapA.get(testId)!;
            const resB = mapB.get(testId)!;

            const delta = resB.score - resA.score;
            deltas.push(delta);

            if (resB.score > resA.score) wins++;
            else if (resB.score === resA.score) ties++;

            totalPaired++;
        }
    }

    const meanDelta = deltas.reduce((a, b) => a + b, 0) / (totalPaired || 1);
    const winRate = totalPaired > 0 ? wins / totalPaired : 0;

    // Calculate CI
    const confidenceInterval = bootstrapCI(deltas, options.bootstrapIterations || 500);

    return {
        runIdA: statsA.runId,
        runIdB: statsB.runId,
        comparison: {
            meanDelta,
            winRate,
            confidenceInterval
        },
        statsA,
        statsB
    };
}
