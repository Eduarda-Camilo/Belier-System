import { useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
}

interface UsuariosPageWrapperProps {
  onNewUser: () => void;
  onDeleteUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onViewUser: (user: User) => void;
  users: User[];
}

export function UsuariosPageWrapper({ 
  onNewUser, 
  onDeleteUser, 
  onEditUser, 
  onViewUser,
  users 
}: UsuariosPageWrapperProps) {
  useEffect(() => {
    const setupUsuariosPage = () => {
      // Fix gradient to viewport
      const gradientContainer = document.querySelector('[data-name="Holographic Gradients"]');
      if (gradientContainer) {
        const gradientElement = gradientContainer as HTMLElement;
        gradientElement.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
        `;
      }

      // Fix main container
      const mainContainer = document.querySelector('[data-name="usuarios"]');
      if (mainContainer) {
        const container = mainContainer as HTMLElement;
        container.style.cssText = `
          position: fixed;
          inset: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        `;
      }

      // Setup Novo Usuário button
      const novoUsuarioButtons = Array.from(document.querySelectorAll('p, div')).filter(
        (el) => el.textContent?.trim() === 'Novo Usuário'
      );
      novoUsuarioButtons.forEach((btn) => {
        const container = btn.closest('[data-name="Button"]');
        if (container && !container.hasAttribute('data-usuarios-setup')) {
          container.setAttribute('data-usuarios-setup', 'true');
          (container as HTMLElement).style.cursor = 'pointer';
          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onNewUser();
          });
        }
      });

      // Setup action icons for each user row
      const avatarCircles = Array.from(document.querySelectorAll('[data-name="Ellipse 13"]'));
      
      avatarCircles.forEach((avatarCircle, index) => {
        if (index >= users.length) return;
        
        const user = users[index];
        const row = avatarCircle.closest('[data-name="Container"]')?.parentElement;
        
        if (row) {
          const actionsContainer = row.querySelector('[data-name="Container"]:last-child');
          
          if (actionsContainer) {
            const icons = Array.from(actionsContainer.querySelectorAll('[data-name="visibility"], [data-name="edit"], [data-name="delete"]'));
            
            icons.forEach((icon) => {
              const iconName = icon.getAttribute('data-name');
              const iconContainer = icon.closest('div');
              
              if (iconContainer && !iconContainer.hasAttribute('data-action-setup')) {
                iconContainer.setAttribute('data-action-setup', 'true');
                (iconContainer as HTMLElement).style.cursor = 'pointer';
                
                iconContainer.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (iconName === 'visibility') {
                    onViewUser(user);
                  } else if (iconName === 'edit') {
                    onEditUser(user);
                  } else if (iconName === 'delete') {
                    onDeleteUser(user);
                  }
                });
              }
            });
          }
        }
      });

      // Setup main content area to be scrollable
      const mainContent = document.querySelector('[data-name="usuarios"] > div:nth-child(2)');
      if (mainContent) {
        const contentEl = mainContent as HTMLElement;
        contentEl.style.cssText = `
          flex: 1;
          min-height: 0;
          display: flex;
          position: relative;
          overflow: hidden;
        `;
      }

      // Make left sidebar scrollable
      const leftSidebar = document.querySelector('[data-name="usuarios"] > div:nth-child(2) > div:first-child');
      if (leftSidebar) {
        const sidebarEl = leftSidebar as HTMLElement;
        sidebarEl.style.cssText = `
          overflow-y: auto;
          max-height: calc(100vh - 60px);
          flex-shrink: 0;
        `;
      }

      // Make center content scrollable
      const centerContent = document.querySelector('[data-name="usuarios"] > div:nth-child(2) > div:nth-child(2)');
      if (centerContent) {
        const centerEl = centerContent as HTMLElement;
        centerEl.style.cssText = `
          flex: 1;
          overflow-y: auto;
          min-height: 0;
          padding-bottom: 24px;
        `;
      }
    };

    // Run setup multiple times to catch dynamic content
    setupUsuariosPage();
    const timer1 = setTimeout(setupUsuariosPage, 100);
    const timer2 = setTimeout(setupUsuariosPage, 300);
    const timer3 = setTimeout(setupUsuariosPage, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onNewUser, onDeleteUser, onEditUser, onViewUser, users]);

  return null;
}