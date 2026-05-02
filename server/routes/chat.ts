import express from 'express';
import { ensureSession, createSession, addMessage, getMessages, getLead, upsertLead, getAdminStatus, setAdminStatus } from '../leadStore.ts';
import { notifyAdmin } from '../notifier.ts';
import { getOrderBySession, createOrder } from '../orderService.ts';
import { inferLeadForClosing, parseOrderAmount } from '../utils/logic.ts';
import { Message } from '../../src/types/index.ts';
import { logger } from '../utils/logger.ts';
import { z } from 'zod';

const router = express.Router();
const AI_CORE_CHAT_URL = process.env.AI_CORE_CHAT_URL || 'http://localhost:4000/v1/chat';
const AI_CORE_TIMEOUT_MS = Number(process.env.AI_CORE_TIMEOUT_MS || 70000);
const AI_CORE_MAX_RETRIES = Math.max(0, Number(process.env.AI_CORE_MAX_RETRIES || 0));

const ChatRequestSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(5000),
  attachments: z.array(z.string().url()).optional()
});

const SessionRequestSchema = z.object({
  turnstileToken: z.string().optional()
});

function isRetriableNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message?.toLowerCase() || '';
  return msg.includes('timeout') || msg.includes('fetch failed') || msg.includes('aborted');
}

function prettifyReplyText(input: string): string {
  if (!input) return input;
  let text = input.replace(/\r\n/g, '\n').trim();
  text = text.replace(/([.!?])([A-ZÀ-Ỵ])/g, '$1\n\n$2');
  text = text.replace(/:\s*(\d+\.)/g, ':\n\n$1');
  text = text.replace(/([^\n])\s+(\d+\.\s*)/g, '$1\n\n$2');
  text = text.replace(/(\d+\.)\s*/g, '\n$1 ');
  text = text.replace(/([^\n])\s+(-\s+)/g, '$1\n$2');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text;
}

async function callAiCoreChat(payload: unknown, sessionId: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= AI_CORE_MAX_RETRIES; attempt++) {
    try {
      const aiCoreRes = await fetch(AI_CORE_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(AI_CORE_TIMEOUT_MS)
      });

      if (!aiCoreRes.ok) {
        const errorText = await aiCoreRes.text();
        logger.error(
          { status: aiCoreRes.status, errorText, sessionId, attempt },
          'AI Core Proxy Failed'
        );

        // Retry only for transient upstream server errors.
        if (aiCoreRes.status >= 500 && attempt < AI_CORE_MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 350 * (attempt + 1)));
          continue;
        }

        throw new Error(`AI Core Error: ${aiCoreRes.status}`);
      }

      return (await aiCoreRes.json()) as any;
    } catch (error) {
      lastError = error;
      logger.warn({ err: error, sessionId, attempt }, 'AI Core call attempt failed');

      if (attempt < AI_CORE_MAX_RETRIES && isRetriableNetworkError(error)) {
        await new Promise(resolve => setTimeout(resolve, 350 * (attempt + 1)));
        continue;
      }
      break;
    }
  }

  throw lastError ?? new Error('AI Core call failed');
}

router.post('/sessions', async (req, res) => {
  const validation = SessionRequestSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: 'Invalid session request' });

  const { turnstileToken } = validation.data;
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const strictTurnstile = process.env.TURNSTILE_STRICT === 'true';
  const isLocal = req.ip === '::1' || req.ip === '127.0.0.1';

  if (turnstileSecret && !isLocal) {
    // Fail-open by default to avoid hard outage when Turnstile has client-side issues.
    // Set TURNSTILE_STRICT=true to enforce hard blocking.
    if (!turnstileToken) {
      if (strictTurnstile) return res.status(400).json({ error: 'Bot verification required' });
      logger.warn({ ip: req.ip, ua: req.headers['user-agent'] }, '[Turnstile] Missing token, bypassing (TURNSTILE_STRICT=false)');
    } else {
      try {
        const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken, remoteip: req.ip }),
        });

        const result = await verifyResponse.json() as { success: boolean; 'error-codes'?: string[] };
        if (!result.success) {
          if (strictTurnstile) return res.status(403).json({ error: 'Bot verification failed' });
          logger.warn(
            { ip: req.ip, ua: req.headers['user-agent'], errorCodes: result['error-codes'] || [] },
            '[Turnstile] Verification failed, bypassing (TURNSTILE_STRICT=false)'
          );
        }
      } catch (error) {
        if (strictTurnstile) return res.status(503).json({ error: 'Bot verification unavailable' });
        logger.warn({ err: error, ip: req.ip, ua: req.headers['user-agent'] }, '[Turnstile] Verify request failed, bypassing (TURNSTILE_STRICT=false)');
      }
    }
  }

  const sessionId = createSession();
  res.json({ sessionId });
});

