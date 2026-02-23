import type { ComponentSummary } from "../api/client";

const itemClass =
  "relative rounded-[8px] shrink-0 w-full cursor-pointer hover:bg-[rgba(255,255,255,0.05)]";
const itemActiveClass = "bg-[rgba(0,64,166,0.3)]";
const innerClass =
  "flex flex-row items-center size-full content-stretch flex items-center pl-[24px] pr-[16px] py-[8px] relative w-full";
const textClass =
  "flex-[1_0_0] font-['Roboto_Flex:Medium',sans-serif] font-medium leading-[normal] min-h-px min-w-px not-italic relative text-[14px] text-white whitespace-pre-wrap";

export function SidebarComponentList({
  components,
  isPublic,
  currentPath,
  onNavigate,
}: {
  components: ComponentSummary[];
  isPublic: boolean;
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <>
      {components.map((c) => {
        const path = isPublic ? `/components/${c.slug}/public` : `/components/${c.slug}`;
        const active = currentPath === path;
        return (
          <div
            key={c.id}
            role="button"
            tabIndex={0}
            className={active ? `${itemClass} ${itemActiveClass}` : itemClass}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNavigate(path);
              }
            }}
            onClick={() => onNavigate(path)}
          >
            <div className={innerClass}>
              <p className={textClass} style={{ fontVariationSettings: "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100" }}>
                {c.name}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
}
