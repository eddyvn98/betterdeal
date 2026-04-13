import { Request, Response } from 'express';
import { ai, normalizeChallengeResponse, DEFAULT_MODEL, DEFAULT_GEN_CONFIG } from './ai';
import { searchKnowledge, searchExperience, buildKnowledgeContext } from './ai/knowledge';
import { buildSystemInstruction } from './ai/prompts';

/**
 * Handler xử lý yêu cầu báo giá từ các hệ thống bên ngoài
 */
export const handleExternalQuote = async (req: Request, res: Response) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.EXTERNAL_API_KEY;

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
  }

  const { customerRequest, lang = 'vi' } = req.body as {
    customerRequest?: string;
    lang?: string;
  };

  if (!customerRequest) {
    return res.status(400).json({ error: 'customerRequest is required' });
  }

  try {
    const startTime = Date.now();
    console.log(`[${new Date().toLocaleTimeString()}] [EXTERNAL-API] Processing requested from external source...`);

    // 1. RAG: Tìm kiếm tri thức liên quan tới yêu cầu
    const [relevantKB, relevantExp] = await Promise.all([
      searchKnowledge(customerRequest),
      searchExperience(customerRequest)
    ]);
    const kbContext = buildKnowledgeContext(relevantKB, relevantExp);

    // 2. Chuẩn bị Prompt
    // Sử dụng System Instruction tiêu chuẩn nhưng bổ sung ngữ cảnh "External API"
    const baseSystemInstruction = buildSystemInstruction(0, lang);
    const apiInstruction = `
--- EXTERNAL API CONTEXT ---
You are receiving this request via an external API. 
The input below is a raw message from a potential customer.
Your task:
1. Thoroughly analyze and EXTRACT the technical requirements from the raw text.
2. Act as Emdash (Sales Consultant) to provide a professional quote and reply.
3. Your reply should be formatted as if you are responding to them for the first time.
4. Ensure all extracted data is accurately reflected in the 'lead' object.
`;

    const fullSystemInstruction = `${baseSystemInstruction}\n\n${apiInstruction}`;

    // 3. Gọi AI
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [
        { role: 'user', parts: [{ text: `KNOWLEDGE BASE:\n${kbContext}\n\nCUSTOMER REQUEST:\n"${customerRequest}"` }] }
      ],
      config: {
        ...DEFAULT_GEN_CONFIG,
        systemInstruction: fullSystemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '';
    const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`[${new Date().toLocaleTimeString()}] [EXTERNAL-API] Success (${responseTime}s)`);

    // 4. Chuẩn hóa và trả về kết quả
    const parsed = normalizeChallengeResponse(rawText);

    return res.json({
      success: true,
      responseTime: `${responseTime}s`,
      data: parsed
    });

  } catch (error) {
    console.error('[EXTERNAL-API] Error:', error);
    return res.status(500).json({
      error: 'AI system encountered an error while processing external request.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
