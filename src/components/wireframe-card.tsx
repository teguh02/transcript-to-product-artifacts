"use client";

import { forwardRef } from "react";
import type { Wireframe } from "@/types/artifacts";

type WireframeCardProps = {
  wireframe: Wireframe;
};

export const WireframeCard = forwardRef<HTMLDivElement, WireframeCardProps>(function WireframeCard(
  { wireframe },
  ref,
) {
  return (
    <div className="space-y-4">
      <div ref={ref} className="rounded-[28px] border-4 border-slate-900 bg-white p-6 text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b-2 border-slate-300 pb-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{wireframe.screenId}</div>
            <h3 className="mt-2 text-xl font-semibold">{wireframe.screenName}</h3>
          </div>
          <div className="rounded-full border-2 border-slate-300 px-4 py-2 text-sm font-medium">{wireframe.layout}</div>
        </div>

        <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm">
          <span className="font-semibold">Goal:</span> {wireframe.goal}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {wireframe.sections.map((section) => (
            <section key={section.name} className="rounded-2xl border-2 border-slate-300 p-4">
              <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{section.name}</div>
              <div className="space-y-2">
                {section.components.map((component) => (
                  <div key={component} className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-3 text-sm">
                    {component}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border-2 border-slate-300 p-4">
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Interaction Notes</div>
            <ul className="space-y-2 text-sm">
              {wireframe.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-slate-300 p-4">
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Primary CTA</div>
            <div className="rounded-xl border-2 border-slate-400 bg-slate-100 px-4 py-3 text-center text-sm font-semibold">
              {wireframe.primaryAction}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
