import { useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { lineNumbers } from '@codemirror/view';
import './CodeEditor.css';

const EDITOR_MIN_HEIGHT = '220px';

export default function CodeEditor({ value = '', onChange, onCopy, expanded, onToggleExpand, placeholder }) {
  const handleCopy = useCallback(() => {
    if (typeof value !== 'string') return;
    navigator.clipboard.writeText(value).then(() => {
      onCopy?.();
    });
  }, [value, onCopy]);

  const extensions = useMemo(() => [lineNumbers(), html()], []);

  return (
    <div className={`code-editor-wrap ${expanded ? 'code-editor-wrap--expanded' : ''}`}>
      <div className="code-editor-topbar">
        <span className="code-editor-lang">HTML</span>
        <div className="code-editor-topbar-actions">
          {onToggleExpand && (
            <button type="button" className="code-editor-btn" onClick={onToggleExpand} title={expanded ? 'Recolher' : 'Expandir'}>
              {expanded ? '↗ Recolher' : '↗ Expandir'}
            </button>
          )}
          <button type="button" className="code-editor-btn" onClick={handleCopy} title="Copiar">
            Copiar
          </button>
        </div>
      </div>
      <div className="code-editor-container">
        <CodeMirror
          value={value}
          height={expanded ? '400px' : EDITOR_MIN_HEIGHT}
          minHeight={EDITOR_MIN_HEIGHT}
          extensions={extensions}
          onChange={onChange}
          placeholder={placeholder}
          className="code-editor-cm"
        />
      </div>
    </div>
  );
}
