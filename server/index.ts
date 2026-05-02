import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ai, buildDynamicContext, buildMessageContents, buildOpenAIMessages, dataUrlToPart, getCachedConfig, normalizeChatResponse, DEFAULT_MODEL, DEFAULT_GEN_CONFIG } from './ai';
import { callDeepSeek } from './ai/provider';
import { buildKnowledgeContext, initKnowledgeBase, searchKnowledge, searchExperience, generateEmbedding } from './ai/knowledge';
import { browsingTools, openAIBrowsingTools, browse_url, web_search } from './ai/tools';
import { addMessage, createSession, ensureSession, getAdminStatus, getLead, getMessages, setAdminStatus, upsertLead, saveExperienceEmbedding, getAllLeads } from './leadStore';
import { notifyAdmin, setupBotMenu } from './notifier';
import { handleExternalQuote } from './externalHandlers';
import crypto from 'node:crypto';
import { leadToMarkdown } from './ai/formatter';
import { createOrder, getOrder, getOrderBySession, updateOrderStatus, updateOrderPriority, getAllOrders, getQueue, getPublicQueue, OrderStatus } from './orderService';
import { processPaymentWebhook, verifySepaySignature, getAllPayments, getPaymentHistoryByOrder } from './paymentService';
import { LeadQualification } from '../src/types';

const app = express();
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'fallback';

const OPTION_QUOTE_MAP: Array<{ pattern: RegExp; amount: number; label: string }> = [
  { pattern: /\b(option\s*1|opt\s*1|lite|gói\s*1)\b/i, amount: 7000000, label: 'Option 1 (Lite)' },
  { pattern: /\b(option\s*2|opt\s*2|standard|gói\s*2)\b/i, amount: 12000000, label: 'Option 2 (Standard)' },
  { pattern: /\b(option\s*3|opt\s*3|elite|gói\s*3)\b/i, amount: 40000000, label: 'Option 3 (Elite)' },
];

const detectSelectedOption = (text: string) => OPTION_QUOTE_MAP.find((item) => item.pattern.test(text));

const USD_TO_VND_RATE = 26500;

const parseNumericAmount = (raw: string): number => {
  const cleaned = String(raw || '').replace(/[^0-9.,]/g, '');
  if (!cleaned) return 0;

  const normalized = cleaned.includes('.') && cleaned.includes(',')
    ? cleaned.replace(/,/g, '')
    : cleaned.replace(/,/g, '.');

  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
};

const parseAmountFromText = (text: string): number => {
  const normalizedText = String(text || '');
  if (!normalizedText.trim()) return 0;

  const containsUsd = /\$|\busd\b/i.test(normalizedText);
  const amount = parseNumericAmount(normalizedText);
  if (amount <= 0) return 0;

  if (containsUsd) return Math.round(amount * USD_TO_VND_RATE);
  return Math.round(amount);
};

const inferLeadForClosing = (lead: LeadQualification, userMessage: string): LeadQualification => {
  const option = detectSelectedOption(userMessage);
  const hasContact = Boolean(lead.contactValue || lead.contactName);

  if (!option || !hasContact) return lead;

  if (!lead.estimatedQuote || String(lead.estimatedQuote).trim() === '') {
    lead.estimatedQuote = `${option.amount.toLocaleString('vi-VN')} VND`;
  }

  lead.readyToHandoff = true;
  if (lead.dealStage === 'discovery' || lead.dealStage === 'qualified') {
    lead.dealStage = 'quoted';
  }
  if (!lead.projectSummary || String(lead.projectSummary).trim() === '') {
    lead.projectSummary = `Khách đã chọn ${option.label} và để lại thông tin liên hệ`;
  }
  if (!lead.adminSummary || String(lead.adminSummary).trim() === '') {
    lead.adminSummary = `Khách chọn ${option.label}. Cần liên hệ ngay để xác nhận triển khai và đặt cọc.`;
  }

  return lead;
};

const parseOrderAmount = (estimatedQuote: string, userMessage: string, budget: string): number => {
  const selected = detectSelectedOption(userMessage) || detectSelectedOption(estimatedQuote || '');
  if (selected) return selected.amount;

  const quoteAmount = parseAmountFromText(estimatedQuote);
  if (quoteAmount >= 100000) return quoteAmount;

  const messageAmount = parseAmountFromText(userMessage);
  if (messageAmount >= 100000) return messageAmount;

  const budgetAmount = parseAmountFromText(budget);
  return budgetAmount >= 100000 ? budgetAmount : 0;
};

