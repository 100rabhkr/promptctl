import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';

function RunsList() {
    const [runs, setRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/runs')
            .then(res => res.json())
            .then(data => {
                setRuns(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading runs...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Executions</h1>
            <div className="card" style={{ overflowX: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Run ID</th>
                            <th>Date</th>
                            <th>Provider/Model</th>
                            <th>Tests</th>
                            <th>Score</th>
                            <th>Total Cost</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {runs.map(run => (
                            <tr key={run.runId}>
                                <td style={{ fontFamily: 'monospace' }}>{run.runId}</td>
                                <td>{new Date(run.ts).toLocaleString()}</td>
                                <td>{run.provider} / {run.model}</td>
                                <td>{run.totalTests}</td>
                                <td>{run.meanScore.toFixed(3)}</td>
                                <td>${run.totalCostUsd.toFixed(6)}</td>
                                <td>
                                    <Link to={`/runs/${run.runId}`} style={{ color: '#2563eb' }}>View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function RunDetail() {
    const { id } = useParams();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/runs/${id}`)
            .then(res => res.json())
            .then(data => {
                setEvents(data);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div>Loading detail...</div>;

    return (
        <div>
            <div style={{ marginBottom: '1rem' }}>
                <Link to="/" style={{ color: '#2563eb' }}>&larr; Back to executions</Link>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Run: {id}</h1>

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Test ID</th>
                            <th>Status</th>
                            <th>Score</th>
                            <th>Tokens (I/O)</th>
                            <th>Latency</th>
                            <th>Cost ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.filter(e => e.testId).map((e, idx) => (
                            <tr key={idx}>
                                <td style={{ fontFamily: 'monospace' }}>{e.testId}</td>
                                <td>
                                    <span className={`badge ${e.ok ? 'badge-green' : 'badge-red'}`}>
                                        {e.ok ? 'PASS' : 'FAIL'}
                                    </span>
                                </td>
                                <td>{e.score}</td>
                                <td>{e.inputTokens} / {e.outputTokens}</td>
                                <td>{e.latencyMs}ms</td>
                                <td>{e.costUsd?.toFixed(6)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <div className="container">
                <nav className="nav">
                    <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
                        Promptctl Dashboard
                    </Link>
                </nav>
                <Routes>
                    <Route path="/" element={<RunsList />} />
                    <Route path="/runs/:id" element={<RunDetail />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
