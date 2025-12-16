import React, { useState, useEffect } from 'react';

/**
 * HelpGuide - Interactive help overlay with sticky notes
 * Provides context-sensitive explanations for each section
 */

// Help content for each section
const HELP_CONTENT = {
    functionSelector: {
        title: "📚 Function Selector",
        content: `Choose a mathematical function to integrate. Functions are grouped by type:

• **Smooth** - Easy for all methods (Simpson's wins)
• **Trapezoidal Best** - Linear functions where Trapezoidal is exact!
• **Midpoint Best** - Symmetric functions where Midpoint excels
• **Challenging** - Discontinuous functions that test all methods

Each function shows which integration method works best for it.`,
    },
    methodControls: {
        title: "⚙️ Integration Methods",
        content: `Select which numerical methods to compare:

• **Trapezoidal Rule** - Uses trapezoids. O(h²) convergence.
  Best for: Linear functions, piecewise linear
  
• **Midpoint Rule** - Uses rectangles at midpoint. O(h²) convergence.
  Best for: Symmetric functions, some quadratics
  
• **Simpson's Rule** - Uses parabolas. O(h⁴) convergence.
  Best for: Smooth curves, polynomials

**Uncheck a box** to exclude that method from comparison.`,
    },
    nSlider: {
        title: "🔢 Number of Intervals (N)",
        content: `Divide the integration range [a, b] into N equal pieces.

• **N = 4**: Large steps, fast but less accurate
• **N = 1024**: Tiny steps, slow but very accurate

**Step size h = (b - a) / N**
As N increases, error decreases (that's convergence!)

Drag the slider to see how accuracy improves.`,
    },
    visualization: {
        title: "📈 Function Visualization",
        content: `This graph shows:

• **X-axis**: Input values from lower bound (a) to upper bound (b)
• **Y-axis**: Function output f(x) at each point
• **Blue curve**: The function being integrated

The cards below show:
• **APPROXIMATION**: Calculated area using numerical method
• **EXACT VALUE**: True integral from calculus
• **ERROR**: |Approximation - Exact|`,
    },
    convergence: {
        title: "📉 Convergence Plot",
        content: `A log-log plot showing how error decreases as N increases.

• **X-axis**: Number of intervals (N) on log scale
• **Y-axis**: Absolute error on log scale

**Steeper line = faster convergence!**

• Trapezoidal/Midpoint: Slope ≈ -2 (error ÷ 4 when N × 2)
• Simpson's: Slope ≈ -4 (error ÷ 16 when N × 2)

This proves the theoretical O(h²) and O(h⁴) rates!`,
    },
    results: {
        title: "📊 Results Table",
        content: `Detailed numerical comparison:

• **N**: Number of intervals
• **h**: Step size
• **Approx**: Calculated integral value
• **Abs Error**: |Approximate - Exact|
• **Rel Error**: Error as percentage
• **EOC**: Experimental Order of Convergence

**🏆 Winner Badge**: Shows which method has lowest error!`,
    },
    report: {
        title: "📄 Deliverables Report",
        content: `Generate a complete analysis report:

• **Executive Summary**: One-page overview with key findings
• **Detailed Report**: Full mathematical analysis
• **Comparison Tables**: Side-by-side method comparison
• **Conclusions**: Recommendations for method selection

**Print/PDF**: Click the button to save as PDF!`,
    },
    calculator: {
        title: "🧮 Custom Function Calculator",
        content: `Build your own function to integrate:

**Syntax:**
• x**2 → x squared
• sin(x), cos(x), tan(x) → trig functions
• log(x) → natural log
• sqrt(x) → square root
• pi, e → constants

**Tips:**
• Use * for multiplication: 2*x not 2x
• Expression validates in real-time
• Click 📖 Reference for all functions`,
    },
};

// Individual help tooltip component
export function HelpTooltip({ helpKey, position = 'right', children }) {
    const [isOpen, setIsOpen] = useState(false);
    const help = HELP_CONTENT[helpKey];

    if (!help) return children;

    const positionClasses = {
        right: 'left-full ml-2 top-0',
        left: 'right-full mr-2 top-0',
        top: 'bottom-full mb-2 left-0',
        bottom: 'top-full mt-2 left-0',
    };

    return (
        <div className="relative inline-block">
            {children}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="ml-2 w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-500/50 transition-all flex items-center justify-center"
                title="Click for help"
            >
                ?
            </button>

            {isOpen && (
                <div className={`absolute z-50 ${positionClasses[position]} w-80 animate-fade-in`}>
                    <div className="glass-card p-4 shadow-2xl border border-indigo-500/30">
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-indigo-300">{help.title}</h4>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <div className="text-sm text-slate-300 whitespace-pre-line">
                            {help.content.split('\n').map((line, i) => (
                                <p key={i} className={line.startsWith('•') ? 'ml-2' : 'mb-2'}>
                                    {line.split('**').map((part, j) =>
                                        j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
                                    )}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Full-page help overlay
export function HelpOverlay({ onClose }) {
    const [currentStep, setCurrentStep] = useState(0);
    const steps = Object.entries(HELP_CONTENT);

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in">
            <div className="glass-card max-w-2xl w-full mx-4 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>📖</span> User Guide
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-all"
                    >
                        ✕ Close
                    </button>
                </div>

                {/* Progress */}
                <div className="flex gap-1 mb-4">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded ${i === currentStep ? 'bg-indigo-500' : 'bg-slate-700'}`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-indigo-300 mb-3">
                        {steps[currentStep][1].title}
                    </h3>
                    <div className="text-slate-300 whitespace-pre-line leading-relaxed">
                        {steps[currentStep][1].content.split('\n').map((line, i) => (
                            <p key={i} className={`${line.startsWith('•') ? 'ml-4' : ''} ${line.trim() === '' ? 'h-2' : 'mb-1'}`}>
                                {line.split('**').map((part, j) =>
                                    j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
                                )}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                        className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-all"
                    >
                        ← Previous
                    </button>

                    <span className="text-slate-500">
                        {currentStep + 1} / {steps.length}
                    </span>

                    <button
                        onClick={() => {
                            if (currentStep === steps.length - 1) {
                                onClose();
                            } else {
                                setCurrentStep(currentStep + 1);
                            }
                        }}
                        className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 transition-all"
                    >
                        {currentStep === steps.length - 1 ? 'Finish ✓' : 'Next →'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Help button that triggers the overlay
export function HelpButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-2xl shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40"
            title="Open Help Guide"
        >
            ?
        </button>
    );
}

export default { HelpTooltip, HelpOverlay, HelpButton };
