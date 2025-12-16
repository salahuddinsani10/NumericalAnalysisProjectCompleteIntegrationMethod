import React from 'react';

/**
 * MethodControls - Sliders and toggles for integration methods
 */
export default function MethodControls({
    n,
    onNChange,
    selectedMethods,
    onMethodToggle,
    onAnalyze,
    loading
}) {
    const methods = [
        {
            id: 'trapezoidal',
            name: 'Trapezoidal',
            description: 'O(h²) convergence',
            color: 'from-blue-500 to-cyan-500',
            icon: '📐',
        },
        {
            id: 'midpoint',
            name: 'Midpoint',
            description: 'O(h²) convergence',
            color: 'from-green-500 to-emerald-500',
            icon: '⬜',
        },
        {
            id: 'simpson',
            name: "Simpson's",
            description: 'O(h⁴) convergence',
            color: 'from-purple-500 to-pink-500',
            icon: '🎯',
        },
    ];

    // N slider logarithmic values (powers of 2)
    const nValues = [4, 8, 16, 32, 64, 128, 256, 512, 1024];
    const nIndex = nValues.indexOf(n) !== -1 ? nValues.indexOf(n) : 4;

    const handleSliderChange = (e) => {
        const index = parseInt(e.target.value);
        onNChange(nValues[index]);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Number of Intervals Slider */}
            <div className="glass-card p-5">
                <label className="block text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
                    Number of Intervals (N)
                </label>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-4xl font-bold gradient-text">{n}</span>
                        <span className="text-sm text-slate-500">Step size: h = (b-a)/{n}</span>
                    </div>

                    <input
                        type="range"
                        min="0"
                        max={nValues.length - 1}
                        value={nIndex}
                        onChange={handleSliderChange}
                        className="w-full"
                        disabled={loading}
                    />

                    <div className="flex justify-between text-xs text-slate-500">
                        <span>4</span>
                        <span>16</span>
                        <span>64</span>
                        <span>256</span>
                        <span>1024</span>
                    </div>
                </div>
            </div>

            {/* Method Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
                    Integration Methods
                </label>

                <div className="space-y-3">
                    {methods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => onMethodToggle(method.id)}
                            className={`w-full method-card flex items-center gap-4 ${selectedMethods.includes(method.id) ? 'active' : ''
                                }`}
                            disabled={loading}
                        >
                            <span className="text-2xl">{method.icon}</span>

                            <div className="flex-1 text-left">
                                <div className="font-semibold text-slate-100">{method.name}</div>
                                <div className="text-xs text-slate-500">{method.description}</div>
                            </div>

                            <div className={`w-5 h-5 rounded-md border-2 transition-all duration-300 ${selectedMethods.includes(method.id)
                                    ? `bg-gradient-to-r ${method.color} border-transparent`
                                    : 'border-slate-600'
                                }`}>
                                {selectedMethods.includes(method.id) && (
                                    <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Analyze Button */}
            <button
                onClick={onAnalyze}
                disabled={loading || selectedMethods.length === 0}
                className={`w-full btn-primary flex items-center justify-center gap-3 text-lg ${loading ? 'opacity-60' : ''
                    }`}
            >
                {loading ? (
                    <>
                        <div className="spinner !w-5 !h-5 !border-2"></div>
                        <span>Analyzing...</span>
                    </>
                ) : (
                    <>
                        <span>🚀</span>
                        <span>Run Analysis</span>
                    </>
                )}
            </button>
        </div>
    );
}
