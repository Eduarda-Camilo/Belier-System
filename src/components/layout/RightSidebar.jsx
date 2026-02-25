import React from 'react';

export function RightSidebar({ items = [] }) {
    return (
        <div className="py-8 px-6 sticky top-0 h-full overflow-y-auto w-full">
            <h3 className="text-[15px] font-bold text-white mb-2 tracking-tight pl-2">Conteúdo</h3>

            <nav className="flex flex-col gap-2 w-full mt-2">
                {items.map((item, index) => (
                    <a
                        key={index}
                        href={`#${item.id}`}
                        className={`w-full flex items-center min-h-[32px] py-2 px-4 rounded-lg text-[15px] font-medium transition-colors text-left leading-snug ${item.isActive
                            ? 'bg-[#1e293b] text-white'
                            : 'text-[#94a3b8] hover:text-white hover:bg-[#0ea5e9]'
                            }`}
                    >
                        {item.label}
                    </a>
                ))}
            </nav>
        </div>
    );
}
