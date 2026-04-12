import 'dotenv/config';
import { ai, normalizeChallengeResponse } from '../server/ai';
import { DEFAULT_MODEL } from '../server/ai/provider';
import { buildSystemInstruction } from '../server/ai/prompts';
import { getGeminiResponseSchema } from '../server/ai/types';

const emptyLead: any = {
  projectSummary: '',
  projectType: '',
  goals: [],
  requiredFeatures: [],
  targetUsers: '',
  platforms: [],
  references: [],
  budget: '',
  estimatedQuote: '',
  demoTimeline: '',
  deliveryTimeline: '',
  contactName: '',
  contactChannel: '',
  contactValue: '',
  missingInfo: [],
  nextQuestions: [],
  confidence: 'low',
  dealStage: 'discovery',
  readyToHandoff: false,
  adminSummary: '',
};

async function verifyDemoPolicy() {
  const message = "Chào bạn, mình muốn làm một app giao hàng đơn giản. Nhưng mình thấy giá thị trường thường cao quá, mình chỉ có khoảng 1 triệu thôi. Bạn có cách nào giúp mình không?";

  console.log('--- VERIFICATION: CHÍNH SÁCH DEMO 500K & TRẢ GÓP ---');
  console.log('Client hỏi:', message);
  console.log('Đang chờ AI phản hồi...\n');

  try {
    const systemPrompt = [
        buildSystemInstruction(1),
        '',
        'Lead Data (Current):',
        JSON.stringify(emptyLead),
        '',
        'Session Transcript:',
        'Client: ' + message,
      ].join('\n');

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: getGeminiResponseSchema() as any,
      },
    });

    const outputText = response.text || '';
    const parsed = normalizeChallengeResponse(outputText);
    
    console.log('=== PHẢN HỒI CỦA AI ===');
    console.log(parsed.reply);
    
    const containsDemo = parsed.reply.toLowerCase().includes('500k') || parsed.reply.toLowerCase().includes('500.000');
    const containsInstallment = parsed.reply.toLowerCase().includes('trả góp') || parsed.reply.toLowerCase().includes('đợt nhỏ');
    
    console.log('\n=== KẾT QUẢ KIỂM TRA ===');
    console.log('Đã đề cập Demo 500k:', containsDemo ? '✅' : '❌');
    console.log('Đã đề cập Trả góp:', containsInstallment ? '✅' : '❌');
    
  } catch (error: any) {
    console.error('Lỗi khi gọi AI:', error.message);
  }
}

verifyDemoPolicy();
