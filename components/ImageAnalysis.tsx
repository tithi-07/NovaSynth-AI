import React, { useState, useEffect } from 'react';
import { analyzeMoleculeImage } from '../services/geminiService';
import { MoleculeAnalysisData, AnalysisResult, AnalysisType } from '../types';
import { Upload, Loader2, AlertCircle, Info, Share2, Layers, Zap, ScanLine, Database, ChevronRight, CheckCircle, Box } from 'lucide-react';
import InteractiveMoleculeViewer from './InteractiveMoleculeViewer';
import TherapeuticPredictionCard from './TherapeuticPredictionCard';

interface Props {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const ImageAnalysis: React.FC<Props> = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MoleculeAnalysisData | null>(null);

  const loadingMessages = [
    "Preprocessing image data...",
    "Identifying chemical bonds...",
    "Analyzing atomic geometry...",
    "Matching molecular families...",
    "Generating safety protocols...",
    "Synthesizing research report..."
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setData(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeMoleculeImage(file);
      setData(result);
      
      onAnalysisComplete({
        id: Date.now().toString(),
        type: AnalysisType.IMAGE,
        timestamp: Date.now(),
        title: result.chemicalName || 'Unknown Molecule',
        data: result
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Analysis failed. Please try a clearer image or check your API configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800/60 pb-8">
        <div>
            <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                    Computer Vision Module
                </span>
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight font-sans">Image Analysis</h2>
            <p className="text-slate-400 mt-3 max-w-2xl text-lg font-light">
                Leverage multimodal AI to deconstruct 2D molecular diagrams into structural data and chemical predictions.
            </p>
        </div>
      </div>

      {/* Input Card */}
      <div className="glass-panel rounded-3xl p-1 overflow-hidden shadow-2xl shadow-black/40">
        <div className="bg-slate-900/40 p-8 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-scifi-accent" />
                Input Source
            </h3>
            
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Upload Zone */}
                <div className={`
                    flex-1 relative rounded-2xl border-2 border-dashed transition-all duration-300 h-80 group overflow-hidden bg-slate-950/30
                    ${preview ? 'border-scifi-accent/50' : 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-900/60'}
                `}>
                    <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp, image/heic, image/heif"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                        disabled={loading}
                    />
                    
                    {preview ? (
                        <div className="relative w-full h-full flex items-center justify-center p-6">
                            <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain shadow-lg rounded-lg z-10" />
                            {/* Scanning Overlay */}
                            {loading && (
                                <div className="absolute inset-0 z-20 pointer-events-none">
                                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"></div>
                                    <div className="absolute w-full h-0.5 bg-scifi-glow shadow-[0_0_20px_#22d3ee] animate-scan z-30"></div>
                                    <div className="absolute top-4 left-4 text-xs font-mono text-scifi-glow flex items-center gap-2 z-30">
                                        <ScanLine className="w-4 h-4 animate-pulse" /> TARGET ACQUIRED
                                    </div>
                                    {/* Tech Borders */}
                                    <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-scifi-accent/50 rounded-tl-xl"></div>
                                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-scifi-accent/50 rounded-br-xl"></div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                             <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform group-hover:border-slate-500 shadow-xl">
                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
                            </div>
                            <h4 className="text-lg font-medium text-slate-300 mb-2">Upload Molecular Structure</h4>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">Drag and drop or click to browse. Supports PNG, JPG, and WEBP formats.</p>
                        </div>
                    )}
                </div>

                {/* Actions Column */}
                <div className="w-full lg:w-80 flex flex-col justify-end space-y-5">
                    <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                             <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Status</span>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide ${loading ? 'bg-yellow-500/10 text-yellow-400' : data ? 'bg-green-500/10 text-green-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                {loading ? 'PROCESSING' : data ? 'COMPLETE' : 'IDLE'}
                             </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                             <div 
                                className={`h-full transition-all duration-300 ${data ? 'bg-scifi-success' : 'bg-scifi-accent'}`} 
                                style={{ width: loading ? `${((loadingStep + 1) / loadingMessages.length) * 100}%` : data ? '100%' : '0%' }}
                             ></div>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 mt-3 h-4 flex items-center gap-2">
                           {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                           {loading && loadingMessages[loadingStep]}
                        </p>
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={!file || loading}
                        className={`
                            w-full py-5 rounded-xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3
                            ${!file || loading 
                                ? 'bg-slate-800/50 text-slate-600 border border-slate-800 cursor-not-allowed' 
                                : 'bg-scifi-accent text-slate-950 hover:bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transform hover:-translate-y-0.5'
                            }
                        `}
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        {loading ? 'Running Simulation' : 'Run Analysis'}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start gap-3 text-red-200">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p className="text-xs leading-relaxed">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Output Card - Full Width Below */}
      {(data || loading) && (
          <div className="glass-panel rounded-3xl p-1 overflow-hidden animate-fade-in-up shadow-2xl shadow-black/40">
            <div className="bg-slate-900/60 p-8 backdrop-blur-xl min-h-[400px]">
                <h3 className="text-lg font-semibold text-slate-200 mb-8 flex items-center gap-2.5">
                    <Layers className="w-5 h-5 text-scifi-accent" />
                    Analysis Results
                </h3>

                {loading && !data && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
                         <div className="lg:col-span-2 space-y-5">
                             <div className="h-32 bg-slate-800/40 rounded-2xl w-full"></div>
                             <div className="h-64 bg-slate-800/40 rounded-2xl w-full"></div>
                         </div>
                         <div className="space-y-5">
                             <div className="h-20 bg-slate-800/40 rounded-2xl w-full"></div>
                             <div className="h-20 bg-slate-800/40 rounded-2xl w-full"></div>
                             <div className="h-40 bg-slate-800/40 rounded-2xl w-full"></div>
                         </div>
                    </div>
                )}

                {data && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                            {/* Left Column: Core Info */}
                            <div className="lg:col-span-8 space-y-6">
                                {/* Identity Card */}
                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-2xl border border-slate-700/50 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Database className="w-32 h-32" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-3xl font-bold text-white tracking-tight">{data.chemicalName || "Unnamed Structure"}</h2>
                                            <CheckCircle className="w-6 h-6 text-scifi-success" />
                                        </div>
                                        <p className="text-xl text-scifi-accent font-mono mb-6">{data.formula || "Formula n/a"}</p>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {data.features.map((feature, i) => (
                                                <span key={i} className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-full text-xs font-medium border border-slate-700">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Analysis */}
                                <div className="bg-slate-900/30 rounded-2xl p-8 border border-slate-800">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Deep Analysis</h4>
                                    <p className="text-slate-300 leading-relaxed text-base font-light">
                                        {data.rawAnalysis}
                                    </p>
                                </div>

                                {/* Variations */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Share2 className="w-4 h-4" /> Hypothetical Variations
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {data.hypotheticalVariations.map((v, i) => (
                                            <div key={i} className="p-5 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 hover:border-purple-500/30 transition-all group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-semibold text-purple-300">{v.structure}</span>
                                                    <ChevronRight className="w-4 h-4 text-purple-500/50 group-hover:text-purple-400 transition-colors" />
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed">{v.purpose}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Stats & Properties */}
                            <div className="lg:col-span-4 space-y-6">
                                
                                {/* Therapeutic Predictions Card (New) */}
                                <TherapeuticPredictionCard 
                                    predictions={data.therapeuticPredictions} 
                                    moleculeName={data.chemicalName} 
                                />

                                {/* Properties */}
                                <div className="space-y-4">
                                    <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-800 hover:border-scifi-accent/30 transition-colors">
                                        <h5 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                                            <Info className="w-3 h-3" /> Solubility
                                        </h5>
                                        <p className="text-white font-medium">{data.properties.solubility}</p>
                                    </div>
                                    <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-800 hover:border-scifi-accent/30 transition-colors">
                                        <h5 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                                            <Zap className="w-3 h-3" /> Stability
                                        </h5>
                                        <p className="text-white font-medium">{data.properties.stability}</p>
                                    </div>
                                    <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/10">
                                        <h5 className="text-[10px] text-red-400/70 uppercase font-bold tracking-widest mb-2">Safety Profile</h5>
                                        <p className="text-red-200 text-sm leading-relaxed">{data.properties.toxicity_risk}</p>
                                    </div>
                                </div>

                                {/* Similar Families */}
                                <div className="glass-panel p-6 rounded-2xl">
                                    <h5 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4">Similar Families</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {data.similarFamilies.map((fam, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-slate-800/50 text-slate-400 text-xs font-medium rounded border border-slate-700">
                                                {fam}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* 3D Viewer Section */}
                        <div className="mt-8 pt-8 border-t border-slate-800/50">
                            <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2.5">
                                <Box className="w-5 h-5 text-scifi-accent" />
                                3D Structural Visualization
                            </h3>
                            <InteractiveMoleculeViewer 
                                moleculeName={data.chemicalName || "Molecule"} 
                                structureData={data.structure}
                                height="400px" 
                            />
                        </div>
                    </>
                )}
            </div>
          </div>
      )}
    </div>
  );
};

export default ImageAnalysis;