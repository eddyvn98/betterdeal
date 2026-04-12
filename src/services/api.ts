import { ChatApiResponse, LeadQualification, Message } from '../types';

const API_BASE = '/api';

export const createSession = async (): Promise<{ sessionId: string }> => {
  const response = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Cannot create session: ${response.status}`);
  }

  return response.json();
};

export const sendChatMessage = async (payload: {
  sessionId: string;
  message: string;
  attachments: string[];
}): Promise<ChatApiResponse> => {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  return response.json();
};

export const fetchSessionState = async (sessionId: string): Promise<{
  sessionId: string;
  messages: Message[];
  lead: LeadQualification;
  adminStatus: 'idle' | 'sending' | 'sent' | 'failed';
}> => {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}`);

  if (!response.ok) {
    throw new Error(`Cannot load session: ${response.status}`);
  }

  return response.json();
};
