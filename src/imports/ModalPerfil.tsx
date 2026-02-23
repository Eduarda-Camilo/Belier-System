import svgPaths from "./svg-liqttme3sd";
import { imgVector } from "./svg-auoyg";

function Frame() {
  return (
    <div className="bg-[#16a6df] overflow-clip relative rounded-[40px] shrink-0 size-[38px]">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Roboto_Flex:Medium',sans-serif] font-medium h-[9px] justify-center leading-[0] left-[calc(50%+0.5px)] not-italic text-[#fcfcfc] text-[14px] text-center top-[calc(50%+0.5px)] w-[31px]" style={{ fontVariationSettings: "\'GRAD\' 0, \'XOPQ\' 96, \'XTRA\' 468, \'YOPQ\' 79, \'YTAS\' 750, \'YTDE\' -203, \'YTFI\' 738, \'YTLC\' 514, \'YTUC\' 712, \'wdth\' 100" }}>
        <p className="leading-[20px] whitespace-pre-wrap">FK</p>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start justify-center min-h-px min-w-px not-italic relative text-[#fcfcfc] whitespace-pre-wrap">
      <p className="font-['Roboto_Flex:Medium',sans-serif] font-medium h-[16px] leading-[20px] relative shrink-0 text-[14px] w-full" style={{ fontVariationSettings: "\'GRAD\' 0, \'XOPQ\' 96, \'XTRA\' 468, \'YOPQ\' 79, \'YTAS\' 750, \'YTDE\' -203, \'YTFI\' 738, \'YTLC\' 514, \'YTUC\' 712, \'wdth\' 100" }}>
        Fernanda Kempner
      </p>
      <p className="font-['Roboto_Flex:Regular',sans-serif] font-normal h-[16px] leading-[16px] relative shrink-0 text-[12px] w-full" style={{ fontVariationSettings: "\'GRAD\' 0, \'XOPQ\' 96, \'XTRA\' 468, \'YOPQ\' 79, \'YTAS\' 750, \'YTDE\' -203, \'YTFI\' 738, \'YTLC\' 514, \'YTUC\' 712, \'wdth\' 100" }}>
        Administrador
      </p>
    </div>
  );
}

function Profile() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[16px] relative shrink-0 w-full" data-name="Profile">
      <div aria-hidden="true" className="absolute border-[#005689] border-b border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Profile">
        <Frame />
        <Frame1 />
      </div>
    </div>
  );
}

