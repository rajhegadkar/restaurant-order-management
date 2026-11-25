import type { Plugin } from 'vite';
import { createSyncMiddleware } from './syncMiddleware.mjs';

export function syncPlugin(): Plugin {
  const middleware = createSyncMiddleware();

  return {
    name: 'vite-plugin-sync-server',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
