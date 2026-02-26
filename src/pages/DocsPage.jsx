import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { supabase } from '../supabaseClient';
import { ArrowRight, LayoutGrid, Copy, Check, Terminal, Palette, Code2, Users, History, Zap } from 'lucide-react';

export function DocsPage({ onNavigate, activePage, isPublic }) {
    const [components, setComponents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const docsOutline = [
        { id: 'start', label: 'Introdução' },
        { id: 'funciona', label: 'Como Funciona' },
        { id: 'guia', label: 'Guia de Uso' },
        { id: 'components-grid', label: 'Componentes' }
    ];

    useEffect(() => {
        fetchComponents();
    }, []);

    const fetchComponents = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('components')
                .select('id, name, description')
                .order('name');

            if (error) throw error;
            setComponents(data || []);
        } catch (error) {
            console.error("Erro ao carregar componentes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(`<Button variant="primary">Continuar</Button>`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <DashboardLayout onNavigate={onNavigate} activePage={activePage} isPublic={isPublic} outlineContent={docsOutline}>

            {/* HERO SECTION (Option A with B touches) */}
            <div id="start" className="mb-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e252b] to-[#111822] border border-white/10 p-10 lg:p-14 scroll-mt-24">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-[#0ea5e9] rounded-full blur-[120px] opacity-20 pointer-events-none" />

                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#0ea5e9] text-xs font-semibold uppercase tracking-wider mb-6">
                        <Zap size={14} /> Belier UI
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                        Construa interfaces escaláveis <br className="hidden lg:block" />mais rápido e melhor.
                    </h1>
                    <p className="text-lg text-[#94a3b8] mb-8 leading-relaxed max-w-2xl">
                        Feito por Designers e Devs, para o mundo.
                        Sua única fonte de verdade para botões, inputs, modais e layouts.
                        Mantenha a padronização visual em todos os projetos, unindo <strong className="text-white font-medium">Designers e Devs</strong> em um único fluxo.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => {
                                const el = document.getElementById('components-grid');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <LayoutGrid size={18} /> Explorar Biblioteca
                        </button>
                    </div>
                </div>
            </div>

            {/* HOW IT WORKS / THE TWO WORLDS (Option B) */}
            <div id="funciona" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 scroll-mt-24">

                {/* For Designers */}
                <div className="bg-[#1e252b]/50 border border-white/5 rounded-2xl p-8 hover:bg-[#1e252b] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
                        <Palette size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Para Designers</h3>
                    <p className="text-[#94a3b8] text-sm leading-relaxed mb-6">
                        Crie e gerencie as documentações de cada variante. Aprove o visual final, deixe comentários de ajustes diretamente nos componentes salvos e evite que a equipe de Devs crie botões "frankenstein" fora do padrão.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-sm text-slate-300">
                            <Check size={16} className="text-purple-400 mt-0.5 shrink-0" /> Garanta a consistência da marca.
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-300">
                            <Check size={16} className="text-purple-400 mt-0.5 shrink-0" /> Histórico de versões (ChangeLog).
                        </li>
                    </ul>
                </div>

                {/* For Developers */}
                <div className="bg-[#1e252b]/50 border border-white/5 rounded-2xl p-8 hover:bg-[#1e252b] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                        <Terminal size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Para Desenvolvedores</h3>
                    <p className="text-[#94a3b8] text-sm leading-relaxed mb-6">
                        Nós somos aversos ao NPM superlotado. Aqui não tem <code>npm install belier-ui</code> com 50MB de dependências. Achou o componente? Copie o HTML/Tailwind e cole no seu código. Limpo, rápido e sem dor de cabeça.
                    </p>

                    {/* Fake Code Block */}
                    <div className="bg-[#111822] border border-white/10 rounded-lg p-3 flex items-center justify-between group overflow-hidden max-w-full">
                        <div className="flex-1 overflow-x-auto mr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-1">
                            <code className="text-sm font-mono text-emerald-400 pl-2 whitespace-nowrap">
                                <span className="text-slate-500">&lt;</span><span className="text-pink-400">Button</span> <span className="text-sky-300">variant</span><span className="text-slate-500">="</span><span className="text-amber-300">primary</span><span className="text-slate-500">"&gt;</span>Continuar<span className="text-slate-500">&lt;/</span><span className="text-pink-400">Button</span><span className="text-slate-500">&gt;</span>
                            </code>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-md transition-colors"
                        >
                            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>

            </div>

            {/* WHEN TO USE / MAP (Option B + C hybrid) */}
            <div id="guia" className="mb-20 scroll-mt-24">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-6 bg-[#0ea5e9] rounded-full" />
                    <h2 className="text-2xl font-bold text-white tracking-tight">Guia da Plataforma</h2>
                </div>

                <div className="bg-[#1e252b] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">

                        {/* Map Item 1 */}
                        <div className="p-8 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-4 mb-4">
                                <Code2 className="text-[#0ea5e9]" size={24} />
                                <h4 className="text-lg font-bold text-white">Quando usar o BelierUI?</h4>
                            </div>
                            <p className="text-[#94a3b8] text-sm leading-relaxed">
                                Use quando precisar padronizar a interface de múltiplos projetos da sua empresa, ou quando quiser código Tailwind cru e componentizado para iniciar um projeto React/Next.js na velocidade da luz. Ideal para equipes escalarem mantendo o mesmo idioma visual.
                            </p>
                        </div>

                        {/* Map Item 2 */}
                        <div className="p-8 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-4 mb-4">
                                <History className="text-[#0ea5e9]" size={24} />
                                <h4 className="text-lg font-bold text-white">Quando NÃO usar?</h4>
                            </div>
                            <p className="text-[#94a3b8] text-sm leading-relaxed">
                                Não use se você está construindo apenas uma Landing Page temporária de final de semana (onde fazer e documentar um componente completo é um exagero). O BelierUI foca na longevidade e colaboração, não em layouts descartáveis.
                            </p>
                        </div>

                    </div>

                    <div className="border-t border-white/5 bg-[#171e25] p-6 text-center">
                        <p className="text-sm text-slate-400">
                            <strong>Papéis no Sistema:</strong> <Users size={14} className="inline mx-1 -mt-0.5" /> <strong className="text-white">Admin</strong> gerencia usuários, <strong className="text-white">Designers</strong> aprovam UX, <strong className="text-white">Devs</strong> implementam código limitados ao CRUD de componentes.
                        </p>
                    </div>
                </div>
            </div>

            {/* DIVIDER TO GRID */}
            <div id="components-grid" className="scroll-mt-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Nossos Componentes</h2>
                    <span className="text-sm font-medium text-slate-400 bg-[#1e252b] px-3 py-1 rounded-full border border-white/5">{components.length} items</span>
                </div>
            </div>

            {/* Content Array */}
            {isLoading ? (
                <div className="flex justify-center w-full py-20">
                    <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {components.map(comp => (
                        <div
                            key={comp.id}
                            onClick={() => onNavigate && onNavigate(`componente/${comp.id}`)}
                            className="bg-[#1e252b] border border-white/5 hover:border-[#0ea5e9]/50 rounded-2xl p-6 cursor-pointer group transition-all hover:bg-[#1e252b]/80 hover:shadow-lg hover:shadow-[#0ea5e9]/10 flex flex-col h-full"
                        >
                            <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center mb-4 group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors">
                                <LayoutGrid size={20} />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">{comp.name}</h3>
                            <p className="text-[#94a3b8] text-sm flex-1 mb-6 line-clamp-3 leading-relaxed">
                                {comp.description || 'Nenhuma descrição fornecida.'}
                            </p>
                            <div className="flex items-center text-[#0ea5e9] text-sm font-semibold mt-auto group-hover:translate-x-1 transition-transform">
                                Ver documentação <ArrowRight size={16} className="ml-2" />
                            </div>
                        </div>
                    ))}
                    {components.length === 0 && (
                        <div className="col-span-full py-10 flex flex-col items-center justify-center text-slate-500">
                            <LayoutGrid size={48} className="mb-4 opacity-50" />
                            <p>Nenhum componente cadastrado ainda.</p>
                        </div>
                    )}
                </div>
            )}

        </DashboardLayout>
    );
}
