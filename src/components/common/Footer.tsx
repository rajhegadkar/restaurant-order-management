import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/utils';
import {
  UtensilsCrossed,
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, tables } = useApp();

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-stone-800/80">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                {settings.restaurant_name}
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              {settings.tagline}. Handcrafted with seasonal farm ingredients, slow wood-fire roasting, and warm artisanal hospitality.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-amber-400/90 font-medium bg-stone-900/80 px-3 py-2 rounded-xl border border-stone-800">
              <QrCode className="w-4 h-4 text-orange-400" />
              <span>Table QR Ordering Available In-House</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-orange-400 transition-colors">
                  Home & Specials
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-orange-400 transition-colors">
                  Browse Full Menu
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-orange-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  Restaurant Staff Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours & Service */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Hours & Service
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-stone-200 font-medium">Monday – Sunday</p>
                  <p className="text-xs text-stone-400">
                    {settings.opening_time} – {settings.closing_time}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <QrCode className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-stone-200 font-medium">Dine-In Tables</p>
                  <p className="text-xs text-stone-400">{tables.length} Active Tables with QR ordering</p>
                </div>
              </li>
              <li className="text-xs text-stone-400 pt-1">
                Free home delivery on orders over {formatCurrency(settings.free_delivery_threshold, settings.currency_symbol)}
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Contact & Location
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <a href={`tel:${settings.contact_number}`} className="hover:text-orange-400 transition-colors">
                  {settings.contact_number}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <a href={`mailto:${settings.contact_email}`} className="hover:text-orange-400 transition-colors">
                  {settings.contact_email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>
            © {new Date().getFullYear()} {settings.restaurant_name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for modern culinary experiences
          </p>
        </div>
      </div>
    </footer>
  );
};
