"use client";

import { useEffect, useRef, useState } from "react";
import { ExportMenu } from "@/components/export-menu";
import { ResultTabs } from "@/components/result-tabs";
import { TranscriptInput } from "@/components/transcript-input";
import { WorkspaceStatus } from "@/components/workspace-status";
import { sampleTranscript } from "@/data/sample-transcript";
import { exportAsDocx, exportAsJson, exportAsPdf, type ExportFormat } from "@/lib/exporters";
import type { GenerationResult } from "@/types/artifacts";

const workspaceTabs = ["Input", "Workspace Status", "Result Workspace"] as const;
type WorkspaceTab = (typeof workspaceTabs)[number];

export default function HomePage() {
  const [transcript, setTranscript] = useState(sampleTranscript);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [sourceLabel, setSourceLabel] = useState("Sample transcript");
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>("Input");
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const hasValidTranscript = transcript.trim().length >= 20 && !transcribing;
  const previousValidTranscript = useRef(hasValidTranscript);

  const workspaceTabEnabled: Record<WorkspaceTab, boolean> = {
    Input: true,
    "Workspace Status": hasValidTranscript,
    "Result Workspace": result !== null,
  };

  useEffect(() => {
    const wasValid = previousValidTranscript.current;

    if (!wasValid && hasValidTranscript && activeWorkspaceTab === "Input" && result === null) {
      setActiveWorkspaceTab("Workspace Status");
    }

    previousValidTranscript.current = hasValidTranscript;
  }, [activeWorkspaceTab, hasValidTranscript, result]);

  async function handleExport(format: ExportFormat) {
    if (!result) {
      return;
    }

    try {
      setExportingFormat(format);

      if (format === "json") {
        await exportAsJson(result);
        return;
      }

      if (format === "docx") {
        await exportAsDocx(result);
        return;
      }

      await exportAsPdf(result);
    } finally {
      setExportingFormat(null);
    }
  }

  async function handleAudioUpload(file: File) {
    setError(null);
    setTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to transcribe audio.");
      }

      setTranscript(data.transcript);
      setSourceLabel("Audio transcription");
      setResult(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unexpected error during audio transcription.");
    } finally {
      setTranscribing(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate artifacts.");
      }

      setResult(data);
      setActiveWorkspaceTab("Result Workspace");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] px-4 py-6 text-slate-100 md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="sticky top-4 z-20 px-2 py-2 backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="section-title">AI Product Workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Transcript to product artifacts</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
                A focused workspace for turning raw meeting conversations into structured product documentation and low-fidelity UI output.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200">
                Output language: English
              </div>
              {result ? (
                <ExportMenu disabled={!result} exportingFormat={exportingFormat} onExport={handleExport} />
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setActiveWorkspaceTab("Input");
                  void handleGenerate();
                }}
                disabled={loading || transcribing || transcript.trim().length < 20 || exportingFormat !== null}
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {result ? (loading ? "Regenerating..." : "Regenerate") : loading ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </section>

        <section className="surface p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
            {workspaceTabs.map((tab) => {
              const selected = tab === activeWorkspaceTab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    if (workspaceTabEnabled[tab]) {
                      setActiveWorkspaceTab(tab);
                    }
                  }}
                  disabled={!workspaceTabEnabled[tab]}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selected
                      ? "bg-cyan-400 text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.28)]"
                      : workspaceTabEnabled[tab]
                        ? "border border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                        : "cursor-not-allowed border border-white/5 bg-white/[0.03] text-slate-600"
                  }`}
                >
                  <span>{tab}</span>
                  {!workspaceTabEnabled[tab] ? <span className="ml-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">Locked</span> : null}
                </button>
              );
            })}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-2">Source: {sourceLabel}</span>
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-2">
                {result ? `Score: ${result.validation.consistencyScore}` : "No result yet"}
              </span>
              {!workspaceTabEnabled["Workspace Status"] ? (
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-amber-200">
                  Complete transcript input to unlock status
                </span>
              ) : null}
              {!workspaceTabEnabled["Result Workspace"] ? (
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-400">
                  Generate artifacts to unlock results
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-5">
            {activeWorkspaceTab === "Input" ? (
              <TranscriptInput
                value={transcript}
                onChange={(value) => {
                  setTranscript(value);
                  setSourceLabel("Manual paste");
                  setResult(null);
                }}
                onTextImport={(value) => {
                  setTranscript(value);
                  setSourceLabel("Text upload");
                  setResult(null);
                }}
                disabled={loading}
                transcribing={transcribing}
                sourceLabel={sourceLabel}
                canGenerate={!loading && !transcribing && transcript.trim().length >= 20}
                onSample={() => {
                  setTranscript(sampleTranscript);
                  setSourceLabel("Sample transcript");
                  setResult(null);
                }}
                onAudioUpload={handleAudioUpload}
                onClear={() => {
                  setTranscript("");
                  setSourceLabel("Empty workspace");
                  setResult(null);
                }}
                onGenerate={() => {
                  void handleGenerate();
                }}
              />
            ) : null}

            {activeWorkspaceTab === "Workspace Status" ? (
              <WorkspaceStatus
                loading={loading}
                transcribing={transcribing}
                sourceLabel={sourceLabel}
                result={result}
                hasValidTranscript={hasValidTranscript}
                hasError={Boolean(error)}
              />
            ) : null}

            {activeWorkspaceTab === "Result Workspace" ? (
              <div className="space-y-6">
                {error ? (
                  <section className="surface p-4">
                    <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>
                  </section>
                ) : null}

                {result ? (
                  <>
                    <section className="surface p-6">
                      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-5">
                          <p className="section-title">Generated Summary</p>
                          <div>
                            <h2 className="mt-2 text-2xl font-semibold text-white">{result.analysis.productName || "Generated Product Concept"}</h2>
                            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">{result.analysis.summary}</p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Stories</div>
                              <div className="mt-2 text-2xl font-semibold text-white">{result.userStories.length}</div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Requirements</div>
                              <div className="mt-2 text-2xl font-semibold text-white">{result.functionalRequirements.length}</div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Wireframes</div>
                              <div className="mt-2 text-2xl font-semibold text-white">{result.uiUx.wireframes.length}</div>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Validation Notes</div>
                          <ul className="mt-3 space-y-2 text-sm text-slate-200">
                            {result.validation.issues.length > 0
                              ? result.validation.issues.map((issue) => <li key={issue}>{issue}</li>)
                              : [<li key="clean">No major consistency issues detected.</li>]}
                          </ul>
                          {result.analysis.assumptions.length > 0 ? (
                            <div className="mt-5">
                              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Assumptions</div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {result.analysis.assumptions.map((assumption) => (
                                  <span key={assumption} className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
                                    {assumption}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </section>

                    <ResultTabs result={result} />
                  </>
                ) : (
                  <section className="surface p-8">
                    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                      <div>
                        <p className="section-title">Result Workspace</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">No artifacts generated yet</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                          Start from a sample, paste a transcript, or transcribe audio. After generation, this workspace will hold your PRD, user stories, functional requirements, and low-fidelity wireframes.
                        </p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">What you can do here</div>
                        <ul className="mt-4 space-y-3 text-sm text-slate-200">
                          <li>Generate product artifacts from working session transcripts.</li>
                          <li>Review validation notes before presenting the output.</li>
                          <li>Download structured wireframes as PNG from the UI/UX tab.</li>
                        </ul>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
