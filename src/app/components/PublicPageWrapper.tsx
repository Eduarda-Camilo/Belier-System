import { useEffect } from "react";

/**
 * Wrapper para páginas públicas (sem login)
 * Mantém o gradiente fixo e permite scroll apenas no conteúdo central
 */
export function PublicPageWrapper() {
  useEffect(() => {
    const setupScrollableLayout = () => {
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
      const mainContainers = document.querySelectorAll('[data-name="button/sem-login"], [data-name="docs-public"]');
      mainContainers.forEach((container) => {
        const containerElement = container as HTMLElement;
        containerElement.style.position = 'fixed';
        containerElement.style.inset = '0';
        containerElement.style.overflow = 'hidden';
        containerElement.style.display = 'flex';
        containerElement.style.flexDirection = 'column';
      });

      // Setup breadcrumbs container
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

      // Find left sidebar (Frame11) and make it fixed height with scroll
      const breadcrumbsInner = document.querySelector('[data-name="breadcrumbs"] > div');
      if (breadcrumbsInner) {
        const children = Array.from(breadcrumbsInner.children);
        if (children.length > 0) {
          const leftSidebar = children[0] as HTMLElement;
          leftSidebar.style.position = 'relative';
          leftSidebar.style.flexShrink = '0';
          leftSidebar.style.overflowY = 'auto';
          leftSidebar.style.maxHeight = 'calc(100vh - 60px)';
        }

        // Main content area (Frame12 or Frame13)
        if (children.length >= 2) {
          const mainContent = children[1] as HTMLElement;
          mainContent.style.flex = '1';
          mainContent.style.display = 'flex';
          mainContent.style.flexDirection = 'column';
          mainContent.style.minHeight = '0';
          mainContent.style.minWidth = '0';
          mainContent.style.position = 'relative';

          // Find header (Frame13) and make it sticky
          const header = mainContent.querySelector('div:first-child') as HTMLElement;
          if (header) {
            header.style.position = 'sticky';
            header.style.top = '0';
            header.style.zIndex = '10';
            header.style.backgroundColor = 'rgba(34, 39, 42, 0.6)';
            header.style.backdropFilter = 'blur(8px)';
            header.style.flexShrink = '0';
          }

          // Find Content div and make it scrollable
          const contentDiv = mainContent.querySelector('[data-name="Content"]') as HTMLElement;
          if (contentDiv) {
            contentDiv.style.flex = '1';
            contentDiv.style.overflowY = 'auto';
            contentDiv.style.minHeight = '0';
            contentDiv.style.paddingBottom = '24px';
          }
        }
      }
    };

    // Run setup multiple times to catch dynamic content
    setupScrollableLayout();
    const timer1 = setTimeout(setupScrollableLayout, 100);
    const timer2 = setTimeout(setupScrollableLayout, 300);
    const timer3 = setTimeout(setupScrollableLayout, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return null;
}