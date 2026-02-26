import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CodeEditor } from '../components/ui/CodeEditor';
import { Copy, Maximize2, Trash2, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export function NovoComponentePage({ onNavigate }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [defaultCode, setDefaultCode] = useState({});

    // Dynamic variables array
    const [variables, setVariables] = useState([
        { id: 1, name: '', description: '', code: {} }
    ]);

    const [isSaving, setIsSaving] = useState(false);
    const { user } = useAuth();

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
        { label: 'Novo Componente', id: 'top', isActive: true },
        { label: 'Informações básicas', id: 'basic-info', isActive: false },
        { label: 'Import', id: 'import', isActive: false },
        { label: 'Variáveis do componente', id: 'variables', isActive: false },
    ];

    const handleSaveComponent = async () => {
        if (!name || !description) {
            alert('Preencha pelo menos o Nome e Descrição do componente.');
            return;
        }

        setIsSaving(true);
        try {
            const componentData = {
                name,
                description,
                default_code: JSON.stringify({ default: defaultCode, variables }),
                author_id: user?.id,
            };

            const { data: insertedData, error } = await supabase.from('components').insert(componentData).select('id').single();

            if (error) throw error;

            if (insertedData) {
                await supabase.from('changelog').insert({
                    component_id: insertedData.id,
                    author_id: user?.id,
                    version_data: {
                        description: "Criou um novo componente na biblioteca",
                        code: defaultCode
                    }
                });
            }

            alert('Componente salvo no Supabase com sucesso!');
            if (onNavigate) onNavigate('docs');
        } catch (error) {
            console.error('Erro ao salvar componente:', error);
            alert('Erro ao salvar o componente no servidor.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout outlineContent={outlineContent}>

            {/* Page Header */}
            <div className="mb-10 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Novo Componente</h1>
                    <p className="text-[#94a3b8] text-[15px]">Preencha o formulário e cadastre um novo componente.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onNavigate && onNavigate('docs')}
                        disabled={isSaving}
                        className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSaveComponent}
                        disabled={isSaving}
                        className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-medium px-5 py-2 rounded-lg shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : null}
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
                                    className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors p-2 rounded-lg"
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

        </DashboardLayout>
    );
}
