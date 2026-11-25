import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Coupon } from '../../types';
import { CouponModal } from '../../components/admin/CouponModal';
import { formatCurrency } from '../../lib/utils';
import { Tag, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export const OffersCouponsPage: React.FC = () => {
  const { coupons, updateCoupon, deleteCoupon, settings } = useApp();

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenAdd = () => {
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cpn: Coupon) => {
    setSelectedCoupon(cpn);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Promotional Offers & Coupons
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Configure discount incentives, promo codes, percentage or flat reductions, and minimum spend limits.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[680px]">
            <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min. Subtotal</th>
                <th className="py-3 px-4">Max Cap</th>
                <th className="py-3 px-4">Expires</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-sm bg-stone-100 text-stone-900 px-2.5 py-1 rounded-lg border border-stone-200">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-stone-700 max-w-xs">
                    {coupon.description}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-orange-600 text-sm">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}%`
                      : formatCurrency(coupon.discount_value, settings.currency_symbol)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-stone-800">
                    {formatCurrency(coupon.min_order_value, settings.currency_symbol)}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {coupon.max_discount_amount
                      ? formatCurrency(coupon.max_discount_amount, settings.currency_symbol)
                      : 'No cap'}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">
                    {coupon.expires_at}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => updateCoupon(coupon.id, { is_active: !coupon.is_active })}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                        coupon.is_active
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-stone-200 text-stone-600 border border-stone-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          coupon.is_active ? 'bg-emerald-500' : 'bg-stone-400'
                        }`}
                      />
                      <span>{coupon.is_active ? 'Active' : 'Disabled'}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(coupon)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                        title="Edit Coupon"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete coupon "${coupon.code}"?`)) {
                            deleteCoupon(coupon.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <CouponModal
        coupon={selectedCoupon}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
