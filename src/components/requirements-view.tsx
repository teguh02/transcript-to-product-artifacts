import type { FunctionalRequirement } from "@/types/artifacts";

type RequirementsViewProps = {
  requirements: FunctionalRequirement[];
};

export function RequirementsView({ requirements }: RequirementsViewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="grid grid-cols-[120px_180px_1fr_120px] gap-4 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        <div>ID</div>
        <div>Title</div>
        <div>Description</div>
        <div>Priority</div>
      </div>
      {requirements.map((requirement) => (
        <div key={requirement.id} className="grid grid-cols-[120px_180px_1fr_120px] gap-4 border-b border-white/10 px-4 py-4 text-sm text-slate-200 last:border-b-0">
          <div className="font-semibold text-cyan-200">{requirement.id}</div>
          <div>{requirement.title}</div>
          <div>
            <p>{requirement.description}</p>
            <p className="mt-2 text-xs text-slate-400">Related stories: {requirement.relatedStories.join(", ")}</p>
          </div>
          <div>{requirement.priority}</div>
        </div>
      ))}
    </div>
  );
}
