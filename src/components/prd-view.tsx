import type { Prd } from "@/types/artifacts";

type PrdViewProps = {
  prd: Prd;
};

function SimpleList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-slate-200">
      {items.map((item) => (
        <li key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function PrdView({ prd }: PrdViewProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold text-white">Product Overview</h3>
        <p className="mt-3 text-sm leading-7 text-slate-200">{prd.productOverview}</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold text-white">Problem Statement</h3>
        <p className="mt-3 text-sm leading-7 text-slate-200">{prd.problemStatement}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold text-white">Goals</h3>
          <div className="mt-4">
            <SimpleList items={prd.goals} />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold text-white">Success Metrics</h3>
          <div className="mt-4">
            <SimpleList items={prd.successMetrics} />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold text-white">User Personas</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {prd.userPersonas.map((persona) => (
            <article key={persona.name} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <h4 className="text-base font-semibold text-white">{persona.name}</h4>
              <p className="mt-1 text-sm text-cyan-200">{persona.role}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Needs</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {persona.needs.map((need) => (
                  <li key={need}>{need}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Pain Points</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {persona.painPoints.map((pain) => (
                  <li key={pain}>{pain}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold text-white">User Journey</h3>
          <div className="mt-4 space-y-3">
            {prd.userJourney.map((journey) => (
              <div key={`${journey.step}-${journey.description}`} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="text-sm font-semibold text-cyan-200">{journey.step}</div>
                <p className="mt-2 text-sm text-slate-200">{journey.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold text-white">Features</h3>
          <div className="mt-4 space-y-3">
            {prd.features.map((feature) => (
              <div key={feature.name} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="text-sm font-semibold text-cyan-200">{feature.name}</div>
                <p className="mt-2 text-sm text-slate-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold text-white">Functional Requirements Summary</h3>
          <div className="mt-4">
            <SimpleList items={prd.functionalRequirements} />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold text-white">Non-Functional Requirements</h3>
          <div className="mt-4">
            <SimpleList items={prd.nonFunctionalRequirements} />
          </div>
        </section>
      </div>
    </div>
  );
}
