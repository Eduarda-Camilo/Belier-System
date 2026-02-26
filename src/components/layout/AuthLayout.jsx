import React from 'react';
import { Header } from './Header';

export function AuthLayout({ children, onNavigate }) {
    return (
        <div className="flex h-screen text-slate-200 overflow-hidden font-sans bg-[#111822] relative flex-col">
            {/* Background Gradient */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.85]"
                style={{
                    backgroundImage: `url('/assets/bg-gradient.svg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            />

            <div className="relative z-10 w-full flex-none">
                <Header isPublic={true} onNavigate={onNavigate} showLogo={true} />
            </div>

            <main className="flex-1 overflow-auto flex items-center justify-center p-8 relative z-10">
                {/* Auth Card Container */}
                <div className="w-full max-w-[440px] bg-[#1e252b] border border-white/5 rounded-2xl p-10 shadow-2xl relative z-10">

                    <div className="flex flex-col items-center mb-0">
                        {children}
                    </div>

                </div>
            </main>
        </div>
    );
}
