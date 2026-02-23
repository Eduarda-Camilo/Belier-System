import { useEffect } from "react";

export function EditarComponenteWrapper() {
  useEffect(() => {
    // Fix gradient to viewport and make content scrollable
    const setupScrollableLayout = () => {
      // Find the gradient container
      const gradientContainer = document.querySelector('[data-name="Holographic Gradients"]');
      if (gradientContainer) {
        const gradientElement = gradientContainer as HTMLElement;
        // Make gradient fixed and cover entire viewport
        gradientElement.style.position = 'fixed';
        gradientElement.style.top = '0';
        gradientElement.style.left = '0';
        gradientElement.style.width = '100vw';
        gradientElement.style.height = '100vh';
        gradientElement.style.zIndex = '0';
      }

      // Find the main container (supports both "Editar componente" and "Página")
      const mainContainer = document.querySelector('[data-name="Editar componente"]') || 
                           document.querySelector('[data-name="Página"]');
      if (mainContainer) {
        const container = mainContainer as HTMLElement;
        container.style.position = 'fixed';
        container.style.inset = '0';
        container.style.overflow = 'hidden';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
      }

      // Find breadcrumbs/content container
      const breadcrumbs = document.querySelector('[data-name="breadcrumbs"]');
      if (breadcrumbs) {
        const breadcrumbsElement = breadcrumbs as HTMLElement;
        breadcrumbsElement.style.position = 'relative';
        breadcrumbsElement.style.zIndex = '1';
        breadcrumbsElement.style.display = 'flex';
        breadcrumbsElement.style.flexDirection = 'column';
        breadcrumbsElement.style.height = '100vh';
        breadcrumbsElement.style.overflow = 'hidden';
      }

      // Find Frame12 (left sidebar) and make it fixed height
      const frame12Elements = Array.from(document.querySelectorAll('[data-name="breadcrumbs"] > div > div')).filter(
        (el) => el.children.length > 0 && el.querySelector('[data-name="Category"]')
      );
      
      if (frame12Elements.length > 0) {
        const frame12 = frame12Elements[0] as HTMLElement;
        frame12.style.position = 'relative';
        frame12.style.flexShrink = '0';
        frame12.style.overflowY = 'auto';
        frame12.style.maxHeight = 'calc(100vh - 60px)'; // Account for padding
      }

      // Find Frame13 (main content area) and make it scrollable
      const allFrames = Array.from(document.querySelectorAll('[data-name="breadcrumbs"] > div > div'));
      if (allFrames.length >= 2) {
        const frame13 = allFrames[1] as HTMLElement;
        frame13.style.flex = '1';
        frame13.style.display = 'flex';
        frame13.style.flexDirection = 'column';
        frame13.style.minHeight = '0';
        frame13.style.minWidth = '0';
        frame13.style.position = 'relative';

        // Find Frame14 (header with title and tabs) and make it sticky
        const frame14 = frame13.querySelector('div:first-child') as HTMLElement;
        if (frame14) {
          frame14.style.position = 'sticky';
          frame14.style.top = '0';
          frame14.style.zIndex = '10';
          frame14.style.backgroundColor = 'rgba(34, 39, 42, 0.6)';
          frame14.style.backdropFilter = 'blur(8px)';
          frame14.style.flexShrink = '0';
        }

        // Find Content div and make it scrollable
        const contentDiv = frame13.querySelector('[data-name="Content"]') as HTMLElement;
        if (contentDiv) {
          contentDiv.style.flex = '1';
          contentDiv.style.overflowY = 'auto';
          contentDiv.style.minHeight = '0';
          contentDiv.style.paddingBottom = '24px';
        }
      }
    };

    // Run setup multiple times to ensure it catches the DOM
    setupScrollableLayout();
    const timer1 = setTimeout(setupScrollableLayout, 100);
    const timer2 = setTimeout(setupScrollableLayout, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return null;
}