import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/utils';
import { Tag, Copy, Check, Sparkles } from 'lucide-react';

export const OffersSection: React.FC = () => {
  const { coupons, settings, showToast } = useApp();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Code "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const activeCoupons = coupons.filter((c) => c.is_active);
  if (activeCoupons.length === 0) return null;

  return (
    <section className="py-10 bg-gradient-to-r from-orange-50/60 via-amber-50/40 to-orange-50/60 border-y border-amber-100/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-orange-600 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Exclusive Deals
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
              Seasonal Offers & Savings
            </h2>
          </div>
          <p className="text-xs text-stone-500 max-w-sm">
            Apply these coupon codes at checkout or in your cart to enjoy exclusive restaurant discounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Decorative side accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-3xl" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}% OFF`
                      : `FLAT ${formatCurrency(coupon.discount_value, settings.currency_symbol)} OFF`}
                  </span>
                  <Tag className="w-4 h-4 text-orange-400" />
                </div>

                <p className="text-xs text-stone-600 font-medium leading-relaxed">
                  {coupon.description}
                </p>

                <p className="text-[11px] text-stone-400 mt-2">
                  Min. order value: {formatCurrency(coupon.min_order_value, settings.currency_symbol)}
                </p>
              </div>

              {/* Code with Copy Button */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="bg-stone-50 border border-dashed border-stone-300 rounded-xl px-3 py-1.5 font-mono text-xs font-bold text-stone-800 tracking-wider">
                  {coupon.code}
                </div>
                <button
                  onClick={() => copyToClipboard(coupon.code)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 px-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
