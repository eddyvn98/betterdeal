import crypto from 'node:crypto';
import { db } from './db';
import { LeadQualification, Message } from '../src/types';

const emptyLead: LeadQualification = {
  projectSummary: '',
  projectType: '',
  goals: [],
  requiredFeatures: [],
  targetUsers: '',
  platforms: [],
  references: [],
  budget: '',
  estimatedQuote: '',
  demoTimeline: '',
  deliveryTimeline: '',
  contactName: '',
  contactChannel: '',
  contactValue: '',
  missingInfo: [],
  nextQuestions: [],
  confidence: 'low',
  dealStage: 'discovery',
  readyToHandoff: false,
  adminSummary: '',
};

const parseJsonArray = (value: string): string[] => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const createSession = () => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare('INSERT INTO sessions (id, created_at, updated_at, admin_status) VALUES (?, ?, ?, ?)').run(id, now, now, 'idle');
  db.prepare('INSERT INTO leads (session_id, updated_at) VALUES (?, ?)').run(id, now);

  return id;
};

export const ensureSession = (sessionId: string) => {
  const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId) as { id: string } | undefined;
  return Boolean(session);
};

export const addMessage = (sessionId: string, role: Message['role'], content: string) => {
  const now = new Date().toISOString();
  db.prepare('INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)').run(sessionId, role, content, now);
  db.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?').run(now, sessionId);
};

export const getMessages = (sessionId: string): Message[] => {
  return db.prepare('SELECT role, content FROM messages WHERE session_id = ? ORDER BY id ASC').all(sessionId) as unknown as Message[];
};

export const getLead = (sessionId: string): LeadQualification => {
  const row = db.prepare('SELECT * FROM leads WHERE session_id = ?').get(sessionId) as Record<string, unknown> | undefined;
  if (!row) return emptyLead;

  return {
    projectSummary: String(row.project_summary ?? ''),
    projectType: String(row.project_type ?? ''),
    goals: parseJsonArray(String(row.goals_json ?? '[]')),
    requiredFeatures: parseJsonArray(String(row.required_features_json ?? '[]')),
    targetUsers: String(row.target_users ?? ''),
    platforms: parseJsonArray(String(row.platforms_json ?? '[]')),
    references: parseJsonArray(String(row.references_json ?? '[]')),
    budget: String(row.budget ?? ''),
    estimatedQuote: String(row.estimated_quote ?? ''),
    demoTimeline: String(row.demo_timeline ?? ''),
    deliveryTimeline: String(row.delivery_timeline ?? ''),
    contactName: String(row.contact_name ?? ''),
    contactChannel: String(row.contact_channel ?? ''),
    contactValue: String(row.contact_value ?? ''),
    missingInfo: parseJsonArray(String(row.missing_info_json ?? '[]')),
    nextQuestions: parseJsonArray(String(row.next_questions_json ?? '[]')),
    confidence: String(row.confidence ?? 'low') as LeadQualification['confidence'],
    dealStage: String(row.deal_stage ?? 'discovery') as LeadQualification['dealStage'],
    readyToHandoff: Boolean(row.ready_to_handoff),
    adminSummary: String(row.admin_summary ?? ''),
  };
};

export const upsertLead = (sessionId: string, lead: LeadQualification) => {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE leads SET
      project_summary = ?,
      project_type = ?,
      goals_json = ?,
      required_features_json = ?,
      target_users = ?,
      platforms_json = ?,
      references_json = ?,
      budget = ?,
      estimated_quote = ?,
      demo_timeline = ?,
      delivery_timeline = ?,
      contact_name = ?,
      contact_channel = ?,
      contact_value = ?,
      missing_info_json = ?,
      next_questions_json = ?,
      confidence = ?,
      deal_stage = ?,
      ready_to_handoff = ?,
      admin_summary = ?,
      updated_at = ?
    WHERE session_id = ?
  `).run(
    lead.projectSummary,
    lead.projectType,
    JSON.stringify(lead.goals),
    JSON.stringify(lead.requiredFeatures),
    lead.targetUsers,
    JSON.stringify(lead.platforms),
    JSON.stringify(lead.references),
    lead.budget,
    lead.estimatedQuote,
    lead.demoTimeline,
    lead.deliveryTimeline,
    lead.contactName,
    lead.contactChannel,
    lead.contactValue,
    JSON.stringify(lead.missingInfo),
    JSON.stringify(lead.nextQuestions),
    lead.confidence,
    lead.dealStage,
    lead.readyToHandoff ? 1 : 0,
    lead.adminSummary,
    now,
    sessionId,
  );

  db.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?').run(now, sessionId);
};

export const getAdminStatus = (sessionId: string): 'idle' | 'sending' | 'sent' | 'failed' => {
  const row = db.prepare('SELECT admin_status FROM sessions WHERE id = ?').get(sessionId) as
    | { admin_status: 'idle' | 'sending' | 'sent' | 'failed' }
    | undefined;
  return row?.admin_status ?? 'idle';
};

export const setAdminStatus = (sessionId: string, status: 'idle' | 'sending' | 'sent' | 'failed') => {
  db.prepare('UPDATE sessions SET admin_status = ?, updated_at = ? WHERE id = ?').run(status, new Date().toISOString(), sessionId);
};