import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import { MenuItemModal } from '../../components/admin/MenuItemModal';
import { VegBadge } from '../../components/common/VegBadge';
import { formatCurrency } from '../../lib/utils';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';

export const MenuManagementPage: React.FC = () => {
  const { menuItems, categories, toggleItemAvailability, deleteMenuItem, settings } = useApp();

  const [selectedItemForEdit, setSelectedItemForEdit] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non_veg'>('all');

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (categoryFilter !== 'all' && item.category_id !== categoryFilter) return false;
      if (vegFilter === 'veg' && !item.is_veg) return false;
      if (vegFilter === 'non_veg' && item.is_veg) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [menuItems, categoryFilter, vegFilter, searchQuery]);

  const handleOpenAdd = () => {
    setSelectedItemForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setSelectedItemForEdit(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Menu Item Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Create, update prices, toggle availability, and manage culinary add-on options.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-1 min-w-0 w-full">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] w-full sm:w-auto">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search dishes by name or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 bg-white cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Veg Filter */}
          <select
            value={vegFilter}
            onChange={(e) => setVegFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 bg-white cursor-pointer"
          >
            <option value="all">Dietary: All</option>
            <option value="veg">Pure Vegetarian</option>
            <option value="non_veg">Non-Vegetarian</option>
          </select>
        </div>

        <span className="text-xs text-stone-500">
          Showing <strong className="text-stone-900">{filteredItems.length}</strong> items
        </span>
      </div>

      {/* Menu Catalog Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Add-ons</th>
                <th className="py-3 px-4">Tags</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map((item) => {
                const categoryObj = categories.find((c) => c.id === item.category_id);
                return (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Dish name & thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <VegBadge isVeg={item.is_veg} size="sm" />
                            <span className="font-bold text-stone-900 text-sm">{item.name}</span>
                          </div>
                          <p className="text-[11px] text-stone-400 line-clamp-1 max-w-xs mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-semibold text-stone-600">
                      {categoryObj?.name || 'General'}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-bold text-stone-900 text-sm">
                      {formatCurrency(item.price, settings.currency_symbol)}
                    </td>

                    {/* Add-ons count */}
                    <td className="py-3 px-4">
                      {item.addons && item.addons.length > 0 ? (
                        <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                          {item.addons.length} Add-ons
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    {/* Badges */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {item.is_bestseller && (
                          <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-bold">
                            Bestseller
                          </span>
                        )}
                        {item.is_featured && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Availability Switch */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleItemAvailability(item.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          item.is_available
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-stone-200 text-stone-600 border border-stone-300'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.is_available ? 'bg-emerald-500' : 'bg-stone-400'
                          }`}
                        />
                        <span>{item.is_available ? 'Available' : 'Unavailable'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                          title="Edit Dish"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                              deleteMenuItem(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dish Modal */}
      <MenuItemModal
        item={selectedItemForEdit}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
