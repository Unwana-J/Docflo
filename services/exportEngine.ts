import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { DocumentTemplate, PdfField } from '../types';
import { FieldCoordinate } from './geminiService';

// ─── Utility ──────────────────────────────────────────────────────────────────

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
};

// ─── White-Out + Stamp Engine (Manual PDF Path) ───────────────────────────────

/**
 * Generates a document using the White-Out + Stamp pattern.
 * 
 * NEVER rebuilds the PDF from scratch. ALWAYS mutates a binary copy of the
 * original to preserve 100% of the original visual design.
 *
 * @param originalPdfBase64 - The original PDF stored as base64 (source of truth)
 * @param fields            - PdfField[] with TRUE PDF-space coordinates
 * @param fieldValues       - Map of field.id → user-entered string value
 * @returns Uint8Array of the mutated PDF bytes ready for download
 */
export const generateDocumentWhiteOutStamp = async (
  originalPdfBase64: string,
  fields: PdfField[],
  fieldValues: Record<string, string>
): Promise<Uint8Array> => {
  // 1. Decode original PDF bytes — this is the unmodified source of truth
  const originalBytes = base64ToUint8Array(originalPdfBase64);

  // 2. Load into pdf-lib — ALL original design (images, colors, fonts, layout) preserved
  const pdfDoc = await PDFDocument.load(originalBytes);
  const pages = pdfDoc.getPages();

  // 3. Embed a clean font for stamped text
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 4. For each field: WHITE-OUT original text → STAMP new value
  for (const field of fields) {
    if (field.pageIndex >= pages.length) continue;

    const page = pages[field.pageIndex];
    const newValue = fieldValues[field.id] ?? field.originalValue;

    // ── WHITE-OUT: cover original text with an opaque white rectangle ──
    page.drawRectangle({
      x: field.x - 1,
      y: field.y - 1,
      width: field.width + 2,
      height: field.height + 2,
      color: rgb(1, 1, 1),
      opacity: 1,
    });

    // ── STAMP: write the new value at exactly the same position ──
    if (newValue) {
      // Shrink font to fit within the field width
      let fontSize = field.fontSize || 11;
      let textWidth = font.widthOfTextAtSize(newValue, fontSize);
      while (textWidth > field.width && fontSize > 4) {
        fontSize -= 0.5;
        textWidth = font.widthOfTextAtSize(newValue, fontSize);
      }

      page.drawText(newValue, {
        x: field.x,
        y: field.y,
        size: fontSize,
        font,
        color: rgb(
          field.fontColor.r / 255,
          field.fontColor.g / 255,
          field.fontColor.b / 255
        ),
        maxWidth: field.width,
      });
    }
  }

  // 5. Save — returns the mutated PDF bytes with original design fully intact
  return await pdfDoc.save();
};

/**
 * Triggers a browser download of a PDF Uint8Array.
 */
export const downloadPdf = (bytes: Uint8Array, filename: string): void => {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ─── Legacy AI-Path PDF Engine ────────────────────────────────────────────────

/**
 * Legacy export engine for the AI-reconstructed HTML path.
 * Uses normalized 0-1000 coordinates (Gemini output) mapped to PDF points.
 */
export const renderPDF = async (
  originalPdfBytes: Uint8Array,
  coordinates: FieldCoordinate[],
  userFieldData: Record<string, string>
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(originalPdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const coord of coordinates) {
    const value = userFieldData[coord.fieldId];
    if (value === undefined || coord.pageNumber > pages.length) continue;

    const page = pages[coord.pageNumber - 1];
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Map normalized 0-1000 coordinates to PDF points
    const x = (coord.x / 1000) * pageWidth;
    const y = pageHeight - (coord.y / 1000) * pageHeight;
    const boxWidth = (coord.width / 1000) * pageWidth;

    let fontSize = coord.fontSize || 12;
    let textWidth = font.widthOfTextAtSize(value, fontSize);
    while (textWidth > boxWidth && fontSize > 4) {
      fontSize -= 0.5;
      textWidth = font.widthOfTextAtSize(value, fontSize);
    }

    // White-out + stamp (also apply here for consistency)
    const boxHeight = (coord.height / 1000) * pageHeight;
    page.drawRectangle({
      x: x - 1,
      y: y - fontSize - 1,
      width: boxWidth + 2,
      height: boxHeight + 2,
      color: rgb(1, 1, 1),
      opacity: 1,
    });

    page.drawText(value, {
      x,
      y: y - fontSize,
      size: fontSize,
      font,
      color: coord.hexColor ? hexToRgb(coord.hexColor) : rgb(0, 0, 0),
    });
  }

  return await pdfDoc.save();
};

// ─── Word Export ──────────────────────────────────────────────────────────────

export const renderWord = async (
  template: DocumentTemplate,
  userFieldData: Record<string, string>
): Promise<Blob> => {
  let processedContent = template.content;
  Object.entries(userFieldData).forEach(([key, val]) => {
    processedContent = processedContent.replace(new RegExp(`{{${key}}}`, 'g'), val);
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: processedContent.split('\n').map(line =>
        new Paragraph({
          children: [new TextRun(line)],
        })
      ),
    }],
  });

  return await Packer.toBlob(doc);
};
