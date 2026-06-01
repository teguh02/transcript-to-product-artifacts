"use client";

import { useRef, useState } from "react";
import { exportElementToPng } from "@/lib/export-image";
import type { Wireframe } from "@/types/artifacts";
import { WireframeCard } from "./wireframe-card";

type WireframeGalleryProps = {
  wireframes: Wireframe[];
};

export function WireframeGallery({ wireframes }: WireframeGalleryProps) {
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownload(wireframe: Wireframe) {
    const element = refs.current[wireframe.screenId];

    if (!element) {
      return;
    }

    try {
      setDownloadingId(wireframe.screenId);
      await exportElementToPng(element, `${wireframe.screenId}-${wireframe.screenName}.png`);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {wireframes.map((wireframe) => (
        <section key={wireframe.screenId} className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{wireframe.screenName}</h3>
              <p className="text-sm text-slate-400">Structured low-fidelity wireframe rendered from AI output.</p>
            </div>
            <button
              type="button"
              onClick={() => void handleDownload(wireframe)}
              disabled={downloadingId === wireframe.screenId}
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloadingId === wireframe.screenId ? "Exporting..." : "Download PNG"}
            </button>
          </div>
          <WireframeCard
            wireframe={wireframe}
            ref={(node) => {
              refs.current[wireframe.screenId] = node;
            }}
          />
        </section>
      ))}
    </div>
  );
}
