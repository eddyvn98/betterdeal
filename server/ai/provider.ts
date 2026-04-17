import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const deepseekKey = process.env.DEEPSEEK_API_KEY;

if (!apiKey && !deepseekKey) {
  console.warn('WARNING: Neither GEMINI_API_KEY nor DEEPSEEK_API_KEY is defined.');
}

export const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

export const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

// --- MODEL LOCK (GEMINI 2.5 FLASH) ---
// To restore: export const DEFAULT_MODEL = 'gemini-2.5-flash';
// --------------------------------------

// Active model: Gemma 4 26B (Mixture-of-Experts)
export const DEFAULT_MODEL = 'gemma-4-26b-a4b-it';

/**
 * Gọi DeepSeek API (OpenAI Compatible)
 */
export const callDeepSeek = async (messages: any[], config: any = {}) => {
  if (!deepseekKey) {
    throw new Error('DEEPSEEK_API_KEY is not defined');
  }

  const response = await fetch(DEEPSEEK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${deepseekKey}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      ...config
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`DeepSeek API Error: ${JSON.stringify(error)}`);
  }

  return response.json();
};

/**
 * Cấu hình AI mặc định
 */
export const DEFAULT_GEN_CONFIG = {};
