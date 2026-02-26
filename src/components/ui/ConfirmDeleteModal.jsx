import React from 'react';
import { X } from 'lucide-react';

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, itemName, type = 'user' }) {
    if (!isOpen || !itemName) return null;

    const typeText = type === 'user' ? 'usuário' : 'componente';

    return (
        <div className="fixed inset-0 z-[999] bg-[#0b1120]/80 backdrop-blur-sm flex items-center justify-center p-4">
            {/* Modal Container */}
            <div className="w-full max-w-[460px] bg-[#1e252b] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header with Icon */}
                <div className="flex flex-col items-center pt-8 pb-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                        <X className="text-red-500 w-8 h-8" />
                    </div>

                    <h2 className="text-2xl font-bold text-white text-center mb-4 px-6 leading-tight">
                        Excluir o {typeText} {itemName}?
                    </h2>

                    <p className="text-[#94a3b8] text-center px-8 text-[15px] leading-relaxed">
                        Tem certeza que deseja excluir o <strong className="text-white font-semibold">{typeText}</strong> {itemName}? Essa ação é destrutiva e não pode ser desfeita.
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 pt-4 mt-2 flex justify-center gap-4 items-center">
                    <button
                        onClick={onClose}
                        className="text-[15px] font-semibold text-white hover:text-slate-300 px-6 py-2.5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            onClose();
                        }}
                        className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-[15px] font-semibold px-10 py-3 rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                    >
                        Excluir
                    </button>
                </div>

            </div>
        </div>
    );
}
