import React, { useRef } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Deliverables - Page displaying report, summary, and comparison tables
 */
export default function Deliverables({ analysisData, selectedFunction, bounds }) {
    const reportRef = useRef(null);

    if (!analysisData || !analysisData.results) {
        return (
            <div className="glass-card p-8 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2">No Analysis Data</h3>
                <p className="text-slate-400">Run an analysis first to generate deliverables.</p>
            </div>
        );
    }

    const methods = Object.keys(analysisData.results);
    const methodNames = {
        trapezoidal: 'Trapezoidal Rule',
        midpoint: 'Midpoint Rule',
        simpson: "Simpson's Rule",
    };

    // Calculate summary statistics
    const getSummaryStats = (method) => {
        const results = analysisData.results[method];
        if (!results || results.length === 0) return null;

        const eocValues = results.filter(r => r.eoc !== null).map(r => r.eoc);
        const avgEoc = eocValues.length > 0
            ? (eocValues.reduce((a, b) => a + b, 0) / eocValues.length)
            : null;

        return {
            finalError: results[results.length - 1].abs_error,
            finalN: results[results.length - 1].n,
            avgEoc,
            firstError: results[0].abs_error,
            errorReduction: results[0].abs_error / results[results.length - 1].abs_error,
        };
    };

    const handlePrint = () => {
        window.print();
    };

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold gradient-text">📑 Project Deliverables</h2>
                <button
                    onClick={handlePrint}
                    className="btn-primary flex items-center gap-2"
                >
                    <span>🖨️</span>
                    <span>Print / Export PDF</span>
                </button>
            </div>

            {/* Printable Content */}
            <div ref={reportRef} className="space-y-6 print:space-y-4">

                {/* === ONE-PAGE SUMMARY === */}
                <section className="glass-card p-6 print:break-after-page">
                    <div className="border-b border-slate-700/50 pb-4 mb-6">
                        <h3 className="text-2xl font-bold text-slate-100 text-center">
                            Numerical Integration Methods Comparison
                        </h3>
                        <p className="text-center text-slate-400 mt-2">One-Page Executive Summary</p>
                        <p className="text-center text-slate-500 text-sm">{currentDate}</p>
                    </div>

                    {/* Function Being Analyzed */}
                    <div className="mb-6 p-4 bg-slate-800/50 rounded-xl text-center">
                        <p className="text-sm text-slate-500 mb-2">Function Analyzed</p>
                        <div className="text-3xl text-slate-100">
                            <InlineMath math={`f(x) = ${selectedFunction?.latex || 'custom'}`} />
                        </div>
                        <p className="text-slate-400 mt-2">
                            Integration bounds: [{bounds?.a?.toFixed(4)}, {bounds?.b?.toFixed(4)}]
                        </p>
                    </div>

                    {/* Key Findings */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
                            <p className="text-sm text-slate-500 uppercase tracking-wider">Exact Value</p>
                            <p className="text-2xl font-bold text-indigo-400 font-mono">
                                {analysisData.exact_value?.toFixed(10)}
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
                            <p className="text-sm text-slate-500 uppercase tracking-wider">Best Method</p>
                            <p className="text-2xl font-bold text-amber-400">
                                🏆 {methodNames[analysisData.winner]}
                            </p>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left p-3 text-slate-400">Method</th>
                                    <th className="text-center p-3 text-slate-400">Final Error (N=1024)</th>
                                    <th className="text-center p-3 text-slate-400">Average EOC</th>
                                    <th className="text-center p-3 text-slate-400">Theoretical EOC</th>
                                    <th className="text-center p-3 text-slate-400">Error Reduction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {methods.map((method) => {
                                    const stats = getSummaryStats(method);
                                    return (
                                        <tr key={method} className="border-b border-slate-800">
                                            <td className="p-3 font-semibold text-slate-200">
                                                {methodNames[method]}
                                                {analysisData.winner === method && ' 🏆'}
                                            </td>
                                            <td className="p-3 text-center font-mono text-amber-400">
                                                {stats?.finalError?.toExponential(4)}
                                            </td>
                                            <td className="p-3 text-center font-mono text-blue-400">
                                                {stats?.avgEoc?.toFixed(2) || '—'}
                                            </td>
                                            <td className="p-3 text-center font-mono text-slate-400">
                                                {method === 'simpson' ? '4.0' : '2.0'}
                                            </td>
                                            <td className="p-3 text-center font-mono text-green-400">
                                                {stats?.errorReduction?.toFixed(0)}×
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Key Conclusions */}
                    <div className="p-4 bg-slate-800/30 rounded-xl">
                        <h4 className="font-semibold text-slate-200 mb-2">Key Conclusions</h4>
                        <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                            <li>Simpson's Rule achieves O(h⁴) convergence, significantly outperforming other methods</li>
                            <li>Trapezoidal and Midpoint rules show similar O(h²) convergence rates</li>
                            <li>All methods converge to the exact value as N increases</li>
                            <li>For smooth functions, Simpson's Rule provides the best accuracy-to-effort ratio</li>
                        </ul>
                    </div>
                </section>

                {/* === DETAILED REPORT === */}
                <section className="glass-card p-6 print:break-after-page">
                    <h3 className="text-xl font-bold text-slate-100 mb-6 border-b border-slate-700/50 pb-4">
                        📊 Detailed Analysis Report
                    </h3>

                    {/* 1. Introduction */}
                    <div className="mb-8">
                        <h4 className="text-lg font-semibold text-indigo-400 mb-3">1. Introduction</h4>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            This report compares three numerical integration methods: the Trapezoidal Rule,
                            Midpoint Rule, and Simpson's Rule. These methods approximate definite integrals
                            by dividing the integration interval into subintervals and using geometric shapes
                            (trapezoids, rectangles, or parabolas) to estimate the area under the curve.
                        </p>
                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <p className="text-sm text-slate-400 mb-2">The integral being evaluated:</p>
                            <div className="text-center text-xl">
                                <BlockMath math={`\\int_{${bounds?.a?.toFixed(2)}}^{${bounds?.b?.toFixed(2)}} ${selectedFunction?.latex || 'f(x)'} \\, dx = ${analysisData.exact_value?.toFixed(10)}`} />
                            </div>
                        </div>
                    </div>

                    {/* 2. Methods Description */}
                    <div className="mb-8">
                        <h4 className="text-lg font-semibold text-indigo-400 mb-3">2. Numerical Methods</h4>

                        <div className="space-y-4">
                            <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                <h5 className="font-semibold text-blue-400 mb-2">Trapezoidal Rule</h5>
                                <div className="text-center mb-2">
                                    <InlineMath math="T_n = \frac{h}{2}\left[f(a) + 2\sum_{i=1}^{n-1}f(x_i) + f(b)\right]" />
                                </div>
                                <p className="text-sm text-slate-400">
                                    Error: O(h²) — Uses linear interpolation between points
                                </p>
                            </div>

                            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                <h5 className="font-semibold text-green-400 mb-2">Midpoint Rule</h5>
                                <div className="text-center mb-2">
                                    <InlineMath math="M_n = h\sum_{i=0}^{n-1}f\left(x_i + \frac{h}{2}\right)" />
                                </div>
                                <p className="text-sm text-slate-400">
                                    Error: O(h²) — Evaluates function at midpoint of each subinterval
                                </p>
                            </div>

                            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                <h5 className="font-semibold text-purple-400 mb-2">Simpson's Rule</h5>
                                <div className="text-center mb-2">
                                    <InlineMath math="S_n = \frac{h}{3}\left[f(a) + 4\sum_{odd}f(x_i) + 2\sum_{even}f(x_i) + f(b)\right]" />
                                </div>
                                <p className="text-sm text-slate-400">
                                    Error: O(h⁴) — Uses quadratic interpolation over pairs of subintervals
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3. Experimental Order of Convergence */}
                    <div className="mb-8">
                        <h4 className="text-lg font-semibold text-indigo-400 mb-3">3. Convergence Analysis</h4>
                        <p className="text-slate-300 mb-4">
                            The Experimental Order of Convergence (EOC) measures how fast the error decreases as N doubles:
                        </p>
                        <div className="text-center mb-4">
                            <BlockMath math="EOC = \frac{\ln(E_1 / E_2)}{\ln(n_2 / n_1)}" />
                        </div>
                        <p className="text-slate-400 text-sm">
                            A higher EOC indicates faster convergence. Theoretically, Trapezoidal and Midpoint
                            should yield EOC ≈ 2, while Simpson's should yield EOC ≈ 4.
                        </p>
                    </div>
                </section>

                {/* === DETAILED DATA TABLES === */}
                <section className="glass-card p-6 print:break-after-page">
                    <h3 className="text-xl font-bold text-slate-100 mb-6 border-b border-slate-700/50 pb-4">
                        📋 Complete Data Tables
                    </h3>

                    {methods.map((method) => (
                        <div key={method} className="mb-8">
                            <h4 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
                                {methodNames[method]}
                                {analysisData.winner === method && <span className="text-amber-400">🏆</span>}
                            </h4>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="p-2 text-left text-slate-400">N</th>
                                            <th className="p-2 text-left text-slate-400">Step Size (h)</th>
                                            <th className="p-2 text-left text-slate-400">Approximation</th>
                                            <th className="p-2 text-left text-slate-400">Absolute Error</th>
                                            <th className="p-2 text-left text-slate-400">Relative Error</th>
                                            <th className="p-2 text-left text-slate-400">EOC</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysisData.results[method].map((row, idx) => (
                                            <tr key={idx} className="border-b border-slate-800/50">
                                                <td className="p-2 font-mono text-indigo-400">{row.n}</td>
                                                <td className="p-2 font-mono text-slate-300">{row.h?.toExponential(4)}</td>
                                                <td className="p-2 font-mono text-slate-300">{row.approx?.toFixed(10)}</td>
                                                <td className="p-2 font-mono text-amber-400">{row.abs_error?.toExponential(6)}</td>
                                                <td className="p-2 font-mono text-slate-400">{(row.rel_error * 100)?.toFixed(8)}%</td>
                                                <td className="p-2 font-mono text-blue-400">{row.eoc?.toFixed(4) || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </section>

                {/* === CONCLUSIONS === */}
                <section className="glass-card p-6">
                    <h3 className="text-xl font-bold text-slate-100 mb-6 border-b border-slate-700/50 pb-4">
                        📝 Conclusions & Recommendations
                    </h3>

                    <div className="space-y-4 text-slate-300">
                        <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                            <h4 className="font-semibold text-green-400 mb-2">✅ Key Findings</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>All three methods converge to the exact value as N increases</li>
                                <li>Simpson's Rule demonstrates superior O(h⁴) convergence rate</li>
                                <li>Trapezoidal and Midpoint rules show similar O(h²) performance</li>
                                <li>For the tested function, {methodNames[analysisData.winner]} achieved the lowest error</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <h4 className="font-semibold text-indigo-400 mb-2">💡 Recommendations</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li><strong>For smooth functions:</strong> Use Simpson's Rule for best accuracy</li>
                                <li><strong>For quick estimates:</strong> Midpoint Rule offers simplicity with reasonable accuracy</li>
                                <li><strong>For oscillatory functions:</strong> Higher N values may be needed</li>
                                <li><strong>For functions with singularities:</strong> Consider adaptive methods</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h4 className="font-semibold text-slate-200 mb-2">📚 References</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
                                <li>Burden, R. L., & Faires, J. D. (2010). Numerical Analysis. Brooks/Cole.</li>
                                <li>Atkinson, K. E. (1989). An Introduction to Numerical Analysis. Wiley.</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          body { background: white !important; }
          .glass-card { 
            background: white !important; 
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
          }
          .gradient-text { 
            background: none !important;
            -webkit-text-fill-color: #1f2937 !important;
          }
          .btn-primary { display: none !important; }
          * { color: #1f2937 !important; }
          .text-indigo-400, .text-blue-400, .text-green-400, .text-amber-400, .text-purple-400 {
            color: #1f2937 !important;
          }
        }
      `}</style>
        </div>
    );
}
