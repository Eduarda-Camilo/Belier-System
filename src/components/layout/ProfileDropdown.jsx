import React, { useState, useRef, useEffect } from 'react';
import { Users, User, LogOut } from 'lucide-react';
import { ProfileModal } from '../ui/ProfileModal';
import { useAuth } from '../../context/AuthContext';

export function ProfileDropdown({ onNavigate }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { user, signOut } = useAuth();

    const userName = user?.user_metadata?.full_name || user?.email || 'Usuário';
    const userRole = user?.user_metadata?.role || 'user';
    const userColor = 'bg-[#0ea5e9]';

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // Don't close the modal if clicking outside when the modal is open
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper to get initials
    const getInitials = (nameStr) => {
        if (!nameStr) return '??';
        const parts = nameStr.trim().split(' ').filter(Boolean);
        if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    };

    const displayInitials = getInitials(userName);

    const handleAction = async (action) => {
        setIsOpen(false);
        if (action === 'perfil') {
            setIsProfileModalOpen(true);
            return;
        }

        if (action === 'logout') {
            await signOut();
            if (onNavigate) onNavigate('login');
            return;
        }

        if (onNavigate) {
            onNavigate(action);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-10 w-10 rounded-full ${userColor} flex items-center justify-center text-white text-sm font-bold shadow-md shadow-sky-500/10 ring-2 ring-transparent hover:ring-white/20 focus:ring-white/20 transition-all outline-none`}
            >
                {displayInitials}
            </button>

            {isOpen && (
                <div className="absolute top-[48px] right-0 w-[240px] bg-[#0c2f42] border border-blue-500/20 rounded-xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">

                    {/* User Info Header */}
                    <div className="p-4 flex items-center gap-3 border-b border-blue-400/20">
                        <div className={`h-10 w-10 rounded-full ${userColor} shrink-0 flex items-center justify-center text-white text-sm font-bold`}>
                            {displayInitials}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-white text-sm font-medium truncate">{userName}</span>
                            <span className="text-blue-100/70 text-[11px] truncate">
                                {userRole === 'admin' ? 'Administrador' : userRole === 'dev' ? 'Desenvolvedor' : 'Designer'}
                            </span>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-1">
                        {userRole === 'admin' && (
                            <button
                                onClick={() => handleAction('usuarios')}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-50/90 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                            >
                                <Users size={16} /> Usuários
                            </button>
                        )}

                        <button
                            onClick={() => handleAction('perfil')}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-50/90 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                        >
                            <User size={16} /> Perfil
                        </button>
                    </div>

                    {/* Logout Action */}
                    <div className="p-2 border-t border-blue-400/20">
                        <button
                            onClick={() => handleAction('logout')}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-50/90 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                        >
                            <LogOut size={16} /> Sair
                        </button>
                    </div>

                </div>
            )}

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </div>
    );
}
