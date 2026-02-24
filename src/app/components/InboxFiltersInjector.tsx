import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

export type InboxFilters = {
  search: string;
  days: "ontem" | "7" | "15" | null;
  date: string; // dd/mm/aaaa
};

function parseItemDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function parseDdMmYyyy(s: string): Date | null {
  const t = s.trim().replace(/\D/g, "");
  if (t.length !== 8) return null;
  const d = Number(t.slice(0, 2));
  const m = Number(t.slice(2, 4)) - 1;
  const y = Number(t.slice(4, 8));
  const date = new Date(y, m, d);
  if (isNaN(date.getTime()) || date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d)
    return null;
  return date;
}

function applyVisibility(filters: InboxFilters) {
  const items = document.querySelectorAll<HTMLElement>("[data-inbox-item]");
  const search = filters.search.toLowerCase().trim();
  const days = filters.days;
  const dateStr = filters.date.trim();

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  let rangeStart: Date | null = null;
  if (days === "ontem") {
    rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - 1);
    rangeStart.setHours(0, 0, 0, 0);
  } else if (days === "7") {
    rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - 7);
    rangeStart.setHours(0, 0, 0, 0);
  } else if (days === "15") {
    rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - 15);
    rangeStart.setHours(0, 0, 0, 0);
  }

  const filterDate = dateStr ? parseDdMmYyyy(dateStr) : null;

  items.forEach((el) => {
    const text = (el.getAttribute("data-inbox-text") ?? "") + " " + (el.getAttribute("data-inbox-author") ?? "");
    const itemDateStr = el.getAttribute("data-inbox-date");
    const itemDate = itemDateStr ? parseItemDate(itemDateStr) : null;

    let show = true;
    if (search && !text.toLowerCase().includes(search)) show = false;
    if (show && rangeStart !== null && itemDate !== null) {
      const endOfRange = new Date(today);
      endOfRange.setHours(23, 59, 59, 999);
      if (itemDate < rangeStart || itemDate > endOfRange) show = false;
    }
    if (show && filterDate !== null && itemDate !== null) {
      const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
      const selectedDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
      if (itemDay > selectedDay) show = false;
    }
    el.style.display = show ? "" : "none";
  });
}

function InboxFilterControls({
  filters,
  onChange,
}: {
  filters: InboxFilters;
  onChange: (f: InboxFilters) => void;
}) {
  const dayOpts = [
    { key: "ontem" as const, label: "Ontem" },
    { key: "7" as const, label: "7 dias" },
    { key: "15" as const, label: "15 dias" },
  ];

  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <div className="flex-[1_0_0] min-h-[42px] min-w-px">
        <div className="bg-[#22272a] flex h-full items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] border border-[#3d4448]">
          <input
            type="text"
            placeholder="Buscar no seu inbox..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="flex-1 min-w-0 bg-transparent text-[14px] text-[#f5f5f5] placeholder:text-[#a7b5b9] outline-none"
            aria-label="Buscar no inbox"
          />
          <div className="relative shrink-0 size-[20px] text-[#a7b5b9]" aria-hidden>
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-full">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex items-start shrink-0">
        <div className="flex rounded-[12px] overflow-hidden bg-[rgba(255,255,255,0.05)]">
          {dayOpts.map(({ key, label }) => {
            const active = filters.days === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ ...filters, days: filters.days === key ? null : key })}
                className={`px-[12px] py-[8px] text-[12px] font-semibold transition-colors ${
                  active
                    ? "bg-[#0090f9] text-white"
                    : "bg-transparent text-[#cbd4d6] hover:bg-[rgba(255,255,255,0.05)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 w-[264px]">
        <div className="bg-[#22272a] flex h-[42px] items-center justify-between px-[12px] rounded-[8px] border border-[#3d4448]">
          <input
            type="text"
            placeholder="dd/mm/aaaa"
            value={filters.date}
            onChange={(e) => onChange({ ...filters, date: e.target.value })}
            className="flex-1 min-w-0 bg-transparent text-[14px] text-[#f5f5f5] placeholder:text-[#a7b5b9] outline-none"
            aria-label="Filtrar por data"
          />
          <div className="shrink-0 size-[18px] text-[#f5f5f5]" aria-hidden>
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-full">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InboxFiltersInjector() {
  const [filters, setFilters] = useState<InboxFilters>({
    search: "",
    days: null,
    date: "",
  });
  const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = document.querySelector<HTMLElement>("[data-inbox-filters]");
    if (!container) return;
    containerRef.current = container;
    const wrap = document.createElement("div");
    wrap.className = "contents";
    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(wrap);
    const root = createRoot(wrap);
    rootRef.current = root;
    return () => {
      root.unmount();
      rootRef.current = null;
      containerRef.current = null;
    };
  }, []);

  useEffect(() => {
    applyVisibility(filters);
  }, [filters]);

  useEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.render(
      <InboxFilterControls filters={filters} onChange={setFilters} />
    );
  }, [filters]);

  return null;
}
