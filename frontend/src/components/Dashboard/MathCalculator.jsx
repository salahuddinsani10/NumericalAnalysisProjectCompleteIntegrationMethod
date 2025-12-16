import React, { useState, useCallback, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

/**
 * MathCalculator - Premium Interactive Calculator UI
 * With real-time validation and function reference
 */
export default function MathCalculator({ onExpressionChange, onSubmit, loading }) {
    const [expression, setExpression] = useState('');
    const [isValid, setIsValid] = useState(true);
    const [validationMessage, setValidationMessage] = useState('');
    const [showReference, setShowReference] = useState(false);

    // Valid function patterns
    const validPatterns = {
        functions: ['sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'abs'],
        operators: ['+', '-', '*', '/', '**', '^'],
        constants: ['pi', 'e', 'x'],
    };

    // Validate expression in real-time
    const validateExpression = useCallback((expr) => {
        if (!expr.trim()) {
            setIsValid(true);
            setValidationMessage('');
            return true;
        }

        // Check for common issues
        let normalized = expr
            .replace(/\^/g, '**')
            .replace(/π/g, 'pi')
            .replace(/(\d)([a-zA-Z])/g, '$1*$2') // 2x -> 2*x
            .replace(/([a-zA-Z])(\d)/g, '$1*$2'); // x2 -> x*2

        // Check balanced parentheses
        let parenCount = 0;
        for (let char of normalized) {
            if (char === '(') parenCount++;
            if (char === ')') parenCount--;
            if (parenCount < 0) {
                setIsValid(false);
                setValidationMessage('Unbalanced parentheses - extra closing )');
                return false;
            }
        }
        if (parenCount > 0) {
            setIsValid(false);
            setValidationMessage(`Missing ${parenCount} closing parenthesis`);
            return false;
        }

        // Check for invalid patterns
        const invalidPatterns = [
            { pattern: /\*\*\*/, message: 'Invalid operator: ***' },
            { pattern: /\/\//, message: 'Invalid operator: //' },
            { pattern: /\+\+/, message: 'Invalid operator: ++' },
            { pattern: /--/, message: 'Use - for subtraction' },
            { pattern: /\*\*$/, message: 'Power needs an exponent' },
            { pattern: /\($/, message: 'Empty parentheses' },
            { pattern: /^\)/, message: 'Expression cannot start with )' },
            { pattern: /\(\)/, message: 'Empty parentheses ()' },
        ];

        for (let { pattern, message } of invalidPatterns) {
            if (pattern.test(normalized)) {
                setIsValid(false);
                setValidationMessage(message);
                return false;
            }
        }

        // All checks passed
        setIsValid(true);
        setValidationMessage('✓ Valid expression');
        return true;
    }, []);

    // Update validation when expression changes
    useEffect(() => {
        validateExpression(expression);
    }, [expression, validateExpression]);

    // Insert text at end
    const insertText = useCallback((text) => {
        const newExpression = expression + text;
        setExpression(newExpression);
        if (onExpressionChange) {
            onExpressionChange(newExpression);
        }
    }, [expression, onExpressionChange]);

    // Handle backspace
    const handleBackspace = () => {
        const newExpression = expression.slice(0, -1);
        setExpression(newExpression);
        if (onExpressionChange) {
            onExpressionChange(newExpression);
        }
    };

    // Clear all
    const handleClear = () => {
        setExpression('');
        setIsValid(true);
        setValidationMessage('');
        if (onExpressionChange) {
            onExpressionChange('');
        }
    };

    // Handle submit
    const handleSubmit = () => {
        if (!expression.trim()) {
            setValidationMessage('Please enter an expression');
            setIsValid(false);
            return;
        }
        if (!isValid) {
            return;
        }
        if (onSubmit) {
            // Normalize the expression before sending to backend
            const normalized = normalizeForBackend(expression);
            onSubmit(normalized);
        }
    };

    // Normalize expression for backend submission
    const normalizeForBackend = (expr) => {
        if (!expr) return '';
        let result = expr
            .replace(/\^/g, '**'); // ^ to **

        // Add implicit multiplication: 2x -> 2*x, but NOT x**2 -> x***2
        // Handle number followed by letter (not part of function name)
        result = result.replace(/(\d)([a-zA-Z])/g, '$1*$2'); // 2x -> 2*x

        // Handle letter followed by number, but NOT **number
        result = result.replace(/([a-zA-Z])(\d)(?![*])/g, (match, letter, digit, offset, str) => {
            // Check if previous chars were **
            if (offset >= 2 && str.slice(offset - 2, offset) === '**') {
                return match; // Don't change x**2
            }
            return `${letter}*${digit}`;
        });

        // Handle parentheses multiplication
        result = result.replace(/\)\(/g, ')*('); // )( -> )*(
        result = result.replace(/(\d)\(/g, '$1*('); // 2( -> 2*(
        result = result.replace(/\)(\d)/g, ')*$1'); // )2 -> )*2

        return result;
    };

    // Convert expression to LaTeX for preview
    const getLatexPreview = (expr) => {
        if (!expr) return 'f(x) = ?';
        try {
            // First normalize the expression
            let latex = expr
                .replace(/\^/g, '**'); // Convert ^ to **

            // Handle powers properly - convert x**2 to x^{2}
            // This regex ensures we capture the entire exponent (single digit or multi-digit or expression in parens)
            latex = latex.replace(/\*\*\(([^)]+)\)/g, '^{($1)}'); // x**(expr) -> x^{(expr)}
            latex = latex.replace(/\*\*(\d+)/g, '^{$1}'); // x**2 -> x^{2}
            latex = latex.replace(/\*\*([a-z])/g, '^{$1}'); // x**n -> x^{n}

            // Handle functions
            latex = latex
                .replace(/sqrt\(([^)]*)\)/g, '\\sqrt{$1}')
                .replace(/sin\(/g, '\\sin(')
                .replace(/cos\(/g, '\\cos(')
                .replace(/tan\(/g, '\\tan(')
                .replace(/log\(/g, '\\ln(')
                .replace(/exp\(([^)]*)\)/g, 'e^{$1}')
                .replace(/abs\(([^)]*)\)/g, '|$1|')
                .replace(/pi/g, '\\pi')
                .replace(/\*/g, ' \\cdot ');

            return `f(x) = ${latex}`;
        } catch {
            return `f(x) = ${expr}`;
        }
    };

    // Normalize expression for backend (add implicit multiplication, etc)
    const normalizeExpression = (expr) => {
        if (!expr) return '';
        return expr
            .replace(/\^/g, '**') // ^ to **
            .replace(/(\d)([a-zA-Z])/g, '$1*$2') // 2x -> 2*x
            .replace(/([a-zA-Z])(\d)(?!\*)/g, (match, p1, p2, offset, str) => {
                // Only add * if next char is not * (to avoid x**2 becoming x*2)
                // Check if this is part of a ** operator
                const nextTwo = str.slice(offset + 2, offset + 4);
                if (nextTwo.startsWith('*')) return match; // It's x**2, keep as is
                return `${p1}*${p2}`; // x2 -> x*2
            })
            .replace(/\)\(/g, ')*(') // )(  -> )*(
            .replace(/(\d)\(/g, '$1*(') // 2( -> 2*(
            .replace(/\)(\d)/g, ')*$1') // )2 -> )*2
            .replace(/\)([a-zA-Z])/g, ')*$1') // )x -> )*x
            .replace(/([a-zA-Z])\(/g, (match, p1) => {
                // Don't add * before function calls
                const funcs = ['sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'abs'];
                // This is a simple check - just return the match if it looks like a function
                return match;
            });
    };

    // Function reference data
    const functionReference = [
        { syntax: 'sin(x)', desc: 'Sine function', example: 'sin(x)' },
        { syntax: 'cos(x)', desc: 'Cosine function', example: 'cos(2*x)' },
        { syntax: 'tan(x)', desc: 'Tangent function', example: 'tan(x)' },
        { syntax: 'log(x)', desc: 'Natural logarithm', example: 'log(x+1)' },
        { syntax: 'exp(x)', desc: 'Exponential (eˣ)', example: 'exp(-x)' },
        { syntax: 'sqrt(x)', desc: 'Square root', example: 'sqrt(1+x)' },
        { syntax: 'abs(x)', desc: 'Absolute value', example: 'abs(x-1)' },
        { syntax: 'x**n', desc: 'Power (x to n)', example: 'x**3' },
        { syntax: 'pi', desc: 'π ≈ 3.14159', example: 'sin(pi*x)' },
        { syntax: 'e', desc: 'e ≈ 2.71828', example: 'e**x' },
    ];

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    <span className="text-2xl">🧮</span> Function Builder
                </h3>
                <button
                    onClick={() => setShowReference(!showReference)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${showReference
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                        : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
                        }`}
                >
                    {showReference ? '✕ Hide' : '📖 Reference'}
                </button>
            </div>

            {/* Function Reference Panel */}
            {showReference && (
                <div className="glass-card p-4 border-l-4 border-indigo-500 animate-fade-in">
                    <h4 className="font-semibold text-slate-200 mb-3 text-sm uppercase tracking-wider">
                        Available Functions & Syntax
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {functionReference.map((ref) => (
                            <button
                                key={ref.syntax}
                                onClick={() => insertText(ref.example)}
                                className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all text-left"
                            >
                                <code className="text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">
                                    {ref.syntax}
                                </code>
                                <span className="text-slate-500 text-xs">{ref.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Calculator Card */}
            <div className="glass-card overflow-hidden">
                {/* Display Area - Fixed Height, Scrollable */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 border-b border-slate-700/50">
                    {/* LaTeX Preview */}
                    <div className="min-h-[70px] max-h-[100px] overflow-auto flex items-center justify-center mb-4 bg-slate-950/50 rounded-xl p-4 border border-slate-700/30">
                        <span className="text-2xl text-slate-100 break-all text-center" style={{ wordBreak: 'break-word' }}>
                            <InlineMath math={getLatexPreview(expression)} />
                        </span>
                    </div>

                    {/* Text Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={expression}
                            onChange={(e) => {
                                setExpression(e.target.value);
                                if (onExpressionChange) {
                                    onExpressionChange(e.target.value);
                                }
                            }}
                            placeholder="Type or use buttons: x**2 + sin(x)"
                            className={`w-full bg-slate-800/80 border-2 rounded-xl p-4 font-mono text-lg text-slate-100 placeholder-slate-500 transition-all ${expression && !isValid
                                ? 'border-red-500/50 focus:border-red-500'
                                : expression && isValid
                                    ? 'border-green-500/50 focus:border-green-500'
                                    : 'border-slate-600/50 focus:border-indigo-500'
                                }`}
                            disabled={loading}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            <button
                                onClick={handleBackspace}
                                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all text-lg"
                                title="Backspace"
                            >
                                ⌫
                            </button>
                            <button
                                onClick={handleClear}
                                className="p-2 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-300 transition-all font-bold"
                                title="Clear All"
                            >
                                AC
                            </button>
                        </div>
                    </div>

                    {/* Validation Message */}
                    {validationMessage && (
                        <div className={`mt-2 text-sm font-medium ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                            {validationMessage}
                        </div>
                    )}
                </div>

                {/* Calculator Buttons Grid */}
                <div className="p-4 bg-slate-800/30">
                    {/* Quick Presets Row */}
                    <div className="mb-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Quick Start</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: 'x²', value: 'x**2' },
                                { label: 'x³', value: 'x**3' },
                                { label: '√x', value: 'sqrt(x)' },
                                { label: 'sin(x)', value: 'sin(x)' },
                                { label: 'cos(x)', value: 'cos(x)' },
                                { label: 'eˣ', value: 'exp(x)' },
                                { label: 'ln(x)', value: 'log(x)' },
                                { label: '1/x', value: '1/x' },
                            ].map((preset) => (
                                <button
                                    key={preset.value}
                                    onClick={() => {
                                        setExpression(preset.value);
                                        if (onExpressionChange) onExpressionChange(preset.value);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 border border-slate-500/30 text-slate-200 font-medium hover:from-slate-600 hover:to-slate-500 transition-all active:scale-95 shadow-lg"
                                    disabled={loading}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Button Grid */}
                    <div className="grid grid-cols-6 gap-2">
                        {/* Numbers */}
                        {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.'].map((num) => (
                            <button
                                key={num}
                                onClick={() => insertText(num)}
                                className="p-4 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 text-slate-100 font-mono text-xl font-bold hover:from-slate-600 hover:to-slate-700 transition-all active:scale-95 shadow-lg"
                                disabled={loading}
                            >
                                {num}
                            </button>
                        ))}

                        {/* Variable X - Special styling */}
                        <button
                            onClick={() => insertText('x')}
                            className="p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 border border-emerald-500/50 text-white font-mono text-xl font-bold hover:from-emerald-500 hover:to-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                            disabled={loading}
                        >
                            x
                        </button>

                        {/* Operators */}
                        {[
                            { label: '+', value: '+' },
                            { label: '−', value: '-' },
                            { label: '×', value: '*' },
                            { label: '÷', value: '/' },
                            { label: 'xʸ', value: '**' },
                            { label: '(', value: '(' },
                            { label: ')', value: ')' },
                        ].map((op) => (
                            <button
                                key={op.label}
                                onClick={() => insertText(op.value)}
                                className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-500/50 text-white font-bold text-lg hover:from-blue-500 hover:to-blue-600 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                                disabled={loading}
                            >
                                {op.label}
                            </button>
                        ))}

                        {/* Empty cell for grid alignment */}
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>

                    {/* Functions Row */}
                    <div className="mt-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Functions</p>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { label: 'sin', value: 'sin(' },
                                { label: 'cos', value: 'cos(' },
                                { label: 'tan', value: 'tan(' },
                                { label: 'log', value: 'log(' },
                                { label: 'exp', value: 'exp(' },
                                { label: '√', value: 'sqrt(' },
                                { label: '|x|', value: 'abs(' },
                                { label: ')', value: ')' },
                            ].map((func) => (
                                <button
                                    key={func.label}
                                    onClick={() => insertText(func.value)}
                                    className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 border border-purple-500/50 text-white font-semibold hover:from-purple-500 hover:to-purple-600 transition-all active:scale-95 shadow-lg shadow-purple-500/20"
                                    disabled={loading}
                                >
                                    {func.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Constants Row */}
                    <div className="mt-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Constants</p>
                        <div className="grid grid-cols-4 gap-2">
                            <button
                                onClick={() => insertText('pi')}
                                className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400/50 text-white font-bold text-xl hover:from-amber-400 hover:to-orange-500 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                                disabled={loading}
                            >
                                π
                            </button>
                            <button
                                onClick={() => insertText('e')}
                                className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400/50 text-white font-bold text-xl hover:from-amber-400 hover:to-orange-500 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                                disabled={loading}
                            >
                                e
                            </button>
                            <button
                                onClick={() => insertText('2')}
                                className="p-3 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 border border-slate-500/50 text-white font-bold hover:from-slate-500 hover:to-slate-600 transition-all active:scale-95"
                                disabled={loading}
                            >
                                ²
                            </button>
                            <button
                                onClick={() => insertText('3')}
                                className="p-3 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 border border-slate-500/50 text-white font-bold hover:from-slate-500 hover:to-slate-600 transition-all active:scale-95"
                                disabled={loading}
                            >
                                ³
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="p-4 bg-slate-900/50 border-t border-slate-700/50">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !expression.trim() || !isValid}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${loading || !expression.trim() || !isValid
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-100'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <span>🚀</span>
                                <span>Analyze This Function</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Syntax Tips Card */}
            <div className="glass-card p-4 text-sm">
                <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <span>💡</span> Syntax Tips
                </h4>
                <div className="grid grid-cols-2 gap-3 text-slate-400">
                    <div className="flex items-center gap-2">
                        <code className="bg-slate-800 px-2 py-0.5 rounded text-indigo-400">x**2</code>
                        <span>→ x squared</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <code className="bg-slate-800 px-2 py-0.5 rounded text-indigo-400">2*x</code>
                        <span>→ 2 times x</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <code className="bg-slate-800 px-2 py-0.5 rounded text-indigo-400">sin(x)</code>
                        <span>→ sine of x</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <code className="bg-slate-800 px-2 py-0.5 rounded text-indigo-400">sqrt(x)</code>
                        <span>→ √x</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
