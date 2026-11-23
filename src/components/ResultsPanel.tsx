import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, Copy, Loader2 } from 'lucide-react';
import {
  FindingStatus,
  VerifiedFinding,
  VerifiedReport,
} from '../lib/reproducibility.ts';

interface ResultsPanelProps {
  report: VerifiedReport | null;
  isLoading: boolean;
  error: string | null;
  selectedFindingId: string | null;
  cardPulseSeq: number;
  onSelectFindingFromCard: (finding: VerifiedFinding) => void;
  onDismissError: () => void;
}

type StatusFilter = 'all' | FindingStatus;

const STATUS_DISPLAY: Record<
  FindingStatus,
  { symbol: string; label: string; textClass: string }
> = {
  reported: {
    symbol: '✓',
    label: 'Reported',
    textClass: 'text-emerald-800',
  },
  unclear: {
    symbol: '△',
    label: 'Unclear',
    textClass: 'text-amber-800',
  },
  missing: {
    symbol: '✕',
    label: 'Missing',
    textClass: 'text-rose-800',
  },
};

export function ResultsPanel({
  report,
  isLoading,
  error,
  selectedFindingId,
  cardPulseSeq,
  onSelectFindingFromCard,
  onDismissError,
}: ResultsPanelProps) {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    setFilter('all');
  }, [report]);

  useEffect(() => {
    if (!selectedFindingId || cardPulseSeq === 0) return;
    if (report && filter !== 'all') {
      const target = report.findings.find((f) => f.id === selectedFindingId);
      if (target && target.status !== filter) {
        setFilter('all');
      }
    }
    const timer = window.setTimeout(() => {
      const el = cardRefs.current[selectedFindingId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 30);
    return () => window.clearTimeout(timer);
  }, [selectedFindingId, cardPulseSeq, report, filter]);

  const filteredFindings = useMemo(() => {
    if (!report) return [];
    if (filter === 'all') return report.findings;
    return report.findings.filter((f) => f.status === filter);
  }, [report, filter]);

  const handleCopyFix = async (
    e: React.MouseEvent,
    findingId: string,
    fixText: string,
  ) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(fixText);
      setCopiedId(findingId);
      window.setTimeout(() => {
        setCopiedId((cur) => (cur === findingId ? null : cur));
      }, 1800);
    } catch {
      // Clipboard blocked in restricted browser context; fail silently
    }
  };

  return (
    <section
      aria-label="Reproducibility audit results"
      aria-live="polite"
      className="flex flex-col rounded-xs border border-zinc-300 bg-white"
    >
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-3">
        <h2 className="text-sm font-medium text-zinc-900">Review Notes</h2>
        {report && !isLoading && (
          <span className="text-xs text-zinc-500 truncate max-w-[260px]">
            {report.studyType}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {error && (
          <div
            role="alert"
            className="mx-5 mt-4 flex items-start justify-between gap-3 border border-rose-300 bg-rose-50 px-3.5 py-3 text-sm text-rose-900"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle
                className="h-4 w-4 text-rose-700 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p>{error}</p>
            </div>
            <button
              type="button"
              onClick={onDismissError}
              className="text-xs font-medium text-rose-800 hover:text-rose-950 underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
            <Loader2
              className="h-5 w-5 animate-spin text-zinc-700 mb-3"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-zinc-900">
              Reading methods against nine criteria…
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Checking verbatim quotes and counting applicable findings.
            </p>
          </div>
        ) : !report ? (
          <div className="flex flex-1 flex-col justify-center px-6 py-14 max-w-md">
            <p className="font-serif text-lg font-medium text-zinc-900">
              No methods text checked yet
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Paste a paper or lab report methods section on the left and select{' '}
              <span className="font-medium text-zinc-900">Check methods</span>, or load one of the sample passages above.
            </p>
            <ul className="mt-5 space-y-2 border-t border-zinc-200 pt-4 text-xs text-zinc-600">
              <li>1. Quotes are matched verbatim before highlighting.</li>
              <li>2. Counts sum reported (1), unclear (0.5), and missing (0).</li>
              <li>3. Irrelevant checklist items are skipped by study type.</li>
            </ul>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Flat Ruled Summary Block */}
            <div className="border-b border-zinc-200 px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums">
                    {report.score.points}
                  </span>
                  <span className="font-mono text-sm text-zinc-500 tabular-nums">
                    / {report.score.totalApplicable}
                  </span>
                  <span className="text-xs text-zinc-600 ml-1">
                    applicable findings addressed
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums">
                  <span className="text-emerald-800">
                    ✓ {report.score.reportedCount} reported
                  </span>
                  <span className="text-zinc-300" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-amber-800">
                    △ {report.score.unclearCount} unclear
                  </span>
                  <span className="text-zinc-300" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-rose-800">
                    ✕ {report.score.missingCount} missing
                  </span>
                </div>
              </div>

              {report.score.totalApplicable > 0 && (
                <div
                  className="mt-3 flex h-1.5 w-full overflow-hidden bg-zinc-200"
                  role="img"
                  aria-label={`Finding distribution: ${report.score.reportedCount} reported, ${report.score.unclearCount} unclear, ${report.score.missingCount} missing`}
                >
                  {report.score.reportedCount > 0 && (
                    <div
                      className="bg-emerald-700 transition-all duration-200"
                      style={{
                        width: `${(report.score.reportedCount / report.score.totalApplicable) * 100}%`,
                      }}
                    />
                  )}
                  {report.score.unclearCount > 0 && (
                    <div
                      className="bg-amber-500 transition-all duration-200"
                      style={{
                        width: `${(report.score.unclearCount / report.score.totalApplicable) * 100}%`,
                      }}
                    />
                  )}
                  {report.score.missingCount > 0 && (
                    <div
                      className="bg-rose-700 transition-all duration-200"
                      style={{
                        width: `${(report.score.missingCount / report.score.totalApplicable) * 100}%`,
                      }}
                    />
                  )}
                </div>
              )}

              <p className="mt-2.5 text-xs text-zinc-500 leading-relaxed">
                Count computed from findings (reported = 1, unclear = 0.5, missing = 0). Checks missing detail only, not scientific merit.
              </p>

              {report.score.unverifiedQuoteCount > 0 && (
                <p className="mt-1.5 text-xs font-medium text-amber-800">
                  {report.score.unverifiedQuoteCount} quote
                  {report.score.unverifiedQuoteCount === 1 ? '' : 's'} did not match verbatim and{' '}
                  {report.score.unverifiedQuoteCount === 1 ? 'was' : 'were'} not highlighted.
                </p>
              )}

              {report.skippedCategories.length > 0 && (
                <p className="mt-1.5 text-xs text-zinc-500">
                  <span className="font-medium text-zinc-700">Skipped:</span>{' '}
                  {report.skippedCategories.map((s) => s.category).join(', ')}
                </p>
              )}
            </div>

            {/* Baseline-Underlined Filter Tabs */}
            <div
              className="flex items-center gap-5 border-b border-zinc-200 px-5"
              role="tablist"
              aria-label="Filter findings by status"
            >
              {(
                [
                  { key: 'all', label: `All (${report.findings.length})` },
                  { key: 'missing', label: `Missing (${report.score.missingCount})` },
                  { key: 'unclear', label: `Unclear (${report.score.unclearCount})` },
                  { key: 'reported', label: `Reported (${report.score.reportedCount})` },
                ] as const
              ).map((tab) => {
                const active = filter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(tab.key)}
                    className={`-mb-px border-b-2 py-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'border-zinc-900 text-zinc-900'
                        : 'border-transparent text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Ruled Review Notes List */}
            <div className="divide-y divide-zinc-200 lg:max-h-[470px] lg:overflow-y-auto">
              {filteredFindings.length === 0 ? (
                <p className="py-10 text-center text-sm text-zinc-500">
                  No findings match this filter.
                </p>
              ) : (
                filteredFindings.map((finding) => {
                  const statusMeta = STATUS_DISPLAY[finding.status];
                  const isSelected = selectedFindingId === finding.id;
                  const canJump = finding.quoteState === 'verified';

                  return (
                    <article
                      key={finding.id}
                      ref={(node) => {
                        cardRefs.current[finding.id] = node;
                      }}
                      onClick={() => {
                        if (canJump) onSelectFindingFromCard(finding);
                      }}
                      className={`px-5 py-4 transition-colors ${
                        isSelected ? 'bg-zinc-100/80' : 'bg-white'
                      } ${canJump ? 'cursor-pointer hover:bg-zinc-50' : ''}`}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-sm font-semibold text-zinc-900">
                          {finding.category}
                        </h3>
                        <span
                          className={`text-xs font-medium whitespace-nowrap shrink-0 ${statusMeta.textClass}`}
                        >
                          {statusMeta.symbol} {statusMeta.label}
                        </span>
                      </div>

                      {finding.quoteState === 'verified' && finding.quote && (
                        <div className="mt-2 flex items-start justify-between gap-3">
                          <blockquote className="font-mono text-xs leading-relaxed text-zinc-600">
                            &ldquo;{finding.quote}&rdquo;
                          </blockquote>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectFindingFromCard(finding);
                            }}
                            title="Jump to highlight in methods text"
                            aria-label={`Locate ${finding.category} quote in methods text`}
                            className="text-xs font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-950 shrink-0 cursor-pointer"
                          >
                            Locate
                          </button>
                        </div>
                      )}

                      {finding.quoteState === 'unverified' && finding.quote && (
                        <div className="mt-2 rounded-xs border border-amber-300 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
                          <p className="font-medium">
                            Unverified quote: not found verbatim in your text (not highlighted)
                          </p>
                          <p className="mt-0.5 font-mono text-amber-800">
                            &ldquo;{finding.quote}&rdquo;
                          </p>
                        </div>
                      )}

                      {finding.quoteState === 'none' && (
                        <p className="mt-1.5 text-xs text-zinc-400">
                          No matching passage in text.
                        </p>
                      )}

                      <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                        {finding.issue}
                      </p>

                      {finding.suggestedFix && (
                        <div className="mt-2.5 flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-zinc-500">
                              Suggested addition
                            </span>
                            <button
                              type="button"
                              onClick={(e) =>
                                handleCopyFix(e, finding.id, finding.suggestedFix)
                              }
                              className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-950 underline underline-offset-2 cursor-pointer"
                            >
                              {copiedId === finding.id ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-700" aria-hidden="true" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" aria-hidden="true" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs leading-relaxed text-zinc-600">
                            {finding.suggestedFix}
                          </p>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
