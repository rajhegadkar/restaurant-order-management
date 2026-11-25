import { Order, RestaurantTable, OrderStatus, RestaurantSettings } from '../types';

export const syncClient = {
  /**
   * Fetches latest orders and tables from the shared LAN server.
   */
  async fetchLiveState(): Promise<{ orders: Order[]; tables: RestaurantTable[]; settings?: RestaurantSettings; lastUpdated: number } | null> {
    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Updates restaurant settings on the server.
   */
  async updateSettings(settings: Partial<RestaurantSettings>): Promise<boolean> {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Broadcasts a newly placed order to the server so all dashboards across the LAN receive it.
   */
  async broadcastOrder(order: Order): Promise<boolean> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Updates an order status on the server.
   */
  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Updates an order payment status on the server.
   */
  async updateOrderPayment(orderId: string, paymentStatus: 'pending' | 'completed' | 'failed'): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: paymentStatus }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Updates multiple order fields on the server.
   */
  async updateOrderFields(orderId: string, fields: Partial<Order>): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Updates a table status or active bill on the server.
   */
  async updateTableStatus(tableId: string, updates: Partial<RestaurantTable>): Promise<boolean> {
    try {
      const res = await fetch(`/api/tables/${encodeURIComponent(tableId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Seeds or synchronizes the table list with the server.
   */
  async syncTables(tables: RestaurantTable[]): Promise<boolean> {
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tables }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
