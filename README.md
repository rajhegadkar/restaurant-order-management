# Restaurant Online Ordering & QR Table Management Platform

A modern, responsive Restaurant Online Ordering Web Application, Contactless QR Table Ordering System, Kitchen Display System (KDS), and Admin Dashboard built with **React**, **TypeScript**, **Tailwind CSS**, **Recharts**, **jsPDF**, and **Supabase (PostgreSQL)**.

---

## ⚡ One-Click Setup & Launch

This repository is configured for **instant one-click setup** with zero manual configuration required. It runs out-of-the-box with built-in sample gourmet data (INR `₹`), real-time multi-device Wi-Fi LAN synchronization, and optional Supabase cloud persistence.

### Option A: Double-Click Launcher (Windows / macOS / Linux)
1. Download and extract the latest **Release ZIP** from the [Releases](../../releases) page (or clone this repository).
2. Make sure **[Node.js LTS](https://nodejs.org/)** (`v18+`) is installed on your system.
3. Launch the app:
   - **Windows:** Double-click **`Start-Restaurant-App.bat`**
   - **macOS / Linux:** Run `./start-restaurant-app.sh`
4. The setup launcher automatically:
   - Creates `.env` from `.env.example` if missing
   - Installs dependencies (`npm install`) on first run
   - Initializes the real-time LAN sync store (`data/`)
   - Detects your Wi-Fi LAN IP address and opens `http://localhost:5173/` automatically!

### Option B: CLI Quick Start (`git clone`)
```bash
git clone https://github.com/rajhegadkar/restaurant-order-management.git
cd restaurant-order-management
npm run setup
npm start
```
For hot-reload development mode:
```bash
npm run dev
```

### Default Access URLs & Demo Admin Login
- **Customer Storefront:** `http://localhost:5173/`
- **Table 01 QR Scan Demo:** `http://localhost:5173/order?table=Table%2001&token=tok_tbl01_948a`
- **Admin Control Panel:** `http://localhost:5173/admin`
- **Kitchen Display System (KDS):** `http://localhost:5173/admin/kitchen`
- **Demo Admin Credentials:** `admin@restaurant.com` / `admin123` (or click **Auto-fill** on `/admin/login`)

---

## 🌟 Key Features

### 1. Customer Ordering Website (`/`, `/menu`, `/checkout`, `/track`)
- **Homepage & Discovery:** Dynamic restaurant branding, hero search, category filter pills, featured dishes, chef's bestsellers, and one-click promotional coupons (`SAVOR20`, `WELCOME50`, `CHEF10`).
- **Menu & Dish Customizer:** Dietary filter (**Pure Veg** / **Non-Veg**), real-time search, price/rating sorting, custom add-on modifiers (`₹`), special cooking notes, and quantity steppers.
- **Shopping Cart & Billing (INR `₹`):** Automatic discount caps, 5% GST calculation, free delivery threshold above `₹499`, and automatic delivery waiver for Dine-In QR table orders.
- **Checkout & Live Tracking:** Supports **Home Delivery**, **Dine-In Table**, and **Self Takeaway** with **Cash on Delivery / Pay at Counter**, **UPI**, and **Card / Online** payments, confetti confirmation, and a 5-stage live tracking stepper (`Received → Confirmed → Preparing → Ready → Delivered`).

### 2. Contactless QR Table Ordering & PDF Sticker Engine (`/order`, `/admin/tables`)
- **Cryptographic Table Tokens:** Every table receives a unique QR URL (`/order?table=Table%2001&token=tok_...`) with validation and token regeneration.
- **Visual Floor Grid:** Color-coded status cards (**Available**, **Occupied**, **Reserved**, **Needs Cleaning**) displaying active tickets and live bill amounts.
- **Print & Vector PDF Export (`jspdf`):** Export single stickers, foldable 5"×7" tent cards, acrylic stand inserts, or bulk A4 sheets (2×3 Tent Cards, 3×4 Stickers, 4×6 Mini Placards) with scissor cut guides directly to `.pdf` or `.png`.

### 3. Admin Portal & Kitchen Display System (`/admin/*`)
- **Pinned Control Layout:** Stationary sidebar and status bar paired with independent smooth scrolling across Mobile (`360px+`), Tablet (`768px+`), and Desktop (`1280px+`).
- **Live Order Management & Cash Settlement:** Status filters, payment filters (`Paid` vs. `Pending Payment`), 1-click **"Mark Paid"** cash collection buttons, automatic cash settlement on delivery, and audio order chimes.
- **Kitchen Display System (KDS):** Live prep queue with large table badges, dish modifiers, and guest cooking notes.
- **Full Business CRUD:** Manage Menu Items, Categories, Customer CRM lifetime spend, Offers & Coupons, and dynamic Restaurant Settings (restaurant name propagates live everywhere).

---

## 🌐 Multi-Device LAN Wi-Fi Sync

Both `npm start` (`vite preview`) and `npm run dev` bind to `0.0.0.0:5173` and run the built-in sync API (`/api/sync`, `/api/orders`, `/api/tables`, `/api/settings`) backed by `data/live_state.json`. Smartphones on the same Wi-Fi network can scan printed table QR codes and push live orders directly to the Admin Dashboard and KDS in real time.

---

## 🗄️ Optional Supabase Cloud Database Setup

The platform runs 100% locally out-of-the-box, and can optionally connect to a live **Supabase (PostgreSQL)** backend:
1. Run [`supabase/schema.sql`](supabase/schema.sql) inside your Supabase SQL Editor (creates tables with Row Level Security policies and Realtime replication).
2. Create a public Storage bucket named `food-images`.
3. Update `.env` with your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 🧪 Verification & Testing

```bash
# Typecheck + production build
npm run build

# Run 19 automated server, math, QR & order lifecycle assertions
npm test
```