function User() {
  return (
    <div className="absolute inset-[19.79%_17.71%]" data-name="user">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.5 14.5">
        <g id="user">
          <path d={svgPaths.p3d61e800} fill="var(--fill-0, #FCFCFC)" id="Vector" />
          <path d={svgPaths.p3119ad00} fill="var(--fill-0, #FCFCFC)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Key() {
  return (
    <div className="absolute inset-[13.37%_13.46%_13.54%_15.87%]" data-name="key">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.961 17.54">
        <g id="key">
          <path d={svgPaths.p312e4f80} fill="var(--fill-0, #FCFCFC)" id="Vector" />
          <path d={svgPaths.p256ef8c0} fill="var(--fill-0, #FCFCFC)" id="Vector_2" />
          <path d={svgPaths.p1c646b00} fill="var(--fill-0, #FCFCFC)" id="Vector_3" />
          <path d={svgPaths.pf8c7000} fill="var(--fill-0, #FCFCFC)" id="Vector_4" />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
      <div className="h-[32px] relative rounded-[8px] shrink-0 w-full" data-name="Menuitem-Link">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
            <div className="relative shrink-0 size-[24px]" data-name="supervisor_account">
              <div className="absolute inset-[19.55%_9.62%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2.308px_-4.692px] mask-size-[24px_24px]" data-name="Vector" style={{ maskImage: `url('${imgVector}')` }}>
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.3845 14.6155">
                  <path d={svgPaths.p29c2b300} fill="var(--fill-0, #FCFCFC)" id="Vector" />
                </svg>
              </div>
            </div>
            <p className="flex-[1_0_0] font-['Roboto_Flex:Medium',sans-serif] font-medium leading-[20px] min-h-px min-w-px not-italic relative text-[#fcfcfc] text-[14px] whitespace-pre-wrap" style={{ fontVariationSettings: "\'GRAD\' 0, \'XOPQ\' 96, \'XTRA\' 468, \'YOPQ\' 79, \'YTAS\' 750, \'YTDE\' -203, \'YTFI\' 738, \'YTLC\' 514, \'YTUC\' 712, \'wdth\' 100" }}>
              Usuários
            </p>
          </div>
        </div>
      </div>
      <div className="h-[32px] relative rounded-[8px] shrink-0 w-full" data-name="Menuitem-Link">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-name="user">
              <User />
            </div>
            <p className="flex-[1_0_0] font-['Roboto_Flex:Medium',sans-serif] font-medium leading-[20px] min-h-px min-w-px not-italic relative text-[#fcfcfc] text-[14px] whitespace-pre-wrap" style={{ fontVariationSettings: "\'GRAD\' 0, \'XOPQ\' 96, \'XTRA\' 468, \'YOPQ\' 79, \'YTAS\' 750, \'YTDE\' -203, \'YTFI\' 738, \'YTLC\' 514, \'YTUC\' 712, \'wdth\' 100" }}>
              Perfil
            </p>
          </div>
        </div>
      </div>
      <div className="h-[32px] relative rounded-[8px] shrink-0 w-full" data-name="Menuitem-Link">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-name="key">
              <Key />
            </div>
            <p className="flex-[1_0_0] font-['Roboto_Flex:Medium',sans-serif] font-medium leading-[20px] min-h-px min-w-px not-italic relative text-[#fcfcfc] text-[14px] whitespace-pre-wrap" style={{ fontVariationSettings: "\'GRAD\' 0, \'XOPQ\' 96, \'XTRA\' 468, \'YOPQ\' 79, \'YTAS\' 750, \'YTDE\' -203, \'YTFI\' 738, \'YTLC\' 514, \'YTUC\' 712, \'wdth\' 100" }}>
              Trocar senha
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignOut() {
  return (
    <div className="absolute inset-[13.53%_13.54%]" data-name="sign-out">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5 17.5048">
        <g id="sign-out">
          <path d={svgPaths.p334ab100} fill="var(--fill-0, #FCFCFC)" id="Vector" />
          <path d={svgPaths.pdaf3b00} fill="var(--fill-0, #FCFCFC)" id="Vector_2" />
          <path d={svgPaths.p370d4180} fill="var(--fill-0, #FCFCFC)" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[16px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#005689] border-solid border-t inset-0 pointer-events-none" />
      <div className="relative rounded-[8px] shrink-0 w-full" data-name="Menuitem-Link">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative w-full">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-name="sign-out">
              <SignOut />
            </div>
            <p className="flex-[1_0_0] font-['Roboto_Flex:Medium',sans-serif] font-medium leading-[20px] min-h-px min-w-px not-italic relative text-[#fcfcfc] text-[14px] whitespace-pre-wrap" style={{ fontVariationSettings: "\'GRAD\' 0, \'XOPQ\' 96, \'XTRA\' 468, \'YOPQ\' 79, \'YTAS\' 750, \'YTDE\' -203, \'YTFI\' 738, \'YTLC\' 514, \'YTUC\' 712, \'wdth\' 100" }}>
              Sair
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ModalPerfil() {
  return (
    <div className="bg-[#003c60] content-stretch flex flex-col gap-[10px] items-start p-[16px] relative rounded-[12px] size-full" data-name="Modal - perfil">
      <div aria-hidden="true" className="absolute border border-[#005689] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_10px_10px_0px_rgba(0,0,0,0.04)]" />
      <Profile />
      <Frame2 />
      <Frame3 />
    </div>
  );
}