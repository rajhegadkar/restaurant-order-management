import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Users, Search, Phone, Mail, MapPin, ShoppingBag } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { customers, settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone.toLowerCase().includes(q);
      const matchEmail = (c.email || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Registered and guest customer profiles, order history, and lifetime spending values.
          </p>
        </div>

        <div className="text-xs text-stone-500 bg-white px-3.5 py-2 rounded-2xl border border-stone-200">
          Total Customers: <strong className="text-stone-900">{customers.length}</strong>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-xs flex items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Primary Address</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-stone-900 text-sm">{cust.name}</div>
                    <span className="text-[10px] text-stone-400">ID: {cust.id}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-stone-700">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{cust.phone}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {cust.email ? (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        <span>{cust.email}</span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                    {cust.address ? (
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{cust.address}</span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800">
                      <ShoppingBag className="w-3 h-3 text-stone-500" />
                      <span>{cust.total_orders} Orders</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700 text-sm">
                    {formatCurrency(cust.total_spent, settings.currency_symbol)}
                  </td>
                  <td className="py-3.5 px-4 text-stone-400">
                    {cust.last_order_date ? formatDate(cust.last_order_date) : 'Recently'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
