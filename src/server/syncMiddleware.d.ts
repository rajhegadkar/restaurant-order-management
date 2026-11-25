import type { IncomingMessage, ServerResponse } from 'http';

export function createSyncMiddleware(
  customDataDir?: string
): (req: IncomingMessage, res: ServerResponse, next: () => void) => void | Promise<void>;
