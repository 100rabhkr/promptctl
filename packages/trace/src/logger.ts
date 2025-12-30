import fs from 'fs';
import path from 'path';
import { TraceEvent } from './types';

export interface RunInfo {
    runId: string;
    filePath: string;
}

export function createRun(runDir: string = '.promptctl/runs'): RunInfo {
    const resolvedRunDir = path.resolve(process.cwd(), runDir);

    // Ensure directory exists
    if (!fs.existsSync(resolvedRunDir)) {
        fs.mkdirSync(resolvedRunDir, { recursive: true });
    }

    // Basic run ID generation
    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const filePath = path.join(resolvedRunDir, `${runId}.jsonl`);

    // Create empty file
    fs.writeFileSync(filePath, '');

    return { runId, filePath };
}

export function appendEvent(runFilePath: string, event: TraceEvent): void {
    // Ensure we append a newline
    const line = JSON.stringify(event) + '\n';
    fs.appendFileSync(runFilePath, line);
}
