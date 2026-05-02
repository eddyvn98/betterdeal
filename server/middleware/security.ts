import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Express } from 'express';

export const setupSecurity = (app: Express) => {
  // 1. Basic security headers with relaxed CSP for external tools
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com", "https://static.cloudflareinsights.com"],
        "frame-src": ["'self'", "https://challenges.cloudflare.com"],
        "connect-src": ["'self'", "https://*.workers.dev", "https://*.vivutrade.io.vn", "https://*.cloudflare.com", "https://static.cloudflareinsights.com", "https://pixelpro.vivutrade.io.vn"],
        "img-src": ["'self'", "data:", "https://images.unsplash.com", "https://*.vivutrade.io.vn", "https://*.cloudflare.com"]
      }
    }
  }));

  // 2. Loose CORS for flexibility
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // 3. Rate limiting for API
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  });

  app.use('/api/', limiter);

  // 4. Stricter rate limit for chat
  const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per minute
    message: { error: 'Chat frequency exceeded. Please slow down.' }
  });
  app.use('/api/chat', chatLimiter);
};
