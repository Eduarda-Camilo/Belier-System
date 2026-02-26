import React, { useState, useEffect } from 'react';
import { CodeEditor } from '../ui/CodeEditor';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

export function PreviewCard({ title, description, children, initialTab = 'Preview', codeString, isPublic = false, componentId = null, variantName = 'Default' }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const { user } = useAuth();

    // Comments state
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const fetchComments = React.useCallback(async () => {
        if (!componentId) {
            // Mock data fallback if no real component ID is provided
            setComments([{
                id: 1, author: 'Sistema', date: 'Agora',
                content: 'Estes são comentários de demonstração. Conecte um component_id real para buscar do banco.',
                initialBadge: 'S', badgeColor: 'bg-[#3b82f6]', shadowColor: 'shadow-blue-500/20'
            }]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*, profiles(full_name)')
                .eq('component_id', componentId)
                .eq('variant_name', variantName)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const formattedComments = data.map(item => ({
                id: item.id,
                author: item.profiles?.full_name || 'Usuário Anônimo',
                date: new Date(item.created_at).toLocaleDateString(),
                content: item.content,
                initialBadge: (item.profiles?.full_name || 'U').charAt(0).toUpperCase(),
                badgeColor: 'bg-[#0ea5e9]',
                shadowColor: 'shadow-sky-500/20'
            }));

            setComments(formattedComments);
        } catch (error) {
            console.error('Erro ao buscar comentários:', error);
        }
    }, [componentId, variantName]);

    useEffect(() => {
        if (activeTab === 'Comentários') {
            fetchComments();
        }
    }, [activeTab, fetchComments]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        if (!componentId) {
            alert('Não é possível adicionar comentários a um componente de demonstração (mock).');
            return;
        }

        if (!user) {
            alert('Você precisa estar logado para comentar.');
            return;
        }

        // Optimistic UI update or disable input while loading
        const placeholderComment = {
            id: 'temp-' + Date.now(),
            author: user.user_metadata?.full_name || 'Eu',
            date: 'Salvando...',
            content: newComment,
            initialBadge: (user.user_metadata?.full_name || 'E').charAt(0).toUpperCase(),
            badgeColor: 'bg-[#0ea5e9]',
            shadowColor: 'shadow-sky-500/20'
        };

        setComments([...comments, placeholderComment]);
        const commentText = newComment;
        setNewComment('');

        try {
            const { data, error } = await supabase.from('comments').insert({
                component_id: componentId,
                variant_name: variantName,
                user_id: user.id,
                content: commentText
            }).select('*, profiles(full_name)').single();

            if (error) throw error;

            setComments(prev => prev.map(c => c.id === placeholderComment.id ? {
                id: data.id,
                author: data.profiles?.full_name || 'Eu',
                date: new Date(data.created_at).toLocaleDateString(),
                content: data.content,
                initialBadge: (data.profiles?.full_name || 'E').charAt(0).toUpperCase(),
                badgeColor: 'bg-[#0ea5e9]',
                shadowColor: 'shadow-sky-500/20'
            } : c));

        } catch (error) {
            console.error('Erro ao salvar comentário:', error);
            alert('Erro ao salvar comentário.');
            // Revert optimistic update
            setComments(prev => prev.filter(c => c.id !== placeholderComment.id));
            setNewComment(commentText);
        }
    };

    return (
        <section id={title.toLowerCase()} className="mb-12 scroll-mt-24">
            {/* Block Header */}
            <h2 className="text-[22px] font-bold text-white mb-2">{title}</h2>
            {description && <p className="text-[#94a3b8] text-[15px] mb-6">{description}</p>}

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => setActiveTab('Preview')}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${activeTab === 'Preview'
                        ? 'bg-[#0ea5e9] text-white shadow-md shadow-sky-500/20'
                        : 'bg-transparent text-[#94a3b8] hover:text-white border border-[#2d3748] hover:border-[#475569]'
                        }`}
                >
                    Preview
                </button>
                <button
                    onClick={() => setActiveTab('Código')}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${activeTab === 'Código'
                        ? 'bg-[#0ea5e9] text-white shadow-md shadow-sky-500/20'
                        : 'bg-transparent text-[#94a3b8] hover:text-white border border-[#2d3748] hover:border-[#475569]'
                        }`}
                >
                    Código
                </button>
                <button
                    onClick={() => setActiveTab('Comentários')}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${activeTab === 'Comentários'
                        ? 'bg-[#0ea5e9] text-white shadow-md shadow-sky-500/20'
                        : 'bg-transparent text-[#94a3b8] hover:text-white border border-[#2d3748] hover:border-[#475569]'
                        }`}
                >
                    Comentários
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'Preview' && (
                <div className="w-full bg-[#1e252b] border border-white/5 rounded-xl min-h-[200px] flex items-center justify-center p-8 relative overflow-hidden">
                    {children}
                </div>
            )}

            {activeTab === 'Código' && (
                <div className="w-full">
                    <CodeEditor
                        showTabs={false}
                        readOnly={true}
                        initialCode={{ HTML: codeString || '// Código do componente aqui\n<Button>Text Button</Button>' }}
                        className="!mt-0"
                    />
                </div>
            )}

            {activeTab === 'Comentários' && (
                <div className="w-full flex mt-4 border-t border-white/5 pt-6 relative">
                    {/* Decorative timeline line */}
                    <div className="absolute left-[38px] top-6 bottom-10 w-px bg-white/5" />

                    <div className="flex flex-col gap-6 w-full">
                        {/* List of Comments */}
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4 relative z-10 w-full mb-2 group">
                                <div className={`w-8 h-8 rounded-full ${comment.badgeColor} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg ${comment.shadowColor}`}>
                                    {comment.initialBadge}
                                </div>
                                <div className="flex-1 bg-[#1e252b]/50 border border-white/5 rounded-2xl p-4 transition-colors group-hover:bg-[#1e252b]">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-white">{comment.author}</span>
                                        <span className="text-[11px] text-slate-500">{comment.date}</span>
                                    </div>
                                    <p className="text-xs text-[#94a3b8] leading-relaxed mb-4">
                                        {comment.content}
                                    </p>
                                    {!isPublic && (
                                        <div className="flex justify-end">
                                            <button className="text-[11px] font-semibold text-slate-300 hover:text-white transition-colors">Responder</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Add comment input area - Hidden for public view */}
                        {!isPublic && (
                            <div className="flex items-center gap-4 w-full relative z-10">
                                <div className="w-8 h-8 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-sky-500/20">
                                    C
                                </div>
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Adicionar um comentário"
                                        className="flex-1 bg-[#1e252b] border border-white/5 rounded-full px-5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddComment();
                                        }}
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
                                    >
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
