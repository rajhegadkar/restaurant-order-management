import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { formatCurrency, formatDate, getStatusColor } from '../../lib/utils';
import {
  Search,
  CheckCircle2,
  Clock,
  ChefHat,
  Truck,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  QrCode,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const STATUS_STEPS: { status: OrderStatus; label: string; icon: React.FC<{ className?: string }> }[] = [
  { status: 'received', label: 'Order Received', icon: Clock },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { status: 'preparing', label: 'Preparing in Kitchen', icon: ChefHat },
  { status: 'ready', label: 'Ready / Out for Delivery', icon: Truck },
  { status: 'delivered', label: 'Delivered / Served', icon: Sparkles },
];

export const OrderTrackingPage: React.FC = () => {
  const { orders, getOrderById, settings } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialOrderQuery = searchParams.get('order') || (orders[0]?.order_number || '');
  const [searchInput, setSearchInput] = useState(initialOrderQuery);
  const [activeOrderNumber, setActiveOrderNumber] = useState(initialOrderQuery);

  useEffect(() => {
    const urlOrder = searchParams.get('order');
    if (urlOrder) {
      setActiveOrderNumber(urlOrder);
      setSearchInput(urlOrder);
    }
  }, [searchParams]);

  const currentOrder = getOrderById(activeOrderNumber);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveOrderNumber(searchInput.trim());
      setSearchParams({ order: searchInput.trim() });
    }
  };

  // Calculate active step index for stepper
  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 0;
      case 'confirmed':
        return 1;
      case 'preparing':
        return 2;
      case 'ready':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = currentOrder ? getStepIndex(currentOrder.status) : 0;
  const isCancelled = currentOrder?.status === 'cancelled';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header and Lookup */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Real-Time Tracking
          </span>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-0.5">
            Track Your Food Order
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Follow your dishes from our wood-fired kitchen to your doorstep or dining table.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Enter Order ID (e.g. ORD-1001)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-sm font-medium text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
          >
            Track
          </button>
        </form>
      </div>

      {/* Main Order Status View */}
      {currentOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Interactive Progress Stepper */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-8">
              {/* Order Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl font-bold text-stone-900">
                      #{currentOrder.order_number}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        getStatusColor(currentOrder.status).bg
                      } ${getStatusColor(currentOrder.status).text} ${
                        getStatusColor(currentOrder.status).border
                      }`}
                    >
                      {getStatusColor(currentOrder.status).label}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Placed on {formatDate(currentOrder.created_at)}</span>
                  </p>
                </div>

                {/* Table Badge if Dine In */}
                {currentOrder.order_type === 'dine_in' && currentOrder.table_number && (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                    <QrCode className="w-4 h-4 text-orange-600" />
                    <span>Serving at {currentOrder.table_number}</span>
                  </div>
                )}
              </div>

              {/* Cancelled Banner */}
              {isCancelled ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <p className="font-bold">This order was cancelled</p>
                    <p className="text-xs text-rose-600 mt-0.5">
                      If you have questions, please reach out to restaurant staff or call {settings.contact_number}.
                    </p>
                  </div>
                </div>
              ) : (
                /* Stepper */
                <div className="py-4">
                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
                    {/* Connecting progress bar for desktop */}
                    <div className="hidden md:block absolute top-6 left-8 right-8 h-1 bg-stone-100 z-0">
                      <div
                        className="h-full bg-orange-500 transition-all duration-500"
                        style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                      />
                    </div>

                    {/* Connecting vertical progress line for mobile */}
                    <div className="md:hidden absolute top-6 bottom-6 left-6 w-0.5 bg-stone-200 -translate-x-1/2 z-0">
                      <div
                        className="w-full bg-orange-500 transition-all duration-500"
                        style={{ height: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                      />
                    </div>

                    {STATUS_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      const IconComponent = step.icon;

                      return (
                        <div
                          key={step.status}
                          className="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center w-full md:w-auto"
                        >
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 shrink-0 ${
                              isCompleted
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 ring-4 ring-orange-100'
                                : 'bg-stone-100 text-stone-400 border border-stone-200'
                            } ${isCurrent ? 'scale-110' : ''}`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <p
                              className={`text-xs font-bold ${
                                isCompleted ? 'text-stone-900' : 'text-stone-400'
                              }`}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <span className="inline-block text-[10px] text-orange-600 font-semibold animate-pulse">
                                Active Step
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery or Dine In Message */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-600 flex items-start gap-3">
                {currentOrder.order_type === 'dine_in' ? (
                  <>
                    <QrCode className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-stone-900">Dine-In Table Service</p>
                      <p className="mt-0.5">
                        Your dishes are being prepared fresh in the kitchen and will be delivered directly to{' '}
                        <strong>{currentOrder.table_number || 'your table'}</strong>.
                      </p>
                    </div>
                  </>
                ) : currentOrder.order_type === 'delivery' ? (
                  <>
                    <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-stone-900">Home Delivery Destination</p>
                      <p className="mt-0.5">{currentOrder.delivery_address}</p>
                      {currentOrder.landmark && (
                        <p className="text-stone-400 text-[11px]">Note: {currentOrder.landmark}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-stone-900">Takeaway Pickup</p>
                      <p className="mt-0.5">
                        Please pick up your packed meal at the front restaurant counter when status is marked "Ready".
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Items in this Order */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Dishes in this Order ({currentOrder.items.length})
              </h3>

              <div className="space-y-3 divide-y divide-stone-100">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">
                          {item.quantity}× {item.name}
                        </h4>
                        {item.selected_addons.length > 0 && (
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Add-ons: {item.selected_addons.map((a) => a.name).join(', ')}
                          </p>
                        )}
                        {item.special_instructions && (
                          <p className="text-[10px] text-amber-700 italic mt-0.5">
                            Note: "{item.special_instructions}"
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-stone-900">
                      {formatCurrency(item.total_price, settings.currency_symbol)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Customer & Financial Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-3">
                Order Bill Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">
                    {formatCurrency(currentOrder.subtotal, settings.currency_symbol)}
                  </span>
                </div>

                {currentOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({currentOrder.coupon_code || 'PROMO'})</span>
                    <span>-{formatCurrency(currentOrder.discount_amount, settings.currency_symbol)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-stone-900">
                    {currentOrder.delivery_fee === 0
                      ? 'FREE'
                      : formatCurrency(currentOrder.delivery_fee, settings.currency_symbol)}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Taxes ({settings.tax_percentage}%)</span>
                  <span className="font-medium text-stone-900">
                    {formatCurrency(currentOrder.tax_amount, settings.currency_symbol)}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-stone-900 pt-3 border-t border-stone-200">
                  <span>Total Paid</span>
                  <span className="text-orange-600">
                    {formatCurrency(currentOrder.total_amount, settings.currency_symbol)}
                  </span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Payment Method:</span>
                  <span className="font-semibold text-stone-800 uppercase">
                    {currentOrder.payment_method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Payment Status:</span>
                  <span
                    className={`font-semibold capitalize ${
                      currentOrder.payment_status === 'completed'
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {currentOrder.payment_status}
                  </span>
                </div>
              </div>

              {/* Customer Information */}
              <div className="pt-3 border-t border-stone-100 text-xs space-y-1">
                <p className="font-bold text-stone-900">Guest Customer</p>
                <p className="text-stone-600">{currentOrder.customer_name}</p>
                <p className="text-stone-500">{currentOrder.customer_phone}</p>
                {currentOrder.customer_email && (
                  <p className="text-stone-500">{currentOrder.customer_email}</p>
                )}
              </div>
            </div>

            {/* Need More Food? CTA */}
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200/80 text-center space-y-3">
              <h4 className="font-serif font-bold text-stone-900 text-base">
                Want to add more dishes?
              </h4>
              <p className="text-xs text-stone-600">
                You can easily add extra drinks, sides, or desserts to your table or home delivery.
              </p>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md transition-all"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-stone-900">
            Order Not Found
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            We couldn't locate an order matching "#{searchInput}". Please verify the order number from your receipt.
          </p>
        </div>
      )}

      {/* Recent Orders History for this user */}
      {orders.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <h3 className="text-base font-serif font-bold text-stone-900">
            Recent Orders on Record
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.slice(0, 6).map((ord) => (
              <div
                key={ord.id}
                onClick={() => {
                  setActiveOrderNumber(ord.order_number);
                  setSearchInput(ord.order_number);
                  setSearchParams({ order: ord.order_number });
                  window.scrollTo({ top: 100, behavior: 'smooth' });
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  currentOrder?.id === ord.id
                    ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-stone-900">
                      #{ord.order_number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        getStatusColor(ord.status).bg
                      } ${getStatusColor(ord.status).text} ${getStatusColor(ord.status).border}`}
                    >
                      {getStatusColor(ord.status).label}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    {ord.items.length} dishes • {ord.order_type.replace('_', ' ').toUpperCase()}
                    {ord.table_number && ` (${ord.table_number})`}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-200/50 text-xs">
                  <span className="text-stone-400">{formatDate(ord.created_at)}</span>
                  <span className="font-bold text-stone-900">
                    {formatCurrency(ord.total_amount, settings.currency_symbol)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
