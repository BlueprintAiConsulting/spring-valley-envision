import React from 'react';
import { Sparkles, Trash2, UserCircle } from 'lucide-react';
import { SpringValleyRole } from '../../types/auth';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  hasImage: boolean;
  onStartOver: () => void;
  onQuoteClick: () => void;
  isQuoteAvailable: boolean;
  mainView?: 'studio' | 'field';
  onViewChange?: (view: 'studio' | 'field') => void;
}

const Header: React.FC<HeaderProps> = ({
  hasImage,
  onStartOver,
  onQuoteClick,
  isQuoteAvailable,
  mainView = 'studio',
  onViewChange,
}) => {
  const base = import.meta.env.BASE_URL || '/';
  const { currentUser, activeRole, logout } = useAuth();

  const ROLES: SpringValleyRole[] = [
    'Owner', 
    'General Manager', 
    'Sales Manager', 
    'Salesperson', 
    'Production Manager', 
    'Project Manager'
  ];

  return (
    <header className="border-b border-[#18A9D9]/20 bg-[#0B131E]/95 backdrop-blur-md sticky top-0 z-20 shadow-[0_1px_24px_rgba(24,169,217,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        
        {/* Brand — logo */}
        <div className="flex items-center gap-3 min-w-0">
          <img 
            src={`${base}assets/logo.png`} 
            alt="Spring Valley Roofing" 
            className="h-8 sm:h-9 w-auto max-w-[190px] object-contain drop-shadow-[0_2px_10px_rgba(24,169,217,0.3)] cursor-pointer" 
            onClick={() => onViewChange && onViewChange('studio')}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="hidden lg:flex flex-col min-w-0 border-l border-[#223448] pl-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold whitespace-nowrap text-[#18A9D9]">
              CertainTeed® Visualizer
            </span>
          </div>
        </div>

        {/* Center Mode Switcher */}
        {onViewChange && (
          <div className="flex items-center bg-[#131F2E] border border-[#223448] rounded-xl p-1 shadow-inner">
            <button
              onClick={() => onViewChange('studio')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mainView === 'studio'
                  ? 'bg-[#18A9D9] text-white shadow-[0_0_14px_rgba(24,169,217,0.4)]'
                  : 'text-[#9BA8B8] hover:text-white'
              }`}
            >
              🎨 <span className="hidden sm:inline">Studio Visualizer</span><span className="sm:hidden">Studio</span>
            </button>
            <button
              onClick={() => onViewChange('field')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mainView === 'field'
                  ? 'bg-[#83C248] text-white shadow-[0_0_14px_rgba(131,194,72,0.4)]'
                  : 'text-[#9BA8B8] hover:text-white'
              }`}
            >
              📐 <span className="hidden sm:inline">4-Side Field Takeoff</span><span className="sm:hidden">Field Takeoff</span>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Auth Status & Sign Out */}
          {currentUser && (
            <div className="relative group mr-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131F2E] border border-[#223448] text-xs font-semibold text-[#18A9D9] cursor-pointer">
                <UserCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{activeRole}</span>
              </div>
              
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#0B131E] border border-[#223448] rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-[#223448] bg-[#0E1620]">
                  <div className="text-[10px] font-bold text-[#9BA8B8] truncate">{currentUser.email}</div>
                </div>
                <button
                  onClick={() => logout()}
                  className="w-full text-left px-3 py-2 text-xs transition-colors text-red-400 hover:bg-[#1A2838]"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {hasImage && mainView === 'studio' && (
            <button
              onClick={onStartOver}
              className="hover:text-red-400 text-red-500/70 transition-colors flex items-center gap-1.5 text-xs font-medium p-1.5 sm:p-0"
              title="Start Over"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {mainView === 'studio' && (
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
              <span className="hidden sm:inline">Get Free Quote</span>
              <span className="sm:hidden">Quote</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
