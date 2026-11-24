import {
  mapAuditError,
  runMethodsAudit,
  validateMethodsText,
} from '../lib/geminiAudit.ts';

interface VercelReq {
  method?: string;
  body?: unknown;
}

interface VercelRes {
  status: (code: number) => VercelRes;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  let parsedBody: { text?: unknown } = {};
  if (typeof req.body === 'string') {
    try {
      parsedBody = JSON.parse(req.body) as { text?: unknown };
    } catch {
      res.status(400).json({ error: 'Invalid JSON request body.' });
      return;
    }
  } else if (req.body && typeof req.body === 'object') {
    parsedBody = req.body as { text?: unknown };
  }

  const validation = validateMethodsText(parsedBody.text);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const report = await runMethodsAudit(validation.text);
    res.status(200).json(report);
  } catch (err) {
    const mapped = mapAuditError(err);
    res.status(mapped.status).json({ error: mapped.error });
  }
}
