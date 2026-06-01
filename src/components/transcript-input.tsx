"use client";

type TranscriptInputProps = {
  value: string;
  disabled: boolean;
  sourceLabel: string;
  canGenerate: boolean;
  transcriptCharLimit: number;
  isTranscriptTrimmed: boolean;
  onChange: (value: string) => void;
  onTextImport: (value: string) => void;
  onSample: () => void;
  onClear: () => void;
  onGenerate: () => void;
};

export function TranscriptInput({
  value,
  disabled,
  sourceLabel,
  canGenerate,
  transcriptCharLimit,
  isTranscriptTrimmed,
  onChange,
  onTextImport,
  onSample,
  onClear,
  onGenerate,
}: TranscriptInputProps) {
  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    onTextImport(text);
    event.target.value = "";
  }

  return (
    <section className="surface p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-title">Input</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Transcript Workspace</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Work from pasted notes, text files, or a sample transcript, then review the final transcript before generating product artifacts.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Current Source</div>
          <div className="mt-2 font-medium text-white">{sourceLabel}</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <button
          type="button"
          onClick={onSample}
          disabled={disabled}
          className="rounded-full border border-cyan-400/40 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Use Sample
        </button>
        <label className="inline-flex cursor-pointer items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:border-white/20 hover:bg-white/10">
          <span>Upload .txt</span>
          <input type="file" accept=".txt,text/plain" className="hidden" onChange={handleFileUpload} disabled={disabled} />
        </label>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled || value.length === 0}
          className="rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="min-h-[300px] w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
        placeholder="Paste your meeting transcript here..."
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <span>{value.trim().length} characters</span>
          <span>{value.trim().length > 0 ? "Ready for review" : "Add transcript content to begin"}</span>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {disabled ? "Generating..." : "Generate Artifacts"}
        </button>
      </div>

      {isTranscriptTrimmed ? (
        <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Quick generation mode: only the first {transcriptCharLimit.toLocaleString()} normalized characters will be sent to AI.
        </div>
      ) : null}
    </section>
  );
}
