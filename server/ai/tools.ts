import { Tool, Type } from '@google/genai';

/**
 * Hàm hỗ trợ trích xuất nội dung từ HTML thô
 * Lọc bỏ các tag script, style và lấy text chính yếu
 */
function cleanHtml(html: string): string {
  // Loại bỏ các tag không cần thiết
  let clean = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, '');
  clean = clean.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gmi, '');
  clean = clean.replace(/<svg\b[^>]*>([\s\S]*?)<\/svg>/gmi, '');
  clean = clean.replace(/<footer\b[^>]*>([\s\S]*?)<\/footer>/gmi, '');
  clean = clean.replace(/<nav\b[^>]*>([\s\S]*?)<\/nav>/gmi, '');
  
  // Trích xuất tiêu đề và meta description nếu có
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : '';
  
  const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  const description = metaMatch ? metaMatch[1] : '';

  // Loại bỏ phần còn lại của các tag HTML
  clean = clean.replace(/<[^>]+>/g, ' ');
  
  // Dọn dẹp khoảng trắng
  clean = clean.replace(/\s+/g, ' ').trim();
  
  return `TITLE: ${title}\nDESCRIPTION: ${description}\n\nCONTENT SUMMARY: ${clean.substring(0, 5000)}`;
}

import { advancedBrowse } from './browsing';

/**
 * Tool truy cập Website nâng cao (Hỗ trợ JS và Chụp ảnh)
 */
export async function browse_url(url: string): Promise<any> {
  const start = Date.now();
  console.log(`[${new Date().toLocaleTimeString()}] [TOOL-CALL] browse_url (PRO) start: ${url}`);
  
  try {
    const result = await advancedBrowse(url);
    console.log(`[${new Date().toLocaleTimeString()}] [TOOL-CALL] browse_url (PRO) success (${Date.now() - start}ms)`);
    return result;
  } catch (error: any) {
    console.error(`[${new Date().toLocaleTimeString()}] [TOOL-CALL] browse_url (PRO) FAILED:`, error.message);
    return { error: error.message };
  }
}

/**
 * Định nghĩa Tool cho Gemini
 */
export const browsingTools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "browse_url",
        description: "Fetches and returns the text content of a given URL. Use this tool when the user provides a link to a website (e.g., a competitor site, a reference site, or their current site) and you need to understand its content, design, or features to provide a better consultation or quote.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            url: {
              type: Type.STRING,
              description: "The full URL of the website to browse (must include http:// or https://)."
            }
          },
          required: ["url"]
        }
      }
    ]
  }
];

/**
 * Định nghĩa Tool cho OpenAI / DeepSeek
 */
export const openAIBrowsingTools = [
  {
    type: "function",
    function: {
      name: "browse_url",
      description: "Fetches and returns the text content of a given URL. Use this tool when the user provides a link to a website and you need to understand its content, design, or features.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The full URL of the website to browse (must include http:// or https://)."
          }
        },
        required: ["url"]
      }
    }
  }
];
