import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Menu as MenuIcon,
  X,
  Sparkles,
  QrCode,
} from 'lucide-react';

interface NavbarProps {
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart }) => {
  const { settings, cart, activeTable, clearActiveTable } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100/60 shadow-xs">
      {/* Top micro banner if ordering from table */}
      {activeTable && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-xs py-2 px-3 sm:px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 sm:gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-semibold tracking-wide truncate">
                Dine-In Session: <strong>{activeTable.table_number}</strong> ({activeTable.table_name})
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
              <span className="text-white/80 hidden md:inline text-[11px]">Direct hot table service</span>
              <button
                onClick={clearActiveTable}
                className="underline hover:text-white/90 text-xs font-semibold py-0.5 px-1 cursor-pointer"
              >
                Exit Table
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-stone-900 truncate max-w-[140px] xs:max-w-[180px] sm:max-w-xs md:max-w-none">
                  {settings.restaurant_name}
                </span>
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 shrink-0">
                  <Sparkles className="w-3 h-3" /> Artisan
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden md:block truncate">
                {settings.tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/')
                  ? 'bg-orange-50 text-orange-600 font-bold'
                  : 'text-stone-700 hover:text-orange-600 hover:bg-stone-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/menu')
                  ? 'bg-orange-50 text-orange-600 font-bold'
                  : 'text-stone-700 hover:text-orange-600 hover:bg-stone-50'
              }`}
            >
              Menu
            </Link>
            <Link
              to="/track"
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                isActive('/track')
                  ? 'bg-orange-50 text-orange-600 font-bold'
                  : 'text-stone-700 hover:text-orange-600 hover:bg-stone-50'
              }`}
            >
              <Clock className="w-4 h-4" /> Track Order
            </Link>
          </nav>

          {/* Action Buttons: Cart, Dine-In / QR, Admin Portal */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Table Badge if active */}
            {activeTable && (
              <div className="hidden lg:flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <QrCode className="w-3.5 h-3.5 text-amber-600" />
                <span>{activeTable.table_number}</span>
              </div>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-all shadow-sm active:scale-95 cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-orange-400" />
              <span className="font-semibold text-sm hidden sm:inline">Cart</span>
              {totalCartItems > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full bg-orange-500 text-white animate-bounce">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Admin Portal Link */}
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 rounded-xl transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-stone-500" />
              <span>Admin</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-100 bg-white/98 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-base font-semibold text-stone-800 hover:bg-orange-50 hover:text-orange-600"
            >
              Home
            </Link>
            <Link
              to="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-base font-semibold text-stone-800 hover:bg-orange-50 hover:text-orange-600"
            >
              Browse Full Menu
            </Link>
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-base font-semibold text-stone-800 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2"
            >
              <Clock className="w-4 h-4" /> Track Live Order
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-base font-semibold text-stone-800 hover:bg-stone-100 flex items-center gap-2 mt-2 border-t border-stone-100 pt-3"
            >
              <ShieldCheck className="w-4 h-4 text-orange-600" /> Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
