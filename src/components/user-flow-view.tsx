import type { UserFlowStep } from "@/types/artifacts";

type UserFlowViewProps = {
  flow: UserFlowStep[];
};

export function UserFlowView({ flow }: UserFlowViewProps) {
  return (
    <div className="space-y-4">
      {flow.map((item) => (
        <article key={`${item.step}-${item.screen}`} className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-sm font-semibold text-cyan-200">
              {item.step}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{item.screen}</h3>
              <p className="text-sm text-slate-400">User flow step</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-200">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">User Action</div>
              {item.userAction}
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-200">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">System Response</div>
              {item.systemResponse}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
