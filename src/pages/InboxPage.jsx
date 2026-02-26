import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Search, Calendar, Maximize2, Copy, ArrowUpRight, MessageSquareOff } from 'lucide-react';
import Button from '../components/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { CodeEditor } from '../components/ui/CodeEditor';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export function InboxPage({ onNavigate, activePage, isPublic }) {
    const [filter, setFilter] = useState('Ontem');
    const [dateValue, setDateValue] = useState('');

    const [feedItems, setFeedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInbox();
    }, []);

    const fetchInbox = async () => {
        setIsLoading(true);
        try {
            // Fetch components that have comments attached
            const { data, error } = await supabase
                .from('components')
                .select(`
                    id, 
                    name, 
                    description, 
                    created_at, 
                    profiles(full_name), 
                    comments(
                        id, 
                        content, 
                        created_at, 
                        user_id,
                        variant_name,
                        profiles(full_name)
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            // Filter out components with no comments and format for UI
            const formattedFeeds = data
                .filter(comp => comp.comments && comp.comments.length > 0)
                .map(comp => ({
                    id: comp.id,
                    authorName: comp.profiles?.full_name || 'Desconhecido',
                    date: new Date(comp.created_at).toLocaleDateString(),
                    time: new Date(comp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    componentName: comp.name,
                    componentDesc: comp.description,
                    comments: comp.comments
                        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                        .map(c => ({
                            id: c.id,
                            author: c.profiles?.full_name || 'Usuário',
                            date: new Date(c.created_at).toLocaleDateString(),
                            content: c.content,
                            variant_name: c.variant_name || 'Default',
                            initialBadge: (c.profiles?.full_name || 'U').charAt(0).toUpperCase(),
                            badgeColor: 'bg-[#3b82f6]',
                            shadowColor: 'shadow-blue-500/20'
                        }))
                }));

            setFeedItems(formattedFeeds);
        } catch (error) {
            console.error('Erro ao carregar inbox:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearInbox = () => {
        setFeedItems([]);
    };

    // Filter logic based on Date logic (simplified for prototype)
    const displayedItems = feedItems.filter(() => {
        if (!filter || filter === '15 dias') return true;
        // In a real scenario, compare `item.date` with real dates.
        return true;
    });

    return (
        <DashboardLayout onNavigate={onNavigate} activePage={activePage} isPublic={isPublic}>

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Inbox</h1>
                <p className="text-[#94a3b8] text-[15px]">Acompanhe os comentários adicionados nos componentes cadastrados.</p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-4 mb-10 w-full h-[40px]">

                {/* Search */}
                <div className="relative flex-1 min-w-[280px] h-full">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar no seu inbox..."
                        className="w-full h-full bg-transparent border border-white/10 rounded-lg px-4 pl-10 text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Duration Toggle */}
                <div className="flex bg-[#1e252b] rounded-lg p-1 border border-white/5 shrink-0 h-full">
                    {['Ontem', '7 dias', '15 dias'].map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={`px-4 text-xs font-semibold rounded-md transition-all h-full ${filter === item
                                ? 'bg-[#0ea5e9] text-white shadow-sm'
                                : 'text-[#94a3b8] hover:text-white'
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Date Picker (Native hack) */}
                <div className="relative shrink-0 h-full">
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

            {/* Inbox Content List */}
            <div className="max-w-[800px] flex flex-col gap-10">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : displayedItems.length > 0 ? (
                    <>
                        <div className="flex justify-end mb-[-20px]">
                            <button onClick={handleClearInbox} className="text-xs text-slate-500 hover:text-red-400 transition-colors">Limpar visualização</button>
                        </div>
                        {displayedItems.map(item => (
                            <FeedItem key={item.id} data={item} onNavigate={onNavigate} />
                        ))}
                    </>
                ) : (
                    <div className="bg-[#1e252b]/50 border border-white/5 rounded-2xl w-full">
                        <EmptyState
                            icon={MessageSquareOff}
                            title="Inbox vazio"
                            description="Você está em dia! Não há novos comentários ou interações pendentes nos seus componentes."
                        />
                    </div>
                )}
            </div>

        </DashboardLayout>
    );
}

