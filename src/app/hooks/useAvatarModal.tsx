import { useState, useCallback } from "react";

export function useAvatarModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const openModal = useCallback((avatarElement: HTMLElement) => {
    const rect = avatarElement.getBoundingClientRect();
    setPosition({
      top: rect.top,
      right: window.innerWidth - rect.right,
    });
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    position,
    openModal,
    closeModal,
  };
}
