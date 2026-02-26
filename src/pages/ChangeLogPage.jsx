import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, Calendar, ExternalLink } from 'lucide-react';
import Button from '../components/Button';
import { CodeEditor } from '../components/ui/CodeEditor';
import { supabase } from '../supabaseClient';

export function ChangeLogPage({ onNavigate }) {
    const [filter, setFilter] = useState('Ontem');
    const [dateValue, setDateValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [changes, setChanges] = useState([]);

    React.useEffect(() => {
        fetchChangeLog();
    }, []);

    const fetchChangeLog = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('changelog')
                .select(`
                    id, 
                    component_id,
                    version_data, 
                    created_at, 
                    profiles(full_name),
                    components(name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formatted = data.map(item => ({
                id: item.id,
                title: item.components?.name || 'Componente Removido',
                description: item.version_data.description || 'Atualização de componente',
                author: item.profiles?.full_name || 'Usuário',
                time: `${new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(item.created_at).toLocaleDateString()}`,
                component_id: item.component_id,
                code: item.version_data.code || {}
            }));

            setChanges(formatted);
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter logic simplified
    const displayedChanges = changes.filter(() => {
        if (!filter || filter === '15 dias') return true;
        return true;
    });

    return (
        <DashboardLayout>

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">ChangeLog</h1>
                <p className="text-[#94a3b8] text-[15px]">Descrição</p>
            </div>

            <div className="w-full h-px bg-white/5 mb-8" />

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 mb-10">

                {/* Search */}
                <div className="relative group flex-1 min-w-[200px]">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar no seu histórico..."
                        className="w-full h-10 bg-[#1e252b] border border-white/5 rounded-lg pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                    />
                    {/* Search Icon on right as per design (magnifying glass) - actually design has it on left usually but let's stick to standard or check image carefully. Image shows left icon. Wait, the input has a search icon on the RIGHT in the image? No, image has icon on LEFT. Wait, looking at the second image 'ChangeLog Empty', the search input has a magnifying glass on the RIGHT. Let's adjust. */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                        <Search size={16} />
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex bg-[#1e252b] rounded-lg p-1 border border-white/5">
                    {['Ontem', '7 dias', '15 dias'].map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${filter === item
                                ? 'bg-[#0ea5e9] text-white shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Date Picker (Native hack) */}
                <div className="relative shrink-0 h-10">
                    <input
                        type="date"
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                        className="h-full bg-[#1e252b] border border-white/5 rounded-lg pl-4 pr-10 text-xs text-slate-300 w-[140px] appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-10 bg-transparent"
                    />
                    <div className="absolute inset-0 bg-[#1e252b] border border-white/5 rounded-lg flex items-center px-4 pointer-events-none overflow-hidden z-0">
                        <span className="text-xs text-slate-400">{dateValue ? new Date(dateValue).toLocaleDateString('pt-BR') : 'dd/mm/aaaa'}</span>
                        <Calendar size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                    </div>
                </div>

            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : displayedChanges.length > 0 ? (
                <div className="space-y-6">
                    {displayedChanges.map((change) => (
                        <div key={change.id} className="bg-[#1e252b] border border-white/5 rounded-xl p-6">

                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">{change.title}</h3>
                                    <p className="text-slate-400 text-xs mb-1">{change.description}</p>
                                    <p className="text-slate-500 text-[10px]">{change.author} - {change.time}</p>
                                </div>
                                {change.component_id ? (
                                    <button
                                        onClick={() => onNavigate && onNavigate(`componente/${change.component_id}`)}
                                        className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors group"
                                    >
                                        Ver componente <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </button>
                                ) : (
                                    <span className="text-[10px] text-red-400 border border-red-500/20 bg-red-500/10 px-2 py-1 rounded">Excluído</span>
                                )}
                            </div>

                            {/* Card Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Preview Box */}
                                <div className="bg-[#171e25] rounded-xl border border-white/5 h-[200px] flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                                    {change.code?.HTML ? (
                                        <>
                                            <div dangerouslySetInnerHTML={{ __html: change.code.HTML }} />
                                            {change.code.CSS && <style>{change.code.CSS}</style>}
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-500">Sem preview visual</span>
                                    )}
                                </div>

                                {/* Code Box */}
                                <CodeEditor
                                    className="h-[200px] bg-[#111822] border-white/5"
                                    readOnly={true}
                                    initialCode={change.code}
                                />

                            </div>

                        </div>
                    ))}
                </div>
            ) : (
                <div className="w-full flex-1 flex flex-col justify-center min-h-[400px]">
                    <EmptyState />
                </div>
            )}

        </DashboardLayout>
    );
}
