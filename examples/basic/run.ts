import path from 'path';
import { runEval } from '@promptctl/core';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    const result = await runEval({
        promptPath: path.join(__dirname, 'prompt.md'),
        testsPath: path.join(__dirname, 'tests.json'),
        providerName: 'google'
    });

    console.log('Run completed:', result.runId);
    console.log('Passed:', result.passed, '/', result.totalTests);
    console.log('Mean Score:', result.meanScore);
    console.log('Total Cost:', result.totalCostUsd);
}

main().catch(console.error);
