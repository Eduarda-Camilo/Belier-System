import { useEffect } from "react";
import svgPaths from "../../imports/svg-16znrqidat";
import { imgAlertBox } from "../../imports/svg-u4hym";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

export function DeleteUserModal({ isOpen, onClose, onConfirm, userName }: DeleteUserModalProps) {
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 backdrop-blur-[8px] bg-black/30" />

      {/* Modal */}
      <div
        className="bg-[#22272a] border border-[#3d4448] rounded-[16px] relative w-full max-w-[420px] p-[24px]"
        onClick={(e) => e.stopPropagation()}
        data-name="Alert Box"
      >
        {/* Icon */}
        <div className="flex items-center justify-center mb-[16px]">
          <div className="bg-[rgba(227,26,26,0.1)] content-stretch flex items-center justify-center p-[6px] relative rounded-[1000px] shrink-0 size-[48px]">
            <div className="relative shrink-0 size-[36px]" data-name="cancel">
              <div className="absolute inset-[10.42%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2.5px_-2.5px] mask-size-[24px_24px]" data-name="Vector" style={{ maskImage: `url('${imgAlertBox}')` }}>
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28.5 28.5">
                  <path d={svgPaths.p91e5800} fill="var(--fill-0, #E31A1A)" id="Vector" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center justify-center mb-[8px] relative w-full" data-name="Frame 1">
          <p className="font-['Open_Sans:Bold',sans-serif] font-bold leading-[30px] text-[20px] text-center text-white w-full whitespace-pre-wrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Excluir usuário
          </p>
        </div>

        {/* Description */}
        <div className="flex flex-col items-center justify-center mb-[24px] relative w-full" data-name="Frame 2">
          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] text-[16px] text-center text-[#f5f5f5] w-full whitespace-pre-wrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Tem certeza que deseja excluir o <span className="font-['Open_Sans:Bold',sans-serif] font-bold" style={{ fontVariationSettings: "'wdth' 100" }}>usuário</span> {userName}? Essa ação é destrutiva e não pode ser desfeita.
          </p>
        </div>

        {/* Buttons */}
        <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
          <button
            onClick={onClose}
            className="flex-[1_0_0] h-[48px] min-h-px min-w-px relative rounded-[12px] hover:bg-[#3d4448] transition-colors"
            data-name="Button"
          >
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex items-center justify-center px-[24px] py-[12px] relative size-full">
                <p className="font-['Open_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[16px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Cancelar
                </p>
              </div>
            </div>
          </button>
          <button
            onClick={handleConfirm}
            className="bg-[#eb3e38] hover:bg-[#d63531] transition-colors flex-[1_0_0] h-[48px] min-h-px min-w-px relative rounded-[12px]"
            data-name="Button"
          >
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex items-center justify-center px-[24px] py-[12px] relative size-full">
                <p className="font-['Open_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[16px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Excluir
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}