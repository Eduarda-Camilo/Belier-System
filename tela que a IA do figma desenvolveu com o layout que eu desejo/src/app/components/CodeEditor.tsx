import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { Copy, Check } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'html' | 'css' | 'javascript';
  height?: string;
  readOnly?: boolean;
}

export function CodeEditor({ value, onChange, language = 'html', height = '220px', readOnly = false }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageExtension = () => {
    switch (language) {
      case 'html':
        return [html()];
      case 'css':
        return [css()];
      case 'javascript':
        return [javascript()];
      default:
        return [html()];
    }
  };

  return (
    <div className="bg-[#1e1e1e] rounded-[12px] overflow-hidden border border-[#3d4448]">
      <div className="bg-[#2d2d30] px-[12px] py-[8px] flex items-center justify-between border-b border-[#3d4448]">
        <span className="font-['Open_Sans:Medium',sans-serif] text-[12px] text-[#cbd4d6] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-[4px] px-[8px] py-[4px] rounded-[6px] hover:bg-[rgba(255,255,255,0.1)] transition-colors"
        >
          {copied ? <Check size={14} className="text-[#00E676]" /> : <Copy size={14} className="text-[#cbd4d6]" />}
          <span className="font-['Open_Sans:Medium',sans-serif] text-[12px] text-[#cbd4d6]" style={{ fontVariationSettings: "'wdth' 100" }}>
            {copied ? 'Copiado!' : 'Copiar'}
          </span>
        </button>
      </div>
      <CodeMirror
        value={value}
        height={height}
        theme="dark"
        extensions={getLanguageExtension()}
        onChange={(value) => !readOnly && onChange(value)}
        editable={!readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          dropCursor: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightSelectionMatches: true,
        }}
        style={{
          fontSize: '13px',
          fontFamily: 'monospace',
        }}
      />
    </div>
  );
}
