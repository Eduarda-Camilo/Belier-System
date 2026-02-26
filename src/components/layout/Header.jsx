import React, { useState, useEffect } from 'react';
import { Search, Inbox, FileText, Figma, LayoutGrid } from 'lucide-react';
import { ProfileDropdown } from './ProfileDropdown';
import { SearchModal } from '../ui/SearchModal';

export function Header({ isPublic, onNavigate, showLogo = false }) {
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Global Command+K or Ctrl+K shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchModalOpen(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);
    return (
        <header className="h-[72px] shrink-0 bg-transparent flex items-center justify-between px-6 pl-6">

            {/* Left side: Quick icons (gap 16px) */}
            <div className="flex items-center gap-4 text-[#94a3b8]">
                {showLogo && (
                    <div className="flex items-center cursor-pointer mr-2" onClick={() => onNavigate && onNavigate('docs')}>
                        <img src="/assets/logo.svg" alt="Belier Logo" className="w-[120px] h-auto shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                )}
                {!isPublic && (
                    <button onClick={() => onNavigate && onNavigate('inbox')} className="flex items-center gap-2 hover:text-white transition-colors text-sm font-medium">
                        <Inbox size={18} /> Inbox
                    </button>
                )}
                <button onClick={() => onNavigate && onNavigate('docs')} className="flex items-center gap-2 hover:text-white transition-colors text-sm font-medium">
                    <FileText size={18} /> Docs
                </button>
                <button onClick={() => onNavigate && onNavigate('figma')} className="flex items-center gap-2 hover:text-white transition-colors text-sm font-medium">
                    <img src="/assets/icon-figma.svg" alt="Figma" className="w-[18px] h-[18px]" /> Figma
                </button>
                <button onClick={() => onNavigate && onNavigate('components')} className="flex items-center gap-2 hover:text-white transition-colors text-sm font-medium">
                    <LayoutGrid size={18} /> Componentes
                </button>
            </div>

            {/* Right side: Search & Actions (gap 16px) */}
            <div className="flex items-center gap-4">

                {/* Search Input Button */}
                <div
                    className="relative group cursor-pointer"
                    onClick={() => setIsSearchModalOpen(true)}
                >
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-blue-400 transition-colors pointer-events-none" />
                    <div className="flex items-center h-10 w-[280px] bg-[#1e252b] border border-white/10 hover:border-white/20 rounded-full pl-10 pr-4 text-sm text-slate-500 transition-all shadow-inner">
                        <span className="flex-1 text-left">Buscar na documentação...</span>
                        <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-semibold text-slate-400 bg-white/5 border border-white/10 rounded">
                            Ctrl K
                        </kbd>
                    </div>
                </div>

                {isPublic ? (
                    <div className="flex items-center gap-4">
                        <button onClick={() => onNavigate && onNavigate('cadastro')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors active:scale-95">
                            Cadastre-se
                        </button>
                        <button onClick={() => onNavigate && onNavigate('login')} className="h-10 px-5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-medium rounded-lg shadow-lg shadow-sky-500/20 transition-all active:scale-95">
                            Entrar
                        </button>
                    </div>
                ) : (
                    <>
                        <button onClick={() => onNavigate && onNavigate('novo-componente')} className="h-10 px-5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-medium rounded-full shadow-lg shadow-sky-500/20 transition-all active:scale-95">
                            Novo Componente
                        </button>
                        <ProfileDropdown onNavigate={onNavigate} />
                    </>
                )}
            </div>

            {/* Search Modal Portal / Render */}
            <SearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onNavigate={onNavigate}
            />

        </header>
    );
}
