import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function syncPlugin(): Plugin {
  const dataDir = path.resolve(process.cwd(), 'data');
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

  function readDb(): { orders: any[]; tables: any[]; settings?: any; lastUpdated: number } {
    ensureDb();
    try {
      const content = fs.readFileSync(dbFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { orders: [], tables: [], settings: null, lastUpdated: Date.now() };
    }
  }

  function writeDb(data: any) {
    ensureDb();
    data.lastUpdated = Date.now();
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
  }

  function attachSyncMiddleware(middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void }) {
    ensureDb();

    middlewares.use((req, res, next) => {
      const url = req.url || '';

        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        // Health check
        if (url === '/api/health' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ status: 'ok', server: 'Savoria LAN Sync Server' }));
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
        if (url.startsWith('/api/orders') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const newOrder = payload.order || payload;
              const db = readDb();

              // Prepend new order if not already in list
              const existingIdx = db.orders.findIndex((o: any) => o.id === newOrder.id || o.order_number === newOrder.order_number);
              if (existingIdx > -1) {
                db.orders[existingIdx] = newOrder;
              } else {
                db.orders = [newOrder, ...db.orders];
              }

              // If dine-in, update table status on the server
              if (newOrder.order_type === 'dine_in' && newOrder.table_id) {
                db.tables = db.tables.map((t: any) =>
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
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // Update order status
        if (url.startsWith('/api/orders/') && req.method === 'PATCH') {
          const id = url.split('/api/orders/')[1]?.split('?')[0];
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const updates = JSON.parse(body);
              const db = readDb();
              db.orders = db.orders.map((o: any) =>
                o.id === id || o.order_number === id
                  ? { ...o, ...updates, updated_at: new Date().toISOString() }
                  : o
              );
              writeDb(db);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // Sync or update table list
        if (url.startsWith('/api/tables') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const db = readDb();
              if (Array.isArray(payload.tables)) {
                db.tables = payload.tables;
              } else if (payload.table) {
                const idx = db.tables.findIndex((t: any) => t.id === payload.table.id);
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
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // Update single table status
        if (url.startsWith('/api/tables/') && req.method === 'PATCH') {
          const id = url.split('/api/tables/')[1]?.split('?')[0];
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const updates = JSON.parse(body);
              const db = readDb();
              db.tables = db.tables.map((t: any) =>
                t.id === id || t.table_number === id ? { ...t, ...updates } : t
              );
              writeDb(db);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // Update restaurant settings
        if (url.startsWith('/api/settings') && (req.method === 'POST' || req.method === 'PATCH')) {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const updates = payload.settings || payload;
              const db = readDb();
              db.settings = { ...(db.settings || {}), ...updates };
              writeDb(db);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, settings: db.settings }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

      next();
    });
  }

  return {
    name: 'vite-plugin-sync-server',
    configureServer(server) {
      attachSyncMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachSyncMiddleware(server.middlewares);
    },
  };
}
