import { useEffect, useRef } from "react";

export function NovoComponenteWrapper() {
  const setupCompleteRef = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const isApplyingRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate setup
    if (setupCompleteRef.current) return;

    const applyStyles = (): boolean => {
      // Fix gradient to viewport
      const gradientContainer = document.querySelector('[data-name="Holographic Gradients"]');
      if (gradientContainer) {
        const gradientElement = gradientContainer as HTMLElement;
        Object.assign(gradientElement.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          zIndex: '0',
        });
      }

      // Main container
      const mainContainer = document.querySelector('[data-name="Página"]');
      if (mainContainer) {
        const container = mainContainer as HTMLElement;
        Object.assign(container.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#22272a',
          opacity: '1',
          visibility: 'visible',
        });
      }

      // Fix breadcrumbs/content container
      const breadcrumbs = document.querySelector('[data-name="breadcrumbs"]');
      if (breadcrumbs) {
        const breadcrumbsElement = breadcrumbs as HTMLElement;
        Object.assign(breadcrumbsElement.style, {
          position: 'relative',
          zIndex: '1',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          flex: '1',
        });
      }

      // Find the horizontal container
      const horizontalContainer = document.querySelector('[data-name="breadcrumbs"] > div');
      if (horizontalContainer) {
        const hContainer = horizontalContainer as HTMLElement;
        Object.assign(hContainer.style, {
          display: 'flex',
          flex: '1',
          minHeight: '0',
          overflow: 'hidden',
        });
      }

      // Find Frame12 (left sidebar) - support both "Category" and "category"
      const frame12Elements = Array.from(document.querySelectorAll('[data-name="breadcrumbs"] > div > div')).filter(
        (el) => el.children.length > 0 && (el.querySelector('[data-name="Category"]') || el.querySelector('[data-name="category"]'))
      );
      
      if (frame12Elements.length > 0) {
        const frame12 = frame12Elements[0] as HTMLElement;
        Object.assign(frame12.style, {
          position: 'relative',
          flexShrink: '0',
          overflowY: 'auto',
          maxHeight: '100%',
        });
      }

      // Find Frame13 (main content area)
      const allFrames = Array.from(document.querySelectorAll('[data-name="breadcrumbs"] > div > div'));
      if (allFrames.length >= 2) {
        const frame13 = allFrames[1] as HTMLElement;
        Object.assign(frame13.style, {
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '0',
          minWidth: '0',
          position: 'relative',
          overflow: 'hidden',
        });

        // Find Frame14 (header)
        const frame14 = frame13.querySelector('div:first-child') as HTMLElement;
        if (frame14) {
          Object.assign(frame14.style, {
            position: 'sticky',
            top: '0',
            zIndex: '10',
            backgroundColor: 'rgba(34, 39, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            flexShrink: '0',
          });
        }

        // Find Content div
        const contentDiv = frame13.querySelector('[data-name="Content"]') as HTMLElement;
        if (contentDiv) {
          Object.assign(contentDiv.style, {
            flex: '1',
            overflowY: 'auto',
            minHeight: '0',
            paddingBottom: '24px',
          });
        }
      }

      // Check if all critical elements are present
      return !!(mainContainer && breadcrumbs && horizontalContainer && allFrames.length >= 2);
    };

    const mainContainer = document.querySelector('[data-name="Página"]');
    
    // Use MutationObserver only to reapply when something *else* changes styles (e.g. React re-render).
    // Disconnect before we apply so we don't react to our own changes and create an infinite loop.
    const observer = new MutationObserver(() => {
      if (isApplyingRef.current) return;
      isApplyingRef.current = true;
      observerRef.current?.disconnect();
      applyStyles();
      requestAnimationFrame(() => {
        isApplyingRef.current = false;
        if (mainContainer && observerRef.current) {
          observerRef.current.observe(mainContainer, {
            attributes: true,
            attributeFilter: ['style', 'class'],
            subtree: true,
          });
        }
      });
    });
    observerRef.current = observer;

    const runSetup = (): boolean => {
      const allPresent = applyStyles();
      if (allPresent && mainContainer) {
        observer.observe(mainContainer, {
          attributes: true,
          attributeFilter: ['style', 'class'],
          subtree: true,
        });
      }
      return allPresent;
    };

    // Try to apply styles immediately
    const allPresent = runSetup();
    
    if (allPresent) {
      setupCompleteRef.current = true;
      return () => {
        observerRef.current?.disconnect();
        observerRef.current = null;
      };
    }

    // If elements not ready, retry with exponential backoff
    const timers: ReturnType<typeof setTimeout>[] = [];
    let attempts = 0;
    const maxAttempts = 10;
    
    const retrySetup = () => {
      if (attempts >= maxAttempts || setupCompleteRef.current) return;
      
      const success = runSetup();
      if (success) {
        setupCompleteRef.current = true;
        timers.forEach(t => clearTimeout(t));
      } else {
        attempts++;
        const delay = Math.min(100 * Math.pow(1.5, attempts), 2000);
        timers.push(setTimeout(retrySetup, delay));
      }
    };
    
    timers.push(setTimeout(retrySetup, 50));
    
    return () => {
      timers.forEach(t => clearTimeout(t));
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  return null;
}