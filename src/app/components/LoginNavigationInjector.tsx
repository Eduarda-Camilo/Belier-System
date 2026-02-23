import { useEffect } from "react";
import { useNavigate } from "react-router";

/**
 * Injeta navegação específica para a página de Login
 */
export function LoginNavigationInjector() {
  const navigate = useNavigate();

  useEffect(() => {
    const setupLoginNavigation = () => {
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

      // ====== ENTRAR BUTTON IN FORM ======
      const loginButtons = Array.from(document.querySelectorAll('p, div')).filter(
        (el) => el.textContent?.trim() === 'Entrar' &&
               (el.closest('[data-name="Button1"]') || 
                (el.closest('[data-name="Form"]') && el.closest('[data-name="Button"]')))
      );
      loginButtons.forEach((btn) => {
        const container = btn.closest('[data-name="Button1"]') || btn.closest('[data-name="Button"]');
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
    };

    // Run setup multiple times to catch dynamic content
    setupLoginNavigation();
    const timer1 = setTimeout(setupLoginNavigation, 100);
    const timer2 = setTimeout(setupLoginNavigation, 300);
    const timer3 = setTimeout(setupLoginNavigation, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return null;
}
