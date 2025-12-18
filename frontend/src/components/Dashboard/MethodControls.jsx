import React, { useState } from 'react';

/**
 * MethodControls - Sliders and toggles for integration methods
 * Updated with custom N value input and vibrant colors
 */
export default function MethodControls({
    n,
    onNChange,
    selectedMethods,
    onMethodToggle,
    onAnalyze,
    loading
}) {
    const [customN, setCustomN] = useState(n.toString());
    const [showCustomInput, setShowCustomInput] = useState(false);

    const methods = [
        {
            id: 'trapezoidal',
            name: 'Trapezoidal',
            description: 'O(h²) convergence',
            color: 'from-orange-500 to-amber-500',
            activeColor: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-400',
            icon: '🔶',
        },
        {
            id: 'midpoint',
            name: 'Midpoint',
            description: 'O(h²) convergence',
            color: 'from-teal-500 to-cyan-500',
            activeColor: 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-teal-400',
            icon: '⬜',
        },
        {
            id: 'simpson',
            name: "Simpson's",
            description: 'O(h⁴) convergence',
            color: 'from-rose-500 to-pink-500',
            activeColor: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 border-rose-400',
            icon: '🎯',
        },
    ];

    // Quick preset N values
    const presetValues = [4, 8, 16, 32, 64, 128, 256, 512, 1024];

    const handleCustomNChange = (e) => {
        const value = e.target.value;
        setCustomN(value);

        const num = parseInt(value);
        if (!isNaN(num) && num >= 1 && num <= 1024) {
            onNChange(num);
        }
    };

    const handlePresetClick = (value) => {
        setCustomN(value.toString());
        onNChange(value);
        setShowCustomInput(false);
    };

    const handleCustomNBlur = () => {
        // Validate and clamp on blur
        let num = parseInt(customN);
        if (isNaN(num) || num < 1) num = 1;
        if (num > 1024) num = 1024;
        setCustomN(num.toString());
        onNChange(num);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Number of Intervals */}
            <div className="glass-card p-5">
                <label className="block text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
                    Number of Intervals (N)
                </label>

                <div className="space-y-4">
                    {/* Current Value Display */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl font-bold gradient-text-warm">{n}</span>
                            <button
                                onClick={() => setShowCustomInput(!showCustomInput)}
                                className="text-xs px-3 py-1 rounded-full bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300 transition-all"
                            >
                                {showCustomInput ? 'Use Presets' : 'Custom Value'}
                            </button>
                        </div>
                        <span className="text-sm text-slate-500">h = (b-a)/{n}</span>
                    </div>

                    {/* Custom Input Mode */}
                    {showCustomInput ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="1024"
                                    value={customN}
                                    onChange={handleCustomNChange}
                                    onBlur={handleCustomNBlur}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCustomNBlur()}
                                    className="input-field w-full text-center text-2xl font-bold"
                                    placeholder="Enter N (1-1024)"
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-slate-500 text-center">
                                Enter any value from 1 to 1024
                            </p>
                        </div>
                    ) : (
                        /* Preset Buttons Mode */
                        <div className="grid grid-cols-3 gap-2">
                            {presetValues.map((value) => (
                                <button
                                    key={value}
                                    onClick={() => handlePresetClick(value)}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${n === value
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300'
                                        }`}
                                    disabled={loading}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    )}
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
                            className={`w-full method-card flex items-center gap-4 ${selectedMethods.includes(method.id) ? method.activeColor : ''
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
                className={`w-full btn-primary-warm flex items-center justify-center gap-3 text-lg ${loading ? 'opacity-60' : ''
                    }`}
            >
                {loading ? (
                    <>
                        <div className="spinner-warm !w-5 !h-5 !border-2"></div>
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

