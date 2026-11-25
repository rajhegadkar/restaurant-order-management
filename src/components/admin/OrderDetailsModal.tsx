import React from 'react';
import { Order, OrderStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, getStatusColor } from '../../lib/utils';
import {
  X,
  QrCode,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Truck,
  ChefHat,
  Sparkles,
  Banknote,
} from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { updateOrderStatus, updateOrderPaymentStatus, cancelOrder, settings } = useApp();

  if (!isOpen || !order) return null;

  const handleStatusChange = (status: OrderStatus) => {
    updateOrderStatus(order.id, status);
  };

  const statusInfo = getStatusColor(order.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto sm:my-8 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-bold text-stone-900">
                #{order.order_number}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
              >
                {statusInfo.label}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Placed on {formatDate(order.created_at)} • Type: {order.order_type.toUpperCase()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Table / Location Banner */}
          {order.order_type === 'dine_in' ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Dine-In Table Order</h4>
                  <p className="text-xs text-amber-700">
                    Serve to: <strong>{order.table_number || 'Assigned Table'}</strong>
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-white text-xs font-bold text-amber-800 border border-amber-200">
                Table #{order.table_number?.replace('Table ', '')}
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-700 space-y-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>
                  {order.order_type === 'delivery' ? 'Delivery Address' : 'Self Pickup at Store'}
                </span>
              </div>
              {order.delivery_address && <p>{order.delivery_address}</p>}
              {order.landmark && <p className="text-stone-500">Note: {order.landmark}</p>}
            </div>
          )}

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50/70 p-4 rounded-2xl border border-stone-100 text-xs">
            <div>
              <span className="text-stone-400 font-medium block">Customer</span>
              <p className="font-bold text-stone-900 text-sm mt-0.5">{order.customer_name}</p>
            </div>
            <div>
              <span className="text-stone-400 font-medium block">Phone</span>
              <p className="font-bold text-stone-900 text-sm mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{order.customer_phone}</span>
              </p>
            </div>
            {order.customer_email && (
              <div>
                <span className="text-stone-400 font-medium block">Email</span>
                <p className="text-stone-700 font-medium flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{order.customer_email}</span>
                </p>
              </div>
            )}
            <div>
              <span className="text-stone-400 font-medium block">Payment Method & Status</span>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="font-bold text-stone-800 uppercase text-xs inline-flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-stone-500" />
                  {order.payment_method === 'cod' ? 'Cash' : order.payment_method}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                    order.payment_status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {order.payment_status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                  {order.payment_status.toUpperCase()}
                </span>

                {order.payment_status === 'pending' ? (
                  <button
                    onClick={() => updateOrderPaymentStatus(order.id, 'completed')}
                    className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer flex items-center gap-1 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Cash Paid</span>
                  </button>
                ) : (
                  <button
                    onClick={() => updateOrderPaymentStatus(order.id, 'pending')}
                    className="text-[10px] text-stone-400 hover:text-stone-600 underline cursor-pointer"
                    title="Click to revert payment to pending"
                  >
                    Revert to Pending
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cooking Instructions if any */}
          {order.special_notes && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
              <span className="font-bold block mb-0.5">Customer Special Cooking Notes:</span>
              <p>"{order.special_notes}"</p>
            </div>
          )}

          {/* Items List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Ordered Items ({order.items.length})
            </h4>

            <div className="space-y-3 divide-y divide-stone-100 border border-stone-200 rounded-2xl p-4 bg-white">
              {order.items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h5 className="text-sm font-bold text-stone-900">
                        {item.quantity}× {item.name}
                      </h5>
                      {item.selected_addons.length > 0 && (
                        <p className="text-[11px] text-stone-500">
                          Add-ons: {item.selected_addons.map((a) => a.name).join(', ')}
                        </p>
                      )}
                      {item.special_instructions && (
                        <p className="text-[10px] text-amber-700 italic">
                          Special: "{item.special_instructions}"
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-sm text-stone-900">
                    {formatCurrency(item.total_price, settings.currency_symbol)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals */}
          <div className="border-t border-stone-100 pt-4 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">
                {formatCurrency(order.subtotal, settings.currency_symbol)}
              </span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({order.coupon_code || 'COUPON'})</span>
                <span>-{formatCurrency(order.discount_amount, settings.currency_symbol)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Delivery Fee</span>
              <span>{formatCurrency(order.delivery_fee, settings.currency_symbol)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Taxes</span>
              <span>{formatCurrency(order.tax_amount, settings.currency_symbol)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Amount</span>
              <span className="text-orange-600">
                {formatCurrency(order.total_amount, settings.currency_symbol)}
              </span>
            </div>
          </div>

          {/* Order Status Action Buttons */}
          <div className="border-t border-stone-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Update Order Workflow
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {order.status === 'received' && (
                <>
                  <button
                    onClick={() => handleStatusChange('confirmed')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept / Confirm Order</span>
                  </button>
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs border border-rose-200 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject / Cancel</span>
                  </button>
                </>
              )}

              {order.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusChange('preparing')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Send to Kitchen (Preparing)</span>
                </button>
              )}

              {order.status === 'preparing' && (
                <button
                  onClick={() => handleStatusChange('ready')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-xs cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Mark Ready for Service / Pickup</span>
                </button>
              )}

              {order.status === 'ready' && (
                <button
                  onClick={() => handleStatusChange('delivered')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Complete / Mark Delivered & Served</span>
                </button>
              )}

              {order.status === 'delivered' && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Order has been completed and delivered
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
