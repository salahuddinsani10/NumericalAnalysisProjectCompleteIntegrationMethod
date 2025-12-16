import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Area,
    ComposedChart,
    ReferenceArea,
} from 'recharts';

/**
 * FunctionPlot - Visualize the function curve and integration approximation
 */
export default function FunctionPlot({ data, method, n }) {
    if (!data || !data.curve) {
        return (
            <div className="chart-container h-80 flex items-center justify-center">
                <p className="text-slate-500">Select a function and run analysis to see the plot</p>
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

    // Generate area shading data based on method
    const areaData = useMemo(() => {
        if (!data.shapes || data.shapes.length === 0) return [];

        return data.shapes.map((shape, idx) => ({
            ...shape,
            idx,
        }));
    }, [data.shapes]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl">
                    <p className="text-indigo-400 font-mono">
                        x = {payload[0].payload.x.toFixed(4)}
                    </p>
                    <p className="text-slate-300 font-mono">
                        f(x) = {payload[0].payload.y.toFixed(6)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-container animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-200">
                    Function Visualization
                </h3>
                <div className="flex items-center gap-2 text-sm">
                    <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: methodColors[method] || '#667eea' }}
                    ></span>
                    <span className="text-slate-400">
                        {methodNames[method] || 'Unknown'} Rule with N={n}
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={data.curve} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                        <linearGradient id="functionGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#667eea" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#667eea" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="methodGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={methodColors[method] || '#667eea'} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={methodColors[method] || '#667eea'} stopOpacity={0.05} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(148, 163, 184, 0.1)"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="x"
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={(v) => v.toFixed(2)}
                        axisLine={{ stroke: '#334155' }}
                    />

                    <YAxis
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={(v) => v.toFixed(2)}
                        axisLine={{ stroke: '#334155' }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />

                    {/* Function area fill */}
                    <Area
                        type="monotone"
                        dataKey="y"
                        stroke="none"
                        fill="url(#functionGradient)"
                    />

                    {/* Function curve */}
                    <Line
                        type="monotone"
                        dataKey="y"
                        stroke="#667eea"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: '#667eea', strokeWidth: 2, stroke: '#fff' }}
                    />
                </ComposedChart>
            </ResponsiveContainer>

            {/* Method Info Card */}
            <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Approximation</p>
                        <p className="text-xl font-bold text-slate-100">
                            {data.approximation?.toFixed(6) || '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Exact Value</p>
                        <p className="text-xl font-bold text-indigo-400">
                            {data.exact_value?.toFixed(6) || '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Error</p>
                        <p className="text-xl font-bold text-amber-400">
                            {data.absolute_error?.toExponential(3) || '—'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
