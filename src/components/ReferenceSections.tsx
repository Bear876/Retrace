import React from 'react';
import { CATEGORY_DETAILS } from '../lib/reproducibility.ts';

export function ReferenceSections() {
  return (
    <div className="mt-16 space-y-16 border-t border-slate-200 pt-14">
      <section id="checklist" aria-labelledby="checklist-heading">
        <div className="max-w-2xl">
          <h2
            id="checklist-heading"
            className="font-display text-2xl font-semibold tracking-tight text-slate-900"
          >
            Nine-category reproducibility checklist
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Every check evaluates only the categories relevant to the study type so computational, field, and bench papers are not penalized for irrelevant criteria.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_DETAILS.map((item, idx) => (
            <div key={item.name} className="bg-white p-5">
              <p className="font-mono text-xs text-slate-400 tabular-nums">
                {String(idx + 1).padStart(2, '0')}.
              </p>
              <h3 className="mt-1 font-display text-sm font-semibold text-slate-900">
                {item.name}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {item.summary}
              </p>
              <p className="mt-2.5 font-mono text-xs text-slate-500">
                e.g. {item.examples}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="grid grid-cols-1 gap-8 border-t border-slate-200 pt-12 lg:grid-cols-12"
      >
        <div className="lg:col-span-4">
          <h2
            id="how-heading"
            className="font-display text-2xl font-semibold tracking-tight text-slate-900"
          >
            How verification works
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Structured AI extraction paired with deterministic client and server checks.
          </p>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Schema-constrained extraction
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Gemini returns structured JSON matching a strict response schema covering category, status, verbatim quote, issue, and suggested fix, with no brittle regex parsing.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Linked highlight navigation
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Click any highlighted passage in your methods text to jump to its card, or click Locate on a finding card to highlight the exact span in the draft.
            </p>
          </div>
        </div>
      </section>

      <section
        id="principles"
        aria-labelledby="principles-heading"
        className="grid grid-cols-1 gap-8 border-t border-slate-200 pt-12 lg:grid-cols-12"
      >
        <div className="lg:col-span-4">
          <h2
            id="principles-heading"
            className="font-display text-2xl font-semibold tracking-tight text-slate-900"
          >
            Responsible AI safeguards
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Built for student researchers, reviewers, and instructors who need transparent signals rather than black-box grades.
          </p>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Verbatim quote verification
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Every quote returned by the model is checked character-for-character against your original text. Any quote that does not match verbatim is marked unverified and never highlighted.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Code-computed finding counts
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              The summary readout is calculated in code (reported = 1, unclear = 0.5, missing = 0), never generated by the model, and never presented as a scientific quality grade.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Narrow methodological claims
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Retrace flags missing operational detail only. It never claims whether experimental results are true, statistically valid, or scientifically sound.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Stateless inspection
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Submitted methods drafts are processed transiently in-session and are never persisted to a database.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
