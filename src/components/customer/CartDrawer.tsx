import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { VegBadge } from '../common/VegBadge';
import { formatCurrency } from '../../lib/utils';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  QrCode,
  ShieldAlert,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    cartSubtotal,
    cartDiscount,
    cartDeliveryFee,
    cartTax,
    cartTotal,
    settings,
    activeTable,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const result = applyCouponCode(couponInput.trim());
    if (result.success) {
      setCouponInput('');
      setCouponError('');
    } else {
      setCouponError(result.message);
    }
  };

  const handleProceedToCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-stone-900">Your Order</h2>
                <p className="text-xs text-stone-500">
                  {cart.reduce((s, i) => s + i.quantity, 0)} items in basket
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-stone-400 hover:text-rose-600 transition-colors px-2 py-1"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dine-In Table Notification Banner */}
          {activeTable && (
            <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-200/70 flex items-center gap-2 text-amber-900 text-xs font-semibold">
              <QrCode className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Ordering for {activeTable.table_number} ({activeTable.table_name})</span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center mb-2">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Your basket is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                  Explore our handcrafted culinary creations and add delicious items to your table order.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/menu');
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 flex flex-col gap-2.5 hover:border-orange-200 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <VegBadge isVeg={item.is_veg} size="sm" />
                        <h4 className="text-sm font-bold text-stone-900 truncate">
                          {item.name}
                        </h4>
                      </div>

                      {/* Display Selected Add-ons */}
                      {item.selected_addons.length > 0 && (
                        <div className="text-[11px] text-stone-500 mt-1 space-y-0.5">
                          {item.selected_addons.map((addon) => (
                            <span key={addon.id} className="block text-stone-600">
                              + {addon.name} ({formatCurrency(addon.price, settings.currency_symbol)})
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Special instructions */}
                      {item.special_instructions && (
                        <p className="text-[11px] text-amber-700 italic mt-1 bg-amber-50/80 px-2 py-0.5 rounded-md inline-block">
                          Note: "{item.special_instructions}"
                        </p>
                      )}

                      <div className="text-xs font-bold text-orange-600 mt-1">
                        {formatCurrency(item.total_price, settings.currency_symbol)}
                      </div>
                    </div>

                    {/* Delete item button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-300 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between border-t border-stone-200/50 pt-2">
                    <span className="text-[11px] text-stone-400 font-medium">Quantity</span>
                    <div className="flex items-center bg-white border border-stone-200 rounded-xl p-0.5 shadow-2xs">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="p-1 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="p-1 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Calculations & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200/80 bg-stone-50/70 space-y-4">
              {/* Promo Coupon Section */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span>Coupon: {appliedCoupon.code} applied!</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Coupon code (e.g. SAVOR20)"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value);
                            setCouponError('');
                          }}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 uppercase"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1">
                        <ShieldAlert className="w-3 h-3" /> {couponError}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Bill Details */}
              <div className="space-y-2 text-xs border-t border-stone-200/60 pt-3">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">
                    {formatCurrency(cartSubtotal, settings.currency_symbol)}
                  </span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-{formatCurrency(cartDiscount, settings.currency_symbol)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <div className="flex items-center gap-1">
                    <span>Delivery Fee</span>
                    {activeTable && (
                      <span className="text-[11px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-sm">
                        Dine-In Waived
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-stone-900">
                    {cartDeliveryFee === 0
                      ? 'FREE'
                      : formatCurrency(cartDeliveryFee, settings.currency_symbol)}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Taxes & Fees ({settings.tax_percentage}%)</span>
                  <span className="font-semibold text-stone-900">
                    {formatCurrency(cartTax, settings.currency_symbol)}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Grand Total</span>
                  <span className="text-orange-600 text-base">
                    {formatCurrency(cartTotal, settings.currency_symbol)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
