import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RotateCcw, SearchCheck } from 'lucide-react';
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

  const handleSelectFindingFromCard = useCallback((finding: VerifiedFinding) => {
    setSelectedFindingId(finding.id);
    setIsEditing(false);
    setHighlightPulseSeq((n) => n + 1);
  }, []);

  return (
    <div id="top" className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar onTrySample={handleTopBarSample} />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <section className="max-w-3xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance">
            Find missing reproducibility details in your methods section
          </h1>
          <p className="mt-2.5 text-base leading-relaxed text-slate-600">
            Paste a paper or lab report methods section to audit reagents, quantities, instruments, replicates, controls, software versions, statistics, and data availability.
          </p>
        </section>

        <div
          id="workspace"
          ref={workspaceRef}
          className="mt-7 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between scroll-mt-20"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 mr-1 whitespace-nowrap">
              Try a sample:
            </span>
            {SAMPLE_METHODS_PRESETS.map((preset) => {
              const active = activeSampleId === preset.id && report?.sourceText === text;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => loadSample(preset)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-sky-700 bg-sky-50 text-sky-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <span className="font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
              {wordCount} words · {text.length} chars
            </span>

            {text.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={handleCheckMethods}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <SearchCheck className="h-4 w-4" aria-hidden="true" />
              {isLoading ? 'Checking…' : 'Check methods'}
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
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

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Retrace: Scientific methods reproducibility checker. Flags missing operational detail only.
          </p>
          <p>
            Quotes are verified verbatim; finding counts are computed in code.
          </p>
        </div>
      </footer>
    </div>
  );
}
