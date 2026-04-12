import { db } from '../server/db';

const lastMessages = db.prepare('SELECT id, session_id, role, content, created_at FROM messages ORDER BY id DESC LIMIT 5').all();
console.log('--- LAST 5 MESSAGES ---');
console.log(JSON.stringify(lastMessages, null, 2));

const lastLeads = db.prepare('SELECT session_id, project_summary, admin_summary, updated_at FROM leads ORDER BY updated_at DESC LIMIT 5').all();
console.log('\n--- LAST 5 LEADS ---');
console.log(JSON.stringify(lastLeads, null, 2));
