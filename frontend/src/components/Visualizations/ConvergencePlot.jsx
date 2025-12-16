import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

/**
 * ConvergencePlot - Log-Log plot showing Error vs N for convergence analysis
 */
export default function ConvergencePlot({ analysisData }) {
    if (!analysisData || !analysisData.results) {
        return (
            <div className="chart-container h-96 flex items-center justify-center">
                <p className="text-slate-500">Run analysis to see convergence plot</p>
            </div>
        );
    }

    const methodColors = {
        trapezoidal: '#3b82f6',
        midpoint: '#10b981',
        simpson: '#a855f7',
    };

    const methodNames = {
        trapezoidal: 'Trapezoidal',
        midpoint: 'Midpoint',
        simpson: "Simpson's",
    };

    // Transform data for the chart (log scale)
    const chartData = [];
    const methods = Object.keys(analysisData.results);

    if (methods.length > 0) {
        const firstMethod = methods[0];
        analysisData.results[firstMethod].forEach((result, idx) => {
            const point = {
                n: result.n,
                h: result.h,
                log_n: Math.log10(result.n),
                log_h: Math.log10(result.h),
            };

            methods.forEach((method) => {
                const methodResult = analysisData.results[method][idx];
                if (methodResult) {
                    point[`${method}_error`] = methodResult.abs_error;
                    point[`${method}_log_error`] = methodResult.abs_error > 0 ? Math.log10(methodResult.abs_error) : -16;
                    point[`${method}_eoc`] = methodResult.eoc;
                }
            });

            chartData.push(point);
        });
    }

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-xl min-w-[200px]">
                    <p className="text-slate-400 mb-2 font-medium">
                        N = {data.n} (h = {data.h.toExponential(3)})
                    </p>
                    {payload.map((entry, idx) => {
                        const method = entry.dataKey.replace('_log_error', '');
                        return (
                            <div key={idx} className="flex items-center gap-2 text-sm my-1">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                ></span>
                                <span className="text-slate-300">{methodNames[method]}:</span>
                                <span className="font-mono text-slate-100">
                                    {data[`${method}_error`]?.toExponential(4) || '—'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    // Custom legend
    const CustomLegend = ({ payload }) => {
        return (
            <div className="flex justify-center gap-6 mt-4">
                {payload.map((entry, idx) => {
                    const method = entry.dataKey.replace('_log_error', '');
                    return (
                        <div key={idx} className="flex items-center gap-2">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            ></span>
                            <span className="text-sm text-slate-300">{methodNames[method]}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="chart-container animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-200">
                    Error Convergence (Log-Log Plot)
                </h3>
                <div className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
                    log₁₀(Error) vs log₁₀(N)
                </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(148, 163, 184, 0.1)"
                    />

                    <XAxis
                        dataKey="log_n"
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        label={{
                            value: 'log₁₀(N)',
                            position: 'bottom',
                            offset: 0,
                            fill: '#94a3b8',
                        }}
                        axisLine={{ stroke: '#334155' }}
                        tickFormatter={(v) => v.toFixed(1)}
                    />

                    <YAxis
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        label={{
                            value: 'log₁₀(Error)',
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#94a3b8',
                        }}
                        axisLine={{ stroke: '#334155' }}
                        tickFormatter={(v) => v.toFixed(1)}
                        domain={['auto', 'auto']}
                    />

                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />

                    {methods.map((method) => (
                        <Line
                            key={method}
                            type="monotone"
                            dataKey={`${method}_log_error`}
                            stroke={methodColors[method]}
                            strokeWidth={3}
                            dot={{ r: 5, fill: methodColors[method], strokeWidth: 2, stroke: '#1e293b' }}
                            activeDot={{ r: 8, strokeWidth: 3, stroke: '#fff' }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>

            {/* Theoretical rates info */}
            <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-3">
                    <strong className="text-slate-300">Theoretical Convergence Rates:</strong>
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <p className="text-xs text-blue-400">Trapezoidal</p>
                        <p className="text-lg font-bold text-blue-300">O(h²)</p>
                    </div>
                    <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                        <p className="text-xs text-green-400">Midpoint</p>
                        <p className="text-lg font-bold text-green-300">O(h²)</p>
                    </div>
                    <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <p className="text-xs text-purple-400">Simpson's</p>
                        <p className="text-lg font-bold text-purple-300">O(h⁴)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
