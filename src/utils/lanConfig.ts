// Utilities for LAN & Public Cloud URL resolution and Table QR code URLs
import { RestaurantTable } from '../types';

export const DEFAULT_LAN_IP = '192.168.1.128';
export const DEFAULT_LAN_PORT = '5173';
export const DEFAULT_LAN_URL = `http://${DEFAULT_LAN_IP}:${DEFAULT_LAN_PORT}`;

const PRIVATE_IP_REGEX = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/;

export const isLocalHostname = (hostname: string): boolean => {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
};

export const isPublicCloudHost = (): boolean => {
  if (typeof window === 'undefined') return false;
  const { hostname } = window.location;
  return !isLocalHostname(hostname) && !PRIVATE_IP_REGEX.test(hostname);
};

/**
 * Returns the effective base URL for customer QR codes and mobile access.
 * - On public cloud hosts (e.g. Render, Railway, Fly.io, custom domain) or LAN IPs,
 *   returns window.location.origin.
 * - On localhost/127.0.0.1, resolves to configured LAN host or DEFAULT_LAN_URL
 *   so printed QR codes work across Wi-Fi devices.
 */
export const getEffectiveLanUrl = (configuredLanHost?: string): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (!isLocalHostname(hostname)) {
      return window.location.origin;
    }
  }

  if (configuredLanHost && configuredLanHost.trim()) {
    const trimmed = configuredLanHost.trim();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed.replace(/\/$/, '')
      : `http://${trimmed.replace(/\/$/, '')}`;
  }

  return DEFAULT_LAN_URL;
};

/**
 * Formats a table ordering URL using the effective LAN/Cloud base URL.
 */
export const formatTableQRUrl = (
  tableNumber: string,
  token: string,
  baseUrl?: string
): string => {
  const base = (baseUrl || getEffectiveLanUrl()).replace(/\/$/, '');
  return `${base}/order?table=${encodeURIComponent(tableNumber)}&token=${encodeURIComponent(token)}`;
};

/**
 * Normalizes a table's QR URL so it automatically points to the active cloud origin
 * (e.g. https://your-app.onrender.com) when deployed in the cloud, or LAN IP locally.
 */
export const getDisplayTableQRUrl = (
  table: RestaurantTable,
  configuredLanHost?: string
): string => {
  if (!table) return '';

  const effectiveBase = getEffectiveLanUrl(configuredLanHost);

  if (table.qr_code_url) {
    try {
      const parsed = new URL(table.qr_code_url);
      const storedIsLocal = isLocalHostname(parsed.hostname);
      const storedIsPrivateLan = PRIVATE_IP_REGEX.test(parsed.hostname);

      // Rewrite localhost URLs to LAN/origin, and rewrite private LAN URLs when served from public cloud
      if (storedIsLocal || (isPublicCloudHost() && storedIsPrivateLan)) {
        return formatTableQRUrl(table.table_number, table.qr_token, effectiveBase);
      }
    } catch {
      return formatTableQRUrl(table.table_number, table.qr_token, effectiveBase);
    }
  }

  return table.qr_code_url || formatTableQRUrl(table.table_number, table.qr_token, effectiveBase);
};
