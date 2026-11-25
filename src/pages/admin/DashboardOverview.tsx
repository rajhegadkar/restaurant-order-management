import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/admin/StatCard';
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal';
import { Order } from '../../types';
import { formatCurrency, formatDate, getStatusColor } from '../../lib/utils';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  QrCode,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const DashboardOverview: React.FC = () => {
  const { orders, customers, tables, menuItems, settings, updateOrderStatus, updateOrderPaymentStatus } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Key KPI Metrics Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_amount : 0), 0);
  const pendingCashRevenue = orders
    .filter((o) => o.status !== 'cancelled' && o.payment_status === 'pending')
    .reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'received' || o.status === 'confirmed').length;
  const completedOrders = orders.filter((o) => o.status === 'delivered').length;
  const occupiedTables = tables.filter((t) => t.status === 'occupied').length;
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Chart Data: 7-Day Revenue Trend (in ₹ INR)
  const revenueChartData = [
    { day: 'Mon', revenue: 14200, orders: 18 },
    { day: 'Tue', revenue: 18500, orders: 24 },
    { day: 'Wed', revenue: 21400, orders: 27 },
    { day: 'Thu', revenue: 24100, orders: 31 },
    { day: 'Fri', revenue: 38500, orders: 42 },
    { day: 'Sat', revenue: 48200, orders: 58 },
    { day: 'Today', revenue: Math.round(totalRevenue), orders: orders.length },
  ];

  // Chart Data: Hourly Volume Trend
  const hourlyData = [
    { hour: '11 AM', dine_in: 4, delivery: 8 },
    { hour: '1 PM', dine_in: 14, delivery: 12 },
    { hour: '3 PM', dine_in: 6, delivery: 5 },
    { hour: '5 PM', dine_in: 9, delivery: 11 },
    { hour: '7 PM', dine_in: 22, delivery: 18 },
    { hour: '9 PM', dine_in: 16, delivery: 15 },
  ];

  // Category Distribution Chart
  const categoryData = [
    { name: 'Wood-Fired Pizzas', value: 38, color: '#f97316' },
    { name: 'Gourmet Burgers', value: 26, color: '#f59e0b' },
    { name: 'Handcrafted Pastas', value: 18, color: '#8b5cf6' },
    { name: 'Starters & Sides', value: 12, color: '#10b981' },
    { name: 'Desserts & Drinks', value: 6, color: '#06b6d4' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Operations & Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Real-time sales, live incoming table & delivery tickets, and inventory performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Live Order Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue, settings.currency_symbol)}
          subtitle={
            pendingCashRevenue > 0
              ? `${formatCurrency(pendingCashRevenue, settings.currency_symbol)} pending cash`
              : 'All orders settled'
          }
          icon={DollarSign}
          color="emerald"
          trend={{ value: '+14.2%', isPositive: true }}
        />

        <StatCard
          title="Total Orders"
          value={orders.length}
          subtitle="Lifetime volume"
          icon={ShoppingBag}
          color="orange"
          trend={{ value: '+8.5%', isPositive: true }}
        />

        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          subtitle="Awaiting prep"
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Completed"
          value={completedOrders}
          subtitle="Delivered & served"
          icon={CheckCircle2}
          color="blue"
        />

        <StatCard
          title="Total Customers"
          value={customers.length}
          subtitle="Registered patrons"
          icon={Users}
          color="purple"
        />

        <StatCard
          title="Active Tables"
          value={`${occupiedTables}/${tables.length}`}
          subtitle="Dine-in occupied"
          icon={QrCode}
          color="orange"
        />
      </div>

      {/* Sales Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Revenue Trend Area Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Revenue & Sales Growth
              </h3>
              <p className="text-xs text-stone-500">Daily gross revenue in INR ({settings.currency_symbol})</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
              <TrendingUp className="w-4 h-4" />
              <span>+18% this week</span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="day" stroke="#888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888" fontSize={11} tickLine={false} tickFormatter={(val) => `${settings.currency_symbol}${val.toLocaleString('en-IN')}`} />
                <Tooltip
                  formatter={(val: any) => [`${formatCurrency(val, settings.currency_symbol)}`, 'Gross Revenue']}
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ea580c"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif text-base font-bold text-stone-900">
              Sales by Category
            </h3>
            <p className="text-xs text-stone-500">Popularity distribution</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Share']}
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-1">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-stone-700 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-stone-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Best Sellers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Recent Incoming Orders
              </h3>
              <p className="text-xs text-stone-500">Live stream across Dine-in, Delivery, & Takeaway</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer / Table</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Order Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.slice(0, 5).map((order) => {
                  const statusInfo = getStatusColor(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-stone-900">
                        #{order.order_number}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-stone-800">{order.customer_name}</div>
                        {order.table_number && (
                          <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded-sm inline-block mt-0.5">
                            {order.table_number}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 capitalize text-stone-600">
                        {order.order_type.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3 font-bold text-stone-900">
                        {formatCurrency(order.total_amount, settings.currency_symbol)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-bold uppercase text-stone-600">
                            {order.payment_method === 'cod' ? 'Cash' : order.payment_method}
                          </span>
                          {order.payment_status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Paid
                            </span>
                          ) : (
                            <button
                              onClick={() => updateOrderPaymentStatus(order.id, 'completed')}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-emerald-600 hover:text-white px-2 py-0.5 rounded-md border border-amber-300 transition-colors cursor-pointer"
                              title="Click to mark Cash / Payment as Received"
                            >
                              <span>Pending</span>
                              <span className="font-extrabold underline">Collect</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best-Selling Food Items Leaderboard */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              Best-Selling Delicacies
            </h3>
          </div>

          <div className="space-y-3">
            {menuItems
              .filter((i) => i.is_bestseller)
              .slice(0, 5)
              .map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-50 border border-stone-100 hover:border-orange-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-bold text-stone-400 text-xs text-center">
                      #{idx + 1}
                    </span>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-stone-900 truncate max-w-[140px]">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {formatCurrency(item.price, settings.currency_symbol)} • {item.rating} ★
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                    Top Rated
                  </span>
                </div>
              ))}
          </div>
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
