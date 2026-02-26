import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Hash, Braces, Component, ArrowRight } from 'lucide-react';

export function SearchModal({ isOpen, onClose, onNavigate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const inputRef = useRef(null);
    const modalRef = useRef(null);

    // Focus input on open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            // Small timeout to ensure modal is fully rendered before focusing
            setTimeout(() => inputRef.current.focus(), 50);
        }
    }, [isOpen]);

    // Close on ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Mock recent searches for empty state (if we wanted to show them, but standard HeroUI shows "No recent searches" when empty)
    // Mock results for when typing
    const mockResults = [
        { id: '1', parent: 'Breadcrumbs', title: 'BreadcrumbItem Events', icon: Hash, type: 'hash', route: 'docs' },
        { id: '2', parent: 'Breadcrumbs', title: 'Types', icon: Hash, type: 'hash', route: 'docs' },
        { id: '3', parent: 'Button', title: 'Installation', icon: Hash, type: 'hash', route: 'docs' },
        { id: '4', parent: 'Button', title: 'Import', icon: Hash, type: 'hash', route: 'docs' },
        { id: '5', parent: 'Button', title: 'Usage', icon: Hash, type: 'hash', route: 'docs' },
        { id: '6', type: 'component', title: 'Button', icon: Braces, route: 'componente/button-id' }
    ];

    // Simple filter logic
    const filteredResults = searchQuery.trim()
        ? mockResults.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.parent && item.parent.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : [];

    const handleClear = () => {
        setSearchQuery('');
        inputRef.current?.focus();
    };

    const handleSelect = (route) => {
        if (onNavigate) {
            onNavigate(route);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4 animate-in fade-in duration-200">
            {/* Modal Container */}
            <div
                ref={modalRef}
                className="w-full max-w-[600px] bg-[#0f1115] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            >
                {/* Search Header */}
                <div className="flex items-center px-4 py-3 border-b border-white/10 shrink-0">
                    <Search size={20} className="text-slate-400 mr-3 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search documentation"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent text-white text-base placeholder:text-slate-500 focus:outline-none min-w-0"
                    />

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                        {searchQuery && (
                            <button
                                onClick={handleClear}
                                className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                            >
                                <X size={14} strokeWidth={2.5} />
                            </button>
                        )}
                        <kbd className="hidden sm:inline-flex items-center justify-center h-6 px-2 text-[10px] font-semibold text-slate-400 bg-white/5 border border-white/10 rounded-md">
                            ESC
                        </kbd>
                    </div>
                </div>

                {/* Search Body */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {!searchQuery.trim() ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <p className="text-[15px] font-medium text-slate-400 mb-2">No recent searches</p>
                        </div>
                    ) : (
                        /* Results */
                        <div className="p-2 space-y-1">
                            {filteredResults.length > 0 ? (
                                filteredResults.map((result, index) => {
                                    const ResultIcon = result.icon;
                                    // Make the second item (index 1) appear "selected/active" purely for visual demonstration matching the screenshot,
                                    // OR handle hover state. In a real app we'd track keyboard focus index. We'll rely on hover.

                                    return (
                                        <button
                                            key={result.id}
                                            onClick={() => handleSelect(result.route)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors group relative overflow-hidden focus:outline-none hover:bg-[#006FEE] ${index === 1 ? 'bg-[#006FEE]' : 'bg-[#18181b]'}`}
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${index === 1 ? 'bg-black/20 text-white' : 'bg-white/5 text-slate-400 group-hover:bg-black/20 group-hover:text-white'}`}>
                                                    <ResultIcon size={16} />
                                                </div>
                                                <div className="flex flex-col items-start min-w-0 text-left">
                                                    {result.parent && (
                                                        <span className={`text-[11px] truncate w-full ${index === 1 ? 'text-blue-100' : 'text-slate-500 group-hover:text-blue-100'}`}>
                                                            {result.parent}
                                                        </span>
                                                    )}
                                                    <span className={`text-[15px] font-medium truncate w-full ${index === 1 ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                                        {result.title}
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight size={16} className={`shrink-0 ml-4 ${index === 1 ? 'text-white opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-white'} transition-opacity`} />
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                    <p className="text-[15px] font-medium text-slate-400 mb-2">No results found for "{searchQuery}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer (Optional, like HeroUI standard) */}
                {/* 
                <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1">Navigate <kbd className="font-sans px-1 rounded bg-white/5 border border-white/10">↑</kbd><kbd className="font-sans px-1 rounded bg-white/5 border border-white/10">↓</kbd></span>
                        <span className="flex items-center gap-1">Open <kbd className="font-sans px-1 rounded bg-white/5 border border-white/10">↵</kbd></span>
                    </div>
                </div>
                */}
            </div>
        </div>
    );
}
