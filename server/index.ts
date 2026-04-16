import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ai, buildDynamicContext, buildMessageContents, dataUrlToPart, getCachedConfig, normalizeChallengeResponse, DEFAULT_MODEL, DEFAULT_GEN_CONFIG } from './ai';
import { buildKnowledgeContext, initKnowledgeBase, searchKnowledge, searchExperience, generateEmbedding } from './ai/knowledge';
import { browsingTools, browse_url } from './ai/tools';
import { addMessage, createSession, ensureSession, getAdminStatus, getLead, getMessages, setAdminStatus, upsertLead, saveExperienceEmbedding, getAllLeads } from './leadStore';
import { notifyAdmin, setupBotMenu } from './notifier';
import { handleExternalQuote } from './externalHandlers';
import crypto from 'node:crypto';
import { leadToMarkdown } from './ai/formatter';
import { createOrder, getOrder, getOrderBySession, updateOrderStatus, updateOrderPriority, getAllOrders, getQueue, getPublicQueue, OrderStatus } from './orderService';
import { processPaymentWebhook, verifySepaySignature, getAllPayments } from './paymentService';

const app = express();
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'fallback';

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
  const { auth } = req.query;
  if (!verifyAdminAuth(String(auth))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const leads = getAllLeads();
  return res.json(leads);
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
  const { auth } = req.query;
  if (!verifyAdminAuth(String(auth))) return res.status(401).json({ error: 'Unauthorized' });
  res.json(getAllOrders());
});

app.get('/api/admin/payments', (req, res) => {
  const { auth } = req.query;
  if (!verifyAdminAuth(String(auth))) return res.status(401).json({ error: 'Unauthorized' });
  res.json(getAllPayments());
});

app.patch('/api/admin/orders/:id', (req, res) => {
  const { id } = req.params;
  const { auth } = req.query;
  const { status, progressStep, manualPriorityScore } = req.body;

  if (!verifyAdminAuth(String(auth))) return res.status(401).json({ error: 'Unauthorized' });

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

    console.log(`[${new Date().toLocaleTimeString()}] [API-CALL] Chat start (Session: ${sessionId}, Model: ${modelName})`);
    
    const contents = [
      { role: 'user', parts: [{ text: `KNOWLEDGE BASE: ${kbContext}\n\nCONTEXT: ${leadContext}` }] },
      { role: 'model', parts: [{ text: 'Understood. I will use the company knowledge and lead context for my response.' }] },
      ...conversationHistory
    ];

    // Lượt gọi đầu tiên với Tools (không ép JSON vì Gemini không cho phép kết hợp cả hai trong 1 lượt nếu có functionCall)
    let response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        ...cachedConfig,
        tools: browsingTools,
      },
    });

    // Vòng lặp xử lý Function Calling
    let callCount = 0;
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
          
          // Tách screenshot ra khỏi nội dung văn bản để gửi riêng dưới dạng inlineData
          const { screenshot, ...textContent } = result;
          
          responseParts.push({
            functionResponse: {
              name: 'browse_url',
              response: { content: textContent }
            }
          });

          // Nếu có ảnh chụp màn hình, gửi kèm cho AI để phân tích Vision
          if (screenshot) {
            console.log(`[${new Date().toLocaleTimeString()}] [SYSTEM] Sending screenshot to AI for vision analysis...`);
            responseParts.push({
              inlineData: {
                mimeType: 'image/jpeg',
                data: screenshot
              }
            });
          }
        }
      }

      contents.push({ role: 'user', parts: responseParts });
      
      // Lượt gọi tiếp theo để AI xử lý kết quả từ hàm
      response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          ...cachedConfig,
          tools: browsingTools,
        },
      });
    }

    // Lượt gọi cuối cùng để bắt buộc trả về định dạng JSON (Structured Lead Data)
    if (!response.candidates?.[0]?.content?.parts?.find(p => p.text?.includes('{'))) {
      response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          ...cachedConfig,
          responseMimeType: 'application/json',
          ...DEFAULT_GEN_CONFIG,
        },
      });
    }

    const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const rawText = response.text || '';
    
    if (!rawText) {
      console.warn(`[${new Date().toLocaleTimeString()}] [API-WARNING] Empty response from Gemini (Session: ${sessionId})`);
      console.debug('Response candidates:', JSON.stringify(response.candidates, null, 2));
    }

    console.log(`[${new Date().toLocaleTimeString()}] [API-CALL] Chat success (${responseTime}s, Knowledge: ${relevantKB.length}, Tool calls: ${callCount})`);

    const parsed = normalizeChallengeResponse(rawText);
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
    if (parsed.lead.dealStage === 'closed' || (parsed.lead.readyToHandoff && parsed.lead.estimatedQuote)) {
      const existingOrder = getOrderBySession(sessionId);
      if (!existingOrder) {
        // Parse quote to number
        const amountStr = parsed.lead.estimatedQuote.replace(/[^0-9]/g, '');
        const amount = parseInt(amountStr) || 0;
        
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
