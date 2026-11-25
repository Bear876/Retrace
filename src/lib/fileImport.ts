export interface ImportedDocumentResult {
  text: string;
  extractedMethodsOnly: boolean;
  fileName: string;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const METHODS_HEADING_RE =
  /^(?:#{1,6}\s*)?(?:(?:\d+(?:\.\d+)*|[IVX]+)[.)]?\s+)?(?:materials\s+and\s+methods|methods\s+and\s+materials|experimental\s+procedures?|experimental\s+section|research\s+methods|study\s+design\s+and\s+methods|subjects\s+and\s+methods|methodology|methods)\s*:?$/i;

const NEXT_SECTION_HEADING_RE =
  /^(?:#{1,6}\s*)?(?:(?:\d+(?:\.\d+)*|[IVX]+)[.)]?\s+)?(?:results(?:\s+and\s+discussion)?|findings|discussion|conclusions?|references|bibliography|acknowledg?ments?|author\s+contributions?|funding|ethics\s+statement|competing\s+interests?|supplementary\s+(?:material|information)|appendix)\s*:?$/i;

export function extractMethodsSection(fullText: string): {
  text: string;
  extractedMethodsOnly: boolean;
} {
  const normalized = fullText
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!normalized) {
    return { text: '', extractedMethodsOnly: false };
  }

  const lines = normalized.split('\n');
  let startIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.length > 0 && trimmed.length <= 80 && METHODS_HEADING_RE.test(trimmed)) {
      startIdx = i + 1;
      break;
    }
  }

  if (startIdx === -1) {
    return { text: normalized, extractedMethodsOnly: false };
  }

  let endIdx = lines.length;
  for (let i = startIdx; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (
      trimmed.length > 0 &&
      trimmed.length <= 80 &&
      NEXT_SECTION_HEADING_RE.test(trimmed)
    ) {
      endIdx = i;
      break;
    }
  }

  const sliced = lines.slice(startIdx, endIdx).join('\n').trim();
  if (sliced.length >= 120) {
    return { text: sliced, extractedMethodsOnly: true };
  }

  return { text: normalized, extractedMethodsOnly: false };
}

async function extractTextFromPdf(file: File): Promise<string> {
  const [pdfjsLib, workerModule] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);

  pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;

  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    let pageText = '';
    let lastY: number | null = null;

    for (const item of content.items) {
      if (!('str' in item)) continue;
      const textItem = item as { str: string; transform?: number[]; hasEOL?: boolean };
      const y = Array.isArray(textItem.transform) ? textItem.transform[5] : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 4) {
        pageText += '\n';
      } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
        pageText += ' ';
      }
      pageText += textItem.str;
      if (textItem.hasEOL) {
        pageText += '\n';
      }
      lastY = y;
    }

    pages.push(pageText.trim());
  }

  return pages.filter(Boolean).join('\n\n');
}

export async function readUploadedDocument(
  file: File,
): Promise<ImportedDocumentResult> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('File exceeds the 10 MB limit. Please upload a smaller paper or paste the methods section directly.');
  }

  const lowerName = file.name.toLowerCase();
  let rawText = '';

  if (lowerName.endsWith('.pdf') || file.type === 'application/pdf') {
    rawText = await extractTextFromPdf(file);
  } else if (
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.markdown') ||
    file.type.startsWith('text/')
  ) {
    rawText = await file.text();
  } else {
    throw new Error('Unsupported file type. Please upload a .txt, .md, or .pdf file.');
  }

  const { text, extractedMethodsOnly } = extractMethodsSection(rawText);
  if (!text) {
    throw new Error(
      'No readable text was found in that file. If it is a scanned PDF, please paste the methods text directly.',
    );
  }

  return {
    text,
    extractedMethodsOnly,
    fileName: file.name,
  };
}
