# Multi-stage Dockerfile for Render, Fly.io, Railway, Cloud Run, and VPS
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5173

COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY server.mjs ./
COPY src/server/syncMiddleware.mjs ./src/server/syncMiddleware.mjs

RUN mkdir -p /app/data

EXPOSE 5173
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5173) + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.mjs"]
