import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/utils';
import { Search, Flame, QrCode, Clock, ArrowRight, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  const { settings, activeTable } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/menu');
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-orange-50/30 to-transparent pt-8 pb-16 md:pt-12 md:pb-24">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Search */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill highlight */}
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-2xl sm:rounded-full bg-orange-100/80 border border-orange-200 text-orange-900 text-xs font-semibold shadow-xs">
              <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500 shrink-0" />
              <span>Wood-Fired & Artisanal Kitchen</span>
              <span className="w-1 h-1 rounded-full bg-orange-400 hidden xs:inline-block" />
              <span className="text-orange-700">Open {settings.opening_time} – {settings.closing_time}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
              Flavors Crafted for the Soul,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500">
                Delivered Fresh
              </span>{' '}
              or to Your Table.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
              Explore authentic wood-fired pizzas, prime smashed burgers, and handcrafted pastas. 
              {activeTable ? (
                <strong className="text-orange-700"> Ordering directly from {activeTable.table_number}.</strong>
              ) : (
                ' Order for delivery to your doorstep, takeaway, or contactless table-side ordering.'
              )}
            </p>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl">
              <div className="relative flex items-center shadow-lg shadow-orange-950/5 rounded-2xl bg-white border border-stone-200/80 p-2 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all">
                <Search className="w-5 h-5 text-stone-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search for truffle pizza, smash burger, tiramisu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2.5 text-stone-800 placeholder-stone-400 text-sm focus:outline-hidden bg-transparent"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-md shadow-orange-500/20 shrink-0 transition-all cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick CTA Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/menu')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
              >
                <span>Browse Full Menu</span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </button>

              <button
                onClick={() => navigate('/track')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-semibold text-sm shadow-xs transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4 text-stone-500" />
                <span>Track Live Order</span>
              </button>
            </div>

            {/* Trust points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-amber-100/80 max-w-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">100% Fresh</p>
                  <p className="text-[11px] text-stone-500">Farm Ingredients</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">20-30 Mins</p>
                  <p className="text-[11px] text-stone-500">Express Kitchen</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Table QR</p>
                  <p className="text-[11px] text-stone-500">Contactless Dine</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Food Card Stack */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-orange-950/15 border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80"
                  alt="Artisanal wood-fired pizza with mozzarella and fresh basil"
                  className="w-full h-80 sm:h-96 object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-orange-500 text-[11px] font-bold uppercase tracking-wider mb-2">
                    Chef's Recommendation
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-white leading-tight">
                    Margherita D.O.P. Bufala
                  </h3>
                  <p className="text-xs text-stone-200 mt-1 line-clamp-2">
                    San Marzano tomatoes, freshly stretched buffalo mozzarella, cold-pressed olive oil & sweet basil.
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xl font-bold text-amber-300">
                      {formatCurrency(449, settings.currency_symbol)}
                    </span>
                    <button
                      onClick={() => navigate('/menu')}
                      className="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold cursor-pointer"
                    >
                      View in Menu
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating review card */}
              <div className="absolute -bottom-6 -left-2 lg:-left-6 bg-white rounded-2xl p-4 shadow-xl border border-stone-100 hidden sm:flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop&q=80"
                  alt="Smash burger"
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {'★'.repeat(5)}
                    <span className="text-stone-700 font-bold ml-1">4.9 / 5</span>
                  </div>
                  <p className="text-xs font-semibold text-stone-800">5,000+ Orders Completed</p>
                  <p className="text-[10px] text-stone-500">Top rated gourmet experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
