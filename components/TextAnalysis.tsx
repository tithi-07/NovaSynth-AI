import React, { useState, useEffect } from 'react';
import { analyzeScientificText } from '../services/geminiService';
import { TextAnalysisData, AnalysisResult, AnalysisType } from '../types';
import Tooltip from './Tooltip';
import { FileText, Loader2, BookOpen, Target, Microscope, GraduationCap, ArrowRight, Activity, Sparkles, Beaker, ChevronDown, Atom, Thermometer, GitBranch, Cpu, AlertOctagon, Share2, Layers, Shield, Droplet, Zap, Info, BrainCircuit, School } from 'lucide-react';

interface Props {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const DEFINITIONS: Record<string, string> = {
    "Mechanistic Interpretation": "A step-by-step description of the chemical or biological interactions occurring at the molecular level.",
    "Molecular Behavior": "How the molecule reacts to environmental variables such as pH levels, temperature changes, or solvent polarity.",
    "Potential Analog Modifications": "Hypothetical structural changes suggested to optimize potency, solubility, or stability.",
    "Computational Reasoning": "The logic path and evidence the AI model used to derive these conclusions from the input text.",
    "Limitations & Assumptions": "Potential gaps in the analysis due to missing data or the predictive nature of the model.",
    "Executive Summary": "A concise overview of the core scientific findings extracted from the text.",
    "ASCII Art": "A simplified text-based visualization of the molecular structure.",
    "Student Explanation": "A pedagogical breakdown of complex concepts simplified for undergraduate level understanding.",
    "Experiment Goals": "The primary objectives or hypotheses tested in the source text.",
    "Key Findings": "The significant quantitative or qualitative results reported."
};

const AccordionItem = ({ title, icon: Icon, children, defaultOpen = false }: { title: string, icon: any, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
      <div className={`
        border rounded-xl overflow-hidden transition-all duration-300 group
        ${isOpen ? 'bg-slate-900/40 border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.1)]' : 'bg-slate-900/20 border-slate-800 hover:border-slate-700'}
      `}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-5 transition-colors cursor-pointer text-left hover:bg-slate-800/30"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400'}`}>
                <Icon className="w-4 h-4" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${isOpen ? 'text-indigo-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {title}
            </span>
            <Tooltip content={DEFINITIONS[title] || "Detailed scientific insight section."} />
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
        </button>
        {isOpen && (
          <div className="p-6 border-t border-slate-800/50 bg-slate-950/30 text-slate-300 text-sm leading-relaxed animate-fade-in-up">
            {children}
          </div>
        )}
      </div>
    )
}

const InteractivePropertyCard = ({ label, value, trend }: { label: string, value: string, trend: string }) => {
    const isPositive = trend === 'Positive';
    const isNegative = trend === 'Negative';
    
    // Determine icon and color based on label/trend
    let Icon = Activity;
    if (label.includes('Stability')) Icon = Shield;
    if (label.includes('Reactivity')) Icon = Zap;
    if (label.includes('Solubility')) Icon = Droplet;

    const baseStyle = isPositive 
        ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10' 
        : isNegative 
            ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10'
            : 'bg-slate-800/20 border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800/40';

    const textStyle = isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-200';

    return (
        <div className={`
            p-4 rounded-xl border transition-all duration-300 cursor-default group relative overflow-visible
            hover:-translate-y-1 hover:shadow-lg hover:z-20
            ${baseStyle}
        `}>
            {/* Background glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"></div>

            <div className="flex items-start justify-between mb-2 relative z-10">
                <div className="flex items-start gap-2 pr-2">
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors shrink-0 mt-0.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors leading-tight">
                        {label}
                    </span>
                </div>
                <div className="shrink-0 ml-1 relative">
                    <Tooltip content={`Predicted ${label.toLowerCase()} based on structural analysis and context.`} />
                </div>
            </div>
            <div className={`text-sm font-bold relative z-10 flex items-center gap-2 ${textStyle}`}>
                {value}
            </div>
        </div>
    );
};

const RelationshipMap = ({ relationships }: { relationships: { source: string, target: string, interaction: string }[] }) => {
    return (
        <div className="relative p-8 bg-slate-950/50 rounded-xl border border-indigo-500/10 min-h-[250px] flex items-center justify-center overflow-hidden group">
             {/* Simple visual graph representation */}
             <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             
             <div className="relative z-10 flex flex-col items-center gap-6 w-full">
                {relationships.slice(0, 4).map((rel, i) => (
                    <div key={i} className="flex items-center gap-4 w-full justify-center group/item animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-xs font-bold text-slate-300 shadow-lg min-w-[100px] text-center group-hover/item:scale-105 group-hover/item:border-slate-500 transition-all duration-300 cursor-default">
                            {rel.source}
                        </div>
                        <div className="flex-1 max-w-[150px] h-[2px] bg-indigo-500/30 relative flex items-center justify-center group-hover/item:bg-indigo-500/60 transition-colors">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 py-1 text-[9px] text-indigo-400 uppercase tracking-widest whitespace-nowrap border border-indigo-500/20 rounded-full group-hover/item:border-indigo-500/50 group-hover/item:text-indigo-300 transition-all shadow-sm z-10">
                                {rel.interaction}
                            </div>
                            <div className="absolute right-0 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1] group-hover/item:shadow-[0_0_12px_#6366f1] transition-shadow"></div>
                        </div>
                        <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-xs font-bold text-white shadow-lg min-w-[100px] text-center group-hover/item:bg-indigo-900/30 group-hover/item:border-indigo-500/40 group-hover/item:scale-105 transition-all duration-300 cursor-default">
                            {rel.target}
                        </div>
                    </div>
                ))}
             </div>
             
             <div className="absolute top-4 right-4">
                 <Tooltip content="Key semantic relationships identified in the text." />
             </div>
        </div>
    );
};

const TextAnalysis: React.FC<Props> = ({ onAnalysisComplete }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [data, setData] = useState<TextAnalysisData | null>(null);
  const [mode, setMode] = useState<'ADVANCED' | 'STUDENT'>('ADVANCED');

  const loadingMessages = [
    "Reading unstructured text...",
    "Extracting key chemical entities...",
    "Identifying experiment methodology...",
    "Running deep mechanistic inference...",
    "Simulating molecular conditions...",
    "Structuring goals and results...",
    "Compiling reasoning snapshot..."
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeScientificText(text);
      setData(result);
      onAnalysisComplete({
        id: Date.now().toString(),
        type: AnalysisType.TEXT,
        timestamp: Date.now(),
        title: "Text Analysis Session",
        data: result
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800/60 pb-8">
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                        NLP Module
                    </span>
                </div>
                <h2 className="text-4xl font-bold text-white tracking-tight font-sans">Text Analysis</h2>
                <p className="text-slate-400 mt-3 max-w-2xl text-lg font-light">
                    Extract structured scientific data and educational explanations from research papers.
                </p>
            </div>
        </div>

        {/* Input Card */}
        <div className="glass-panel rounded-3xl p-1 overflow-hidden shadow-2xl shadow-black/40">
             <div className="bg-slate-900/40 p-8 backdrop-blur-xl">
                 <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Input Text
                 </h3>

                 <div className="relative group">
                    <textarea
                        className="w-full h-80 p-6 bg-slate-950/50 border border-slate-700/50 rounded-2xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none font-mono text-sm leading-relaxed custom-scrollbar group-hover:bg-slate-950/70"
                        placeholder="Paste abstract, method section, or research notes here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={loading}
                    />
                    
                    {/* Processing Overlay */}
                    {loading && (
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center z-10 border border-indigo-500/30">
                            <Activity className="w-12 h-12 text-indigo-400 animate-pulse mb-4" />
                            <p className="font-mono text-indigo-200 text-lg tracking-widest animate-pulse">ANALYZING SYNTAX</p>
                            <p className="text-xs text-indigo-400/60 mt-2 font-mono">{loadingMessages[loadingStep]}</p>
                        </div>
                    )}

                    <div className="absolute bottom-4 right-4 text-xs font-mono text-slate-600 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                        {text.length} characters
                    </div>
                 </div>

                 <div className="mt-8 flex justify-end">
                     <button
                        onClick={handleAnalyze}
                        disabled={!text.trim() || loading}
                        className={`
                            px-10 py-5 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center gap-3 transition-all
                            ${!text.trim() || loading 
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:-translate-y-0.5'
                            }
                        `}
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        {loading ? 'Processing Text' : 'Generate Insights'}
                    </button>
                 </div>
             </div>
        </div>

        {/* Output Card */}
        {(data || loading) && (
            <div className="glass-panel rounded-3xl p-1 overflow-hidden animate-fade-in-up shadow-2xl shadow-black/40">
                 <div className="bg-slate-900/60 p-8 backdrop-blur-xl min-h-[400px]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2.5">
                            <BookOpen className="w-5 h-5 text-indigo-400" />
                            Research Insights
                        </h3>

                        {/* MODE TOGGLE */}
                        {data && (
                            <div className="flex bg-slate-950/50 p-1 rounded-xl border border-slate-700/60 self-start md:self-auto">
                                <button 
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'ADVANCED' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                                    onClick={() => setMode('ADVANCED')}
                                >
                                    <BrainCircuit className="w-3.5 h-3.5" />
                                    Advanced Research Mode
                                </button>
                                <button 
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'STUDENT' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                                    onClick={() => setMode('STUDENT')}
                                >
                                    <School className="w-3.5 h-3.5" />
                                    Student-Friendly Mode
                                </button>
                            </div>
                        )}
                    </div>

                    {loading && !data && (
                        <div className="space-y-6 animate-pulse p-4">
                             <div className="h-40 bg-slate-800/40 rounded-2xl w-full"></div>
                             <div className="grid grid-cols-2 gap-6">
                                <div className="h-60 bg-slate-800/40 rounded-2xl"></div>
                                <div className="h-60 bg-slate-800/40 rounded-2xl"></div>
                             </div>
                        </div>
                    )}

                    {data && (
                        <div className="space-y-8 animate-slide-up">
                            {/* Summary Section */}
                            <div className={`
                                bg-gradient-to-br p-8 rounded-2xl border relative group hover:border-opacity-100 transition-colors duration-500
                                ${mode === 'ADVANCED' ? 'from-indigo-950/30 to-slate-900/30 border-indigo-500/20 hover:border-indigo-500/40' : 'from-emerald-950/30 to-slate-900/30 border-emerald-500/20 hover:border-emerald-500/40'}
                            `}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <h4 className={`text-xs font-bold uppercase tracking-widest ${mode === 'ADVANCED' ? 'text-indigo-300' : 'text-emerald-300'}`}>
                                            {mode === 'ADVANCED' ? 'Executive Summary' : 'Student Summary'}
                                        </h4>
                                        <Tooltip content={mode === 'ADVANCED' ? DEFINITIONS["Executive Summary"] : "A simplified overview of the key concepts."} />
                                    </div>
                                    {data.experimentType && (
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${mode === 'ADVANCED' ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-emerald-500/20 border-emerald-500/30'}`}>
                                            <Beaker className={`w-3 h-3 ${mode === 'ADVANCED' ? 'text-indigo-300' : 'text-emerald-300'}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-wide ${mode === 'ADVANCED' ? 'text-indigo-300' : 'text-emerald-300'}`}>
                                                {data.experimentType}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-slate-200 leading-relaxed text-lg font-light transition-all duration-300">
                                    {mode === 'ADVANCED' ? data.summary : (data.studentSummary || data.summary)}
                                </p>
                            </div>

                            {/* --- NEW VISUAL BREAKDOWN SECTION --- */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* ASCII Art Column */}
                                <div className="lg:col-span-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 font-mono text-[10px] text-scifi-accent leading-none overflow-auto custom-scrollbar shadow-inner shadow-black/50 flex flex-col items-center justify-center relative group hover:border-indigo-500/30 transition-all duration-300">
                                    <div className="absolute top-4 left-0 w-full flex justify-center items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">
                                        Structural Sketch
                                        <Tooltip content={DEFINITIONS["ASCII Art"]} />
                                    </div>
                                    <pre className="whitespace-pre mt-8 opacity-80 group-hover:opacity-100 transition-opacity">{data.visuals?.asciiArt || "Structure Unavailable"}</pre>
                                </div>

                                {/* Relationships & Functional Groups */}
                                <div className="lg:col-span-8 space-y-6">
                                    {/* Property Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {data.visuals?.keyProperties?.map((prop, i) => (
                                            <InteractivePropertyCard 
                                                key={i} 
                                                label={prop.label} 
                                                value={prop.value} 
                                                trend={prop.trend} 
                                            />
                                        ))}
                                    </div>

                                    {/* Relationship Map */}
                                    <RelationshipMap relationships={data.visuals?.relationships || []} />
                                    
                                    {/* Functional Group Chips */}
                                    <div className="flex flex-wrap gap-2">
                                        {data.visuals?.functionalGroups?.map((fg, i) => {
                                            const colorMap: Record<string, string> = {
                                                'Acidic': 'bg-red-500/20 text-red-300 border-red-500/30',
                                                'Basic': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                                                'Polar': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                                                'Nonpolar': 'bg-slate-700 text-slate-300 border-slate-600',
                                                'Reactive': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
                                                'Stable': 'bg-green-500/20 text-green-300 border-green-500/30',
                                            };
                                            const style = colorMap[fg.type] || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
                                            return (
                                                <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${style} flex items-center gap-1.5 shadow-sm hover:scale-105 transition-transform cursor-help group`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 group-hover:animate-pulse"></span>
                                                    {fg.name}
                                                </span>
                                            );
                                        })}
                                        <div className="flex items-center ml-2">
                                            <Tooltip content="Key functional groups identified in the analysis." trigger={<Info className="w-4 h-4 text-slate-600 hover:text-indigo-400" />} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/50">
                                {data.keyConcepts.map((concept, i) => (
                                    <span key={i} className="px-4 py-1.5 bg-slate-950 text-slate-500 border border-slate-800 rounded-full text-[10px] font-mono tracking-wide hover:border-indigo-500/40 hover:text-indigo-400 transition-colors cursor-default">
                                        #{concept}
                                    </span>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Educational Context / Goals */}
                                <div className="space-y-6">
                                    {/* In Student Mode, show 'Experiment Goals' first, simplify context */}
                                     <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/20 transition-colors">
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Target className="w-4 h-4" /> 
                                            Experiment Goals
                                            <Tooltip content={DEFINITIONS["Experiment Goals"]} />
                                        </h4>
                                        <ul className="space-y-3">
                                            {data.experimentGoals.map((g, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-300 group">
                                                    <ArrowRight className="w-3.5 h-3.5 mt-1 text-indigo-400 shrink-0 group-hover:translate-x-1 transition-transform" />
                                                    {g}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Results / Findings */}
                                <div className="space-y-6">
                                    <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/20 transition-colors">
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Microscope className="w-4 h-4" /> 
                                            Key Findings & Results
                                            <Tooltip content={DEFINITIONS["Key Findings"]} />
                                        </h4>
                                        <ul className="space-y-3">
                                            {data.results.map((r, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0 shadow-[0_0_8px_#4ade80]"></div>
                                                    {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Advanced Insights Accordions */}
                            <div className="space-y-3 pt-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">
                                    {mode === 'ADVANCED' ? 'Deep Research Analysis' : 'Simplified Breakdown'}
                                </h4>
                                
                                <AccordionItem 
                                    title={mode === 'ADVANCED' ? "Mechanistic Interpretation" : "How it Works (Analogy)"} 
                                    icon={Atom} 
                                    defaultOpen={true}
                                >
                                    <p>{mode === 'ADVANCED' ? (data.mechanisticInterpretation || "No mechanism data extracted.") : (data.simpleMechanism || "Analogy unavailable.")}</p>
                                </AccordionItem>

                                <AccordionItem title="Molecular Behavior & Conditions" icon={Thermometer}>
                                    <p>{data.molecularBehavior || "No specific environmental conditions found."}</p>
                                </AccordionItem>

                                <AccordionItem title="Potential Analog Modifications" icon={GitBranch}>
                                    <ul className="space-y-2">
                                        {data.potentialAnalogModifications?.length > 0 ? (
                                            data.potentialAnalogModifications.map((mod, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-indigo-400">•</span> {mod}
                                                </li>
                                            ))
                                        ) : (
                                            <li>No variations suggested.</li>
                                        )}
                                    </ul>
                                </AccordionItem>

                                {mode === 'ADVANCED' && (
                                    <AccordionItem title="Computational Reasoning Snapshot" icon={Cpu}>
                                        <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-indigo-300/80 border border-indigo-500/20 shadow-inner">
                                            <span className="text-indigo-500 font-bold">MODEL_LOG:</span> {data.computationalReasoning || "Reasoning trace unavailable."}
                                        </div>
                                    </AccordionItem>
                                )}

                                <AccordionItem title="Limitations & Assumptions" icon={AlertOctagon}>
                                    <ul className="space-y-2 text-yellow-500/80">
                                        {data.limitationsAssumptions?.length > 0 ? (
                                            data.limitationsAssumptions.map((lim, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-yellow-600">⚠</span> {lim}
                                                </li>
                                            ))
                                        ) : (
                                            <li>No specific limitations noted.</li>
                                        )}
                                    </ul>
                                </AccordionItem>
                            </div>
                        </div>
                    )}
                 </div>
            </div>
        )}
    </div>
  );
};

export default TextAnalysis;