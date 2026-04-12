# Gemini AI Project Rules

## 1. AI Model Restriction
- **STRICT REQUIREMENT:** Guaranteed minimum model version is **Gemini 2.5 Flash**.
- **FORBIDDEN:** Using any models below Gemini 2.5 Flash (e.g., 1.5 Flash, 1.0 Pro) is strictly prohibited as per project engineering standards.

## 2. Technical Constraints (Free Tier)
- **Context Caching:** Disabled. The current Free Tier for Gemini 2.5 Flash does not support `CachedContent` storage (Quota limit = 0). Do not attempt to use `ai.caches.create`.
- **Rate Limits:** Be mindful of the 429 Resource Exhausted errors. If quota is exceeded, the server will log the error and wait for the cooldown period.

## 3. Knowledge Base (RAG)
- Uses `models/gemini-embedding-001` for semantic search.
- Pre-sales scenarios are stored in `server/data/knowledge_base.json`.
