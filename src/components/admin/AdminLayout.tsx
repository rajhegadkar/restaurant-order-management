import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  QrCode,
  UtensilsCrossed,
  Layers,
  Users,
  Tag,
  Settings,
  LogOut,
  ExternalLink,
  Bell,
  Volume2,
  VolumeX,
  Menu,
  X,
  Sparkles,
  Wifi,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { adminUser, logoutAdmin, settings, updateSettings, orders, tables, lanUrl, showToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const pendingOrdersCount = orders.filter((o) => o.status === 'received' || o.status === 'confirmed').length;
  const kitchenOrdersCount = orders.filter((o) => o.status === 'preparing').length;

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    {
      name: 'Order Management',
      path: '/admin/orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-orange-500 text-white',
    },
    {
      name: 'Kitchen Display (KDS)',
      path: '/admin/kitchen',
      icon: ChefHat,
      badge: kitchenOrdersCount > 0 ? kitchenOrdersCount : undefined,
      badgeColor: 'bg-purple-600 text-white',
    },
    {
      name: 'Table Management & QR',
      path: '/admin/tables',
      icon: QrCode,
      highlight: true,
      badge: `${tables.length} Tables`,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { name: 'Menu Items', path: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Offers & Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Restaurant Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const toggleOnlineOrdering = () => {
    updateSettings({
      online_ordering_enabled: !settings.online_ordering_enabled,
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-stone-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header
        data-testid="admin-mobile-header"
        className="md:hidden shrink-0 bg-stone-900 text-white px-3 sm:px-4 py-2.5 flex items-center justify-between z-40 border-b border-stone-800 gap-2 shadow-sm"
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 shrink-0 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif font-bold text-sm sm:text-base text-white truncate max-w-[130px] xs:max-w-[190px]">
            {settings.restaurant_name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Sound Alert Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            title={soundEnabled ? 'Order sound alert enabled' : 'Order sound alert muted'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-orange-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-500" />
            )}
          </button>

          {/* Incoming Orders Bell */}
          <Link
            to="/admin/orders"
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 relative transition-colors"
            title="View incoming orders"
            aria-label="Orders Notification"
          >
            <Bell className="w-4 h-4" />
            {pendingOrdersCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 ring-1 ring-stone-900 animate-ping" />
            )}
          </Link>

          {/* Customer Store Link */}
          <Link
            to="/"
            target="_blank"
            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white text-xs flex items-center gap-1 shrink-0 font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
            <span>Store</span>
          </Link>
        </div>
      </header>

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Admin Control Panel) */}
      <aside
        className={`fixed md:static shrink-0 top-0 left-0 z-50 md:z-40 h-screen w-72 bg-stone-950 text-stone-300 flex flex-col justify-between border-r border-stone-800/80 transition-all duration-300 ${
          sidebarOpen
            ? 'translate-x-0 visible opacity-100 shadow-2xl pointer-events-auto'
            : '-translate-x-full md:translate-x-0 invisible md:visible opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto'
        }`}
      >
        <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3 group min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-serif text-lg font-bold text-white tracking-tight block truncate">
                  {settings.restaurant_name}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-orange-400 font-bold block">
                  Admin Control Panel
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 font-bold'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-stone-400'}`} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor || 'bg-stone-800 text-stone-300'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User & Store Switcher */}
        <div className="p-4 border-t border-stone-800/80 bg-stone-950/90 space-y-3 shrink-0">
          {/* View Customer Website Link */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white text-xs font-semibold transition-colors border border-stone-800"
          >
            <ExternalLink className="w-4 h-4 text-orange-400" />
            <span>Open Customer Store</span>
          </Link>

          {/* User Profile & Logout */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="min-w-0">
              <p className="font-bold text-stone-200 truncate">{adminUser?.name || 'Restaurant Admin'}</p>
              <p className="text-[11px] text-stone-500 truncate">{adminUser?.email || 'admin@restaurant.com'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-stone-400 hover:text-rose-400 rounded-xl hover:bg-stone-900 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Control Header (Desktop & Tablet) */}
        <header data-testid="admin-desktop-header" className="hidden md:flex shrink-0 bg-white border-b border-stone-200 px-4 sm:px-6 py-3 sm:py-4 items-center justify-between z-30 shadow-2xs gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 overflow-hidden">
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <span className="text-xs text-stone-500 font-medium">Ordering:</span>
              <button
                onClick={toggleOnlineOrdering}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  settings.online_ordering_enabled
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    settings.online_ordering_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span>{settings.online_ordering_enabled ? 'Accepting Orders' : 'Store Paused'}</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-stone-600 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 shrink-0">
              <QrCode className="w-3.5 h-3.5 text-orange-600" />
              <span>Dine-In Table QR: {settings.dine_in_ordering_enabled ? 'Active' : 'Disabled'}</span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(lanUrl);
                showToast(`LAN Address copied: ${lanUrl}`, 'info');
              }}
              className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors cursor-pointer shrink-0"
              title="Click to copy LAN Wi-Fi Address for mobile devices"
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>LAN: <strong className="font-mono">{new URL(lanUrl).host}</strong></span>
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            {/* Chime Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title={soundEnabled ? 'Order sound alert enabled' : 'Order sound alert muted'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-orange-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
              <span className="hidden sm:inline">{soundEnabled ? 'Chimes ON' : 'Muted'}</span>
            </button>

            {/* Notification Badge Indicator */}
            <div className="relative">
              <Link
                to="/admin/orders"
                className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 block transition-colors"
                title="View incoming orders"
              >
                <Bell className="w-5 h-5" />
                {pendingOrdersCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white animate-ping" />
                )}
              </Link>
            </div>

            {/* Quick Demo Help Badge */}
            <span className="hidden xl:inline-block text-[11px] font-bold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-lg">
              Live Synchronized
            </span>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 w-full overflow-y-auto overflow-x-hidden scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
};
