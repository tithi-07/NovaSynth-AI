import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  trigger?: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, trigger }) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // Hide tooltip on scroll to prevent detachment from trigger
  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) setIsVisible(false);
    };
    if (isVisible) {
        window.addEventListener('scroll', handleScroll, { capture: true });
        window.addEventListener('resize', handleScroll);
    }
    return () => {
        window.removeEventListener('scroll', handleScroll, { capture: true });
        window.removeEventListener('resize', handleScroll);
    };
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 8, // 8px spacing above the element
        left: rect.left + rect.width / 2 // Center horizontally
      });
      setIsVisible(true);
    }
  };

  return (
    <>
      <div 
        ref={triggerRef}
        className="relative inline-flex items-center cursor-help group/tooltip"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
      >
        {trigger || <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-indigo-400 transition-colors opacity-70 hover:opacity-100 ml-1.5" />}
      </div>
      
      {isVisible && createPortal(
        <div 
            className="fixed z-[9999] w-56 p-3 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-[11px] leading-relaxed text-slate-300 backdrop-blur-md animate-fade-in pointer-events-none"
            style={{ 
                top: coords.top, 
                left: coords.left,
                transform: 'translate(-50%, -100%)' 
            }}
        >
           <span className="block font-bold text-indigo-400 mb-1 text-[10px] uppercase tracking-wider">Scientific Note</span>
           {content}
           {/* Arrow (Visual only) */}
           <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-b border-r border-slate-700/80 rotate-45"></div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;