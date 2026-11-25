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
      description: 'Short study type label inferred from the text.',
    },
    findings: {
      type: Type.ARRAY,
      description: 'Audit items for applicable categories only.',
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: `One of: ${CHECKLIST_CATEGORIES.join(', ')}`,
          },
          status: {
            type: Type.STRING,
            description: '"reported", "unclear", or "missing".',
          },
          quote: {
            type: Type.STRING,
            description:
              'Exact verbatim substring from input, or "" if absent.',
          },
          issue: {
            type: Type.STRING,
            description: 'One concise sentence on operational detail present or missing.',
          },
          suggestedFix: {
            type: Type.STRING,
            description: 'Brief specific addition, or "" if none needed.',
          },
          draftTemplate: {
            type: Type.STRING,
            description:
              'One bracketed fill-in sentence if missing/unclear, or "" if reported.',
          },
        },
        required: ['category', 'status', 'quote', 'issue', 'suggestedFix', 'draftTemplate'],
      },
    },
    skippedCategories: {
      type: Type.ARRAY,
      description: 'Categories inapplicable to this study type.',
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

const SYSTEM_INSTRUCTION = `Audit a Methods section against 9 categories: ${CHECKLIST_CATEGORIES.join('; ')}.
Rules:
- Skip categories inapplicable to the study type under skippedCategories with a short reason.
- Flag missing/unclear operational detail only; never judge scientific merit or invent facts.
- quote: exact verbatim substring copied from the text, or "" if absent.
- status: "reported" (specific enough to repeat), "unclear" (mentioned but missing parameters), or "missing" (absent).
- Keep issue, suggestedFix, and draftTemplate (one [bracketed] sentence if unclear/missing, else "") concise.`;

const MAX_CACHE_ENTRIES = 50;
const auditCache = new Map<string, RawModelReport>();

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

function isTransientCapacityError(msg: string): boolean {
  return (
    msg.includes('UNAVAILABLE') ||
    msg.includes('503') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('429') ||
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('504')
  );
}

interface ModelAttemptConfig {
  model: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';
  thinkingLevel?: ThinkingLevel;
}

const MODEL_FALLBACK_CHAIN: ModelAttemptConfig[] = [
  { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW },
  { model: 'gemini-3.1-flash-lite' },
  { model: 'gemini-3.1-flash-lite' },
];

async function callGeminiWithFallback(text: string): Promise<RawModelReport> {
  const cached = auditCache.get(text);
  if (cached) {
    return cached;
  }

  const ai = getGeminiClient();
  let lastError: unknown;

  for (let i = 0; i < MODEL_FALLBACK_CHAIN.length; i++) {
    const { model, thinkingLevel } = MODEL_FALLBACK_CHAIN[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `Methods:\n"""\n${text}\n"""`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          seed: 42,
          ...(thinkingLevel ? { thinkingConfig: { thinkingLevel } } : {}),
        },
      });

      const rawJson = (response.text ?? '').trim();
      if (!rawJson) {
        throw new Error('Empty response from model');
      }
      const parsed = JSON.parse(rawJson) as RawModelReport;

      if (auditCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = auditCache.keys().next().value;
        if (oldestKey !== undefined) {
          auditCache.delete(oldestKey);
        }
      }
      auditCache.set(text, parsed);
      return parsed;
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Retrace] ${model} attempt ${i + 1} failed:`, msg.slice(0, 200));
      if (
        msg.includes('MISSING_API_KEY') ||
        msg.includes('API_KEY_INVALID') ||
        msg.includes('PERMISSION_DENIED') ||
        msg.includes('400') ||
        msg.includes('403')
      ) {
        throw err;
      }
      if (!isTransientCapacityError(msg) && i === MODEL_FALLBACK_CHAIN.length - 1) {
        throw err;
      }
      if (i < MODEL_FALLBACK_CHAIN.length - 1) {
        const delayMs = 800 * (i + 1);
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
  const rawReport = await callGeminiWithFallback(text);
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
