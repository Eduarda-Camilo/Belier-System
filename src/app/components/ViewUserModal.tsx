import { useEffect } from "react";
import svgPaths from "../../imports/svg-p0alf3d6sc";
import { imgVector, imgVector1 } from "../../imports/svg-8ci7x";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
}

export function ViewUserModal({ isOpen, onClose, userName, userEmail }: ViewUserModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get initials from name
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 backdrop-blur-[8px] bg-black/30" />

      {/* Modal */}
      <div
        className="bg-[#22272a] border border-[#3d4448] rounded-[16px] relative w-full max-w-[420px]"
        onClick={(e) => e.stopPropagation()}
        data-name="Modal - ver usuario"
      >
        <div className="content-stretch flex flex-col items-center justify-between gap-[24px] max-w-[inherit] overflow-clip p-[24px] relative rounded-[inherit] size-full">
          {/* Header */}
          <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
            <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
              <p className="font-['Open_Sans:Bold',sans-serif] font-bold leading-[30px] relative shrink-0 text-[20px] text-white w-full whitespace-pre-wrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                Ver usuário
              </p>
              <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#f5f5f5] text-[12px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                <p className="leading-[18px] whitespace-pre-wrap">Visualização do usuário</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="block cursor-pointer relative shrink-0 size-[24px] hover:opacity-70 transition-opacity" 
              data-name="close"
            >
              <div className="absolute inset-[23.57%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-5.656px_-5.656px] mask-size-[24px_24px]" data-name="Vector" style={{ maskImage: `url('${imgVector}')` }}>
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.6885 12.6885">
                  <path d={svgPaths.p4db7980} fill="var(--fill-0, #F5F5F5)" id="Vector" />
                </svg>
              </div>
            </button>
          </div>

          {/* Avatar */}
          <div className="bg-[#2d90ff] content-stretch flex flex-col items-center justify-center relative rounded-[133.333px] shrink-0 size-[100px]" data-name="avatar">
            <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[48px] text-center text-ellipsis text-white w-full whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[64px] overflow-hidden">{getInitials(userName)}</p>
            </div>
          </div>

          {/* Form Fields (Read-only) */}
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
            {/* Nome de exibição */}
            <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0 w-full" data-name="Text Input">
              <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="Label">
                <p className="font-['Open_Sans:SemiBold',sans-serif] font-semibold leading-[20px] relative shrink-0 text-[14px] text-left text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Nome de exibição
                </p>
              </div>
              <div className="bg-[#22272a] border border-[#3d4448] relative rounded-[12px] shrink-0 w-full" data-name="Placeholder">
                <div className="flex flex-row items-center size-full">
                  <div className="content-stretch flex items-center p-[12px] relative w-full">
                    <p className="flex-[1_0_0] font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#f5f5f5] text-[14px] text-left whitespace-pre-wrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      {userName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* E-mail */}
            <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0 w-full" data-name="Text Input">
              <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="Label">
                <p className="font-['Open_Sans:SemiBold',sans-serif] font-semibold leading-[20px] relative shrink-0 text-[14px] text-left text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                  E-mail
                </p>
              </div>
              <div className="bg-[#22272a] border border-[#3d4448] relative rounded-[12px] shrink-0 w-full" data-name="Placeholder">
                <div className="flex flex-row items-center size-full">
                  <div className="content-stretch flex items-center p-[12px] relative w-full">
                    <p className="flex-[1_0_0] font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#f5f5f5] text-[14px] text-left whitespace-pre-wrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      {userEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Senha (hidden) */}
            <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0 w-full" data-name="Password Input">
              <div className="content-stretch flex font-['Open_Sans:SemiBold',sans-serif] font-semibold gap-[4px] items-center leading-[20px] relative shrink-0 text-[14px] w-full" data-name="Label">
                <p className="relative shrink-0 text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Senha
                </p>
                <p className="relative shrink-0 text-[#ff6a6a]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  *
                </p>
              </div>
              <div className="bg-[#22272a] border border-[#3d4448] relative rounded-[12px] shrink-0 w-full" data-name="Placeholder">
                <div className="flex flex-row items-center size-full">
                  <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[10px] relative w-full">
                    <p className="flex-[1_0_0] font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] min-h-px min-w-px relative text-[#f5f5f5] text-[16px] whitespace-pre-wrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      ••••••••
                    </p>
                    <div className="relative shrink-0 size-[18px]" data-name="visibility_off">
                      <div className="absolute inset-[14.56%_7.24%_10.17%_7.45%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.789px_-3.494px] mask-size-[24px_24px]" data-name="Vector" style={{ maskImage: `url('${imgVector1}')` }}>
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.3548 13.5489">
                          <path d={svgPaths.p2cb8ef80} fill="var(--fill-0, #F5F5F5)" id="Vector" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
            <button
              onClick={onClose}
              className="bg-[#16a6df] hover:bg-[#1292c7] transition-colors w-full h-[48px] relative rounded-[12px]"
              data-name="Button"
            >
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[24px] py-[12px] relative size-full">
                  <p className="font-['Open_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[16px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Fechar
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
