import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY');
    return;
  }

  const genAI = new GoogleGenAI({ apiKey });
  
  try {
    // Note: The @google/genai SDK might not have a direct listModels, 
    // but we can try to find it or use the REST API.
    // However, some versions have it under genAI.models.list()
    
    console.log("Fetching models...");
    // If the SDK doesn't support it, we'll try a common one
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-exp'];
    
    for (const model of models) {
        try {
            const m = genAI.getGenerativeModel({ model });
            console.log(`Model ${model} exists.`);
        } catch (e) {
            console.log(`Model ${model} NOT available.`);
        }
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

listModels();
