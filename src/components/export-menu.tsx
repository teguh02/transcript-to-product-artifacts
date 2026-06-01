"use client";

import { useEffect, useRef, useState } from "react";
import type { ExportFormat } from "@/lib/exporters";

type ExportMenuProps = {
  disabled: boolean;
  exportingFormat: ExportFormat | null;
  onExport: (format: ExportFormat) => Promise<void> | void;
};

const exportItems: Array<{ format: ExportFormat; label: string; description: string }> = [
  { format: "json", label: "Export JSON", description: "Raw structured output" },
  { format: "docx", label: "Export DOCX", description: "Formal editable document" },
  { format: "pdf", label: "Export PDF", description: "Formal fixed-layout document" },
];

export function ExportMenu({ disabled, exportingFormat, onExport }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={disabled || exportingFormat !== null}
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {exportingFormat ? `Exporting ${exportingFormat.toUpperCase()}...` : "Export"}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-64 rounded-3xl border border-white/10 bg-slate-950/95 p-2 shadow-[0_30px_90px_rgba(2,6,23,0.6)] backdrop-blur-xl">
          {exportItems.map((item) => (
            <button
              key={item.format}
              type="button"
              onClick={async () => {
                setOpen(false);
                await onExport(item.format);
              }}
              disabled={exportingFormat !== null}
              className="flex w-full items-start justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div>
                <div className="text-sm font-semibold text-white">{item.label}</div>
                <div className="mt-1 text-xs text-slate-400">{item.description}</div>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
