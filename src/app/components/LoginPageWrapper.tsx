import { useEffect } from "react";

/**
 * Wrapper para a página de Login
 * Mantém o gradiente fixo, centraliza o formulário e corrige a logo
 */
export function LoginPageWrapper() {
  useEffect(() => {
    const setupLoginLayout = () => {
      // Fix gradient to viewport
      const gradientContainer = document.querySelector('[data-name="Holographic Gradients"]');
      if (gradientContainer) {
        const gradientElement = gradientContainer as HTMLElement;
        gradientElement.style.position = 'fixed';
        gradientElement.style.top = '0';
        gradientElement.style.left = '0';
        gradientElement.style.width = '100vw';
        gradientElement.style.height = '100vh';
        gradientElement.style.zIndex = '0';
      }

      // Fix main container
      const loginContainer = document.querySelector('[data-name="tela de login"]');
      if (loginContainer) {
        const container = loginContainer as HTMLElement;
        container.style.position = 'fixed';
        container.style.inset = '0';
        container.style.overflow = 'auto';
      }

      // Fix logo in the center (Container1 inside Form)
      // The logo has absolute positioned children that need to be fixed
      const logoContainer = document.querySelector('[data-name="Form"] [data-name="Container"]:first-child');
      if (logoContainer) {
        const container = logoContainer as HTMLElement;
        container.style.position = 'relative';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.gap = '16px';
        
        // Remove absolute positioning from children
        const children = Array.from(container.children);
        children.forEach((child) => {
          const childEl = child as HTMLElement;
          if (childEl.style.position === 'absolute' || childEl.className.includes('absolute')) {
            childEl.style.position = 'relative';
            childEl.style.left = 'auto';
            childEl.style.top = 'auto';
            childEl.style.transform = 'none';
          }
        });
      }

      // Fix the sheep icon (ovelhinha) - should NOT be upside down in login
      const sheepContainer = document.querySelector('[data-name="Form"] [data-name="Container"] [data-name="Container"]');
      if (sheepContainer) {
        const sheepEl = sheepContainer.querySelector('.\\-scale-y-100') as HTMLElement;
        if (sheepEl) {
          // Remove the upside-down transform
          sheepEl.style.transform = 'scaleY(1)';
          sheepEl.classList.remove('-scale-y-100');
        }
      }

      // Fix "Bem-vindo de volta" heading positioning
      const heading = document.querySelector('[data-name="Heading 1"] p');
      if (heading) {
        const headingEl = heading as HTMLElement;
        headingEl.style.position = 'relative';
        headingEl.style.left = 'auto';
        headingEl.style.transform = 'none';
        headingEl.style.width = '100%';
      }

      // Fix subtitle positioning
      const subtitle = document.querySelector('[data-name="Container"] [data-name="Paragraph"]:not([data-name="Container"] > [data-name="Paragraph"]) p');
      if (subtitle) {
        const subtitleEl = subtitle as HTMLElement;
        subtitleEl.style.position = 'relative';
        subtitleEl.style.left = 'auto';
        subtitleEl.style.transform = 'none';
        subtitleEl.style.width = '100%';
      }
    };

    // Run setup multiple times to catch dynamic content
    setupLoginLayout();
    const timer1 = setTimeout(setupLoginLayout, 100);
    const timer2 = setTimeout(setupLoginLayout, 300);
    const timer3 = setTimeout(setupLoginLayout, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return null;
}