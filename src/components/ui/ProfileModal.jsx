import React, { useState } from 'react';
import { X, EyeOff, Eye, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ProfileModal({ isOpen, onClose }) {
    const { user } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    const userName = user?.user_metadata?.full_name || user?.email || 'Usuário';
    const userRole = user?.user_metadata?.role || 'user';
    const userEmail = user?.email || '';

    const getInitials = (nameStr) => {
        if (!nameStr) return '??';
        const parts = nameStr.trim().split(' ').filter(Boolean);
        if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    };

    const displayInitials = getInitials(userName);

    return (
        <div className="fixed inset-0 z-[999] bg-[#0b1120]/80 backdrop-blur-sm flex items-center justify-center p-4">
            {/* Modal Container */}
            <div className="w-full max-w-[420px] bg-[#1e252b] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Perfil</h2>
                        <p className="text-xs text-[#94a3b8]">Seu perfil ajuda as pessoas a reconhecerem você.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Avatar */}
                <div className="flex justify-center py-4">
                    <div className="w-24 h-24 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center text-4xl font-semibold shadow-lg shadow-sky-500/20">
                        {displayInitials}
                    </div>
                </div>

                {/* Form Fields */}
                <div className="px-6 py-2 space-y-5">

                    {/* Display Name */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-200">Nome de exibição</label>
                        <input
                            type="text"
                            defaultValue={userName}
                            className="w-full bg-[#111822] border border-white/10 rounded-lg px-4 py-3 text-[13px] text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                        />
                    </div>

                    {/* Access (Read Only / Dropdown styling) */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-200">Acesso</label>
                        <div className="relative">
                            <select
                                defaultValue={userRole}
                                disabled
                                className="appearance-none w-full bg-[#111822] border border-white/10 rounded-lg px-4 py-3 text-[13px] text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-not-allowed opacity-70">
                                <option value="admin">Administrador</option>
                                <option value="developer">Desenvolvedor</option>
                                <option value="designer">Designer</option>
                                <option value="user">Usuário Comum</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-200">E-mail</label>
                        <input
                            type="email"
                            defaultValue={userEmail}
                            disabled
                            className="w-full bg-[#111822] border border-white/10 rounded-lg px-4 py-3 text-[13px] text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-not-allowed opacity-70"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-200">Senha</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                defaultValue={showPassword ? "NaoVisivelAqui" : "********"}
                                disabled
                                className="w-full bg-[#111822] border border-white/10 rounded-lg px-4 py-3 text-[13px] text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium tracking-[0.15em] cursor-not-allowed opacity-70"
                            />
                        </div>
                    </div>

                </div>

                {/* Footer Buttons */}
                <div className="p-6 pt-4 mt-2 flex justify-end gap-3 items-center">
                    <button
                        onClick={onClose}
                        className="text-[15px] font-semibold text-white hover:text-slate-300 px-4 py-2 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-[15px] font-semibold px-8 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-95">
                        Salvar
                    </button>
                </div>

            </div>
        </div>
    );
}
