import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FoodCard } from '../../components/customer/FoodCard';
import { CategoryPills } from '../../components/customer/CategoryPills';
import { FoodCustomizerModal } from '../../components/customer/FoodCustomizerModal';
import { MenuItem } from '../../types';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Utensils,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const MenuPage: React.FC = () => {
  const { menuItems, activeTable } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non_veg'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'price_asc' | 'price_desc' | 'rating'>('popularity');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  // Sync search param if URL changes
  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery !== null && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  // Filter & sort logic
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category_id !== selectedCategory) {
        return false;
      }

      // Veg filter
      if (vegFilter === 'veg' && !item.is_veg) return false;
      if (vegFilter === 'non_veg' && item.is_veg) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      // Popularity default (bestsellers first)
      if (a.is_bestseller && !b.is_bestseller) return -1;
      if (!a.is_bestseller && b.is_bestseller) return 1;
      return 0;
    });
  }, [menuItems, selectedCategory, vegFilter, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Table Welcome Banner if QR Dine-In active */}
      {activeTable && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-amber-500/10 border border-orange-200/80 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900">
                Welcome to {activeTable.table_number}! ({activeTable.table_name})
              </h2>
              <p className="text-xs text-stone-600">
                You are ordering directly from your table. Every dish ordered will be served hot to you.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-orange-700 bg-white/80 px-3 py-1.5 rounded-xl border border-orange-200 hidden sm:inline-block">
            Capacity: {activeTable.capacity} Seats
          </span>
        </div>
      )}

      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">
            Artisanal Menu & Delicacies
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Browse our chef-curated selection of wood-fired pizzas, gourmet burgers, pastas, and drinks.
          </p>
        </div>

        {/* Live Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search food by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200/90 bg-white text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-xs text-stone-400 hover:text-stone-700 font-bold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Slider */}
      <CategoryPills
        selectedCategoryId={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          if (catId === 'all') {
            searchParams.delete('category');
          } else {
            searchParams.set('category', catId);
          }
          setSearchParams(searchParams);
        }}
      />

      {/* Filter Toolbar: Veg / Non-Veg + Sort dropdown */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Veg / Non-Veg Selector */}
        <div className="flex items-center gap-1.5 bg-stone-100/80 p-1 rounded-xl">
          <button
            onClick={() => setVegFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              vegFilter === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setVegFilter('veg')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              vegFilter === 'veg'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-emerald-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Pure Veg</span>
          </button>
          <button
            onClick={() => setVegFilter('non_veg')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              vegFilter === 'non_veg'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-rose-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Non-Veg</span>
          </button>
        </div>

        {/* Sort selector & Count */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500 hidden sm:inline">
            Showing <strong className="text-stone-900">{filteredItems.length}</strong> items
          </span>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="popularity">Most Popular / Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dishes Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-stone-200">
          <Utensils className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-stone-900">
            No culinary matches found
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing your dietary filters to view delicious dishes.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setVegFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onOpenCustomizer={(dish) => setCustomizingItem(dish)}
            />
          ))}
        </div>
      )}

      {/* Item Customizer Modal */}
      <FoodCustomizerModal
        item={customizingItem}
        isOpen={Boolean(customizingItem)}
        onClose={() => setCustomizingItem(null)}
      />
    </div>
  );
};
