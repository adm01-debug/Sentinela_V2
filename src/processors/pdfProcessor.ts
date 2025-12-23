export class PdfProcessor {
  generateSimple(content: { title: string; body: string }): string { return '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\ntrailer<</Size 4/Root 1 0 R>>\n%%EOF'; }
  async print(elementId: string): Promise<void> { const element = document.getElementById(elementId); if (!element) throw new Error('Element not found'); const printWindow = window.open('', '_blank'); if (!printWindow) throw new Error('Popup blocked'); printWindow.document.write('<html><body>' + element.innerHTML + '</body></html>'); printWindow.document.close(); printWindow.print(); }
  download(content: string, filename: string): void { const blob = new Blob([content], { type: 'application/pdf' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }
}
export const pdfProcessor = new PdfProcessor();
