export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] px-4 py-10 text-slate-100 md:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Not Found</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">The requested page could not be found.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Return to the main workspace to generate product artifacts from your transcript.
        </p>
      </div>
    </main>
  );
}
