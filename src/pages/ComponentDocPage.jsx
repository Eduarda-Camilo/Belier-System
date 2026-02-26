import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PreviewCard } from '../components/docs/PreviewCard';
import { Pencil } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { EmptyState } from '../components/ui/EmptyState';

export function ComponentDocPage({ onNavigate, activePage, isPublic, componentId }) {
    const [componentData, setComponentData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pageData, setPageData] = useState({
        title: '',
        description: '',
        defaultVariant: null,
        variables: []
    });

    useEffect(() => {
        if (componentId) {
            fetchComponent();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [componentId]);

    const fetchComponent = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('components')
                .select('*')
                .eq('id', componentId)
                .single();

            if (error) throw error;

            let parsedCode = { default: null, variables: [] };
            try {
                parsedCode = JSON.parse(data.default_code || '{}');
            } catch (e) {
                console.error("Erro ao fazer parse do default_code", e);
            }

            setComponentData(data);
            setPageData({
                title: data.name,
                description: data.description,
                defaultVariant: parsedCode.default,
                variables: parsedCode.variables || []
            });

        } catch (error) {
            console.error("Erro ao buscar componente:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout onNavigate={onNavigate} activePage={activePage} isPublic={isPublic}>
                <div className="w-full flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!componentData) {
        return (
            <DashboardLayout onNavigate={onNavigate} activePage={activePage} isPublic={isPublic}>
                <div className="py-20 flex flex-col items-center">
                    <EmptyState />
                </div>
            </DashboardLayout>
        );
    }

    // Gerar outline (sumário) dinâmico
    const outlineContent = [
        { id: 'top', label: pageData.title },
        { id: 'default', label: 'Default' },
        ...pageData.variables.map(v => ({
            id: v.name.toLowerCase().replace(/\s+/g, '-'),
            label: v.name
        }))
    ];

    return (
        <DashboardLayout
            onNavigate={onNavigate}
            activePage={activePage}
            isPublic={isPublic}
            outlineContent={outlineContent}
        >
            {/* Page Header */}
            <div className="mb-12 border-b border-white/5 pb-8 flex items-start justify-between">
                <div>
                    <h1 id="top" className="text-3xl font-bold text-white mb-2 tracking-tight">{pageData.title}</h1>
                    <p className="text-[#94a3b8] text-[15px]">{pageData.description}</p>
                </div>
                {!isPublic && (
                    <button
                        onClick={() => onNavigate && onNavigate(`editar-componente/${componentId}`)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-white/5"
                    >
                        <Pencil size={14} /> Editar
                    </button>
                )}
            </div>

            {/* Default Section */}
            {pageData.defaultVariant && (
                <div id="default">
                    <PreviewCard
                        title="Default"
                        description="Versão padrão do componente."
                        codeString={pageData.defaultVariant.HTML || ''}
                        isPublic={isPublic}
                        componentId={componentId}
                        variantName="Default"
                    >
                        {pageData.defaultVariant.HTML && <div dangerouslySetInnerHTML={{ __html: pageData.defaultVariant.HTML }} />}
                        {pageData.defaultVariant.CSS && <style>{pageData.defaultVariant.CSS}</style>}
                    </PreviewCard>
                </div>
            )}

            {/* Variables Sections */}
            {pageData.variables.map((variable, idx) => {
                const sectionId = variable.name.toLowerCase().replace(/\s+/g, '-');
                return (
                    <div id={sectionId} key={idx}>
                        <PreviewCard
                            title={variable.name}
                            description={variable.description}
                            codeString={variable.code?.HTML || ''}
                            isPublic={isPublic}
                            componentId={componentId}
                            variantName={variable.name}
                        >
                            {variable.code?.HTML && <div dangerouslySetInnerHTML={{ __html: variable.code.HTML }} />}
                            {variable.code?.CSS && <style>{variable.code.CSS}</style>}
                        </PreviewCard>
                    </div>
                );
            })}

        </DashboardLayout>
    );
}
