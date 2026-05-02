import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY is not defined in environment variables.');
}

export const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const getSystemPrompt = (type: 'stack', lang: string = 'vi') => {
  const isEn = lang.startsWith('en');
  if (type === 'stack') {
    return isEn
      ? 'You are Emdash Architect. Briefly explain why this stack is suitable for the given project type. Focus on performance and scalability. Return concise Markdown, 1-2 sentences.'
      : 'Bạn là Emdash Architect. Giải thích ngắn gọn tại sao bộ stack này phù hợp cho loại dự án đã nêu. Tập trung vào hiệu năng và khả năng mở rộng. Trả về Markdown ngắn gọn, 1-2 câu.';
  }

  return '';
};
