import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Search, Trash2, Pencil, Eye, Users } from 'lucide-react';
import { UserModal } from '../components/ui/UserModal';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { EmptyState } from '../components/ui/EmptyState';
import { supabase } from '../supabaseClient';

export function UsuariosPage({ onNavigate, activePage, isPublic }) {
    // Modal states
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userModalMode, setUserModalMode] = useState('create'); // 'create', 'edit', 'view'
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(searchQuery);
        }, 400); // 400ms debounce
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchUsers = async (query = '') => {
        setIsLoading(true);
        try {
            let request = supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (query.trim()) {
                request = request.ilike('full_name', `%${query}%`);
            }

            const { data, error } = await request;

            if (error) throw error;

            // Map db schema to component state
            const mappedUsers = data.map(profile => ({
                id: profile.id,
                name: profile.full_name || 'Sem Nome',
                initials: getInitials(profile.full_name),
                color: 'bg-blue-500', // could be dynamic
                email: '.../auth...', // We don't have email in profiles by default unless we save it. Let's mock or use full_name
                access: profile.role === 'admin' ? 'Administrador' : profile.role === 'developer' ? 'Desenvolvedor' : 'Designer'
            }));

            setUsers(mappedUsers);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper syntax to get initials
    const getInitials = (nameStr) => {
        if (!nameStr) return '??';
        const parts = nameStr.trim().split(' ').filter(Boolean);
        if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    };

    const openUserModal = (mode, user = null) => {
        setUserModalMode(mode);
        setSelectedUser(user);
        setIsUserModalOpen(true);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteUser = async () => {
        if (selectedUser) {
            try {
                // Delete from DB
                const { error } = await supabase.from('profiles').delete().eq('id', selectedUser.id);
                if (error) throw error;

                setUsers(users.filter(u => u.id !== selectedUser.id));
                setIsDeleteModalOpen(false);
            } catch (err) {
                console.error("Erro ao excluir usuário:", err.message);
                alert("Erro ao excluir. Apenas admins podem deletar.");
            }
        }
    };

    const handleSaveUser = async (userData, mode) => {
        if (mode === 'create') {
            alert('Aviso: A criação de novos usuários no Auth via Client requer a tela de Cadastro. Use a página de Cadastro para Registrar.');
            return;
        } else if (mode === 'edit') {
            try {
                const roleMap = {
                    'Administrador': 'admin',
                    'Desenvolvedor': 'developer',
                    'Designer': 'designer'
                };

                const dbRole = roleMap[userData.access] || 'developer';

                const { error } = await supabase
                    .from('profiles')
                    .update({ full_name: userData.name, role: dbRole })
                    .eq('id', userData.id);

                if (error) throw error;

                userData.initials = getInitials(userData.name);
                setUsers(users.map(u => u.id === userData.id ? { ...u, ...userData } : u));
                setIsUserModalOpen(false);
            } catch (err) {
                console.error("Erro ao atualizar usuário:", err.message);
                alert("Erro ao atualizar usuário.");
            }
        }
    };

    // Note: We use "users" directly now since we are server-side filtering


    return (
        <DashboardLayout onNavigate={onNavigate} activePage={activePage} isPublic={isPublic}>

            {/* Page Header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Usuários</h1>
                    <p className="text-[#94a3b8] text-[15px]">Preencha o formulário e edite um componente.</p>
                </div>
                <button
                    onClick={() => openUserModal('create')}
                    className="h-10 px-5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-medium rounded-lg shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                >
                    Novo Usuário
                </button>
            </div>

            <div className="w-full h-px bg-white/5 mb-8" />

            {/* Search Bar */}
            <div className="relative group mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar usuário..."
                    className="w-full h-10 bg-[#1e252b] border border-white/5 rounded-lg pl-4 pr-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
                <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            {/* Users Table Container or Empty State */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : users.length > 0 ? (
                <div className="w-full overflow-hidden border border-white/5 rounded-t-lg bg-[#182029]">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="text-[11px] font-medium text-slate-400 border-b border-white/5 bg-[#182029]">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">Nome</th>
                                <th scope="col" className="px-6 py-3 font-medium">Acesso</th>
                                <th scope="col" className="px-6 py-3 font-medium w-32">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user.id} className="bg-[#1e252b] hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                                {user.initials}
                                            </div>
                                            <span className="font-medium text-slate-200">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                                        {user.access}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4 text-slate-400">
                                            <button onClick={() => openDeleteModal(user)} className="hover:text-white transition-colors"><Trash2 size={16} /></button>
                                            <button onClick={() => openUserModal('edit', user)} className="hover:text-white transition-colors"><Pencil size={16} /></button>
                                            <button onClick={() => openUserModal('view', user)} className="hover:text-white transition-colors"><Eye size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="mt-12 bg-[#1e252b]/50 border border-white/5 rounded-2xl">
                    <EmptyState
                        icon={Users}
                        title="Nenhum usuário encontrado"
                        description="Você ainda não adicionou nenhum usuário ou todos foram removidos. Adicione novos usuários para gerenciar os acessos ao sistema."
                        actionLabel="Adicionar Usuário"
                        onAction={() => openUserModal('create')}
                    />
                </div>
            )}

            {/* Modals */}
            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                mode={userModalMode}
                userData={selectedUser}
                onSave={handleSaveUser}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteUser}
                itemName={selectedUser?.name}
                type="user"
            />

        </DashboardLayout>
    );
}
