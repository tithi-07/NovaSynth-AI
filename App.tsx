import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Molecule3D from './components/Molecule3D';
import ImageAnalysis from './components/ImageAnalysis';
import TextAnalysis from './components/TextAnalysis';
import ComparisonEngine from './components/ComparisonEngine';
import ReportView from './components/ReportView';
import { AnalysisType, AnalysisResult } from './types';
import { FlaskConical, FileText, Scale, ChevronRight, X, BrainCircuit, Sparkles, ArrowDown, ShieldCheck, Menu, GraduationCap, Microscope, Users } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalysisType | 'HOME'>('HOME');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setHistory(prev => [result, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case AnalysisType.IMAGE:
        return <ImageAnalysis onAnalysisComplete={handleAnalysisComplete} />;
      case AnalysisType.TEXT:
        return <TextAnalysis onAnalysisComplete={handleAnalysisComplete} />;
      case AnalysisType.COMPARISON:
        return <ComparisonEngine onAnalysisComplete={handleAnalysisComplete} />;
      case AnalysisType.REPORT:
        return <ReportView history={history} />;
      default:
        return (
          <div className="relative flex flex-col items-center w-full max-w-6xl mx-auto animate-fade-in px-6 pb-24">
             {/* Float Animation Styles */}
             <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-delay-1 { animation-delay: 2s; }
                .animate-float-delay-2 { animation-delay: 4s; }
             `}</style>

             {/* HERO SECTION */}
             <div className="relative w-full min-h-[90vh] flex flex-col justify-center items-center text-center pt-40">
                 {/* Background Animation Layer */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] z-0 opacity-40 pointer-events-none">
                     <div className="absolute inset-0 bg-scifi-accent/5 blur-[80px] rounded-full"></div>
                     <Molecule3D />
                 </div>

                 {/* Foreground Content */}
                 <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
                     <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tighter mb-6 drop-shadow-2xl">
                       NOVA<span className="text-scifi-accent">SYNTH</span>
                     </h1>
                     <p className="text-slate-400 text-xl leading-relaxed mb-12 font-light max-w-2xl mx-auto backdrop-blur-sm bg-[#0B0F19]/30 rounded-xl p-4 border border-white/5">
                       Accelerating molecular discovery with <span className="text-white font-medium">Gemini 3 Pro</span>. <br/>
                       Advanced multimodal reasoning for structural analysis and synthesis planning.
                     </p>

                     {/* Feature Strip Cards */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8 px-2 lg:px-6">
                          <button 
                             onClick={() => setActiveTab(AnalysisType.IMAGE)}
                             className="group flex flex-col items-center p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-scifi-accent/40 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer backdrop-blur-md text-center shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_30px_rgba(6,182,212,0.1)] transform hover:-translate-y-2"
                          >
                             <div className="p-3 bg-scifi-accent/10 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                <FlaskConical className="w-6 h-6 text-scifi-accent" />
                             </div>
                             <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-scifi-accent transition-colors">Image Analysis</h3>
                             <p className="text-xs text-slate-400 group-hover:text-slate-300">Decode molecular structures</p>
                          </button>

                          <button 
                             onClick={() => setActiveTab(AnalysisType.TEXT)}
                             className="group flex flex-col items-center p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer backdrop-blur-md text-center shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_30px_rgba(99,102,241,0.1)] transform hover:-translate-y-2"
                          >
                             <div className="p-3 bg-indigo-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.1)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                                <FileText className="w-6 h-6 text-indigo-400" />
                             </div>
                             <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-indigo-400 transition-colors">Text Intelligence</h3>
                             <p className="text-xs text-slate-400 group-hover:text-slate-300">Understand research papers</p>
                          </button>

                          <button 
                             onClick={() => setActiveTab(AnalysisType.COMPARISON)}
                             className="group flex flex-col items-center p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer backdrop-blur-md text-center shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_30px_rgba(168,85,247,0.1)] transform hover:-translate-y-2"
                          >
                             <div className="p-3 bg-purple-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.1)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                <Scale className="w-6 h-6 text-purple-400" />
                             </div>
                             <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-purple-400 transition-colors">Molecule Comparison</h3>
                             <p className="text-xs text-slate-400 group-hover:text-slate-300">Contrast scaffolds & properties</p>
                          </button>
                     </div>

                     {/* Simplified Primary Action Button */}
                     <div className="flex justify-center w-full mt-12">
                        <button 
                            onClick={() => setShowSelectionModal(true)}
                            className="group relative px-12 py-5 bg-scifi-accent text-slate-950 font-bold text-sm tracking-[0.2em] uppercase rounded-2xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] transform hover:-translate-y-1 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                               Begin Analysis <ChevronRight className="w-4 h-4" />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                     </div>

                     <div className="absolute bottom-4 animate-bounce opacity-40 text-slate-500">
                         <ArrowDown className="w-5 h-5" />
                     </div>
                 </div>
             </div>

             {/* SEPARATOR */}
             <div className="w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-32 relative z-10 shadow-[0_0_20px_rgba(6,182,212,0.15)]"></div>

             {/* HOW IT WORKS SECTION */}
             <div className="relative z-10 w-full max-w-5xl mb-32">
                 <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-20 tracking-tight flex items-center justify-center gap-6">
                     <span className="w-16 h-px bg-gradient-to-r from-transparent to-slate-700"></span>
                     How It Works
                     <span className="w-16 h-px bg-gradient-to-l from-transparent to-slate-700"></span>
                 </h3>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
                     {/* Connecting Line (Desktop) */}
                     <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-800 via-scifi-accent/20 to-slate-800 z-0"></div>

                     {/* Step 1 */}
                     <div className="relative z-10 flex flex-col items-center text-center group">
                         <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl group-hover:border-scifi-accent/50 transition-colors">
                            <div className="w-3 h-3 bg-scifi-accent rounded-full absolute top-4 right-4 animate-ping opacity-20"></div>
                            <FlaskConical className="w-10 h-10 text-slate-500 group-hover:text-scifi-accent transition-colors" />
                         </div>
                         <h4 className="text-lg font-bold text-white mb-2">1. Input Data</h4>
                         <p className="text-sm text-slate-400 max-w-[200px] leading-relaxed">Upload molecular images or paste research text directly.</p>
                     </div>

                     {/* Step 2 */}
                     <div className="relative z-10 flex flex-col items-center text-center group">
                         <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl group-hover:border-indigo-500/50 transition-colors">
                            <BrainCircuit className="w-10 h-10 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                         </div>
                         <h4 className="text-lg font-bold text-white mb-2">2. AI Processing</h4>
                         <p className="text-sm text-slate-400 max-w-[200px] leading-relaxed">Gemini 3 Pro analyzes structure, properties, and context.</p>
                     </div>

                     {/* Step 3 */}
                     <div className="relative z-10 flex flex-col items-center text-center group">
                         <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl group-hover:border-purple-500/50 transition-colors">
                            <Sparkles className="w-10 h-10 text-slate-500 group-hover:text-purple-400 transition-colors" />
                         </div>
                         <h4 className="text-lg font-bold text-white mb-2">3. Research Insight</h4>
                         <p className="text-sm text-slate-400 max-w-[200px] leading-relaxed">Receive structured data, visualizations, and comprehensive reports.</p>
                     </div>
                 </div>
             </div>

             {/* WHY NOVASYNTH AI SECTION */}
             <div className="relative z-10 w-full max-w-6xl mb-12">
                 <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-16 tracking-tight flex items-center justify-center gap-6">
                     <span className="w-16 h-px bg-gradient-to-r from-transparent to-slate-700"></span>
                     Why NovaSynth AI?
                     <span className="w-16 h-px bg-gradient-to-l from-transparent to-slate-700"></span>
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1: Students */}
                    <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800/80 backdrop-blur-md hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-2 hover:border-scifi-accent/30 group shadow-lg">
                        <div className="w-14 h-14 rounded-2xl bg-scifi-accent/10 flex items-center justify-center mb-6 border border-scifi-accent/20 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.05)]">
                            <GraduationCap className="w-7 h-7 text-scifi-accent" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-3 group-hover:text-scifi-accent transition-colors">For Students & Learners</h4>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Explore how small structural changes affect drug behavior, visualize molecules in 2D/3D, and get layered explanations in student-friendly language.
                        </p>
                    </div>

                    {/* Card 2: Researchers */}
                    <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800/80 backdrop-blur-md hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/30 group shadow-lg">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.05)]">
                            <Microscope className="w-7 h-7 text-purple-400" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">For Researchers & Labs</h4>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Rapidly compare scaffolds, generate conceptual reaction pathways, and capture session insights as structured reports to support hypothesis generation.
                        </p>
                    </div>

                    {/* Card 3: Educators */}
                    <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800/80 backdrop-blur-md hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500/30 group shadow-lg">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.05)]">
                            <Users className="w-7 h-7 text-indigo-400" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">For Educators</h4>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Turn complex molecules into interactive visuals for teaching, build examples on the fly, and share AI-generated summaries with your class.
                        </p>
                    </div>
                 </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="flex bg-[#050914] min-h-screen text-slate-200 font-sans selection:bg-scifi-accent/30">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />
      
      <main className="flex-1 relative overflow-x-hidden overflow-y-auto h-screen custom-scrollbar transition-all duration-300 ml-0 lg:ml-72">
         {/* Background Grid/Effects */}
         <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-scifi-accent/20 to-transparent"></div>
         </div>

         {/* Mobile Header Bar */}
         <header className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between lg:justify-end px-6 lg:px-10 z-20 pointer-events-none">
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors pointer-events-auto bg-slate-900/50 backdrop-blur rounded-lg border border-slate-800"
            >
                <Menu className="w-6 h-6" />
            </button>

            <div className="pointer-events-auto flex items-center gap-2.5 text-[11px] font-bold tracking-wider text-slate-400 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700/50 shadow-sm backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-scifi-success" />
                <span className="hidden sm:inline">SECURE RESEARCH ENVIRONMENT</span>
                <span className="sm:hidden">SECURE</span>
            </div>
         </header>

         <div className="relative z-10 p-6 lg:p-12 max-w-7xl mx-auto pt-24 lg:pt-12">
             {renderContent()}
         </div>
      </main>

      {/* Selection Modal */}
      {showSelectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowSelectionModal(false)}></div>
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-3xl w-full relative z-10 shadow-2xl animate-fade-in-up">
                <button 
                    onClick={() => setShowSelectionModal(false)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <h3 className="text-2xl font-bold text-white mb-2 text-center">Select Analysis Module</h3>
                <p className="text-slate-400 text-center mb-10 max-w-md mx-auto">Choose the appropriate AI pipeline for your input data.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button 
                        onClick={() => { setActiveTab(AnalysisType.IMAGE); setShowSelectionModal(false); }}
                        className="group bg-slate-950/50 p-6 rounded-2xl border border-slate-800 hover:border-scifi-accent hover:bg-slate-800/80 transition-all text-center flex flex-col items-center shadow-lg"
                    >
                        <div className="p-4 rounded-full bg-scifi-accent/10 mb-4 group-hover:scale-110 transition-transform border border-scifi-accent/20">
                            <FlaskConical className="w-8 h-8 text-scifi-accent" />
                        </div>
                        <h4 className="font-bold text-white mb-1">Visual Analysis</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">Structural recognition from images</p>
                    </button>

                    <button 
                        onClick={() => { setActiveTab(AnalysisType.TEXT); setShowSelectionModal(false); }}
                        className="group bg-slate-950/50 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 transition-all text-center flex flex-col items-center shadow-lg"
                    >
                        <div className="p-4 rounded-full bg-indigo-500/10 mb-4 group-hover:scale-110 transition-transform border border-indigo-500/20">
                            <FileText className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h4 className="font-bold text-white mb-1">Text Analysis</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">Paper summarization & extraction</p>
                    </button>

                    <button 
                        onClick={() => { setActiveTab(AnalysisType.COMPARISON); setShowSelectionModal(false); }}
                        className="group bg-slate-950/50 p-6 rounded-2xl border border-slate-800 hover:border-purple-500 hover:bg-slate-800/80 transition-all text-center flex flex-col items-center shadow-lg"
                    >
                        <div className="p-4 rounded-full bg-purple-500/10 mb-4 group-hover:scale-110 transition-transform border border-purple-500/20">
                            <Scale className="w-8 h-8 text-purple-400" />
                        </div>
                        <h4 className="font-bold text-white mb-1">Comparison</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">Side-by-side molecular study</p>
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;