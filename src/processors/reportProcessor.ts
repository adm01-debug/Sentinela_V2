export interface ReportData { title: string; data: any[]; columns: string[]; summary?: Record<string, any>; }
export class ReportProcessor {
  generate(data: ReportData): string { let html = '<html><head><style>table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}</style></head><body>'; html += '<h1>' + data.title + '</h1>'; html += '<table><tr>' + data.columns.map(c => '<th>' + c + '</th>').join('') + '</tr>'; data.data.forEach(row => { html += '<tr>' + data.columns.map(c => '<td>' + (row[c] ?? '') + '</td>').join('') + '</tr>'; }); html += '</table>'; if (data.summary) { html += '<h2>Summary</h2><ul>'; Object.entries(data.summary).forEach(([k, v]) => html += '<li>' + k + ': ' + v + '</li>'); html += '</ul>'; } html += '</body></html>'; return html; }
}
export const reportProcessor = new ReportProcessor();
