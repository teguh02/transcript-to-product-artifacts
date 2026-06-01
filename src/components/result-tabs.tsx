"use client";

import { useMemo, useState } from "react";
import type { GenerationResult } from "@/types/artifacts";
import { PrdView } from "./prd-view";
import { RequirementsView } from "./requirements-view";
import { ScreenListView } from "./screen-list-view";
import { SitemapView } from "./sitemap-view";
import { UserFlowView } from "./user-flow-view";
import { UserStoriesView } from "./user-stories-view";
import { WireframeGallery } from "./wireframe-gallery";

type ResultTabsProps = {
  result: GenerationResult;
};

const tabs = ["PRD", "User Stories", "Functional Requirements", "UI/UX"] as const;
type Tab = (typeof tabs)[number];

export function ResultTabs({ result }: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("PRD");

  const tabMeta: Record<Tab, string> = {
    PRD: `${result.prd.features.length} features`,
    "User Stories": `${result.userStories.length} stories`,
    "Functional Requirements": `${result.functionalRequirements.length} requirements`,
    "UI/UX": `${result.uiUx.wireframes.length} wireframes`,
  };

  const content = useMemo(() => {
    if (activeTab === "PRD") {
      return <PrdView prd={result.prd} />;
    }

    if (activeTab === "User Stories") {
      return <UserStoriesView userStories={result.userStories} />;
    }

    if (activeTab === "Functional Requirements") {
      return <RequirementsView requirements={result.functionalRequirements} />;
    }

    return (
      <div className="space-y-8">
        <section>
          <h3 className="mb-4 text-lg font-semibold text-white">Sitemap</h3>
          <SitemapView sitemap={result.uiUx.sitemap} />
        </section>
        <section>
          <h3 className="mb-4 text-lg font-semibold text-white">Screen List</h3>
          <ScreenListView screens={result.uiUx.screenList} />
        </section>
        <section>
          <h3 className="mb-4 text-lg font-semibold text-white">User Flow</h3>
          <UserFlowView flow={result.uiUx.userFlow} />
        </section>
        <section>
          <h3 className="mb-4 text-lg font-semibold text-white">Low-Fidelity Wireframes</h3>
          <WireframeGallery wireframes={result.uiUx.wireframes} />
        </section>
      </div>
    );
  }, [activeTab, result]);

  return (
    <section className="surface p-6">
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const selected = tab === activeTab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                selected
                  ? "bg-cyan-400 text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.28)]"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div>{tab}</div>
              <div className={`mt-1 text-xs font-medium ${selected ? "text-slate-800/80" : "text-slate-500"}`}>{tabMeta[tab]}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/40 p-5">{content}</div>
    </section>
  );
}
