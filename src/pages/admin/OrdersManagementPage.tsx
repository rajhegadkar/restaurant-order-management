import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, OrderType } from '../../types';
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal';
import { formatCurrency, formatDate, getStatusColor } from '../../lib/utils';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  QrCode,
  Eye,
  Clock,
  Sparkles,
} from 'lucide-react';

export const OrdersManagementPage: React.FC = () => {
  const { orders, updateOrderStatus, updateOrderPaymentStatus, cancelOrder, settings } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status Filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Order Type Filter
      if (typeFilter !== 'all' && order.order_type !== typeFilter) {
        return false;
      }

      // Payment Status Filter
      if (paymentFilter !== 'all' && order.payment_status !== paymentFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = order.order_number.toLowerCase().includes(q);
        const matchCustomer = order.customer_name.toLowerCase().includes(q);
        const matchPhone = order.customer_phone.toLowerCase().includes(q);
        const matchTable = (order.table_number || '').toLowerCase().includes(q);
        if (!matchNumber && !matchCustomer && !matchPhone && !matchTable) return false;
      }

      return true;
    });
  }, [orders, statusFilter, typeFilter, paymentFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Order Management & Live Feed
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Real-time control over dine-in table requests, deliveries, and takeaway pickups.
          </p>
        </div>

        <div className="text-xs text-stone-500 bg-white px-3.5 py-2 rounded-2xl border border-stone-200">
          Total Orders in Log: <strong className="text-stone-900">{orders.length}</strong>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-1 min-w-0 w-full">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px] w-full sm:w-auto">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Order #, Customer, Phone, or Table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 bg-white cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="received">Order Received</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing (Kitchen)</option>
            <option value="ready">Ready / Out for Delivery</option>
            <option value="delivered">Delivered / Served</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Order Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 bg-white cursor-pointer"
          >
            <option value="all">All Order Types</option>
            <option value="dine_in">Dine-In (Table QR)</option>
            <option value="delivery">Home Delivery</option>
            <option value="takeaway">Takeaway Pickup</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 bg-white cursor-pointer"
          >
            <option value="all">All Payments</option>
            <option value="completed">Paid / Completed</option>
            <option value="pending">Pending Payment (Cash/COD)</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || paymentFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setTypeFilter('all');
              setPaymentFilter('all');
            }}
            className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-260px)] min-h-[380px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[860px]">
            <thead className="bg-stone-50/95 backdrop-blur-xs text-stone-600 font-bold border-b border-stone-200 sticky top-0 z-10 shadow-2xs">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer & Contact</th>
                <th className="py-3 px-4">Type / Table</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = getStatusColor(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                      {/* Order Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                        #{order.order_number}
                        <span className="block text-[11px] font-normal text-stone-500 mt-0.5 whitespace-nowrap">
                          {formatDate(order.created_at)}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900">{order.customer_name}</div>
                        <div className="text-[11px] text-stone-500">{order.customer_phone}</div>
                      </td>

                      {/* Order Type & Table # */}
                      <td className="py-3.5 px-4">
                        <span className="capitalize font-semibold text-stone-700 whitespace-nowrap">
                          {order.order_type.replace('_', ' ')}
                        </span>
                        {order.table_number && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                              <QrCode className="w-3 h-3 text-amber-700" />
                              {order.table_number}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-stone-800 font-medium truncate">
                          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                        </div>
                        {order.special_notes && (
                          <span className="text-[11px] text-amber-700 italic block truncate">
                            "{order.special_notes}"
                          </span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-bold text-stone-900 whitespace-nowrap">
                        {formatCurrency(order.total_amount, settings.currency_symbol)}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <span className="uppercase text-[11px] font-bold text-stone-600 block">
                          {order.payment_method === 'cod' ? 'Cash' : order.payment_method}
                        </span>
                        {order.payment_status === 'completed' ? (
                          <button
                            onClick={() => updateOrderPaymentStatus(order.id, 'pending')}
                            className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-amber-50 hover:text-amber-700 px-2.5 py-0.5 rounded-full border border-emerald-200 transition-colors cursor-pointer whitespace-nowrap"
                            title="Paid. Click to revert to pending if needed."
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Paid</span>
                          </button>
                        ) : (
                          <div className="flex flex-col items-start gap-1 mt-1">
                            <span className="text-[11px] capitalize font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 whitespace-nowrap">
                              Pending
                            </span>
                            <button
                              onClick={() => updateOrderPaymentStatus(order.id, 'completed')}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                              title="Click to mark Cash / Payment as Received"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mark Paid</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status === 'received' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors cursor-pointer"
                              title="Accept & Confirm Order"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-[11px] cursor-pointer"
                            >
                              Send Kitchen
                            </button>
                          )}

                          {order.status === 'preparing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              className="px-2 py-1 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 font-semibold text-[11px] cursor-pointer"
                            >
                              Mark Ready
                            </button>
                          )}

                          {order.status === 'ready' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] cursor-pointer"
                            >
                              Complete
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                            title="View Full Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};
