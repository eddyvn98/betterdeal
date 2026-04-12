import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function testModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY');
    return;
  }

  const genAI = new GoogleGenAI({ apiKey });
  const modelName = 'models/gemma-4-31b-it';
  const { buildSystemInstruction } = await import('../server/ai/prompts');
  const systemPrompt = buildSystemInstruction(0);

  console.log(`Testing model: ${modelName} with REAL System Instruction...`);

  try {
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: 'I want to build a simple landing page for my new gym business' }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      }
    });

    console.log('--- RAW AI RESPONSE START ---');
    console.log(response.text);
    console.log('--- RAW AI RESPONSE END ---');
  } catch (error: any) {
    console.error('API Error details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

testModel();
