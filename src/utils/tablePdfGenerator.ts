import { jsPDF } from 'jspdf';
import { RestaurantTable, RestaurantSettings } from '../types';

interface PDFGenOptions {
  tables: RestaurantTable[];
  settings: RestaurantSettings;
  layoutMode: 'sticker_sheet' | 'tent_cards' | 'compact_badges';
  theme: 'amber' | 'noir';
  qrCanvasMap: Record<string, HTMLCanvasElement>;
}

export async function generateTablesPDF({
  tables,
  settings,
  layoutMode,
  theme,
  qrCanvasMap,
}: PDFGenOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const isAmber = theme === 'amber';

  const primaryColor = isAmber ? [234, 88, 12] : [24, 24, 27]; // #ea580c vs #18181b
  const badgeBgColor = [24, 24, 27]; // Dark pill
  const badgeTextColor = isAmber ? [252, 211, 77] : [255, 255, 255]; // Amber vs white
  const borderColor = isAmber ? [245, 158, 11] : [63, 63, 70]; // Amber vs zinc
  const subtextColor = [113, 113, 122];

  if (layoutMode === 'sticker_sheet') {
    // 2 columns x 3 rows = 6 per page
    const cols = 2;
    const rows = 3;
    const itemsPerPage = cols * rows;

    const cardWidth = 88;
    const cardHeight = 85;
    const startX = 12;
    const startY = 14;
    const gapX = 10;
    const gapY = 8;

    tables.forEach((table, index) => {
      if (index > 0 && index % itemsPerPage === 0) {
        doc.addPage();
      }

      const pageIndex = index % itemsPerPage;
      const col = pageIndex % cols;
      const row = Math.floor(pageIndex / cols);

      const x = startX + col * (cardWidth + gapX);
      const y = startY + row * (cardHeight + gapY);

      // Card Background
      if (isAmber) {
        doc.setFillColor(255, 253, 247);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.roundedRect(x, y, cardWidth, cardHeight, 4, 4, 'F');

      // Dashed Cut Border
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.4);
      doc.setLineDashPattern([2, 1.5], 0);
      doc.roundedRect(x, y, cardWidth, cardHeight, 4, 4, 'D');
      doc.setLineDashPattern([], 0);

      // Cut mark indicator
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(161, 161, 170);
      doc.text('Cut Line', x + 3, y + 4);

      // Restaurant Name Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const brandText = doc.splitTextToSize(settings.restaurant_name, cardWidth - 10);
      doc.text(brandText[0] || settings.restaurant_name, x + cardWidth / 2, y + 9, { align: 'center' });

      // Table Number Badge
      const badgeW = 42;
      const badgeH = 8.5;
      const badgeX = x + (cardWidth - badgeW) / 2;
      const badgeY = y + 12;

      doc.setFillColor(badgeBgColor[0], badgeBgColor[1], badgeBgColor[2]);
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2.5, 2.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(badgeTextColor[0], badgeTextColor[1], badgeTextColor[2]);
      doc.text(table.table_number.toUpperCase(), x + cardWidth / 2, badgeY + 6.2, { align: 'center' });

      // Table Subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(subtextColor[0], subtextColor[1], subtextColor[2]);
      doc.text(`${table.table_name} (${table.capacity} Seats)`, x + cardWidth / 2, y + 24.5, { align: 'center' });

      // QR Code Image
      const qrCanvas = qrCanvasMap[table.id];
      if (qrCanvas) {
        const qrSize = 35;
        const qrX = x + (cardWidth - qrSize) / 2;
        const qrY = y + 27;

        // White background for QR
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 3, 2, 2, 'F');
        doc.setDrawColor(228, 228, 231);
        doc.setLineWidth(0.2);
        doc.roundedRect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 3, 2, 2, 'D');

        const qrDataUrl = qrCanvas.toDataURL('image/png');
        doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      }

      // Instructions
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(24, 24, 27);
      doc.text('Scan to Browse Menu & Order', x + cardWidth / 2, y + 68, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(subtextColor[0], subtextColor[1], subtextColor[2]);
      doc.text('1. Scan QR  •  2. Pick Dishes  •  3. Served to Table', x + cardWidth / 2, y + 72.5, { align: 'center' });
      doc.text('Contactless dining  •  Direct table delivery', x + cardWidth / 2, y + 76.5, { align: 'center' });
    });
  } else if (layoutMode === 'tent_cards') {
    // 2 foldable tent cards per page (vertical A4)
    const itemsPerPage = 2;
    const cardWidth = 186;
    const cardHeight = 132;
    const startX = 12;
    const startY = 12;
    const gapY = 8;

    tables.forEach((table, index) => {
      if (index > 0 && index % itemsPerPage === 0) {
        doc.addPage();
      }

      const pageIndex = index % itemsPerPage;
      const x = startX;
      const y = startY + pageIndex * (cardHeight + gapY);

      // Card Background
      if (isAmber) {
        doc.setFillColor(255, 253, 247);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.roundedRect(x, y, cardWidth, cardHeight, 5, 5, 'F');

      // Border
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.4);
      doc.setLineDashPattern([3, 2], 0);
      doc.roundedRect(x, y, cardWidth, cardHeight, 5, 5, 'D');
      doc.setLineDashPattern([], 0);

      // Header Brand
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(settings.restaurant_name, x + cardWidth / 2, y + 11, { align: 'center' });

      // Table Badge
      const badgeW = 60;
      const badgeH = 11;
      const badgeX = x + (cardWidth - badgeW) / 2;
      const badgeY = y + 15;

      doc.setFillColor(badgeBgColor[0], badgeBgColor[1], badgeBgColor[2]);
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(badgeTextColor[0], badgeTextColor[1], badgeTextColor[2]);
      doc.text(table.table_number.toUpperCase(), x + cardWidth / 2, badgeY + 8, { align: 'center' });

      // Subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(subtextColor[0], subtextColor[1], subtextColor[2]);
      doc.text(`${table.table_name} • ${table.capacity} Seats`, x + cardWidth / 2, y + 31, { align: 'center' });

      // QR Code
      const qrCanvas = qrCanvasMap[table.id];
      if (qrCanvas) {
        const qrSize = 44;
        const qrX = x + (cardWidth - qrSize) / 2;
        const qrY = y + 35;

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 3, 3, 'F');
        doc.setDrawColor(228, 228, 231);
        doc.setLineWidth(0.3);
        doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 3, 3, 'D');

        const qrDataUrl = qrCanvas.toDataURL('image/png');
        doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      }

      // Instructions
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(24, 24, 27);
      doc.text('Scan to Browse Menu & Order Direct From Table', x + cardWidth / 2, y + 86, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(subtextColor[0], subtextColor[1], subtextColor[2]);
      doc.text('1. Scan with Phone Camera  •  2. Choose Your Dishes  •  3. Served Fresh to Table', x + cardWidth / 2, y + 92, { align: 'center' });

      // Fold Line Divider
      const foldY = y + 101;
      doc.setDrawColor(180, 180, 185);
      doc.setLineWidth(0.5);
      doc.setLineDashPattern([3, 2], 0);
      doc.line(x + 10, foldY, x + cardWidth - 10, foldY);
      doc.setLineDashPattern([], 0);

      // Fold badge
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(x + (cardWidth - 50) / 2, foldY - 3, 50, 6, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(146, 64, 14);
      doc.text('--- FOLD LINE FOR TABLE STAND ---', x + cardWidth / 2, foldY + 1.2, { align: 'center' });

      // Lower fold face table number
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(24, 24, 27);
      doc.text(table.table_number.toUpperCase(), x + cardWidth / 2, foldY + 13, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(subtextColor[0], subtextColor[1], subtextColor[2]);
      doc.text('Stand upright on table for guest ordering', x + cardWidth / 2, foldY + 18, { align: 'center' });
    });
  } else {
    // compact_badges: 3 cols x 4 rows = 12 per page
    const cols = 3;
    const rows = 4;
    const itemsPerPage = cols * rows;

    const cardWidth = 58;
    const cardHeight = 63;
    const startX = 12;
    const startY = 14;
    const gapX = 7;
    const gapY = 6;

    tables.forEach((table, index) => {
      if (index > 0 && index % itemsPerPage === 0) {
        doc.addPage();
      }

      const pageIndex = index % itemsPerPage;
      const col = pageIndex % cols;
      const row = Math.floor(pageIndex / cols);

      const x = startX + col * (cardWidth + gapX);
      const y = startY + row * (cardHeight + gapY);

      if (isAmber) {
        doc.setFillColor(255, 253, 247);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');

      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.3);
      doc.setLineDashPattern([2, 1.5], 0);
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'D');
      doc.setLineDashPattern([], 0);

      // Table Badge
      const badgeW = 32;
      const badgeH = 7;
      const badgeX = x + (cardWidth - badgeW) / 2;
      const badgeY = y + 4;

      doc.setFillColor(badgeBgColor[0], badgeBgColor[1], badgeBgColor[2]);
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(badgeTextColor[0], badgeTextColor[1], badgeTextColor[2]);
      doc.text(table.table_number.toUpperCase(), x + cardWidth / 2, badgeY + 5.2, { align: 'center' });

      // QR Code
      const qrCanvas = qrCanvasMap[table.id];
      if (qrCanvas) {
        const qrSize = 30;
        const qrX = x + (cardWidth - qrSize) / 2;
        const qrY = y + 14;

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 1.5, 1.5, 'F');

        const qrDataUrl = qrCanvas.toDataURL('image/png');
        doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      }

      // Brand & Scan
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(24, 24, 27);
      doc.text(settings.restaurant_name, x + cardWidth / 2, y + 49, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(subtextColor[0], subtextColor[1], subtextColor[2]);
      doc.text(`${table.table_name} (${table.capacity}p)`, x + cardWidth / 2, y + 53, { align: 'center' });
      doc.text('Scan to Order', x + cardWidth / 2, y + 57.5, { align: 'center' });
    });
  }

  // Trigger browser download of PDF
  const filename = `${settings.restaurant_name.replace(/[^a-zA-Z0-9_-]/g, '_')}_Table_QR_Codes.pdf`;
  doc.save(filename);
}
