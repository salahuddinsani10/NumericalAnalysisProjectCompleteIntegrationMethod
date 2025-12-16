import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

/**
 * FunctionSelector - Dropdown to select test functions with LaTeX rendering
 * Shows best method badge and description for each function
 */
export default function FunctionSelector({
    functions,
    selectedFunction,
    onSelectFunction,
    bounds,
    onBoundsChange,
    loading
}) {
    // Group functions by category
    const groupedFunctions = functions.reduce((acc, func) => {
        if (!acc[func.category]) {
            acc[func.category] = [];
        }
        acc[func.category].push(func);
        return acc;
    }, {});

    const categoryColors = {
        'Smooth': 'from-green-500 to-emerald-600',
        'Mild Curvature': 'from-blue-500 to-cyan-600',
        'Turning Points': 'from-purple-500 to-pink-600',
        'Trapezoidal Best': 'from-orange-500 to-amber-600',
        'Midpoint Best': 'from-teal-500 to-cyan-600',
        'Challenging': 'from-red-500 to-rose-600',
    };

    const methodColors = {
        'trapezoidal': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
        'midpoint': 'bg-teal-500/20 text-teal-300 border-teal-500/50',
        'simpson': 'bg-pink-500/20 text-pink-300 border-pink-500/50',
    };

    const methodLabels = {
        'trapezoidal': '🔶 Trap',
        'midpoint': '⬜ Mid',
        'simpson': '🎯 Simp',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Function Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
                    Select Function
                </label>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(groupedFunctions).map(([category, funcs]) => (
                        <div key={category} className="space-y-2">
                            <div className={`text-xs font-semibold px-2 py-1 rounded-md inline-block bg-gradient-to-r ${categoryColors[category] || 'from-slate-500 to-slate-600'} text-white`}>
                                {category}
                            </div>

                            {funcs.map((func) => (
                                <button
                                    key={func.id}
                                    onClick={() => onSelectFunction(func)}
                                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${selectedFunction?.id === func.id
                                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/50 border shadow-lg shadow-indigo-500/20'
                                        : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/80'
                                        }`}
                                    disabled={loading}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-lg text-slate-100">
                                            <InlineMath math={func.latex} />
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {/* Best Method Badge */}
                                            {func.best_method && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${methodColors[func.best_method]}`}>
                                                    {methodLabels[func.best_method]}
                                                </span>
                                            )}
                                            {selectedFunction?.id === func.id && (
                                                <span className="text-indigo-400">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Description */}
                                    {func.description && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {func.description}
                                        </p>
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Integration Bounds */}
            <div className="glass-card p-5">
                <label className="block text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
                    Integration Bounds
                </label>

                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-xs text-slate-500 mb-1">Lower (a)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={bounds.a}
                            onChange={(e) => onBoundsChange({ ...bounds, a: parseFloat(e.target.value) || 0 })}
                            className="input-field w-full"
                            disabled={loading}
                        />
                    </div>

                    <div className="text-slate-500 text-2xl pt-5">→</div>

                    <div className="flex-1">
                        <label className="block text-xs text-slate-500 mb-1">Upper (b)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={bounds.b}
                            onChange={(e) => onBoundsChange({ ...bounds, b: parseFloat(e.target.value) || 0 })}
                            className="input-field w-full"
                            disabled={loading}
                        />
                    </div>
                </div>

                {selectedFunction && (
                    <button
                        onClick={() => onBoundsChange({ a: selectedFunction.default_a, b: selectedFunction.default_b })}
                        className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        disabled={loading}
                    >
                        Reset to default bounds
                    </button>
                )}
            </div>
        </div>
    );
}
