import { ComponentType, useState } from "react";
import { LoggedNavigationInjector } from "./LoggedNavigationInjector";
import { AvatarModal } from "./AvatarModal";
import { PerfilModal } from "./PerfilModal";
import { TrocarSenhaModal } from "./TrocarSenhaModal";

export function withProfileDropdown<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return function WithProfileDropdownComponent(props: P) {
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
    const [isTrocarSenhaModalOpen, setIsTrocarSenhaModalOpen] = useState(false);
    const [avatarPosition, setAvatarPosition] = useState({ top: 0, right: 0 });

    const handleAvatarClick = (avatarElement: HTMLElement) => {
      const rect = avatarElement.getBoundingClientRect();
      setAvatarPosition({
        top: rect.top,
        right: window.innerWidth - rect.right,
      });
      setIsAvatarModalOpen(true);
    };

    const handlePerfilClick = () => {
      setIsAvatarModalOpen(false);
      setIsPerfilModalOpen(true);
    };

    const handleTrocarSenhaClick = () => {
      setIsAvatarModalOpen(false);
      setIsTrocarSenhaModalOpen(true);
    };

    return (
      <>
        <WrappedComponent {...props} />
        
        {/* Inject navigation for logged pages */}
        <LoggedNavigationInjector 
          onAvatarClick={handleAvatarClick}
          onPerfilClick={handlePerfilClick}
          onTrocarSenhaClick={handleTrocarSenhaClick}
        />
        
        {/* Avatar Modal */}
        <AvatarModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          avatarPosition={avatarPosition}
          onPerfilClick={handlePerfilClick}
          onTrocarSenhaClick={handleTrocarSenhaClick}
        />

        {/* Perfil Modal */}
        <PerfilModal
          isOpen={isPerfilModalOpen}
          onClose={() => setIsPerfilModalOpen(false)}
        />

        {/* Trocar Senha Modal */}
        <TrocarSenhaModal
          isOpen={isTrocarSenhaModalOpen}
          onClose={() => setIsTrocarSenhaModalOpen(false)}
        />
      </>
    );
  };
}