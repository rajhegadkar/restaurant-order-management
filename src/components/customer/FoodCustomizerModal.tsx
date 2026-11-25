import React, { useState } from 'react';
import { MenuItem, AddOnOption } from '../../types';
import { useApp } from '../../context/AppContext';
import { VegBadge } from '../common/VegBadge';
import { formatCurrency } from '../../lib/utils';
import { X, Plus, Minus, Check, Clock, Star, MessageSquare } from 'lucide-react';

interface FoodCustomizerModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FoodCustomizerModal: React.FC<FoodCustomizerModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const { addToCart, settings } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<AddOnOption[]>([]);
  const [instructions, setInstructions] = useState('');

  if (!isOpen || !item) return null;

  const toggleAddon = (addon: AddOnOption) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = item.price + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(item, selectedAddons, quantity, instructions.trim());
    onClose();
    // Reset modal state
    setQuantity(1);
    setSelectedAddons([]);
    setInstructions('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto sm:my-8 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Food Image */}
        <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-stone-100 shrink-0">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <VegBadge isVeg={item.is_veg} size="md" />
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md">
                {item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
              </span>
            </div>
            {item.rating && (
              <div className="flex items-center gap-1 text-xs font-bold bg-amber-400 text-stone-900 px-2 py-1 rounded-full shadow-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{item.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Title & Price Header */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                {item.name}
              </h2>
              <span className="text-xl font-bold text-orange-600 shrink-0">
                {formatCurrency(item.price, settings.currency_symbol)}
              </span>
            </div>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              {item.description}
            </p>
            {item.preparation_time_minutes && (
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2 font-medium">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                <span>Ready in approx. {item.preparation_time_minutes} mins</span>
              </div>
            )}
          </div>

          {/* Add-ons and Customizations */}
          {item.addons && item.addons.length > 0 && (
            <div className="border-t border-stone-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Enhance Your Dish (Optional)
                </h3>
                <span className="text-xs text-stone-500">Select any</span>
              </div>

              <div className="space-y-2.5">
                {item.addons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleAddon(addon)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleAddon(addon);
                        }
                      }}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'border-orange-500 bg-orange-50/60 text-stone-900 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-sm font-medium">{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-orange-600">
                        +{formatCurrency(addon.price, settings.currency_symbol)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cooking Instructions */}
          <div className="border-t border-stone-100 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-stone-500" />
              <label htmlFor="instructions" className="text-sm font-bold text-stone-900">
                Special Instructions & Preferences
              </label>
            </div>
            <textarea
              id="instructions"
              rows={2}
              placeholder="e.g. Extra dressing on the side, no onions, less spicy..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-stone-50/50"
            />
          </div>
        </div>

        {/* Modal Footer: Quantity Selector & Add Button */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center bg-white border border-stone-200 rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-9 text-center font-bold text-sm text-stone-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add To Cart Button with dynamic total */}
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-between px-5 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <span>Add to Order</span>
            <span className="font-bold">
              {formatCurrency(totalPrice, settings.currency_symbol)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
