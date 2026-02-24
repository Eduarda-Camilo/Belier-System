import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { CodeEditor } from "./CodeEditor";

/**
 * Monta o editor de código (digitável + syntax highlight) no container [data-inject="novo-variant-0-code"].
 */
export function CodeEditorInjector({
  containerRef,
  value,
  onValueChange,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const el = root.querySelector('[data-inject="novo-variant-0-code"]');
    if (!el || !(el instanceof HTMLElement)) return;

    if (!mountedRef.current) {
      mountedRef.current = true;
      el.innerHTML = "";
      rootRef.current = createRoot(el);
    }

    rootRef.current?.render(
      <CodeEditor value={value} onValueChange={onValueChange} placeholder="Código da variante..." />
    );

    return () => {
      rootRef.current?.unmount();
      rootRef.current = null;
      mountedRef.current = false;
    };
  }, [containerRef, value, onValueChange]);

  return null;
}
