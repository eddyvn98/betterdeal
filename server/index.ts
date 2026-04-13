import 'dotenv/config';
import express from 'express';
import { ai, buildDynamicContext, buildMessageContents, dataUrlToPart, getCachedConfig, normalizeChallengeResponse, DEFAULT_MODEL, DEFAULT_GEN_CONFIG } from './ai';
import { buildKnowledgeContext, initKnowledgeBase, searchKnowledge, searchExperience, generateEmbedding } from './ai/knowledge';
import { browsingTools, browse_url } from './ai/tools';
import { addMessage, createSession, ensureSession, getAdminStatus, getLead, getMessages, setAdminStatus, upsertLead, saveExperienceEmbedding } from './leadStore';
import { notifyAdmin } from './notifier';

const app = express();
app.use(express.json({ limit: '10mb' }));

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
      
      contents.push(response.candidates[0].content);

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

    if (parsed.lead.readyToHandoff) {
      // Tự động lưu bộ nhớ kinh nghiệm khi chốt deal (chỉ lưu tóm tắt kỹ thuật, ẩn thông tin cá nhân)
      if (!currentLead.readyToHandoff) {
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

    return res.json({
      sessionId,
      message: { role: 'model', content: parsed.reply },
      lead: parsed.lead,
      adminStatus: getAdminStatus(sessionId),
    });
  } catch (error) {
    console.error('AI Processing Error:', error);
    return res.status(500).json({
      error: 'AI system encountered an error. This is likely due to a missing or invalid API key.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

const port = Number(process.env.API_PORT || 8787);
app.listen(port, () => {
  console.log('API server running on http://localhost:' + port);
});
