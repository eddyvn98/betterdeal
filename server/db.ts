import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dataDir = path.resolve(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'leads.sqlite');
export const db = new DatabaseSync(dbPath);

try {
  db.exec(`PRAGMA journal_mode = WAL;`);
} catch {
  // Fallback for host-mounted volumes that do not support WAL reliably.
  db.exec(`PRAGMA journal_mode = DELETE;`);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    admin_status TEXT NOT NULL DEFAULT 'idle'
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );

  CREATE TABLE IF NOT EXISTS leads (
    session_id TEXT PRIMARY KEY,
    project_summary TEXT NOT NULL DEFAULT '',
    project_type TEXT NOT NULL DEFAULT '',
    goals_json TEXT NOT NULL DEFAULT '[]',
    required_features_json TEXT NOT NULL DEFAULT '[]',
    target_users TEXT NOT NULL DEFAULT '',
    platforms_json TEXT NOT NULL DEFAULT '[]',
    references_json TEXT NOT NULL DEFAULT '[]',
    budget TEXT NOT NULL DEFAULT '',
    estimated_quote TEXT NOT NULL DEFAULT '',
    demo_timeline TEXT NOT NULL DEFAULT '',
    delivery_timeline TEXT NOT NULL DEFAULT '',
    contact_name TEXT NOT NULL DEFAULT '',
    contact_channel TEXT NOT NULL DEFAULT '',
    contact_value TEXT NOT NULL DEFAULT '',
    missing_info_json TEXT NOT NULL DEFAULT '[]',
    next_questions_json TEXT NOT NULL DEFAULT '[]',
    confidence TEXT NOT NULL DEFAULT 'low',
    deal_stage TEXT NOT NULL DEFAULT 'discovery',
    ready_to_handoff INTEGER NOT NULL DEFAULT 0,
    is_shared_experience INTEGER NOT NULL DEFAULT 0,
    experience_embedding TEXT, --- JSON string of vector
    admin_summary TEXT NOT NULL DEFAULT '',
    redeemed_voucher_code TEXT NOT NULL DEFAULT '',
    applied_discount INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );
`);

// Migration an toàn cho database hiện tại
try {
  const tableInfo = db.prepare("PRAGMA table_info(leads)").all() as any[];
  const hasSharedExp = tableInfo.some(col => col.name === 'is_shared_experience');
  const hasEmbedding = tableInfo.some(col => col.name === 'experience_embedding');

  const hasVoucher = tableInfo.some(col => col.name === 'redeemed_voucher_code');
  const hasDiscount = tableInfo.some(col => col.name === 'applied_discount');

  if (!hasSharedExp) {
    db.exec("ALTER TABLE leads ADD COLUMN is_shared_experience INTEGER NOT NULL DEFAULT 0");
  }
  if (!hasEmbedding) {
    db.exec("ALTER TABLE leads ADD COLUMN experience_embedding TEXT");
  }
  if (!hasVoucher) {
    db.exec("ALTER TABLE leads ADD COLUMN redeemed_voucher_code TEXT NOT NULL DEFAULT ''");
  }
  if (!hasDiscount) {
    db.exec("ALTER TABLE leads ADD COLUMN applied_discount INTEGER NOT NULL DEFAULT 0");
  }

  const msgTableInfo = db.prepare("PRAGMA table_info(messages)").all() as any[];
  const hasAttachments = msgTableInfo.some(col => col.name === 'attachments_json');
  if (!hasAttachments) {
    db.exec("ALTER TABLE messages ADD COLUMN attachments_json TEXT NOT NULL DEFAULT '[]'");
  }
} catch (e) {
  console.warn('Migration warning (expected if columns already exist):', e);
}

