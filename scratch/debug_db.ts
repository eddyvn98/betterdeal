import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = 'd:/porfolio/data/leads.sqlite';
console.log('Using DB at:', dbPath);
const db = new DatabaseSync(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any[];
console.log('Tables found:', tables.map(t => t.name).join(', '));

if (tables.some(t => t.name === 'leads')) {
    const rows = db.prepare("SELECT admin_summary, estimated_quote, project_summary FROM leads").all() as any[];
    console.log('Total leads found:', rows.length);
    rows.forEach((row, i) => {
        console.log(`\n--- Lead ${i + 1} ---`);
        console.log('Quote:', row.estimated_quote);
        console.log('Summary:', row.project_summary);
        console.log('Admin Calculation:', row.admin_summary);
    });
} else {
    console.log('Table "leads" does not exist.');
}
