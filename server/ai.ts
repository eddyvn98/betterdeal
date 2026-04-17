import { genAI, DEFAULT_MODEL, DEFAULT_GEN_CONFIG } from './ai/provider';

import { buildSystemInstruction } from './ai/prompts';
import { truncateHistory, cleanJsonString, dataUrlToPart, buildTranscript } from './ai/utils';
import { ChallengeAIResponseSchema, ChallengeAIResponse, LeadQualification, getGeminiResponseSchema } from './ai/types';
import { Message } from '../src/types';

// Re-export for compatibility with server/index.ts
export { dataUrlToPart, getGeminiResponseSchema, DEFAULT_MODEL, DEFAULT_GEN_CONFIG };
export const ai = genAI;

// Quản lý cấu hình AI
// LƯU Ý QUAN TRỌNG: Nghiêm cấm sử dụng các model AI thấp hơn Gemini 2.5 Flash.

/**
 * Lấy cấu hình AI (vô hiệu hóa caching cho bản Free Tier để tránh lỗi 429)
 */
export const getCachedConfig = async (_modelName: string, lang?: string) => {
  // Trả về trực tiếp system instruction thay vì cố gắng tạo CachedContent 
  // vì Gemini 2.5 Flash Free Tier không hỗ trợ storage cache (Limit = 0).
  return { 
    systemInstruction: getStaticSystemInstruction(lang),
    ...DEFAULT_GEN_CONFIG
  };
};

const emptyLead: LeadQualification = {
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
  isSharedExperience: false,
  redeemedVoucherCode: '',
  appliedDiscount: 0,
};

const normalizeDealStage = (value: unknown): LeadQualification['dealStage'] => {
  if (value === 'closed') return 'won';
  if (value === 'won' || value === 'quoted' || value === 'negotiation' || value === 'qualified' || value === 'discovery') {
    return value;
  }
  return 'discovery';
};

/**
 * Lấy chỉ dẫn hệ thống cố định (để có thể cache)
 */
export const getStaticSystemInstruction = (lang: string = 'vi') => {
  return buildSystemInstruction(0, lang);
};

/**
 * Xây dựng ngữ cảnh động cho mỗi lượt chat (Lead Data hiện tại)
 */
export const buildDynamicContext = (currentLead: LeadQualification) => {
  return [
    '--- CURRENT LEAD DATA ---',
    JSON.stringify(currentLead),
    '',
    'Instructions: Update the lead data based on the new message.',
  ].join('\n');
};

/**
 * Chuyển đổi lịch sử Message sang định dạng mảng contents của Gemini
 */
export const buildMessageContents = (history: Message[], attachments: string[] = []) => {
  const truncatedHistory = truncateHistory(history);
  
  // Chuyển đổi lịch sử
  const contents = truncatedHistory.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  // Xử lý attachments cho tin nhắn cuối cùng nếu có
  if (attachments.length > 0 && contents.length > 0) {
    const lastMsg = contents[contents.length - 1];
    if (lastMsg.role === 'user') {
      lastMsg.parts.push(...(attachments.map(dataUrlToPart).filter(Boolean) as any[]));
    }
  }

  return contents;
};

/**
 * Chuyển đổi lịch sử sang định dạng OpenAI/DeepSeek
 */
export const buildOpenAIMessages = (history: Message[]) => {
  const truncatedHistory = truncateHistory(history);
  return truncatedHistory.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
};

/**
 * Chuẩn hóa và validate phản hồi từ AI
 */
export const normalizeChallengeResponse = (rawText: string): ChallengeAIResponse => {
  if (!rawText || rawText.trim().length === 0) {
    return {
      reply: 'Hệ thống AI đang bận xử lý dữ liệu, bạn vui lòng gửi lại yêu cầu nhé.',
      lead: { ...emptyLead, adminSummary: '⚠️ AI returned empty response' },
    };
  }

  const cleaned = cleanJsonString(rawText);
  let parsedJson: any = {};

  try {
    parsedJson = JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse AI JSON:', error);
    console.debug('Raw AI Text that failed to parse:', rawText);
    
    // Thử bóc tách phần text bên ngoài JSON (nếu có)
    const fallbackReply = rawText.replace(/\{[\s\S]*\}/, '').trim();
    
    return {
      reply: fallbackReply || 'Phản hồi từ AI gặp sự cố định dạng, vui lòng thử lại câu hỏi khác.',
      lead: { ...emptyLead, adminSummary: '⚠️ JSON parse failed: ' + rawText.slice(0, 100) },
    };
  }

  // Validate bằng Zod
  const validation = ChallengeAIResponseSchema.safeParse(parsedJson);
  
  if (!validation.success) {
    console.warn('Zod Validation Warning (Partial match attempted):', validation.error.format());
    
    // Nỗ lực cứu vãn dữ liệu lead từ AI nếu có, thay vì dùng emptyLead nguyên bản
    const partialLead = typeof parsedJson.lead === 'object' && parsedJson.lead !== null
      ? {
          ...emptyLead,
          ...parsedJson.lead,
          dealStage: normalizeDealStage(parsedJson.lead.dealStage),
        }
      : emptyLead;

    return {
      reply: (parsedJson?.reply || '').trim() || 'Phản hồi không đúng cấu trúc yêu cầu, vui lòng thử lại.',
      lead: partialLead,
    };
  }

  const result = validation.data;
  
  // Đảm bảo reply không bao giờ rỗng sau khi parse thành công
  if (!result.reply || result.reply.trim().length === 0) {
    result.reply = 'AI đã xử lý xong nhưng không trích xuất được phản hồi văn bản phù hợp.';
  }

  return result;
};
