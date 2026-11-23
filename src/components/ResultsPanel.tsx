import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  LocateFixed,
  Loader2,
} from 'lucide-react';
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
    textClass: 'text-emerald-700',
  },
  unclear: {
    symbol: '△',
    label: 'Unclear',
    textClass: 'text-amber-700',
  },
  missing: {
    symbol: '✕',
    label: 'Missing',
    textClass: 'text-rose-700',
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
      // Clipboard blocked in restricted browser context; fail silently without crashing
    }
  };

  return (
    <section
      aria-label="Reproducibility audit results"
      aria-live="polite"
      className="flex flex-col rounded-lg border border-slate-200 bg-white"
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/70 px-4 py-3 rounded-t-lg">
        <h2 className="font-display text-sm font-semibold text-slate-900">
          Audit Results
        </h2>
        {report && !isLoading && (
          <span className="text-xs text-slate-500 truncate max-w-[260px]">
            {report.studyType}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start justify-between gap-3 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-900"
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
              className="text-xs font-medium text-rose-700 hover:text-rose-900 underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <Loader2
              className="h-6 w-6 animate-spin text-sky-700 mb-3"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-slate-900">
              Checking methods against nine reproducibility categories…
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Verifying verbatim quotes and computing finding counts from structured output.
            </p>
          </div>
        ) : !report ? (
          <div className="flex flex-1 flex-col justify-center py-12 px-2 text-left max-w-md mx-auto">
            <p className="font-display text-base font-semibold text-slate-900">
              Ready to audit a methods section
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Paste a paper or lab report methods section on the left and click{' '}
              <span className="font-medium text-slate-900">Check methods</span>, or load one of the sample presets above with no API setup required.
            </p>
            <dl className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-600">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-medium text-slate-800">Verbatim quote verification</dt>
                <dd className="text-slate-500">Unmatched quotes flagged &amp; never highlighted</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-medium text-slate-800">Code-computed finding count</dt>
                <dd className="font-mono text-slate-500 tabular-nums">1 / 0.5 / 0 pts</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-medium text-slate-800">Scope</dt>
                <dd className="text-slate-500">Flags missing detail only</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-md border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Code-computed finding count
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
                      {report.score.points}
                    </span>
                    <span className="font-mono text-sm text-slate-500 tabular-nums">
                      / {report.score.totalApplicable} applicable findings
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums">
                  <span className="text-emerald-700 font-medium">
                    ✓ {report.score.reportedCount} reported
                  </span>
                  <span className="text-slate-300" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-amber-700 font-medium">
                    △ {report.score.unclearCount} unclear
                  </span>
                  <span className="text-slate-300" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-rose-700 font-medium">
                    ✕ {report.score.missingCount} missing
                  </span>
                </div>
              </div>

              {report.score.totalApplicable > 0 && (
                <div
                  className="mt-3 flex h-2.5 w-full overflow-hidden rounded-sm bg-slate-200"
                  role="img"
                  aria-label={`Finding distribution: ${report.score.reportedCount} reported, ${report.score.unclearCount} unclear, ${report.score.missingCount} missing`}
                >
                  {report.score.reportedCount > 0 && (
                    <div
                      className="bg-emerald-600 transition-all duration-200"
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
                      className="bg-rose-600 transition-all duration-200"
                      style={{
                        width: `${(report.score.missingCount / report.score.totalApplicable) * 100}%`,
                      }}
                    />
                  )}
                </div>
              )}

              <p className="mt-2.5 text-xs text-slate-500 leading-relaxed">
                Count computed deterministically from findings (reported = 1, unclear = 0.5, missing = 0). Measures reported detail only, not a scientific quality grade or claim about validity.
              </p>

              {report.score.unverifiedQuoteCount > 0 && (
                <p className="mt-2 text-xs font-medium text-amber-800">
                  {report.score.unverifiedQuoteCount} quote
                  {report.score.unverifiedQuoteCount === 1 ? '' : 's'} failed verbatim matching and{' '}
                  {report.score.unverifiedQuoteCount === 1 ? 'was' : 'were'} excluded from highlighting.
                </p>
              )}

              {report.skippedCategories.length > 0 && (
                <div className="mt-2.5 border-t border-slate-200 pt-2.5 text-xs text-slate-600">
                  <span className="font-medium text-slate-700">
                    Skipped for study type ({report.skippedCategories.length}):
                  </span>{' '}
                  {report.skippedCategories.map((s) => s.category).join(', ')}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 p-1"
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
                      className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 lg:max-h-[430px] lg:overflow-y-auto lg:pr-1">
              {filteredFindings.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
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
                      className={`rounded-md border p-4 transition-colors ${
                        isSelected
                          ? 'border-sky-700 ring-1 ring-sky-700 bg-sky-50/30'
                          : 'border-slate-200 bg-white'
                      } ${canJump ? 'cursor-pointer hover:border-slate-300' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-sm font-semibold text-slate-900">
                          {finding.category}
                        </h3>
                        <span
                          className={`text-xs font-semibold whitespace-nowrap shrink-0 ${statusMeta.textClass}`}
                        >
                          {statusMeta.symbol} {statusMeta.label}
                        </span>
                      </div>

                      {finding.quoteState === 'verified' && finding.quote && (
                        <div className="mt-2.5 flex items-start justify-between gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2">
                          <blockquote className="font-mono text-xs leading-relaxed text-slate-700">
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
                            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-sky-700 hover:bg-sky-100/70 shrink-0 cursor-pointer"
                          >
                            <LocateFixed className="h-3 w-3" aria-hidden="true" />
                            Locate
                          </button>
                        </div>
                      )}

                      {finding.quoteState === 'unverified' && finding.quote && (
                        <div className="mt-2.5 rounded border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-900">
                          <p className="font-semibold">
                            Unverified quote: not found verbatim in your text (not highlighted)
                          </p>
                          <p className="mt-1 font-mono text-amber-800">
                            &ldquo;{finding.quote}&rdquo;
                          </p>
                        </div>
                      )}

                      {finding.quoteState === 'none' && (
                        <p className="mt-2 text-xs text-slate-400">
                          No verbatim passage in text to highlight.
                        </p>
                      )}

                      <p className="mt-2.5 text-sm leading-relaxed text-slate-700">
                        {finding.issue}
                      </p>

                      {finding.suggestedFix && (
                        <div className="mt-3 border-t border-slate-100 pt-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-slate-500">
                              Suggested fix
                            </span>
                            <button
                              type="button"
                              onClick={(e) =>
                                handleCopyFix(e, finding.id, finding.suggestedFix)
                              }
                              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                            >
                              {copiedId === finding.id ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-700" aria-hidden="true" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" aria-hidden="true" />
                                  Copy fix
                                </>
                              )}
                            </button>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
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
