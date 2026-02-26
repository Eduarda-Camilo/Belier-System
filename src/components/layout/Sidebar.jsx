import React, { useState, useEffect } from 'react';
import { Inbox, FileText, Figma, History, LayoutGrid } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const navItems = [
  { icon: Inbox, label: 'Inbox', id: 'inbox' },
  { icon: FileText, label: 'Docs', id: 'docs' },
  { icon: Figma, label: 'Figma', id: 'figma' },
  { icon: History, label: 'ChangeLog', id: 'changelog' },
  { icon: LayoutGrid, label: 'Componentes', id: 'components' },
];

export function Sidebar({ activePage, onNavigate, isPublic }) {
  // Filter nav items based on public state
  const displayedItems = isPublic
    ? navItems.filter(item => ['docs', 'figma', 'components'].includes(item.id))
    : navItems;

  const [componentsList, setComponentsList] = useState([]);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const { data, error } = await supabase
        .from('components')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setComponentsList(data || []);
    } catch (err) {
      console.error("Erro ao carregar componentes no menu:", err);
    }
  };

  return (
    <div className="w-[248px] flex-shrink-0 flex flex-col pt-[30px] bg-transparent">

      {/* Logo Area */}
      <div className="flex items-center w-full px-6 mb-4 cursor-pointer" onClick={() => onNavigate && onNavigate('docs')}>
        <img src="/assets/logo.svg" alt="Belier Logo" className="w-[120px] h-auto shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2 w-full px-4 flex-1 mt-2">
        {displayedItems.map((item) => {
          const Icon = item.icon;
          const isComponentsNav = item.id === 'components';

          // An item is visually active if it is the current page, or if we are on a component page but this is NOT the 'components' tab
          // Wait, the specification says the main 'Componentes' tab remains active? If so:
          const isActive = activePage === item.id || (isComponentsNav && (activePage === 'button' || activePage === 'novo-componente'));

          return (
            <React.Fragment key={item.id}>
              <button
                onClick={() => onNavigate && onNavigate(item.id)}
                className={`w-full flex items-center gap-2 px-4 h-8 rounded-lg text-[15px] font-medium transition-colors text-left ${isActive
                  ? 'bg-[#1e293b] text-white'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#0ea5e9]'
                  }`}
              >
                {item.label === 'Figma' ? (
                  <img src="/assets/icon-figma.svg" alt="Figma" className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <Icon size={20} strokeWidth={1.8} />
                )}
                {item.label}
              </button>

              {/* Registered Components List */}
              {isComponentsNav && (
                <div className="flex flex-col gap-2 mt-1 mb-2">
                  {componentsList.length === 0 ? (
                    <span className="text-[13px] text-slate-500 pl-12">Nenhum criado</span>
                  ) : (
                    componentsList.map(comp => {
                      const compRoute = `componente/${comp.id}`;
                      const isComponentActive = activePage === compRoute;
                      return (
                        <button
                          key={comp.id}
                          onClick={() => onNavigate && onNavigate(compRoute)}
                          className={`w-full flex items-center h-8 pr-4 pl-12 rounded-lg text-[15px] font-medium transition-colors text-left ${isComponentActive
                            ? 'bg-[#1e293b] text-white'
                            : 'text-[#94a3b8] hover:text-white hover:bg-[#0ea5e9]'
                            }`}
                        >
                          {comp.name}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

    </div>
  );
}
