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

type WebSearchResult = {
  title: string;
  url: string;
  snippet: string;
  sourceDomain: string;
};

const DEFAULT_WHITELIST = [
  'docs.anthropic.com',
  'platform.openai.com',
  'openai.com',
  'ai.google.dev',
  'cloud.google.com',
  'developers.cloudflare.com',
  'developer.mozilla.org',
  'github.com',
  'docs.n8n.io',
];

const SEARCH_DOMAIN_WHITELIST = String(process.env.SEARCH_DOMAIN_WHITELIST || DEFAULT_WHITELIST.join(','))
  .split(',')
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

function isWhitelistedUrl(rawUrl: string): boolean {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase();
    return SEARCH_DOMAIN_WHITELIST.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

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
 * Tool tìm kiếm web theo từ khóa để cập nhật công nghệ mới.
 */
export async function web_search(query: string): Promise<{ query: string; results: WebSearchResult[] } | { error: string }> {
  const start = Date.now();
  console.log(`[${new Date().toLocaleTimeString()}] [TOOL-CALL] web_search start: ${query}`);

  try {
    const endpoint = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!res.ok) {
      return { error: `Search request failed: ${res.status}` };
    }

    const html = await res.text();
    const parsedResults: WebSearchResult[] = [];
    const regex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>|<div[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/div>)/gim;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null && parsedResults.length < 8) {
      const rawUrl = match[1] || '';
      const title = (match[2] || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const snippetRaw = (match[3] || match[4] || '');
      const snippet = snippetRaw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (!rawUrl || !title) continue;

      let finalUrl = rawUrl;
      try {
        if (rawUrl.startsWith('//duckduckgo.com/l/?')) {
          const wrapped = new URL(`https:${rawUrl}`);
          const uddg = wrapped.searchParams.get('uddg');
          if (uddg) finalUrl = decodeURIComponent(uddg);
        } else if (rawUrl.startsWith('/l/?')) {
          const wrapped = new URL(`https://duckduckgo.com${rawUrl}`);
          const uddg = wrapped.searchParams.get('uddg');
          if (uddg) finalUrl = decodeURIComponent(uddg);
        }
      } catch {
        finalUrl = rawUrl;
      }

      let sourceDomain = '';
      try {
        sourceDomain = new URL(finalUrl).hostname.toLowerCase();
      } catch {
        sourceDomain = '';
      }

      parsedResults.push({
        title,
        url: finalUrl,
        snippet,
        sourceDomain,
      });
    }
    const filteredResults = parsedResults
      .filter((item) => isWhitelistedUrl(item.url))
      .slice(0, 5);

    console.log(
      `[${new Date().toLocaleTimeString()}] [TOOL-CALL] web_search success (${Date.now() - start}ms, ${filteredResults.length}/${parsedResults.length} whitelisted results)`
    );
    return { query, results: filteredResults };
  } catch (error: any) {
    console.error(`[${new Date().toLocaleTimeString()}] [TOOL-CALL] web_search FAILED:`, error.message);
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
      },
      {
        name: "web_search",
        description: "Searches the web for recent information about technologies, tools, and trends. Use this when user mentions a technology or keyword that is new/unknown and no reliable internal context is available.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description: "Search query describing the technology, framework, or topic to research."
            }
          },
          required: ["query"]
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
  },
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Searches the web for recent information about technologies, tools, and trends.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query describing the technology, framework, or topic to research."
          }
        },
        required: ["query"]
      }
    }
  }
];
