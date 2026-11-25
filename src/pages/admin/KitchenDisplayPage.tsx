import React from 'react';
import { useApp } from '../../context/AppContext';
import { VegBadge } from '../../components/common/VegBadge';
import { formatTimeAgo } from '../../lib/utils';
import {
  ChefHat,
  Clock,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShoppingBag,
  Bell,
} from 'lucide-react';

export const KitchenDisplayPage: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();

  // Active tickets for the kitchen: Received, Confirmed, Preparing
  const kitchenTickets = orders.filter(
    (o) => o.status === 'received' || o.status === 'confirmed' || o.status === 'preparing'
  );

  return (
    <div className="space-y-6">
      {/* KDS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 text-white p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-white">
              Kitchen Display System (KDS)
            </h1>
            <p className="text-xs text-stone-300">
              Live prep tickets for culinary line & table service expediters.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-800 px-4 py-2 rounded-2xl border border-stone-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-stone-200">
              {kitchenTickets.length} Active Tickets
            </span>
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      {kitchenTickets.length === 0 ? (
        <div className="py-24 text-center space-y-3 bg-white rounded-3xl border border-stone-200">
          <ChefHat className="w-16 h-16 text-stone-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-stone-900">
            Kitchen Queue All Clear!
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            No incoming orders currently require preparation. New orders placed by customers or scanned tables will alert here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {kitchenTickets.map((ticket) => {
            const isDineIn = ticket.order_type === 'dine_in';
            const isPreparing = ticket.status === 'preparing';

            return (
              <div
                key={ticket.id}
                className={`bg-white rounded-3xl border-2 flex flex-col justify-between overflow-hidden shadow-md transition-all ${
                  isPreparing
                    ? 'border-purple-400 ring-2 ring-purple-100'
                    : 'border-orange-400 ring-2 ring-orange-100'
                }`}
              >
                {/* Ticket Top Header */}
                <div
                  className={`p-4 text-white flex items-center justify-between ${
                    isDineIn ? 'bg-stone-900' : 'bg-stone-850'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-orange-400">
                        #{ticket.order_number}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-stone-800 text-stone-300">
                        {ticket.order_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{formatTimeAgo(ticket.created_at)}</span>
                    </p>
                  </div>

                  {/* Large Table Number Badge */}
                  {ticket.table_number ? (
                    <div className="bg-orange-500 text-white px-3 py-1.5 rounded-xl text-center shadow-xs">
                      <div className="text-[10px] uppercase font-bold tracking-wider">TABLE</div>
                      <div className="text-lg font-extrabold leading-none">
                        {ticket.table_number.replace('Table ', '')}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-stone-800 text-stone-300 px-3 py-1.5 rounded-xl text-xs font-bold">
                      {ticket.order_type === 'delivery' ? 'DELIVERY' : 'PICKUP'}
                    </div>
                  )}
                </div>

                {/* Ticket Items List */}
                <div className="p-5 flex-1 space-y-4 max-h-80 overflow-y-auto">
                  {/* Special Cooking Note if present */}
                  {ticket.special_notes && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Guest Note:</span>
                        <p className="mt-0.5">"{ticket.special_notes}"</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 divide-y divide-stone-100">
                    {ticket.items.map((item, idx) => (
                      <div key={idx} className="pt-2.5 first:pt-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-900 font-extrabold text-xs flex items-center justify-center shrink-0">
                              {item.quantity}×
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <VegBadge isVeg={item.is_veg} size="sm" />
                                <span className="text-sm font-bold text-stone-900">
                                  {item.name}
                                </span>
                              </div>

                              {/* Addons List */}
                              {item.selected_addons.length > 0 && (
                                <div className="text-[11px] text-stone-600 mt-0.5 space-y-0.5">
                                  {item.selected_addons.map((a) => (
                                    <span key={a.id} className="block font-medium">
                                      • Add: {a.name}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Item specific special instructions */}
                              {item.special_instructions && (
                                <p className="text-[10px] text-amber-700 italic mt-0.5">
                                  "{item.special_instructions}"
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Actions */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-stone-400 block font-medium">Guest</span>
                    <span className="font-bold text-stone-800">{ticket.customer_name}</span>
                  </div>

                  {ticket.status !== 'preparing' ? (
                    <button
                      onClick={() => updateOrderStatus(ticket.id, 'preparing')}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Start Cooking</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => updateOrderStatus(ticket.id, 'ready')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Ready</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
