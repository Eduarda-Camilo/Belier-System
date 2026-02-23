import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import ModalPerfil from "../../imports/ModalPerfil";

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarPosition: { top: number; right: number };
  onPerfilClick?: () => void;
  onTrocarSenhaClick?: () => void;
}

export function AvatarModal({ isOpen, onClose, avatarPosition, onPerfilClick, onTrocarSenhaClick }: AvatarModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const setupModalNavigation = () => {
      // Find all menu items inside the modal
      const modalElement = modalRef.current;
      if (!modalElement) return;

      // USUÁRIOS - supervisor_account icon
      const usuariosItems = Array.from(modalElement.querySelectorAll('[data-name="supervisor_account"]'));
      usuariosItems.forEach((icon) => {
        const container = icon.closest('[data-name="Menuitem-Link"]');
        if (container && !container.hasAttribute('data-modal-nav-setup')) {
          container.setAttribute('data-modal-nav-setup', 'true');
          (container as HTMLElement).style.cursor = 'pointer';
          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
            navigate('/usuarios');
          });
        }
      });

      // PERFIL - user icon (second occurrence)
      const perfilItems = Array.from(modalElement.querySelectorAll('[data-name="user"]'));
      perfilItems.forEach((icon) => {
        const container = icon.closest('[data-name="Menuitem-Link"]');
        const text = container?.querySelector('p')?.textContent?.trim();
        if (text === 'Perfil' && container && !container.hasAttribute('data-modal-nav-setup')) {
          container.setAttribute('data-modal-nav-setup', 'true');
          (container as HTMLElement).style.cursor = 'pointer';
          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
            if (onPerfilClick) {
              onPerfilClick();
            } else {
              navigate('/perfil');
            }
          });
        }
      });

      // TROCAR SENHA - key icon
      const senhaItems = Array.from(modalElement.querySelectorAll('[data-name="key"]'));
      senhaItems.forEach((icon) => {
        const container = icon.closest('[data-name="Menuitem-Link"]');
        if (container && !container.hasAttribute('data-modal-nav-setup')) {
          container.setAttribute('data-modal-nav-setup', 'true');
          (container as HTMLElement).style.cursor = 'pointer';
          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
            if (onTrocarSenhaClick) {
              onTrocarSenhaClick();
            } else {
              navigate('/trocar-senha');
            }
          });
        }
      });

      // SAIR - sign-out icon
      const sairItems = Array.from(modalElement.querySelectorAll('[data-name="sign-out"]'));
      sairItems.forEach((icon) => {
        const container = icon.closest('[data-name="Menuitem-Link"]');
        if (container && !container.hasAttribute('data-modal-nav-setup')) {
          container.setAttribute('data-modal-nav-setup', 'true');
          (container as HTMLElement).style.cursor = 'pointer';
          container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
            navigate('/docs-public');
          });
        }
      });
    };

    setupModalNavigation();
    const timer = setTimeout(setupModalNavigation, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, navigate, onClose, onPerfilClick, onTrocarSenhaClick]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        ref={modalRef}
        className="absolute w-[260px]"
        style={{
          top: `${avatarPosition.top + 50}px`,
          right: `${avatarPosition.right}px`,
        }}
      >
        <ModalPerfil />
      </div>
    </div>
  );
}