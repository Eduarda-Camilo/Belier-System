import { useEffect } from "react";
import svgPaths from "../../imports/svg-ipjrayudc6";
import { imgVector } from "../../imports/svg-r0cm1";

interface DeleteUserModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

export function DeleteUserModalNew({ isOpen, onClose, onConfirm, userName }: DeleteUserModalNewProps) {
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

  const handleConfirm = () => {
    onConfirm();
    // Modal é fechado pelo pai após sucesso da API
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 backdrop-blur-[8px] bg-black/30" />

      {/* Modal */}
      <div
        className="bg-[#22272a] border border-[#3d4448] rounded-[12px] relative w-full max-w-[420px]"
        onClick={(e) => e.stopPropagation()}
        data-name="modal - exclusao de usuario"
      >
        <div className="content-stretch flex flex-col gap-[16px] items-start p-[24px] relative size-full">
          {/* Icon + Text */}
          <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full" data-name="Text + Icon">
            {/* Icon */}
            <div className="bg-[rgba(227,26,26,0.1)] content-stretch flex items-center justify-center p-[6px] relative rounded-[1000px] shrink-0 size-[48px]">
              <div className="relative shrink-0 size-[36px]" data-name="cancel">
                <div className="absolute inset-[10.42%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2.5px_-2.5px] mask-size-[24px_24px]" data-name="Vector" style={{ maskImage: `url('${imgVector}')` }}>
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28.5 28.5">
                    <path d={svgPaths.p91e5800} fill="var(--fill-0, #E31A1A)" id="Vector" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="content-stretch flex flex-col gap-[4px] items-start leading-[0] relative shrink-0 text-center w-full" data-name="Text">
              <div className="flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-end relative shrink-0 text-[20px] text-white w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                <p className="leading-[30px] whitespace-pre-wrap">Excluir o usuário {userName}?</p>
              </div>
              <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-end relative shrink-0 text-[#f5f5f5] text-[16px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                <p className="whitespace-pre-wrap">
                  <span className="leading-[24px]">Tem certeza que deseja excluir o </span>
                  <span className="font-['Open_Sans:Bold',sans-serif] font-bold leading-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    usuário
                  </span>
                  <span className="leading-[24px]"> {userName}? Essa ação é destrutiva e não pode ser desfeita.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="content-stretch flex gap-[8px] h-[36px] items-start relative shrink-0 w-full" data-name="Buttons">
            <button
              onClick={onClose}
              className="flex-[1_0_0] h-[36px] min-h-px min-w-px relative rounded-[8px] hover:bg-[#3d4448] transition-colors"
              data-name="Button"
            >
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[16px] py-[8px] relative size-full">
                  <p className="font-['Open_Sans:SemiBold',sans-serif] font-semibold leading-[20px] relative shrink-0 text-[14px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Cancelar
                  </p>
                </div>
              </div>
            </button>
            <button
              onClick={handleConfirm}
              className="bg-[#0090f9] hover:bg-[#007acc] transition-colors flex-[1_0_0] h-[36px] min-h-px min-w-px relative rounded-[8px]"
              data-name="Button"
            >
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[16px] py-[8px] relative size-full">
                  <p className="font-['Open_Sans:SemiBold',sans-serif] font-semibold leading-[20px] relative shrink-0 text-[14px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Excluir
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
