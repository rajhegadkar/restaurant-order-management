import fs from 'fs';
import path from 'path';

/**
 * Shared real-time restaurant state middleware for Vite dev/preview and standalone Node production server.
 * Persists orders, tables, and restaurant settings in DATA_DIR/live_state.json.
 */
export function createSyncMiddleware(customDataDir) {
  const dataDir = customDataDir || process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
  const dbFile = path.resolve(dataDir, 'live_state.json');

  function ensureDb() {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dbFile)) {
      const initialDb = {
        orders: [],
        tables: [],
        lastUpdated: Date.now(),
      };
      fs.writeFileSync(dbFile, JSON.stringify(initialDb, null, 2), 'utf-8');
    }
  }

  function readDb() {
    ensureDb();
    try {
      const content = fs.readFileSync(dbFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { orders: [], tables: [], settings: null, lastUpdated: Date.now() };
    }
  }

  function writeDb(data) {
    ensureDb();
    data.lastUpdated = Date.now();
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
  }

  function readJsonBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (err) {
          reject(err);
        }
      });
      req.on('error', reject);
    });
  }

  ensureDb();

  return async (req, res, next) => {
    const url = req.url || '';

    // Only handle /api/* routes directly; allow SPA/static handlers to handle everything else
    if (!url.startsWith('/api')) {
      next();
      return;
    }

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    // Health check endpoint (used by Render / Railway / Fly / Docker)
    if (url.startsWith('/api/health') && req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          status: 'ok',
          server: 'Savoria LAN Sync Server',
          storageDir: dataDir,
          timestamp: Date.now(),
        })
      );
      return;
    }

    // Full state sync
    if (url.startsWith('/api/sync') && req.method === 'GET') {
      const db = readDb();
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify(db));
      return;
    }

    // Place new order
    if (url === '/api/orders' || (url.startsWith('/api/orders?') && req.method === 'POST')) {
      if (req.method === 'POST') {
        try {
          const payload = await readJsonBody(req);
          const newOrder = payload.order || payload;
          const db = readDb();

          const existingIdx = db.orders.findIndex(
            (o) => o.id === newOrder.id || o.order_number === newOrder.order_number
          );
          if (existingIdx > -1) {
            db.orders[existingIdx] = newOrder;
          } else {
            db.orders = [newOrder, ...db.orders];
          }

          if (newOrder.order_type === 'dine_in' && newOrder.table_id) {
            db.tables = db.tables.map((t) =>
              t.id === newOrder.table_id || t.table_number === newOrder.table_number
                ? {
                    ...t,
                    status: 'occupied',
                    active_order_id: newOrder.order_number,
                    active_order_total: newOrder.total_amount,
                  }
                : t
            );
          }

          writeDb(db);
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 201;
          res.end(JSON.stringify({ success: true, order: newOrder }));
        } catch (err) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 400;
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }
    }

    // Update order status / payment
    if (url.startsWith('/api/orders/') && req.method === 'PATCH') {
      const id = decodeURIComponent(url.split('/api/orders/')[1]?.split('?')[0] || '');
      try {
        const updates = await readJsonBody(req);
        const db = readDb();
        db.orders = db.orders.map((o) =>
          o.id === id || o.order_number === id
            ? { ...o, ...updates, updated_at: new Date().toISOString() }
            : o
        );
        writeDb(db);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 400;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // Sync or update table list
    if (url.startsWith('/api/tables') && req.method === 'POST') {
      try {
        const payload = await readJsonBody(req);
        const db = readDb();
        if (Array.isArray(payload.tables)) {
          db.tables = payload.tables;
        } else if (payload.table) {
          const idx = db.tables.findIndex((t) => t.id === payload.table.id);
          if (idx > -1) {
            db.tables[idx] = payload.table;
          } else {
            db.tables.push(payload.table);
          }
        }
        writeDb(db);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 400;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // Update single table status
    if (url.startsWith('/api/tables/') && req.method === 'PATCH') {
      const id = decodeURIComponent(url.split('/api/tables/')[1]?.split('?')[0] || '');
      try {
        const updates = await readJsonBody(req);
        const db = readDb();
        db.tables = db.tables.map((t) =>
          t.id === id || t.table_number === id ? { ...t, ...updates } : t
        );
        writeDb(db);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 400;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // Update restaurant settings
    if (url.startsWith('/api/settings') && (req.method === 'POST' || req.method === 'PATCH')) {
      try {
        const payload = await readJsonBody(req);
        const updates = payload.settings || payload;
        const db = readDb();
        db.settings = { ...(db.settings || {}), ...updates };
        writeDb(db);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, settings: db.settings }));
      } catch (err) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 400;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    next();
  };
}