const EMERGING_TECH_REGEX =
  /\b(mcp|model\s*context\s*protocol|a2a|agent[\s-]*to[\s-]*agent|langgraph|autogen|crewai|semantic\s*kernel|n8n|comfyui|llamaindex|vector\s*db|rag|ai\s*agent|agents?\s*sdk|durable\s*objects?|workers?\s*ai)\b/i;

const hasEmergingTechSignal = (text: string): boolean => {
  const msg = String(text || '').trim();
  if (!msg) return false;
  if (EMERGING_TECH_REGEX.test(msg)) return true;

  // Fallback: detect uncommon uppercase acronyms (>=3 chars), excluding common noise.
  const acronyms = msg.match(/\b[A-Z][A-Z0-9-]{2,}\b/g) || [];
  const ignored = new Set(['VND', 'USD', 'CRM', 'CMS', 'ERP', 'API', 'SEO', 'UI', 'UX']);
  return acronyms.some((token) => !ignored.has(token));
};

const buildWebSearchContext = (payload: any): string => {
  if (!payload || payload.error || !Array.isArray(payload.results) || payload.results.length === 0) {
    return '';
  }

  const lines = payload.results.slice(0, 3).map((item: any, index: number) => {
    const title = item?.title || 'Untitled';
    const url = item?.url || '';
    const snippet = item?.snippet || '';
    return `${index + 1}. ${title}\nURL: ${url}\nSummary: ${snippet}`;
  });

  return `WEB SEARCH SNAPSHOT (${payload.query}):\n${lines.join('\n\n')}`;
};

// Helper to verify admin token
const verifyAdminAuth = (auth: string, sessionId?: string) => {
  if (!auth) return false;
  
  // 1. Check if it's the Master Admin token (Used by the global dashboard)
  const masterToken = crypto.createHmac('sha256', ADMIN_SECRET).update('MASTER_ADMIN').digest('hex');
  if (auth === masterToken) return true;

  // 2. Check if it's a session-specific token (Used by direct links from Telegram)
  if (sessionId) {
    const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(sessionId).digest('hex');
    return auth === expected;
  }
  
  return false;
};

