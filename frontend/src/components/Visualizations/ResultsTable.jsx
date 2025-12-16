import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

/**
 * ResultsTable - Data grid displaying convergence analysis results
 */
export default function ResultsTable({ analysisData, selectedMethods }) {
    const [activeMethod, setActiveMethod] = useState(selectedMethods[0] || 'trapezoidal');

    if (!analysisData || !analysisData.results) {
        return (
            <div className="chart-container h-64 flex items-center justify-center">
                <p className="text-slate-500">Run analysis to see detailed results</p>
            </div>
        );
    }

    const methodColors = {
        trapezoidal: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400' },
        midpoint: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400' },
        simpson: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400' },
    };

    const methodNames = {
        trapezoidal: 'Trapezoidal',
        midpoint: 'Midpoint',
        simpson: "Simpson's",
    };

    const results = analysisData.results[activeMethod] || [];

    // Calculate average EOC (excluding null values)
    const eocValues = results.filter((r) => r.eoc !== null).map((r) => r.eoc);
    const avgEoc = eocValues.length > 0
        ? (eocValues.reduce((a, b) => a + b, 0) / eocValues.length).toFixed(2)
        : '—';

    return (
        <div className="animate-fade-in">
            {/* Winner Badge */}
            {analysisData.winner && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🏆</span>
                            <div>
                                <p className="text-sm text-amber-400 uppercase tracking-wider">Best Method</p>
                                <p className="text-xl font-bold text-amber-300">
                                    {methodNames[analysisData.winner]} Rule
                                </p>
                            </div>
                        </div>

                        {analysisData.improvements && Object.keys(analysisData.improvements).length > 0 && (
                            <div className="text-right">
                                {Object.entries(analysisData.improvements).map(([method, ratio]) => (
                                    <p key={method} className="text-sm text-slate-400">
                                        <span className="text-amber-300 font-bold">{ratio.toFixed(0)}×</span> more accurate than {methodNames[method]}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Method Tabs */}
            <div className="flex gap-2 mb-4">
                {selectedMethods.map((method) => (
                    <button
                        key={method}
                        onClick={() => setActiveMethod(method)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${activeMethod === method
                                ? `${methodColors[method].bg} ${methodColors[method].border} border ${methodColors[method].text}`
                                : 'bg-slate-800/50 text-slate-400 hover:text-slate-300'
                            }`}
                    >
                        {methodNames[method]}
                    </button>
                ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-xl ${methodColors[activeMethod].bg} border ${methodColors[activeMethod].border}`}>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Exact Value</p>
                    <p className="text-xl font-bold text-slate-100 font-mono">
                        {analysisData.exact_value?.toFixed(8) || '—'}
                    </p>
                </div>
                <div className={`p-4 rounded-xl ${methodColors[activeMethod].bg} border ${methodColors[activeMethod].border}`}>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Average EOC</p>
                    <p className="text-xl font-bold text-slate-100 font-mono">
                        {avgEoc}
                    </p>
                </div>
                <div className={`p-4 rounded-xl ${methodColors[activeMethod].bg} border ${methodColors[activeMethod].border}`}>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Final Error</p>
                    <p className="text-xl font-bold text-slate-100 font-mono">
                        {results[results.length - 1]?.abs_error?.toExponential(3) || '—'}
                    </p>
                </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>N</th>
                            <th>Step Size (h)</th>
                            <th>Approximation</th>
                            <th>Absolute Error</th>
                            <th>Relative Error</th>
                            <th>EOC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, idx) => (
                            <tr key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                                <td className="font-mono font-bold text-indigo-400">{row.n}</td>
                                <td className="font-mono text-slate-300">{row.h?.toExponential(4)}</td>
                                <td className="font-mono text-slate-300">{row.approx?.toFixed(10)}</td>
                                <td className="font-mono text-amber-400">{row.abs_error?.toExponential(6)}</td>
                                <td className="font-mono text-slate-400">{(row.rel_error * 100)?.toFixed(6)}%</td>
                                <td className={`font-mono font-bold ${row.eoc !== null
                                        ? row.eoc >= 3.5 ? 'text-purple-400' : 'text-blue-400'
                                        : 'text-slate-600'
                                    }`}>
                                    {row.eoc !== null ? row.eoc.toFixed(2) : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-slate-500">
                    <strong className="text-slate-400">EOC</strong> (Experimental Order of Convergence) =
                    <InlineMath math="\frac{\ln(E_1/E_2)}{\ln(n_2/n_1)}" />
                    {' '}— Measures how fast error decreases. Expected: ~2 for Trapezoidal/Midpoint, ~4 for Simpson's.
                </p>
            </div>
        </div>
    );
}
