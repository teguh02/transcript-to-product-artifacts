import type { ScreenItem } from "@/types/artifacts";

type ScreenListViewProps = {
  screens: ScreenItem[];
};

export function ScreenListView({ screens }: ScreenListViewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {screens.map((screen) => (
        <article key={screen.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-semibold text-white">{screen.name}</h3>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              {screen.id}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-200">{screen.purpose}</p>
          <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Primary User</div>
          <p className="mt-2 text-sm text-slate-200">{screen.primaryUser}</p>
          <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Key Features</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {screen.keyFeatures.map((feature) => (
              <span key={feature} className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs text-slate-200">
                {feature}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
