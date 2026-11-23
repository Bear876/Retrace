export const CHECKLIST_CATEGORIES = [
  'Materials and reagents',
  'Quantities and concentrations',
  'Equipment and settings',
  'Conditions',
  'Samples and replicates',
  'Controls',
  'Software and versions',
  'Statistical methods',
  'Data and code availability',
] as const;

export type ChecklistCategory = (typeof CHECKLIST_CATEGORIES)[number];

export type FindingStatus = 'reported' | 'unclear' | 'missing';

export type QuoteVerificationState = 'verified' | 'unverified' | 'none';

export interface CategoryMeta {
  name: ChecklistCategory;
  summary: string;
  examples: string;
}

export const CATEGORY_DETAILS: CategoryMeta[] = [
  {
    name: 'Materials and reagents',
    summary: 'Catalog numbers, vendor names, strains, cell lines, or dataset identifiers.',
    examples: 'Sigma-Aldrich Cat. #S3014, HEK293T (ATCC CRL-3216), CIFAR-10 v1.0',
  },
  {
    name: 'Quantities and concentrations',
    summary: 'Exact masses, volumes, molarities, dilutions, dosages, or sample sizes.',
    examples: '10 mM Tris-HCl, 50 µL reaction volume, 0.001 learning rate',
  },
  {
    name: 'Equipment and settings',
    summary: 'Instrument models, rotor speeds, wavelengths, objectives, or hardware specs.',
    examples: 'Bio-Rad CFX96, 14,000 x g, 488 nm excitation, NVIDIA A100 80GB',
  },
  {
    name: 'Conditions',
    summary: 'Temperatures, durations, pH, atmosphere, lighting, or training schedules.',
    examples: '37 °C for 45 min, pH 7.4, 5% CO2, 100 epochs with cosine decay',
  },
  {
    name: 'Samples and replicates',
    summary: 'Biological vs. technical replicates, randomisation, and exclusion criteria.',
    examples: 'n = 6 independent mice per group, 3 technical triplicates',
  },
  {
    name: 'Controls',
    summary: 'Positive, negative, vehicle, sham, or baseline comparison groups.',
    examples: 'DMSO vehicle control, no-template PCR blank, majority-class baseline',
  },
  {
    name: 'Software and versions',
    summary: 'Exact software names, package versions, and non-default parameters.',
    examples: 'R v4.3.2 (lme4 v1.1-35), ImageJ 1.54f, PyTorch 2.4.1',
  },
  {
    name: 'Statistical methods',
    summary: 'Named tests, assumptions checked, multiple-testing corrections, and error bars.',
    examples: 'Two-tailed Welch t-test, Benjamini-Hochberg FDR < 0.05, mean ± SD',
  },
  {
    name: 'Data and code availability',
    summary: 'Repository links, accession numbers, or explicit access conditions.',
    examples: 'GitHub commit hash, Zenodo DOI, GEO accession GSE123456',
  },
];

export interface RawFinding {
  category: string;
  status: FindingStatus;
  quote: string;
  issue: string;
  suggestedFix: string;
}

export interface SkippedCategory {
  category: string;
  reason: string;
}

export interface RawModelReport {
  studyType: string;
  findings: RawFinding[];
  skippedCategories: SkippedCategory[];
}

export interface TextRange {
  start: number;
  end: number;
}

export interface VerifiedFinding {
  id: string;
  category: string;
  status: FindingStatus;
  quote: string;
  quoteState: QuoteVerificationState;
  matchRange: TextRange | null;
  issue: string;
  suggestedFix: string;
}

export interface ComputedScore {
  points: number;
  totalApplicable: number;
  reportedCount: number;
  unclearCount: number;
  missingCount: number;
  unverifiedQuoteCount: number;
}

export interface VerifiedReport {
  studyType: string;
  findings: VerifiedFinding[];
  skippedCategories: SkippedCategory[];
  score: ComputedScore;
  sourceText: string;
}

export interface TextSegment {
  text: string;
  start: number;
  end: number;
  findingIds: string[];
  primaryStatus: FindingStatus | null;
}

function normalizeStatus(status: string): FindingStatus {
  if (status === 'reported' || status === 'unclear' || status === 'missing') {
    return status;
  }
  return 'unclear';
}

