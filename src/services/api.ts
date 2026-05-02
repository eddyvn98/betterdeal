import { ChatApiResponse, LeadQualification, Message } from '../types';

const API_BASE = '/api';

const extractMessageContent = (value: unknown): string => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && ('reply' in parsed || 'message' in parsed || 'content' in parsed)) {
        return extractMessageContent((parsed as any).reply ?? (parsed as any).message ?? (parsed as any).content);
      }
    } catch {
      // Plain markdown text is the normal path.
    }
    return trimmed.replace(/\[object Object\]/g, '').trim();
  }

  if (!value || typeof value !== 'object') return '';

  const record = value as Record<string, unknown>;
  return extractMessageContent(record.reply ?? record.content ?? record.message ?? record.text);
};

const normalizeMessage = (message: unknown): Message => {
  const record = message && typeof message === 'object' ? message as Partial<Message> & Record<string, unknown> : {};
  return {
    role: record.role === 'user' ? 'user' : 'model',
    content: extractMessageContent(record.content ?? record.reply ?? record.message ?? message),
    attachments: Array.isArray(record.attachments) ? record.attachments : undefined,
  };
};

const normalizeChatResponse = (data: unknown): ChatApiResponse => ({
  ...(data as ChatApiResponse),
  message: normalizeMessage((data as ChatApiResponse).message),
});

const normalizeSessionState = (data: unknown): {
  sessionId: string;
  messages: Message[];
  lead: LeadQualification;
  adminStatus: 'idle' | 'sending' | 'sent' | 'failed';
} => ({
  ...(data as {
    sessionId: string;
    messages: Message[];
    lead: LeadQualification;
    adminStatus: 'idle' | 'sending' | 'sent' | 'failed';
  }),
  messages: Array.isArray((data as any)?.messages) ? (data as any).messages.map(normalizeMessage) : [],
});

const normalizeSessionResponse = (data: unknown): { sessionId: string } => ({
  ...(data as Record<string, unknown>),
  sessionId: String((data as any)?.sessionId || ''),
});

export const createSession = async (turnstileToken?: string): Promise<{ sessionId: string }> => {
  const response = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ turnstileToken }),
  });

  if (!response.ok) {
    throw new Error(`Cannot create session: ${response.status}`);
  }

  const data = await response.json();
  return normalizeSessionResponse(data);
};

export const sendChatMessage = async (payload: {
  sessionId: string;
  message: string;
  attachments: string[];
  lang?: string;
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

  const data = await response.json();
  return normalizeChatResponse(data);
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

  const data = await response.json();
  return normalizeSessionState(data);
};

export const fetchAdminLeads = async (auth: string, sessionId?: string): Promise<any[]> => {
  const query = sessionId ? `?auth=${encodeURIComponent(auth)}&sessionId=${encodeURIComponent(sessionId)}` : `?auth=${encodeURIComponent(auth)}`;
  const response = await fetch(`${API_BASE}/admin/leads${query}`);
  if (!response.ok) throw new Error('Unauthorized');
  return response.json();
};

export const fetchAdminLeadDetail = async (id: string, auth: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/admin/leads/${id}?auth=${auth}`);
  if (!response.ok) throw new Error('Unauthorized');
  return response.json();
};

export const fetchAdminOrders = async (auth: string, sessionId?: string): Promise<any[]> => {
  const query = sessionId
    ? `?auth=${encodeURIComponent(auth)}&sessionId=${encodeURIComponent(sessionId)}`
    : `?auth=${encodeURIComponent(auth)}`;
  const response = await fetch(`${API_BASE}/admin/orders${query}`);
  if (!response.ok) throw new Error('Unauthorized');
  return response.json();
};

export const updateAdminOrder = async (id: string, auth: string, payload: any, sessionId?: string): Promise<any> => {
  const query = sessionId
    ? `?auth=${encodeURIComponent(auth)}&sessionId=${encodeURIComponent(sessionId)}`
    : `?auth=${encodeURIComponent(auth)}`;
  const response = await fetch(`${API_BASE}/admin/orders/${id}${query}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Unauthorized or invalid request');
  return response.json();
};

export const fetchAdminPayments = async (auth: string, sessionId?: string): Promise<any[]> => {
  const query = sessionId
    ? `?auth=${encodeURIComponent(auth)}&sessionId=${encodeURIComponent(sessionId)}`
    : `?auth=${encodeURIComponent(auth)}`;
  const response = await fetch(`${API_BASE}/admin/payments${query}`);
  if (!response.ok) throw new Error('Unauthorized');
  return response.json();
};

export const fetchAdminOrderBundleBySession = async (sessionId: string, auth: string): Promise<{ order: any | null; payments: any[] }> => {
  const response = await fetch(`${API_BASE}/admin/orders/by-session/${encodeURIComponent(sessionId)}?auth=${encodeURIComponent(auth)}`);
  if (!response.ok) throw new Error('Unauthorized');
  return response.json();
};
