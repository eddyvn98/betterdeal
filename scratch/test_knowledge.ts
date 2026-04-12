import 'dotenv/config';
import { initKnowledgeBase, searchKnowledge } from '../server/ai/knowledge';

async function testRAG() {
  console.log('--- START KNOWLEDGE BASE TEST ---');
  
  // 1. Khởi tạo
  await initKnowledgeBase();

  const testQueries = [
    'Giá của bạn cao quá, bên khác báo rẻ hơn nhiều',
    'Tôi muốn làm web bằng wordpress cho rẻ',
    'Dự án này có được giảm giá không bạn?',
  ];

  for (const query of testQueries) {
    console.log(`\n\n[USER QUERY]: "${query}"`);
    const results = await searchKnowledge(query);
    
    if (results.length > 0) {
      console.log(`[FOUND ${results.length} RELEVANT SCENARIOS]:`);
      results.forEach((res, i) => {
        console.log(`\n  --- SCENARIO ${i + 1} ---`);
        console.log(`  Question: ${res.question}`);
        console.log(`  Answer Template: ${res.answer.substring(0, 100)}...`);
      });
    } else {
      console.log('[NO RELEVANT KNOWLEDGE FOUND]');
    }
  }

  console.log('\n--- TEST COMPLETE ---');
}

testRAG().catch(console.error);
