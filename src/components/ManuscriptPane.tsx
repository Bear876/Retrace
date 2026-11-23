import React, { useEffect, useMemo, useRef } from 'react';
import { Eye, Pencil } from 'lucide-react';
import {
  buildHighlightedSegments,
  FindingStatus,
  VerifiedReport,
} from '../lib/reproducibility.ts';

interface ManuscriptPaneProps {
  text: string;
  onTextChange: (next: string) => void;
  report: VerifiedReport | null;
  isEditing: boolean;
  onToggleEditing: (editing: boolean) => void;
  selectedFindingId: string | null;
  highlightPulseSeq: number;
  onSelectFindingFromHighlight: (findingId: string) => void;
  onSubmitShortcut: () => void;
}

const HIGHLIGHT_CLASSES: Record<FindingStatus, string> = {
  reported:
    'bg-emerald-50 text-slate-900 border-b-2 border-emerald-600 hover:bg-emerald-100/90',
  unclear:
    'bg-amber-50 text-slate-900 border-b-2 border-amber-500 hover:bg-amber-100/90',
  missing:
    'bg-rose-50 text-slate-900 border-b-2 border-rose-600 hover:bg-rose-100/90',
};

export function ManuscriptPane({
  text,
  onTextChange,
  report,
  isEditing,
  onToggleEditing,
  selectedFindingId,
  highlightPulseSeq,
  onSelectFindingFromHighlight,
  onSubmitShortcut,
}: ManuscriptPaneProps) {
  const highlightRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const showAnnotated = Boolean(report && !isEditing && report.sourceText === text);

  const segments = useMemo(() => {
    if (!showAnnotated || !report) return [];
    return buildHighlightedSegments(report.sourceText, report.findings);
  }, [showAnnotated, report]);

  useEffect(() => {
    if (!showAnnotated || !selectedFindingId || highlightPulseSeq === 0) return;
    const el = highlightRefs.current[selectedFindingId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showAnnotated, selectedFindingId, highlightPulseSeq]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmitShortcut();
    }
  };

  return (
    <section
      aria-label="Methods text panel"
      className="flex flex-col rounded-lg border border-slate-200 bg-white"
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/70 px-4 py-3 rounded-t-lg">
        <div className="flex items-center gap-2 text-sm">
          <h2 className="font-display font-semibold text-slate-900">Methods Text</h2>
          <span className="text-slate-300" aria-hidden="true">
            ·
          </span>
          <span className="text-xs text-slate-500">
            {showAnnotated ? 'Annotated view' : 'Draft editor'}
          </span>
        </div>

        {report && report.sourceText === text && (
          <button
            type="button"
            onClick={() => onToggleEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isEditing ? (
              <>
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                View highlights
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit text
              </>
            )}
          </button>
        )}
      </div>

      {showAnnotated ? (
        <div className="flex flex-col justify-between flex-1">
          <div
            className="p-5 text-[15px] leading-[1.75] text-slate-800 whitespace-pre-wrap lg:min-h-[460px] lg:max-h-[580px] lg:overflow-y-auto"
            tabIndex={0}
            aria-label="Annotated methods passage with clickable highlights"
          >
            {(() => {
              const registeredPrimaryRef = new Set<string>();
              return segments.map((seg, idx) => {
                if (seg.findingIds.length === 0 || !seg.primaryStatus) {
                  return <React.Fragment key={`${seg.start}-${idx}`}>{seg.text}</React.Fragment>;
                }

                const isSelected =
                  selectedFindingId !== null && seg.findingIds.includes(selectedFindingId);

                const firstUnregisteredId = seg.findingIds.find(
                  (id) => !registeredPrimaryRef.has(id),
                );
                if (firstUnregisteredId) {
                  seg.findingIds.forEach((id) => registeredPrimaryRef.add(id));
                }

                const primaryFindingId =
                  isSelected && selectedFindingId ? selectedFindingId : seg.findingIds[0];

                return (
                  <button
                    key={`${seg.start}-${idx}`}
                    type="button"
                    ref={(node) => {
                      if (node) {
                        seg.findingIds.forEach((id) => {
                          if (!highlightRefs.current[id]) {
                            highlightRefs.current[id] = node;
                          }
                        });
                      }
                    }}
                    onClick={() => onSelectFindingFromHighlight(primaryFindingId)}
                    title="Click to jump to finding card"
                    className={`inline text-left rounded-[2px] px-0.5 transition-colors cursor-pointer ${
                      HIGHLIGHT_CLASSES[seg.primaryStatus]
                    } ${
                      isSelected
                        ? 'ring-2 ring-sky-700 ring-offset-1 bg-sky-100/80'
                        : ''
                    }`}
                  >
                    {seg.text}
                  </button>
                );
              });
            })()}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-600 rounded-b-lg">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 border-b-2 border-emerald-600 bg-emerald-50 h-2.5" aria-hidden="true" />
                Reported
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 border-b-2 border-amber-500 bg-amber-50 h-2.5" aria-hidden="true" />
                Unclear
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 border-b-2 border-rose-600 bg-rose-50 h-2.5" aria-hidden="true" />
                Missing anchor
              </span>
            </div>
            <span className="text-slate-500">Click any highlight to inspect finding</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          <label htmlFor="methods-input" className="sr-only">
            Paste your methods section text
          </label>
          <textarea
            id="methods-input"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste the methods section of a paper or lab report here (for example: reagents, concentrations, instruments, sample sizes, controls, software versions, and statistical tests)..."
            className="w-full flex-1 resize-y p-5 text-[15px] leading-[1.75] text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[340px] lg:min-h-[460px] rounded-none"
          />
          <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-500 rounded-b-lg">
            <span>Only verbatim quotes matching your text are highlighted.</span>
            <span className="hidden sm:inline font-mono">Ctrl/Cmd + Enter to check</span>
          </div>
        </div>
      )}
    </section>
  );
}
