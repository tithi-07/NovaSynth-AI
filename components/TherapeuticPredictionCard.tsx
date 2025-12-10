import React from 'react';
import { Activity, AlertTriangle } from 'lucide-react';
import { TherapeuticPrediction } from '../types';
import Tooltip from './Tooltip';

interface Props {
  predictions?: TherapeuticPrediction[];
  moleculeName?: string;
  className?: string;
}

const TherapeuticPredictionCard: React.FC<Props> = ({ predictions, moleculeName, className = '' }) => {
  if (!predictions || predictions.length === 0) return null;

  return (
    <div className={`glass-panel p-6 rounded-2xl border border-indigo-500/20 relative overflow-hidden group ${className}`}>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4 border-b border-indigo-500/10 pb-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Activity className="w-5 h-5" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Therapeutic Potential</h4>
                {moleculeName && <p className="text-[10px] text-slate-500 font-mono">{moleculeName}</p>}
            </div>
        </div>

        {/* Content */}
        <div className="space-y-3 mb-6">
            {predictions.map((pred, idx) => (
                <div key={idx} className="flex items-start justify-between group/item p-3 rounded-lg bg-slate-900/30 hover:bg-slate-800/50 transition-colors border border-slate-800/50 hover:border-indigo-500/20">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                            {pred.class}
                            <Tooltip content={pred.explanation} />
                        </span>
                        <span className="text-[10px] text-slate-500 leading-tight">{pred.explanation}</span>
                    </div>
                    <span className={`
                        text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ml-3
                        ${pred.confidence === 'High' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          pred.confidence === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                          'bg-slate-700/50 text-slate-400 border-slate-600'}
                    `}>
                        {pred.confidence}
                    </span>
                </div>
            ))}
        </div>

        {/* Disclaimer */}
        <div className="bg-red-950/10 border border-red-900/20 rounded-lg p-3 flex gap-3 items-start">
            <AlertTriangle className="w-4 h-4 text-red-400/60 mt-0.5 shrink-0" />
            <p className="text-[10px] text-red-300/60 leading-relaxed font-light">
                <span className="font-bold text-red-400/70">RESEARCH ONLY:</span> Conceptual therapeutic class prediction for research context only. Not for diagnosis, prescription, or treatment decisions.
            </p>
        </div>
    </div>
  );
};

export default TherapeuticPredictionCard;