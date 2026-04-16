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

export const fetchAdminLeads = async (auth: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/admin/leads?auth=${auth}`);
  if (!response.ok) throw new Error('Unauthorized');
  return response.json();
};

export const fetchAdminLeadDetail = async (id: string, auth: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/admin/leads/${id}?auth=${auth}`);
  if (!response.ok) throw new Error('Unauthorized');
  return response.json();
};

export const fetchAdminOrders = async (auth: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/admin/orders?auth=${auth}`);
  if (!response.ok) throw new Error('Unauthorized');
  return response.json();
};

export const updateAdminOrder = async (id: string, auth: string, payload: any): Promise<any> => {
  const response = await fetch(`${API_BASE}/admin/orders/${id}?auth=${auth}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Unauthorized or invalid request');
  return response.json();
};

export const fetchAdminPayments = async (auth: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/admin/payments?auth=${auth}`);
  if (!response.ok) throw new Error('Unauthorized');
  return response.json();
};
