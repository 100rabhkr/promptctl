import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { createPatch } from 'diff';
import Table from 'cli-table3';
import { runEval, runAB } from '@promptctl/core';
import { ProviderName } from '@promptctl/providers';

const program = new Command();

program
    .name('promptctl')
    .description('CLI for prompt engineering and evaluation')
    .version('0.1.0');

program
    .command('init')
    .description('Initialize a new promptctl project')
    .action(() => {
        const cwd = process.cwd();
        const dirs = ['.promptctl', 'prompts', 'tests'];

        dirs.forEach(dir => {
            const fullPath = path.join(cwd, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath);
                console.log(chalk.green(`Created directory: ${dir}`));
            } else {
                console.log(chalk.yellow(`Directory already exists: ${dir}`));
            }
        });

        // Create sample prompt
        const samplePromptPath = path.join(cwd, 'prompts', 'sample.md');
        if (!fs.existsSync(samplePromptPath)) {
            const content = `---
name: sample-joke
model: gemini-1.5-flash
temperature: 0.7
---
Tell me a joke about {{topic}}.
`;
            fs.writeFileSync(samplePromptPath, content);
            console.log(chalk.green('Created sample prompt: prompts/sample.md'));
        }

        // Create sample tests
        const sampleTestsPath = path.join(cwd, 'tests', 'sample.json');
        if (!fs.existsSync(sampleTestsPath)) {
            const content = JSON.stringify([
                {
                    id: 'test-1',
                    input: { topic: 'cats' },
                    assert: [{ type: 'contains', value: 'cat' }]
                },
                {
                    id: 'test-2',
                    input: { topic: 'programming' },
                    assert: [{ type: 'contains', value: 'bug' }]
                }
            ], null, 2);
            fs.writeFileSync(sampleTestsPath, content);
            console.log(chalk.green('Created sample tests: tests/sample.json'));
        }
    });

program
    .command('diff')
    .description('Compare two files')
    .argument('<a>', 'First file')
    .argument('<b>', 'Second file')
    .option('--semantic', 'Use semantic diff (AI-based)')
    .action((a, b, options) => {
        if (options.semantic) {
            console.log(chalk.blue('Semantic diff not implemented yet'));
            return;
        }

        try {
            const contentA = fs.readFileSync(a, 'utf-8');
            const contentB = fs.readFileSync(b, 'utf-8');

            const patch = createPatch(path.basename(a), contentA, contentB);
            console.log(patch);
        } catch (e: any) {
            console.error(chalk.red(`Error reading files: ${e.message}`));
            process.exit(1);
        }
    });

program
    .command('eval')
    .description('Run evaluation for a prompt')
    .argument('<promptFile>', 'Path to prompt file')
    .requiredOption('--tests <testsFile>', 'Path to tests file')
    .option('--provider <provider>', 'LLM Provider (google)', 'google')
    .option('--model <model>', 'Model override')
    .action(async (promptFile, options) => {
        try {
            const promptPath = path.resolve(process.cwd(), promptFile);
            const testsPath = path.resolve(process.cwd(), options.tests);

            console.log(chalk.bold('Running Evaluation...'));

            const result = await runEval({
                promptPath,
                testsPath,
                providerName: options.provider as ProviderName,
                modelOverride: options.model
            });

            console.log('\n');

            const table = new Table({
                head: ['Test ID', 'Pass', 'Score', 'Latency (ms)', 'Tokens', 'Cost ($)'],
                style: { head: ['cyan'] }
            });

            result.results.forEach(r => {
                table.push([
                    r.testId,
                    r.pass ? chalk.green('PASS') : chalk.red('FAIL'),
                    r.score,
                    r.latencyMs,
                    r.tokens?.total || '-',
                    r.costUsd?.toFixed(6) || '-'
                ]);
            });

            console.log(table.toString());

            console.log('\n' + chalk.bold('Summary'));
            console.log(`Run ID:      ${result.runId}`);
            console.log(`Log File:    ${result.runFilePath}`);
            console.log(`Passed:      ${result.passed}/${result.totalTests}`);
            console.log(`Mean Score:  ${result.meanScore.toFixed(2)}`);
            console.log(`Total Cost:  $${result.totalCostUsd.toFixed(6)}`);

            if (result.failed > 0) process.exit(1);

        } catch (e: any) {
            console.error(chalk.red(`Eval failed: ${e.message}`));
            process.exit(1);
        }
    });

program
    .command('ab')
    .description('Run A/B testing between two prompts')
    .argument('<promptA>', 'Path to prompt A')
    .argument('<promptB>', 'Path to prompt B')
    .requiredOption('--tests <testsFile>', 'Path to tests file')
    .option('--provider <provider>', 'LLM Provider (google)', 'google')
    .option('--model <model>', 'Model override')
    .action(async (promptA, promptB, options) => {
        try {
            const promptAPath = path.resolve(process.cwd(), promptA);
            const promptBPath = path.resolve(process.cwd(), promptB);
            const testsPath = path.resolve(process.cwd(), options.tests);

            console.log(chalk.bold('Running A/B Test...'));

            const result = await runAB({
                promptAPath,
                promptBPath,
                testsPath,
                providerName: options.provider as ProviderName,
                modelOverride: options.model
            });

            console.log('\n' + chalk.bold('A/B Results'));
            console.log('------------------------------------------------');

            const ci = result.comparison.confidenceInterval;
            const ciStr = `[${ci[0].toFixed(3)}, ${ci[1].toFixed(3)}]`;

            // Formatting helpers
            const fmtScore = (s: number) => s.toFixed(3);
            const colorDelta = (d: number) => d > 0 ? chalk.green(`+${fmtScore(d)}`) : d < 0 ? chalk.red(fmtScore(d)) : chalk.gray(fmtScore(d));

            const table = new Table({
                head: ['', 'Prompt A', 'Prompt B', 'Delta (B-A)'],
                colWidths: [15, 20, 20, 20]
            });

            table.push(
                ['Score', fmtScore(result.statsA.meanScore), fmtScore(result.statsB.meanScore), colorDelta(result.comparison.meanDelta)],
                ['Pass Rate', `${result.statsA.passed}/${result.statsA.totalTests}`, `${result.statsB.passed}/${result.statsB.totalTests}`, '-'],
                ['Cost ($)', result.statsA.totalCostUsd.toFixed(6), result.statsB.totalCostUsd.toFixed(6), (result.statsB.totalCostUsd - result.statsA.totalCostUsd).toFixed(6)]
            );

            console.log(table.toString());

            console.log(`\nWin Rate (B > A): ${chalk.yellow((result.comparison.winRate * 100).toFixed(1) + '%')}`);
            console.log(`95% CI on Delta:  ${ciStr}`);

            if (ci[0] > 0) console.log(chalk.green('Result: B is significantly better than A'));
            else if (ci[1] < 0) console.log(chalk.red('Result: B is significantly worse than A'));
            else console.log(chalk.gray('Result: No significant difference'));

        } catch (e: any) {
            console.error(chalk.red(`A/B Eval failed: ${e.message}`));
            process.exit(1);
        }
    });

import { startDashboard } from '@promptctl/dashboard';

program
    .command('dashboard')
    .description('Start the local dashboard')
    .option('-p, --port <number>', 'Port to run on', '3000')
    .action((options) => {
        startDashboard(process.cwd(), parseInt(options.port));
    });

program.parse();
