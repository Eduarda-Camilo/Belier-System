import { useState, useRef, useEffect } from "react";
import type { ComponentSummary } from "../api/client";

interface GlobalSearchProps {
  components: ComponentSummary[];
  onSelect: (slug: string) => void;
  placeholder?: string;
}

/**
 * Busca geral: filtra apenas componentes por nome/slug e navega ao selecionar.
 */
export function GlobalSearch({
  components,
  onSelect,
  placeholder = "Buscar componentes...",
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered =
    normalizedQuery.length === 0
      ? components.slice(0, 8)
      : components.filter(
          (c) =>
            c.name.toLowerCase().includes(normalizedQuery) ||
            c.slug.toLowerCase().includes(normalizedQuery) ||
            (c.description || "").toLowerCase().includes(normalizedQuery)
        );

  useEffect(() => {
    setHighlightIndex(0);
  }, [query, filtered.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (slug: string) => {
    onSelect(slug);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(filtered[highlightIndex].slug);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-[10px] border border-[#3d4448] bg-[#22272a] px-3 py-2 pl-9 text-[14px] text-white placeholder:text-[#a7b5b9] outline-none focus:border-[#16a6df]"
        aria-autocomplete="list"
        aria-expanded={open}
        role="combobox"
      />
      {open && (
        <ul
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[280px] overflow-y-auto rounded-[10px] border border-[#3d4448] bg-[#22272a] py-1 shadow-lg"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-[14px] text-[#a7b5b9]">Nenhum componente encontrado.</li>
          ) : (
            filtered.map((c, i) => (
              <li
                key={c.id}
                role="option"
                aria-selected={i === highlightIndex}
                className={`cursor-pointer px-3 py-2 text-[14px] text-white ${
                  i === highlightIndex ? "bg-[#16a6df]/20" : "hover:bg-white/5"
                }`}
                onMouseEnter={() => setHighlightIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(c.slug);
                }}
              >
                <span className="font-medium">{c.name}</span>
                {c.description && (
                  <span className="ml-2 text-[#a7b5b9]">— {c.description.slice(0, 40)}{c.description.length > 40 ? "…" : ""}</span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
