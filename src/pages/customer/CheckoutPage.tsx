import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { OrderType, PaymentMethod } from '../../types';
import { formatCurrency } from '../../lib/utils';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  QrCode,
  Truck,
  Package,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Tag,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    cartDeliveryFee,
    cartTax,
    cartTotal,
    appliedCoupon,
    settings,
    activeTable,
    createOrder,
    tables,
  } = useApp();

  const navigate = useNavigate();

  // Determine initial order type: if activeTable exists, lock to dine_in
  const [orderType, setOrderType] = useState<OrderType>(
    activeTable ? 'dine_in' : 'delivery'
  );

  // Selected table if dine-in
  const [selectedTableId, setSelectedTableId] = useState<string>(
    activeTable?.id || (tables[0]?.id || '')
  );

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if cart is empty
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">Your basket is empty</h2>
        <p className="text-sm text-stone-500">
          Please add dishes from our menu before proceeding to checkout.
        </p>
        <Link
          to="/menu"
          className="inline-block px-6 py-3 rounded-2xl bg-orange-500 text-white font-semibold text-sm shadow-md"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  const validateForm = () => {
    const errs: { [key: string]: string } = {};

    if (!customerName.trim()) {
      errs.customerName = 'Please enter your name';
    }

    if (!customerPhone.trim() || customerPhone.length < 7) {
      errs.customerPhone = 'Please provide a valid contact phone number';
    }

    if (orderType === 'delivery') {
      if (!deliveryAddress.trim()) {
        errs.deliveryAddress = 'Delivery address is required for home delivery';
      }
    }

    if (orderType === 'dine_in' && !activeTable && !selectedTableId) {
      errs.table = 'Please select your restaurant table';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Find table details if dine-in
      const resolvedTable = activeTable || tables.find((t) => t.id === selectedTableId);

      const placedOrder = createOrder({
        order_type: orderType,
        table_id: orderType === 'dine_in' ? resolvedTable?.id : undefined,
        table_number: orderType === 'dine_in' ? resolvedTable?.table_number : undefined,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        delivery_address: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
        landmark: orderType === 'delivery' && landmark ? landmark.trim() : undefined,
        status: 'received',
        payment_method: paymentMethod,
        payment_status: (paymentMethod === 'online' || paymentMethod === 'card') ? 'completed' : 'pending',
        subtotal: cartSubtotal,
        discount_amount: cartDiscount,
        delivery_fee: orderType === 'delivery' ? cartDeliveryFee : 0,
        tax_amount: cartTax,
        total_amount: orderType === 'delivery' ? cartTotal : Math.max(0, cartSubtotal - cartDiscount + cartTax),
        coupon_code: appliedCoupon?.code,
        special_notes: specialNotes.trim() || undefined,
        items: [...cart],
      });

      // Launch cheerful celebratory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#f59e0b', '#10b981', '#3b82f6'],
      });

      // Navigate to order tracking page
      navigate(`/track?order=${placedOrder.order_number}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const finalPayable =
    orderType === 'delivery'
      ? cartTotal
      : Math.max(0, cartSubtotal - cartDiscount + cartTax);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Checkout Form */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">
              Confirm & Place Order
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Provide your contact details and select your preferred order and payment type.
            </p>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {/* 1. Order Type Selection */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <span>1. Order Type</span>
              </h3>

              {activeTable ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-3 text-amber-900">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      Dine-In at {activeTable.table_number} ({activeTable.table_name})
                    </p>
                    <p className="text-xs text-amber-700">
                      Identified from tabletop QR scan. Order will be served straight to your seat.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                      orderType === 'delivery'
                        ? 'border-orange-500 bg-orange-50/60 text-orange-950 font-bold shadow-xs ring-1 ring-orange-500'
                        : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-orange-500" />
                    <span className="text-xs">Home Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('dine_in')}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                      orderType === 'dine_in'
                        ? 'border-orange-500 bg-orange-50/60 text-orange-950 font-bold shadow-xs ring-1 ring-orange-500'
                        : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-orange-500" />
                    <span className="text-xs">Dine-In Table</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('takeaway')}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                      orderType === 'takeaway'
                        ? 'border-orange-500 bg-orange-50/60 text-orange-950 font-bold shadow-xs ring-1 ring-orange-500'
                        : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                    }`}
                  >
                    <Package className="w-5 h-5 text-orange-500" />
                    <span className="text-xs">Self Takeaway</span>
                  </button>
                </div>
              )}

              {/* Table dropdown if Dine-In without pre-scanned table */}
              {orderType === 'dine_in' && !activeTable && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Select Your Restaurant Table *
                  </label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:ring-2 focus:ring-orange-500"
                  >
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.table_number} ({t.table_name}) — {t.capacity} Seats ({t.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 2. Customer Contact Details */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                2. Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eleanor Vance"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 ${
                      errors.customerName ? 'border-rose-400 bg-rose-50/30' : 'border-stone-200'
                    }`}
                  />
                  {errors.customerName && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 019-2834"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 ${
                      errors.customerPhone ? 'border-rose-400 bg-rose-50/30' : 'border-stone-200'
                    }`}
                  />
                  {errors.customerPhone && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.customerPhone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email Address (Optional, for digital receipt)
                </label>
                <input
                  type="email"
                  placeholder="e.g. name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Delivery Address if Home Delivery */}
              {orderType === 'delivery' && (
                <div className="space-y-4 pt-2 border-t border-stone-100">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Complete Delivery Street Address *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Street number, building/flat name, floor..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 resize-none ${
                        errors.deliveryAddress ? 'border-rose-400 bg-rose-50/30' : 'border-stone-200'
                      }`}
                    />
                    {errors.deliveryAddress && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.deliveryAddress}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nearby Landmark / Gate Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Opposite Central Park, ring buzzer 4B"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* Special chef instructions */}
              <div className="pt-2 border-t border-stone-100">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Overall Order Cooking Notes / Requests
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra napkins, please serve dessert after mains..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                3. Payment Method
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-orange-500 bg-orange-50/60 text-stone-900 ring-1 ring-orange-500 font-bold'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                  }`}
                >
                  <Banknote className="w-6 h-6 text-emerald-600" />
                  <span className="text-xs">
                    {orderType === 'dine_in' ? 'Pay at Counter / Cash' : 'Cash on Delivery'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-orange-500 bg-orange-50/60 text-stone-900 ring-1 ring-orange-500 font-bold'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-purple-600" />
                  <span className="text-xs">UPI / GPay / PhonePe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-orange-500 bg-orange-50/60 text-stone-900 ring-1 ring-orange-500 font-bold'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <span className="text-xs">Card / Online</span>
                </button>
              </div>

              {paymentMethod === 'upi' && (
                <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 text-purple-900 text-xs">
                  <p className="font-semibold">Instant UPI QR Payment</p>
                  <p className="text-[11px] text-purple-700 mt-0.5">
                    Scan using Google Pay, PhonePe, or Paytm upon order generation.
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-base shadow-xl shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Placing your order...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    Place Order • {formatCurrency(finalPayable, settings.currency_symbol)}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-5 lg:sticky lg:top-28">
            <h2 className="text-lg font-serif font-bold text-stone-900 border-b border-stone-100 pb-3">
              Order Review
            </h2>

            {/* Items list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-stone-400 mt-0.5">{item.quantity}×</span>
                    <div>
                      <p className="font-semibold text-stone-900">{item.name}</p>
                      {item.selected_addons.length > 0 && (
                        <p className="text-[11px] text-stone-500">
                          {item.selected_addons.map((a) => a.name).join(', ')}
                        </p>
                      )}
                      {item.special_instructions && (
                        <p className="text-[11px] text-amber-700 italic">"{item.special_instructions}"</p>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">
                    {formatCurrency(item.total_price, settings.currency_symbol)}
                  </span>
                </div>
              ))}
            </div>

            {/* Applied coupon banner */}
            {appliedCoupon && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Promo {appliedCoupon.code}</span>
                </div>
                <span>-{formatCurrency(cartDiscount, settings.currency_symbol)}</span>
              </div>
            )}

            {/* Breakdown table */}
            <div className="border-t border-stone-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-medium text-stone-900">
                  {formatCurrency(cartSubtotal, settings.currency_symbol)}
                </span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(cartDiscount, settings.currency_symbol)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Delivery Fee</span>
                <span className="font-medium text-stone-900">
                  {orderType !== 'delivery' || cartDeliveryFee === 0
                    ? 'FREE'
                    : formatCurrency(cartDeliveryFee, settings.currency_symbol)}
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Taxes & Kitchen Service ({settings.tax_percentage}%)</span>
                <span className="font-medium text-stone-900">
                  {formatCurrency(cartTax, settings.currency_symbol)}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-stone-900 pt-3 border-t border-stone-200">
                <span>Total Amount</span>
                <span className="text-orange-600 text-lg">
                  {formatCurrency(finalPayable, settings.currency_symbol)}
                </span>
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60 flex items-center gap-2 text-[11px] text-stone-500">
              <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Safe & contactless ordering powered by {settings.restaurant_name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
