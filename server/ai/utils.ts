import { Message } from '../../src/types';

export const MAX_HISTORY = 10;

export const truncateHistory = (history: Message[]): Message[] => {
  return history.slice(-MAX_HISTORY);
};

export const cleanJsonString = (raw: string): string => {
  let cleaned = raw.trim();
  
  // Xử lý các khối code block ```json ... ```
  const jsonMatch = cleaned.match(/```json([\s\S]*?)```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // Fallback: Tìm dấu { và } ngoài cùng
  const braceMatch = cleaned.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    return braceMatch[0].trim();
  }

  return cleaned;
};

export const dataUrlToPart = (dataUrl: string) => {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;

  return {
    inlineData: {
      mimeType: match[1],
      data: match[2],
    },
  };
};

export const buildTranscript = (history: Message[]): string => {
  return history
    .map((item) => (item.role === 'user' ? 'Client: ' : 'AI: ') + item.content)
    .join('\n');
};
