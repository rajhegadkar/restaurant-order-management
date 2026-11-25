import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Hero } from '../../components/customer/Hero';
import { CategoryPills } from '../../components/customer/CategoryPills';
import { FoodCard } from '../../components/customer/FoodCard';
import { FoodCustomizerModal } from '../../components/customer/FoodCustomizerModal';
import { OffersSection } from '../../components/customer/OffersSection';
import { MenuItem } from '../../types';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Clock,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { menuItems, settings, activeTable } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const navigate = useNavigate();

  // Filter items for home display
  const featuredItems = menuItems.filter((i) => i.is_featured && i.is_available);
  const bestsellerItems = menuItems.filter((i) => i.is_bestseller && i.is_available);

  // Filtered by selected category pill
  const categoryItems =
    selectedCategory === 'all'
      ? menuItems.slice(0, 8)
      : menuItems.filter((i) => i.category_id === selectedCategory);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <Hero />

      {/* Dine-In QR Table Callout Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-stone-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Instant Table Ordering
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Dining with us in our restaurant?
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
                Scan your tabletop QR sticker to place orders and customize dishes directly from your phone. No waiting for servers!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeTable ? (
              <div className="text-right">
                <span className="block text-xs text-orange-300 font-medium">Currently Ordering for</span>
                <span className="text-lg font-bold text-white">{activeTable.table_number}</span>
              </div>
            ) : (
              <button
                onClick={() => navigate('/menu')}
                className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                Browse Menu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills & Quick Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              Explore Our Kitchen
            </h2>
            <p className="text-xs text-stone-500">Pick a category to filter dishes</p>
          </div>
          <button
            onClick={() => navigate('/menu')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>See All ({menuItems.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <CategoryPills
          selectedCategoryId={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Category Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {categoryItems.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onOpenCustomizer={(dish) => setCustomizingItem(dish)}
            />
          ))}
        </div>
      </section>

      {/* Special Offers Section */}
      <OffersSection />

      {/* Chef's Signature Bestsellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-orange-600 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" /> Guest Favorites
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
              Crowd-Favorite Bestsellers
            </h2>
          </div>
          <button
            onClick={() => navigate('/menu')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellerItems.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onOpenCustomizer={(dish) => setCustomizingItem(dish)}
            />
          ))}
        </div>
      </section>

      {/* Restaurant Story & Quality Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-amber-50/60 rounded-3xl p-8 sm:p-12 border border-amber-200/60 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              The {settings.restaurant_name} Philosophy
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
              Rooted in Tradition, Elevated by Modern Culinary Craft.
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Every dish we serve starts with local, organic farm harvests, authentic Italian heritage grains, and sustainably raised meats. Our wood-fired ovens operate day and night to produce signature sourdough crusts, slow-roasted meats, and deeply layered reductions.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Always On-Time</h4>
                  <p className="text-[11px] text-stone-500">Fast prep & swift delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-600" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Highest Hygiene</h4>
                  <p className="text-[11px] text-stone-500">Certified kitchen standards</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-white">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80"
              alt="Restaurant kitchen interior"
              className="w-full h-72 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <div className="text-white">
                <p className="font-serif font-bold text-lg">{settings.restaurant_name}</p>
                <p className="text-xs text-stone-200">{settings.address}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Food Customizer Modal */}
      <FoodCustomizerModal
        item={customizingItem}
        isOpen={Boolean(customizingItem)}
        onClose={() => setCustomizingItem(null)}
      />
    </div>
  );
};