export function verifyAndScoreReport(
  sourceText: string,
  raw: RawModelReport,
): VerifiedReport {
  const findingsList = Array.isArray(raw.findings) ? raw.findings : [];
  const usedRanges: Array<{ start: number; end: number }> = [];

  const verifiedFindings: VerifiedFinding[] = findingsList.map((item, idx) => {
    const cleanQuote = typeof item.quote === 'string' ? item.quote.trim() : '';
    const status = normalizeStatus(item.status);
    let quoteState: QuoteVerificationState = 'none';
    let matchRange: TextRange | null = null;

    if (cleanQuote.length > 0) {
      let searchFrom = 0;
      const firstExactIdx = sourceText.indexOf(cleanQuote);
      let chosenIdx = firstExactIdx;

      while (firstExactIdx !== -1 && searchFrom <= sourceText.length) {
        const candidateIdx = sourceText.indexOf(cleanQuote, searchFrom);
        if (candidateIdx === -1) break;
        const candidateEnd = candidateIdx + cleanQuote.length;
        const collides = usedRanges.some(
          (r) =>
            (candidateIdx > r.start && candidateIdx < r.end) ||
            (candidateEnd > r.start && candidateEnd < r.end) ||
            (candidateIdx < r.start && candidateEnd > r.end),
        );
        if (!collides) {
          chosenIdx = candidateIdx;
          break;
        }
        searchFrom = candidateIdx + 1;
      }

      if (chosenIdx !== -1) {
        quoteState = 'verified';
        matchRange = { start: chosenIdx, end: chosenIdx + cleanQuote.length };
        usedRanges.push(matchRange);
      } else {
        quoteState = 'unverified';
        matchRange = null;
      }
    }

    return {
      id: `finding-${idx + 1}`,
      category: item.category || 'Uncategorized',
      status,
      quote: cleanQuote,
      quoteState,
      matchRange,
      issue: (item.issue || '').trim(),
      suggestedFix: (item.suggestedFix || '').trim(),
    };
  });

  const reportedCount = verifiedFindings.filter((f) => f.status === 'reported').length;
  const unclearCount = verifiedFindings.filter((f) => f.status === 'unclear').length;
  const missingCount = verifiedFindings.filter((f) => f.status === 'missing').length;
  const unverifiedQuoteCount = verifiedFindings.filter(
    (f) => f.quoteState === 'unverified',
  ).length;

  const points = reportedCount * 1 + unclearCount * 0.5;

  return {
    studyType: (raw.studyType || 'Research Methods').trim(),
    findings: verifiedFindings,
    skippedCategories: Array.isArray(raw.skippedCategories) ? raw.skippedCategories : [],
    score: {
      points,
      totalApplicable: verifiedFindings.length,
      reportedCount,
      unclearCount,
      missingCount,
      unverifiedQuoteCount,
    },
    sourceText,
  };
}

const STATUS_PRIORITY: Record<FindingStatus, number> = {
  missing: 3,
  unclear: 2,
  reported: 1,
};

export function buildHighlightedSegments(
  sourceText: string,
  findings: VerifiedFinding[],
): TextSegment[] {
  if (!sourceText) return [];

  const verifiedWithRange = findings.filter(
    (f): f is VerifiedFinding & { matchRange: TextRange } =>
      f.quoteState === 'verified' && f.matchRange !== null,
  );

  if (verifiedWithRange.length === 0) {
    return [
      {
        text: sourceText,
        start: 0,
        end: sourceText.length,
        findingIds: [],
        primaryStatus: null,
      },
    ];
  }

  const boundaries = new Set<number>([0, sourceText.length]);
  for (const f of verifiedWithRange) {
    boundaries.add(f.matchRange.start);
    boundaries.add(f.matchRange.end);
  }
  const sortedBounds = Array.from(boundaries).sort((a, b) => a - b);

  const segments: TextSegment[] = [];
  for (let i = 0; i < sortedBounds.length - 1; i++) {
    const start = sortedBounds[i];
    const end = sortedBounds[i + 1];
    if (start >= end) continue;

    const matchingFindings = verifiedWithRange.filter(
      (f) => f.matchRange.start <= start && f.matchRange.end >= end,
    );

    let primaryStatus: FindingStatus | null = null;
    if (matchingFindings.length > 0) {
      primaryStatus = matchingFindings.reduce<FindingStatus>((acc, cur) => {
        return STATUS_PRIORITY[cur.status] > STATUS_PRIORITY[acc] ? cur.status : acc;
      }, matchingFindings[0].status);
    }

    segments.push({
      text: sourceText.slice(start, end),
      start,
      end,
      findingIds: matchingFindings.map((f) => f.id),
      primaryStatus,
    });
  }

  return segments;
}
