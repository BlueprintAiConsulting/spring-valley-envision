import React from 'react';
import { Trash2, Sparkles } from 'lucide-react';

interface HeaderProps {
  hasImage: boolean;
  onStartOver: () => void;
  onQuoteClick: () => void;
  isQuoteAvailable: boolean;
}

const Header: React.FC<HeaderProps> = ({
  hasImage,
  onStartOver,
  onQuoteClick,
  isQuoteAvailable
}) => {
  const base = import.meta.env.BASE_URL || '/';

  return (
    <header className="border-b border-[#18A9D9]/20 bg-[#0B131E]/95 backdrop-blur-md sticky top-0 z-10 shadow-[0_1px_24px_rgba(24,169,217,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand — logo */}
        <div className="flex items-center gap-3 min-w-0">
          <img 
            src={`${base}assets/logo.png`} 
            alt="Spring Valley Roofing" 
            className="h-8 sm:h-9 w-auto max-w-[200px] object-contain drop-shadow-[0_2px_10px_rgba(24,169,217,0.3)]" 
          />
          <div className="hidden md:flex flex-col min-w-0 border-l border-[#223448] pl-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold whitespace-nowrap text-[#18A9D9]">
              CertainTeed® Visualizer
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {hasImage && (
            <button
              onClick={onStartOver}
              className="hover:text-red-400 text-red-500/70 transition-colors flex items-center gap-1.5 text-xs font-medium p-1.5 sm:p-0"
              title="Start Over"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            onClick={onQuoteClick}
            disabled={!isQuoteAvailable}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all active:scale-95 text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap ${
              isQuoteAvailable
                ? 'bg-[#83C248] hover:bg-[#93D553] text-white shadow-[0_0_20px_rgba(131,194,72,0.5)]'
                : 'bg-[#1E293B] text-[#475569] cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Get Free Quote & Download</span>
            <span className="sm:hidden">Quote</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
