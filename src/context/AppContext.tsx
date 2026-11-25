import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Category,
  MenuItem,
  RestaurantTable,
  Order,
  CartItem,
  Coupon,
  Customer,
  RestaurantSettings,
  AdminUser,
  AddOnOption,
  OrderStatus,
  TableStatus,
  PaymentStatus,
} from '../types';
import {
  initialSettings,
  initialCategories,
  initialMenuItems,
  initialTables,
  initialCoupons,
  initialCustomers,
  initialOrders,
} from '../data/initialData';
import { generateId, generateOrderNumber, generateToken } from '../lib/utils';
import { playChime } from '../components/common/SoundNotification';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getEffectiveLanUrl, formatTableQRUrl, DEFAULT_LAN_URL } from '../utils/lanConfig';
import { syncClient } from '../lib/lanApi';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  // Restaurant Settings
  settings: RestaurantSettings;
  updateSettings: (newSettings: Partial<RestaurantSettings>) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Menu Items
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;

  // Tables & QR LAN
  tables: RestaurantTable[];
  lanUrl: string;
  resyncAllTablesToLan: (customLanUrl?: string) => void;
  addTable: (table: Omit<RestaurantTable, 'id' | 'qr_code_url' | 'qr_token' | 'created_at'>) => RestaurantTable;
  updateTable: (id: string, updates: Partial<RestaurantTable>) => void;
  deleteTable: (id: string) => void;
  updateTableStatus: (id: string, status: TableStatus) => void;
  regenerateTableQR: (id: string) => RestaurantTable | null;

  // Active Dine-In Table Context (from QR Scan)
  activeTable: RestaurantTable | null;
  setActiveTableByParams: (tableNumber: string, token?: string) => { success: boolean; message: string };
  clearActiveTable: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, selectedAddons?: AddOnOption[], quantity?: number, specialInstructions?: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartDeliveryFee: number;
  cartTax: number;
  cartTotal: number;

  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  updateOrderPaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => void;
  cancelOrder: (orderId: string) => void;
  getOrderById: (orderIdOrNumber: string) => Order | undefined;

  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;

  // Customers
  customers: Customer[];

  // Admin Auth
  adminUser: AdminUser | null;
  loginAdmin: (email: string, pass: string) => boolean;
  logoutAdmin: () => void;

  // Toast Notifications
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'savoria_settings',
  CATEGORIES: 'savoria_categories',
  MENU_ITEMS: 'savoria_menu_items',
  TABLES: 'savoria_tables',
  ORDERS: 'savoria_orders',
  COUPONS: 'savoria_coupons',
  CUSTOMERS: 'savoria_customers',
  CART: 'savoria_cart',
  APPLIED_COUPON: 'savoria_applied_coupon',
  ACTIVE_TABLE: 'savoria_active_table',
  ADMIN_USER: 'savoria_admin_user',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Settings
  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const currency = (!parsed.currency_symbol || parsed.currency_symbol === '$') ? '₹' : parsed.currency_symbol;
        return {
          ...initialSettings,
          ...parsed,
          currency_symbol: currency,
          lan_host: parsed.lan_host || initialSettings.lan_host,
          delivery_fee: parsed.delivery_fee && parsed.delivery_fee < 10 ? 49.00 : (parsed.delivery_fee || 49.00),
          free_delivery_threshold: parsed.free_delivery_threshold && parsed.free_delivery_threshold < 100 ? 499.00 : (parsed.free_delivery_threshold || 499.00),
          min_order_amount: parsed.min_order_amount && parsed.min_order_amount < 50 ? 199.00 : (parsed.min_order_amount || 199.00),
        };
      } catch (e) {
        console.error(e);
      }
    }
    return initialSettings;
  });

  const lanUrl = getEffectiveLanUrl(settings.lan_host);

  // Dynamic Browser Tab / Document Title reflecting restaurant name immediately
  useEffect(() => {
    if (settings.restaurant_name) {
      document.title = `${settings.restaurant_name} | Online Ordering & QR Table Dining`;
    }
  }, [settings.restaurant_name]);

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : initialCategories;
  });

  // Menu Items (with migration of legacy USD prices to INR)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isLegacyUsd = Array.isArray(parsed) && parsed.length > 0 && parsed.every((item: any) => item.price < 50);
        if (!isLegacyUsd) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialMenuItems;
  });

  // Tables
  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TABLES);
    const baseTables = saved ? (JSON.parse(saved) as RestaurantTable[]) : initialTables;
    // Migrate any legacy localhost urls to LAN URL and convert legacy order totals
    return baseTables.map((tbl) => ({
      ...tbl,
      active_order_total: tbl.active_order_total && tbl.active_order_total < 100 ? 1275.75 : tbl.active_order_total,
      qr_code_url: formatTableQRUrl(tbl.table_number, tbl.qr_token, lanUrl),
    }));
  });

  // Active Dine-in Table Context (from QR Code)
  const [activeTable, setActiveTable] = useState<RestaurantTable | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TABLE);
    return saved ? JSON.parse(saved) : null;
  });

  // Orders (with migration of legacy USD orders)
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isLegacyUsd = Array.isArray(parsed) && parsed.length > 0 && parsed.every((o: any) => o.total_amount < 100);
        if (!isLegacyUsd) {
          // Resolve any legacy delivered cash orders to completed
          return (parsed as Order[]).map((o) =>
            o.status === 'delivered' && o.payment_status === 'pending'
              ? { ...o, payment_status: 'completed' }
              : o
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialOrders;
  });

  // Coupons (with migration of legacy USD coupons)
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isLegacyUsd = Array.isArray(parsed) && parsed.length > 0 && parsed.every((c: any) => c.min_order_value < 100);
        if (!isLegacyUsd) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialCoupons;
  });

  // Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPLIED_COUPON);
    return saved ? JSON.parse(saved) : null;
  });

  // Admin User
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
    return saved ? JSON.parse(saved) : null;
  });

  // Toast
  const [toast, setToast] = useState<ToastState | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPLIED_COUPON, JSON.stringify(appliedCoupon));
  }, [appliedCoupon]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TABLE, JSON.stringify(activeTable));
  }, [activeTable]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(adminUser));
  }, [adminUser]);

  // Supabase Real-time listener for orders if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new as Order;
        setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
        playChime('new_order');
        showToast(`New incoming order #${newOrder.order_number}!`, 'info');
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        const updated = payload.new as Order;
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  // Real-Time LAN Network Sync Engine (Multi-Device & Cross-Client Sync)
  useEffect(() => {
    let isMounted = true;

    // Initial sync with LAN server
    syncClient.fetchLiveState().then((state) => {
      if (!isMounted || !state) return;

      if (state.orders) {
        // Push any local orders that the server might not have yet
        const serverIds = new Set(state.orders.map((o) => o.id));
        const missingOnServer = orders.filter((o) => !serverIds.has(o.id));
        if (missingOnServer.length > 0) {
          missingOnServer.forEach((o) => syncClient.broadcastOrder(o));
        }

        if (state.orders.length > 0) {
          setOrders((prev) => {
            const map = new Map<string, Order>();
            prev.forEach((o) => map.set(o.id, o));
            state.orders.forEach((o) => map.set(o.id, o));
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          });
        }
      } else if (orders.length > 0) {
        // Seed server with current baseline orders so mobile clients see them
        orders.forEach((o) => syncClient.broadcastOrder(o));
      }

      if (state.tables && state.tables.length > 0) {
        setTables((prev) =>
          prev.map((localTbl) => {
            const serverTbl = state.tables.find(
              (t) => t.id === localTbl.id || t.table_number === localTbl.table_number
            );
            return serverTbl ? { ...localTbl, ...serverTbl } : localTbl;
          })
        );
      } else if (tables.length > 0) {
        syncClient.syncTables(tables);
      }

      // Initial settings sync
      if (state.settings) {
        setSettings((prev) => ({ ...prev, ...state.settings }));
      } else {
        syncClient.updateSettings(settings);
      }
    });

    // Real-time polling every 2 seconds across all devices on LAN
    const interval = setInterval(async () => {
      if (!isMounted) return;
      const state = await syncClient.fetchLiveState();
      if (!state || !isMounted) return;

      // Check for incoming orders placed by phones or other devices
      if (state.orders && state.orders.length > 0) {
        setOrders((prev) => {
          const prevIds = new Set(prev.map((o) => o.id));
          const newIncoming = state.orders.filter((o) => !prevIds.has(o.id));

          if (newIncoming.length > 0) {
            playChime('new_order');
            const latest = newIncoming[0];
            showToast(
              `🛎️ New Order Received: #${latest.order_number} (${latest.table_number || latest.customer_name || 'Customer'})!`,
              'success'
            );
          }

          let hasChanges = newIncoming.length > 0;
          const merged = prev.map((localOrder) => {
            const serverOrder = state.orders.find((o) => o.id === localOrder.id);
            if (
              serverOrder &&
              (serverOrder.status !== localOrder.status ||
                serverOrder.payment_status !== localOrder.payment_status ||
                serverOrder.updated_at !== localOrder.updated_at)
            ) {
              hasChanges = true;
              return serverOrder;
            }
            return localOrder;
          });

          if (!hasChanges && newIncoming.length === 0) return prev;

          const combined = [...newIncoming, ...merged];
          return combined.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      }

      // Check for table status updates
      if (state.tables && state.tables.length > 0) {
        setTables((prev) => {
          let tablesChanged = false;
          const updated = prev.map((localTbl) => {
            const serverTbl = state.tables.find((t) => t.id === localTbl.id);
            if (
              serverTbl &&
              (serverTbl.status !== localTbl.status ||
                serverTbl.active_order_id !== localTbl.active_order_id ||
                serverTbl.active_order_total !== localTbl.active_order_total)
            ) {
              tablesChanged = true;
              return { ...localTbl, ...serverTbl };
            }
            return localTbl;
          });
          return tablesChanged ? updated : prev;
        });
      }

      // Check for remote restaurant settings updates (e.g. restaurant name or currency changed)
      if (state.settings) {
        setSettings((prev) => {
          if (
            state.settings.restaurant_name !== prev.restaurant_name ||
            state.settings.currency_symbol !== prev.currency_symbol ||
            state.settings.tagline !== prev.tagline ||
            state.settings.delivery_fee !== prev.delivery_fee ||
            state.settings.free_delivery_threshold !== prev.free_delivery_threshold
          ) {
            return { ...prev, ...state.settings };
          }
          return prev;
        });
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Instant Cross-Tab Sync for multiple tabs on the same computer
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.ORDERS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setOrders(parsed);
        } catch {}
      }
      if (e.key === STORAGE_KEYS.TABLES && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setTables(parsed);
        } catch {}
      }
      if (e.key === STORAGE_KEYS.SETTINGS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings(parsed);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Toast Helpers
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: generateId('toast'), message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Settings
  const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      syncClient.updateSettings(updated);
      return updated;
    });
    showToast('Restaurant settings updated successfully!');
  };

  // Categories CRUD
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: generateId('cat'),
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${newCat.name}" created!`, 'success');
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)));
    showToast('Category updated successfully!', 'success');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    showToast('Category deleted.', 'info');
  };

  // Menu Items CRUD
  const addMenuItem = (itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: generateId('item'),
    };
    setMenuItems((prev) => [newItem, ...prev]);
    showToast(`Dish "${newItem.name}" added to menu!`, 'success');
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    showToast('Menu item updated!', 'success');
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Menu item removed.', 'info');
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = !item.is_available;
          showToast(`${item.name} is now ${updated ? 'Available' : 'Unavailable'}`, 'info');
          return { ...item, is_available: updated };
        }
        return item;
      })
    );
  };

  // Table Management & QR Code
  const addTable = (tableData: Omit<RestaurantTable, 'id' | 'qr_code_url' | 'qr_token' | 'created_at'>) => {
    const id = generateId('tbl');
    const token = generateToken('tok');
    const qr_code_url = formatTableQRUrl(tableData.table_number, token, lanUrl);

    const newTable: RestaurantTable = {
      ...tableData,
      id,
      qr_token: token,
      qr_code_url,
      created_at: new Date().toISOString(),
    };

    setTables((prev) => [...prev, newTable]);
    showToast(`Table "${newTable.table_number}" created with unique QR code!`, 'success');
    return newTable;
  };

  const updateTable = (id: string, updates: Partial<RestaurantTable>) => {
    setTables((prev) =>
      prev.map((tbl) => {
        if (tbl.id === id) {
          const updatedTable = { ...tbl, ...updates };
          // If table number changed, update QR code url
          if (updates.table_number && updates.table_number !== tbl.table_number) {
            updatedTable.qr_code_url = formatTableQRUrl(updates.table_number, updatedTable.qr_token, lanUrl);
          }
          return updatedTable;
        }
        return tbl;
      })
    );
    showToast('Table details updated.', 'success');
  };

  const deleteTable = (id: string) => {
    setTables((prev) => prev.filter((tbl) => tbl.id !== id));
    showToast('Table deleted.', 'info');
  };

  const updateTableStatus = (id: string, status: TableStatus) => {
    const clearOrder = status === 'available' || status === 'needs_cleaning';
    setTables((prev) =>
      prev.map((tbl) => {
        if (tbl.id === id) {
          return {
            ...tbl,
            status,
            active_order_id: clearOrder ? undefined : tbl.active_order_id,
            active_order_total: clearOrder ? undefined : tbl.active_order_total,
          };
        }
        return tbl;
      })
    );
    syncClient.updateTableStatus(id, {
      status,
      active_order_id: clearOrder ? '' : undefined,
      active_order_total: clearOrder ? 0 : undefined,
    });
    showToast(`Table marked as "${status.replace('_', ' ')}"!`, 'info');
  };

  const resyncAllTablesToLan = (customLanUrl?: string) => {
    const targetBase = customLanUrl || lanUrl;
    setTables((prev) =>
      prev.map((tbl) => ({
        ...tbl,
        qr_code_url: formatTableQRUrl(tbl.table_number, tbl.qr_token, targetBase),
      }))
    );
    showToast(`All table QR codes synchronized to LAN: ${targetBase}`, 'success');
  };

  const regenerateTableQR = (id: string): RestaurantTable | null => {
    let result: RestaurantTable | null = null;
    setTables((prev) =>
      prev.map((tbl) => {
        if (tbl.id === id) {
          const newToken = generateToken('tok');
          const updated: RestaurantTable = {
            ...tbl,
            qr_token: newToken,
            qr_code_url: formatTableQRUrl(tbl.table_number, newToken, lanUrl),
          };
          result = updated;
          return updated;
        }
        return tbl;
      })
    );
    showToast('New secure QR token generated for this table!', 'success');
    return result;
  };

  // QR Scan Table Validation
  const setActiveTableByParams = (tableNumber: string, token?: string): { success: boolean; message: string } => {
    const normalized = tableNumber.trim().toLowerCase();
    const matchedTable = tables.find(
      (t) =>
        t.table_number.toLowerCase() === normalized ||
        t.table_number.toLowerCase().replace(/\s+/g, '') === normalized.replace(/\s+/g, '')
    );

    if (!matchedTable) {
      return { success: false, message: `Table "${tableNumber}" was not found in our system.` };
    }

    // Validate token if provided
    if (token && matchedTable.qr_token && matchedTable.qr_token !== token) {
      return {
        success: false,
        message: 'Invalid or expired QR code session. Please scan the QR code on your table again.',
      };
    }

    setActiveTable(matchedTable);
    showToast(`Welcome! You are ordering from ${matchedTable.table_number}`, 'success');
    return { success: true, message: `Connected to ${matchedTable.table_number}` };
  };

  const clearActiveTable = () => {
    setActiveTable(null);
    showToast('Dine-in table session cleared.', 'info');
  };

  // Cart Calculations & Management
  const addToCart = (
    item: MenuItem,
    selectedAddons: AddOnOption[] = [],
    quantity = 1,
    specialInstructions = ''
  ) => {
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = item.price + addonsTotal;
    const itemTotalPrice = unitPrice * quantity;

    // Create unique key based on item id + selected addons names sorted
    const addonsKey = selectedAddons
      .map((a) => a.id)
      .sort()
      .join('-');
    const cartItemId = `${item.id}_${addonsKey}_${specialInstructions.trim().toLowerCase().slice(0, 10)}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          total_price: unitPrice * newQty,
          special_instructions: specialInstructions || existing.special_instructions,
        };
        return updated;
      } else {
        const newCartItem: CartItem = {
          id: cartItemId,
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          image_url: item.image_url,
          is_veg: item.is_veg,
          quantity,
          selected_addons: selectedAddons,
          special_instructions: specialInstructions,
          total_price: itemTotalPrice,
        };
        return [...prev, newCartItem];
      }
    });

    playChime('success');
    showToast(`Added ${item.name} to cart!`, 'success');
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const unitPrice = item.price + item.selected_addons.reduce((s, a) => s + a.price, 0);
            return {
              ...item,
              quantity: newQty,
              total_price: unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.total_price, 0);

  let cartDiscount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.min_order_value) {
    if (appliedCoupon.discount_type === 'percentage') {
      const calculated = (cartSubtotal * appliedCoupon.discount_value) / 100;
      cartDiscount = appliedCoupon.max_discount_amount
        ? Math.min(calculated, appliedCoupon.max_discount_amount)
        : calculated;
    } else {
      cartDiscount = appliedCoupon.discount_value;
    }
  }

  // Delivery fee waived for Dine-in or if subtotal is over threshold
  const isDineIn = Boolean(activeTable);
  const cartDeliveryFee =
    isDineIn || cartSubtotal >= settings.free_delivery_threshold || cartSubtotal === 0
      ? 0
      : settings.delivery_fee;

  const taxableAmount = Math.max(0, cartSubtotal - cartDiscount);
  const cartTax = (taxableAmount * settings.tax_percentage) / 100;
  const cartTotal = Math.max(0, taxableAmount + cartDeliveryFee + cartTax);

  const applyCouponCode = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.is_active);

    if (!found) {
      return { success: false, message: 'Invalid or inactive promo code.' };
    }

    if (cartSubtotal < found.min_order_value) {
      return {
        success: false,
        message: `This coupon requires a minimum subtotal of ${settings.currency_symbol}${found.min_order_value}.`,
      };
    }

    setAppliedCoupon(found);
    showToast(`Coupon "${found.code}" applied successfully!`, 'success');
    return { success: true, message: `Coupon applied: ${found.description}` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed.', 'info');
  };

  // Orders CRUD
  const createOrder = (
    orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>
  ): Order => {
    const id = generateId('ord');
    const order_number = generateOrderNumber();
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id,
      order_number,
      created_at: now,
      updated_at: now,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Broadcast order to shared LAN server immediately
    syncClient.broadcastOrder(newOrder);

    // If dine-in order, update table status to occupied
    if (newOrder.order_type === 'dine_in' && newOrder.table_id) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === newOrder.table_id
            ? { ...t, status: 'occupied', active_order_id: newOrder.order_number, active_order_total: newOrder.total_amount }
            : t
        )
      );
      syncClient.updateTableStatus(newOrder.table_id, {
        status: 'occupied',
        active_order_id: newOrder.order_number,
        active_order_total: newOrder.total_amount,
      });
    }

    // Update customer history or create customer record
    setCustomers((prev) => {
      const existingIndex = prev.findIndex((c) => c.phone === newOrder.customer_phone);
      if (existingIndex > -1) {
        const updated = [...prev];
        const cust = updated[existingIndex];
        updated[existingIndex] = {
          ...cust,
          name: newOrder.customer_name || cust.name,
          email: newOrder.customer_email || cust.email,
          address: newOrder.delivery_address || cust.address,
          total_orders: cust.total_orders + 1,
          total_spent: cust.total_spent + newOrder.total_amount,
          last_order_date: now,
        };
        return updated;
      } else {
        const newCust: Customer = {
          id: generateId('cust'),
          name: newOrder.customer_name,
          phone: newOrder.customer_phone,
          email: newOrder.customer_email || '',
          address: newOrder.delivery_address || '',
          total_orders: 1,
          total_spent: newOrder.total_amount,
          last_order_date: now,
          created_at: now,
        };
        return [newCust, ...prev];
      }
    });

    // Clear cart after successful placement
    clearCart();
    playChime('new_order');
    showToast(`Order #${newOrder.order_number} placed successfully!`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    let orderNum = orderId;
    let autoCollectedCash = false;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId || order.order_number === orderId) {
          orderNum = order.order_number;
          // Auto-mark cash payment as completed once order is marked delivered/served
          const shouldCollectPayment =
            newStatus === 'delivered' && order.payment_status === 'pending';
          if (shouldCollectPayment) {
            autoCollectedCash = true;
          }

          const updated: Order = {
            ...order,
            status: newStatus,
            payment_status: shouldCollectPayment ? 'completed' : order.payment_status,
            updated_at: new Date().toISOString(),
          };

          // If order is delivered or cancelled and was dine_in, check table status
          if ((newStatus === 'delivered' || newStatus === 'cancelled') && updated.table_id) {
            setTables((tPrev) =>
              tPrev.map((t) =>
                t.id === updated.table_id && t.active_order_id === updated.order_number
                  ? { ...t, status: 'needs_cleaning', active_order_id: undefined, active_order_total: undefined }
                  : t
              )
            );
          }

          return updated;
        }
        return order;
      })
    );

    syncClient.updateOrderFields(orderId, {
      status: newStatus,
      ...(autoCollectedCash ? { payment_status: 'completed' } : {}),
    });

    // If order was dine-in and is delivered or cancelled, sync table status to needs_cleaning on server
    const targetOrder = orders.find((o) => o.id === orderId || o.order_number === orderId);
    if ((newStatus === 'delivered' || newStatus === 'cancelled') && targetOrder?.table_id) {
      syncClient.updateTableStatus(targetOrder.table_id, {
        status: 'needs_cleaning',
        active_order_id: '',
        active_order_total: 0,
      });
    }

    if (autoCollectedCash) {
      showToast(`Order #${orderNum} delivered & Cash Payment received!`, 'success');
    } else {
      showToast(`Order status updated to "${newStatus.replace('_', ' ')}"!`, 'info');
    }
  };

  const updateOrderPaymentStatus = (orderId: string, paymentStatus: PaymentStatus) => {
    let orderNum = orderId;
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId || order.order_number === orderId) {
          orderNum = order.order_number;
          return {
            ...order,
            payment_status: paymentStatus,
            updated_at: new Date().toISOString(),
          };
        }
        return order;
      })
    );
    syncClient.updateOrderPayment(orderId, paymentStatus);
    showToast(
      paymentStatus === 'completed'
        ? `Payment for #${orderNum} marked as PAID & Collected!`
        : `Payment status for #${orderNum} marked as ${paymentStatus.toUpperCase()}`,
      paymentStatus === 'completed' ? 'success' : 'info'
    );
  };

  const cancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled');
    showToast('Order cancelled.', 'info');
  };

  const getOrderById = (orderIdOrNumber: string): Order | undefined => {
    const clean = orderIdOrNumber.trim().toUpperCase();
    return orders.find(
      (o) => o.id.toUpperCase() === clean || o.order_number.toUpperCase() === clean
    );
  };

  // Coupons CRUD
  const addCoupon = (couponData: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: generateId('cpn'),
      code: couponData.code.toUpperCase(),
    };
    setCoupons((prev) => [...prev, newCoupon]);
    showToast(`Coupon "${newCoupon.code}" created!`, 'success');
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...updates, code: updates.code ? updates.code.toUpperCase() : c.code }
          : c
      )
    );
    showToast('Coupon updated.', 'success');
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('Coupon deleted.', 'info');
  };

  // Admin Auth (with pre-configured demo account)
  const loginAdmin = (email: string, pass: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    if (
      (cleanEmail === 'admin@restaurant.com' || cleanEmail === 'admin@savoria.com') &&
      pass === 'admin123'
    ) {
      const user: AdminUser = {
        id: 'adm_01',
        email: cleanEmail,
        name: 'Executive Chef Admin',
        role: 'admin',
      };
      setAdminUser(user);
      showToast('Logged in as Restaurant Admin!', 'success');
      return true;
    }
    showToast('Invalid admin credentials. Use admin@restaurant.com / admin123', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    showToast('Logged out of admin dashboard.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        tables,
        lanUrl,
        resyncAllTablesToLan,
        addTable,
        updateTable,
        deleteTable,
        updateTableStatus,
        regenerateTableQR,
        activeTable,
        setActiveTableByParams,
        clearActiveTable,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        cartSubtotal,
        cartDiscount,
        cartDeliveryFee,
        cartTax,
        cartTotal,
        orders,
        createOrder,
        updateOrderStatus,
        updateOrderPaymentStatus,
        cancelOrder,
        getOrderById,
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        customers,
        adminUser,
        loginAdmin,
        logoutAdmin,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