router.get('/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  if (!ensureSession(sessionId)) return res.status(404).json({ error: 'Session not found' });

  return res.json({
    sessionId,
    messages: getMessages(sessionId),
    lead: getLead(sessionId),
    adminStatus: getAdminStatus(sessionId),
  });
});

router.post('/chat', async (req, res) => {
  const validation = ChatRequestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid request data', details: validation.error.format() });
  }

  const { sessionId, message, attachments } = validation.data;
  if (!ensureSession(sessionId)) return res.status(404).json({ error: 'Session not found' });

  addMessage(sessionId, 'user', message, attachments);
  const history = getMessages(sessionId);
  const currentLead = getLead(sessionId);
  
  try {
    const coreData = await callAiCoreChat({
      agentId: 'betterdeal-sales',
      sessionId,
      message,
      history: history.map(msg => ({ role: msg.role === 'model' ? 'model' : 'user', content: msg.content }))
    }, sessionId);
    const reply = coreData.reply;
    
    // With Structured Output, we expect coreData.reply to be the message
    // and coreData.metadata might contain the lead if we updated the engine to return it directly.
    // However, the current engine implementation just returns 'reply' which is the raw text.
    // If the model is using responseSchema, 'reply' will be the JSON string.
    
    let parsedJson: any = {};
    let parsedReply = reply;
    try {
      // Try to parse reply as JSON (Gemini Structured Output returns JSON string as text)
      parsedJson = JSON.parse(reply);
      parsedReply = parsedJson.reply;
    } catch (e) {
      // Fallback to regex if not perfect JSON
      const match = reply.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsedJson = JSON.parse(match[0]);
          parsedReply = parsedJson.reply || parsedReply.replace(match[0], '').trim();
        } catch (innerE) {}
      }
    }
    
    let updatedLead = currentLead;
    if (parsedJson.lead) {
       updatedLead = { ...currentLead, ...parsedJson.lead };
    }
    updatedLead = inferLeadForClosing(updatedLead, message);
    
    if (!parsedReply) parsedReply = 'Xin lỗi, hệ thống AI đang gặp chút sự cố.';
    
    parsedReply = prettifyReplyText(parsedReply);
    addMessage(sessionId, 'model', parsedReply);
    upsertLead(sessionId, updatedLead);
    
    // Handoff Logic
    const currentAdminStatus = getAdminStatus(sessionId);
    const hasContact = !!updatedLead.contactValue;
    const isNewContact = hasContact && (currentAdminStatus === 'idle' || currentAdminStatus === 'failed');
    
    if (updatedLead.readyToHandoff || isNewContact) {
       if (updatedLead.readyToHandoff && !currentLead.readyToHandoff) {
         fetch('http://localhost:4000/v1/knowledge/ingest', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             namespaceId: 'betterdeal-general',
             content: updatedLead.projectSummary,
             metadata: { sessionId }
           })
         }).catch(console.error);
       }
       
       try {
         setAdminStatus(sessionId, 'sending');
         await notifyAdmin(sessionId, updatedLead, getMessages(sessionId));
         setAdminStatus(sessionId, 'sent');
       } catch (error) {
         setAdminStatus(sessionId, 'failed');
       }
    }
    
    let order = null;
    if (updatedLead.dealStage === 'won' || (updatedLead.readyToHandoff && updatedLead.estimatedQuote)) {
      const existingOrder = getOrderBySession(sessionId);
      if (!existingOrder) {
        const amount = parseOrderAmount(updatedLead.estimatedQuote, message, updatedLead.budget);
        if (amount > 0) order = createOrder(sessionId, updatedLead.projectSummary, amount);
      } else {
        order = existingOrder;
      }
    }
    
    return res.json({
      sessionId,
      message: { role: 'model', content: parsedReply },
      lead: updatedLead,
      adminStatus: getAdminStatus(sessionId),
      order: order ? { id: order.id, status: order.status } : null,
      degraded: false
    });
    
  } catch (error) {
    logger.error({ err: error, sessionId }, 'AI Proxy Error');

    const fallbackReply =
      'Xin lỗi, hệ thống đang bận tạm thời. Bạn để lại số điện thoại, Zalo hoặc Telegram để team liên hệ ngay nhé.';

    addMessage(sessionId, 'model', fallbackReply);
    const fallbackLead = inferLeadForClosing(currentLead, message);
    upsertLead(sessionId, fallbackLead);

    return res.json({
      sessionId,
      message: { role: 'model', content: fallbackReply },
      lead: fallbackLead,
      adminStatus: getAdminStatus(sessionId),
      order: null,
      degraded: true
    });
  }
});

export default router;
