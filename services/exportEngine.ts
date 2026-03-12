import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { DocumentTemplate, Team } from '../types';
import { FieldCoordinate } from './geminiService';

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
    const y = pageHeight - (coord.y / 1000) * pageHeight; // PDF origin is bottom-left
    const boxWidth = (coord.width / 1000) * pageWidth;
    const boxHeight = (coord.height / 1000) * pageHeight;

    // Shrink-to-Fit Logic
    let fontSize = coord.fontSize || 12;
    let textWidth = font.widthOfTextAtSize(value, fontSize);
    
    while (textWidth > boxWidth && fontSize > 4) {
      fontSize -= 0.5;
      textWidth = font.widthOfTextAtSize(value, fontSize);
    }

    // Draw text
    page.drawText(value, {
      x,
      y: y - fontSize, // Adjust for top-left baseline
      size: fontSize,
      font,
      color: coord.hexColor ? hexToRgb(coord.hexColor) : rgb(0, 0, 0),
    });
  }

  return await pdfDoc.save();
};

export const renderWord = async (
  template: DocumentTemplate,
  userFieldData: Record<string, string>
): Promise<Blob> => {
  // Simple Word generation using placeholders (Docx usually requires XML templating for high fidelity, 
  // but for this MVP we construct a clean document based on the template content)
  
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

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
};
