import { useEffect } from "react";

/**
 * Wrapper para a página Docs (logada)
 * Configura o layout fixo com gradiente e scroll
 */
export function DocsPageWrapper() {
  useEffect(() => {
    const setupDocsPage = () => {
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
      const mainContainer = document.querySelector('[data-name="docs"]');
      if (mainContainer) {
        const container = mainContainer as HTMLElement;
        container.style.position = 'fixed';
        container.style.inset = '0';
        container.style.overflow = 'hidden';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
      }

      // Fix header to be sticky at top
      const header = document.querySelector('[data-name="docs"] > div:first-child');
      if (header) {
        const headerEl = header as HTMLElement;
        headerEl.style.position = 'sticky';
        headerEl.style.top = '0';
        headerEl.style.zIndex = '100';
        headerEl.style.backgroundColor = '#22272a';
        headerEl.style.flexShrink = '0';
      }

      // Setup main content area to be scrollable
      const mainContent = document.querySelector('[data-name="docs"] > div:nth-child(2)');
      if (mainContent) {
        const contentEl = mainContent as HTMLElement;
        contentEl.style.flex = '1';
        contentEl.style.minHeight = '0';
        contentEl.style.display = 'flex';
        contentEl.style.position = 'relative';
        contentEl.style.overflow = 'hidden';
      }

      // Make left sidebar scrollable
      const leftSidebar = document.querySelector('[data-name="docs"] > div:nth-child(2) > div:first-child');
      if (leftSidebar) {
        const sidebarEl = leftSidebar as HTMLElement;
        sidebarEl.style.overflowY = 'auto';
        sidebarEl.style.maxHeight = 'calc(100vh - 60px)';
        sidebarEl.style.flexShrink = '0';
      }

      // Make center content scrollable
      const centerContent = document.querySelector('[data-name="docs"] > div:nth-child(2) > div:nth-child(2)');
      if (centerContent) {
        const centerEl = centerContent as HTMLElement;
        centerEl.style.flex = '1';
        centerEl.style.overflowY = 'auto';
        centerEl.style.minHeight = '0';
        centerEl.style.paddingBottom = '24px';
      }

      // Make right sidebar scrollable if exists
      const rightSidebar = document.querySelector('[data-name="docs"] > div:nth-child(2) > div:nth-child(3)');
      if (rightSidebar) {
        const sidebarEl = rightSidebar as HTMLElement;
        sidebarEl.style.overflowY = 'auto';
        sidebarEl.style.maxHeight = 'calc(100vh - 60px)';
        sidebarEl.style.flexShrink = '0';
      }
    };

    // Run setup multiple times to catch dynamic content
    setupDocsPage();
    const timer1 = setTimeout(setupDocsPage, 100);
    const timer2 = setTimeout(setupDocsPage, 300);
    const timer3 = setTimeout(setupDocsPage, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return null;
}
