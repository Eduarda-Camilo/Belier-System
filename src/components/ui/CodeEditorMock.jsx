import React, { useState } from 'react';
import { Copy, Maximize2 } from 'lucide-react';

export function CodeEditorMock({ title, subtitle, showTabs = true }) {
    const [activeTab, setActiveTab] = useState('HTML');

    return (
        <div className="bg-[#1e252b] border border-white/5 rounded-xl overflow-hidden mt-4">

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
                <div className="flex border-b border-white/5 px-4">
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

            {/* Code Area */}
            <div className="p-6 bg-[#111822] relative group">

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-500 hover:text-white bg-white/5 rounded hover:bg-white/10 transition-colors">
                        <Copy size={14} />
                    </button>
                    <button className="p-1.5 text-slate-500 hover:text-white bg-white/5 rounded hover:bg-white/10 transition-colors">
                        <Maximize2 size={14} />
                    </button>
                </div>

                {/* Lines */}
                <div className="font-mono text-sm leading-relaxed">
                    <div className="flex text-slate-600">
                        <span className="w-8 select-none text-right pr-4 border-r border-white/5 mr-4">1</span>
                        <span className="text-slate-500">// Type some code -&gt;</span>
                    </div>
                    <div className="flex text-slate-600">
                        <span className="w-8 select-none text-right pr-4 border-r border-white/5 mr-4">2</span>
                        <span></span>
                    </div>
                    <div className="flex text-slate-600">
                        <span className="w-8 select-none text-right pr-4 border-r border-white/5 mr-4">3</span>
                        <span className="text-pink-500">for</span> <span className="text-yellow-100">(</span><span className="text-pink-500">var</span> <span className="text-blue-300">i</span> <span className="text-pink-500">=</span> <span className="text-purple-400">0</span>; <span className="text-blue-300">i</span> &lt; <span className="text-yellow-300">specs</span>.<span className="text-blue-300">length</span>; ++<span className="text-blue-300">i</span><span className="text-yellow-100">)</span> {'{'}
                    </div>
                    <div className="flex text-slate-600">
                        <span className="w-8 select-none text-right pr-4 border-r border-white/5 mr-4">4</span>
                        <span className="pl-4"><span className="text-pink-500">var</span> <span className="text-blue-300">gutterClass</span> <span className="text-pink-500">=</span> <span className="text-yellow-300">__specs</span>[<span className="text-blue-300">i</span>];</span>
                    </div>
                    <div className="flex text-slate-600">
                        <span className="w-8 select-none text-right pr-4 border-r border-white/5 mr-4">5</span>
                        <span className="pl-4"><span className="text-pink-500">var</span> <span className="text-blue-300">gElt</span> <span className="text-pink-500">=</span> <span className="text-yellow-300">gutters</span>.<span className="text-blue-300">appendChild</span>(</span>
                    </div>
                    <div className="flex text-slate-600">
                        <span className="w-8 select-none text-right pr-4 border-r border-white/5 mr-4">6</span>
                        <span className="pl-8"><span className="text-yellow-300">elt</span>(</span>
                    </div>
                    <div className="flex text-slate-600">
                        <span className="w-8 select-none text-right pr-4 border-r border-white/5 mr-4">7</span>
                        <span className="pl-12"><span className="text-green-400">"div"</span>,</span>
                    </div>
                    <div className="flex text-slate-600">
                        <span className="w-8 select-none text-right pr-4 border-r border-white/5 mr-4">8</span>
                        <span className="pl-12"><span className="text-pink-500">null</span>,</span>
                    </div>
                    <div className="flex text-slate-600">
                        <span className="w-8 select-none text-right pr-4 border-r border-white/5 mr-4">9</span>
                        <span className="pl-12"><span className="text-green-400">"CodeMirror-gutter "</span> + <span className="text-blue-300">gutterClass</span></span>
                    </div>
                    <div className="flex text-slate-600">
                        <span className="w-8 select-none text-right pr-4 border-r border-white/5 mr-4">10</span>
                        <span className="pl-8">)</span>
                    </div>
                    <div className="flex text-slate-600">
                        <span className="w-8 select-none text-right pr-4 border-r border-white/5 mr-4">11</span>
                        <span className="pl-4">);</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
