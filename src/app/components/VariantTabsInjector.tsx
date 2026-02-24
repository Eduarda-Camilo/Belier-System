import { useEffect } from "react";

const ACTIVE_TAB_CLASS = "bg-[#0090f9]";
const INACTIVE_TAB_CLASS = "bg-[rgba(34,39,42,0.7)]";

/**
 * Faz as tabs Preview / Código / Comentários funcionarem na página do componente.
 * Botões com data-variant-tab="0-preview" | "0-code" | "0-comments" (e 1-*) alternam
 * a visibilidade dos painéis data-variant-panel e atualizam o estilo do tab ativo.
 */
export function VariantTabsInjector({ ready = true }: { ready?: boolean }) {
  useEffect(() => {
    if (!ready) return;
    let cleanup: (() => void) | null = null;
    const t = setTimeout(() => {
      const handleTabClick = (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        const tab = target.getAttribute("data-variant-tab");
        if (!tab) return;
        const [variantIndex] = tab.split("-");
        const block = document.querySelector(`[data-variant-block="${variantIndex}"]`);
        if (!block) return;

        block.querySelectorAll("[data-variant-panel]").forEach((el) => {
          const panel = el as HTMLElement;
          if (panel.getAttribute("data-variant-panel") === tab) {
            panel.classList.remove("hidden");
            panel.classList.add("block");
          } else {
            panel.classList.add("hidden");
            panel.classList.remove("block");
          }
        });

        const tabsContainer = block.querySelector("[data-variant-tabs]");
        tabsContainer?.querySelectorAll(".variant-tab").forEach((btn) => {
          const b = btn as HTMLElement;
          const bt = b.getAttribute("data-variant-tab");
          if (bt === tab) {
            b.classList.remove(INACTIVE_TAB_CLASS);
            b.classList.add(ACTIVE_TAB_CLASS);
          } else {
            b.classList.remove(ACTIVE_TAB_CLASS);
            b.classList.add(INACTIVE_TAB_CLASS);
          }
        });
      };

      const tabs = document.querySelectorAll("[data-variant-tab]");
      tabs.forEach((el) => el.addEventListener("click", handleTabClick));
      cleanup = () => {
        tabs.forEach((el) => el.removeEventListener("click", handleTabClick));
      };
    }, 150);
    return () => {
      clearTimeout(t);
      cleanup?.();
    };
  }, [ready]);

  return null;
}
