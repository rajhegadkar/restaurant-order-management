import React, { useRef, useState } from 'react';
import { RestaurantTable } from '../../types';
import { useApp } from '../../context/AppContext';
import { QRCodeCanvas } from 'qrcode.react';
import {
  X,
  Download,
  Printer,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  UtensilsCrossed,
  Wifi,
  Scissors,
  Smartphone,
  Layers,
  Sparkles,
  FileDown,
} from 'lucide-react';
import { getDisplayTableQRUrl } from '../../utils/lanConfig';
import { generateTablesPDF } from '../../utils/tablePdfGenerator';

interface QRModalProps {
  table: RestaurantTable | null;
  isOpen: boolean;
  onClose: () => void;
}

type StickerLayout = 'sticker' | 'tent_card' | 'acrylic';
type StickerTheme = 'amber' | 'noir';

export const QRModal: React.FC<QRModalProps> = ({ table, isOpen, onClose }) => {
  const { settings, regenerateTableQR, showToast } = useApp();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [layout, setLayout] = useState<StickerLayout>('sticker');
  const [theme, setTheme] = useState<StickerTheme>('amber');

  if (!isOpen || !table) return null;

  const effectiveUrl = getDisplayTableQRUrl(table, settings.lan_host);

  // Download complete composite sticker PNG with branding, table number badge, QR code, and instructions
  const handleDownloadFullSticker = () => {
    const qrCanvas = canvasRef.current?.querySelector('canvas');
    if (!qrCanvas) return;

    const width = 640;
    const height = layout === 'tent_card' ? 960 : 800;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isAmber = theme === 'amber';

    // Background
    ctx.fillStyle = isAmber ? '#fffdf7' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Border (Dashed cut guide)
    ctx.lineWidth = 5;
    ctx.strokeStyle = isAmber ? '#f59e0b' : '#18181b';
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(18, 18, width - 36, height - 36);
    ctx.setLineDash([]);

    // Restaurant Branding Header
    ctx.fillStyle = isAmber ? '#fffbeb' : '#f4f4f5';
    ctx.beginPath();
    ctx.roundRect(38, 38, width - 76, 70, 16);
    ctx.fill();

    ctx.fillStyle = '#18181b';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(settings.restaurant_name, width / 2, 82);

    // Table Number Header / Badge
    const badgeY = 135;
    const badgeW = 280;
    const badgeH = 64;
    ctx.fillStyle = isAmber ? '#ea580c' : '#18181b';
    ctx.beginPath();
    ctx.roundRect((width - badgeW) / 2, badgeY, badgeW, badgeH, 20);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(table.table_number.toUpperCase(), width / 2, badgeY + 44);

    // Subtitle: Dining Zone & Capacity
    ctx.fillStyle = '#71717a';
    ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${table.table_name} • ${table.capacity} Seats`, width / 2, badgeY + 95);

    // QR Code Placement
    const qrSize = 300;
    const qrX = (width - qrSize) / 2;
    const qrY = badgeY + 120;

    // White padding box for QR
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 20);
    ctx.fill();
    ctx.strokeStyle = '#e4e4e7';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    // If Tent Card: draw fold line
    if (layout === 'tent_card') {
      const foldY = qrY + qrSize + 60;
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(38, foldY);
      ctx.lineTo(width - 38, foldY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#71717a';
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('⮞ FOLD LINE FOR TABLE TENT STAND ⮜', width / 2, foldY - 10);

      // Bottom folded face preview
      ctx.fillStyle = isAmber ? '#ea580c' : '#18181b';
      ctx.font = 'bold 24px Georgia, serif';
      ctx.fillText(table.table_number.toUpperCase(), width / 2, foldY + 50);

      ctx.fillStyle = '#71717a';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('Scan to order from your mobile phone', width / 2, foldY + 85);
    } else {
      // Standard sticker or acrylic footer
      const ctaY = qrY + qrSize + 55;
      ctx.fillStyle = '#18181b';
      ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('Scan to Browse Menu & Order', width / 2, ctaY);

      ctx.fillStyle = '#71717a';
      ctx.font = '15px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('1. Open Camera  •  2. Scan QR  •  3. Delivered to Table', width / 2, ctaY + 30);
    }

    // Scissor guide footer
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '12px monospace';
    ctx.fillText('✂ Cut along dotted outer line', width / 2, height - 32);

    // Export image
    const imageURI = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${settings.restaurant_name.replace(/\s+/g, '_')}_${table.table_number.replace(/\s+/g, '_')}_Sticker.png`;
    link.href = imageURI;
    link.click();
    showToast(`Print-ready sticker for ${table.table_number} downloaded!`, 'success');
  };

  // Download raw QR code only
  const handleDownloadBareQR = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    const imageURI = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${settings.restaurant_name.replace(/\s+/g, '_')}_${table.table_number.replace(/\s+/g, '_')}_Raw_QR.png`;
    link.href = imageURI;
    link.click();
    showToast(`Raw QR code for ${table.table_number} downloaded as PNG!`, 'success');
  };

  // Download PDF file for single table
  const handleDownloadPDF = async () => {
    const qrCanvas = canvasRef.current?.querySelector('canvas');
    if (!qrCanvas) return;

    try {
      showToast('Generating table PDF...', 'info');
      await generateTablesPDF({
        tables: [table],
        settings,
        layoutMode: layout === 'tent_card' ? 'tent_cards' : 'sticker_sheet',
        theme,
        qrCanvasMap: { [table.id]: qrCanvas },
      });
      showToast(`PDF for ${table.table_number} downloaded!`, 'success');
    } catch (err: any) {
      showToast('Failed to download PDF: ' + err.message, 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(effectiveUrl);
    setCopied(true);
    showToast('Table ordering URL copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto sm:my-8 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {table.table_number} Print Sticker
                </h3>
                <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full border border-orange-200">
                  Print Ready
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {table.table_name} • {table.capacity} Seats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout & Style Switcher Bar */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2.5 bg-stone-50/40 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 bg-stone-200/70 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setLayout('sticker')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                layout === 'sticker'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Tabletop Sticker
            </button>
            <button
              onClick={() => setLayout('tent_card')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                layout === 'tent_card'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Foldable Tent Card
            </button>
            <button
              onClick={() => setLayout('acrylic')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                layout === 'acrylic'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Acrylic Insert
            </button>
          </div>

          <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTheme('amber')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                theme === 'amber'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Warm Gold
            </button>
            <button
              onClick={() => setTheme('noir')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                theme === 'noir'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Noir Minimal
            </button>
          </div>
        </div>

        {/* Printable Table Card Section (Isolated by CSS @media print) */}
        <div className="p-4 sm:p-6 text-center space-y-5 overflow-y-auto flex-1">
          <div
            id="printable-qr-section"
            className={layout === 'tent_card' ? 'printable-single-tentcard' : 'printable-single-sticker'}
          >
            {/* The Actual Table Sticker / Tent Card Container */}
            <div
              className={`mx-auto rounded-3xl p-6 shadow-sm transition-all text-center relative border-2 border-dashed ${
                theme === 'amber'
                  ? 'bg-gradient-to-b from-amber-50/90 via-orange-50/40 to-amber-50/80 border-amber-400 text-stone-900'
                  : 'bg-white border-stone-800 text-stone-900'
              } ${layout === 'tent_card' ? 'max-w-md' : 'max-w-xs'}`}
            >
              {/* Scissor Cut Indicator Line */}
              <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono -mt-2 mb-3">
                <span className="flex items-center gap-1">
                  <Scissors className="w-3 h-3 text-stone-400" />
                  <span>Cut Line</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider font-sans font-bold text-stone-400">
                  {layout === 'sticker' ? 'Adhesive Decal 100x100mm' : layout === 'tent_card' ? 'Foldable Table Tent' : 'Acrylic Stand Card'}
                </span>
              </div>

              {/* Restaurant Branding Header on Sticker */}
              <div className="flex items-center justify-center gap-2 mb-3.5">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-xs ${
                    theme === 'amber' ? 'bg-orange-500 text-white' : 'bg-stone-900 text-white'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <span className="font-serif font-bold text-stone-900 text-sm sm:text-base tracking-tight">
                  {settings.restaurant_name}
                </span>
              </div>

              {/* High-Impact Table Number Badge */}
              <div className="my-2 space-y-1">
                <div
                  className={`inline-flex items-center justify-center px-5 py-2 rounded-2xl shadow-xs transition-all ${
                    theme === 'amber'
                      ? 'bg-stone-900 text-amber-300 border border-stone-800'
                      : 'bg-stone-900 text-white'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl font-serif font-black tracking-wide">
                    {table.table_number.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-stone-600 font-semibold tracking-tight">
                  {table.table_name} • <span className="text-orange-600 font-bold">{table.capacity} Seats</span>
                </p>
              </div>

              {/* QR Canvas Box */}
              <div
                ref={canvasRef}
                className="my-4 flex items-center justify-center bg-white p-3.5 rounded-2xl shadow-inner border border-stone-200 mx-auto w-fit"
              >
                <QRCodeCanvas
                  value={effectiveUrl}
                  size={layout === 'tent_card' ? 190 : 180}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Scan Instructions on Sticker */}
              <div className="space-y-1 pt-1">
                <p className="text-sm font-bold text-stone-900 tracking-tight">
                  Scan to Browse Menu & Order
                </p>
                <p className="text-[11px] text-stone-500 font-medium">
                  Contactless dining • Direct table delivery
                </p>
              </div>

              {/* 3-Step Ordering Guide (for acrylic or sticker) */}
              <div className="grid grid-cols-3 gap-1.5 pt-3 mt-3 border-t border-stone-200/80 text-[10px] text-stone-600 font-medium">
                <div className="flex flex-col items-center">
                  <Smartphone className="w-3.5 h-3.5 text-orange-600 mb-0.5" />
                  <span>1. Scan QR</span>
                </div>
                <div className="flex flex-col items-center">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600 mb-0.5" />
                  <span>2. Pick Dishes</span>
                </div>
                <div className="flex flex-col items-center">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600 mb-0.5" />
                  <span>3. Table Service</span>
                </div>
              </div>

              {/* If Tent Card: Fold Guide Line */}
              {layout === 'tent_card' && (
                <div className="mt-5 pt-4 border-t-2 border-dashed border-stone-300 relative">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-900 px-3 py-0.5 rounded-full text-[10px] font-bold font-mono">
                    ⮞ FOLD LINE ⮜
                  </span>
                  <div className="pt-3 text-center space-y-1">
                    <span className="text-lg font-serif font-black text-stone-800">
                      {table.table_number.toUpperCase()}
                    </span>
                    <p className="text-[10px] text-stone-500">
                      Stand upright in center of table for guest convenience
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Wi-Fi & LAN Network Host Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 bg-stone-50 px-3.5 py-2.5 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 font-medium text-stone-700 min-w-0">
              <Wifi className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="truncate">Scannable over Wi-Fi LAN: <strong className="font-mono text-stone-900">{new URL(effectiveUrl).host}</strong></span>
            </div>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full shrink-0">
              Mobile Verified
            </span>
          </div>

          {/* Table URL Display with Copy */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-left space-y-1.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Direct Table Ordering URL
            </span>
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                readOnly
                value={effectiveUrl}
                className="text-xs text-stone-700 bg-transparent w-full truncate font-mono focus:outline-hidden"
              />
              <button
                onClick={handleCopyUrl}
                className="shrink-0 flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 px-2.5 py-1 rounded-lg hover:bg-orange-100/50 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            <button
              onClick={handleDownloadFullSticker}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-orange-200 bg-orange-50/60 hover:bg-orange-100/70 text-orange-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Download print-ready sticker image with restaurant logo & table number"
            >
              <Download className="w-4 h-4 text-orange-600" />
              <span>Sticker PNG</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Download vector PDF file"
            >
              <FileDown className="w-4 h-4" />
              <span>Save as PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-stone-200 hover:border-orange-500 hover:bg-orange-50/50 text-stone-700 text-xs font-semibold transition-all cursor-pointer"
              title="Open browser print preview dialog"
            >
              <Printer className="w-4 h-4 text-orange-500" />
              <span>Print Sticker</span>
            </button>

            <button
              onClick={handleDownloadBareQR}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-stone-200 hover:border-orange-500 hover:bg-orange-50/50 text-stone-700 text-xs font-semibold transition-all cursor-pointer"
              title="Download only the bare QR canvas"
            >
              <QrCode className="w-4 h-4 text-orange-500" />
              <span>Raw QR</span>
            </button>

            <button
              onClick={() => regenerateTableQR(table.id)}
              className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-stone-200 hover:border-orange-500 hover:bg-orange-50/50 text-stone-700 text-xs font-semibold transition-all cursor-pointer"
              title="Regenerate secure token to invalidate old QR codes"
            >
              <RefreshCw className="w-4 h-4 text-orange-500" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};