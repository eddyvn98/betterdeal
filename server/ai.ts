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

const coerceMarkdownText = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';

  const record = value as Record<string, unknown>;
  return coerceMarkdownText(record.reply ?? record.content ?? record.message ?? record.text);
};

const parseJsonMaybe = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(cleanJsonString(value));
  } catch {
    return value;
  }
};

const unwrapAiPayload = (raw: unknown): unknown => {
  let payload = parseJsonMaybe(raw);

  for (let i = 0; i < 3; i++) {
    if (!payload || typeof payload !== 'object') break;

    const record = payload as Record<string, unknown>;
    if (typeof record.reply === 'string') {
      const nestedReply = parseJsonMaybe(record.reply);
      if (
        nestedReply &&
        typeof nestedReply === 'object' &&
        (Object.prototype.hasOwnProperty.call(nestedReply, 'reply') ||
          Object.prototype.hasOwnProperty.call(nestedReply, 'lead'))
      ) {
        payload = { ...record, ...(nestedReply as Record<string, unknown>) };
        continue;
      }
    }

    if (!record.reply && (record.content || record.message || record.text)) {
      payload = parseJsonMaybe(record.content ?? record.message ?? record.text);
      continue;
    }

    break;
  }

  return payload;
};

const sanitizeReplyText = (reply: string): string => {
  return reply
    .replace(/\[object Object\]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

    // Fallback mềm: ưu tiên trả về raw text để không "câm" trước khách hàng.
    const fallbackReply = rawText.trim();

    return {
      reply: fallbackReply || 'Mình đang xử lý hơi chậm, bạn gửi lại yêu cầu giúp mình nhé.',
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

export const normalizeChatResponse = (rawText: string): ChallengeAIResponse => {
  const unwrappedPayload = unwrapAiPayload(rawText);

  if (!rawText || rawText.trim().length === 0) {
    return {
      reply: 'He thong AI dang ban xu ly du lieu, ban vui long gui lai yeu cau nhe.',
      lead: { ...emptyLead, adminSummary: 'AI returned empty response' },
    };
  }

  let parsedJson: any = {};
  try {
    parsedJson = unwrappedPayload && typeof unwrappedPayload === 'object'
      ? unwrappedPayload
      : JSON.parse(cleanJsonString(String(unwrappedPayload || rawText)));
  } catch (error) {
    console.error('Failed to parse AI JSON:', error);
    console.debug('Raw AI Text that failed to parse:', rawText);

    const fallbackReply = sanitizeReplyText(coerceMarkdownText(unwrappedPayload) || rawText.trim());
    return {
      reply: fallbackReply || 'Minh dang xu ly hoi cham, ban gui lai yeu cau giup minh nhe.',
      lead: { ...emptyLead, adminSummary: 'JSON parse failed: ' + rawText.slice(0, 100) },
    };
  }

  parsedJson.reply = sanitizeReplyText(coerceMarkdownText(parsedJson.reply ?? parsedJson.content ?? parsedJson.message ?? parsedJson.text));

  const validation = ChallengeAIResponseSchema.safeParse(parsedJson);
  if (!validation.success) {
    console.warn('Zod Validation Warning (Partial match attempted):', validation.error.format());

    const partialLead = typeof parsedJson.lead === 'object' && parsedJson.lead !== null
      ? {
          ...emptyLead,
          ...parsedJson.lead,
          dealStage: normalizeDealStage(parsedJson.lead.dealStage),
        }
      : emptyLead;

    return {
      reply: parsedJson.reply || 'Phan hoi khong dung cau truc yeu cau, vui long thu lai.',
      lead: partialLead,
    };
  }

  const result = validation.data;
  result.reply = sanitizeReplyText(result.reply);
  if (!result.reply) {
    result.reply = 'AI da xu ly xong nhung khong trich xuat duoc phan hoi van ban phu hop.';
  }

  return result;
};
