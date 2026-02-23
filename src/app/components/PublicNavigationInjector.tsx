import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

/**
 * Injeta navegação em páginas públicas (deslogadas)
 * Configura todos os links do header e sidebar
 */
export function PublicNavigationInjector() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const setupPublicNavigation = () => {
      // ====== LOGO ======
      const logoElements = Array.from(document.querySelectorAll('[data-name="logo"]'));
      logoElements.forEach((logo) => {
        if (!logo.hasAttribute('data-nav-setup')) {
          logo.setAttribute('data-nav-setup', 'true');
          (logo as HTMLElement).style.cursor = 'pointer';
          logo.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/');
          });
        }
      });

      // ====== HEADER - TOP NAVIGATION ======
      const allParagraphs = Array.from(document.querySelectorAll('p'));
      
      allParagraphs.forEach((p) => {
        const text = p.textContent?.trim();
        const isInSidebar = p.closest('[data-name="Frame 3"]') || 
                           p.closest('[data-name="Frame 8"]') ||
                           p.closest('[data-name="Frame 9"]') ||
                           p.closest('[data-name="Frame 11"]');
        const isInButton = p.closest('[data-name="Button"]');
        
        // Only process header links (not in sidebar, not in buttons)
        if (!isInSidebar && !isInButton && !p.hasAttribute('data-nav-setup')) {
          let route: string | null = null;
          let isExternal = false;
          
          if (text === 'Docs') {
            route = '/docs-public';
          } else if (text === 'Figma') {
            isExternal = true;
            route = '#';
          } else if (text === 'Componentes' || text === 'Components') {
            route = '/components/button/public';
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

      // ====== HEADER - ENTRAR BUTTON ======
      const entrarButtons = Array.from(document.querySelectorAll('p')).filter(
        (p) => p.textContent?.trim() === 'Entrar' &&
               p.closest('[data-name="Button"]')
      );
      entrarButtons.forEach((btn) => {
        const container = btn.closest('[data-name="Button"]');
        if (container && !container.hasAttribute('data-nav-setup')) {
          container.setAttribute('data-nav-setup', 'true');
          (container as HTMLElement).style.cursor = 'pointer';
          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/login');
          });
        }
      });

      // ====== SIDEBAR - MENU ITEMS ======
      const sidebarParagraphs = Array.from(document.querySelectorAll('p')).filter((p) => {
        return p.closest('[data-name="Frame 3"]') || 
               p.closest('[data-name="Frame 8"]') ||
               p.closest('[data-name="Frame 9"]') ||
               p.closest('[data-name="Frame 11"]');
      });

      sidebarParagraphs.forEach((p) => {
        const text = p.textContent?.trim();
        let route: string | null = null;
        let isExternal = false;
        let isNonClickable = false;

        if (text === 'Docs') {
          route = '/docs-public';
        } else if (text === 'Figma') {
          isExternal = true;
          route = '#';
        } else if (text === 'Componentes') {
          isNonClickable = true;
        } else if (text === 'Button') {
          // Check if it's in the component list (has category icon nearby)
          const hasCategory = p.parentElement?.querySelector('[data-name="Category"]');
          if (hasCategory) {
            route = '/components/button/public';
          }
        }

        // Find the clickable container
        let container = p.parentElement?.parentElement;
        
        // Handle "Componentes" - mark active but don't make clickable
        if (isNonClickable) {
          if (container) {
            const isComponentPage = location.pathname === '/components/button/public';
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
          const isActive = location.pathname === route;
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
          const isActive = location.pathname === '/components/button/public';
          if (isActive) {
            container.classList.add('bg-[rgba(255,255,255,0.1)]');
          } else {
            container.classList.remove('bg-[rgba(255,255,255,0.1)]');
          }
          
          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/components/button/public');
          });
        }
      });
    };

    // Run setup multiple times to catch dynamic content
    setupPublicNavigation();
    const timer1 = setTimeout(setupPublicNavigation, 100);
    const timer2 = setTimeout(setupPublicNavigation, 300);
    const timer3 = setTimeout(setupPublicNavigation, 500);
    const timer4 = setTimeout(setupPublicNavigation, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [navigate, location]);

  return null;
}