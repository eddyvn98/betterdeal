import fs from 'fs';
import path from 'path';
import { ai } from '../ai';
import { db } from '../db';
import { getLead } from '../leadStore';
import { leadToMarkdown } from './formatter';

// Định nghĩa cấu trúc tri thức
interface KnowledgeItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  embedding?: number[];
}

// Đường dẫn file tri thức
const KB_PATH = path.join(process.cwd(), 'server/data/knowledge_base.json');

// Biến lưu trữ tri thức trong bộ nhớ
let knowledgeBase: KnowledgeItem[] = [];

/**
 * Tính toán độ tương đồng Cosine giữa 2 vector
 */
function cosineSimilarity(vecA: number[], vecB: number[]) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}

/**
 * Tạo embedding cho một văn bản
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const start = Date.now();
  try {
    console.log(`[${new Date().toLocaleTimeString()}] [API-CALL] Embedding start: "${text.substring(0, 30)}..."`);
    const result = await (ai as any).models.embedContent({
      model: 'models/gemini-embedding-001',
      contents: [{
        parts: [{ text }]
      }]
    });
    console.log(`[${new Date().toLocaleTimeString()}] [API-CALL] Embedding success (${Date.now() - start}ms)`);
    return result.embeddings[0].values;
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] [API-CALL] Embedding FAILED (${Date.now() - start}ms):`, error);
    return [];
  }
}

/**
 * Khởi tạo tri thức (tạo embedding nếu chưa có)
 */
export async function initKnowledgeBase() {
  if (!fs.existsSync(KB_PATH)) {
    console.warn('Knowledge base file not found:', KB_PATH);
    return;
  }

  const raw = fs.readFileSync(KB_PATH, 'utf-8');
  knowledgeBase = JSON.parse(raw);

  console.log(`[${new Date().toLocaleTimeString()}] Initializing Knowledge Base (${knowledgeBase.length} items)...`);

  let count = 0;
  for (const item of knowledgeBase) {
    if (!item.embedding || item.embedding.length === 0) {
      item.embedding = await generateEmbedding(item.question);
      count++;
    }
  }

  if (count > 0) {
    // Lưu lại file với embedding ngay lập tức
    try {
      fs.writeFileSync(KB_PATH, JSON.stringify(knowledgeBase, null, 2));
      console.log(`[${new Date().toLocaleTimeString()}] [SYSTEM] Saved ${count} new embeddings to ${KB_PATH}`);
    } catch (e) {
      console.error('Failed to save knowledge base:', e);
    }
  }
}

/**
 * Tìm kiếm các kịch bản liên quan nhất
 */
export async function searchKnowledge(query: string, limit: number = 2) {
  if (knowledgeBase.length === 0) await initKnowledgeBase();

  const queryEmbedding = await generateEmbedding(query);
  if (queryEmbedding.length === 0) return [];

  const results = knowledgeBase
    .map(item => ({
      ...item,
      score: item.embedding ? cosineSimilarity(queryEmbedding, item.embedding) : 0
    }))
    .sort((a, b) => b.score - a.score)
    .filter(item => item.score > 0.6) // Ngưỡng tương đồng
    .slice(0, limit);

  return results.map(item => ({
    question: item.question,
    answer: item.answer,
    category: item.category
  }));
}

/**
 * Tìm kiếm các kinh nghiệm thực tế từ các Lead đã chốt
 */
export async function searchExperience(query: string, limit: number = 2) {
  const queryEmbedding = await generateEmbedding(query);
  if (queryEmbedding.length === 0) return [];

  // Lấy danh sách các lead đã được đánh dấu là kinh nghiệm dùng chung
  const rows = db.prepare('SELECT session_id, project_summary, project_type, estimated_quote, experience_embedding FROM leads WHERE is_shared_experience = 1 AND experience_embedding IS NOT NULL').all() as any[];
  
  const results = rows
    .map(row => {
      let embedding: number[] = [];
      try {
        embedding = JSON.parse(row.experience_embedding);
      } catch (e) {
        return { ...row, score: 0 };
      }
      
      return {
        ...row,
        score: cosineSimilarity(queryEmbedding, embedding)
      };
    })
    .sort((a, b) => b.score - a.score)
    .filter(item => item.score > 0.75) // Ngưỡng tương đồng cho kinh nghiệm (khắt khe hơn)
    .slice(0, limit);

  return results
    .filter(item => typeof item.session_id === 'string' && item.session_id.length > 0)
    .map(item => {
      const lead = getLead(item.session_id);
      return leadToMarkdown(lead, item.session_id);
    });
}

/**
 * Build chuỗi Context từ kết quả search kiến thức
 */
export function buildKnowledgeContext(searchResults: { question: string, answer: string }[], experienceResults: string[] = []) {
  const contexts = [];

  if (searchResults.length > 0) {
    contexts.push(
      '--- START OF INTERNAL KNOWLEDGE BASE REFERENCES ---',
      'Use the following approved sales strategies/templates if relevant to the client concern:',
      ...searchResults.map(res => `CLIENT CONCERN: "${res.question}"\nAPPROVED RESPONSE TEMPLATE: "${res.answer}"`),
      '--- END OF KNOWLEDGE BASE REFERENCES ---'
    );
  }

  if (experienceResults.length > 0) {
    contexts.push(
      '--- START OF SIMILAR PAST PROJECTS (CASE STUDIES) ---',
      'Following are detailed technical dossiers of similar projects we have delivered. Use these as high-quality references for features, tech stacks, and pricing consistency:',
      ...experienceResults,
      '--- END OF SIMILAR PAST PROJECTS ---'
    );
  }

  return contexts.length > 0 ? contexts.join('\n\n') + '\n' : '';
}
