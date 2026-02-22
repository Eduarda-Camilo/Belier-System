import { useState } from 'react';
import { Plus } from 'lucide-react';
import { FormField } from './FormField';
import { TextInput } from './TextInput';
import { TextArea } from './TextArea';
import { TagsInput } from './TagsInput';
import { CodeEditor } from './CodeEditor';
import { VariationCard, Variation } from './VariationCard';

interface ComponentFormData {
  title: string;
  slug: string;
  shortDescription: string;
  tags: string[];
  referenceLink: string;
  importPackage: string;
  exportedName: string;
  longDescription: string;
  dependencies: string;
  accessibility: string;
  variations: Variation[];
}

export function ComponentForm() {
  const [formData, setFormData] = useState<ComponentFormData>({
    title: '',
    slug: '',
    shortDescription: '',
    tags: [],
    referenceLink: '',
    importPackage: '',
    exportedName: '',
    longDescription: '',
    dependencies: '',
    accessibility: '',
    variations: [
      {
        id: 'default',
        name: 'Default',
        slug: 'default',
        description: '',
        code: '',
      },
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // Função para gerar slug a partir do título
  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData({ ...formData, slug });
    validateSlug(slug);
  };

  // Validação de slug
  const validateSlug = (slug: string) => {
    const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      setErrors({ ...errors, slug: 'Slug inválido. Use letras minúsculas e hífen.' });
      setSlugAvailable(null);
    } else {
      // Simula verificação de disponibilidade
      const { slug: _, ...restErrors } = errors;
      setErrors(restErrors);
      setSlugAvailable(true);
    }
  };

  // Adicionar nova variação
  const addVariation = () => {
    const newVariation: Variation = {
      id: `variation-${Date.now()}`,
      name: '',
      slug: '',
      description: '',
      code: '',
    };
    setFormData({
      ...formData,
      variations: [...formData.variations, newVariation],
    });
  };

  // Atualizar variação
  const updateVariation = (index: number, variation: Variation) => {
    const newVariations = [...formData.variations];
    newVariations[index] = variation;
    setFormData({ ...formData, variations: newVariations });
  };

  // Duplicar variação
  const duplicateVariation = (index: number) => {
    const variationToDuplicate = formData.variations[index];
    const newVariation: Variation = {
      ...variationToDuplicate,
      id: `variation-${Date.now()}`,
      name: `${variationToDuplicate.name} (cópia)`,
      slug: `${variationToDuplicate.slug}-copy`,
    };
    setFormData({
      ...formData,
      variations: [...formData.variations, newVariation],
    });
  };

  // Remover variação
  const removeVariation = (index: number) => {
    if (formData.variations[index].id === 'default') return;
    const newVariations = formData.variations.filter((_, i) => i !== index);
    setFormData({ ...formData, variations: newVariations });
  };

  // Validação do formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.length < 2) {
      newErrors.title = 'Título obrigatório (mínimo 2 caracteres)';
    }

    if (!formData.slug) {
      newErrors.slug = 'Slug obrigatório';
    } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'Slug inválido. Use letras minúsculas e hífen.';
    }

    if (!formData.shortDescription || formData.shortDescription.length < 10) {
      newErrors.shortDescription = 'Descrição curta obrigatória (mínimo 10 caracteres)';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'Pelo menos 1 tag obrigatória';
    }

    if (formData.referenceLink && !/^https?:\/\/.+/.test(formData.referenceLink)) {
      newErrors.referenceLink = 'URL inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Salvar componente
  const handleSave = () => {
    if (validateForm()) {
      console.log('Salvando componente:', formData);
      // Aqui seria feita a requisição para salvar
      alert('Componente criado com sucesso!');
    } else {
      alert('Por favor, corrija os erros no formulário');
    }
  };

  // Cancelar
  const handleCancel = () => {
    if (confirm('Deseja realmente cancelar? As alterações serão perdidas.')) {
      // Redirecionar para /components
      console.log('Cancelado');
    }
  };

  const showImportSnippet = formData.importPackage && formData.exportedName;

  return (
    <div className="content-stretch flex flex-col gap-[24px] h-full items-start relative w-full">
      {/* Header com título e botões */}
      <div className="content-stretch flex gap-[8px] items-start w-full">
        <p className="flex-[1_0_0] font-['Roboto_Flex:Bold',sans-serif] font-bold leading-[40px] text-[36px] text-white whitespace-pre-wrap" style={{ fontVariationSettings: "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100" }}>
          Novo componente
        </p>
        <button
          type="button"
          onClick={handleCancel}
          className="content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[6px] rounded-[8px] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          <p className="font-['Roboto_Flex:Medium',sans-serif] font-medium leading-[20px] text-[14px] text-white" style={{ fontVariationSettings: "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100" }}>
            Cancelar
          </p>
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="bg-[#16a6df] content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[6px] rounded-[10px] hover:bg-[#1494ca] transition-colors"
        >
          <p className="font-['Roboto_Flex:Medium',sans-serif] font-medium leading-[20px] text-[#fcfcfc] text-[14px]" style={{ fontVariationSettings: "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100" }}>
            Salvar
          </p>
        </button>
      </div>

      {/* SEÇÃO A - Informações básicas */}
      <div className="content-stretch flex gap-[24px] items-start pb-[24px] border-b border-[#3d4448] w-full">
        <div className="content-stretch flex items-start w-[280px]">
          <div className="content-stretch flex flex-col items-start leading-[0]">
            <div className="flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center text-[18px] text-white w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[28px] whitespace-pre-wrap">Informações básicas</p>
            </div>
            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center text-[#f5f5f5] text-[12px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[18px] whitespace-pre-wrap">Dados essenciais do componente</p>
            </div>
          </div>
        </div>

        <div className="content-stretch flex flex-1 flex-col gap-[16px] items-start">
          <FormField
            label="Título"
            required
            helperText="Nome principal do componente no catálogo e na documentação."
            error={errors.title}
          >
            <TextInput
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              placeholder="Ex.: Botão"
              error={errors.title}
            />
          </FormField>

          <FormField
            label="Slug"
            required
            helperText="Identificador único (sem acentos) usado na URL e no sistema. Use letras minúsculas e hífen."
            error={errors.slug}
          >
            <div className="flex gap-[8px] items-start w-full">
              <div className="flex-1">
                <TextInput
                  value={formData.slug}
                  onChange={(value) => {
                    setFormData({ ...formData, slug: value });
                    validateSlug(value);
                  }}
                  placeholder="ex.: botao"
                  error={errors.slug}
                />
              </div>
              <button
                type="button"
                onClick={generateSlug}
                className="px-[12px] py-[10px] rounded-[8px] hover:bg-[rgba(255,255,255,0.05)] transition-colors whitespace-nowrap"
              >
                <span className="font-['Open_Sans:Medium',sans-serif] text-[14px] text-[#16a6df]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Gerar do título
                </span>
              </button>
            </div>
            {slugAvailable && !errors.slug && (
              <p className="font-['Open_Sans:Regular',sans-serif] text-[12px] text-[#00E676] mt-[4px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                ✓ Slug disponível
              </p>
            )}
          </FormField>

          <FormField
            label="Descrição curta"
            required
            helperText="Aparece no card/lista do componente e no topo da documentação."
            error={errors.shortDescription}
          >
            <TextArea
              value={formData.shortDescription}
              onChange={(value) => setFormData({ ...formData, shortDescription: value })}
              placeholder="Resumo em 1–2 frases sobre quando usar este componente."
              rows={3}
              error={errors.shortDescription}
            />
          </FormField>

          <FormField
            label="Tags"
            required
            helperText="Use tags para facilitar a busca e a organização. Recomendado: 2–5 tags."
            error={errors.tags}
          >
            <TagsInput
              value={formData.tags}
              onChange={(value) => setFormData({ ...formData, tags: value })}
              placeholder="Digite e pressione Enter (ex.: formulário, navegação, feedback)"
              error={errors.tags}
            />
          </FormField>

          <FormField
            label="Link de referência"
            helperText="Link para referência externa (Figma, docs, issue, benchmark ou implementação existente)."
            error={errors.referenceLink}
          >
            <TextInput
              value={formData.referenceLink}
              onChange={(value) => setFormData({ ...formData, referenceLink: value })}
              placeholder="https://…"
              type="url"
              error={errors.referenceLink}
            />
          </FormField>
        </div>
      </div>

      {/* SEÇÃO B - Como importar */}
      <div className="content-stretch flex gap-[24px] items-start pb-[24px] border-b border-[#3d4448] w-full">
        <div className="content-stretch flex items-start w-[280px]">
          <div className="content-stretch flex flex-col items-start leading-[0]">
            <div className="flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center text-[18px] text-white w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[28px] whitespace-pre-wrap">Como importar</p>
            </div>
            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center text-[#f5f5f5] text-[12px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[18px] whitespace-pre-wrap">Informações de importação (opcional)</p>
            </div>
          </div>
        </div>

        <div className="content-stretch flex flex-1 flex-col gap-[16px] items-start">
          <FormField
            label="Pacote (import)"
            helperText="Caminho do pacote usado para importar este componente quando houver biblioteca instalada."
          >
            <TextInput
              value={formData.importPackage}
              onChange={(value) => setFormData({ ...formData, importPackage: value })}
              placeholder="@belier/ui"
            />
          </FormField>

          <FormField
            label="Nome exportado"
            helperText="Nome do export do componente. Ex.: Button, Input, Card."
          >
            <TextInput
              value={formData.exportedName}
              onChange={(value) => setFormData({ ...formData, exportedName: value })}
              placeholder="Button"
            />
          </FormField>

          {showImportSnippet ? (
            <div className="w-full">
              <p className="font-['Open_Sans:SemiBold',sans-serif] text-[14px] text-white mb-[8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Snippet de importação
              </p>
              <CodeEditor
                value={`import { ${formData.exportedName} } from "${formData.importPackage}";`}
                onChange={() => {}}
                language="javascript"
                height="60px"
                readOnly
              />
            </div>
          ) : (
            <div className="bg-[rgba(255,255,255,0.03)] border border-[#3d4448] rounded-[8px] p-[16px] w-full">
              <p className="font-['Open_Sans:Regular',sans-serif] text-[14px] text-[#cbd4d6]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Preencha Pacote e Nome exportado para gerar o snippet de importação.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO C - Documentação */}
      <div className="content-stretch flex gap-[24px] items-start pb-[24px] border-b border-[#3d4448] w-full">
        <div className="content-stretch flex items-start w-[280px]">
          <div className="content-stretch flex flex-col items-start leading-[0]">
            <div className="flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center text-[18px] text-white w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[28px] whitespace-pre-wrap">Documentação</p>
            </div>
            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center text-[#f5f5f5] text-[12px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[18px] whitespace-pre-wrap">Conteúdo em Markdown (opcional)</p>
            </div>
          </div>
        </div>

        <div className="content-stretch flex flex-1 flex-col gap-[16px] items-start">
          <FormField
            label="Descrição longa (Docs)"
            helperText="Texto principal da documentação. Descreva quando usar, quando evitar e regras importantes."
          >
            <TextArea
              value={formData.longDescription}
              onChange={(value) => setFormData({ ...formData, longDescription: value })}
              placeholder={`Quando usar\n- …\n\nQuando não usar\n- …`}
              rows={6}
            />
          </FormField>

          <FormField
            label="Dependências"
            helperText="Pré-requisitos para usar o componente (tokens, classes, dados, bibliotecas)."
          >
            <TextArea
              value={formData.dependencies}
              onChange={(value) => setFormData({ ...formData, dependencies: value })}
              placeholder="Ex.: Usa tokens do tema, classes utilitárias, lista de itens, ícones…"
              rows={3}
            />
          </FormField>

          <FormField
            label="Acessibilidade"
            helperText="Regras mínimas de acessibilidade e comportamento esperado."
          >
            <TextArea
              value={formData.accessibility}
              onChange={(value) => setFormData({ ...formData, accessibility: value })}
              placeholder={`- Foco visível\n- Navegação por teclado\n- aria-label quando necessário`}
              rows={4}
            />
          </FormField>
        </div>
      </div>

      {/* SEÇÃO D - Variações */}
      <div className="content-stretch flex gap-[24px] items-start pb-[24px] w-full">
        <div className="content-stretch flex items-start w-[280px]">
          <div className="content-stretch flex flex-col items-start leading-[0]">
            <div className="flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center text-[18px] text-white w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[28px] whitespace-pre-wrap">Variações</p>
            </div>
            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center text-[#f5f5f5] text-[12px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[18px] whitespace-pre-wrap">
                Crie subcomponentes/variações como Default, Small, Com ícone e Loading. Cada variação tem seu próprio preview, código, comentários e changelog.
              </p>
            </div>
          </div>
        </div>

        <div className="content-stretch flex flex-1 flex-col gap-[16px] items-start">
          <div className="flex items-center justify-between w-full">
            <p className="font-['Open_Sans:SemiBold',sans-serif] text-[16px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
              Variações do componente
            </p>
            <button
              type="button"
              onClick={addVariation}
              className="bg-[#16a6df] flex items-center gap-[8px] px-[16px] py-[8px] rounded-[10px] hover:bg-[#1494ca] transition-colors"
            >
              <Plus size={16} className="text-white" />
              <span className="font-['Roboto_Flex:Medium',sans-serif] text-[14px] text-white" style={{ fontVariationSettings: "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100" }}>
                Adicionar variação
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-[16px] w-full">
            {formData.variations.map((variation, index) => (
              <VariationCard
                key={variation.id}
                variation={variation}
                isDefault={variation.id === 'default'}
                onUpdate={(updated) => updateVariation(index, updated)}
                onDuplicate={() => duplicateVariation(index)}
                onRemove={() => removeVariation(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}