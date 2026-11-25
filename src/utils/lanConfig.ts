// Utilities for LAN network resolution and Table QR code URLs
import { RestaurantTable } from '../types';

export const DEFAULT_LAN_IP = '192.168.1.128';
export const DEFAULT_LAN_PORT = '5173';
export const DEFAULT_LAN_URL = `http://${DEFAULT_LAN_IP}:${DEFAULT_LAN_PORT}`;

/**
 * Returns the effective base URL for customer QR codes and mobile access.
 * If the current browser is accessing via a non-localhost host (like 192.168.x.x, domain, etc.),
 * it uses window.location.origin.
 * If accessing via localhost/127.0.0.1, it resolves to the configured LAN host or DEFAULT_LAN_URL
 * so printed QR codes and shared links work on external smartphones.
 */
export const getEffectiveLanUrl = (configuredLanHost?: string): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '::1') {
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
 * Formats a table ordering URL using the effective LAN URL or provided base URL.
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
 * Resolves a table's QR URL to guarantee it points to an accessible LAN address
 * even if stored as localhost originally.
 */
export const getDisplayTableQRUrl = (
  table: RestaurantTable,
  configuredLanHost?: string
): string => {
  if (!table) return '';
  
  // If the stored URL already has a token and table param, we can normalize the host
  const effectiveBase = getEffectiveLanUrl(configuredLanHost);
  
  // If stored URL points to localhost or 127.0.0.1, rewrite the origin
  if (table.qr_code_url && (table.qr_code_url.includes('localhost') || table.qr_code_url.includes('127.0.0.1'))) {
    return formatTableQRUrl(table.table_number, table.qr_token, effectiveBase);
  }

  return table.qr_code_url || formatTableQRUrl(table.table_number, table.qr_token, effectiveBase);
};
