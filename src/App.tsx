import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { NotificationToast } from './components/common/NotificationToast';
import { CartDrawer } from './components/customer/CartDrawer';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { MenuPage } from './pages/customer/MenuPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { TableOrderingRedirect } from './pages/customer/TableOrderingRedirect';

// Admin Components & Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { DashboardOverview } from './pages/admin/DashboardOverview';
import { OrdersManagementPage } from './pages/admin/OrdersManagementPage';
import { KitchenDisplayPage } from './pages/admin/KitchenDisplayPage';
import { TableManagementPage } from './pages/admin/TableManagementPage';
import { MenuManagementPage } from './pages/admin/MenuManagementPage';
import { CategoriesManagementPage } from './pages/admin/CategoriesManagementPage';
import { CustomersPage } from './pages/admin/CustomersPage';
import { OffersCouponsPage } from './pages/admin/OffersCouponsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

// Protected Admin Route Guard
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { adminUser } = useApp();
  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
};

// Customer Layout Shell
const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-stone-900 selection:bg-orange-500 selection:text-white">
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Customer Routes */}
          <Route
            path="/"
            element={
              <CustomerLayout>
                <HomePage />
              </CustomerLayout>
            }
          />
          <Route
            path="/menu"
            element={
              <CustomerLayout>
                <MenuPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/checkout"
            element={
              <CustomerLayout>
                <CheckoutPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/track"
            element={
              <CustomerLayout>
                <OrderTrackingPage />
              </CustomerLayout>
            }
          />
          {/* QR Code Scanned Route */}
          <Route
            path="/order"
            element={
              <CustomerLayout>
                <TableOrderingRedirect />
              </CustomerLayout>
            }
          />

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <DashboardOverview />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedAdminRoute>
                <OrdersManagementPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/kitchen"
            element={
              <ProtectedAdminRoute>
                <KitchenDisplayPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/kds"
            element={<Navigate to="/admin/kitchen" replace />}
          />
          <Route
            path="/admin/tables"
            element={
              <ProtectedAdminRoute>
                <TableManagementPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <ProtectedAdminRoute>
                <MenuManagementPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedAdminRoute>
                <CategoriesManagementPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedAdminRoute>
                <CustomersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <ProtectedAdminRoute>
                <OffersCouponsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedAdminRoute>
                <SettingsPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Fallback to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Toast Alerts */}
        <NotificationToast />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
