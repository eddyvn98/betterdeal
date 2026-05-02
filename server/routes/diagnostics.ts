import express from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger.ts';

const router = express.Router();

const ClientLogSchema = z.object({
  level: z.enum(['error', 'warn']).default('error'),
  type: z.enum(['window_error', 'unhandled_rejection', 'console_error', 'api_error']).default('window_error'),
  message: z.string().max(4000),
  stack: z.string().max(12000).optional(),
  source: z.string().max(2048).optional(),
  line: z.number().int().nonnegative().optional(),
  column: z.number().int().nonnegative().optional(),
  sessionId: z.string().uuid().optional(),
  page: z.string().max(2048).optional(),
  userAgent: z.string().max(512).optional(),
  extra: z.record(z.unknown()).optional()
});

router.post('/client-logs', (req, res) => {
  const parsed = ClientLogSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid diagnostics payload' });
  }

  const payload = parsed.data;
  const level = payload.level === 'warn' ? 'warn' : 'error';

  logger[level](
    {
      kind: 'frontend-diagnostics',
      type: payload.type,
      source: payload.source,
      line: payload.line,
      column: payload.column,
      stack: payload.stack,
      sessionId: payload.sessionId,
      page: payload.page,
      userAgent: payload.userAgent,
      extra: payload.extra
    },
    payload.message
  );

  return res.status(202).json({ ok: true });
});

export default router;
