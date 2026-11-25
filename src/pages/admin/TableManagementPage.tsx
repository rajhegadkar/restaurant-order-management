import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RestaurantTable, TableStatus } from '../../types';
import { QRModal } from '../../components/admin/QRModal';
import { BulkQRPrintModal } from '../../components/admin/BulkQRPrintModal';
import { getTableStatusColor, formatCurrency } from '../../lib/utils';
import {
  QrCode,
  Plus,
  Search,
  Filter,
  Users,
  Printer,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  X,
  Wifi,
  Copy,
} from 'lucide-react';

export const TableManagementPage: React.FC = () => {
  const {
    tables,
    addTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    settings,
    lanUrl,
    resyncAllTablesToLan,
    showToast,
  } = useApp();

  const [selectedTableForQR, setSelectedTableForQR] = useState<RestaurantTable | null>(null);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add / Edit Modal State
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);

  // Form Fields
  const [tableNumber, setTableNumber] = useState('');
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [status, setStatus] = useState<TableStatus>('available');

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      if (statusFilter !== 'all' && table.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = table.table_number.toLowerCase().includes(q);
        const matchName = table.table_name.toLowerCase().includes(q);
        if (!matchNum && !matchName) return false;
      }
      return true;
    });
  }, [tables, statusFilter, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingTable(null);
    const nextTableNum = `Table ${String(tables.length + 1).padStart(2, '0')}`;
    setTableNumber(nextTableNum);
    setTableName('Indoor Dining Area');
    setCapacity('4');
    setStatus('available');
    setIsTableModalOpen(true);
  };

  const handleOpenEditModal = (tbl: RestaurantTable) => {
    setEditingTable(tbl);
    setTableNumber(tbl.table_number);
    setTableName(tbl.table_name);
    setCapacity(tbl.capacity.toString());
    setStatus(tbl.status);
    setIsTableModalOpen(true);
  };

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) return;

    if (editingTable) {
      updateTable(editingTable.id, {
        table_number: tableNumber.trim(),
        table_name: tableName.trim() || 'Dining Hall',
        capacity: parseInt(capacity) || 4,
        status,
      });
    } else {
      addTable({
        table_number: tableNumber.trim(),
        table_name: tableName.trim() || 'Dining Hall',
        capacity: parseInt(capacity) || 4,
        status,
        is_active: true,
      });
    }
    setIsTableModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Bulk Print Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <QrCode className="w-3.5 h-3.5" /> Table Management & Contactless QR System
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Restaurant Tables & QR Badges
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Monitor real-time table statuses, generate unique secure QR tokens, and print table tent cards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsBulkPrintOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs border border-stone-200 shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-orange-500" />
            <span>Print All QR Tent Cards</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Restaurant Table</span>
          </button>
        </div>
      </div>

      {/* LAN Network Live Connection Card */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-5 rounded-3xl border border-stone-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                LAN Network Mode Active
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Listening on 0.0.0.0:5173
              </span>
            </div>
            <p className="text-sm font-semibold text-stone-200 mt-1">
              Wi-Fi Host Address: <code className="font-mono text-orange-300 font-bold bg-stone-800 px-2 py-0.5 rounded-lg">{lanUrl}</code>
            </p>
            <p className="text-xs text-stone-400 mt-1 max-w-xl">
              All table QR codes are encoded with this LAN IP. Any smartphone or tablet connected to your Wi-Fi will open the customer ordering menu directly when scanning tabletop codes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              navigator.clipboard.writeText(lanUrl);
              showToast(`LAN Address copied: ${lanUrl}`, 'info');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-orange-400" />
            <span>Copy LAN URL</span>
          </button>

          <button
            onClick={() => resyncAllTablesToLan()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            title="Re-synchronize all 8 table QR codes to this LAN address"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-sync All QRs</span>
          </button>
        </div>
      </div>

      {/* Legend & Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Status Pills / Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-400 font-bold mr-1">Status Legend:</span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Occupied
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Reserved
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 border border-stone-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-stone-500" /> Needs Cleaning
          </span>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-initial min-w-[160px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 bg-white cursor-pointer"
          >
            <option value="all">All Statuses ({tables.length})</option>
            <option value="available">Available Only</option>
            <option value="occupied">Occupied Only</option>
            <option value="reserved">Reserved Only</option>
            <option value="needs_cleaning">Needs Cleaning Only</option>
          </select>
        </div>
      </div>

      {/* Visual Table Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
        {filteredTables.map((table) => {
          const statusInfo = getTableStatusColor(table.status);
          const isOccupied = table.status === 'occupied';

          return (
            <div
              key={table.id}
              className={`rounded-3xl border-2 p-5 shadow-xs transition-all hover:shadow-lg flex flex-col justify-between min-w-0 ${statusInfo.bg} ${
                isOccupied ? 'border-rose-300' : 'border-stone-200/90'
              }`}
            >
              <div>
                {/* Top: Table Number and Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-serif text-xl font-extrabold text-stone-900 tracking-tight truncate">
                      {table.table_number}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium truncate">
                      {table.table_name}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border shadow-2xs shrink-0 whitespace-nowrap ${statusInfo.badge}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                    <span>{statusInfo.label}</span>
                  </span>
                </div>

                {/* Capacity & Active Order Info */}
                <div className="bg-white/90 rounded-2xl p-3 border border-stone-200/60 shadow-2xs space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      <span>Capacity</span>
                    </span>
                    <strong className="text-stone-900">{table.capacity} Seats</strong>
                  </div>

                  {table.active_order_id ? (
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-stone-400 block text-[11px]">Active Order</span>
                        <strong className="text-stone-900 font-mono">
                          #{table.active_order_id}
                        </strong>
                      </div>
                      {table.active_order_total && (
                        <span className="text-orange-600 font-bold">
                          {formatCurrency(table.active_order_total, settings.currency_symbol)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-stone-100 text-xs text-stone-400">
                      No active ticket
                    </div>
                  )}
                </div>

                {/* Status Switcher Quick Dropdown */}
                <div className="mb-4">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Update Status
                  </label>
                  <select
                    value={table.status}
                    onChange={(e) => updateTableStatus(table.id, e.target.value as TableStatus)}
                    className="w-full text-xs font-semibold px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="available">🟢 Available</option>
                    <option value="occupied">🔴 Occupied</option>
                    <option value="reserved">🟠 Reserved</option>
                    <option value="needs_cleaning">⚪ Needs Cleaning</option>
                  </select>
                </div>
              </div>

              {/* Bottom: QR Action Buttons */}
              <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedTableForQR(table)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-orange-400" />
                  <span>View & Print QR</span>
                </button>

                <button
                  onClick={() => handleOpenEditModal(table)}
                  className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 transition-colors cursor-pointer"
                  title="Edit Table Details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${table.table_number}?`)) {
                      deleteTable(table.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-white hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200 transition-colors cursor-pointer"
                  title="Delete Table"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Table Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto sm:my-8 max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-5 h-5 text-orange-500" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {editingTable ? `Edit ${editingTable.table_number}` : 'Add New Restaurant Table'}
                </h3>
              </div>
              <button
                onClick={() => setIsTableModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Table Number (e.g. Table 09) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Table 09"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Table Name / Area
                </label>
                <input
                  type="text"
                  placeholder="Garden Patio, Window Booth, Terrace View..."
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Seating Capacity
                  </label>
                  <select
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 bg-white"
                  >
                    <option value="2">2 Seats (Couples)</option>
                    <option value="4">4 Seats (Standard)</option>
                    <option value="6">6 Seats (Booth)</option>
                    <option value="8">8 Seats (Family)</option>
                    <option value="12">12 Seats (Party)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TableStatus)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 bg-white"
                  >
                    <option value="available">Available (Green)</option>
                    <option value="occupied">Occupied (Red)</option>
                    <option value="reserved">Reserved (Orange)</option>
                    <option value="needs_cleaning">Needs Cleaning (Grey)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900">
                ✨ A secure QR code token and unique ordering URL will automatically be generated for this table.
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  {editingTable ? 'Save Changes' : 'Create Table & Generate QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Table QR Preview / Download / Print Modal */}
      <QRModal
        table={selectedTableForQR}
        isOpen={Boolean(selectedTableForQR)}
        onClose={() => setSelectedTableForQR(null)}
      />

      {/* Bulk Print All Table Tent Cards Modal */}
      <BulkQRPrintModal
        isOpen={isBulkPrintOpen}
        onClose={() => setIsBulkPrintOpen(false)}
      />
    </div>
  );
};
