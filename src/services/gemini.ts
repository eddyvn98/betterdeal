import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY is not defined in environment variables.');
}

export const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const getSystemPrompt = (type: 'stack') => {
  if (type === 'stack') {
    return 'B?n l? EmDash Architect. Gi?i th?ch ng?n g?n t?i sao b? stack n?y ph? h?p cho lo?i d? ?n ?? n?u. T?p trung v?o hi?u n?ng v? kh? n?ng m? r?ng. Tr? v? Markdown ng?n g?n, 1-2 c?u.';
  }

  return '';
};
