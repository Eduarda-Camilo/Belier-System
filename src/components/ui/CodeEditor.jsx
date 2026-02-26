import React, { useState } from 'react';
import { Copy, Maximize2, Check } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // HTML
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme

export function CodeEditor({
    title,
    subtitle,
    showTabs = true,
    initialCode = {},
    onCodeChange,
    className = "",
    readOnly = false
}) {
    const [activeTab, setActiveTab] = useState('HTML');
    const [copied, setCopied] = useState(false);

    // Default initial code per tab
    const [codes, setCodes] = useState({
        HTML: initialCode?.HTML || '',
        CSS: initialCode?.CSS || '',
        JavaScript: initialCode?.JavaScript || ''
    });

    React.useEffect(() => {
        setCodes(prev => {
            const html = initialCode?.HTML || '';
            const css = initialCode?.CSS || '';
            const js = initialCode?.JavaScript || '';
            if (prev.HTML === html && prev.CSS === css && prev.JavaScript === js) return prev;
            return { HTML: html, CSS: css, JavaScript: js };
        });
    }, [initialCode]);

    const currentCode = codes[activeTab] || '';

    const handleCodeChange = (newCode) => {
        if (readOnly) return;
        const newCodes = { ...codes, [activeTab]: newCode };
        setCodes(newCodes);
        if (onCodeChange) {
            onCodeChange(newCodes, activeTab);
        }
    };

    const handleCopy = () => {
        if (!currentCode) return;
        navigator.clipboard.writeText(currentCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getPrismLanguage = (tab) => {
        switch (tab) {
            case 'HTML': return Prism.languages.markup;
            case 'CSS': return Prism.languages.css;
            case 'JavaScript': return Prism.languages.javascript;
            default: return Prism.languages.markup;
        }
    };

    return (
        <div className={`bg-[#1e252b] border border-white/5 rounded-xl overflow-hidden ${className}`}>

            {/* Header if provided */}
            {(title || subtitle) && (
                <div className="px-6 py-4 border-b border-white/5 flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                    <div>
                        {title && <h4 className="text-white text-sm font-medium leading-none">{title}</h4>}
                        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                    </div>
                </div>
            )}

            {/* Tabs */}
            {showTabs && (
                <div className="flex border-b border-white/5 px-4 bg-[#111822]">
                    {['HTML', 'CSS', 'JavaScript'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === tab
                                ? 'border-blue-500 text-white'
                                : 'border-transparent text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}

            {/* Code Editor Area */}
            <div className="bg-[#111822] relative group border-t border-white/5">
                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                        onClick={handleCopy}
                        className="p-1.5 text-slate-500 hover:text-white bg-white/5 rounded hover:bg-white/10 transition-colors"
                        title="Copiar código"
                    >
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                    <button className="p-1.5 text-slate-500 hover:text-white bg-white/5 rounded hover:bg-white/10 transition-colors">
                        <Maximize2 size={14} />
                    </button>
                </div>

                {/* Editor Container */}
                <div className="p-4 text-sm font-mono max-h-[300px] overflow-y-auto custom-scrollbar relative">
                    {/* Placeholder comment if empty */}
                    {!currentCode && !readOnly && (
                        <div className="absolute top-6 left-6 text-slate-600 pointer-events-none z-0 select-none text-xs">
                            <span className="opacity-50">// Type some {activeTab} code -&gt;</span>
                        </div>
                    )}

                    <Editor
                        value={currentCode}
                        onValueChange={handleCodeChange}
                        highlight={code => Prism.highlight(code, getPrismLanguage(activeTab), activeTab.toLowerCase())}
                        padding={10}
                        style={{
                            fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                            fontSize: 14,
                            minHeight: '120px',
                        }}
                        className="editor-container"
                        textareaClassName="focus:outline-none"
                        disabled={readOnly}
                    />
                </div>
            </div>

            {/* Custom CSS to inject some styles for the editor so it looks okay on dark bg */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .editor-container textarea, .editor-container pre {
                    outline: none !important;
                }
            `}} />
        </div>
    );
}
