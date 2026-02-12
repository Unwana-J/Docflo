
import JSZip from 'jszip';
import { DocumentTemplate, BulkGenJob } from '../types';

export const processBulkGeneration = async (
  template: DocumentTemplate,
  dataRows: Record<string, string>[],
  onProgress: (processed: number) => void
): Promise<string> => {
  const zip = new JSZip();
  const folder = zip.folder(`${template.name}_Bulk_Export`);
  
  const batchSize = 5; // Simulating small batches to show progress
  let processedCount = 0;

  for (let i = 0; i < dataRows.length; i += batchSize) {
    const batch = dataRows.slice(i, i + batchSize);
    
    // Simulate processing delay for each batch
    await new Promise(resolve => setTimeout(resolve, 800));

    batch.forEach((row, index) => {
      let content = template.content;
      template.fields.forEach(field => {
        const val = row[field.name] || field.defaultValue || '';
        const regex = new RegExp(`\\{\\{\\s*${field.name}\\s*\\}\\}`, 'gi');
        content = content.replace(regex, val);
      });

      // Simple HTML wrapper for the Word doc
      const docHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><style>body { font-family: 'Segoe UI', Arial; }</style></head>
        <body>${content}</body></html>`;

      const fileName = `${template.name}_${i + index + 1}.doc`;
      folder?.file(fileName, docHtml);
      processedCount++;
    });

    onProgress(processedCount);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  return URL.createObjectURL(blob);
};
