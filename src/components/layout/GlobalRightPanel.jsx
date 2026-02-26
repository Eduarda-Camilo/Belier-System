import React from 'react';

export function GlobalRightPanel() {
    return (
        <div className="w-[300px] xl:w-[320px] shrink-0 pt-0 bg-transparent hidden 2xl:block overflow-hidden relative">
            <div className="w-full h-[calc(100vh-120px)] min-h-[500px] rounded-2xl relative overflow-hidden bg-[#0c1015] border border-white/5 shadow-2xl group flex flex-col justify-between">

                {/* CSS Generated Abstract Art */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    {/* Base gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0c1015] to-[#151c24]" />

                    {/* Glowing Orbs (No Purple! Using Sky & Emerald/Teal as accents) */}
                    <div className="absolute -top-[10%] -right-[20%] w-[150%] h-[50%] bg-[#0ea5e9] rounded-[100%] blur-[100px] opacity-10 mix-blend-screen transition-transform duration-[10s] ease-in-out group-hover:scale-125" />
                    <div className="absolute -bottom-[20%] -left-[20%] w-[120%] h-[60%] bg-sky-300 rounded-[100%] blur-[90px] opacity-[0.08] mix-blend-screen transition-transform duration-[15s] ease-in-out group-hover:translate-x-8 group-hover:-translate-y-8" />

                    {/* Subtle dot pattern for texture */}
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }} />

                    {/* Vignette effect to focus the center/edges */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0c1015_120%)] opacity-90" />
                </div>

                {/* Top Subtle Element (Status Dot) */}
                <div className="relative z-10 p-6 flex justify-end">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500/50 shadow-[0_0_10px_2px_rgba(14,165,233,0.3)] animate-pulse" />
                </div>

                {/* Minimalist Branding at Bottom */}
                <div className="relative z-10 p-8 flex flex-col items-start translate-y-2 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                    <img
                        src="/assets/logo.svg"
                        alt="Belier Logo"
                        className="w-24 h-auto opacity-20 group-hover:opacity-60 transition-all duration-700 mb-4 filter grayscale group-hover:grayscale-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="w-6 h-[1px] bg-sky-500/30 mb-3 group-hover:w-12 transition-all duration-700" />
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] opacity-40 group-hover:opacity-80 transition-opacity duration-700">
                        Design System // 2026
                    </div>
                </div>

            </div>
        </div>
    );
}
