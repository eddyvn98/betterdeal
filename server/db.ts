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
    attachments_json TEXT NOT NULL DEFAULT '[]',
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

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    project_summary TEXT NOT NULL,
    total_amount INTEGER NOT NULL DEFAULT 0,
    paid_amount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    progress_step INTEGER NOT NULL DEFAULT 0,
    manual_priority_score INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    provider_transaction_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'matched',
    bank_ref TEXT,
    payer_name TEXT,
    created_at TEXT NOT NULL,
    raw_payload TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );
`);

// Migration logic for existing database
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

  // Backfill legacy orders with broken total_amount (e.g. 1, 2, 100 from old parser)
  const USD_TO_VND_RATE = 26500;
  const lowAmountOrders = db.prepare(`
    SELECT o.id, o.session_id, o.total_amount, l.estimated_quote, l.budget
    FROM orders o
    LEFT JOIN leads l ON l.session_id = o.session_id
    WHERE o.total_amount > 0 AND o.total_amount < 100000
  `).all() as any[];

  const detectOptionAmount = (text: string): number => {
    const normalized = String(text || '').toLowerCase();
    if (/\b(option\s*1|opt\s*1|lite|gói\s*1)\b/i.test(normalized)) return 7000000;
    if (/\b(option\s*2|opt\s*2|standard|gói\s*2)\b/i.test(normalized)) return 12000000;
    if (/\b(option\s*3|opt\s*3|elite|gói\s*3)\b/i.test(normalized)) return 40000000;
    return 0;
  };

  const roundVND = (amount: number): number => {
    return Math.round(amount / 50000) * 50000;
  };

  const roundUSD = (amount: number): number => {
    return Math.round(amount * 2) / 2;
  };

  const parseNumericAmount = (raw: string): number => {
    const cleaned = String(raw || '').replace(/[^0-9.,]/g, '');
    if (!cleaned) return 0;
    const normalized = cleaned.includes('.') && cleaned.includes(',')
      ? cleaned.replace(/,/g, '')
      : cleaned.replace(/,/g, '.');
    const amount = Number.parseFloat(normalized);
    return Number.isFinite(amount) ? amount : 0;
  };

  const parseAmountFromText = (text: string): number => {
    const normalizedText = String(text || '');
    if (!normalizedText.trim()) return 0;
    const optionAmount = detectOptionAmount(normalizedText);
    if (optionAmount > 0) return optionAmount;

    const containsUsd = /\$|\busd\b/i.test(normalizedText);
    let amount = parseNumericAmount(normalizedText);
    if (amount <= 0) return 0;
    
    if (containsUsd) {
      amount = roundUSD(amount);
      return Math.round(amount * USD_TO_VND_RATE);
    }
    
    return roundVND(amount);
  };

  const updateOrderAmountStmt = db.prepare('UPDATE orders SET total_amount = ?, updated_at = ? WHERE id = ?');
  for (const row of lowAmountOrders) {
    const inferredFromQuote = parseAmountFromText(String(row.estimated_quote || ''));
    const inferredFromBudget = parseAmountFromText(String(row.budget || ''));
    const inferred = inferredFromQuote || inferredFromBudget;
    if (inferred >= 100000) {
      updateOrderAmountStmt.run(inferred, new Date().toISOString(), row.id);
    }
  }
} catch (e) {
  console.warn('Migration warning:', e);
}
