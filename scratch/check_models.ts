import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function checkModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Không tìm thấy GEMINI_API_KEY trong .env');
    return;
  }

  const client = new GoogleGenAI({ apiKey });
  
  try {
    console.log('Đang kiểm tra danh sách model cho Key:', apiKey.substring(0, 10) + '...');
    const response = await client.models.list();
    console.log('Các model Gemma tìm thấy:');
    for await (const model of response) {
      if (model.name.toLowerCase().includes('gemma')) {
        console.log(`- ${model.name} (${model.displayName})`);
      }
    }
    
    console.log('\n--- THỬ NGHIỆM GENERATE CONTENT ---');
    const modelName = 'models/gemma-4-31b-it';
    console.log(`Đang gọi model: ${modelName}`);
    
    const genResponse = await client.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: 'Chào bạn, bạn là ai?' }] }]
    });
    
    console.log('Phản hồi từ AI:', genResponse.text);
  } catch (error: any) {
    console.error('Lỗi khi gọi API:');
    console.error(error.message);
    if (error.details) console.error(JSON.stringify(error.details, null, 2));
  }
}

checkModels();
