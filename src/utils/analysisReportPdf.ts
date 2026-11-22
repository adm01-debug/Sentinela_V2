import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, isValid } from "date-fns";
import { colors, drawMetricCard } from "./pdf/pdfHelpers";

export interface AnalysisReportPdfData {
  id: string;
  report_type?: string | null;
  summary?: string | null;
  analysis_period_start?: string | null;
  analysis_period_end?: string | null;
  generated_by?: string | null;
  created_at?: string | null;
  risk_score?: number | null;
  employee_name?: string | null;
  insights?: unknown;
  recommendations?: unknown;
}

function asList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v)));
  }
  if (typeof value === "string") return [value];
  if (typeof value === "object")
    return Object.values(value as Record<string, unknown>).map((v) =>
      typeof v === "string" ? v : JSON.stringify(v)
    );
  return [String(value)];
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  return isValid(d) ? format(d, "dd/MM/yyyy") : "-";
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function analysisReportPdf(data: AnalysisReportPdfData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageW, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SecureWatch - Relatorio de Analise", margin, 13);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Emitido em ${format(new Date(), "dd/MM/yyyy HH:mm")}`, margin, 19);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(data.employee_name || data.report_type || "Relatorio", margin, 34);

  const cardW = (pageW - margin * 2 - 8) / 3;
  drawMetricCard(doc, "Tipo", data.report_type || "-", margin, 40, cardW, 18, colors.primary);
  drawMetricCard(
    doc,
    "Periodo",
    `${formatDate(data.analysis_period_start)} a ${formatDate(data.analysis_period_end)}`,
    margin + cardW + 4,
    40,
    cardW,
    18,
    colors.primary
  );
  drawMetricCard(
    doc,
    "Risco",
    data.risk_score === null || data.risk_score === undefined ? "-" : String(data.risk_score),
    margin + (cardW + 4) * 2,
    40,
    cardW,
    18,
    colors.primary
  );

  let y = 66;

  const summary = data.summary ? stripHtml(data.summary) : "";
  if (summary) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo", margin, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(summary, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.2 + 6;
  }

  const insights = asList(data.insights);
  if (insights.length) {
    const rows = insights.map((text, i) => [String(i + 1), text]);
    autoTable(doc, {
      startY: y,
      head: [["#", "Insight"]],
      body: rows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: colors.primary },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  const recommendations = asList(data.recommendations);
  if (recommendations.length) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    const rows = recommendations.map((text, i) => [String(i + 1), text]);
    autoTable(doc, {
      startY: y,
      head: [["#", "Recomendacao"]],
      body: rows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: colors.primary },
    });
  }

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`SecureWatch - relatorio ${data.id}`, margin, doc.internal.pageSize.getHeight() - 8);
    doc.text(`${p}/${total}`, pageW - margin, doc.internal.pageSize.getHeight() - 8, {
      align: "right",
    });
  }

  return doc;
}

export function exportAnalysisReportPdf(data: AnalysisReportPdfData): void {
  const doc = analysisReportPdf(data);
  const slug = (data.employee_name || data.report_type || "relatorio")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  doc.save(`relatorio-${slug || "analise"}-${formatDate(data.created_at).replace(/\//g, "-")}.pdf`);
}
