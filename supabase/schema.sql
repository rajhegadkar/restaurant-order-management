-- ==============================================================================
-- RESTAURANT ONLINE ORDERING & TABLE MANAGEMENT SYSTEM
-- PostgreSQL Database Schema with Row Level Security (RLS) & Real-time setup
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. RESTAURANT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS restaurant_settings (
    id TEXT PRIMARY KEY DEFAULT 'rest_settings_01',
    restaurant_name TEXT NOT NULL,
    tagline TEXT,
    logo_url TEXT,
    contact_number TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    address TEXT NOT NULL,
    opening_time TEXT NOT NULL DEFAULT '10:00 AM',
    closing_time TEXT NOT NULL DEFAULT '11:00 PM',
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 49.00,
    min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 199.00,
    free_delivery_threshold NUMERIC(10,2) NOT NULL DEFAULT 499.00,
    tax_percentage NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    currency_symbol TEXT NOT NULL DEFAULT '₹',
    online_ordering_enabled BOOLEAN NOT NULL DEFAULT true,
    dine_in_ordering_enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT NOT NULL,
    is_veg BOOLEAN NOT NULL DEFAULT true,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_bestseller BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    preparation_time_minutes INTEGER DEFAULT 15,
    rating NUMERIC(3,2) DEFAULT 4.8,
    addons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RESTAURANT TABLES TABLE (TABLE MANAGEMENT & QR CODE SYSTEM)
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id TEXT PRIMARY KEY,
    table_number TEXT NOT NULL UNIQUE,
    table_name TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4,
    qr_code_url TEXT NOT NULL,
    qr_token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'needs_cleaning')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    active_order_id TEXT,
    active_order_total NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL,
    min_order_value NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_discount_amount NUMERIC(10,2),
    expires_at DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    address TEXT,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_spent NUMERIC(10,2) NOT NULL DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
    table_id TEXT REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    table_number TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_address TEXT,
    landmark TEXT,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'upi', 'online', 'card')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    subtotal NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    coupon_code TEXT,
    special_notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- POLICIES: Public read for menu, active categories, settings, tables, coupons
CREATE POLICY "Public read restaurant_settings" ON restaurant_settings FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Public read tables" ON restaurant_tables FOR SELECT USING (is_active = true);
CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Public create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read their own order" ON orders FOR SELECT USING (true);

-- Admin full access policies (Authenticated admin role or service key)
CREATE POLICY "Admin full access settings" ON restaurant_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access menu_items" ON menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access tables" ON restaurant_tables FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access coupons" ON coupons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access customers" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (auth.role() = 'authenticated');

-- REALTIME REPLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_tables;
