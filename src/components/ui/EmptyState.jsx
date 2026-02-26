import React from 'react';
import { SearchX } from 'lucide-react';

export function EmptyState({
    // eslint-disable-next-line no-unused-vars
    icon: Icon = SearchX,
    title = "Sem logs no período",
    description = "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    actionLabel,
    onAction
}) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-[#1e252b] rounded-full flex items-center justify-center border border-white/5 shadow-inner mb-6 relative group">
                <div className="absolute inset-0 bg-slate-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Icon size={28} className="text-slate-400 group-hover:text-slate-300 transition-colors duration-500 relative z-10" />
            </div>

            <h3 className="text-[20px] font-bold text-white mb-2 tracking-tight">{title}</h3>
            <p className="text-sm text-[#94a3b8] max-w-sm leading-relaxed mb-6">{description}</p>

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="bg-[#1e252b] hover:bg-[#2d3748] border border-white/10 text-white text-sm font-medium px-6 py-2 rounded-lg transition-all"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
