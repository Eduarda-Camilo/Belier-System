import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { getPreviewComponent, renderPreview } from "../preview/registry";
import type { ComponentDetail } from "../api/client";

/**
 * Injeta dados do componente na página (layout Figma).
 * Usa data-inject para identificar elementos e substituir conteúdo.
 * Também renderiza previews dinâmicos via registry.
 */
export function ComponentDataInjector({
  componentData,
  slug,
}: {
  componentData: ComponentDetail | null;
  slug: string;
}) {
  const rootsRef = useRef<Map<string, { root: ReturnType<typeof createRoot>; el: HTMLElement }>>(new Map());

  useEffect(() => {
    if (!componentData) return;

    const inject = () => {
      // Título do componente
      const titleEl = document.querySelector('[data-inject="component-title"]');
      if (titleEl && titleEl instanceof HTMLElement) {
        titleEl.textContent = componentData.name;
      }

      // Descrição do componente
      const descEl = document.querySelector('[data-inject="component-description"]');
      if (descEl && descEl instanceof HTMLElement) {
        descEl.textContent = componentData.description || "Descrição";
      }

      // Import description
      const importDescEl = document.querySelector('[data-inject="import-description"]');
      if (importDescEl && importDescEl instanceof HTMLElement) {
        importDescEl.innerHTML = componentData.importDescription || "Descrição de import.";
      }

      // Snippets de import
      const snippetIndividual = document.querySelector('[data-inject="import-snippet-individual"]');
      if (snippetIndividual && snippetIndividual instanceof HTMLElement) {
        snippetIndividual.textContent =
          componentData.importSnippetIndividual || `import { ${componentData.name} } from "@belierui/${slug}";`;
      }

      const snippetGlobal = document.querySelector('[data-inject="import-snippet-global"]');
      if (snippetGlobal && snippetGlobal instanceof HTMLElement) {
        snippetGlobal.textContent =
          componentData.importSnippetGlobal || `// registre o ${componentData.name} no seu design system global`;
      }

      // Variantes
      componentData.variants.forEach((variant, i) => {
        const titleEl = document.querySelector(`[data-inject="variant-${i}-title"]`);
        if (titleEl && titleEl instanceof HTMLElement) {
          titleEl.textContent = variant.title;
        }

        const variantDescEl = document.querySelector(`[data-inject="variant-${i}-description"]`);
        if (variantDescEl && variantDescEl instanceof HTMLElement) {
          variantDescEl.textContent = variant.description || "Descrição";
        }

        const codeEl = document.querySelector(`[data-inject="variant-${i}-code"]`);
        if (codeEl && codeEl instanceof HTMLElement) {
          const snippet = variant.codeSnippet || "";
          const escaped = snippet
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
          codeEl.innerHTML = `
            <div class="content-stretch flex flex-col gap-[8px] items-start p-[24px] relative w-full">
              <div class="content-start flex flex-wrap gap-y-[8px] items-start relative rounded-[8px] shrink-0 w-full" data-name="Content">
                <div class="content-start flex flex-[1_0_0] flex-wrap font-['Source_Code_Pro:Regular',sans-serif] font-normal gap-[4px_8px] items-start leading-[20px] min-h-px min-w-px relative rounded-[8px] text-[14px]" data-name="Text">
                  <p class="relative shrink-0 text-[rgba(255,255,255,0.4)]" style="font-feature-settings: 'ss01', 'cv01', 'cv11'">${escaped}</p>
                </div>
              </div>
            </div>
          `;
        }

        // Preview dinâmico
        const previewContainer = document.querySelector(`[data-inject="variant-${i}-preview"]`);
        if (previewContainer && previewContainer instanceof HTMLElement) {
          const key = `preview-${slug}-${i}`;
          let entry = rootsRef.current.get(key);
          if (!entry) {
            const root = createRoot(previewContainer);
            rootsRef.current.set(key, { root, el: previewContainer });
            entry = { root, el: previewContainer };
          }

          const PreviewComp = getPreviewComponent(slug);
          const { props, children } = renderPreview(slug, variant);

          entry.root.render(
            <div className="flex items-center justify-center p-4">
              <PreviewComp previewProps={props} previewChildren={children} />
            </div>
          );
        }
      });
    };

    inject();
    const t1 = setTimeout(inject, 100);
    const t2 = setTimeout(inject, 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      rootsRef.current.forEach(({ root }) => root.unmount());
      rootsRef.current.clear();
    };
  }, [componentData, slug]);

  return null;
}
