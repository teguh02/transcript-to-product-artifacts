import type { GenerationResult } from "@/types/artifacts";

type WorkspaceStatusProps = {
  loading: boolean;
  transcribing: boolean;
  sourceLabel: string;
  result: GenerationResult | null;
  hasValidTranscript: boolean;
  hasError: boolean;
};

function getStepState(done: boolean, active: boolean, failed = false) {
  if (failed) {
    return "failed";
  }

  if (done) {
    return "done";
  }

  if (active) {
    return "active";
  }

  return "pending";
}

function StepBadge({ state }: { state: "done" | "active" | "pending" | "failed" }) {
  const styles = {
    done: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
    active: "border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
    pending: "border-white/10 bg-white/5 text-slate-400",
    failed: "border-rose-400/30 bg-rose-400/10 text-rose-100",
  } as const;

  const labels = {
    done: "Done",
    active: "Active",
    pending: "Pending",
    failed: "Failed",
  } as const;

  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${styles[state]}`}>{labels[state]}</span>;
}

export function WorkspaceStatus({
  loading,
  transcribing,
  sourceLabel,
  result,
  hasValidTranscript,
  hasError,
}: WorkspaceStatusProps) {
  const statusLabel = transcribing ? "Transcribing" : loading ? "Generating" : "Ready";
  const statusTone = transcribing
    ? "border-amber-400/30 bg-amber-400/10 text-amber-100"
    : loading
      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
      : "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";

  const stepItems = [
    {
      title: "Transcript prepared",
      description: "Input transcript is present and meets the minimum validation length.",
      state: getStepState(hasValidTranscript, !hasValidTranscript && !transcribing),
    },
    {
      title: "Source normalized",
      description: transcribing
        ? "Audio is being converted into editable transcript text."
        : `Current source is ${sourceLabel.toLowerCase()}.`,
      state: getStepState(!transcribing && hasValidTranscript, transcribing),
    },
    {
      title: "Artifact generation",
      description: loading
        ? "AI is generating PRD, user stories, requirements, and UI/UX artifacts."
        : hasError
          ? "Generation failed before results were produced. Review the error and retry."
        : result
          ? "Generation completed and artifacts are ready for review."
          : "Run generation when the transcript is ready.",
      state: getStepState(result !== null, loading, hasError && result === null),
    },
    {
      title: "Result workspace",
      description: result
        ? "Outputs are unlocked and ready for review or export."
        : hasError
          ? "Fix the issue and rerun generation to unlock results."
          : "Results will unlock after a successful generation.",
      state: getStepState(result !== null, false, hasError && result === null),
    },
  ] as const;

  return (
    <section className="surface flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-title">Workspace Status</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Operational View</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusTone}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Input Source</div>
          <div className="mt-2 text-base font-medium text-white">{sourceLabel}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Current Product</div>
          <div className="mt-2 text-base font-medium text-white">
            {result?.analysis.productName || "No generated result yet"}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Consistency Score</div>
          <div className="mt-2 text-4xl font-semibold text-white">{result?.validation.consistencyScore ?? "--"}</div>
        </div>
      </div>

      <div className="mt-6 flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Progress Overview</div>
        <div className="mt-4 space-y-3">
          {stepItems.map((step) => (
            <div key={step.title} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">{step.title}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{step.description}</p>
                </div>
                <StepBadge state={step.state} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
