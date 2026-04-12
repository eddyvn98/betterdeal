import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const LeadQualificationSchema = z.object({
  projectSummary: z.string().describe('Tóm tắt ngắn gọn ý tưởng dự án của khách hàng'),
  projectType: z.string().describe('Loại dự án (Web, Mobile, SaaS, eCommerce, v.v.)'),
  goals: z.array(z.string()).describe('Các mục tiêu chính của dự án'),
  requiredFeatures: z.array(z.string()).describe('Danh sách các tính năng bắt buộc'),
  targetUsers: z.string().describe('Đối tượng người dùng mục tiêu'),
  platforms: z.array(z.string()).describe('Các nền tảng hỗ trợ (Web, iOS, Android, v.v.)'),
  references: z.array(z.string()).describe('Các dự án tham khảo hoặc link tham khảo'),
  budget: z.string().describe('Ngân sách dự kiến của khách hàng'),
  estimatedQuote: z.string().describe('Báo giá dự kiến từ phía chúng ta (cần được tính toán logic)'),
  demoTimeline: z.string().describe('Thời gian dự kiến có bản demo'),
  deliveryTimeline: z.string().describe('Thời gian dự kiến bàn giao sản phẩm'),
  contactName: z.string().describe('Tên người liên hệ'),
  contactChannel: z.string().describe('Kênh liên hệ (Zalo, Telegram, Email, v.v.)'),
  contactValue: z.string().describe('Thông tin liên hệ cụ thể'),
  missingInfo: z.array(z.string()).describe('Các thông tin còn thiếu cần thu thập thêm'),
  nextQuestions: z.array(z.string()).describe('Các câu hỏi tiếp theo để làm rõ yêu cầu'),
  confidence: z.enum(['low', 'medium', 'high']).describe('Độ tin cậy của thông tin đã thu thập'),
  dealStage: z.enum(['discovery', 'qualified', 'quoted', 'won']).describe('Giai đoạn của deal'),
  readyToHandoff: z.boolean().describe('Đã đủ thông tin để chuyển qua bộ phận kỹ thuật chưa'),
  adminSummary: z.string().describe('Tóm tắt ngắn gọn cho admin về status của lead này'),
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
