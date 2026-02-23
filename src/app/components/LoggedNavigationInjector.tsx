import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

/**
 * Injeta navegação em páginas logadas
 * Configura todos os links do header e sidebar
 */
interface LoggedNavigationInjectorProps {
  onAvatarClick: (element: HTMLElement) => void;
  onPerfilClick: () => void;
  onTrocarSenhaClick: () => void;
}

export function LoggedNavigationInjector({ onAvatarClick, onPerfilClick, onTrocarSenhaClick }: LoggedNavigationInjectorProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const setupLoggedNavigation = () => {
      // ====== LOGO ======
      const logoElements = Array.from(document.querySelectorAll('[data-name="logo"]'));
      logoElements.forEach((logo) => {
        if (!logo.hasAttribute('data-nav-setup')) {
          logo.setAttribute('data-nav-setup', 'true');
          (logo as HTMLElement).style.cursor = 'pointer';
          logo.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/docs');
          });
        }
      });

      // ====== HEADER - TOP NAVIGATION ======
      // Find all p tags with specific text in the header (not in sidebar)
      const allParagraphs = Array.from(document.querySelectorAll('p'));
      
      allParagraphs.forEach((p) => {
        const text = p.textContent?.trim();
        const isInSidebar = p.closest('[data-name="Frame 3"]') || 
                           p.closest('[data-name="Frame 8"]') ||
                           p.closest('[data-name="Frame 9"]');
        const isInButton = p.closest('[data-name="Button"]');
        
        // Only process header links (not in sidebar, not in buttons)
        if (!isInSidebar && !isInButton && !p.hasAttribute('data-nav-setup')) {
          let route: string | null = null;
          let isExternal = false;
          
          if (text === 'Inbox') {
            route = '/inbox';
          } else if (text === 'Docs') {
            route = '/docs';
          } else if (text === 'Figma') {
            isExternal = true;
            route = '#';
          } else if (text === 'Componentes' || text === 'Components') {
            route = '/components/button';
          }
          
          if (route) {
            p.setAttribute('data-nav-setup', 'true');
            (p as HTMLElement).style.cursor = 'pointer';
            
            p.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              if (isExternal) {
                console.log('External Figma link');
              } else {
                navigate(route);
              }
            });
          }
        }
      });

      // ====== HEADER - SEARCH INPUT ======
      const searchContainers = Array.from(document.querySelectorAll('p')).filter(
        (p) => p.textContent?.includes('Buscar')
      );
      searchContainers.forEach((searchP) => {
        const container = searchP.closest('[data-name="Input"]');
        if (container && !container.hasAttribute('data-nav-setup')) {
          container.setAttribute('data-nav-setup', 'true');
          (container as HTMLElement).style.cursor = 'pointer';
          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Open search modal');
          });
        }
      });

      // ====== HEADER - NOVO COMPONENTE BUTTON ======
      const novoComponenteButtons = Array.from(document.querySelectorAll('p')).filter(
        (p) => p.textContent?.trim() === 'Novo Componente' ||
               p.textContent?.trim() === 'Novo componente'
      );
      novoComponenteButtons.forEach((btn) => {
        const container = btn.closest('[data-name="Button"]');
        if (container && !container.hasAttribute('data-nav-setup')) {
          container.setAttribute('data-nav-setup', 'true');
          (container as HTMLElement).style.cursor = 'pointer';
          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/novo-componente');
          });
        }
      });

      // ====== SIDEBAR - MENU ITEMS ======
      // Approach 1: Find by Frame containers (when they have data-name)
      const sidebarParagraphs = Array.from(document.querySelectorAll('p')).filter((p) => {
        return p.closest('[data-name="Frame 3"]') || 
               p.closest('[data-name="Frame 8"]') ||
               p.closest('[data-name="Frame 9"]');
      });

      sidebarParagraphs.forEach((p) => {
        const text = p.textContent?.trim();
        let route: string | null = null;
        let isExternal = false;
        let isNonClickable = false;

        if (text === 'Inbox') {
          route = '/inbox';
        } else if (text === 'Docs') {
          route = '/docs';
        } else if (text === 'Figma') {
          isExternal = true;
          route = '#';
        } else if (text === 'ChangeLog' || text === 'Changelog' || text === 'changelog') {
          route = '/changelog';
        } else if (text === 'Componentes') {
          isNonClickable = true;
        } else if (text === 'Button') {
          // Check if it has deep indentation (pl-[56px]) which means it's a component in the list
          const parentDiv = p.parentElement;
          const hasDeepIndent = parentDiv?.className?.includes('pl-[56px]');
          if (hasDeepIndent) {
            route = '/components/button';
          }
        }

        // Find the clickable container (the wrapper div with padding and gap)
        let container = p.parentElement?.parentElement?.parentElement;
        
        // Handle "Componentes" - mark active but don't make clickable
        if (isNonClickable) {
          if (container) {
            const isComponentPage = location.pathname === '/components/button' || 
                                   location.pathname === '/editar-componente' ||
                                   location.pathname === '/novo-componente';
            if (isComponentPage) {
              container.classList.add('bg-[rgba(255,255,255,0.1)]');
            } else {
              container.classList.remove('bg-[rgba(255,255,255,0.1)]');
            }
          }
          return;
        }

        if (route && container && !container.hasAttribute('data-nav-setup')) {
          container.setAttribute('data-nav-setup', 'true');
          (container as HTMLElement).style.cursor = 'pointer';
          
          // Highlight if current route
          const isActive = location.pathname === route ||
                          (route === '/components/button' && (location.pathname === '/editar-componente' || location.pathname === '/novo-componente'));
          if (isActive) {
            container.classList.add('bg-[rgba(255,255,255,0.1)]');
          } else {
            container.classList.remove('bg-[rgba(255,255,255,0.1)]');
          }

          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isExternal) {
              console.log('External Figma link');
            } else {
              navigate(route);
            }
          });
        }
      });

      // Approach 2: Find ChangeLog specifically by its cloud_sync icon
      const cloudSyncIcons = Array.from(document.querySelectorAll('[data-name="cloud_sync"]'));
      cloudSyncIcons.forEach((icon) => {
        // Find the container - go up to the rounded div that wraps everything
        let container = icon.parentElement;
        while (container && !container.classList.contains('rounded-[8px]')) {
          container = container.parentElement as HTMLElement;
          // Safety check: don't go beyond 10 levels
          let maxLevels = 10;
          if (maxLevels-- <= 0) break;
        }
        
        if (container && !container.hasAttribute('data-changelog-setup')) {
          container.setAttribute('data-changelog-setup', 'true');
          (container as HTMLElement).style.cursor = 'pointer';
          
          // Highlight if on changelog page
          if (location.pathname === '/changelog') {
            container.classList.add('bg-[rgba(255,255,255,0.1)]');
          } else {
            container.classList.remove('bg-[rgba(255,255,255,0.1)]');
          }
          
          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/changelog');
          });
        }
      });

      // ====== BUTTON COMPONENT IN SIDEBAR (direct approach) ======
      const buttonComponentItems = Array.from(document.querySelectorAll('p')).filter((p) => {
        const text = p.textContent?.trim();
        if (text !== 'Button') return false;
        
        // Check if parent has deep indentation (pl-[56px])
        const parent = p.parentElement;
        return parent?.className?.includes('pl-[56px]');
      });
      
      buttonComponentItems.forEach((p) => {
        // Go up to the outer rounded container
        const container = p.parentElement?.parentElement?.parentElement;
        
        if (container && !container.hasAttribute('data-button-component-setup')) {
          container.setAttribute('data-button-component-setup', 'true');
          (container as HTMLElement).style.cursor = 'pointer';
          
          // Highlight if active
          const isActive = location.pathname === '/components/button' ||
                          location.pathname === '/editar-componente' ||
                          location.pathname === '/novo-componente';
          if (isActive) {
            container.classList.add('bg-[rgba(255,255,255,0.1)]');
          } else {
            container.classList.remove('bg-[rgba(255,255,255,0.1)]');
          }
          
          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/components/button');
          });
        }
      });

      // ====== EDITAR BUTTON ======
      const editButtons = Array.from(document.querySelectorAll('p')).filter(
        (p) => p.textContent?.trim() === 'Editar' && 
               p.closest('[data-name="Button"]')?.querySelector('[data-name="pencil"]')
      );
      editButtons.forEach((btn) => {
        const container = btn.closest('[data-name="Button"]');
        if (container && !container.hasAttribute('data-nav-setup')) {
          container.setAttribute('data-nav-setup', 'true');
          (container as HTMLElement).style.cursor = 'pointer';
          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/editar-componente');
          });
        }
      });

      // ====== CANCELAR BUTTON (Edit page) ======
      const cancelButtons = Array.from(document.querySelectorAll('p')).filter(
        (p) => p.textContent?.trim() === 'Cancelar'
      );
      cancelButtons.forEach((btn) => {
        const container = btn.closest('[data-name="Tab"]');
        if (container && !container.hasAttribute('data-nav-setup')) {
          container.setAttribute('data-nav-setup', 'true');
          (container as HTMLElement).style.cursor = 'pointer';
          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/components/button');
          });
        }
      });

      // ====== AVATAR CLICK ======
      // Find avatar by Profile data-name container
      const profileElements = Array.from(document.querySelectorAll('[data-name="Profile"]'));
      profileElements.forEach((profileContainer) => {
        // The Profile container itself or find any clickable child
        const avatar = profileContainer.querySelector('div') || profileContainer;
        
        if (avatar && !avatar.hasAttribute('data-avatar-setup')) {
          avatar.setAttribute('data-avatar-setup', 'true');
          (avatar as HTMLElement).style.cursor = 'pointer';
          avatar.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onAvatarClick) {
              // Pass the profile container for better positioning
              onAvatarClick(profileContainer as HTMLElement);
            }
          });
        }
      });

      // ====== PERFIL CLICK ======
      const perfilElements = Array.from(document.querySelectorAll('[data-name="Perfil"]'));
      perfilElements.forEach((perfil) => {
        if (!perfil.hasAttribute('data-perfil-setup')) {
          perfil.setAttribute('data-perfil-setup', 'true');
          (perfil as HTMLElement).style.cursor = 'pointer';
          perfil.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onPerfilClick) {
              onPerfilClick();
            }
          });
        }
      });

      // ====== TROCAR SENHA CLICK ======
      const trocarSenhaElements = Array.from(document.querySelectorAll('[data-name="Trocar Senha"]'));
      trocarSenhaElements.forEach((trocarSenha) => {
        if (!trocarSenha.hasAttribute('data-trocar-senha-setup')) {
          trocarSenha.setAttribute('data-trocar-senha-setup', 'true');
          (trocarSenha as HTMLElement).style.cursor = 'pointer';
          trocarSenha.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onTrocarSenhaClick) {
              onTrocarSenhaClick();
            }
          });
        }
      });
    };

    // Run setup multiple times to catch dynamic content
    setupLoggedNavigation();
    const timer1 = setTimeout(setupLoggedNavigation, 100);
    const timer2 = setTimeout(setupLoggedNavigation, 300);
    const timer3 = setTimeout(setupLoggedNavigation, 500);
    const timer4 = setTimeout(setupLoggedNavigation, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [navigate, location, onAvatarClick, onPerfilClick, onTrocarSenhaClick]);

  return null;
}