#!/usr/bin/env node
/**
 * Standalone Production Server for Render, Railway, Fly.io, Heroku, Docker, and Local LAN.
 * Uses only Node built-in modules (no devDependencies required at runtime).
 * - Binds 0.0.0.0:$PORT (defaults to 5173 locally)
 * - Serves /api/* live restaurant synchronization endpoints
 * - Serves pre-built static assets from ./dist with React Router SPA fallback
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSyncMiddleware } from './src/server/syncMiddleware.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 5173;
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.resolve(__dirname, 'dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

if (!fs.existsSync(INDEX_HTML)) {
  console.error('[ERROR] Production build missing (dist/index.html not found).');
  console.error('Run "npm run build" first before starting server.mjs.');
  process.exit(1);
}

const syncMiddleware = createSyncMiddleware();

function serveStaticOrSpa(req, res) {
  const urlPath = (req.url || '/').split('?')[0];
  let safeRelPath;
  try {
    safeRelPath = decodeURIComponent(urlPath).replace(/^\/+/, '');
  } catch {
    res.statusCode = 400;
    res.end('Bad Request');
    return;
  }

  const candidatePath = path.resolve(DIST_DIR, safeRelPath);

  // Prevent path traversal outside DIST_DIR
  if (candidatePath.startsWith(DIST_DIR) && fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
    const ext = path.extname(candidatePath).toLowerCase();
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    if (safeRelPath.startsWith('assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
    res.statusCode = 200;
    fs.createReadStream(candidatePath).pipe(res);
    return;
  }

  // Fallback to index.html for React Router SPA routes (/menu, /admin/orders, /order?table=...)
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.statusCode = 200;
  fs.createReadStream(INDEX_HTML).pipe(res);
}

const server = http.createServer((req, res) => {
  syncMiddleware(req, res, () => {
    if (res.writableEnded) return;
    if (req.url?.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
      return;
    }
    serveStaticOrSpa(req, res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n============================================================`);
  console.log(`  Restaurant Ordering Server Ready`);
  console.log(`  Listening: http://${HOST}:${PORT}`);
  console.log(`  Health:    http://localhost:${PORT}/api/health`);
  console.log(`============================================================\n`);
});
