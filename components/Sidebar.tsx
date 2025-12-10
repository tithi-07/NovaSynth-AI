import React from 'react';
import { AnalysisType } from '../types';
import { FlaskConical, FileText, Scale, FileBarChart, Atom, X } from 'lucide-react';

interface SidebarProps {
  activeTab: AnalysisType | 'HOME';
  setActiveTab: (tab: AnalysisType | 'HOME') => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: AnalysisType.IMAGE, label: 'Image Analysis', icon: FlaskConical },
    { id: AnalysisType.TEXT, label: 'Text Analysis', icon: FileText },
    { id: AnalysisType.COMPARISON, label: 'Molecule Comparison', icon: Scale },
    { id: AnalysisType.REPORT, label: 'Research Summary', icon: FileBarChart },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-screen w-72 bg-[#050914] border-r border-slate-800/60 z-50
        flex flex-col transition-transform duration-300 ease-in-out backdrop-blur-xl
        lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Header */}
        <div className="p-8 flex items-center justify-between h-24">
          <div 
            onClick={() => { setActiveTab('HOME'); setIsMobileOpen(false); }}
            className="flex items-center gap-4 cursor-pointer group"
          >
            <div className="bg-scifi-accent/10 p-2.5 rounded-xl group-hover:bg-scifi-accent/20 transition-colors border border-scifi-accent/20">
                <Atom className="w-7 h-7 text-scifi-accent animate-spin-slow" />
            </div>
            <span className="font-bold text-xl tracking-wider text-white group-hover:text-scifi-glow transition-colors font-sans">
              NOVA<span className="text-scifi-accent">SYNTH</span>
            </span>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-3 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileOpen(false); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-slate-800/60 text-scifi-accent shadow-lg border border-slate-700/50' 
                    : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
                  }`}
              >
                <div className={`relative z-10 p-1 rounded-lg ${isActive ? 'bg-scifi-accent/10' : ''}`}>
                   <item.icon className={`w-5 h-5 ${isActive ? 'text-scifi-glow' : 'group-hover:text-white transition-colors'}`} />
                </div>
                <span className="font-medium tracking-wide z-10">{item.label}</span>
                
                {isActive && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-scifi-accent/50 shadow-[0_0_10px_#06b6d4]"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800/40">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model</span>
             <span className="text-[10px] font-mono text-scifi-accent">Gemini 3 Pro</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;