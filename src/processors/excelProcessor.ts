export class ExcelProcessor {
  parseCSV(content: string): any[][] { return content.trim().split('\n').map(row => row.split(',').map(cell => cell.trim())); }
  toCSV(data: any[][]): string { return data.map(row => row.join(',')).join('\n'); }
  createWorkbook(sheets: { name: string; data: any[][] }[]): string { let xml = '<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">'; sheets.forEach(sheet => { xml += '<Worksheet ss:Name="' + sheet.name + '"><Table>'; sheet.data.forEach(row => { xml += '<Row>' + row.map(cell => '<Cell><Data ss:Type="String">' + cell + '</Data></Cell>').join('') + '</Row>'; }); xml += '</Table></Worksheet>'; }); xml += '</Workbook>'; return xml; }
}
export const excelProcessor = new ExcelProcessor();