app.use(express.json({ limit: '10mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Khởi tạo kho tri thức khi server chạy
initKnowledgeBase().catch(console.error);

app.post('/api/sessions', (_req, res) => {
  const sessionId = createSession();
  res.json({ sessionId });
});

app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  if (!ensureSession(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  return res.json({
    sessionId,
    messages: getMessages(sessionId),
    lead: getLead(sessionId),
    adminStatus: getAdminStatus(sessionId),
  });
});

// --- ADMIN API ---

app.get('/api/admin/verify', (req, res) => {
  const { auth, sessionId } = req.query;
  if (verifyAdminAuth(String(auth), sessionId ? String(sessionId) : undefined)) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: 'Unauthorized' });
});

app.get('/api/admin/leads', (req, res) => {
  const { auth, sessionId } = req.query;
  const authStr = String(auth || '');
  const sid = sessionId ? String(sessionId) : undefined;

  // Master token: can view all leads
  if (verifyAdminAuth(authStr)) {
    return res.json(getAllLeads());
  }

  // Session token: only view its own lead summary
  if (sid && verifyAdminAuth(authStr, sid)) {
    const lead = getAllLeads().find((item) => item.sessionId === sid);
    return res.json(lead ? [lead] : []);
  }

  return res.status(401).json({ error: 'Unauthorized' });
});

app.get('/api/admin/leads/:id', (req, res) => {
  const { id } = req.params;
  const { auth } = req.query;
  
  if (!verifyAdminAuth(String(auth), id)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!ensureSession(id)) return res.status(404).json({ error: 'Lead not found' });

  const lead = getLead(id);
  const messages = getMessages(id);
  const markdown = leadToMarkdown(lead, id);

  return res.json({
    lead,
    messages,
    markdown
  });
});

// --- ORDER & PAYMENT API ---

app.get('/api/orders/queue', (req, res) => {
  const queue = getQueue();
  // Map to public view (hide sensitive info if needed)
  const publicQueue = queue.map((o, idx) => ({
    position: idx + 1,
    projectSummary: o.projectSummary,
    status: o.status,
    paidAmount: o.paidAmount,
    totalAmount: o.totalAmount,
    createdAt: o.createdAt
  }));
  res.json(publicQueue);
});

app.get('/api/orders/:ticket', (req, res) => {
  const { ticket } = req.params;
  const order = getOrder(ticket);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  
  const publicQueueData = getPublicQueue(ticket);
  
  res.json({
    ...order,
    queuePosition: publicQueueData.userPosition,
    publicQueue: publicQueueData.items,
    fomoMessages: publicQueueData.fomoMessages,
    upsellSuggestion: publicQueueData.upsellSuggestion,
    totalInQueue: publicQueueData.totalInQueue
  });
});

app.post('/api/webhooks/sepay', async (req, res) => {
  const signature = req.header('x-sepay-signature') || req.header('x-signature') || null;
  const secret = process.env.SEPAY_WEBHOOK_SECRET || '';
  
  // Verify signature if secret is provided
  if (secret && !verifySepaySignature(JSON.stringify(req.body), secret, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    const result = await processPaymentWebhook(req.body);
    res.json(result);
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(400).json({ error: 'Webhook failed' });
  }
});

app.get('/api/admin/orders', (req, res) => {
  const { auth, sessionId } = req.query;
  const authStr = String(auth || '');
  const sid = sessionId ? String(sessionId) : undefined;

  if (verifyAdminAuth(authStr)) {
    return res.json(getAllOrders());
  }

  if (sid && verifyAdminAuth(authStr, sid)) {
    const scoped = getAllOrders().filter((order) => order.sessionId === sid);
    return res.json(scoped);
  }

  return res.status(401).json({ error: 'Unauthorized' });
});

app.get('/api/admin/payments', (req, res) => {
  const { auth, sessionId } = req.query;
  const authStr = String(auth || '');
  const sid = sessionId ? String(sessionId) : undefined;

  if (verifyAdminAuth(authStr)) {
    return res.json(getAllPayments());
  }

  if (sid && verifyAdminAuth(authStr, sid)) {
    const scopedOrders = getAllOrders()
      .filter((order) => order.sessionId === sid)
      .map((order) => order.id);

    if (scopedOrders.length === 0) return res.json([]);

    const scopedSet = new Set(scopedOrders);
    const scopedPayments = getAllPayments().filter((payment: any) => scopedSet.has(payment.order_id));
    return res.json(scopedPayments);
  }

  return res.status(401).json({ error: 'Unauthorized' });
});

app.get('/api/admin/orders/by-session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { auth } = req.query;
  const authStr = String(auth || '');
  const isMaster = verifyAdminAuth(authStr);
  const isSessionToken = verifyAdminAuth(authStr, sessionId);

  if (!isMaster && !isSessionToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const order = getOrderBySession(sessionId);
  if (!order) {
    return res.json({ order: null, payments: [] });
  }

  const payments = getPaymentHistoryByOrder(order.id);
  return res.json({ order, payments });
});

app.patch('/api/admin/orders/:id', (req, res) => {
  const { id } = req.params;
  const { auth, sessionId } = req.query;
  const { status, progressStep, manualPriorityScore } = req.body;
  const authStr = String(auth || '');
  const sid = sessionId ? String(sessionId) : undefined;
  const isMaster = verifyAdminAuth(authStr);

  if (!isMaster) {
    if (!sid || !verifyAdminAuth(authStr, sid)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const order = getOrder(id);
    if (!order || order.sessionId !== sid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  if (status) updateOrderStatus(id, status as OrderStatus, progressStep);
  if (manualPriorityScore !== undefined) updateOrderPriority(id, Number(manualPriorityScore));
  
  res.json({ ok: true });
});

app.post('/api/chat', async (req, res) => {
  const { sessionId, message, attachments, lang } = req.body as {
    sessionId?: string;
    message?: string;
    attachments?: string[];
    lang?: string;
  };

  if (!sessionId || !message) {
    return res.status(400).json({ error: 'sessionId and message are required' });
  }

  if (!ensureSession(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  addMessage(sessionId, 'user', message, attachments);

  const history = getMessages(sessionId);
  const currentLead = getLead(sessionId);
  console.log(`[${new Date().toLocaleTimeString()}] AI Processing started for session: ${sessionId}`);
  const startTime = Date.now();

  try {
    const modelName = DEFAULT_MODEL;
    const cachedConfig = await getCachedConfig(modelName, lang);
    const conversationHistory = buildMessageContents(history, attachments);
    const leadContext = buildDynamicContext(currentLead);
    
    // RAG: Tìm kiếm tri thức liên quan tới nội dung chat (Quy tắc + Kinh nghiệm cũ)
    const [relevantKB, relevantExp] = await Promise.all([
      searchKnowledge(message),
      searchExperience(message)
    ]);
    const kbContext = buildKnowledgeContext(relevantKB, relevantExp);
    let webSearchContext = '';

    // Hard-rule: when user mentions potentially new/emerging tech keywords, search web first.
    if (hasEmergingTechSignal(message)) {
      const webResults = await web_search(message);
      webSearchContext = buildWebSearchContext(webResults);
    }

    console.log(`[${new Date().toLocaleTimeString()}] [API-CALL] Chat start (Session: ${sessionId}, Model: ${modelName})`);
    
    let rawText = '';
    let callCount = 0;

    if (modelName.includes('deepseek')) {
      // --- DEEPSEEK (OPENAI COMPATIBLE) FLOW ---
      const messages: any[] = [
        { role: 'system', content: (cachedConfig as any).systemInstruction },
        { role: 'user', content: `KNOWLEDGE BASE: ${kbContext}\n\n${webSearchContext ? `${webSearchContext}\n\n` : ''}CONTEXT: ${leadContext}` },
        { role: 'assistant', content: 'Understood. I will use the company knowledge and lead context for my response.' },
        ...buildOpenAIMessages(history)
      ];

      let response: any = await callDeepSeek(messages, {
        tools: openAIBrowsingTools,
        tool_choice: 'auto'
      });

      // Tool Call Loop
      while (response.choices[0].message.tool_calls && callCount < 3) {
        callCount++;
        const toolCalls = response.choices[0].message.tool_calls;
        messages.push(response.choices[0].message);

        for (const toolCall of toolCalls) {
          if (toolCall.function.name === 'browse_url') {
            const args = JSON.parse(toolCall.function.arguments);
            const result = await browse_url(args.url);
            
            // OpenAI/DeepSeek doesn't support Vision in V3, so we only send back text
            const { screenshot, ...textContent } = result;
            
            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(textContent)
            });
          } else if (toolCall.function.name === 'web_search') {
            const args = JSON.parse(toolCall.function.arguments);
            const result = await web_search(args.query);
            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result)
            });
          }
        }

        response = await callDeepSeek(messages, {
          tools: openAIBrowsingTools
        });
      }

      rawText = response.choices[0].message.content || '';
      
      // If DeepSeek didn't return JSON but we need it, we could do a follow-up
      if (rawText && !rawText.includes('{')) {
        messages.push({ role: 'user', content: 'Please output your response in the required JSON format.' });
        const jsonResponse: any = await callDeepSeek(messages, { response_format: { type: 'json_object' } });
        rawText = jsonResponse.choices[0].message.content;
      }

    } else {
      // --- GEMINI FLOW ---
      const contents = [
        { role: 'user', parts: [{ text: `KNOWLEDGE BASE: ${kbContext}\n\n${webSearchContext ? `${webSearchContext}\n\n` : ''}CONTEXT: ${leadContext}` }] },
        { role: 'model', parts: [{ text: 'Understood. I will use the company knowledge and lead context for my response.' }] },
        ...conversationHistory
      ];

      let response = await (ai as any).models.generateContent({
        model: modelName,
        contents,
        config: {
          ...cachedConfig,
          tools: browsingTools,
        },
      });

      while (response.candidates?.[0]?.content?.parts?.some(p => p.functionCall) && callCount < 3) {
        callCount++;
        const parts = response.candidates[0].content.parts;
        const functionCalls = parts.filter(p => p.functionCall);
        
        contents.push({ role: 'model', parts: response.candidates[0].content.parts as any });

        const responseParts = [];
        for (const call of functionCalls) {
          if (call.functionCall?.name === 'browse_url') {
            const url = (call.functionCall.args as any).url;
            const result = await browse_url(url);
            const { screenshot, ...textContent } = result;
            
            responseParts.push({
              functionResponse: {
                name: 'browse_url',
                response: { content: textContent }
              }
            });

            if (screenshot) {
              responseParts.push({
                inlineData: { mimeType: 'image/jpeg', data: screenshot }
              });
            }
          } else if (call.functionCall?.name === 'web_search') {
            const query = (call.functionCall.args as any).query;
            const result = await web_search(query);
            responseParts.push({
              functionResponse: {
                name: 'web_search',
                response: { content: result }
              }
            });
          }
        }

        contents.push({ role: 'user', parts: responseParts });
        
        response = await (ai as any).models.generateContent({
          model: modelName,
          contents,
          config: {
            ...cachedConfig,
            tools: browsingTools,
          },
        });
      }

      response = await (ai as any).models.generateContent({
        model: modelName,
        contents,
        config: {
          ...cachedConfig,
          responseMimeType: 'application/json',
          ...DEFAULT_GEN_CONFIG,
        },
      });
      rawText = response.text || '';
    }

    const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (!rawText) {
      console.warn(`[${new Date().toLocaleTimeString()}] [API-WARNING] Empty response from AI (Session: ${sessionId})`);
    }

    console.log(`[${new Date().toLocaleTimeString()}] [API-CALL] Chat success (${responseTime}s, Knowledge: ${relevantKB.length}, Tool calls: ${callCount})`);

    const parsed = normalizeChatResponse(rawText);
    parsed.lead = inferLeadForClosing(parsed.lead, message);
    addMessage(sessionId, 'model', parsed.reply);
    upsertLead(sessionId, parsed.lead);

    // Logic bàn giao cho Admin (Handoff)
    const currentAdminStatus = getAdminStatus(sessionId);
    const hasContact = !!parsed.lead.contactValue;
    const isNewContact = hasContact && (currentAdminStatus === 'idle' || currentAdminStatus === 'failed');
    
    if (parsed.lead.readyToHandoff || isNewContact) {
      // Tự động lưu bộ nhớ kinh nghiệm khi chốt deal (chỉ lưu tóm tắt kỹ thuật, ẩn thông tin cá nhân)
      if (parsed.lead.readyToHandoff && !currentLead.readyToHandoff) {
        console.log(`[${new Date().toLocaleTimeString()}] [SYSTEM] Learning from successful deal (Session: ${sessionId})...`);
        generateEmbedding(parsed.lead.projectSummary)
          .then(embedding => {
            if (embedding && embedding.length > 0) {
              saveExperienceEmbedding(sessionId, embedding);
            }
          })
          .catch(err => console.error('Failed to save experience:', err));
      }

      try {
        setAdminStatus(sessionId, 'sending');
        await notifyAdmin(sessionId, parsed.lead, getMessages(sessionId));
        setAdminStatus(sessionId, 'sent');
      } catch (error) {
        console.error('Notify admin error:', error);
        setAdminStatus(sessionId, 'failed');
      }
    }

    // Check for deal closure and generate Order
    let order = null;
    if (parsed.lead.dealStage === 'won' || (parsed.lead.readyToHandoff && parsed.lead.estimatedQuote)) {
      const existingOrder = getOrderBySession(sessionId);
      if (!existingOrder) {
        // Parse quote to number
        const amount = parseOrderAmount(parsed.lead.estimatedQuote, message, parsed.lead.budget);
        
        if (amount > 0) {
          order = createOrder(sessionId, parsed.lead.projectSummary, amount);
          console.log(`[${new Date().toLocaleTimeString()}] [SYSTEM] Order created automatically: ${order.id} for session ${sessionId}`);
        }
      } else {
        order = existingOrder;
      }
    }

    return res.json({
      sessionId,
      message: { role: 'model', content: parsed.reply },
      lead: parsed.lead,
      adminStatus: getAdminStatus(sessionId),
      order: order ? { id: order.id, status: order.status } : null
    });
  } catch (error) {
    console.error('AI Processing Error:', error);
    return res.status(500).json({
      error: 'AI system encountered an error. This is likely due to a missing or invalid API key.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Cổng API cho các hệ thống bên ngoài (Web freelancer, Automation, v.v.)
app.post('/api/v1/external/quote', handleExternalQuote);

// Phục vụ các file static từ thư mục dist (sau khi build frontend)
const distPath = path.join(__dirname, '../dist');

app.get('/robots.txt', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.type('text/plain');
  res.sendFile(path.join(distPath, 'robots.txt'));
});

app.use(express.static(distPath));

// Route cuối cùng: Phục vụ index.html cho tất cả các request không phải API (hỗ trợ client-side routing)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

const port = Number(process.env.API_PORT || 8787);
app.listen(port, () => {
  console.log('API server running on http://localhost:' + port);
  // Tự động setup nút Menu cho bot Telegram khi khởi động
  setupBotMenu().catch(err => console.error('Failed to setup bot menu:', err));
});
