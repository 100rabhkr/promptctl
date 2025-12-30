import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { globSync } from 'glob';

export function startDashboard(cwd: string, port: number = 3000) {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // API Routes
    app.get('/api/runs', (_req, res) => {
        try {
            const runsDir = path.join(cwd, '.promptctl/runs');
            if (!fs.existsSync(runsDir)) {
                return res.json([]);
            }

            const files = globSync('*.jsonl', { cwd: runsDir });
            const runs: any[] = [];

            for (const file of files) {
                // Read file to parse events
                // Optimization: read start/end or stream. 
                // For simplicity, read all now.
                const content = fs.readFileSync(path.join(runsDir, file), 'utf-8');
                const lines = content.trim().split('\n');

                let runId = '';
                let provider = '';
                let model = '';
                let timestamp = 0;
                let totalCost = 0;
                let totalScore = 0;
                let testsCount = 0;

                lines.forEach(line => {
                    if (!line) return;
                    try {
                        const event = JSON.parse(line);
                        if (!runId) runId = event.runId;
                        if (!provider) provider = event.provider;
                        if (!model) model = event.model;
                        if (!timestamp) timestamp = event.ts;

                        if (event.testId) {
                            testsCount++;
                            totalCost += (event.costUsd || 0);
                            totalScore += (event.score || 0);
                        }
                    } catch (e) { }
                });

                runs.push({
                    runId,
                    ts: timestamp,
                    provider,
                    model,
                    totalCostUsd: totalCost,
                    meanScore: testsCount ? totalScore / testsCount : 0,
                    totalTests: testsCount,
                    fileName: file
                });
            }

            // Sort by newest first
            runs.sort((a, b) => b.ts - a.ts);
            res.json(runs);
        } catch (e: any) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/runs/:id', (req, res) => {
        try {
            const runId = req.params.id;
            // Note: we store by runId.jsonl or search for it? 
            // The logger creates `${runId}.jsonl`.
            const runsDir = path.join(cwd, '.promptctl/runs');
            const filePath = path.join(runsDir, `${runId}.jsonl`);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'Run not found' });
            }

            const events: any[] = [];
            const content = fs.readFileSync(filePath, 'utf-8');
            content.trim().split('\n').forEach(line => {
                if (line) events.push(JSON.parse(line));
            });

            res.json(events);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    // Serve static files (React app)
    // Assuming this code runs from dist/index.js, client is in dist/client
    const clientPath = path.join(__dirname, '../client');
    if (fs.existsSync(clientPath)) {
        app.use(express.static(clientPath));
        app.get('*', (req, res) => {
            if (req.path.startsWith('/api')) return res.status(404);
            res.sendFile(path.join(clientPath, 'index.html'));
        });
    } else {
        app.get('/', (_req, res) => {
            res.send('Dashboard server running. Frontend not found (did you build? path: ' + clientPath + ')');
        });
    }

    app.listen(port, () => {
        console.log(`Dashboard running at http://localhost:${port}`);
    });
}
