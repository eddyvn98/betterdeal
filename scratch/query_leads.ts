import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve('d:/porfolio/server/data/leads.sqlite');
const db = new DatabaseSync(dbPath);

const rows = db.prepare("SELECT admin_summary, estimated_quote FROM leads WHERE estimated_quote LIKE '%140.000.000%'").all() as any[];

console.log('Found rows:', rows.length);
rows.forEach((row, i) => {
  console.log(`--- Row ${i + 1} ---`);
  console.log('Quote:', row.estimated_quote);
  console.log('Admin Summary:', row.admin_summary);
});
