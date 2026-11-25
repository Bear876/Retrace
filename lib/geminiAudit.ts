import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  CHECKLIST_CATEGORIES,
  RawModelReport,
  VerifiedReport,
  verifyAndScoreReport,
} from '../src/lib/reproducibility.ts';

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    studyType: {
      type: Type.STRING,
      description:
        'Brief classification of the study type inferred solely from the methods text (e.g., "Wet-lab molecular biology", "Computational machine learning", "Clinical observational study").',
    },
    findings: {
      type: Type.ARRAY,
      description:
        'Checklist audit items for every applicable category from the 9-category checklist. Skip categories that genuinely do not fit the study type and list them in skippedCategories instead.',
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: `Must be one of: ${CHECKLIST_CATEGORIES.join(', ')}`,
          },
          status: {
            type: Type.STRING,
            description:
              'Must be exactly one of: "reported", "unclear", or "missing".',
          },
          quote: {
            type: Type.STRING,
            description:
              'Exact verbatim substring copied character-for-character from the submitted methods text that supports this finding. If status is "missing" and no relevant passage exists in the text, return an empty string "". Never paraphrase or alter characters.',
          },
          issue: {
            type: Type.STRING,
            description:
              'Concise, factual statement of what detail is present, ambiguous, or absent for reproducibility. Never judge scientific validity or whether results are true.',
          },
          suggestedFix: {
            type: Type.STRING,
            description:
              'Concrete, specific addition or clarification the author could add to make the step repeatable. Empty string if no addition is needed.',
          },
          draftTemplate: {
            type: Type.STRING,
            description:
              'For "missing" or "unclear" findings, a single ready-to-paste sentence with [bracketed placeholders] for missing specifics (e.g., "Cells were maintained at 37 °C in [5% CO2] after seeding at [density]."). Empty string "" if status is "reported".',
          },
        },
        required: ['category', 'status', 'quote', 'issue', 'suggestedFix', 'draftTemplate'],
      },
    },
    skippedCategories: {
      type: Type.ARRAY,
      description:
        'Categories from the 9-category checklist that do not apply to this study type (so the study is not penalized for omitting irrelevant items).',
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
        required: ['category', 'reason'],
      },
    },
  },
  required: ['studyType', 'findings', 'skippedCategories'],
};

const SYSTEM_INSTRUCTION = `You are Retrace, a meticulous scientific methods reproducibility auditor.
Your ONLY job is to audit a Methods section against a 9-category reproducibility checklist so a reader or student researcher can see which operational details are present, unclear, or missing to repeat the work.

Checklist of 9 categories:
1. Materials and reagents
2. Quantities and concentrations
3. Equipment and settings
4. Conditions
5. Samples and replicates
6. Controls
7. Software and versions
8. Statistical methods
9. Data and code availability

Strict rules:
- Do NOT invent details, assume unstated steps, or fill in what the authors "probably did".
- Narrow claims only: flag missing or ambiguous methodological detail only. NEVER judge whether the results are true, whether the hypothesis is valid, or whether the science is "good".
- Applicability: Skip categories that genuinely do not fit the study type (for example, do not penalize a pure computational/ML study for missing wet-lab "Materials and reagents", or a qualitative synthesis for missing "Quantities and concentrations"). Put skipped categories in "skippedCategories" with a brief reason, and do not include them in "findings".
- Verbatim quotes: For every finding that references the text, "quote" MUST be an exact, character-for-character substring copied directly from the input text. Never paraphrase, combine non-adjacent sentences with ellipses, or alter punctuation. If a detail is completely absent ("missing") with no anchor phrase, set "quote" to "".
- Draft templates: For "missing" or "unclear" findings, provide a concise, single-sentence "draftTemplate" using [bracketed placeholders] for unknown specifics so the author can paste and fill it in. For "reported" findings, set "draftTemplate" to "".
- Status definitions:
  - "reported": Essential details in this category are explicitly stated with enough specificity to repeat.
  - "unclear": Mentioned in the text, but key parameters (catalog numbers, concentrations, versions, replicate definitions, test directionality, etc.) are missing or ambiguous.
  - "missing": Essential details for this applicable category are absent from the text.`;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function callGeminiWithRetry(text: string): Promise<RawModelReport> {
  const ai = getGeminiClient();
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Audit the following Methods section for reproducibility details:\n\n"""\n${text}\n"""`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          seed: 42,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const rawJson = (response.text ?? '').trim();
      if (!rawJson) {
        throw new Error('Empty response from model');
      }
      return JSON.parse(rawJson) as RawModelReport;
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('MISSING_API_KEY') ||
        msg.includes('API_KEY_INVALID') ||
        msg.includes('PERMISSION_DENIED') ||
        msg.includes('400') ||
        msg.includes('403')
      ) {
        throw err;
      }
      if (attempt < maxAttempts) {
        const delayMs = 400 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

export function validateMethodsText(rawText: unknown): {
  valid: boolean;
  text: string;
  error?: string;
} {
  const text = typeof rawText === 'string' ? rawText.trim() : '';
  if (!text) {
    return { valid: false, text: '', error: 'Please provide a methods section to check.' };
  }
  if (text.length < 40) {
    return {
      valid: false,
      text: '',
      error:
        'The text is too short to audit. Paste at least a full paragraph from a methods section.',
    };
  }
  if (text.length > 40000) {
    return {
      valid: false,
      text: '',
      error:
        'Methods text exceeds the 40,000-character limit. Please trim to the methods section.',
    };
  }
  return { valid: true, text };
}

export async function runMethodsAudit(text: string): Promise<VerifiedReport> {
  const rawReport = await callGeminiWithRetry(text);
  return verifyAndScoreReport(text, rawReport);
}

export function mapAuditError(err: unknown): { status: number; error: string } {
  const msg = err instanceof Error ? err.message : 'Unexpected server error';
  if (msg.includes('MISSING_API_KEY')) {
    return {
      status: 503,
      error:
        'Gemini API key is not configured on the server. Set GEMINI_API_KEY in your environment variables, or use "Try a sample" to explore immediately.',
    };
  }
  if (msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      error:
        'The configured Gemini API key was rejected. Please verify GEMINI_API_KEY in your environment variables.',
    };
  }
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
    return {
      status: 429,
      error:
        'Rate limit reached on the Gemini API key. Please wait a moment and try again.',
    };
  }
  if (msg.includes('UNAVAILABLE') || msg.includes('503')) {
    return {
      status: 503,
      error:
        'The Gemini model is temporarily experiencing high demand. Please wait a few seconds and try again.',
    };
  }
  return {
    status: 500,
    error: `Could not complete the methods check: ${msg}`,
  };
}
