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
    'bg-emerald-100/55 text-zinc-900 border-b border-emerald-700 hover:bg-emerald-100',
  unclear:
    'bg-amber-100/65 text-zinc-900 border-b border-amber-700 hover:bg-amber-100',
  missing:
    'bg-rose-100/65 text-zinc-900 border-b border-rose-700 hover:bg-rose-100',
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
      className="flex flex-col rounded-xs border border-zinc-300 bg-white"
    >
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-3">
        <div className="flex items-center gap-2 text-sm">
          <h2 className="font-medium text-zinc-900">Methods Text</h2>
          <span className="text-zinc-300" aria-hidden="true">
            /
          </span>
          <span className="text-xs text-zinc-500">
            {showAnnotated ? 'Annotated' : 'Editor'}
          </span>
        </div>

        {report && report.sourceText === text && (
          <button
            type="button"
            onClick={() => onToggleEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
            className="p-6 font-serif text-[16px] leading-[1.8] text-zinc-900 whitespace-pre-wrap lg:min-h-[480px] lg:max-h-[620px] lg:overflow-y-auto"
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
                    title="Jump to finding"
                    className={`inline text-left transition-colors cursor-pointer ${
                      HIGHLIGHT_CLASSES[seg.primaryStatus]
                    } ${
                      isSelected
                        ? 'ring-2 ring-zinc-900 ring-offset-1 bg-zinc-200/70'
                        : ''
                    }`}
                  >
                    {seg.text}
                  </button>
                );
              });
            })()}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-5 py-2.5 text-xs text-zinc-500">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 border-b border-emerald-700 bg-emerald-100/70 h-2.5" aria-hidden="true" />
                Reported
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 border-b border-amber-700 bg-amber-100/80 h-2.5" aria-hidden="true" />
                Unclear
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 border-b border-rose-700 bg-rose-100/80 h-2.5" aria-hidden="true" />
                Missing anchor
              </span>
            </div>
            <span>Select a passage to view its note</span>
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
            placeholder="Paste the methods section of a paper or lab report here (reagents, concentrations, instruments, conditions, sample sizes, controls, software versions, statistical tests, and data availability)..."
            className="w-full flex-1 resize-y p-6 font-serif text-[16px] leading-[1.8] text-zinc-900 placeholder:text-zinc-400 placeholder:font-sans placeholder:text-sm focus:outline-none min-h-[360px] lg:min-h-[480px]"
          />
          <div className="flex items-center justify-between gap-4 border-t border-zinc-200 px-5 py-2.5 text-xs text-zinc-500">
            <span>Only verbatim quotes matching your text are highlighted.</span>
            <span className="hidden sm:inline font-mono">Ctrl/Cmd + Enter</span>
          </div>
        </div>
      )}
    </section>
  );
}
