import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { api, type ChangelogEntry } from "../api/client";

/**
 * Busca o changelog na API e renderiza a lista no container [data-inject="changelog-list"].
 */
export function ChangelogDataInjector() {
  const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = document.querySelector('[data-inject="changelog-list"]');
    if (!container || !(container instanceof HTMLElement)) return;

    api
      .getChangelog({ period: "7" })
      .then((entries) => {
        if (cancelled) return;
        if (!rootRef.current) rootRef.current = createRoot(container);
        rootRef.current.render(
          <ChangelogList entries={entries} />
        );
      })
      .catch(() => {
        if (cancelled) return;
        if (!rootRef.current) rootRef.current = createRoot(container);
        rootRef.current.render(
          <div className="p-4 text-[#cbd4d6] text-sm">
            Não foi possível carregar o changelog.
          </div>
        );
      });

    return () => {
      cancelled = true;
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, []);

  return null;
}

function ChangelogList({ entries }: { entries: ChangelogEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="p-4 text-[#cbd4d6] text-sm">
        Nenhuma alteração no período.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto h-full">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="rounded-[12px] bg-[rgba(255,255,255,0.05)] p-4 border border-[#3d4448]"
        >
          <div className="flex flex-wrap items-center gap-2 text-[14px] text-white">
            <span className="font-semibold">{entry.componentName ?? "Componente"}</span>
            <span className="text-[#cbd4d6]">—</span>
            <span>{entry.variantTitle}</span>
          </div>
          <p className="mt-1 text-[12px] text-[#cbd4d6]">
            {entry.createdAt ? new Date(entry.createdAt).toLocaleString("pt-BR") : ""}
          </p>
          {entry.codeSnippet && (
            <pre className="mt-2 p-2 rounded bg-[#1c1c1c] text-[12px] text-[rgba(255,255,255,0.8)] overflow-x-auto">
              {entry.codeSnippet.slice(0, 200)}
              {entry.codeSnippet.length > 200 ? "…" : ""}
            </pre>
          )}
          {entry.componentSlug && (
            <a
              href={`/components/${entry.componentSlug}`}
              className="inline-block mt-2 text-[14px] text-[#16a6df] hover:underline"
            >
              Ver componente
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
