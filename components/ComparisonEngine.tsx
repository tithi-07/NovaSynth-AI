import React, { useState } from 'react';
import { compareMoleculesText, validateComparisonInputs } from '../services/geminiService';
import { ComparisonData, AnalysisResult, AnalysisType } from '../types';
import { Scale, ArrowRightLeft, GitCompare, Loader2, FlaskConical, Table2, Info, TrendingUp, TrendingDown, Minus, Microscope, Sparkles, BrainCircuit, AlertCircle } from 'lucide-react';
import Tooltip from './Tooltip';
import InteractiveMoleculeViewer from './InteractiveMoleculeViewer';
import TherapeuticPredictionCard from './TherapeuticPredictionCard';

interface Props {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

// Utility to clean API text artifacts
const cleanText = (text: string | undefined) => {
    if (!text) return '';
    return text
        .replace(/_x000D_/g, '')
        .replace(/\\n/g, '\n')
        .replace(/\*\*/g, '')
        .trim();
};

const ComparisonEngine: React.FC<Props> = ({ onAnalysisComplete }) => {
  const [mol1, setMol1] = useState('');
  const [mol2, setMol2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ComparisonData | null>(null);

  const handleCompare = async () => {
    if (!mol1.trim() || !mol2.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      // 1. Validate Inputs
      const validation = await validateComparisonInputs(mol1, mol2);
      
      if (!validation.mol1Valid || !validation.mol2Valid) {
         let msg = "Invalid Input: ";
         if (!validation.mol1Valid && !validation.mol2Valid) msg += "Both inputs are not recognized as valid chemical entities.";
         else if (!validation.mol1Valid) msg += `"${mol1}" is not a recognized molecule or valid structure format.`;
         else if (!validation.mol2Valid) msg += `"${mol2}" is not a recognized molecule or valid structure format.`;
         
         setError(msg);
         setLoading(false);
         return;
      }

      // 2. Run Comparison
      const result = await compareMoleculesText(mol1, mol2);
      setData(result);
      onAnalysisComplete({
        id: Date.now().toString(),
        type: AnalysisType.COMPARISON,
        timestamp: Date.now(),
        title: `Comparison: ${result.molecule1} vs ${result.molecule2}`,
        data: result
      });
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Analysis failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
        case 'Positive': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
        case 'Neutral': return <Minus className="w-4 h-4 text-blue-400" />;
        case 'Uncertain': return <Info className="w-4 h-4 text-yellow-400" />;
        default: return <Minus className="w-4 h-4 text-slate-600" />;
    }
  };

  const getConfidenceBadge = (level: string) => {
    const styles = {
        'High': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Medium': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        'Low': 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider shadow-sm backdrop-blur-sm ${styles[level as keyof typeof styles] || styles['Medium']}`}>
            {level} Confidence
        </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800/60 pb-8">
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                        Comparative Analysis
                    </span>
                </div>
                <h2 className="text-4xl font-bold text-white tracking-tight font-sans">Molecule Comparison</h2>
                <p className="text-slate-400 mt-3 max-w-2xl text-lg font-light">
                    Evaluate structural similarities and functional differences between two chemical entities using their names or SMILES codes.
                </p>
            </div>
      </div>

      {/* Input Card */}
      <div className="glass-panel rounded-3xl p-1 overflow-hidden shadow-2xl shadow-black/40">
           <div className="bg-slate-900/40 p-8 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    
                    {/* Input 1 */}
                    <div className="flex-1 w-full space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <FlaskConical className="w-3 h-3" /> Molecule A
                        </label>
                        <input 
                            type="text" 
                            placeholder="e.g., Aspirin, Caffeine, or SMILES..." 
                            value={mol1}
                            onChange={(e) => setMol1(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm"
                        />
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 shrink-0 mt-6 md:mt-0">
                         <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                             <ArrowRightLeft className="w-4 h-4" />
                         </div>
                    </div>

                    {/* Input 2 */}
                    <div className="flex-1 w-full space-y-3">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <FlaskConical className="w-3 h-3" /> Molecule B
                        </label>
                        <input 
                            type="text" 
                            placeholder="e.g., Ibuprofen, Ethanol..." 
                            value={mol2}
                            onChange={(e) => setMol2(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center justify-center border-t border-slate-800/50 pt-10 gap-6">
                     <button
                        onClick={handleCompare}
                        disabled={!mol1.trim() || !mol2.trim() || loading}
                        className={`
                            px-12 py-5 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center gap-3 transition-all
                            ${!mol1.trim() || !mol2.trim() || loading 
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                                : 'bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:-translate-y-0.5'
                            }
                        `}
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
                        {loading ? 'Validating & Comparing...' : 'Run Comparison'}
                    </button>

                    {error && (
                        <div className="animate-fade-in p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-200 max-w-2xl">
                            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                </div>
           </div>
      </div>

      {/* Output Card */}
      {(data || loading) && !error && (
        <div className="glass-panel rounded-3xl p-1 overflow-hidden animate-fade-in-up shadow-2xl shadow-black/40 relative">
            <div className="bg-slate-900/60 p-8 backdrop-blur-xl min-h-[400px]">
                 
                 {/* Results Header */}
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 border-b border-slate-800/50 pb-6">
                    <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-3">
                        <Scale className="w-6 h-6 text-purple-400" />
                        Differential Analysis Results
                    </h3>
                    {data && (
                        <div className="flex items-center gap-4">
                            {getConfidenceBadge(data.confidenceScore)}
                        </div>
                    )}
                 </div>

                {loading && !data && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse p-4">
                        <div className="h-48 bg-slate-800/40 rounded-2xl col-span-2"></div>
                        <div className="h-64 bg-slate-800/40 rounded-2xl col-span-2"></div>
                    </div>
                )}

                {data && (
                    <div className="space-y-10 animate-slide-up">
                        
                        {/* 1. Visual Representations (Center-Aligned) with 3D Viewers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-950/80 p-1 rounded-2xl border border-slate-800 relative group overflow-hidden shadow-inner flex flex-col">
                                <InteractiveMoleculeViewer moleculeName={data.molecule1} structureData={data.structure1} height="350px" />
                                <div className="p-3 border-t border-slate-800/50 bg-slate-900/50">
                                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block text-center">
                                         {cleanText(data.molecule1)}
                                     </span>
                                </div>
                            </div>
                            <div className="bg-slate-950/80 p-1 rounded-2xl border border-slate-800 relative group overflow-hidden shadow-inner flex flex-col">
                                <InteractiveMoleculeViewer moleculeName={data.molecule2} structureData={data.structure2} height="350px" />
                                <div className="p-3 border-t border-slate-800/50 bg-slate-900/50">
                                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block text-center">
                                         {cleanText(data.molecule2)}
                                     </span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Similarity Banner & Reasoning */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700/50 flex flex-col lg:flex-row items-stretch gap-10 shadow-lg">
                            <div className="flex-shrink-0 flex flex-col justify-center min-w-[200px] text-center lg:text-left">
                                <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Structural Similarity</h4>
                                <div className="text-6xl font-bold text-white tracking-tighter flex items-center justify-center lg:justify-start gap-1">
                                    {data.similarityScore}
                                    <span className="text-3xl text-slate-500 font-light translate-y-2">%</span>
                                </div>
                                <p className="text-xs text-purple-400 mt-4 font-medium leading-relaxed max-w-xs mx-auto lg:mx-0">
                                    {cleanText(data.similarityExplanation)}
                                </p>
                            </div>
                            
                            <div className="w-full h-[1px] lg:w-[1px] lg:h-auto bg-slate-700/50"></div>
                            
                            {/* Reasoning Snapshot */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-5">
                                    <BrainCircuit className="w-4 h-4 text-purple-400" />
                                    <h5 className="text-xs font-bold text-purple-300 uppercase tracking-wide">AI Reasoning Snapshot</h5>
                                </div>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                                    {data.reasoningSnapshot?.map((reason, i) => (
                                        <li key={i} className="text-sm text-slate-300 flex items-start gap-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
                                            <span className="font-light">{cleanText(reason)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* --- NEW THERAPEUTIC PROFILING SECTION --- */}
                        <div className="bg-slate-900/30 rounded-2xl p-8 border border-slate-800">
                             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Microscope className="w-4 h-4" /> Therapeutic Profiling
                             </h4>
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                 <TherapeuticPredictionCard 
                                    predictions={data.molecule1TherapeuticClasses} 
                                    moleculeName={data.molecule1} 
                                 />
                                 <TherapeuticPredictionCard 
                                    predictions={data.molecule2TherapeuticClasses} 
                                    moleculeName={data.molecule2} 
                                 />
                             </div>
                        </div>

                        {/* 3. Comparison Table with Trends (Polished) */}
                        <div className="overflow-hidden rounded-2xl border border-slate-800 shadow-md">
                             <div className="bg-slate-900/95 px-8 py-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                                 <div className="flex items-center gap-2.5">
                                     <Table2 className="w-5 h-5 text-purple-400" />
                                     <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Comparative Matrix</h4>
                                 </div>
                                 <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800/50">
                                     <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Advantage</span>
                                     <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Neutral</span>
                                     <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Uncertain</span>
                                 </div>
                             </div>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800/80">
                                            <th className="px-8 py-5 font-bold uppercase tracking-wider text-[10px] w-[25%]">Feature</th>
                                            <th className="px-8 py-5 font-bold uppercase tracking-wider text-[10px] text-purple-300 w-[37.5%]">{cleanText(data.molecule1)}</th>
                                            <th className="px-8 py-5 font-bold uppercase tracking-wider text-[10px] text-purple-300 w-[37.5%]">{cleanText(data.molecule2)}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40">
                                        {data.comparisonTable.map((row, i) => (
                                            <tr key={i} className="hover:bg-purple-500/5 transition-all duration-300 group">
                                                <td className="px-8 py-6 font-medium text-slate-300 group-hover:text-white transition-colors flex items-center gap-3">
                                                    <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition-colors">
                                                        {getTrendIcon(row.trend)}
                                                    </div>
                                                    {cleanText(row.feature)}
                                                </td>
                                                <td className="px-8 py-6 text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed">
                                                    {cleanText(row.val1)}
                                                </td>
                                                <td className="px-8 py-6 text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed">
                                                    {cleanText(row.val2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>

                        {/* 4. Potential Modifications (Polished Bullets) */}
                        <div className="bg-slate-900/40 rounded-2xl p-8 border border-slate-800 hover:border-purple-500/20 transition-colors">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Microscope className="w-4 h-4" /> Potential Structural Modifications (Research Only)
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {data.structuralModifications?.map((mod, i) => (
                                    <div key={i} className="space-y-4">
                                        <div className="flex items-center gap-3 border-b border-slate-800/50 pb-2">
                                            <div className="px-2.5 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                                                {cleanText(mod.molecule)}
                                            </div>
                                            <Tooltip content="Theoretical modification for research purposes." />
                                        </div>
                                        <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                                            <h5 className="text-sm font-bold text-purple-300 mb-3 flex items-start gap-2">
                                                <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-purple-400" />
                                                {cleanText(mod.suggestion)}
                                            </h5>
                                            <div className="flex items-start gap-2">
                                                <div className="w-1 h-1 rounded-full bg-slate-500 mt-2 shrink-0"></div>
                                                <p className="text-xs text-slate-400 leading-relaxed font-light">
                                                    <span className="text-slate-500 font-bold uppercase text-[9px] mr-2 tracking-wider">IMPACT</span>
                                                    {cleanText(mod.impact)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonEngine;