# Stage 1: Install dependencies with retries (network-safe)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN sh -lc "for i in 1 2 3; do npm ci --no-audit --no-fund && exit 0; echo \"npm ci failed (attempt $i), retrying...\"; sleep 5; done; exit 1"

# Stage 2: Build UI assets
FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build

# Stage 3: Runtime
# Reuse the deps layer directly so Docker does not spend minutes copying node_modules
FROM deps AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY . .
COPY --from=builder /app/dist ./dist

EXPOSE 8787

# Run API server as a single process in container (avoid watch-mode multi-process locks)
CMD ["node", "node_modules/tsx/dist/cli.mjs", "server/index.ts"]
