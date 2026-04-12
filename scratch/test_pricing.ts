import 'dotenv/config';
import { ai, normalizeChallengeResponse } from '../server/ai';
import { DEFAULT_MODEL } from '../server/ai/provider';
import { buildSystemInstruction } from '../server/ai/prompts';
import { getGeminiResponseSchema, LeadQualification } from '../server/ai/types';

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

async function testPricingEngine() {
  const message = "Chào bạn, mình muốn làm một website giới thiệu công ty xây dựng, giống như coteccons.vn. Có phần giới thiệu, dự án, tin tức, và tuyển dụng. Báo giá cho mình nhé.";

  console.log('--- TEST: BẬT ENGINE BÁO GIÁ FREELANCE 2026 ---');
  console.log('Client hỏi:', message);
  console.log('Đang chờ AI tính toán Units và Báo giá...\n');

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
    console.log('--- RAW AI OUTPUT ---');
    console.log(outputText);
    const parsed = normalizeChallengeResponse(outputText);
    
    console.log('=== KẾT QUẢ TỪ AI (DẠNG JSON ĐÃ DỊCH) ===');
    console.log(parsed.reply);
    console.log('\n=== QUOTE ===');
    console.log(parsed.lead.estimatedQuote);
    
  } catch (error: any) {
    console.error('Call API bị lỗi:');
    console.error(error);
  }
}

testPricingEngine();
