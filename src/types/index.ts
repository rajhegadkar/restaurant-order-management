export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'needs_cleaning';

export type PaymentMethod = 'cod' | 'upi' | 'card' | 'online';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export interface AddOnOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_veg: boolean;
  is_available: boolean;
  is_bestseller: boolean;
  is_featured: boolean;
  preparation_time_minutes?: number;
  rating?: number;
  addons: AddOnOption[];
}

export interface CartItem {
  id: string; // unique cart entry id (combines item id + selected addons)
  menu_item_id: string;
  name: string;
  price: number;
  image_url: string;
  is_veg: boolean;
  quantity: number;
  selected_addons: AddOnOption[];
  special_instructions?: string;
  total_price: number;
}

export interface RestaurantTable {
  id: string;
  table_number: string; // e.g. "Table 01"
  table_name: string;   // e.g. "Indoor Main Hall", "Garden Patio", "VIP Booth"
  capacity: number;     // 2, 4, 6, 8 seats
  qr_code_url: string;  // e.g. "http://localhost:5173/order?table=Table%2001&token=xyz"
  qr_token: string;     // unique secure verification token
  status: TableStatus;  // available, occupied, reserved, needs_cleaning
  is_active: boolean;
  active_order_id?: string;
  active_order_total?: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  selected_addons: AddOnOption[];
  special_instructions?: string;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string; // e.g. "ORD-8421"
  order_type: OrderType;
  table_id?: string;
  table_number?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address?: string;
  landmark?: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  tax_amount: number;
  total_amount: number;
  coupon_code?: string;
  special_notes?: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number; // e.g. 20% or $5
  min_order_value: number;
  max_discount_amount?: number;
  expires_at: string;
  is_active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  created_at: string;
}

export interface RestaurantSettings {
  id: string;
  restaurant_name: string;
  tagline: string;
  logo_url: string;
  contact_number: string;
  contact_email: string;
  address: string;
  opening_time: string; // "10:00 AM"
  closing_time: string; // "11:30 PM"
  delivery_fee: number;
  min_order_amount: number;
  free_delivery_threshold: number;
  tax_percentage: number;
  currency_symbol: string;
  online_ordering_enabled: boolean;
  dine_in_ordering_enabled: boolean;
  lan_host?: string; // e.g. "192.168.1.128:5173"
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
}
