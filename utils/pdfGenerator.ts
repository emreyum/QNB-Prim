import { jsPDF } from "jspdf";
import { CalculatedEmployee } from "../types";
import { formatNumber } from "./calculations";

// Helper to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

// Function to load fonts supporting Turkish characters (Roboto)
const loadFonts = async (doc: jsPDF) => {
    try {
        const fontRegularUrl = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf";
        const fontBoldUrl = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf";

        const [regularBytes, boldBytes] = await Promise.all([
            fetch(fontRegularUrl).then(res => res.arrayBuffer()),
            fetch(fontBoldUrl).then(res => res.arrayBuffer())
        ]);

        const regularBase64 = arrayBufferToBase64(regularBytes);
        const boldBase64 = arrayBufferToBase64(boldBytes);

        doc.addFileToVFS("Roboto-Regular.ttf", regularBase64);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

        doc.addFileToVFS("Roboto-Medium.ttf", boldBase64);
        doc.addFont("Roboto-Medium.ttf", "Roboto", "bold");

        return true;
    } catch (error) {
        console.error("Font loading failed:", error);
        return false;
    }
};

// Sanitize filename only (remove spaces and special chars for OS compatibility)
const sanitizeFilename = (text: string) => {
    return text
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ı/g, 'i').replace(/İ/g, 'I')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O')
        .replace(/ç/g, 'c').replace(/Ç/g, 'C')
        .replace(/[^a-zA-Z0-9_]/g, '_');
};

const formatCurrencyPDF = (amount: number) => {
    // Keep using TL for currency symbol consistency
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' TL';
};

export const generateEmployeePDF = async (data: CalculatedEmployee, period: string) => {
  const doc = new jsPDF();
  
  // Load custom fonts for Turkish support
  const fontsLoaded = await loadFonts(doc);
  const fontName = fontsLoaded ? "Roboto" : "helvetica"; // Fallback to helvetica if fetch fails

  // Period Formatting
  const dateObj = new Date(period + "-01");
  const periodStr = dateObj.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  // --- Layout Constants ---
  const margin = 20;
  const cardWidth = 170;
  const startY = 30;
  // Increased height to provide more whitespace at the bottom
  const cardHeight = 155; 
  
  // --- Draw Card Background (Slate 800) ---
  doc.setFillColor(30, 41, 59); // #1e293b
  doc.roundedRect(margin, startY, cardWidth, cardHeight, 3, 3, "F");

  // --- Content Coordinates ---
  let currentY = startY + 15;
  const leftX = margin + 10;
  const rightX = margin + cardWidth - 10;

  // --- Header Section ---
  doc.setFont(fontName, "bold");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("PRİM TABLOSU", leftX, currentY);

  // Period Badge (Right aligned box)
  const dateText = periodStr;
  doc.setFontSize(9);
  const dateWidth = doc.getTextWidth(dateText) + 10;
  
  doc.setFillColor(51, 65, 85); // slate-700
  doc.roundedRect(rightX - dateWidth, currentY - 5, dateWidth, 8, 2, 2, "F");
  
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(dateText, rightX - dateWidth + 5, currentY);

  currentY += 8;
  
  // Employee Name
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(data.name, leftX, currentY);

  // Divider Line
  currentY += 5;
  doc.setDrawColor(51, 65, 85); // slate-700
  doc.line(leftX, currentY, rightX, currentY);
  
  currentY += 12;

  // --- Rows Helper ---
  const drawRow = (
      label: string, 
      value: string, 
      valueColor: [number, number, number] = [226, 232, 240], // Default value: Slate-200
      bgColor?: [number, number, number],
      labelColor: [number, number, number] = [148, 163, 184] // Default label: Slate-400
  ) => {
     // Optional Background Highlight
     if (bgColor) {
         doc.setFillColor(...bgColor);
         doc.roundedRect(leftX - 2, currentY - 5, cardWidth - 16, 8, 1, 1, "F");
     }
     
     // Label
     doc.setFont(fontName, "normal");
     doc.setFontSize(10);
     doc.setTextColor(...labelColor);
     doc.text(label, leftX, currentY);
     
     // Value
     doc.setFont(fontName, "bold");
     doc.setTextColor(...valueColor);
     doc.text(value, rightX, currentY, { align: "right" });
     
     currentY += 10;
  };

  // 1. Mikro Tahsilat
  drawRow("Mikro Tahsilat", formatCurrencyPDF(data.mikroCollection));

  // 2. Gerçekleşme (Conditional Color)
  const realizationColor: [number, number, number] = data.mikroStats.realizationPercent >= 100 
      ? [74, 222, 128] // Green-400
      : [251, 146, 60]; // Orange-400
  drawRow("Gerçekleşme", `%${formatNumber(data.mikroStats.realizationPercent)}`, realizationColor);

  // 3. Mikro Tahsilat Primi (Highlighted Row)
  // Background: Simulating Slate-700 with 30% opacity on Slate-800.
  // Slate-800: [30, 41, 59], Slate-700: [51, 65, 85]
  // Result approx: [36, 48, 67]
  drawRow("Mikro Tahsilat Primi", formatCurrencyPDF(data.mikroStats.premium), [255, 255, 255], [36, 48, 67]);

  // 4. Bireysel Tahsilat
  drawRow("Bireysel Tahsilat", formatCurrencyPDF(data.bireyselPremium));

  // 5. Dava Vekalet
  drawRow("Dava Vekalet", formatCurrencyPDF(data.vekaletPremium));

  // 6. KTVÜ / MUVU (Emerald Color)
  // Emerald-400: [52, 211, 153]
  drawRow("KTVÜ / MUVU", formatCurrencyPDF(data.poolSharePremium), [52, 211, 153]);

  // Dashed Line Separator
  currentY -= 2;
  doc.setDrawColor(51, 65, 85); // slate-700
  doc.setLineDashPattern([1, 1], 0);
  doc.line(leftX, currentY, rightX, currentY);
  doc.setLineDashPattern([], 0); // reset dash
  currentY += 8;

  // 7. Vintage Bonusu (Yellow Color)
  // Label Color: Yellow-500 [234, 179, 8]
  // Value Color: Yellow-400 [250, 204, 21]
  drawRow("Vintage Bonusu (+1 Ay)", `+${formatCurrencyPDF(data.vintageBonus)}`, [250, 204, 21], undefined, [234, 179, 8]);

  // --- Footer (Total) ---
  currentY += 5;
  doc.setDrawColor(71, 85, 105); // slate-600 (solid line)
  doc.line(leftX, currentY, rightX, currentY);
  
  currentY += 12;
  
  // Total Label
  doc.setFont(fontName, "normal");
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("TOPLAM HAKEDİŞ", leftX, currentY);
  
  // Total Value
  doc.setFont(fontName, "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255); // White
  doc.text(formatCurrencyPDF(data.finalTotal), rightX, currentY, { align: "right" });

  // --- Save File ---
  const fileName = sanitizeFilename(data.name).replace(/\s+/g, '_').toLowerCase();
  doc.save(`${period}_${fileName}_prim_karti.pdf`);
};