import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CodeEditor } from '../components/ui/CodeEditor';
import { Copy, Maximize2, Trash2, Plus } from 'lucide-react';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export function EditarComponentePage({ onNavigate, activePage, isPublic, componentId }) {
    const { user } = useAuth();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [defaultCode, setDefaultCode] = useState({});

    // Dynamic variables array for editing existing component
    const [variables, setVariables] = useState([]);

    React.useEffect(() => {
        if (componentId) fetchComponent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [componentId]);

    const fetchComponent = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from('components').select('*').eq('id', componentId).single();
            if (error) throw error;

            setName(data.name);
            setDescription(data.description || '');

            try {
                const parsed = JSON.parse(data.default_code || '{}');
                if (parsed.default) setDefaultCode(parsed.default);
                if (parsed.variables) setVariables(parsed.variables);
            } catch (e) {
                console.error("Parse erro", e);
            }
        } catch (error) {
            console.error("Erro ao carregar componente:", error);
        }
    };

    const handleAddVariable = () => {
        setVariables([...variables, { id: Date.now(), name: '', description: '', code: {} }]);
    };

    const handleVariableChange = (id, field, value) => {
        setVariables(variables.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const handleRemoveVariable = (id) => {
        setVariables(variables.filter(v => v.id !== id));
    };

    const outlineContent = [
        { label: 'Editar Componente', id: 'basic-info', isActive: true },
        { label: 'Variáveis do componente', id: 'variables', isActive: false },
    ];

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveComponent = async () => {
        if (!name || !description) {
            alert("Nome e descrição são obrigatórios.");
            return;
        }

        setIsSaving(true);
        try {
            const componentData = {
                name,
                description,
                default_code: JSON.stringify({ default: defaultCode, variables })
            };

            const { error: updateError } = await supabase
                .from('components')
                .update(componentData)
                .eq('id', componentId);

            if (updateError) throw updateError;

            // Insert into ChangeLog
            const { error: changelogError } = await supabase
                .from('changelog')
                .insert([{
                    component_id: componentId,
                    author_id: user.id,
                    version_data: {
                        description: "Atualização de componente e variáveis",
                        code: defaultCode
                    }
                }]);

            if (changelogError) throw changelogError;

            alert("Componente editado com sucesso!");
            if (onNavigate) onNavigate('docs');
        } catch (error) {
            console.error("Erro ao salvar edição:", error);
            alert("Erro ao editar componente: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteComponent = async () => {
        try {
            await supabase.from('changelog').insert([{
                component_id: null,
                author_id: user.id,
                version_data: {
                    description: `Excluiu o componente: ${name}`,
                    code: {}
                }
            }]);

            const { error } = await supabase.from('components').delete().eq('id', componentId);
            if (error) throw error;

            alert("Componente excluído com sucesso!");
            if (onNavigate) onNavigate('docs');
        } catch (error) {
            console.error("Erro ao excluir componente:", error);
            alert("Erro ao excluir componente: " + error.message);
        }
    };

    return (
        <DashboardLayout onNavigate={onNavigate} activePage={activePage} isPublic={isPublic} outlineContent={outlineContent}>

            {/* Page Header */}
            <div className="mb-10 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Editar Componente</h1>
                    <p className="text-[#94a3b8] text-[15px]">Preencha o formulário e edite um componente.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => onNavigate && onNavigate(componentId ? `componente/${componentId}` : 'docs')}
                        className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 border border-transparent hover:border-white/10 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-red-400 px-3 py-2 border border-transparent hover:border-red-500/20 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} /> Excluir
                    </button>
                    <button
                        onClick={handleSaveComponent}
                        disabled={isSaving}
                        className="bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg shadow-lg shadow-sky-500/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                        {isSaving ? 'Salvando...' : 'Salvar Componente'}
                    </button>
                </div>
            </div>

            {/* Informações Básicas */}
            <section id="basic-info" className="mb-12">
                <h2 className="text-[20px] font-bold text-white mb-1">Informações básicas</h2>
                <p className="text-[#94a3b8] text-sm mb-6">Descrição</p>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">
                            Nome do componente <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Digite..."
                            className="w-full bg-[#1e252b] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">
                            Descrição <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            placeholder="Digite..."
                            rows={4}
                            className="w-full bg-[#1e252b] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* Variáveis do componente */}
            <section id="variables" className="mb-12">
                <h2 className="text-[20px] font-bold text-white mb-1">Variáveis do componente</h2>
                <p className="text-[#94a3b8] text-sm mb-6">Crie variáveis do componente principal e preencha o default.</p>

                <div className="space-y-6">

                    {/* Default Block */}
                    <CodeEditor
                        title="Default"
                        subtitle="Versão padrão do componente principal."
                        initialCode={defaultCode}
                        onCodeChange={setDefaultCode}
                    />

                    {/* Variable Blocks */}
                    {variables.map((variable, index) => (
                        <div key={variable.id} className="bg-[#1e252b] border border-white/5 rounded-xl p-6 mt-8 relative group transition-all">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                        <h4 className="text-white text-base font-bold">
                                            Variável do componente {variables.length > 1 ? `#${index + 1}` : ''}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-500 pl-4.5">Defina nome, descrição e adicione o código do componente que você deseja adicionar.</p>
                                </div>
                                <button
                                    onClick={() => handleRemoveVariable(variable.id)}
                                    className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors p-2 rounded-lg opacity-0 group-hover:opacity-100"
                                    title="Remover variável"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="space-y-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-200">
                                        Nome do componente <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Digite..."
                                        className="w-full bg-[#111822] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        value={variable.name}
                                        onChange={(e) => handleVariableChange(variable.id, 'name', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-200">
                                        Descrição <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        placeholder="Digite..."
                                        rows={3}
                                        className="w-full bg-[#111822] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                                        value={variable.description}
                                        onChange={(e) => handleVariableChange(variable.id, 'description', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Nested Code Editor */}
                            <CodeEditor
                                className="bg-[#111822] border border-white/5 rounded-lg overflow-hidden mt-6"
                                initialCode={variable.code}
                                onCodeChange={(newCode) => handleVariableChange(variable.id, 'code', newCode)}
                            />
                        </div>
                    ))}

                    {/* Add Button */}
                    <button
                        onClick={handleAddVariable}
                        className="w-full mt-6 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-medium rounded-lg shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Adicionar variável
                    </button>

                </div>
            </section>

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteComponent}
                itemName={name || "Componente"}
                type="componente"
            />

        </DashboardLayout>
    );
}
