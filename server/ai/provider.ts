import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in environment variables.');
}

export const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

// --- MODEL LOCK (GEMINI 2.5 FLASH) ---
// To restore: export const DEFAULT_MODEL = 'gemini-2.5-flash';
// --------------------------------------

// Active model: Gemma 4 26B (Mixture-of-Experts)
export const DEFAULT_MODEL = 'gemma-4-26b-a4b-it';

/**
 * Cấu hình AI mặc định
 */
export const DEFAULT_GEN_CONFIG = {};
