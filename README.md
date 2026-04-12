<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/cc7759d2-a244-481f-be58-478e6893fded

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Cloudflare performance setup

This project is configured for aggressive edge caching when deployed to Cloudflare Pages.

1. Deploy with `npm run build`.
2. Ensure `public/_headers` is included in deployment output (Cloudflare Pages will apply it automatically).
3. In Cloudflare dashboard, enable:
   - Brotli
   - HTTP/3
   - Early Hints
4. Keep cache behavior:
   - HTML: `must-revalidate` (always fresh)
   - Static assets: `max-age=31536000, immutable` (long edge/browser cache)
