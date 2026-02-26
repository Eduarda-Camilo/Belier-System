import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RightSidebar } from './RightSidebar';
import { GlobalRightPanel } from './GlobalRightPanel';

export function DashboardLayout({ children, outlineContent, activePage, onNavigate, isPublic }) {
    return (
        <div className="flex h-screen text-slate-200 overflow-hidden font-sans bg-[#111822] relative">

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

            <div className="flex h-full w-full relative z-10 gap-6">
                <Sidebar activePage={activePage} onNavigate={onNavigate} isPublic={isPublic} />

                <div className="flex-1 flex flex-col min-w-0 mr-6">
                    <Header isPublic={isPublic} onNavigate={onNavigate} />

                    <main className="flex-1 overflow-auto flex">
                        <div className="flex-1 p-8 max-w-5xl mx-auto flex flex-col">
                            {children}
                        </div>

                        {outlineContent ? (
                            <div className="w-[240px] shrink-0 bg-transparent hidden xl:block">
                                <RightSidebar items={outlineContent} />
                            </div>
                        ) : (
                            <GlobalRightPanel />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
