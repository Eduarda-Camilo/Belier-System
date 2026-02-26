import React from 'react';
import { Search, Inbox, FileText, Figma, LayoutGrid } from 'lucide-react';
import { ProfileDropdown } from './ProfileDropdown';

export function Header({ isPublic, onNavigate, showLogo = false }) {
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

                {/* Search Input */}
                <div className="relative group">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="h-10 w-[280px] bg-[#1e252b] border border-white/10 rounded-full pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium shadow-inner"
                    />
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

        </header>
    );
}
