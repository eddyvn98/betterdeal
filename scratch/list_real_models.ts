import 'dotenv/config';
import { ai } from '../server/ai';

async function listAllModels() {
  try {
    const response = await (ai as any).models.list({
      config: { pageSize: 50 }
    });
    
    console.log('Available Models:');
    for await (const model of response) {
      console.log(`- ${model.name} (Methods: ${(model.supportedMethods || []).join(', ')})`);
    }
  } catch (error: any) {
    console.error('Error listing models:', error.message);
  }
}

listAllModels();
