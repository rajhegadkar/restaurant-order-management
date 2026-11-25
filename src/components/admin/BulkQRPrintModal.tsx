import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QRCodeCanvas } from 'qrcode.react';
import {
  X,
  Printer,
  Download,
  UtensilsCrossed,
  Wifi,
  Scissors,
  Smartphone,
  Sparkles,
  Layers,
  Check,
  FileDown,
  Loader2,
} from 'lucide-react';
import { getDisplayTableQRUrl } from '../../utils/lanConfig';
import { generateTablesPDF } from '../../utils/tablePdfGenerator';

interface BulkQRPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BulkLayoutMode = 'sticker_sheet' | 'tent_cards' | 'compact_badges';

export const BulkQRPrintModal: React.FC<BulkQRPrintModalProps> = ({ isOpen, onClose }) => {
  const { tables, settings, showToast } = useApp();
  const [layoutMode, setLayoutMode] = useState<BulkLayoutMode>('sticker_sheet');
  const [showCutGuides, setShowCutGuides] = useState(true);
  const [theme, setTheme] = useState<'amber' | 'noir'>('amber');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!isOpen) return null;

  // Direct PDF Document Export via jsPDF
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      showToast('Generating high-resolution vector PDF document...', 'info');

      // Wait a tick to ensure QR canvases are rendered
      await new Promise((resolve) => setTimeout(resolve, 150));

      const qrCanvasMap: Record<string, HTMLCanvasElement> = {};
      const container = document.getElementById('printable-qr-section');
      if (container) {
        const canvases = container.querySelectorAll('canvas');
        tables.forEach((t, i) => {
          if (canvases[i]) {
            qrCanvasMap[t.id] = canvases[i];
          }
        });
      }

      await generateTablesPDF({
        tables,
        settings,
        layoutMode,
        theme,
        qrCanvasMap,
      });

      showToast(`PDF document for ${tables.length} tables generated & downloaded!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to generate PDF document: ' + err.message, 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Browser Print Preview Dialog
  const handlePrint = () => {
    window.print();
  };

  const isAmber = theme === 'amber';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[calc(100vw-1.5rem)] sm:max-w-[calc(100vw-2rem)] lg:max-w-5xl min-w-0 bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto sm:my-8 max-h-[94vh] flex flex-col">
        {/* Modal Controls Header (Hidden on print) */}
        <div className="p-4 sm:p-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50/90 no-print shrink-0 min-w-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 break-words">
                Bulk Table QR Stickers & Tent Cards ({tables.length} Tables)
              </h3>
              <span className="text-[11px] bg-orange-100 text-orange-800 font-bold px-2.5 py-0.5 rounded-full border border-orange-200 shrink-0">
                A4 / Letter Ready
              </span>
            </div>
            <p className="text-xs text-stone-500 flex flex-wrap items-center gap-1.5 mt-0.5 min-w-0">
              <Wifi className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="break-all">
                Encodes Wi-Fi LAN host:{' '}
                <strong className="font-mono text-stone-800">
                  {settings.lan_host || '192.168.1.128:5173'}
                </strong>
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Direct PDF Download Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-60"
              title="Generate and download a ready-to-print vector PDF file"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Document'}</span>
            </button>

            {/* Browser Print Preview Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs border border-stone-300 shadow-xs transition-all cursor-pointer"
              title="Open browser print preview dialog"
            >
              <Printer className="w-4 h-4 text-orange-500" />
              <span>Print via Browser</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/50 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization Toolbar (Hidden on print) */}
        <div className="px-4 sm:px-6 py-3 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 sm:gap-4 bg-stone-100/60 no-print text-xs shrink-0">
          {/* Format Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 shadow-2xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setLayoutMode('sticker_sheet')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                layoutMode === 'sticker_sheet'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sticker Sheet (2x3 Grid)
            </button>
            <button
              onClick={() => setLayoutMode('tent_cards')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                layoutMode === 'tent_cards'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Foldable Tent Cards
            </button>
            <button
              onClick={() => setLayoutMode('compact_badges')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                layoutMode === 'compact_badges'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Mini Table Badges
            </button>
          </div>

          {/* Theme & Cut Options */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-stone-700 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCutGuides}
                onChange={(e) => setShowCutGuides(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500"
              />
              <Scissors className="w-3.5 h-3.5 text-stone-500" />
              <span>Show Cut Guidelines</span>
            </label>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 shadow-2xs font-semibold">
              <button
                onClick={() => setTheme('amber')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  isAmber ? 'bg-amber-500 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Warm Gold
              </button>
              <button
                onClick={() => setTheme('noir')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  !isAmber ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Noir Black
              </button>
            </div>
          </div>
        </div>

        {/* Printable Grid Sheet (Isolated on print by CSS) */}
        <div id="printable-qr-section" className="p-3 sm:p-8 overflow-y-auto overflow-x-hidden flex-1 bg-stone-50/50 min-w-0">
          <div
            className={`grid gap-4 sm:gap-6 min-w-0 ${
              layoutMode === 'tent_cards'
                ? 'grid-cols-1 sm:grid-cols-2'
                : layoutMode === 'compact_badges'
                ? 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
            }`}
          >
            {tables.map((table) => {
              const tableQrUrl = getDisplayTableQRUrl(table, settings.lan_host);
              return (
                <div
                  key={table.id}
                  className={`print-card-break rounded-3xl p-4 sm:p-5 text-center shadow-xs flex flex-col items-center justify-between transition-all relative min-w-0 w-full ${
                    showCutGuides ? 'border-2 border-dashed' : 'border border-solid'
                  } ${
                    isAmber
                      ? 'bg-gradient-to-b from-amber-50/90 via-white to-amber-50/50 border-amber-300'
                      : 'bg-white border-stone-800'
                  } ${layoutMode === 'tent_cards' ? 'space-y-4' : 'space-y-3'}`}
                >
                  {/* Top Cut Marks */}
                  {showCutGuides && (
                    <div className="w-full flex items-center justify-between text-[9px] text-stone-400 font-mono -mt-2.5 -mb-1">
                      <span className="flex items-center gap-0.5">
                        <Scissors className="w-2.5 h-2.5 text-stone-400" />
                        <span>Cut</span>
                      </span>
                      <span className="text-[8px] uppercase tracking-wider font-bold">
                        {table.table_number}
                      </span>
                    </div>
                  )}

                  {/* Branding Header */}
                  <div className="flex items-center justify-center gap-1.5 pt-0.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shadow-2xs ${
                        isAmber ? 'bg-orange-500 text-white' : 'bg-stone-900 text-white'
                      }`}
                    >
                      <UtensilsCrossed className="w-3 h-3" />
                    </div>
                    <span className="font-serif font-bold text-stone-900 text-xs tracking-tight truncate max-w-[180px]">
                      {settings.restaurant_name}
                    </span>
                  </div>

                  {/* High-Impact Table Number */}
                  <div className="space-y-1 w-full">
                    <div
                      className={`inline-flex items-center justify-center px-4 py-1.5 rounded-xl shadow-2xs ${
                        isAmber
                          ? 'bg-stone-900 text-amber-300 border border-stone-800'
                          : 'bg-stone-900 text-white'
                      }`}
                    >
                      <h4 className="text-xl font-serif font-black tracking-wide">
                        {table.table_number.toUpperCase()}
                      </h4>
                    </div>
                    <p className="text-[11px] text-stone-600 font-semibold tracking-tight">
                      {table.table_name} • <span className="text-orange-600 font-bold">{table.capacity} Seats</span>
                    </p>
                  </div>

                  {/* QR Code Canvas */}
                  <div className="p-3 bg-white rounded-2xl border border-stone-200/90 shadow-inner">
                    <QRCodeCanvas
                      value={tableQrUrl}
                      size={layoutMode === 'tent_cards' ? 170 : layoutMode === 'compact_badges' ? 120 : 145}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  {/* Scan Instructions */}
                  <div className="space-y-0.5 w-full">
                    <p className="text-xs font-bold text-stone-900 tracking-tight">
                      Scan to Browse Menu & Order
                    </p>
                    <p className="text-[10px] text-stone-500 font-medium">
                      Contactless dining • Direct table service
                    </p>
                  </div>

                  {/* Mini Step Icons */}
                  <div className="w-full grid grid-cols-3 gap-1 pt-2 border-t border-stone-200/70 text-[9px] text-stone-600 font-medium">
                    <div className="flex flex-col items-center">
                      <Smartphone className="w-3 h-3 text-orange-600 mb-0.5" />
                      <span>1. Scan</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <UtensilsCrossed className="w-3 h-3 text-orange-600 mb-0.5" />
                      <span>2. Order</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Sparkles className="w-3 h-3 text-orange-600 mb-0.5" />
                      <span>3. Served</span>
                    </div>
                  </div>

                  {/* Tent Card Fold Guide Marker */}
                  {layoutMode === 'tent_cards' && (
                    <div className="w-full mt-3 pt-3 border-t-2 border-dashed border-stone-300 text-center relative">
                      <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                        ⮞ FOLD LINE FOR TABLE STAND ⮜
                      </span>
                      <p className="text-[10px] font-serif font-black text-stone-800 mt-1.5">
                        {table.table_number.toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};