// Subcomponent for each fed post (card + comments)
function FeedItem({ data, onNavigate }) {
    const [comments, setComments] = useState(data.comments || []);
    const [newComment, setNewComment] = useState('');
    const { user } = useAuth();
    const [isSending, setIsSending] = useState(false);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        if (!user) {
            alert('Você precisa estar logado para comentar.');
            return;
        }

        setIsSending(true);
        try {
            const { data: insertedData, error } = await supabase.from('comments').insert({
                component_id: data.id,
                user_id: user.id,
                content: newComment
            }).select('*, profiles(full_name)').single();

            if (error) throw error;

            setComments([...comments, {
                id: insertedData.id,
                author: insertedData.profiles?.full_name || 'Eu',
                date: new Date(insertedData.created_at).toLocaleDateString(),
                content: insertedData.content,
                initialBadge: (insertedData.profiles?.full_name || 'E').charAt(0).toUpperCase(),
                badgeColor: 'bg-[#0ea5e9]',
                shadowColor: 'shadow-sky-500/20'
            }]);
            setNewComment('');
        } catch (err) {
            console.error('Erro ao enviar comentário:', err);
            alert('Erro ao enviar o comentário. Tente novamente.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">

            {/* Component Card */}
            <div className="bg-[#1e252b] border border-white/5 rounded-2xl p-6">

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-white text-lg font-bold mb-1">{data.componentName}</h3>
                        <p className="text-xs text-[#94a3b8] mb-1">{data.componentDesc}</p>
                        <p className="text-[11px] text-slate-500">{data.authorName} - {data.time} - {data.date}</p>
                    </div>
                    <button
                        onClick={() => onNavigate && onNavigate('componente/' + data.id)}
                        className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                    >
                        Ver componente <ArrowUpRight size={14} />
                    </button>
                </div>

                {/* Preview and Code Split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

                    {/* Visual Preview */}
                    <div className="bg-[#171e25] rounded-xl border border-white/5 h-[200px] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                        <Button variant={data.componentName === 'Destructive' ? 'destructive' : 'primary'}>Text Button</Button>
                    </div>

                    {/* Code Editor Preview */}
                    <CodeEditor
                        showTabs={true}
                        readOnly={true}
                        initialCode={{ HTML: `<Button variant="${data.componentName === 'Destructive' ? 'destructive' : 'primary'}">\n  Text Button\n</Button>` }}
                        className="h-[200px] bg-[#111822] border-white/5"
                    />
                </div>
            </div>

            {/* Comment Block List */}
            {comments.map((comment) => (
                <div key={comment.id} className="bg-[#1e252b]/50 border border-white/5 rounded-2xl p-4 flex gap-4 ml-6 relative group transition-colors hover:bg-[#1e252b]">
                    {/* Only show the top stem on the first comment if we want, or on all of them connecting. Simplified to just straight line for now. */}
                    <div className="absolute -left-[14px] top-6 w-[20px] border-t border-l border-white/10 h-10 rounded-tl-lg" />
                    <div className={`w-8 h-8 rounded-full ${comment.badgeColor} text-white flex items-center justify-center font-bold text-sm shrink-0 z-10 shadow-lg ${comment.shadowColor}`}>
                        {comment.initialBadge}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-white">{comment.author}</span>
                            <span className="text-[11px] text-slate-500">{comment.date} • {comment.variant_name}</span>
                        </div>
                        <p className="text-xs text-[#94a3b8] leading-relaxed mb-4">
                            {comment.content}
                        </p>
                        <div className="flex justify-end">
                            <button className="text-[11px] font-semibold text-slate-300 hover:text-white transition-colors">Responder</button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Comment Input */}
            <div className="flex items-center gap-4 ml-6 mt-2 relative">
                <div className="absolute -left-[14px] top-6 w-[20px] border-t border-l border-white/10 h-10 rounded-tl-lg" />
                <div className="w-8 h-8 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center font-bold text-sm shrink-0 z-10 shadow-lg shadow-sky-500/20">
                    C
                </div>
                <div className="flex-1 flex gap-2 w-full">
                    <input
                        type="text"
                        placeholder="Adicionar um comentário"
                        className="flex-1 w-full bg-[#1e252b] border border-white/5 rounded-full px-5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment();
                        }}
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={isSending}
                        className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
                    >
                        {isSending ? 'Enviando...' : 'Enviar'}
                    </button>
                </div>
            </div>

        </div>
    );
}
