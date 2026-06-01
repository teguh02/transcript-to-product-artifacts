import type { UserStory } from "@/types/artifacts";

type UserStoriesViewProps = {
  userStories: UserStory[];
};

export function UserStoriesView({ userStories }: UserStoriesViewProps) {
  return (
    <div className="grid gap-4">
      {userStories.map((story) => (
        <article key={story.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              {story.id}
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{story.role}</span>
          </div>
          <p className="mt-4 text-base font-medium leading-7 text-white">{story.story}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-200">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Action</div>
              {story.action}
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-200">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Benefit</div>
              {story.benefit}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
