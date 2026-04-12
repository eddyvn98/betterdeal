import 'dotenv/config';
import { ai, buildDynamicContext, buildMessageContents, getCachedConfig, normalizeChallengeResponse } from '../server/ai';
import { buildKnowledgeContext, initKnowledgeBase, searchKnowledge } from '../server/ai/knowledge';
import { getLead, getMessages } from '../server/leadStore';

async function debugChatFail() {
  const sessionId = "ef58c719-40cb-4940-8071-47aa6cb1ef5c";
  const message = process.argv[2] || "1 web xây dựng cơ bản để giới thiệu sản phẩm đã làm và dịch vụ công ty thì giá như thế nào";
  
  console.log('--- DEBUG START ---');
  await initKnowledgeBase();
  
  const history = getMessages(sessionId);
  const currentLead = getLead(sessionId);
  
  console.log(`Processing message: "${message}"`);
  const startTime = Date.now();

  try {
    const modelName = 'gemini-2.5-flash';
    const cachedConfig = await getCachedConfig(modelName);
    console.log('Cached config obtained.');
    
    const conversationHistory = buildMessageContents(history);
    const leadContext = buildDynamicContext(currentLead);
    
    console.log('Searching knowledge...');
    const relevantKB = await searchKnowledge(message);
    const kbContext = buildKnowledgeContext(relevantKB);
    console.log(`Knowledge found: ${relevantKB.length} items.`);

    console.log('Calling generateContent...');
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        { role: 'user', parts: [{ text: `KNOWLEDGE BASE: ${kbContext}\n\nCONTEXT: ${leadContext}` }] },
        { role: 'model', parts: [{ text: 'Understood. I will use the company knowledge and lead context for my response.' }] },
        ...conversationHistory
      ],
      config: {
        ...cachedConfig,
        responseMimeType: 'application/json',
      },
    });

    console.log('AI Response received.');
    const parsed = normalizeChallengeResponse(response.text || '');
    console.log('Reply:', parsed.reply);
    
  } catch (error) {
    console.error('DEBUG ERROR:', error);
  }
}

debugChatFail().catch(console.error);
