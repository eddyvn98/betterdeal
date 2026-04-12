import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in environment variables.');
}

export const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

// Default model configuration
export const DEFAULT_MODEL = 'gemini-2.5-flash';
