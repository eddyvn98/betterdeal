# AI Model Project Rules

## 1. AI Model Standards
- **ACTIVE MODEL:** **Gemma 4 26B-A4B**. 
- **LEGACY STANDARDS:** Guaranteed minimum model version was Gemini 2.5 Flash. Models below Gemini 2.5 Flash remain strictly prohibited.
- **RESTRICTION:** Gemini 2.5 Flash configuration is currently **LOCKED** and preserved in `server/ai/provider.ts` for emergency rollback only.

## 2. Configuration (Gemma 4)
- **Thinking Mode:** Explicitly **DISABLED** (`thinkingBudget: 0`) for the sales consultant role to ensure direct, fast, and deterministic responses.
- **Context Window:** Leveraging up to 256k tokens for complex lead qualification and RAG.

## 3. Technical Constraints (Free Tier)
- **Context Caching:** Disabled. The current Free Tier does not support `CachedContent` storage (Quota limit = 0).
- **Rate Limits:** Be mindful of the 429 Resource Exhausted errors.

## 4. Knowledge Base (RAG)
- Uses `models/gemini-embedding-001` for semantic search.
- Pre-sales scenarios are stored in `server/data/knowledge_base.json`.
