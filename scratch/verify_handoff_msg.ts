import 'dotenv/config';
import { ai, normalizeChallengeResponse } from '../server/ai';
import { DEFAULT_MODEL } from '../server/ai/provider';
import { buildSystemInstruction } from '../server/ai/prompts';
import { getGeminiResponseSchema } from '../server/ai/types';

const currentLead: any = {
  projectSummary: 'Làm Landing Page giới thiệu dịch vụ',
  projectType: 'Landing page',
  goals: ['Giới thiệu dịch vụ', 'Tìm kiếm khách hàng'],
  requiredFeatures: ['Form liên hệ', 'Slider ảnh'],
  targetUsers: 'Khách hàng cá nhân',
  platforms: ['Web'],
  references: [],
  budget: '5.000.000 VND',
  estimatedQuote: '5.000.000 VND',
  demoTimeline: '2 ngày',
  deliveryTimeline: '5 ngày',
  contactName: 'Nguyễn Văn A',
  contactChannel: 'Zalo',
  contactValue: '0123456789',
  missingInfo: [],
  nextQuestions: [],
  confidence: 'high',
  dealStage: 'qualified',
  readyToHandoff: false,
  adminSummary: '',
};

async function verifyHandoffMessage() {
  const message = "Ok mình chốt gói Standard nhé. Bắt đầu triển khai luôn giúp mình.";

  console.log('--- VERIFICATION: THÔNG ĐIỆP BÀN GIAO ---');
  console.log('Client chốt deal:', message);
  console.log('Đang chờ AI phản hồi...\n');

  try {
    const systemPrompt = [
        buildSystemInstruction(5),
        '',
        'Lead Data (Current):',
        JSON.stringify(currentLead),
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
    console.log('\nReady to Handoff:', parsed.lead.readyToHandoff);
    
    const containsHandoff = parsed.reply.toLowerCase().includes('nhân viên sẽ liên hệ') || parsed.reply.toLowerCase().includes('triển khai dự án');
    
    console.log('\n=== KẾT QUẢ KIỂM TRA ===');
    console.log('Đã bao gồm thông điệp bàn giao:', containsHandoff ? '✅' : '❌');
    
  } catch (error: any) {
    console.error('Lỗi khi gọi AI:', error.message);
  }
}

verifyHandoffMessage();
