import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, FileUp, Loader2, Pencil } from 'lucide-react';
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
  onUploadFile: (file: File) => void;
  isImportingFile: boolean;
  importNotice: string | null;
  onDismissImportNotice: () => void;
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
  onUploadFile,
  isImportingFile,
  importNotice,
  onDismissImportNotice,
}: ManuscriptPaneProps) {
  const highlightRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  return (
    <section
      aria-label="Methods text panel"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex flex-col rounded-xs border bg-white transition-colors ${
        isDragging ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300'
      }`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-3">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <h2 className="font-medium text-zinc-900 whitespace-nowrap shrink-0">
            Methods Text
          </h2>
          <span className="text-zinc-300" aria-hidden="true">
            /
          </span>
          <span className="text-xs text-zinc-500 whitespace-nowrap shrink-0">
            {showAnnotated ? 'Annotated' : 'Editor'}
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.markdown,.pdf,application/pdf,text/plain,text/markdown"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Upload a .txt, .md, or .pdf paper"
          />

          <button
            type="button"
            disabled={isImportingFile}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:underline underline-offset-4 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isImportingFile ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Reading file…
              </>
            ) : (
              <>
                <FileUp className="h-3.5 w-3.5" aria-hidden="true" />
                Upload .txt / .md / .pdf
              </>
            )}
          </button>

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
      </div>

      {importNotice && (
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-5 py-2 text-xs text-zinc-700">
          <span>{importNotice}</span>
          <button
            type="button"
            onClick={onDismissImportNotice}
            className="text-zinc-500 hover:text-zinc-900 underline underline-offset-2 shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

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
            placeholder="Paste a methods section here, or drop a .txt, .md, or .pdf paper to extract its Methods section (reagents, concentrations, instruments, conditions, sample sizes, controls, software versions, statistical tests, and data availability)..."
            className="w-full flex-1 resize-y p-6 font-serif text-[16px] leading-[1.8] text-zinc-900 placeholder:text-zinc-400 placeholder:font-sans placeholder:text-sm focus:outline-none min-h-[360px] lg:min-h-[480px]"
          />
          <div className="flex items-center justify-between gap-4 border-t border-zinc-200 px-5 py-2.5 text-xs text-zinc-500">
            <span>Only verbatim quotes matching your text are highlighted.</span>
            <span className="hidden sm:inline font-mono">Ctrl/Cmd + Enter</span>
          </div>
        </div>
      )}

      {isDragging && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/90 border-2 border-dashed border-zinc-900 rounded-xs">
          <p className="text-sm font-medium text-zinc-900">
            Drop .txt, .md, or .pdf file to load methods text
          </p>
        </div>
      )}
    </section>
  );
}
