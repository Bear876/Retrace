import React from 'react';
import { CATEGORY_DETAILS } from '../lib/reproducibility.ts';

export function ReferenceSections() {
  return (
    <div className="mt-14 space-y-12 border-t border-zinc-300 pt-10">
      <section id="checklist" aria-labelledby="checklist-heading">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2
            id="checklist-heading"
            className="font-serif text-xl font-semibold text-zinc-900"
          >
            Checklist criteria
          </h2>
          <p className="text-xs text-zinc-500">
            Inapplicable categories are skipped per study type rather than penalized.
          </p>
        </div>

        <div className="mt-4 overflow-x-auto border border-zinc-300 bg-white rounded-xs">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500">
                <th className="py-2.5 px-4 w-12 font-mono">#</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">What is checked</th>
                <th className="py-2.5 px-4 hidden md:table-cell">Examples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {CATEGORY_DETAILS.map((item, idx) => (
                <tr key={item.name} className="align-top">
                  <td className="py-2.5 px-4 font-mono text-xs text-zinc-400 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-zinc-900 whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-4 text-zinc-600">{item.summary}</td>
                  <td className="py-2.5 px-4 font-mono text-xs text-zinc-500 hidden md:table-cell">
                    {item.examples}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 border-t border-zinc-200 pt-8 md:grid-cols-2">
        <section id="scoring" aria-labelledby="scoring-heading">
          <h2
            id="scoring-heading"
            className="font-serif text-lg font-semibold text-zinc-900"
          >
            Quote verification and counting
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Every quote returned during an audit is checked character-for-character against your submitted methods text. Any quote that does not match verbatim is marked unverified and is never highlighted. The summary count is computed deterministically in code from applicable findings (1 point per reported item, 0.5 per unclear item, 0 per missing item).
          </p>
        </section>

        <section id="limits" aria-labelledby="limits-heading">
          <h2
            id="limits-heading"
            className="font-serif text-lg font-semibold text-zinc-900"
          >
            Scope and limitations
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Retrace flags missing or ambiguous operational details only. The finding count reflects reported detail rather than a grade of scientific quality, and the tool never evaluates whether experimental results are true or whether a study design is sound. Drafts are processed transiently in-session and are not stored.
          </p>
        </section>
      </div>
    </div>
  );
}
