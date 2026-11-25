import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ManuscriptPane } from './components/ManuscriptPane.tsx';
import { ReferenceSections } from './components/ReferenceSections.tsx';
import { ResultsPanel } from './components/ResultsPanel.tsx';
import { TopBar } from './components/TopBar.tsx';
import {
  VerifiedFinding,
  VerifiedReport,
  verifyAndScoreReport,
} from './lib/reproducibility.ts';
import { SAMPLE_METHODS_PRESETS, SampleMethodsPreset } from './lib/samples.ts';

export default function App() {
  const [text, setText] = useState<string>('');
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [report, setReport] = useState<VerifiedReport | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [highlightPulseSeq, setHighlightPulseSeq] = useState<number>(0);
  const [cardPulseSeq, setCardPulseSeq] = useState<number>(0);

  const workspaceRef = useRef<HTMLDivElement | null>(null);

  const wordCount = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [text]);

  const loadSample = useCallback((preset: SampleMethodsPreset) => {
    setError(null);
    setIsLoading(false);
    setActiveSampleId(preset.id);
    setText(preset.text);
    const verified = verifyAndScoreReport(preset.text, preset.precomputedReport);
    setReport(verified);
    setIsEditing(false);
    const firstHighlighted = verified.findings.find(
      (f) => f.quoteState === 'verified',
    );
    setSelectedFindingId(firstHighlighted ? firstHighlighted.id : null);
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleTopBarSample = useCallback(() => {
    loadSample(SAMPLE_METHODS_PRESETS[0]);
  }, [loadSample]);

  const handleTextChange = (next: string) => {
    setText(next);
    if (activeSampleId) {
      setActiveSampleId(null);
    }
    if (error) {
      setError(null);
    }
    if (!next.trim()) {
      setReport(null);
      setSelectedFindingId(null);
      setIsEditing(true);
    }
  };

  const handleClear = () => {
    setText('');
    setActiveSampleId(null);
    setReport(null);
    setIsEditing(true);
    setError(null);
    setSelectedFindingId(null);
  };

  const handleCheckMethods = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Paste a methods section or select a sample preset before checking.');
      return;
    }
    if (trimmed.length < 40) {
      setError('Please enter at least a full paragraph from a methods section.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/check-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = (await response.json()) as VerifiedReport & { error?: string };
      if (!response.ok) {
        throw new Error(
          data?.error || `Request failed with status ${response.status}.`,
        );
      }

      const verified = verifyAndScoreReport(text, {
        studyType: data.studyType,
        findings: data.findings,
        skippedCategories: data.skippedCategories,
      });

      setReport(verified);
      setIsEditing(false);
      const firstHighlighted = verified.findings.find(
        (f) => f.quoteState === 'verified',
      );
      setSelectedFindingId(firstHighlighted ? firstHighlighted.id : null);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to reach the checking service. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [text]);

  const handleSelectFindingFromHighlight = useCallback((findingId: string) => {
    setSelectedFindingId(findingId);
    setCardPulseSeq((n) => n + 1);
  }, []);

  const handleSelectFindingFromCard = useCallback(
    (finding: VerifiedFinding) => {
      if (report && report.sourceText !== text) return;
      setSelectedFindingId(finding.id);
      setIsEditing(false);
      setHighlightPulseSeq((n) => n + 1);
    },
    [report, text],
  );

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#f4f4f2] text-zinc-900">
      <TopBar onTrySample={handleTopBarSample} />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 lg:py-7">
        {/* Compact Tool Header */}
        <section className="flex flex-col gap-1.5 border-b border-zinc-300 pb-4">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-zinc-900 sm:text-[28px] text-balance">
            Check a methods section for missing reproducibility details
          </h1>
          <p className="text-sm text-zinc-600 max-w-3xl">
            Paste a paper or lab report methods section below, or load a sample to see what a reader would need in order to repeat the work.
          </p>
        </section>

        {/* Flat Hairline Toolbar */}
        <div
          id="workspace"
          ref={workspaceRef}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between scroll-mt-16"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-zinc-500 mr-1 whitespace-nowrap">Sample:</span>
            {SAMPLE_METHODS_PRESETS.map((preset) => {
              const active = activeSampleId === preset.id && report?.sourceText === text;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => loadSample(preset)}
                  className={`rounded-xs border px-2.5 py-1 text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-zinc-900 bg-zinc-900 text-white font-medium'
                      : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <span className="font-mono text-xs text-zinc-500 tabular-nums whitespace-nowrap">
              {wordCount} words · {text.length} chars
            </span>

            {text.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-950 underline underline-offset-4 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={handleCheckMethods}
              disabled={isLoading}
              className="rounded-xs bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isLoading ? 'Checking…' : 'Check methods'}
            </button>
          </div>
        </div>

        {/* Two-Column Linked Inspection Workbench */}
        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
          <div className="lg:col-span-6">
            <ManuscriptPane
              text={text}
              onTextChange={handleTextChange}
              report={report}
              isEditing={isEditing}
              onToggleEditing={setIsEditing}
              selectedFindingId={selectedFindingId}
              highlightPulseSeq={highlightPulseSeq}
              onSelectFindingFromHighlight={handleSelectFindingFromHighlight}
              onSubmitShortcut={handleCheckMethods}
            />
          </div>

          <div className="lg:col-span-6">
            <ResultsPanel
              report={report}
              isLoading={isLoading}
              isOutdated={Boolean(report && report.sourceText !== text)}
              error={error}
              selectedFindingId={selectedFindingId}
              cardPulseSeq={cardPulseSeq}
              onSelectFindingFromCard={handleSelectFindingFromCard}
              onDismissError={() => setError(null)}
            />
          </div>
        </div>

        <ReferenceSections />
      </main>

      <footer className="mt-14 border-t border-zinc-300 bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Retrace: Methods reproducibility audit tool.</p>
          <p>Verbatim quotes verified in code; findings do not evaluate scientific merit.</p>
        </div>
      </footer>
    </div>
  );
}
