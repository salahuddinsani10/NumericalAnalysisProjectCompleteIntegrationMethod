import React, { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

// Components
import FunctionSelector from './components/Dashboard/FunctionSelector';
import MethodControls from './components/Dashboard/MethodControls';
import MathCalculator from './components/Dashboard/MathCalculator';
import FunctionPlot from './components/Visualizations/FunctionPlot';
import ConvergencePlot from './components/Visualizations/ConvergencePlot';
import ResultsTable from './components/Visualizations/ResultsTable';
import Deliverables from './components/Deliverables/Deliverables';
import { HelpOverlay, HelpButton } from './components/Help/HelpGuide';

// API
import { getFunctions, calculate, analyze } from './services/api';

function App() {
  // State
  const [functions, setFunctions] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [customExpression, setCustomExpression] = useState('');
  const [useCustomFunction, setUseCustomFunction] = useState(false);
  const [bounds, setBounds] = useState({ a: 0, b: Math.PI });
  const [n, setN] = useState(64);
  const [selectedMethods, setSelectedMethods] = useState(['trapezoidal', 'midpoint', 'simpson']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Results
  const [calculateData, setCalculateData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [activeTab, setActiveTab] = useState('visualization');
  const [sidebarMode, setSidebarMode] = useState('preset'); // 'preset' or 'custom'

  // Load functions on mount
  useEffect(() => {
    loadFunctions();
  }, []);

  const loadFunctions = async () => {
    try {
      const data = await getFunctions();
      setFunctions(data.functions);
      if (data.functions.length > 0) {
        const defaultFunc = data.functions[0];
        setSelectedFunction(defaultFunc);
        setBounds({ a: defaultFunc.default_a, b: defaultFunc.default_b });
      }
    } catch (err) {
      setError('Failed to load functions. Is the backend running?');
      console.error(err);
    }
  };

  const handleFunctionSelect = (func) => {
    setSelectedFunction(func);
    setUseCustomFunction(false);
    setBounds({ a: func.default_a, b: func.default_b });
    setCalculateData(null);
    setAnalysisData(null);
  };

  const handleCustomExpressionChange = (expr) => {
    setCustomExpression(expr);
  };

  const handleCustomFunctionSubmit = async (expr) => {
    // Directly run analysis with the submitted expression
    if (!expr || selectedMethods.length === 0) return;

    setCustomExpression(expr);
    setUseCustomFunction(true);
    setSelectedFunction({
      id: null,
      name: expr,
      latex: expr.replace(/\*\*/g, '^').replace(/\*/g, ' \\cdot '),
      category: 'Custom',
    });

    // Run analysis immediately with the expression
    setLoading(true);
    setError(null);
    setCalculateData(null);
    setAnalysisData(null);

    try {
      const requestBase = { custom_expression: expr };

      // Get visualization data for the first selected method
      const calcResponse = await calculate({
        ...requestBase,
        method: selectedMethods[0],
        a: bounds.a,
        b: bounds.b,
        n: n,
      });
      setCalculateData(calcResponse);

      // Get full convergence analysis
      const analyzeResponse = await analyze({
        ...requestBase,
        methods: selectedMethods,
        a: bounds.a,
        b: bounds.b,
        n_values: [4, 8, 16, 32, 64, 128, 256, 512, 1024],
      });
      setAnalysisData(analyzeResponse);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please check your expression.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodToggle = (method) => {
    setSelectedMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const handleAnalyze = async () => {
    if ((!selectedFunction && !customExpression) || selectedMethods.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const requestBase = useCustomFunction
        ? { custom_expression: customExpression }
        : { function_id: selectedFunction.id };

      // Get visualization data for the first selected method
      const calcResponse = await calculate({
        ...requestBase,
        method: selectedMethods[0],
        a: bounds.a,
        b: bounds.b,
        n: n,
      });
      setCalculateData(calcResponse);

      // Get full convergence analysis
      const analyzeResponse = await analyze({
        ...requestBase,
        methods: selectedMethods,
        a: bounds.a,
        b: bounds.b,
        n_values: [4, 8, 16, 32, 64, 128, 256, 512, 1024],
      });
      setAnalysisData(analyzeResponse);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'visualization', label: 'Function Plot', icon: '📈' },
    { id: 'convergence', label: 'Convergence', icon: '📉' },
    { id: 'results', label: 'Results', icon: '📊' },
    { id: 'deliverables', label: 'Report', icon: '📄' },
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Numerical Analysis Dashboard
        </h1>
        <p className="text-slate-400 text-lg">
          Compare Integration Methods: Trapezoidal, Midpoint, Simpson's Rules
        </p>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid max-w-[1600px] mx-auto">
        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Sidebar Mode Toggle */}
          <div className="glass-card p-2 flex gap-2">
            <button
              onClick={() => setSidebarMode('preset')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${sidebarMode === 'preset'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <span>📚</span>
              <span>Preset</span>
            </button>
            <button
              onClick={() => setSidebarMode('custom')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${sidebarMode === 'custom'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <span>🧮</span>
              <span>Custom</span>
            </button>
          </div>

          {sidebarMode === 'preset' ? (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
                <span>🎛️</span> Control Panel
              </h2>

              <FunctionSelector
                functions={functions}
                selectedFunction={selectedFunction}
                onSelectFunction={handleFunctionSelect}
                bounds={bounds}
                onBoundsChange={setBounds}
                loading={loading}
              />
            </div>
          ) : (
            <>
              <MathCalculator
                onExpressionChange={handleCustomExpressionChange}
                onSubmit={handleCustomFunctionSubmit}
                loading={loading}
              />

              {/* Bounds for custom function */}
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
                      onChange={(e) => setBounds({ ...bounds, a: parseFloat(e.target.value) || 0 })}
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
                      onChange={(e) => setBounds({ ...bounds, b: parseFloat(e.target.value) || 0 })}
                      className="input-field w-full"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="glass-card p-6">
            <MethodControls
              n={n}
              onNChange={setN}
              selectedMethods={selectedMethods}
              onMethodToggle={handleMethodToggle}
              onAnalyze={handleAnalyze}
              loading={loading}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="space-y-6">
          {/* Function Info Card */}
          {selectedFunction && (
            <div className="glass-card p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-4xl">
                  <InlineMath math={`f(x) = ${selectedFunction.latex}`} />
                </div>
                <div className="h-12 w-px bg-slate-700"></div>
                <div className="text-slate-400">
                  <InlineMath math={`\\int_{${bounds.a.toFixed(2)}}^{${bounds.b.toFixed(2)}} f(x) \\, dx`} />
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs ${selectedFunction.category === 'Custom'
                ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30'
                : 'bg-slate-700/50 text-slate-400'
                }`}>
                {selectedFunction.category}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab !== 'deliverables' ? (
            <div className="glass-card p-6">
              {activeTab === 'visualization' && (
                <FunctionPlot
                  data={calculateData}
                  method={selectedMethods[0]}
                  n={n}
                />
              )}

              {activeTab === 'convergence' && (
                <ConvergencePlot analysisData={analysisData} />
              )}

              {activeTab === 'results' && (
                <ResultsTable
                  analysisData={analysisData}
                  selectedMethods={selectedMethods}
                />
              )}
            </div>
          ) : (
            <Deliverables
              analysisData={analysisData}
              selectedFunction={selectedFunction}
              bounds={bounds}
            />
          )}

          {/* Quick Stats Footer */}
          {analysisData && activeTab !== 'deliverables' && (
            <div className="grid grid-cols-4 gap-4">
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Exact Value</p>
                <p className="text-xl font-bold gradient-text font-mono">
                  {analysisData.exact_value?.toFixed(6)}
                </p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Best Method</p>
                <p className="text-xl font-bold text-amber-400">
                  {analysisData.winner === 'simpson' ? "Simpson's" :
                    analysisData.winner === 'trapezoidal' ? 'Trapezoidal' :
                      analysisData.winner === 'midpoint' ? 'Midpoint' : '—'}
                </p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Methods Tested</p>
                <p className="text-xl font-bold text-slate-200">
                  {selectedMethods.length}
                </p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider">N Values</p>
                <p className="text-xl font-bold text-slate-200">
                  4 → 1024
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>
          Numerical Analysis Dashboard • Comparing Simpson's, Trapezoidal, and Midpoint Integration Rules
        </p>
      </footer>

      {/* Help System */}
      <HelpButton onClick={() => setShowHelp(true)} />
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default App;
