type GenerationProgressProps = {
  loading: boolean;
};

const steps = [
  "Analyze transcript",
  "Generate PRD and requirements",
  "Generate UI/UX artifacts",
  "Validate consistency",
];

export function GenerationProgress({ loading }: GenerationProgressProps) {
  return (
    <section className="surface p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="section-title">Pipeline</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Generation Flow</h2>
        </div>
        {loading ? (
          <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Running
          </div>
        ) : (
          <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Ready
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {steps.map((step, index) => (
          <div key={step} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Step {index + 1}</div>
            <div>{step}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
