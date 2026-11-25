import React, { useState, useEffect } from 'react';
import { Coupon } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Tag } from 'lucide-react';

interface CouponModalProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CouponModal: React.FC<CouponModalProps> = ({
  coupon,
  isOpen,
  onClose,
}) => {
  const { addCoupon, updateCoupon, showToast, settings } = useApp();

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setDescription(coupon.description);
      setDiscountType(coupon.discount_type);
      setDiscountValue(coupon.discount_value.toString());
      setMinOrderValue(coupon.min_order_value.toString());
      setMaxDiscount((coupon.max_discount_amount || '').toString());
      setExpiresAt(coupon.expires_at);
      setIsActive(coupon.is_active);
    } else {
      setCode('');
      setDescription('');
      setDiscountType('percentage');
      setDiscountValue('20');
      setMinOrderValue('499');
      setMaxDiscount('150');
      setExpiresAt('2027-12-31');
      setIsActive(true);
    }
  }, [coupon, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('Coupon code is required.', 'error');
      return;
    }
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      showToast('Please provide a valid discount value.', 'error');
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      description: description.trim() || `${val}${discountType === 'percentage' ? '%' : (settings?.currency_symbol || '₹')} discount offer`,
      discount_type: discountType,
      discount_value: val,
      min_order_value: parseFloat(minOrderValue) || 0,
      max_discount_amount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      expires_at: expiresAt || '2027-12-31',
      is_active: isActive,
    };

    if (coupon) {
      updateCoupon(coupon.id, payload);
    } else {
      addCoupon(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto sm:my-8 max-h-[92vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <Tag className="w-5 h-5 text-orange-500" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {coupon ? `Edit Coupon: ${coupon.code}` : 'Create Discount Coupon'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Coupon Code (e.g. SAVOR25) *
            </label>
            <input
              type="text"
              placeholder="FESTIVE25"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-mono uppercase font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Offer Description
            </label>
            <input
              type="text"
              placeholder="e.g. 20% off on all pizzas and starters"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Flat ({settings?.currency_symbol || '₹'})</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Discount Value *
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
                placeholder="20"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Min. Order Subtotal ({settings?.currency_symbol || '₹'})
              </label>
              <input
                type="number"
                step="0.1"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                placeholder="499.00"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Max Cap ({settings?.currency_symbol || '₹'}) (Optional)
              </label>
              <input
                type="number"
                step="0.1"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="150.00"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded-sm"
                />
                <span>Active Coupon</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
            >
              {coupon ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
