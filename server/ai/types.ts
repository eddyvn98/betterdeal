import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const LeadQualificationSchema = z.object({
  projectSummary: z.string().default('').describe('Tóm tắt ngắn gọn ý tưởng dự án của khách hàng'),
  projectType: z.string().default('').describe('Loại dự án (Web, Mobile, SaaS, eCommerce, v.v.)'),
  goals: z.array(z.string()).default([]).describe('Các mục tiêu chính của dự án'),
  requiredFeatures: z.array(z.string()).default([]).describe('Danh sách các tính năng bắt buộc'),
  targetUsers: z.string().default('').describe('Đối tượng người dùng mục tiêu'),
  platforms: z.array(z.string()).default([]).describe('Các nền tảng hỗ trợ (Web, iOS, Android, v.v.)'),
  references: z.array(z.string()).default([]).describe('Các dự án tham khảo hoặc link tham khảo'),
  budget: z.string().default('').describe('Ngân sách dự kiến của khách hàng'),
  estimatedQuote: z.string().default('').describe('Báo giá dự kiến từ phía chúng ta (cần được tính toán logic)'),
  demoTimeline: z.string().default('').describe('Thời gian dự kiến có bản demo'),
  deliveryTimeline: z.string().default('').describe('Thời gian dự kiến bàn giao sản phẩm'),
  contactName: z.string().default('').describe('Tên người liên hệ'),
  contactChannel: z.string().default('').describe('Kênh liên hệ (Zalo, Telegram, Email, v.v.)'),
  contactValue: z.string().default('').describe('Thông tin liên hệ cụ thể'),
  missingInfo: z.array(z.string()).default([]).describe('Các thông tin còn thiếu cần thu thập thêm'),
  nextQuestions: z.array(z.string()).default([]).describe('Các câu hỏi tiếp theo để làm rõ yêu cầu'),
  confidence: z.enum(['low', 'medium', 'high']).default('low').describe('Độ tin cậy của thông tin đã thu thập'),
  dealStage: z.enum(['discovery', 'qualified', 'quoted', 'won']).default('discovery').describe('Giai đoạn của deal'),
  readyToHandoff: z.boolean().default(false).describe('Đã đủ thông tin để chuyển qua bộ phận kỹ thuật chưa'),
  adminSummary: z.string().default('').describe('Tóm tắt ngắn gọn cho admin về status của lead này'),
  redeemedVoucherCode: z.string().default('').describe('Mã voucher mà khách đã nhận được từ mini-game'),
  appliedDiscount: z.number().default(0).describe('Phần trăm giảm giá đã áp dụng (0-50)'),
  isSharedExperience: z.boolean().default(false).describe('Đã được lưu vào bộ nhớ kinh nghiệm chia sẻ chưa'),
});

export const ChallengeAIResponseSchema = z.object({
  reply: z.string().describe('Phản hồi của AI tới khách hàng, theo định dạng Markdown chuyên nghiệp'),
  lead: LeadQualificationSchema,
});

export type LeadQualification = z.infer<typeof LeadQualificationSchema>;
export type ChallengeAIResponse = z.infer<typeof ChallengeAIResponseSchema>;

export const getGeminiResponseSchema = () => {
  // Gemini's responseSchema is a simplified JSON Schema
  // We use any to bypass strict Zod internal type mismatches in some environments
  const jsonSchema = zodToJsonSchema(ChallengeAIResponseSchema as any);
  return jsonSchema;
};
