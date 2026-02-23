import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";

interface ProfileDropdownProps {
  onOpenProfile: () => void;
  onOpenChangePassword: () => void;
}

export function ProfileDropdown({ onOpenProfile, onOpenChangePassword }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    navigate("/login");
  };

  const handleOpenProfile = () => {
    setIsOpen(false);
    onOpenProfile();
  };

  const handleOpenChangePassword = () => {
    setIsOpen(false);
    onOpenChangePassword();
  };

  const handleNavigateToUsers = () => {
    setIsOpen(false);
    navigate("/usuarios");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#2d90ff] content-stretch flex flex-col items-center justify-center rounded-[64px] shrink-0 size-[44px] hover:bg-[#2580e5] transition-colors"
        data-name="avatar"
      >
        <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] overflow-hidden relative shrink-0 text-[24px] text-center text-ellipsis text-white w-full whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="leading-[34px] overflow-hidden">FK</p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 bg-[#0d3a52] border border-[#3d4448] rounded-[16px] w-[320px] p-[16px] shadow-xl">
          {/* User Info */}
          <div className="flex gap-[16px] items-center mb-[16px] pb-[16px] border-b border-[#3d4448]">
            <div className="bg-[#2d90ff] content-stretch flex flex-col items-center justify-center rounded-[64px] shrink-0 size-[44px]">
              <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] overflow-hidden relative shrink-0 text-[24px] text-center text-ellipsis text-white w-full whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                <p className="leading-[34px] overflow-hidden">FK</p>
              </div>
            </div>
            <div className="flex flex-col gap-[4px]">
              <p className="font-['Open_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                Fernanda Kempner
              </p>
              <p className="font-['Open_Sans:Regular',sans-serif] text-[14px] text-[#f5f5f5]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Administrador
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-[4px] mb-[16px]">
            {/* Usuários - Navigate to page */}
            <button
              onClick={handleNavigateToUsers}
              onMouseEnter={() => setHoveredItem("usuarios")}
              onMouseLeave={() => setHoveredItem(null)}
              className={`flex gap-[12px] items-center px-[12px] py-[10px] rounded-[8px] transition-colors ${
                hoveredItem === "usuarios" ? "bg-[#004a75]" : ""
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white" />
              </svg>
              <p className="font-['Open_Sans:Regular',sans-serif] text-[16px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                Usuários
              </p>
            </button>

            {/* Perfil - Open modal */}
            <button
              onClick={handleOpenProfile}
              onMouseEnter={() => setHoveredItem("perfil")}
              onMouseLeave={() => setHoveredItem(null)}
              className={`flex gap-[12px] items-center px-[12px] py-[10px] rounded-[8px] transition-colors ${
                hoveredItem === "perfil" ? "bg-[#004a75]" : ""
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white" />
              </svg>
              <p className="font-['Open_Sans:Regular',sans-serif] text-[16px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                Perfil
              </p>
            </button>

            {/* Trocar Senha */}
            <button
              onClick={handleOpenChangePassword}
              onMouseEnter={() => setHoveredItem("senha")}
              onMouseLeave={() => setHoveredItem(null)}
              className={`flex gap-[12px] items-center px-[12px] py-[10px] rounded-[8px] transition-colors ${
                hoveredItem === "senha" ? "bg-[#004a75]" : ""
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="white" />
              </svg>
              <p className="font-['Open_Sans:Regular',sans-serif] text-[16px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                Trocar senha
              </p>
            </button>
          </div>

          {/* Logout */}
          <div className="pt-[16px] border-t border-[#3d4448]">
            <button
              onClick={handleLogout}
              onMouseEnter={() => setHoveredItem("sair")}
              onMouseLeave={() => setHoveredItem(null)}
              className={`flex gap-[12px] items-center px-[12px] py-[10px] rounded-[8px] w-full transition-colors ${
                hoveredItem === "sair" ? "bg-[#004a75]" : ""
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="white" />
              </svg>
              <p className="font-['Open_Sans:Regular',sans-serif] text-[16px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                Sair
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}