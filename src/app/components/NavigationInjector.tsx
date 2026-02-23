import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

export function NavigationInjector() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const setupNavigation = () => {
      // Setup logo click to go to home (Docs)
      const logoElements = Array.from(document.querySelectorAll('[data-name="logo"]'));
      logoElements.forEach((logo) => {
        if (!logo.hasAttribute('data-nav-setup')) {
          logo.setAttribute('data-nav-setup', 'true');
          (logo as HTMLElement).style.cursor = 'pointer';
          logo.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Check if we're on a public page
            if (location.pathname === '/' || location.pathname === '/components/button-public' || location.pathname === '/docs-public') {
              navigate('/');
            } else if (location.pathname === '/login') {
              navigate('/');
            } else {
              navigate('/docs');
            }
          });
        }
      });

      // Setup "Entrar" button in header (public pages) to go to login
      const entrarButtons = Array.from(document.querySelectorAll('p')).filter(
        (p) => p.textContent?.trim() === 'Entrar' &&
               p.closest('[data-name="Button"]') &&
               (location.pathname === '/' || location.pathname === '/components/button-public' || location.pathname === '/docs-public')
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

      // Setup "Entrar" button in login page header to go to login (no action, already there)
      const entrarHeaderLogin = Array.from(document.querySelectorAll('p')).filter(
        (p) => p.textContent?.trim() === 'Entrar' &&
               p.closest('[data-name="Button"]') &&
               location.pathname === '/login' &&
               !p.closest('[data-name="Form"]') &&
               !p.closest('[data-name="Container"]')?.querySelector('[data-name="Form"]')
      );
      entrarHeaderLogin.forEach((btn) => {
        const container = btn.closest('[data-name="Button"]');
        if (container && !container.hasAttribute('data-nav-setup')) {
          container.setAttribute('data-nav-setup', 'true');
          (container as HTMLElement).style.cursor = 'pointer';
          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Already on login page, do nothing or could scroll to form
          });
        }
      });

      // Setup "Entrar" button in login form to go to docs
      if (location.pathname === '/login') {
        const loginButtons = Array.from(document.querySelectorAll('p, div')).filter(
          (el) => el.textContent?.trim() === 'Entrar' &&
                 (el.closest('[data-name="Button1"]') || 
                  (el.closest('[data-name="Form"]') && el.closest('[data-name="Button"]')))
        );
        loginButtons.forEach((btn) => {
          const container = btn.closest('[data-name="Button1"]') || btn.closest('[data-name="Button"]') || btn;
          if (container && !container.hasAttribute('data-nav-setup')) {
            container.setAttribute('data-nav-setup', 'true');
            (container as HTMLElement).style.cursor = 'pointer';
            container.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/docs');
            });
          }
        });
      }

      // Setup "Editar" button to go to edit component page
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

      // Setup "Cancelar" button in edit page to go back to button page
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

      // Find all navigation items in the sidebar
      const setupMenuItem = (text: string, route: string) => {
        const elements = Array.from(document.querySelectorAll('p')).filter(
          (p) => p.textContent?.trim() === text && 
                 p.closest('[data-name="category"]')?.parentElement
        );

        elements.forEach((el) => {
          const container = el.closest('[data-name="category"]')?.parentElement?.parentElement;
          if (container && !container.hasAttribute('data-nav-setup')) {
            container.setAttribute('data-nav-setup', 'true');
            container.style.cursor = 'pointer';
            
            // Highlight if current route
            const isActive = location.pathname === route;
            if (isActive) {
              container.classList.add('bg-[rgba(255,255,255,0.1)]');
            } else {
              container.classList.remove('bg-[rgba(255,255,255,0.1)]');
            }

            // Add click handler
            container.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(route);
            });
          }
        });
      };

      // Setup all menu items
      setupMenuItem('Inbox', '/inbox');
      setupMenuItem('Docs', '/docs');
      setupMenuItem('Figma', '/button'); // Placeholder
      setupMenuItem('ChangeLog', '/changelog');
      setupMenuItem('Componentes', '/button');
    };

    // Run setup multiple times to catch dynamic content
    setupNavigation();
    const timer1 = setTimeout(setupNavigation, 100);
    const timer2 = setTimeout(setupNavigation, 300);
    const timer3 = setTimeout(setupNavigation, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate, location]);

  return null;
}