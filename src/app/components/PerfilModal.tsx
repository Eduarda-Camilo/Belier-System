import { useEffect, useRef } from "react";
import ModalPerfilFigma from "../../imports/ModalPerfil-12-5771";

interface PerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PerfilModal({ isOpen, onClose }: PerfilModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

    const setupModalButtons = () => {
      const modalElement = modalRef.current;
      if (!modalElement) return;

      // Setup close button
      const closeButton = modalElement.querySelector('[data-name="close"]');
      if (closeButton && !closeButton.hasAttribute('data-close-setup')) {
        closeButton.setAttribute('data-close-setup', 'true');
        (closeButton as HTMLElement).style.cursor = 'pointer';
        closeButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        });
      }

      // Setup Cancelar button
      const buttons = Array.from(modalElement.querySelectorAll('[data-name="Button"]'));
      buttons.forEach((button) => {
        const text = button.querySelector('p')?.textContent?.trim();
        if (text === 'Cancelar' && !button.hasAttribute('data-cancel-setup')) {
          button.setAttribute('data-cancel-setup', 'true');
          (button as HTMLElement).style.cursor = 'pointer';
          button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          });
        } else if (text === 'Salvar' && !button.hasAttribute('data-save-setup')) {
          button.setAttribute('data-save-setup', 'true');
          (button as HTMLElement).style.cursor = 'pointer';
          button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // TODO: Implement save logic
            onClose();
          });
        }
      });
    };

    setupModalButtons();
    const timer = setTimeout(setupModalButtons, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-[420px] h-[508px] max-w-[90vw]"
      >
        <ModalPerfilFigma />
      </div>
    </div>
  );
}