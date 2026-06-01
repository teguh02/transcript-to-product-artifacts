import type { SitemapNode } from "@/types/artifacts";

type SitemapViewProps = {
  sitemap: SitemapNode[];
};

export function SitemapView({ sitemap }: SitemapViewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {sitemap.map((node) => (
        <article key={node.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-base font-semibold text-white">{node.name}</h3>
          <p className="mt-2 text-sm text-slate-200">{node.purpose}</p>
          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Children</div>
            <div className="flex flex-wrap gap-2">
              {node.children.map((child) => (
                <span key={child} className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs text-slate-200">
                  {child}
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
