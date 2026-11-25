import React from 'react';
import { MenuItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { VegBadge } from '../common/VegBadge';
import { formatCurrency } from '../../lib/utils';
import { Plus, Star, Clock, Sparkles } from 'lucide-react';

interface FoodCardProps {
  item: MenuItem;
  onOpenCustomizer: (item: MenuItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onOpenCustomizer }) => {
  const { settings, cart } = useApp();

  // Check if item is already in cart
  const cartMatches = cart.filter((ci) => ci.menu_item_id === item.id);
  const totalInCart = cartMatches.reduce((sum, ci) => sum + ci.quantity, 0);

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-orange-200/80 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Food Image with Badges */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

          {/* Badges on top of image */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 max-w-[72%]">
            {item.is_bestseller && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-500 text-white shadow-xs">
                <Sparkles className="w-3 h-3 fill-current" /> Bestseller
              </span>
            )}
            {item.is_featured && !item.is_bestseller && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-xs">
                Chef's Pick
              </span>
            )}
          </div>

          {/* Veg / Non-Veg Indicator Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-xs z-10">
            <VegBadge isVeg={item.is_veg} size="sm" />
          </div>

          {/* Quantity in cart badge */}
          {totalInCart > 0 && (
            <div className="absolute bottom-3 left-3 bg-stone-900/90 text-orange-400 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
              {totalInCart} in Cart
            </div>
          )}

          {/* Rating */}
          {item.rating && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-bold bg-white/90 text-stone-900 px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug group-hover:text-orange-600 transition-colors">
              {item.name}
            </h3>
          </div>

          <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {item.preparation_time_minutes && (
            <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-3 font-medium">
              <Clock className="w-3 h-3" />
              <span>{item.preparation_time_minutes} mins prep</span>
              {item.addons && item.addons.length > 0 && (
                <>
                  <span className="mx-1">•</span>
                  <span className="text-orange-600 font-semibold">{item.addons.length} Add-ons</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Price & Add Button */}
      <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-stone-100">
        <div>
          <span className="text-xs text-stone-400 block font-medium">Price</span>
          <span className="text-lg font-bold text-stone-900">
            {formatCurrency(item.price, settings.currency_symbol)}
          </span>
        </div>

        {item.is_available ? (
          <button
            onClick={() => onOpenCustomizer(item)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white font-semibold text-xs transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        ) : (
          <span className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-400 font-medium text-xs">
            Sold Out
          </span>
        )}
      </div>
    </div>
  );
};
