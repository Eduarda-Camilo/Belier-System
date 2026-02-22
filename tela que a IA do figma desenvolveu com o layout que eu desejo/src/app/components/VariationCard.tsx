import { useState } from 'react';
import { Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { FormField } from './FormField';
import { TextInput } from './TextInput';
import { TextArea } from './TextArea';
import { CodeEditor } from './CodeEditor';

export interface Variation {
  id: string;
  name: string;
  slug: string;
  description: string;
  code: string;
  css?: string;
  js?: string;
}

interface VariationCardProps {
  variation: Variation;
  isDefault: boolean;
  onUpdate: (variation: Variation) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  errors?: {
    name?: string;
    slug?: string;
    code?: string;
  };
}

export function VariationCard({ variation, isDefault, onUpdate, onDuplicate, onRemove, errors }: VariationCardProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-[#3d4448] rounded-[12px] p-[24px]">
      {/* Cabeçalho do card */}
      <div className="flex items-center justify-between mb-[16px]">
        <div className="flex items-center gap-[8px]">
          <p className="font-['Open_Sans:Bold',sans-serif] text-[16px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
            {variation.name || 'Nova variação'}
          </p>
          {isDefault && (
            <div className="bg-[#16a6df] px-[8px] py-[2px] rounded-[4px]">
              <span className="font-['Open_Sans:SemiBold',sans-serif] text-[12px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                Default
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            onClick={onDuplicate}
            className="flex items-center gap-[4px] px-[12px] py-[6px] rounded-[8px] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <Copy size={14} className="text-white" />
            <span className="font-['Roboto_Flex:Medium',sans-serif] text-[14px] text-white" style={{ fontVariationSettings: "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100" }}>
              Duplicar
            </span>
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={isDefault}
            className={`flex items-center gap-[4px] px-[12px] py-[6px] rounded-[8px] transition-colors ${
              isDefault ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            <Trash2 size={14} className={isDefault ? 'text-[#666]' : 'text-white'} />
            <span className={`font-['Roboto_Flex:Medium',sans-serif] text-[14px] ${isDefault ? 'text-[#666]' : 'text-white'}`} style={{ fontVariationSettings: "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100" }}>
              Remover
            </span>
          </button>
        </div>
      </div>

      {/* Campos da variação */}
      <div className="flex flex-col gap-[16px]">
        <FormField
          label="Nome da variação"
          required
          helperText="Nome exibido na documentação e nos seletores."
          error={errors?.name}
        >
          <TextInput
            value={variation.name}
            onChange={(value) => onUpdate({ ...variation, name: value })}
            placeholder="Ex.: Small"
            error={errors?.name}
          />
        </FormField>

        <FormField
          label="Slug da variação"
          required
          helperText="Identificador da variação dentro do componente. Use kebab-case."
          error={errors?.slug}
        >
          <TextInput
            value={variation.slug}
            onChange={(value) => onUpdate({ ...variation, slug: value })}
            placeholder="ex.: small"
            error={errors?.slug}
          />
        </FormField>

        <FormField
          label="Descrição"
          helperText="O que diferencia esta variação?"
        >
          <TextArea
            value={variation.description}
            onChange={(value) => onUpdate({ ...variation, description: value })}
            placeholder="Descreva as características únicas desta variação..."
            rows={2}
          />
        </FormField>

        <FormField
          label="Código"
          required={isDefault}
          helperText="Exemplo de uso desta variação. Este código será exibido na documentação e usado no preview."
          error={errors?.code}
        >
          <CodeEditor
            value={variation.code}
            onChange={(value) => onUpdate({ ...variation, code: value })}
            language="html"
            height="220px"
          />
        </FormField>

        {/* Seção Avançado (colapsável) */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-[8px] px-[12px] py-[6px] rounded-[8px] hover:bg-[rgba(255,255,255,0.05)] transition-colors mb-[12px]"
          >
            {showAdvanced ? <ChevronUp size={16} className="text-white" /> : <ChevronDown size={16} className="text-white" />}
            <span className="font-['Open_Sans:SemiBold',sans-serif] text-[14px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
              Avançado
            </span>
          </button>

          {showAdvanced && (
            <div className="flex flex-col gap-[16px] pl-[24px] border-l-2 border-[#3d4448]">
              <FormField
                label="CSS (opcional)"
                helperText="Estilos adicionais para esta variação."
              >
                <CodeEditor
                  value={variation.css || ''}
                  onChange={(value) => onUpdate({ ...variation, css: value })}
                  language="css"
                  height="150px"
                />
              </FormField>

              <FormField
                label="JavaScript (opcional)"
                helperText="Scripts adicionais para esta variação (apenas para armazenamento)."
              >
                <CodeEditor
                  value={variation.js || ''}
                  onChange={(value) => onUpdate({ ...variation, js: value })}
                  language="javascript"
                  height="150px"
                />
              </FormField>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
